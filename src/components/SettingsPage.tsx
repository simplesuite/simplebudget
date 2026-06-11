import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { Switch } from "@mui/material";
import { useGlobalStore, dialogPaperStyles } from "../store/globalStore";
import { useTableStore } from "../store/tableStore";
import { useModalStore } from "../store/modalStore";
import { supaALLsections, supaCategories } from './extras/api_functions'
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from "@mui/material/Divider";
import Typography from '@mui/material/Typography';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ListItemIcon from '@mui/material/ListItemIcon';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShareIcon from '@mui/icons-material/Share';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import { supabase } from "../lib/supabase";
import { redirectToCheckout, redirectToBillingPortal, useEntitlement } from "../lib/checkout";
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Chip from '@mui/material/Chip';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShareBudget from "./modals/ShareBudget";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { QRCodeSVG } from 'qrcode.react';
import ChangePassword from './modals/ChangePassword'
import ExportToCSV from './modals/ExportToCSV'
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useIsOffline } from "./extras/OfflineAlert";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import DialogActions from '@mui/material/DialogActions';

export default function SettingsPage() {
    const setLoadingOpen = useGlobalStore(s => s.setMainLoading)
    const setExportToCSV = useModalStore(s => s.setExportToCSV)
    const offline = useIsOffline();
    const theme = useTheme();
    const bigger = useMediaQuery(theme.breakpoints.up('sm'));
    const sectionsArray = useTableStore(s => s.sections);
    const [slideCheck, setSlideCheck] = React.useState(false);
    const areYouSureOpen = useModalStore(s => s.areYouSure);
    const setAreYouSureOpen = useModalStore(s => s.setAreYouSure);
    const setCheckTitle = useGlobalStore(s => s.setAreYouSureTitle);
    const setCheckDetails = useGlobalStore(s => s.setAreYouSureDetails);
    const checkAccept = useGlobalStore(s => s.areYouSureAccept);
    const setCheckAccept = useGlobalStore(s => s.setAreYouSureAccept);
    const [budgetDelete, setBudgetDelete] = React.useState(false)
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
    const hasPro = subscriptionState !== 'free'
    const handleUpgrade = async () => {
        setCheckoutLoading(true)
        try {
            await redirectToCheckout()
        } catch (err: any) {
            setSnackSev('error')
            setSnackText(err.message || 'Failed to start checkout')
            setSnackOpen(true)
            setCheckoutLoading(false)
        }
    }
    const handleManageBilling = async () => {
        setBillingLoading(true)
        try {
            await redirectToBillingPortal()
        } catch (err: any) {
            setSnackSev('error')
            setSnackText(err.message || 'Failed to open billing portal')
            setSnackOpen(true)
            setBillingLoading(false)
        }
    }
    const handleThemeClick = (event: any) => {
        setSlideCheck(event.target.checked);
        if (event.target.checked) {
            setTheme('dark');
            localStorage.setItem('userTheme', 'dark')
            setSnackSev('success')
            setSnackText('Dark mode activated!')
            setSnackOpen(true)
        } else {
            setTheme('light');
            localStorage.setItem('userTheme', 'light')
            setSnackSev('success')
            setSnackText('Set to light mode.')
            setSnackOpen(true)
        }
    };
    const handleListThemeClick = () => {
        if (!slideCheck) {
            setTheme('dark');
            localStorage.setItem('userTheme', 'dark')
            setSnackSev('success')
            setSnackText('Dark mode activated!')
            setSnackOpen(true)
        } else {
            setTheme('light');
            localStorage.setItem('userTheme', 'light')
            setSnackSev('success')
            setSnackText('Set to light mode.')
            setSnackOpen(true)
        }
        setSlideCheck(!slideCheck);
    };
    async function supaLogOut() {
        let { error } = await supabase.auth.signOut()
    }
    React.useEffect(() => {
        if (!areYouSureOpen) {
            if (checkAccept) {
                handleDelete()
            }
            setBudgetDelete(false)
        }
    }, [areYouSureOpen])
    async function handleDoubleCheck() {
        setBudgetDelete(true)
        setCheckTitle('Are you sure you want to delete this budget?')
        setCheckDetails('WARNING: This will delete all sections, categories, and transactions assigned to this budget. THIS CANNOT BE UNDONE')
        setAreYouSureOpen(true)
    }
    async function handleDelete() {
        if (!budgetDelete) {
            return
        }
        setLoadingOpen(true)
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

        let { data } = await supabase
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
        //window.location.reload();
        setLoadingOpen(false)
        setSnackSev('success')
        setSnackText('Budget deleted')
        setSnackOpen(true)
        setCheckAccept(false)
        setBudgetDelete(false)
    }
    React.useEffect(() => {
        if (currentTheme === 'dark') {
            setSlideCheck(true)
        } else {
            setSlideCheck(false)
        }
    }, [slideCheck, currentTheme]);
    const navigate = useNavigate();
    const fnLogout = () => {
        supaLogOut()
        navigate("/login", { replace: true });
    }
    const copyUserID = async () => {
        //navigator.clipboard.writeText(user.recordID)
        await navigator.clipboard
            .writeText(currentUserDetails.recordID)
            .then(() => {
                setSnackSev('success')
                setSnackText('User ID copied')
                setSnackOpen(true)
            })
            .catch(() => {
                setSnackSev('error')
                setSnackText('Something went wrong')
                setSnackOpen(true)
            });
    }
    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <>
            <Box display='flex' flexDirection='column' alignItems='center'>
                <Stack spacing={2} alignItems="stretch" sx={{ maxWidth: 400, width: '100%' }}>
                    <Typography sx={{ alignSelf: 'flex-start' }} color='text.secondary' variant='h6'>Settings</Typography>
                    <Paper elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
                        <List>
                            <ListItem disablePadding>
                                <Typography color='text.secondary' variant='h6' sx={{ fontWeight: '600', ml: 1 }}>General</Typography>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleListThemeClick}>
                                    <ListItemIcon>
                                        <DarkModeIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Dark Mode" />
                                    <Switch sx={{ ml: 1 }} size='small' checked={slideCheck} onChange={handleThemeClick} />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Paper>
                    <Paper elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
                        <List>
                            <ListItem disablePadding>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                                    <Typography color='text.secondary' variant='h6' sx={{ fontWeight: '600' }}>Subscription</Typography>
                                    {!entitlementLoading && (
                                        subscriptionState === 'active' ? (
                                            <Chip label="Pro" size="small" color="success" />
                                        ) : subscriptionState === 'trialing' ? (
                                            <Chip label="Trial" size="small" color="info" />
                                        ) : subscriptionState === 'canceling' ? (
                                            <Chip label="Canceling" size="small" color="warning" />
                                        ) : (
                                            <Chip label="Free" size="small" variant="outlined" />
                                        )
                                    )}
                                </Box>
                            </ListItem>
                            <Divider />
                            {subscriptionState === 'free' && (
                                <ListItem disablePadding>
                                    <ListItemButton onClick={handleUpgrade} disabled={offline || checkoutLoading}>
                                        <ListItemIcon>
                                            <StarIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Upgrade to Pro"
                                            secondary={checkoutLoading ? "Redirecting to checkout..." : "Unlock premium features"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )}
                            {subscriptionState === 'canceling' && (
                                <>
                                    <ListItem disablePadding sx={{ px: 2, py: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Your plan is active until {entitlement?.current_period_end
                                                ? new Date(entitlement.current_period_end).toLocaleDateString()
                                                : 'end of billing period'}
                                        </Typography>
                                    </ListItem>
                                    <Divider />
                                </>
                            )}
                            {subscriptionState !== 'free' && (
                                <ListItem disablePadding>
                                    <ListItemButton onClick={handleManageBilling} disabled={offline || billingLoading}>
                                        <ListItemIcon>
                                            <ManageAccountsIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Manage Subscription"
                                            secondary={billingLoading ? "Redirecting to billing portal..." : "Update payment, cancel, or view invoices"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                    <Paper elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
                        <List>
                            <ListItem disablePadding>
                                <Typography color='text.secondary' variant='h6' sx={{ fontWeight: '600', ml: 1 }}>{'Budget: ' + currentBudgetDetails?.budgetName}</Typography>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setSelectBudgetOpen(true)}>
                                    <ListItemIcon>
                                        <ListAltIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Switch Budgets" />
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setExportToCSV(true)} disabled={offline || !hasPro}>
                                    <ListItemIcon>
                                        {hasPro ? <FileDownloadIcon /> : <LockIcon color="disabled" />}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Export Data to CSV"
                                        secondary={!hasPro ? "Pro feature" : undefined}
                                    />
                                    {!hasPro && <Chip label="Pro" size="small" variant="outlined" sx={{ ml: 1 }} />}
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setShareBudgetOpen(true)} disabled={offline || !hasPro}>
                                    <ListItemIcon>
                                        {hasPro ? <ShareIcon /> : <LockIcon color="disabled" />}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Share Budget"
                                        secondary={!hasPro ? "Pro feature" : undefined}
                                    />
                                    {!hasPro && <Chip label="Pro" size="small" variant="outlined" sx={{ ml: 1 }} />}
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleDoubleCheck} disabled={offline}>
                                    <ListItemIcon>
                                        <DeleteIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Delete Budget" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Paper>
                    <Paper elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
                        <List>
                            <ListItem disablePadding>
                                <Typography color='text.secondary' variant='h6' sx={{ fontWeight: '600', ml: 1 }}>Account: {currentUserDetails.fullName}</Typography>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setQrOpen(true)} disabled={!hasPro}>
                                    <ListItemIcon>
                                        {hasPro ? <QrCodeIcon /> : <LockIcon color="disabled" />}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Show My QR Code"
                                        secondary={hasPro ? "For sharing budgets" : "Pro feature"}
                                    />
                                    {!hasPro && <Chip label="Pro" size="small" variant="outlined" sx={{ ml: 1 }} />}
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setOpenChangePassword(true)} disabled={offline}>
                                    <ListItemIcon>
                                        <LockResetIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Change Password" />
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                            <ListItem disablePadding>
                                <ListItemButton onClick={fnLogout} disabled={offline}>
                                    <ListItemIcon>
                                        <LogoutIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Logout" />
                                </ListItemButton>
                            </ListItem>
                        </List>
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
                <Box sx={{ bgcolor: 'background.paper', height: '100%' }} component='form' onSubmit={() => { copyUserID(); setQrOpen(false); }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        My User ID<IconButton onClick={() => setQrOpen(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', pb: 3 }} dividers>
                        <QRCodeSVG value={currentUserDetails.recordID} size={200} />
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 2, wordBreak: 'break-all' }}>
                            {currentUserDetails.recordID}
                        </Typography>
                        <DialogActions>
                            <Button
                                sx={{ mt: 1 }}
                                fullWidth
                                variant='contained'
                                type='submit'
                                startIcon={<ContentCopyIcon />}
                            >
                                Copy to Clipboard
                            </Button>
                        </DialogActions>
                    </DialogContent>
                </Box>
            </Dialog>
        </>
    )
}
