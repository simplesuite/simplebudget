import React from 'react';
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTableStore } from "../store/tableStore";
import { useModalStore } from "../store/modalStore";
import ListItem from "@mui/material/ListItem";
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import { alpha } from '@mui/material/styles';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function TransactionsPage() {
    const transactionsArray = useTableStore(s => s.transactions)
    const [filteredTransactions, setFilteredTransactions] = React.useState(transactionsArray)
    React.useEffect(() => {
        filterTransactions(searchText)
    }, [transactionsArray])
    const [searchText, setSearchText] = React.useState('')
    function setText(event: any) {
        setSearchText(event.target.value)
        filterTransactions(event.target.value)
    }
    const filterTransactions = (targetText: string) => {
        if (targetText.length > 0) {
            const filtered = transactionsArray.filter((data) => JSON.stringify({ [data.title]: data.amount }).toLowerCase().indexOf(targetText.toLowerCase()) !== -1);
            setFilteredTransactions(filtered)
        } else {
            setFilteredTransactions(transactionsArray)
        }
    }
    const categoryArray = useTableStore(s => s.categories)
    const sectionsArray = useTableStore(s => s.sections)
    const setCurrentTransaction = useModalStore(s => s.setCurrentTransaction)
    const setOpenEditTransaction = useModalStore(s => s.setEditTransaction)
    const openTransaction = (trsID: string) => {
        setCurrentTransaction(trsID)
        setOpenEditTransaction(true)
    }
    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Section collapse states
    const [uncategorizedExpanded, setUncategorizedExpanded] = React.useState(() => {
        try { return localStorage.getItem('txUncategorizedExpanded') !== 'false'; } catch { return true; }
    });
    const [upcomingExpanded, setUpcomingExpanded] = React.useState(() => {
        try { return localStorage.getItem('txUpcomingExpanded') !== 'false'; } catch { return true; }
    });
    const [todayExpanded, setTodayExpanded] = React.useState(() => {
        try { return localStorage.getItem('txTodayExpanded') !== 'false'; } catch { return true; }
    });
    const [yesterdayExpanded, setYesterdayExpanded] = React.useState(() => {
        try { return localStorage.getItem('txYesterdayExpanded') !== 'false'; } catch { return true; }
    });
    const [lastWeekExpanded, setLastWeekExpanded] = React.useState(() => {
        try { return localStorage.getItem('txLastWeekExpanded') !== 'false'; } catch { return true; }
    });
    const [earlierExpanded, setEarlierExpanded] = React.useState(() => {
        try { return localStorage.getItem('txEarlierExpanded') !== 'false'; } catch { return true; }
    });

    // Date buckets for categorized transactions
    const today = dayjs().startOf('day');
    const yesterday = today.subtract(1, 'day');
    const lastWeekStart = today.subtract(7, 'day');

    const uncategorizedTransactions = filteredTransactions
        .filter(x => x.categoryID === null)
        .sort((a, b) => b.transactionDate - a.transactionDate);

    const categorizedTransactions = filteredTransactions
        .filter(x => x.categoryID !== null)
        .sort((a, b) => b.transactionDate - a.transactionDate);

    const upcomingTransactions = categorizedTransactions.filter(t => dayjs(t.transactionDate).isAfter(today.endOf('day')));
    const todayTransactions = categorizedTransactions.filter(t => dayjs(t.transactionDate).isSame(today, 'day'));
    const yesterdayTransactions = categorizedTransactions.filter(t => dayjs(t.transactionDate).isSame(yesterday, 'day'));
    const lastWeekTransactions = categorizedTransactions.filter(t => {
        const d = dayjs(t.transactionDate);
        return d.isBefore(yesterday) && (d.isAfter(lastWeekStart) || d.isSame(lastWeekStart, 'day'));
    });
    const earlierTransactions = categorizedTransactions.filter(t => dayjs(t.transactionDate).isBefore(lastWeekStart));

    const renderCategorizedRow = (row: typeof categorizedTransactions[0], index: number, arr: typeof categorizedTransactions) => (
        <React.Fragment key={row.recordID}>
            <ListItem disablePadding divider={index < arr.length - 1}>
                <ListItemButton onClick={() => openTransaction(row.recordID)}>
                    <Grid size={12} container columnSpacing={1} alignItems='center' sx={{ width: '100%' }}>
                        <Grid size={1.3}>
                            <Avatar sx={{ ml: -1, fontSize: 15, textAlign: 'center', bgcolor: 'text.secondary' }}>
                                {dayjs(row.transactionDate).format('MMM DD')}
                            </Avatar>
                        </Grid>
                        <Grid size='grow'>
                            <Typography sx={{ mt: 0.5 }} style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                                variant='body1'>{row.title}</Typography>
                            <Chip size='small'
                                label={categoryArray.find(x => x.recordID === row.categoryID)?.categoryName}
                                sx={(theme) => {
                                    const category = categoryArray.find(x => x.recordID === row.categoryID)
                                    const section = sectionsArray.find(x => x.recordID === category?.sectionID)
                                    return {
                                        backgroundColor:
                                            section?.sectionType === 'expense' ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.success.main, 0.2)
                                    }
                                }}
                            />
                        </Grid>
                        <Grid size='auto' sx={{ textAlign: 'right' }}>
                            <Typography color={row.transactionType === 'expense' ? 'error.main' : 'success.main'} style={{ overflow: "hidden", textOverflow: "ellipsis" }} display='inline'
                                variant='body1'>{(row.transactionType === 'expense' ? '-' : '+') + formatter.format(row.amount)}</Typography>
                        </Grid>
                    </Grid>
                </ListItemButton>
            </ListItem>
        </React.Fragment>
    );

    const renderUncategorizedRow = (row: typeof uncategorizedTransactions[0], index: number, arr: typeof uncategorizedTransactions) => (
        <React.Fragment key={row.recordID}>
            <ListItem disablePadding divider={index < arr.length - 1}>
                <ListItemButton onClick={() => openTransaction(row.recordID)}>
                    <Grid size={12} container columnSpacing={1} alignItems='center' sx={{ width: '100%' }}>
                        <Grid size={1.3}>
                            <Avatar sx={{ ml: -1, fontSize: 15, textAlign: 'center', bgcolor: 'text.secondary' }}>
                                {dayjs(row.transactionDate).format('MMM DD')}
                            </Avatar>
                        </Grid>
                        <Grid size='auto' sx={{ flexGrow: 1 }}>
                            <Typography sx={{ mt: 0.5 }} style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                                variant='body1'>{row.title}</Typography>
                            <Chip size='small' label='Uncategorized' color='warning' />
                        </Grid>
                        <Grid size='auto' sx={{ textAlign: 'right' }}>
                            <Typography color={row.transactionType === 'expense' ? 'error.light' : 'success.light'} style={{ overflow: "hidden", textOverflow: "ellipsis" }} display='inline'
                                variant='body1'>{(row.transactionType === 'expense' ? '-' : '+') + formatter.format(row.amount)}</Typography>
                        </Grid>
                    </Grid>
                </ListItemButton>
            </ListItem>
        </React.Fragment>
    );

    type SectionConfig = {
        key: string;
        label: string;
        transactions: typeof categorizedTransactions;
        expanded: boolean;
        setExpanded: (v: boolean) => void;
        storageKey: string;
        color?: string;
    };

    const sections: SectionConfig[] = [
        { key: 'upcoming', label: 'Upcoming', transactions: upcomingTransactions, expanded: upcomingExpanded, setExpanded: setUpcomingExpanded, storageKey: 'txUpcomingExpanded', color: 'success' },
        { key: 'today', label: 'Today', transactions: todayTransactions, expanded: todayExpanded, setExpanded: setTodayExpanded, storageKey: 'txTodayExpanded' },
        { key: 'yesterday', label: 'Yesterday', transactions: yesterdayTransactions, expanded: yesterdayExpanded, setExpanded: setYesterdayExpanded, storageKey: 'txYesterdayExpanded' },
        { key: 'lastWeek', label: 'Last Week', transactions: lastWeekTransactions, expanded: lastWeekExpanded, setExpanded: setLastWeekExpanded, storageKey: 'txLastWeekExpanded' },
        { key: 'earlier', label: 'Earlier', transactions: earlierTransactions, expanded: earlierExpanded, setExpanded: setEarlierExpanded, storageKey: 'txEarlierExpanded' },
    ];

    return (
        <>
            <Box display='flex' flexDirection='column' alignItems='center'>
                <Stack spacing={2} alignItems="stretch" sx={{ maxWidth: 600, width: '100%' }}>
                    <Typography sx={{ alignSelf: 'flex-start' }} color='text.secondary' variant='h6'>Transactions</Typography>
                    <TextField
                        fullWidth
                        size='small'
                        variant='filled'
                        value={searchText}
                        onChange={(event: any) => setText(event)}
                        type="search"
                        label="Search Transactions"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    {transactionsArray.length > 0 ? (
                        <>
                            {uncategorizedTransactions.length > 0 && (
                                <Box>
                                    <Box
                                        onClick={() => { const next = !uncategorizedExpanded; setUncategorizedExpanded(next); try { localStorage.setItem('txUncategorizedExpanded', String(next)); } catch { } }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            mb: 0.5,
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            '&:hover': { opacity: 0.7 },
                                        }}
                                    >
                                        {uncategorizedExpanded ? <ExpandLessIcon fontSize="small" color="warning" /> : <ExpandMoreIcon fontSize="small" color="warning" />}
                                        <Typography variant="body2" color="warning.main" sx={{ ml: 0.5, fontWeight: 600 }}>
                                            Uncategorized ({uncategorizedTransactions.length})
                                        </Typography>
                                    </Box>
                                    <Collapse in={uncategorizedExpanded}>
                                        <Paper elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
                                            <List dense disablePadding>
                                                {uncategorizedTransactions.map((row, index, arr) => renderUncategorizedRow(row, index, arr))}
                                            </List>
                                        </Paper>
                                    </Collapse>
                                </Box>
                            )}

                            {sections.filter(s => s.transactions.length > 0).map(section => (
                                <Box key={section.key}>
                                    <Box
                                        onClick={() => { const next = !section.expanded; section.setExpanded(next); try { localStorage.setItem(section.storageKey, String(next)); } catch { } }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            mb: 0.5,
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            '&:hover': { opacity: 0.7 },
                                        }}
                                    >
                                        {section.expanded ? <ExpandLessIcon fontSize="small" color={section.color as any || undefined} /> : <ExpandMoreIcon fontSize="small" color={section.color as any || undefined} />}
                                        <Typography variant="body2" color={section.color ? `${section.color}.main` : 'text.secondary'} sx={{ ml: 0.5, fontWeight: 600 }}>
                                            {section.label} ({section.transactions.length})
                                        </Typography>
                                    </Box>
                                    <Collapse in={section.expanded}>
                                        <Paper elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
                                            <List dense disablePadding>
                                                {section.transactions.map((row, index, arr) => renderCategorizedRow(row, index, arr))}
                                            </List>
                                        </Paper>
                                    </Collapse>
                                </Box>
                            ))}
                        </>
                    ) : (
                        <Typography color='text.secondary' variant='h6' sx={{ fontWeight: '300', ml: 1 }}>Nothing here yet!</Typography>
                    )}
                </Stack>
            </Box>
        </>
    )
}
