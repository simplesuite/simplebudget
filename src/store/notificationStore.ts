import { create } from 'zustand';

interface NotificationState {
    /** Whether the user has enabled notifications in settings */
    enabled: boolean;
    /** Whether we've already asked the user (so we don't nag on every load) */
    prompted: boolean;
    /** Last date (YYYY-MM-DD) we sent a grouped notification */
    lastNotifiedDate: string | null;

    setEnabled: (val: boolean) => void;
    setPrompted: (val: boolean) => void;
    setLastNotifiedDate: (val: string) => void;
}

const STORAGE_KEY_ENABLED = 'notificationsEnabled';
const STORAGE_KEY_PROMPTED = 'notificationsPrompted';
const STORAGE_KEY_LAST_DATE = 'notificationsLastDate';

export const useNotificationStore = create<NotificationState>((set) => ({
    enabled: localStorage.getItem(STORAGE_KEY_ENABLED) === 'true',
    prompted: localStorage.getItem(STORAGE_KEY_PROMPTED) === 'true',
    lastNotifiedDate: localStorage.getItem(STORAGE_KEY_LAST_DATE),

    setEnabled: (val) => {
        localStorage.setItem(STORAGE_KEY_ENABLED, String(val));
        set({ enabled: val });
    },
    setPrompted: (val) => {
        localStorage.setItem(STORAGE_KEY_PROMPTED, String(val));
        set({ prompted: val });
    },
    setLastNotifiedDate: (val) => {
        localStorage.setItem(STORAGE_KEY_LAST_DATE, val);
        set({ lastNotifiedDate: val });
    },
}));
