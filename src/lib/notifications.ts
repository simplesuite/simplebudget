import { useNotificationStore } from '../store/notificationStore';

/**
 * Check if the browser supports the Notification API.
 */
export function notificationsSupported(): boolean {
    return 'Notification' in window;
}

/**
 * Request notification permission from the browser.
 * Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!notificationsSupported()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    return result === 'granted';
}

/**
 * Get today's date string in YYYY-MM-DD format.
 */
function getTodayString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Determine which transactions are dated tomorrow.
 */
export function getTransactionsDueTomorrow(transactions: any[]): any[] {
    const now = new Date();
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const tomorrowEnd = tomorrowStart + 24 * 60 * 60 * 1000 - 1;

    const dueTomorrow: any[] = [];

    for (const transaction of transactions) {
        if (transaction.transactionDate == null) continue;

        const txDate = typeof transaction.transactionDate === 'number'
            ? transaction.transactionDate
            : new Date(transaction.transactionDate).getTime();

        if (txDate >= tomorrowStart && txDate <= tomorrowEnd) {
            dueTomorrow.push(transaction);
        }
    }

    return dueTomorrow;
}

/**
 * Build a grouped notification message from tomorrow's transactions.
 */
function buildNotificationBody(dueTomorrow: any[]): string {
    if (dueTomorrow.length === 1) {
        return `Tomorrow: "${dueTomorrow[0].title}"`;
    }
    return `${dueTomorrow.length} transactions scheduled for tomorrow`;
}

/**
 * Check transactions and send a single grouped notification if needed.
 * Only fires once per calendar day.
 */
export function checkAndNotify(transactions: any[]): void {
    const store = useNotificationStore.getState();

    if (!store.enabled) return;
    if (!notificationsSupported()) return;
    if (Notification.permission !== 'granted') return;

    const today = getTodayString();
    if (store.lastNotifiedDate === today) return; // Already notified today

    const dueTomorrow = getTransactionsDueTomorrow(transactions);

    if (dueTomorrow.length === 0) return;

    const title = dueTomorrow.length === 1
        ? 'Transaction Reminder'
        : `${dueTomorrow.length} Transaction Reminders`;
    const body = buildNotificationBody(dueTomorrow);

    try {
        // Use the Service Worker to show notifications — the `new Notification()`
        // constructor is blocked on Android and most mobile browsers. The SW
        // approach works universally (desktop + mobile).
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg) {
                    reg.showNotification(title, {
                        body,
                        icon: '/android-chrome-192x192.png',
                        tag: 'transaction-due-reminder',
                    });
                } else {
                    // Fallback for desktop if SW isn't registered yet
                    new Notification(title, { body, icon: '/android-chrome-192x192.png', tag: 'transaction-due-reminder' });
                }
            });
        } else {
            // No SW support at all — use the constructor (desktop only)
            new Notification(title, { body, icon: '/android-chrome-192x192.png', tag: 'transaction-due-reminder' });
        }
    } catch (err) {
        // Swallow the error so the app doesn't crash on load.
        console.warn('Failed to show notification:', err);
        return;
    }

    store.setLastNotifiedDate(today);
}
