import React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { useModalStore } from '../../store/modalStore';
import { useTableStore } from '../../store/tableStore';
import { dialogPaperStyles, useGlobalStore } from "../../store/globalStore";
import Box from "@mui/material/Box";
import DialogContent from "@mui/material/DialogContent";
import Grid from '@mui/material/Grid';
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { supabase } from "../../lib/supabase";
import { ensureSession } from "../extras/ensureSession";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import { Html5Qrcode } from "html5-qrcode";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import OfflineAlert, { useIsOffline } from "../extras/OfflineAlert";
import { searchUsers, getRecentlySharedWithUsers } from "../../lib/sharing";

interface SharedUser {
    recordID: string;
    sharedToID: string;
    fullName: string | null;
    email: string | null;
}

export default function ShareBudget() {
    const open = useModalStore(s => s.shareBudget)
    const setOpen = useModalStore(s => s.setShareBudget)
    const offline = useIsOffline();
    const [searchQuery, setSearchQuery] = React.useState('')
    const [errorText, setErrorText] = React.useState('')
    const setSnackText = useGlobalStore(s => s.setSnackBarText);
    const setSnackSev = useGlobalStore(s => s.setSnackBarSeverity);
    const setSnackOpen = useGlobalStore(s => s.setSnackBarOpen);
    const user = useGlobalStore(s => s.currentUser)
    const currentBudgetDetails = useTableStore(s => s.currentBudgetAndMonth)
    const theme = useTheme();
    const bigger = useMediaQuery(theme.breakpoints.up('sm'));
    const [scanning, setScanning] = React.useState(false);
    const scannerRef = React.useRef<Html5Qrcode | null>(null);
    const scannerContainerId = 'qr-reader';
    const [sharedUsers, setSharedUsers] = React.useState<SharedUser[]>([]);
    const [loadingShared, setLoadingShared] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState<{ recordID: string; fullName: string; email: string }[]>([]);
    const [searchLoading, setSearchLoading] = React.useState(false);
    const [recentUsers, setRecentUsers] = React.useState<{ recordID: string; fullName: string; email: string }[]>([]);
    const [pendingShareUser, setPendingShareUser] = React.useState<{ recordID: string; fullName: string; email: string } | null>(null);
    const [shareLoading, setShareLoading] = React.useState(false);

    const startScanner = async () => {
        setScanning(true);
        // Small delay to let the DOM element render
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode(scannerContainerId);
                scannerRef.current = html5QrCode;
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 200, height: 200 } },
                    (decodedText) => {
                        // QR scanned — share directly with the scanned user ID
                        handleShareUser(decodedText);
                        stopScanner();
                    },
                    () => { } // ignore scan failures
                );
            } catch (err) {
                console.error('QR Scanner error:', err);
                setScanning(false);
                setErrorText('Could not access camera');
            }
        }, 100);
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) { /* ignore */ }
            scannerRef.current = null;
        }
        setScanning(false);
    };

    // Cleanup scanner when modal closes
    React.useEffect(() => {
        if (!open) {
            stopScanner();
            setSearchQuery('');
            setErrorText('');
            setSharedUsers([]);
            setSearchResults([]);
            setPendingShareUser(null);
            setRecentUsers([]);
        }
    }, [open]);

    // Fetch shared users when modal opens
    React.useEffect(() => {
        if (open && currentBudgetDetails?.budgetID) {
            fetchSharedUsers();
        }
    }, [open, currentBudgetDetails?.budgetID]);

    // Load recently shared-with users when modal opens
    React.useEffect(() => {
        if (open && user.recordID) {
            getRecentlySharedWithUsers(user.recordID).then(setRecentUsers);
        }
    }, [open, user.recordID]);

    const fetchSharedUsers = async () => {
        setLoadingShared(true);
        await ensureSession();
        const { data, error } = await supabase
            .from('shared')
            .select('recordID, sharedToID')
            .eq('budgetID', currentBudgetDetails.budgetID);
        if (error) {
            console.error('fetchSharedUsers:', error.message);
            setLoadingShared(false);
            return;
        }
        if (!data || data.length === 0) {
            setSharedUsers([]);
            setLoadingShared(false);
            return;
        }
        // Fetch user details for the shared user IDs
        const userIDs = data.map((s: any) => s.sharedToID);
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('recordID, fullName, email')
            .in('recordID', userIDs);
        if (usersError) {
            console.error('fetchSharedUsers users:', usersError.message);
        }
        const userMap = new Map<string, { fullName: string | null; email: string | null }>();
        if (users) {
            users.forEach((u: any) => userMap.set(u.recordID, { fullName: u.fullName, email: u.email }));
        }
        setSharedUsers(data.map((s: any) => ({
            recordID: s.recordID,
            sharedToID: s.sharedToID,
            fullName: userMap.get(s.sharedToID)?.fullName ?? null,
            email: userMap.get(s.sharedToID)?.email ?? null,
        })));
        setLoadingShared(false);
    };

    const handleUnshare = async (shareRecordID: string) => {
        await ensureSession();
        const { error } = await supabase
            .from('shared')
            .delete()
            .eq('recordID', shareRecordID);
        if (error) {
            setErrorText(error.message);
            return;
        }
        setSharedUsers(prev => prev.filter(s => s.recordID !== shareRecordID));
        setSnackSev('success');
        setSnackText('User removed from shared budget');
        setSnackOpen(true);
    };

    const handleShareUser = async (userID: string) => {
        const targetID = userID.trim();
        if (!targetID) return;
        if (targetID === user.recordID) {
            setErrorText("You can't share a budget with yourself");
            return;
        }
        setShareLoading(true);
        setErrorText('');
        const newShare = {
            recordID: uuidv4(),
            budgetID: currentBudgetDetails.budgetID,
            sharedToID: targetID,
        };
        await ensureSession();
        const { error } = await supabase
            .from('shared')
            .insert(newShare);
        if (error) {
            setErrorText(error.message);
            setShareLoading(false);
            return;
        }
        setSnackSev('success');
        setSnackText('Budget Shared Successfully');
        setSnackOpen(true);
        setSearchQuery('');
        setSearchResults([]);
        setPendingShareUser(null);
        await fetchSharedUsers();
        setShareLoading(false);
    };

    const handleSearchUsers = async (query: string) => {
        setSearchQuery(query);
        setPendingShareUser(null);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        const results = await searchUsers(query, user.recordID);
        // Filter out already-shared users
        const sharedIDs = new Set(sharedUsers.map((s) => s.sharedToID));
        setSearchResults(results.filter((u) => !sharedIDs.has(u.recordID)));
        setSearchLoading(false);
    };

    return (
        <>
            <Dialog
                onClose={() => setOpen(false)}
                open={open}
                fullScreen={!bigger}
                slotProps={{ paper: bigger ? dialogPaperStyles : undefined }}
            >
                <Box sx={{ bgcolor: 'background.paper', height: '100%' }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Share Budget<IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <OfflineAlert />
                            <Grid size={12}>
                                <Alert severity="warning">Warning!! Sharing your budget allows the other user to create, view, edit and delete categories, sections, and transactions. You can remove the sharing from this budget in the future, but you cannot undo their actions.</Alert>
                            </Grid>

                            {/* QR Scanner */}
                            <Grid size={12}>
                                {scanning ? (
                                    <Box>
                                        <div id={scannerContainerId} style={{ width: '100%' }} />
                                        <Button fullWidth size='small' color='error' onClick={stopScanner} sx={{ mt: 1 }}>
                                            Stop Scanner
                                        </Button>
                                    </Box>
                                ) : (
                                    <Button
                                        fullWidth
                                        variant='outlined'
                                        startIcon={<QrCodeScannerIcon />}
                                        onClick={startScanner}
                                    >
                                        Scan QR Code
                                    </Button>
                                )}
                            </Grid>

                            {/* Search field */}
                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search by name or email"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchUsers(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Recent users (shown when not searching) */}
                            {!searchQuery.trim() && !pendingShareUser && (() => {
                                const sharedIDs = new Set(sharedUsers.map((s) => s.sharedToID));
                                const filtered = recentUsers.filter((u) => !sharedIDs.has(u.recordID));
                                if (filtered.length === 0) return null;
                                return (
                                    <Grid size={12}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                            Recently shared with
                                        </Typography>
                                        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                            {filtered.map((u) => (
                                                <ListItemButton
                                                    key={u.recordID}
                                                    onClick={() => setPendingShareUser(u)}
                                                    disabled={shareLoading}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={`https://api.dicebear.com/9.x/shapes/svg?seed=${u.recordID}`}
                                                            sx={{ width: 32, height: 32 }}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={u.fullName || 'Unnamed'}
                                                        secondary={u.email}
                                                    />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Grid>
                                );
                            })()}

                            {/* Search results */}
                            {searchResults.length > 0 && !pendingShareUser && (
                                <Grid size={12}>
                                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                        {searchResults.map((u) => (
                                            <ListItemButton
                                                key={u.recordID}
                                                onClick={() => setPendingShareUser(u)}
                                                disabled={shareLoading}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        src={`https://api.dicebear.com/9.x/shapes/svg?seed=${u.recordID}`}
                                                        sx={{ width: 32, height: 32 }}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={u.fullName || 'Unnamed'}
                                                    secondary={u.email}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Grid>
                            )}
                            {searchLoading && (
                                <Grid size={12}>
                                    <CircularProgress size={20} sx={{ display: 'block', mx: 'auto' }} />
                                </Grid>
                            )}

                            {/* Confirm share prompt */}
                            {pendingShareUser && (
                                <Grid size={12}>
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                                        <Typography variant="body2" sx={{ mb: 1.5 }}>
                                            Share this budget with <strong>{pendingShareUser.fullName || pendingShareUser.email}</strong>?
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => {
                                                    handleShareUser(pendingShareUser.recordID);
                                                }}
                                                disabled={shareLoading}
                                            >
                                                {shareLoading ? <CircularProgress size={16} /> : 'Confirm'}
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => setPendingShareUser(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Grid>
                            )}

                            {/* Currently shared with */}
                            <Grid size={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    Currently shared with
                                </Typography>
                                {loadingShared ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : sharedUsers.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                                        This budget is not shared with anyone yet.
                                    </Typography>
                                ) : (
                                    <List dense disablePadding>
                                        {sharedUsers.map((sharedUser) => (
                                            <ListItem
                                                key={sharedUser.recordID}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="stop sharing"
                                                        color="error"
                                                        onClick={() => handleUnshare(sharedUser.recordID)}
                                                    >
                                                        <PersonRemoveIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        src={`https://api.dicebear.com/9.x/shapes/svg?seed=${sharedUser.sharedToID}`}
                                                        sx={{ width: 32, height: 32 }}
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={sharedUser.fullName || 'Unknown User'}
                                                    secondary={sharedUser.email || ''}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <Box sx={{ mx: 1, mt: 0.5 }}><Typography color='error'>{errorText}</Typography></Box>
                    <DialogActions>
                        <Button fullWidth onClick={() => setOpen(false)} variant='outlined'>Done</Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    )
}
