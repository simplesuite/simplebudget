import * as React from 'react';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import logo from '../../logo.png'
import { useGlobalStore } from "../../store/globalStore";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from '@mui/icons-material/Refresh';
import Chip from '@mui/material/Chip';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useOfflineStore } from "../../store/offlineStore";

export default function AppToolbar() {
    const currentTheme = useGlobalStore(s => s.themeAtom);
    const isOnline = useOfflineStore(s => s.isOnline);
    const pendingCount = useOfflineStore(s => s.pendingCount);
    const isSyncing = useOfflineStore(s => s.isSyncing);

    async function handleRefresh() {
        window.location.reload();
    }

    const offlineLabel = !isOnline
        ? (pendingCount > 0 ? `Offline · ${pendingCount} pending` : 'Offline')
        : (isSyncing ? `Syncing ${pendingCount}...` : '');

    return (
        <>
            <AppBar position="fixed" elevation={0}
                sx={{
                    width: '100%',
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    backdropFilter: 'blur(5px)',
                    backgroundColor: currentTheme === 'dark'
                        ? 'rgba(18, 18, 18, 0.7)'
                        : 'rgba(255, 255, 255, 0.7)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}>
                <Toolbar variant='dense' sx={currentTheme === 'dark' ? null : { color: 'primary.main' }}>
                    <img
                        height='30'
                        src={logo}
                        alt='logo'
                    />
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 100 }}>simple</Typography>
                    <Typography variant="h6" align="left" sx={{ flexGrow: 1 }}>
                        Budget
                    </Typography>
                    {offlineLabel && (
                        <Chip
                            icon={<CloudOffIcon />}
                            label={offlineLabel}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mr: 1 }}
                        />
                    )}
                    <IconButton
                        size='small'
                        onClick={handleRefresh}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </>
    );
}
