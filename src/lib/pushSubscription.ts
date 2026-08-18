/**
 * Web Push Subscription Management
 *
 * Handles subscribing/unsubscribing to push notifications via the
 * browser's Push API and persisting the subscription to the
 * push_subscriptions table in Supabase.
 *
 * Uses VAPID (Voluntary Application Server Identification) which works
 * across all browsers without requiring FCM/APNS credentials.
 */

import { supabase } from './supabase';

const APP_NAME = 'simplebudget';

/**
 * The VAPID public key. Set via environment variable at build time,
 * or via window.__VAPID_PUBLIC_KEY__ for self-hosted deployments.
 */
declare global {
    interface Window {
        __VAPID_PUBLIC_KEY__?: string;
    }
}

function getVapidPublicKey(): string | null {
    // Self-hosted runtime injection (same pattern as Supabase config)
    if (window.__VAPID_PUBLIC_KEY__) {
        return window.__VAPID_PUBLIC_KEY__;
    }
    // Build-time env var
    const envKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (envKey && typeof envKey === 'string') {
        return envKey;
    }
    return null;
}

/**
 * Check if push notifications are supported in this browser.
 */
export function pushSupported(): boolean {
    return (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

/**
 * Convert a base64 URL-safe string to a Uint8Array (required by pushManager.subscribe).
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Get the current push subscription from the active service worker, if any.
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!pushSupported()) return null;

    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
}

/**
 * Subscribe to push notifications.
 *
 * 1. Requests notification permission if not already granted
 * 2. Subscribes via the Push API with the VAPID public key
 * 3. Persists the subscription to the push_subscriptions table
 *
 * Returns true on success, false on failure.
 */
export async function subscribeToPush(): Promise<boolean> {
    if (!pushSupported()) {
        console.warn('[push] Push notifications not supported in this browser.');
        return false;
    }

    const vapidKey = getVapidPublicKey();
    if (!vapidKey) {
        console.warn('[push] VAPID public key not configured. Push subscription skipped.');
        return false;
    }

    // Ensure notification permission
    if (Notification.permission === 'denied') {
        console.warn('[push] Notification permission denied by user.');
        return false;
    }

    if (Notification.permission !== 'granted') {
        const result = await Notification.requestPermission();
        if (result !== 'granted') {
            return false;
        }
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Subscribe (or get existing subscription)
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        // Persist to database
        await saveSubscription(subscription);
        return true;
    } catch (err) {
        console.error('[push] Failed to subscribe:', err);
        return false;
    }
}

/**
 * Unsubscribe from push notifications.
 *
 * 1. Unsubscribes via the Push API
 * 2. Removes the subscription from the push_subscriptions table
 *
 * Returns true on success, false on failure.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    if (!pushSupported()) return false;

    try {
        const subscription = await getCurrentSubscription();
        if (!subscription) return true; // Already unsubscribed

        // Remove from database first (so worker stops sending immediately)
        await removeSubscription(subscription.endpoint);

        // Then unsubscribe from browser
        await subscription.unsubscribe();
        return true;
    } catch (err) {
        console.error('[push] Failed to unsubscribe:', err);
        return false;
    }
}

/**
 * Check if the user currently has an active push subscription for this app.
 */
export async function isSubscribedToPush(): Promise<boolean> {
    const subscription = await getCurrentSubscription();
    return subscription !== null;
}

// =============================================================================
// Database persistence
// =============================================================================

/**
 * Save (upsert) the push subscription to the database.
 * Uses the endpoint + app as the unique constraint for conflict resolution.
 */
async function saveSubscription(subscription: PushSubscription): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
        console.warn('[push] No authenticated user, cannot save subscription.');
        return;
    }

    const json = subscription.toJSON();
    const now = Date.now();

    const record = {
        recordID: generateRecordID(),
        userID: userData.user.id,
        app: APP_NAME,
        endpoint: subscription.endpoint,
        keyP256dh: json.keys?.p256dh ?? '',
        keyAuth: json.keys?.auth ?? '',
        createdAt: now,
        updatedAt: now,
    };

    // Upsert: if this endpoint+app combo already exists, update the keys and timestamp
    const { error } = await supabase
        .from('push_subscriptions')
        .upsert(record, { onConflict: 'endpoint,app' });

    if (error) {
        console.error('[push] Failed to save subscription to database:', error.message);
    }
}

/**
 * Remove a push subscription from the database by endpoint.
 */
async function removeSubscription(endpoint: string): Promise<void> {
    const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint)
        .eq('app', APP_NAME);

    if (error) {
        console.error('[push] Failed to remove subscription from database:', error.message);
    }
}

/**
 * Generate a simple unique ID for the record.
 * Uses crypto.randomUUID() (available in all modern browsers and SW contexts).
 */
function generateRecordID(): string {
    return crypto.randomUUID();
}
