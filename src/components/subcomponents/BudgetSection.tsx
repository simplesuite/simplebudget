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

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 2,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 100 : 900],
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
        if (section?.sectionType === "income") {
            return (grabCategorySum(catID) / amount) * 100
        }
        if (section?.sectionType === "expense") {
            return -(grabCategorySum(catID) / amount) * 100
        }
        return 0
    }
    function catSumGrab(catID: string) {
        if (section?.sectionType === "income") {
            return grabCategorySum(catID)
        }
        if (section?.sectionType === "expense") {
            return -grabCategorySum(catID)
        }
        return 0
    }

    return (
        <>
            <Paper elevation={4} sx={{ borderRadius: 5, width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                    <List sx={{ width: '100%', pb: 0.5 }}>
                        <ListItem disablePadding key={1}>
                            <Grid size={12} container sx={{ px: 1, pb: 0, mb: 0, width: '100%' }} columnSpacing={2}>
                                <Grid size='grow'>
                                    <Typography style={{ overflow: "hidden", textOverflow: "ellipsis" }} color='text.secondary' variant='h6' sx={{ fontWeight: '600' }}>
                                        {section?.sectionName}
                                    </Typography>

                                </Grid>
                                <Grid size={3.25} sx={{ textAlign: 'right', pt: 2 }}><Typography color='text.disabled' variant="subtitle2">Planned</Typography></Grid>
                                <Grid size={3.25} sx={{ textAlign: 'right', pt: 2 }}><Typography color='text.disabled' variant="subtitle2">Remaining</Typography></Grid>
                            </Grid>
                        </ListItem>
                        {categoryArray.sort(function (a, b) {
                            //@ts-ignore
                            return b.amount - a.amount;
                        }).map((row) => (
                            <ListItem disablePadding key={row.recordID}>
                                <ListItemButton onClick={() => openCategory(row.recordID)}>
                                    <Grid size={12} container columnSpacing={2} sx={{ width: '100%' }}>
                                        <Grid size='grow'>
                                            <Typography sx={{ ml: -1 }} style={{ overflow: "hidden", textOverflow: "ellipsis" }} display='inline' variant='body1'>{row.categoryName}</Typography>
                                        </Grid>
                                        <Grid size={3.25} sx={{ textAlign: 'right' }}><Typography variant='body1'>{formatter.format(row.amount)}</Typography></Grid>
                                        <Grid size={3.25} sx={{ textAlign: 'right' }}><Typography variant='body1'>{formatter.format(row.amount - catSumGrab(row.recordID))}</Typography></Grid>
                                        <Grid size={12}>
                                            <BorderLinearProgress
                                                sx={{ mx: -1 }}
                                                variant='determinate'
                                                value={progPercent(row.recordID, row.amount)}
                                                color={progPercent(row.recordID, row.amount) > 100 ? 'error' : 'primary'}
                                            />
                                        </Grid>
                                    </Grid>
                                </ListItemButton>
                            </ListItem>
                        )
                        )}
                    </List>
                    <Box display='flex' justifyContent='space-between' sx={{ mx: 0.5, mb: 0 }}>
                        <Button size='small' variant='text' startIcon={<PlaylistAddIcon />} onClick={openAddCategory}>Add Category</Button>
                        <IconButton sx={{ ml: 2 }} onClick={openSection} size='small'><MoreHorizIcon /></IconButton>
                    </Box>
                </Box>
            </Paper>
        </>
    )
}
