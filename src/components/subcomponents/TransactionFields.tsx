import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { styled, lighten, darken, alpha } from '@mui/system';
import type { Dayjs } from 'dayjs';
import type { CategoryGroupOption } from '../extras/useCategoryGroups';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const GroupHeader = styled('div')(({ theme }) => ({
    position: 'sticky',
    top: '-8px',
    padding: '4px 10px',
    color: theme.palette.primary.main,
    backgroundColor:
        theme.palette.mode === 'light'
            ? lighten(theme.palette.primary.light, 0.85)
            : darken(theme.palette.primary.main, 0.8),
}));

const GroupItems = styled('ul')({
    padding: 0,
});

const selectFocused = (event: any) => { if (event) event.target.select(); };

interface TransactionFieldsProps {
    amount: number | string;
    onAmountChange: (v: string) => void;
    amountLabel?: string;
    autoFocusAmount?: boolean;

    /** Hide the income/expense toggle (e.g. split mode forces expense). */
    showTypeToggle?: boolean;
    type?: string;
    onTypeChange?: (t: string) => void;

    date: Dayjs | null;
    onDateChange: (d: Dayjs | null) => void;

    title: string;
    onTitleChange: (v: string) => void;
    titleLabel?: string;
    titleRequired?: boolean;

    /** Hide the category picker (split mode renders its own rows). */
    showCategory?: boolean;
    category?: CategoryGroupOption | null;
    onCategoryChange?: (v: CategoryGroupOption | null) => void;
    categoryGroups?: CategoryGroupOption[];
}

/** Shared, modern transaction form body used by Add + Edit modals. */
export default function TransactionFields({
    amount,
    onAmountChange,
    amountLabel = 'Amount',
    autoFocusAmount = false,
    showTypeToggle = true,
    type = 'expense',
    onTypeChange,
    date,
    onDateChange,
    title,
    onTitleChange,
    titleLabel = 'Title',
    titleRequired = false,
    showCategory = true,
    category = null,
    onCategoryChange,
    categoryGroups = [],
}: TransactionFieldsProps) {
    const isIncome = type === 'income';
    const accent = isIncome ? 'success' : 'warning';

    return (
        <Box>
            {/* Hero amount */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    py: 1,
                }}
            >
                <Typography
                    variant='h4'
                    sx={{ fontWeight: 700, color: showTypeToggle ? `${accent}.main` : 'text.primary' }}
                >
                    $
                </Typography>
                <TextField
                    variant='standard'
                    autoFocus={autoFocusAmount}
                    onFocus={selectFocused}
                    value={amount}
                    onChange={(e: any) => onAmountChange(e.target.value)}
                    type='number'
                    placeholder='0.00'
                    aria-label={amountLabel}
                    slotProps={{
                        htmlInput: {
                            step: '.01',
                            style: {
                                fontSize: '2.25rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                padding: 0,
                            },
                        },
                    }}
                    sx={{
                        maxWidth: 220,
                        '& .MuiInput-root': { fontSize: '2.25rem' },
                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                        },
                        '& input[type=number]': { MozAppearance: 'textfield' },
                    }}
                />
            </Box>

            {/* Segmented income/expense toggle */}
            {showTypeToggle && (
                <ToggleButtonGroup
                    color={accent}
                    value={type}
                    fullWidth
                    exclusive
                    onChange={(_e, newType) => { if (newType !== null && onTypeChange) onTypeChange(newType); }}
                    size='small'
                    sx={{
                        mb: 2.5,
                        '& .MuiToggleButton-root': {
                            fontWeight: 600,
                            borderRadius: 2,
                        },
                        '& .Mui-selected': {
                            backgroundColor: (theme) =>
                                alpha(theme.palette[accent].main, 0.18) + ' !important',
                        },
                    }}
                >
                    <ToggleButton value='income'><TrendingUpIcon sx={{ mr: 0.5 }} />Income</ToggleButton>
                    <ToggleButton value='expense'><TrendingDownIcon sx={{ mr: 0.5 }} />Expense</ToggleButton>
                </ToggleButtonGroup>
            )}

            {/* Grouped details */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.04 : 0.03),
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        closeOnSelect
                        label='Date'
                        value={date}
                        onChange={(newValue) => onDateChange(newValue)}
                        slotProps={{
                            actionBar: { actions: ['today'] },
                            textField: (params) => <TextField {...params} onFocus={selectFocused} fullWidth />,
                        }}
                        sx={{ width: '100%' }}
                    />
                </LocalizationProvider>

                <TextField
                    fullWidth
                    onFocus={selectFocused}
                    value={title}
                    onChange={(e: any) => onTitleChange(e.target.value)}
                    type='text'
                    label={titleLabel}
                    required={titleRequired}
                />

                {showCategory && (
                    <Autocomplete
                        disablePortal={false}
                        options={categoryGroups}
                        getOptionLabel={(option) => option.label}
                        groupBy={(option) => option.sectionName}
                        fullWidth
                        value={category}
                        onChange={(_e: any, newValue: any) => { if (onCategoryChange) onCategoryChange(newValue); }}
                        renderInput={(params) => <TextField onFocus={selectFocused} margin='none' {...params} label='Category' />}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                <Box display='flex' justifyContent='space-between' width='100%' gap={1}>
                                    <span>{option.label}</span>
                                    <Typography variant='body2' color={option.remaining < 0 ? 'error.main' : 'text.secondary'} sx={{ flexShrink: 0 }}>
                                        {formatter.format(option.remaining)}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        renderGroup={(params) => (
                            <li key={params.key}>
                                <GroupHeader>{params.group}</GroupHeader>
                                <GroupItems>{params.children}</GroupItems>
                            </li>
                        )}
                    />
                )}
            </Box>
        </Box>
    );
}
