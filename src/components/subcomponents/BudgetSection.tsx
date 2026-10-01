import React from 'react';
import Paper from "@mui/material/Paper";
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import { useModalStore } from "../../store/modalStore";
import { useTableStore } from "../../store/tableStore";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import IconButton from "@mui/material/IconButton";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import GlobalJS from "../extras/GlobalJS";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryIcon from '@mui/icons-material/Category';
import EmptyState from "./EmptyState";
import { CARD_ELEVATION, cardSx, rowHoverSx } from "./uiStyles";

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 6,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 300 : 800],
    },
}));

export default function BudgetSection(sectionID: any) {
    const setAddNewCategory = useModalStore(s => s.setAddCategory)
    const setSection = useModalStore(s => s.setCurrentSection)
    const setCategory = useModalStore(s => s.setCurrentCategory)
    const setOpenEditCategory = useModalStore(s => s.setEditCategory)
    const setOpenEditSection = useModalStore(s => s.setEditSection)
    const sectionsArray = useTableStore(s => s.sections)
    const categoriesArray = useTableStore(s => s.categories)
    const { grabCategorySum } = GlobalJS();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [categoryArray, setCategoryArray] = React.useState(categoriesArray.filter(x => x.sectionID === sectionID.sectionID))
    let section = sectionsArray.find(x => x.recordID === sectionID.sectionID)
    React.useEffect(() => {
        setCategoryArray(categoriesArray.filter(x => x.sectionID === sectionID.sectionID))
    }, [categoriesArray])

    const openAddCategory = () => {
        setSection(sectionID.sectionID)
        setAddNewCategory(true)
    }
    const openCategory = (categoryID: string) => {
        setSection(sectionID.sectionID)
        setCategory(categoryID)
        if (!isDesktop) {
            setOpenEditCategory(true)
        }
    }
    const openSection = () => {
        setSection(sectionID.sectionID)
        setOpenEditSection(true)
    }
    function progPercent(catID: string, amount: number) {
        const used = catSumGrab(catID);
        if (!amount) {
            // No budget set: 0% if nothing used, otherwise treat as fully over
            return used > 0 ? 100 : 0;
        }
        return (used / amount) * 100;
    }
    function catSumGrab(catID: string) {
        let val = 0;
        if (section?.sectionType === "income") {
            val = grabCategorySum(catID);
        } else if (section?.sectionType === "expense") {
            val = -grabCategorySum(catID);
        }
        // Normalize -0 to 0 so we never render "-$0"
        return val === 0 ? 0 : val;
    }
    const isIncome = section?.sectionType === "income";

    // Section-level totals for the at-a-glance header chip.
    const sectionPlanned = categoryArray.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const sectionUsed = categoryArray.reduce((acc, c) => acc + catSumGrab(c.recordID), 0);
    const sectionRemaining = sectionPlanned - sectionUsed;
    const sectionOver = !isIncome && sectionRemaining < -0.001;

    const sortedCategories = [...categoryArray].sort((a, b) => b.amount - a.amount);

    return (
        <>
            <Paper elevation={CARD_ELEVATION} sx={{ ...cardSx, width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                    {/* Section header: name + at-a-glance remaining/planned chip */}
                    <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='space-between'
                        gap={1}
                        sx={{ px: 2, pt: 1.25, pb: 0.5 }}
                    >
                        <Typography
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            color='text.secondary'
                            variant='h6'
                            sx={{ fontWeight: 600, minWidth: 0 }}
                        >
                            {section?.sectionName}
                        </Typography>
                        {categoryArray.length > 0 && (
                            <Chip
                                size='small'
                                variant='outlined'
                                color={sectionOver ? 'error' : 'default'}
                                label={
                                    isIncome
                                        ? `${formatter.format(sectionUsed)} / ${formatter.format(sectionPlanned)}`
                                        : `${formatter.format(sectionRemaining)} left`
                                }
                                sx={{
                                    flexShrink: 0,
                                    fontWeight: 400,
                                    // Dim by default so it reads as a quiet reference, not a headline.
                                    ...(sectionOver
                                        ? {}
                                        : {
                                            color: 'text.secondary',
                                            borderColor: 'divider',
                                            opacity: 0.75,
                                        }),
                                }}
                            />
                        )}
                    </Box>

                    {categoryArray.length > 0 ? (
                        <List sx={{ width: '100%', pb: 0.5, pt: 0 }}>
                            {sortedCategories.map((row) => {
                                const used = catSumGrab(row.recordID);
                                const remaining = row.amount - used;
                                const pct = progPercent(row.recordID, row.amount);
                                // "over" only matters for expenses (spent more than planned)
                                const over = !isIncome && remaining < -0.001;
                                return (
                                    <ListItem disablePadding key={row.recordID} divider>
                                        <ListItemButton onClick={() => openCategory(row.recordID)} sx={{ py: 1, ...rowHoverSx }}>
                                            <Box sx={{ width: '100%' }}>
                                                {/* Line 1: name (+ over-budget icon) + remaining headline */}
                                                <Box display='flex' alignItems='baseline' justifyContent='space-between' gap={1}>
                                                    <Box display='flex' alignItems='center' gap={0.5} sx={{ minWidth: 0 }}>
                                                        {over && (
                                                            <WarningAmberIcon
                                                                color='error'
                                                                sx={{ fontSize: 16, flexShrink: 0 }}
                                                            />
                                                        )}
                                                        <Typography
                                                            variant='body1'
                                                            sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                                                        >
                                                            {row.categoryName}
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        variant='body1'
                                                        sx={{ fontWeight: 600, flexShrink: 0 }}
                                                        color={over ? 'error.main' : (remaining <= 0.001 ? 'success.main' : 'text.primary')}
                                                    >
                                                        {formatter.format(remaining)}
                                                    </Typography>
                                                </Box>
                                                {/* Line 2: spent-of-planned + percent */}
                                                <Box display='flex' alignItems='baseline' justifyContent='space-between' gap={1} sx={{ mt: 0.25, mb: 0.5 }}>
                                                    <Typography variant='caption' color='text.secondary' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                                        {formatter.format(used)} {isIncome ? 'earned of' : 'spent of'} {formatter.format(row.amount)}
                                                    </Typography>
                                                    <Typography variant='caption' sx={{ flexShrink: 0 }} color={over ? 'error.main' : 'text.secondary'}>
                                                        {Math.round(Math.max(pct, 0))}% {isIncome ? 'earned' : 'used'}
                                                    </Typography>
                                                </Box>
                                                {/* Line 3: progress bar */}
                                                <BorderLinearProgress
                                                    variant='determinate'
                                                    value={Math.min(Math.max(pct, 0), 100)}
                                                    color={over ? 'error' : 'primary'}
                                                />
                                            </Box>
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    ) : (
                        <EmptyState
                            dense
                            icon={<CategoryIcon />}
                            title='No categories yet'
                            description={`Add a category to start ${isIncome ? 'planning income' : 'budgeting spending'} here.`}
                        />
                    )}

                    <Box display='flex' justifyContent='space-between' sx={{ mx: 0.5, mb: 0 }}>
                        <Button size='small' variant='text' startIcon={<PlaylistAddIcon />} onClick={openAddCategory}>Add Category</Button>
                        <IconButton sx={{ ml: 2 }} onClick={openSection} size='small'><MoreHorizIcon /></IconButton>
                    </Box>
                </Box>
            </Paper>
        </>
    )
}
