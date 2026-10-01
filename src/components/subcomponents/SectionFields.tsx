import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { alpha } from '@mui/system';

const selectFocused = (event: any) => { if (event) event.target.select(); };

interface SectionFieldsProps {
    type: string;
    onTypeChange: (t: string) => void;
    name: string;
    onNameChange: (v: string) => void;
    /** Changing this value focuses + selects the name field (pass modal open state). */
    focusNameKey?: any;
}

/** Shared, modern section form body used by Add + Edit section modals. */
export default function SectionFields({
    type,
    onTypeChange,
    name,
    onNameChange,
    focusNameKey,
}: SectionFieldsProps) {
    const isIncome = type === 'income';
    const accent = isIncome ? 'success' : 'warning';
    const nameInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (focusNameKey === undefined || focusNameKey === false || focusNameKey === null) return;
        const t = setTimeout(() => {
            const el = nameInputRef.current;
            if (el) { el.focus(); el.select(); }
        }, 50);
        return () => clearTimeout(t);
    }, [focusNameKey]);

    return (
        <Box>
            <ToggleButtonGroup
                color={accent}
                value={type}
                fullWidth
                exclusive
                onChange={(_e, newType) => { if (newType !== null) onTypeChange(newType); }}
                sx={{
                    mb: 2.5,
                    '& .MuiToggleButton-root': {
                        fontWeight: 600,
                        borderRadius: 2,
                    },
                    '& .Mui-selected': {
                        backgroundColor: (theme) => alpha(theme.palette[accent].main, 0.18) + ' !important',
                    },
                }}
            >
                <ToggleButton value='income'><TrendingUpIcon sx={{ mr: 0.5 }} />Income</ToggleButton>
                <ToggleButton value='expense'><TrendingDownIcon sx={{ mr: 0.5 }} />Expense</ToggleButton>
            </ToggleButtonGroup>

            <Box
                sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.04 : 0.03),
                }}
            >
                <TextField
                    fullWidth
                    inputRef={nameInputRef}
                    onFocus={selectFocused}
                    value={name}
                    onChange={(e: any) => onNameChange(e.target.value)}
                    type='text'
                    label='Section Name'
                    helperText={isIncome ? 'Groups income categories like Salary or Side Income.' : 'Groups spending categories like Housing or Food.'}
                />
            </Box>
        </Box>
    );
}
