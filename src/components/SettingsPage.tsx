import React from 'react';
import { Switch, alpha } from "@mui/material";
import { useGlobalStore, dialogPaperStyles } from "../store/globalStore";
import { useTableStore } from "../store/tableStore";
import { useModalStore } from "../store/modalStore";
import { supaALLsections } from './extras/api_functions'
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from "@mui/material/Divider";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { supabase } from "../lib/supabase";
import { redirectToCheckout, redirectToBillingPortal, useEntitlement } from "../lib/checkout";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { QRCodeSVG } from 'qrcode.react';
import ShareBudget from "./modals/ShareBudget";
import ChangePassword from './modals/ChangePassword';
import ExportToCSV from './modals/ExportToCSV';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useIsOffline } from "./extras/OfflineAlert";
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BugReportIcon from '@mui/icons-material/BugReport';
import IosShareIcon from '@mui/icons-material/IosShare';
import IconButton from "@mui/material/IconButton";
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import { useNotificationStore } from '../store/notificationStore';
import { notificationsSupported, requestNotificationPermission } from '../lib/notifications';

function getInitials(name: string | null): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0]?.toUpperCase() || '?';
}

export default function SettingsPage() {
    const setLoadingOpen = useGlobalStore(s => s.setMainLoading)
    const setExportToCSV = useModalStore(s => s.setExportToCSV)
    const offline = useIsOffline();
    const theme = useTheme();
    const bigger = useMediaQuery(theme.breakpoints.up('sm'));
    const [slideCheck, setSlideCheck] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = React.useState('');
    const setShareBudgetOpen = useModalStore(s => s.setShareBudget)
    const currentTheme = useGlobalStore(s => s.themeAtom);
    const setTheme = useGlobalStore(s => s.setThemeAtom);
    const setOpenChangePassword = useModalStore(s => s.setOpenChangePassword);
    const setSnackText = useGlobalStore(s => s.setSnackBarText);
    const setSnackSev = useGlobalStore(s => s.setSnackBarSeverity);
    const setSnackOpen = useGlobalStore(s => s.setSnackBarOpen);
    const currentBudget = useTableStore(s => s.currentBudgetAndMonth)
    const currentUserDetails = useGlobalStore(s => s.currentUser)
    const budgetsArray = useTableStore(s => s.budgets)
    const setSelectBudgetOpen = useModalStore(s => s.setSelectBudget)
    let currentBudgetDetails = budgetsArray.find(x => x.recordID === currentBudget.budgetID)
    const [qrOpen, setQrOpen] = React.useState(false)
    const [checkoutLoading, setCheckoutLoading] = React.useState(false)
    const [billingLoading, setBillingLoading] = React.useState(false)
    const { entitlement, subscriptionState, loading: entitlementLoading } = useEntitlement()
    const hasPro = entitlementLoading || subscriptionState !== 'free'
    const notificationsEnabled = useNotificationStore(s => s.enabled);
    const setNotificationsEnabled = useNotificationStore(s => s.setEnabled);
    const setNotificationsPrompted = useNotificationStore(s => s.setPrompted);
    const showNotificationsSetting = notificationsSupported();

    const [permissionMismatch, setPermissionMismatch] = React.useState(false);
    React.useEffect(() => {
        const check = () => {
            if (notificationsEnabled && notificationsSupported() && Notification.permission !== 'granted') {
                setPermissionMismatch(true);
            } else {
                setPermissionMismatch(false);
            }
        };
        check();
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') check();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [notificationsEnabled]);

    const handleNotificationsToggle = async () => {
        if (!notificationsEnabled) {
            const granted = await requestNotificationPermission();
            if (granted) {
                setNotificationsEnabled(true);
                setNotificationsPrompted(true);
                setSnackSev('success');
                setSnackText('Notifications enabled');
                setSnackOpen(true);
            } else {
                setSnackSev('warning');
                setSnackText('Notification permission denied by browser');
                setSnackOpen(true);
            }
        } else {
            setNotificationsEnabled(false);
            setSnackSev('success');
            setSnackText('Notifications disabled');
            setSnackOpen(true);
        }
    };

    const handleFixPermission = async () => {
        if (Notification.permission === 'denied') {
            setSnackSev('info');
            setSnackText('Please enable notifications in your device/browser settings');
            setSnackOpen(true);
        } else {
            const granted = await requestNotificationPermission();
            if (granted) {
                setPermissionMismatch(false);
                setSnackSev('success');
                setSnackText('Notifications re-enabled!');
                setSnackOpen(true);
            } else {
                setSnackSev('warning');
                setSnackText('Permission denied — enable in device settings');
                setSnackOpen(true);
            }
        }
    };

    const handleUpgrade = async () => {
        setCheckoutLoading(true);
        try { await redirectToCheckout(); }
        catch (err: any) { setSnackSev('error'); setSnackText(err.message || 'Failed to start checkout'); setSnackOpen(true); setCheckoutLoading(false); }
    };

    const handleManageBilling = async () => {
        setBillingLoading(true);
        try { await redirectToBillingPortal(); }
        catch (err: any) { setSnackSev('error'); setSnackText(err.message || 'Failed to open billing portal'); setSnackOpen(true); setBillingLoading(false); }
    };

    const handleThemeToggle = () => {
        const newDark = !slideCheck;
        setSlideCheck(newDark);
        const mode = newDark ? 'dark' : 'light';
        setTheme(mode);
        localStorage.setItem('userTheme', mode);
        setSnackSev('success');
        setSnackText(newDark ? 'Dark mode activated!' : 'Set to light mode.');
        setSnackOpen(true);
    };

    async function supaLogOut() { await supabase.auth.signOut(); }

    const handleOpenDeleteDialog = () => {
        setDeleteConfirmText('');
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteConfirmText('');
    };

    async function handleDelete() {
        setDeleteDialogOpen(false);
        setDeleteConfirmText('');
        setLoadingOpen(true);

        await supabase
            .from('transactions')
            .delete()
            .eq('budgetID', currentBudget.budgetID)

        let allSections = await supaALLsections(currentBudget.budgetID)

        await supabase
            .from('categories')
            .delete()
            //@ts-ignore
            .in('sectionID', allSections?.map(x => x.recordID))

        await supabase
            .from('sections')
            .delete()
            .eq('budgetID', currentBudget.budgetID)

        await supabase
            .from('shared')
            .delete()
            .eq('budgetID', currentBudget.budgetID)

        let { error } = await supabase
            .from('budgets')
            .delete()
            .eq('recordID', currentBudget.budgetID)

        if (error) {
            console.log(error)
            setLoadingOpen(false)
            setSnackSev('error')
            setSnackText('Something went wrong')
            setSnackOpen(true)
            return
        }
        setLoadingOpen(false)
        setSnackSev('success')
        setSnackText('Budget deleted')
        setSnackOpen(true)
    }

    React.useEffect(() => { setSlideCheck(currentTheme === 'dark'); }, [currentTheme]);

    const navigate = useNavigate();
    const fnLogout = () => { supaLogOut(); navigate("/login", { replace: true }); };

    const copyUserID = async () => {
        await navigator.clipboard
            .writeText(currentUserDetails.recordID)
            .then(() => { setSnackSev('success'); setSnackText('User ID copied'); setSnackOpen(true); })
            .catch(() => { setSnackSev('error'); setSnackText('Something went wrong'); setSnackOpen(true); });
    };

    const shareAppLink = async () => {
        const appUrl = 'https://budget.simplesuite.dev';
        if (navigator.share) {
            try {
                await navigator.share({ title: 'SimpleBudget', url: appUrl });
            } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(appUrl)
                .then(() => { setSnackSev('success'); setSnackText('App link copied!'); setSnackOpen(true); })
                .catch(() => { setSnackSev('error'); setSnackText('Failed to copy link'); setSnackOpen(true); });
        }
    };

    React.useEffect(() => { window.scrollTo(0, 0); }, []);

    if (entitlementLoading) {
        return <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 8 }}><CircularProgress /></Box>;
    }

    const subscriptionLabel = subscriptionState === 'active' ? 'Pro'
        : subscriptionState === 'trialing' ? 'Trial'
            : subscriptionState === 'canceling' ? 'Canceling' : 'Free';
    const subscriptionColor: 'success' | 'info' | 'warning' | 'default' =
        subscriptionState === 'active' ? 'success'
            : subscriptionState === 'trialing' ? 'info'
                : subscriptionState === 'canceling' ? 'warning' : 'default';

    return (
        <>
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ pb: 4 }}>
                <Stack spacing={2.5} alignItems="stretch" sx={{ maxWidth: 560, width: '100%' }}>

                    {/* ─── Profile Card ─── */}
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
                            <Avatar sx={{
                                width: 72,
                                height: 72,
                                fontSize: '1.6rem',
                                fontWeight: 700,
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                            }}>
                                {getInitials(currentUserDetails.fullName)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                                    {currentUserDetails.fullName || 'User'}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" spacing={1.5}>
                            <Button
                                variant="outlined" startIcon={<QrCodeIcon />}
                                onClick={() => setQrOpen(true)} disabled={!hasPro}
                                sx={{ textTransform: 'none', borderRadius: 2, flex: 1 }}
                            >
                                My QR Code
                            </Button>
                            <Button
                                variant="outlined" startIcon={<LogoutIcon />}
                                onClick={fnLogout} disabled={offline}
                                color="error"
                                sx={{ textTransform: 'none', borderRadius: 2, flex: 1 }}
                            >
                                Log Out
                            </Button>
                        </Stack>
                    </Paper>

                    {/* ─── Upgrade Banner (free only) ─── */}
                    {subscriptionState === 'free' && (
                        <Paper elevation={4} sx={{
                            borderRadius: 4,
                            p: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(theme.palette.secondary.main, 0.06)})`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}>
                            <StarIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>Upgrade to Pro</Typography>
                                <Typography variant="caption" color="text.secondary">Unlock exports, sharing & more</Typography>
                            </Box>
                            <Button
                                variant="contained" onClick={handleUpgrade}
                                disabled={offline || checkoutLoading}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                {checkoutLoading ? 'Loading...' : 'Upgrade'}
                            </Button>
                        </Paper>
                    )}
                    {subscriptionState === 'canceling' && (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                            Plan active until {entitlement?.current_period_end
                                ? new Date(entitlement.current_period_end).toLocaleDateString()
                                : 'end of billing period'}
                        </Alert>
                    )}

                    {/* ─── Preferences Card ─── */}
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 3 }}>
                        <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase' }}>
                            Preferences
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <DarkModeIcon sx={{ color: theme.palette.mode === 'dark' ? '#90caf9' : '#5c6bc0', fontSize: 22 }} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Dark Mode</Typography>
                                    <Typography variant="caption" color="text.secondary">Easier on the eyes</Typography>
                                </Box>
                            </Box>
                            <Switch size="small" checked={slideCheck} onChange={handleThemeToggle} />
                        </Box>

                        {showNotificationsSetting && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <NotificationsIcon sx={{ color: '#f57c00', fontSize: 22 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Transaction Notifications</Typography>
                                            <Typography variant="caption" color="text.secondary">Daily reminders for tomorrow's transactions</Typography>
                                        </Box>
                                    </Box>
                                    <Switch size="small" checked={notificationsEnabled} onChange={handleNotificationsToggle} />
                                </Box>
                                {permissionMismatch && (
                                    <Alert
                                        severity="warning"
                                        sx={{ borderRadius: 2, mt: 2 }}
                                        action={
                                            <Button color="inherit" onClick={handleFixPermission}>
                                                {Notification.permission === 'denied' ? 'How to fix' : 'Allow'}
                                            </Button>
                                        }
                                    >
                                        Notifications blocked at system level
                                    </Alert>
                                )}
                            </>
                        )}
                    </Paper>

                    {/* ─── Account Card ─── */}
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                            <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                                Account
                            </Typography>
                            <Chip
                                label={subscriptionLabel}
                                size="small"
                                color={subscriptionColor}
                                variant={subscriptionState === 'free' ? 'outlined' : 'filled'}
                            />
                        </Box>

                        <Stack spacing={1.5}>
                            {subscriptionState !== 'free' && (
                                <Button
                                    variant="outlined" fullWidth startIcon={<ManageAccountsIcon />}
                                    color="primary"
                                    onClick={handleManageBilling} disabled={offline || billingLoading}
                                    sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: 2, py: 1.2 }}
                                >
                                    {billingLoading ? 'Redirecting...' : 'Manage Subscription'}
                                </Button>
                            )}
                            <Button
                                color="primary"
                                variant="outlined" fullWidth startIcon={<LockResetIcon />}
                                onClick={() => setOpenChangePassword(true)} disabled={offline}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: 2, py: 1.2 }}
                            >
                                Change Password
                            </Button>
                        </Stack>
                    </Paper>

                    {/* ─── Budget Card ─── */}
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 3 }}>
                        <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase' }}>
                            {'Budget: ' + (currentBudgetDetails?.budgetName || '')}
                        </Typography>

                        <Stack spacing={1.5}>
                            <Button
                                variant="outlined" fullWidth startIcon={<ListAltIcon />}
                                color="secondary"
                                onClick={() => setSelectBudgetOpen(true)}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: 2, py: 1.2 }}
                            >
                                Switch Budgets
                            </Button>
                            <Button
                                variant="outlined" fullWidth startIcon={hasPro ? <DownloadIcon /> : <LockIcon />}
                                color="secondary"
                                onClick={() => setExportToCSV(true)} disabled={offline || !hasPro}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: 2, py: 1.2 }}
                            >
                                Export Data to CSV
                                {!hasPro && <Chip label="Pro" size="small" variant="outlined" sx={{ ml: 'auto' }} />}
                            </Button>
                            <Button
                                variant="outlined" fullWidth startIcon={hasPro ? <ShareIcon /> : <LockIcon />}
                                color="secondary"
                                onClick={() => setShareBudgetOpen(true)} disabled={offline || !hasPro}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: 2, py: 1.2 }}
                            >
                                Share Budget
                                {!hasPro && <Chip label="Pro" size="small" variant="outlined" sx={{ ml: 'auto' }} />}
                            </Button>
                            <Button
                                variant="outlined" fullWidth startIcon={<DeleteIcon />}
                                color="error"
                                onClick={handleOpenDeleteDialog} disabled={offline}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: 2, py: 1.2 }}
                            >
                                Delete Budget
                            </Button>
                        </Stack>
                    </Paper>

                    {/* ─── Support Card ─── */}
                    <Paper elevation={4} sx={{ borderRadius: 4, p: 3 }}>
                        <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, textTransform: 'uppercase' }}>
                            Support
                        </Typography>

                        <Stack direction={bigger ? "row" : "column"} spacing={1.5}>
                            <Button
                                color="primary"
                                variant="outlined" startIcon={<MenuBookIcon />}
                                component="a" href="https://simplesuite.dev/guides" target="_blank" rel="noopener noreferrer"
                                sx={{ textTransform: 'none', textDecoration: 'none' }}
                            >
                                Guides
                            </Button>
                            <Button
                                color="primary"
                                variant="outlined" startIcon={<BugReportIcon />}
                                component="a" href="https://github.com/simplesuite/simplebudget/issues" target="_blank" rel="noopener noreferrer"
                                sx={{ textTransform: 'none', textDecoration: 'none' }}
                            >
                                Report Bug
                            </Button>
                            <Button
                                color="primary"
                                variant="outlined" startIcon={<IosShareIcon />}
                                onClick={shareAppLink}
                                sx={{ textTransform: 'none' }}
                            >
                                Share App
                            </Button>
                        </Stack>
                    </Paper>

                </Stack>
            </Box>

            <ShareBudget />
            <ChangePassword />
            <ExportToCSV />
            <Dialog
                open={qrOpen}
                onClose={() => setQrOpen(false)}
                fullScreen={!bigger}
                slotProps={{ paper: bigger ? dialogPaperStyles : undefined }}
            >
                <Box sx={{ bgcolor: 'background.paper', height: '100%' }} component="form" onSubmit={() => { copyUserID(); setQrOpen(false); }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        My User ID<IconButton onClick={() => setQrOpen(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', pb: 3 }} dividers>
                        <QRCodeSVG value={currentUserDetails.recordID} size={200} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, wordBreak: 'break-all' }}>
                            {currentUserDetails.recordID}
                        </Typography>
                        <DialogActions>
                            <Button sx={{ mt: 1 }} fullWidth variant="contained" type="submit" startIcon={<ContentCopyIcon />}>
                                Copy to Clipboard
                            </Button>
                        </DialogActions>
                    </DialogContent>
                </Box>
            </Dialog>

            {/* ─── Delete Budget Confirmation Dialog ─── */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                fullScreen={!bigger}
                slotProps={{ paper: bigger ? dialogPaperStyles : undefined }}
            >
                <Box sx={{ bgcolor: 'background.paper', height: '100%' }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Delete Budget
                        <IconButton onClick={handleCloseDeleteDialog}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            This will permanently delete all sections, categories, and transactions assigned to this budget. This cannot be undone.
                        </Alert>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            To confirm, type <strong>{currentBudgetDetails?.budgetName}</strong> below:
                        </Typography>
                        <TextField
                            autoFocus
                            fullWidth
                            size="small"
                            placeholder={currentBudgetDetails?.budgetName || ''}
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseDeleteDialog} sx={{ textTransform: 'none', borderRadius: 2 }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={deleteConfirmText !== currentBudgetDetails?.budgetName}
                            onClick={handleDelete}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            Delete Budget
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
}
