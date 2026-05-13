import Alert from '@mui/material/Alert';
import { useOfflineStore } from '../../store/offlineStore';

/**
 * A small alert banner to show inside modals/dialogs when the user is offline.
 * Returns null when online so it can be dropped in anywhere.
 */
export default function OfflineAlert() {
    const isOnline = useOfflineStore(s => s.isOnline);
    if (isOnline) return null;
    return (
        <Alert severity="warning" variant="outlined" sx={{ py: 0, mb: 1 }}>
            You're offline — this action is unavailable.
        </Alert>
    );
}

/** Hook that returns true when the app is effectively offline */
export function useIsOffline(): boolean {
    return !useOfflineStore(s => s.isOnline);
}
