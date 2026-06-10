import React from 'react';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import Chip from '@mui/material/Chip';
import { useModalStore } from '../../store/modalStore';
import { useTableStore } from '../../store/tableStore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { dialogPaperStyles, useGlobalStore } from "../../store/globalStore";
import Box from "@mui/material/Box";
import ListItemButton from '@mui/material/ListItemButton';
import useGrabBudgetData from "../extras/GrabBudgetData";
import { supabase } from "../../lib/supabase";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEntitlement } from "../../lib/checkout";

export default function SelectBudget() {
    const { grabBudgetData } = useGrabBudgetData();
    const open = useModalStore(s => s.selectBudget)
    const setOpen = useModalStore(s => s.setSelectBudget)
    const createNewBudget = useModalStore(s => s.addBudget)
    const setCreateNewBudget = useModalStore(s => s.setAddBudget)
    const userData = useGlobalStore(s => s.currentUser)
    const budgetsArray = useTableStore(s => s.budgets)
    const [userNamesArray, setUserNamesArray] = React.useState([{
        recordID: '',
        fullName: '',
        userType: ''
    }])
    const currentBudgetDetails = useTableStore(s => s.currentBudgetAndMonth)
    const setCurrentBudget = useTableStore(s => s.setCurrentBudgetAndMonth)
    const theme = useTheme();
    const bigger = useMediaQuery(theme.breakpoints.up('sm'));
    const { subscriptionState } = useEntitlement();
    const hasPro = subscriptionState !== 'free';
    const canCreateBudget = hasPro || budgetsArray.length < 1;
    React.useEffect(() => {
        if (open) {
            findUserNames()
        }
    }, [open])
    async function findUserNames() {
        let userIDarray = budgetsArray.map(x => x.creatorID)
        let { data, error } = await supabase
            .from('users')
            .select()
            .in('recordID', userIDarray)
        if (error) {
            console.log(error.message)
        }
        if (data) {
            setUserNamesArray(data)
        }
    }
    function grabUserName(creatorID: string) {
        let output
        if (creatorID === userData.recordID) {
            output = 'Me'
        } else {
            output = userNamesArray.find(x => x.recordID === creatorID)?.fullName
        }
        if (output === undefined) {
            output = 'Not Found'
        }
        return output
    }
    const handleListItemClick = async (newBudgetID: string) => {
        if (newBudgetID !== 'addBudget') {
            setCurrentBudget({
                budgetID: newBudgetID,
                year: currentBudgetDetails.year !== null ? currentBudgetDetails.year : Number(dayjs().format('YYYY')),
                month: currentBudgetDetails.month !== null ? currentBudgetDetails.month : dayjs().format('MMMM')
            })
            localStorage.setItem('currentBudget', JSON.stringify({
                budgetID: newBudgetID,
                year: currentBudgetDetails.year !== null ? currentBudgetDetails.year : Number(dayjs().format('YYYY')),
                month: currentBudgetDetails.month !== null ? currentBudgetDetails.month : dayjs().format('MMMM')
            }))
            setCreateNewBudget(false)
            await grabBudgetData(newBudgetID, currentBudgetDetails.year, currentBudgetDetails.month)
        } else {
            setCreateNewBudget(true)
        }
        setOpen(false)
    }
    return (
        <>
            <Dialog
                onClose={() => setOpen(false)}
                open={open}
                slotProps={{ paper: dialogPaperStyles }}
            >
                <Box sx={{ bgcolor: 'background.paper', height: '100%', minWidth: 250 }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Select Budget<IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <List sx={{ pt: 0 }}>
                        {budgetsArray.map((row) => (
                            <ListItem disablePadding key={row.recordID}>
                                <ListItemButton onClick={() => handleListItemClick(row.recordID)}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary', color: 'primary.light' }}>
                                            <DashboardIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={row.budgetName} secondary={grabUserName(row.creatorID)} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <ListItem disablePadding key={1}>
                            <ListItemButton onClick={() => handleListItemClick('addBudget')} disabled={!canCreateBudget}>
                                <ListItemAvatar>
                                    <Avatar>
                                        {canCreateBudget ? <AddIcon /> : <LockIcon />}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary="Add Budget"
                                    secondary={!canCreateBudget ? "Pro feature" : undefined}
                                />
                                {!canCreateBudget && <Chip label="Pro" size="small" variant="outlined" sx={{ ml: 1 }} />}
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Dialog>

        </>
    )
}
