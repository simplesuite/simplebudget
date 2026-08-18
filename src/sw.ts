/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

// =============================================================================
// Workbox Precaching
// =============================================================================

// The __WB_MANIFEST placeholder is replaced by vite-plugin-pwa at build time
// with the list of assets to precache.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Allow the app to trigger skipWaiting via postMessage
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Claim clients immediately after activation so the new SW controls existing tabs
clientsClaim();

// =============================================================================
// Push Notification Handler
// =============================================================================

/**
 * Payload shape sent by the notification worker:
 * {
 *   title: string;
 *   body: string;
 *   icon?: string;
 *   tag?: string;
 *   data?: { url?: string };
 * }
 */
interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: { url?: string };
}

self.addEventListener('push', (event: PushEvent) => {
    if (!event.data) return;

    let payload: PushPayload;
    try {
        payload = event.data.json() as PushPayload;
    } catch {
        // If it's not JSON, treat the text as the body
        payload = {
            title: 'simpleBudget',
            body: event.data.text(),
        };
    }

    const { title, body, icon, tag, data } = payload;

    const options: NotificationOptions = {
        body,
        icon: icon || '/android-chrome-192x192.png',
        tag: tag || 'simplebudget-push',
        data: data || {},
    };

    // waitUntil ensures the SW stays alive until the notification is shown
    event.waitUntil(self.registration.showNotification(title, options));
});

// =============================================================================
// Notification Click Handler
// =============================================================================

self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();

    // If the payload included a URL, navigate to it; otherwise open the app root
    const targetUrl = (event.notification.data as { url?: string })?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Focus an existing tab if one is open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    if (targetUrl !== '/') {
                        client.navigate(targetUrl);
                    }
                    return;
                }
            }
            // Otherwise open a new window
            return self.clients.openWindow(targetUrl);
        })
    );
});
