import React from 'react';
import TextField from "@mui/material/TextField";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useModalStore } from '../../store/modalStore';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
    dialogPaperStyles,
    useGlobalStore
} from "../../store/globalStore";
import dayjs, { Dayjs } from "dayjs";
import { useTableStore } from "../../store/tableStore";
import TransactionFields from "../subcomponents/TransactionFields";
import { useCategoryGroups } from "../extras/useCategoryGroups";
import { supabase } from "../../lib/supabase";
import { ensureSession } from "../extras/ensureSession";
import { withNetworkTimeout } from "../../lib/networkUtils";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Stack from "@mui/material/Stack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuItem from "@mui/material/MenuItem";
import DeleteIcon from "@mui/icons-material/Delete";
import Menu from "@mui/material/Menu";
import OfflineAlert, { useIsOffline } from "../extras/OfflineAlert";

export default function EditTransaction() {
    const setLoadingOpen = useGlobalStore(s => s.setMainLoading)
    const offline = useIsOffline();
    const openEditTransaction = useModalStore(s => s.editTransaction);
    const setOpenEditTransaction = useModalStore(s => s.setEditTransaction);
    const currentTransactionID = useModalStore(s => s.currentTransaction)
    const transactionsArray = useTableStore(s => s.transactions)
    const setTransactionsArray = useTableStore(s => s.setTransactions)
    const setSnackText = useGlobalStore(s => s.setSnackBarText);
    const setSnackSev = useGlobalStore(s => s.setSnackBarSeverity);
    const setSnackOpen = useGlobalStore(s => s.setSnackBarOpen);
    const [errorText, setErrorText] = React.useState('')
    const currentTransactionDetails = transactionsArray.find(x => x.recordID === currentTransactionID)
    const [transactionAmount, setTransactionAmount] = React.useState(0.00)
    const [transactionTitle, setTransactionTitle] = React.useState('')
    const [transactionCategory, setTransactionCategory] = React.useState<any>(null);
    const [transactionType, setTransactionType] = React.useState('expense')
    const [transactionDate, setTransactionDate] = React.useState<Dayjs | null>(dayjs())
    const areYouSureOpen = useModalStore(s => s.areYouSure);
    const setAreYouSureOpen = useModalStore(s => s.setAreYouSure);
    const setCheckTitle = useGlobalStore(s => s.setAreYouSureTitle);
    const setCheckDetails = useGlobalStore(s => s.setAreYouSureDetails);
    const checkAccept = useGlobalStore(s => s.areYouSureAccept);
    const setCheckAccept = useGlobalStore(s => s.setAreYouSureAccept);
    const [deleteTrans, setDeleteTrans] = React.useState(false)
    const theme = useTheme();
    const bigger = useMediaQuery(theme.breakpoints.up('sm'));
    const categoryGroups = useCategoryGroups();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const moreOpen = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    async function handleDoubleCheck() {
        setDeleteTrans(true)
        setAnchorEl(null);
        let transDetails = 'Title: '
        if (currentTransactionDetails !== undefined) {
            transDetails = transDetails + currentTransactionDetails.title
        }
        setCheckTitle('Are you sure you want to delete this transaction?')
        setCheckDetails(transDetails)
        setAreYouSureOpen(true)
    }

    React.useEffect(() => {
        if (!areYouSureOpen) {
            if (checkAccept) {
                handleDelete()
            }
            setDeleteTrans(false)
        }
    }, [areYouSureOpen])

    async function handleDelete() {
        setErrorText('')
        if (!deleteTrans) {
            return
        }
        setLoadingOpen(true)
        try {
            await withNetworkTimeout(ensureSession());
            let { error } = await withNetworkTimeout(
                Promise.resolve(supabase.from('transactions').delete().eq('recordID', currentTransactionID))
            ) as { error: any };
            if (error) {
                setLoadingOpen(false)
                setErrorText(error.message)
                return
            }
            let newArr = transactionsArray.filter(function (el) { return el.recordID !== currentTransactionID; });
            setTransactionsArray(newArr);
            setOpenEditTransaction(false)
            setLoadingOpen(false)
            setSnackSev('success')
            setSnackText('Transaction deleted')
            setSnackOpen(true)
            setCheckAccept(false)
            setDeleteTrans(false)
        } catch (err: any) {
            setLoadingOpen(false)
            setErrorText(err.message || 'Network error — try again when online')
        }
    }
    const verifyInputs = () => {
        if (transactionTitle === '' || transactionTitle === null) {
            setErrorText('Please enter a title')
            return false
        }
        if (transactionDate === null) {
            setErrorText('Please enter a date')
            return false
        }
        return true
    }
    async function handleSubmit(event: any) {
        event.preventDefault();
        setErrorText('')
        if (verifyInputs()) {
            setLoadingOpen(true)
            try {
                await withNetworkTimeout(ensureSession());
                let { error } = await withNetworkTimeout(
                    Promise.resolve(supabase.from('transactions').update({
                        categoryID: transactionCategory === null ? null : transactionCategory.id,
                        //@ts-ignore
                        amount: transactionAmount === '' ? 0 : Math.round(Number(transactionAmount) * 100) / 100,
                        title: transactionTitle,
                        transactionDate: dayjs(transactionDate).valueOf() !== null ? dayjs(transactionDate).valueOf() : dayjs().valueOf(),
                        transactionType: transactionType,
                    }).eq('recordID', currentTransactionID))
                ) as { error: any };
                if (error) {
                    setErrorText(error.message)
                    setLoadingOpen(false)
                    return
                }
                let newArr = transactionsArray.map(obj => {
                    if (obj.recordID === currentTransactionID) {
                        return {
                            ...obj,
                            categoryID: transactionCategory === null ? null : transactionCategory.id,
                            //@ts-ignore
                            amount: transactionAmount === '' ? 0 : Math.round(Number(transactionAmount) * 100) / 100,
                            title: transactionTitle,
                            transactionDate: dayjs(transactionDate).valueOf() !== null ? dayjs(transactionDate).valueOf() : 0,
                            transactionType: transactionType,
                        };
                    }
                    return obj;
                });
                setTransactionsArray(newArr);
                setOpenEditTransaction(false)
                setLoadingOpen(false)
                setSnackSev('success')
                setSnackText('Transaction updated!')
                setSnackOpen(true)
            } catch (err: any) {
                setLoadingOpen(false)
                setErrorText(err.message || 'Network error — try again when online')
            }
        }
    }
    React.useEffect(() => {
        if (!openEditTransaction) return;
        if (currentTransactionDetails) {
            setTransactionTitle(currentTransactionDetails.title)
            setTransactionAmount(currentTransactionDetails.amount)
            setTransactionType(currentTransactionDetails.transactionType)
            setTransactionCategory(categoryGroups.find(x => x.id === currentTransactionDetails.categoryID) ?? null)
            setTransactionDate(dayjs(currentTransactionDetails.transactionDate))
        }
        setErrorText('')
    }, [openEditTransaction])
    return (
        <>
            <Dialog open={openEditTransaction}
                onClose={() => setOpenEditTransaction(false)}
                scroll='paper'
                fullScreen={!bigger}
                slotProps={{ paper: bigger ? dialogPaperStyles : undefined }}
            >
                <Box sx={{ bgcolor: 'background.paper', height: '100%' }} component='form' onSubmit={handleSubmit}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <IconButton
                                size='small'
                                aria-label="more"
                                aria-controls={moreOpen ? 'long-menu' : undefined}
                                aria-expanded={moreOpen ? 'true' : undefined}
                                aria-haspopup="true"
                                onClick={handleClick}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <div>Edit Transaction</div>
                        </Stack>
                        <IconButton onClick={() => setOpenEditTransaction(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ mb: 1 }}><OfflineAlert /></Box>
                        <TransactionFields
                            amount={transactionAmount}
                            onAmountChange={(v) => setTransactionAmount(v as any)}
                            autoFocusAmount
                            type={transactionType}
                            onTypeChange={setTransactionType}
                            date={transactionDate}
                            onDateChange={setTransactionDate}
                            title={transactionTitle}
                            onTitleChange={setTransactionTitle}
                            category={transactionCategory}
                            onCategoryChange={setTransactionCategory}
                            categoryGroups={categoryGroups}
                        />
                    </DialogContent>
                    {errorText && <Box sx={{ mx: 2, mt: 1 }}><Typography color='error' variant='body2'>{errorText}</Typography></Box>}
                    <DialogActions sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', px: 2, py: 1.5 }}>
                        <Button fullWidth startIcon={<SaveIcon />} variant='contained' type='submit' disabled={offline}>Save Changes</Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <Menu
                id="long-menu"
                slotProps={{
                    list: {
                        'aria-labelledby': 'long-button',
                    },
                }}
                anchorEl={anchorEl}
                open={moreOpen}
                onClose={handleClose}
            >
                <MenuItem onClick={handleDoubleCheck} disabled={offline}>
                    <DeleteIcon />
                    Delete
                </MenuItem>
            </Menu>
        </>
    )
}
