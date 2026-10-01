import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useModalStore } from '../../store/modalStore';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { dialogPaperStyles, useGlobalStore } from "../../store/globalStore";
import { useTableStore } from "../../store/tableStore";
import { v4 as uuidv4 } from "uuid";
import AddIcon from '@mui/icons-material/Add';
import { supabase } from "../../lib/supabase";
import { ensureSession } from "../extras/ensureSession";
import { withNetworkTimeout } from "../../lib/networkUtils";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import OfflineAlert, { useIsOffline } from "../extras/OfflineAlert";
import SectionFields from "../subcomponents/SectionFields";

export default function AddSection() {
    const setLoadingOpen = useGlobalStore(s => s.setMainLoading)
    const offline = useIsOffline();
    const addNewSection = useModalStore(s => s.addSection);
    const setAddNewSection = useModalStore(s => s.setAddSection);
    const [sectionName, setSectionName] = React.useState('');
    const [sectionType, setSectionType] = React.useState('expense');
    const currentBudget = useTableStore(s => s.currentBudgetAndMonth)
    const sectionsArray = useTableStore(s => s.sections);
    const setSectionArray = useTableStore(s => s.setSections);
    const setSnackText = useGlobalStore(s => s.setSnackBarText);
    const setSnackSev = useGlobalStore(s => s.setSnackBarSeverity);
    const setSnackOpen = useGlobalStore(s => s.setSnackBarOpen);
    const [errorText, setErrorText] = React.useState('')
    const theme = useTheme();
    const bigger = useMediaQuery(theme.breakpoints.up('sm'));
    const verifyInputs = () => {
        if (sectionName === '' || sectionName === null) {
            setErrorText('Please enter section name.')
            return false
        }
        return true
    }
    async function handleSubmit(event: any) {
        event.preventDefault();
        if (currentBudget.budgetID === undefined) {
            setErrorText('You need to create a budget first! Go to the settings page, click \'Select Budget\'')
            return
        }
        setErrorText('')
        if (verifyInputs()) {
            setLoadingOpen(true)
            try {
                await withNetworkTimeout(ensureSession());
                let newSection = {
                    recordID: uuidv4(),
                    budgetID: currentBudget.budgetID,
                    sectionName: sectionName,
                    sectionType: sectionType,
                    sectionYear: currentBudget.year,
                    sectionMonth: currentBudget.month,
                };
                let { error } = await withNetworkTimeout(
                    Promise.resolve(supabase.from('sections').insert(newSection))
                ) as { error: any };
                if (error) {
                    setLoadingOpen(false)
                    setErrorText(error.message)
                    return
                }
                setSectionArray(prevState => [...prevState, newSection]);
                setAddNewSection(false)
                setLoadingOpen(false)
                setSnackSev('success')
                setSnackText('Section Added!')
                setSnackOpen(true)
            } catch (err: any) {
                setLoadingOpen(false)
                setErrorText(err.message || 'Network error — try again when online')
            }
        }
    }
    React.useEffect(() => {
        if (addNewSection) return;
        setSectionName('')
        setSectionType('expense')
        setErrorText('')
    }, [addNewSection])
    return (
        <>
            <Dialog open={addNewSection}
                onClose={() => setAddNewSection(false)}
                scroll='paper'
                fullScreen={!bigger}
                slotProps={{ paper: bigger ? dialogPaperStyles : undefined }}
            >
                <Box sx={{ bgcolor: 'background.paper', height: '100%' }} component='form' onSubmit={handleSubmit}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        New Section <IconButton onClick={() => setAddNewSection(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ mb: 1 }}><OfflineAlert /></Box>
                        <SectionFields
                            type={sectionType}
                            onTypeChange={setSectionType}
                            name={sectionName}
                            onNameChange={setSectionName}
                            focusNameKey={addNewSection}
                        />
                    </DialogContent>
                    {errorText && <Box sx={{ mx: 2, mt: 1 }}><Typography color='error' variant='body2'>{errorText}</Typography></Box>}
                    <DialogActions sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', px: 2, py: 1.5 }}>
                        <Button fullWidth startIcon={<AddIcon />} type='submit' variant='contained' disabled={offline}>Add Section</Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    )
}
