import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTheme, alpha } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

interface CategorySummaryProps {
    planned: number;
    transactions: any[];
    isIncome: boolean;
    /** Full month name, e.g. "October" */
    budgetMonth?: string;
    /** Year, e.g. 2026 */
    budgetYear?: number;
    /** Compact spacing variant for the desktop sidebar */
    dense?: boolean;
}

/**
 * Shared category detail summary + current-month insights, used by both the
 * mobile EditCategory modal and the desktop BudgetPage sidebar so they stay
 * visually consistent.
 *
 * All analytics are derived from the current month's transactions already in
 * memory — no extra network calls.
 */
export default function CategorySummary({
    planned,
    transactions,
    isIncome,
    budgetMonth,
    budgetYear,
    dense = false,
}: CategorySummaryProps) {
    const theme = useTheme();

    const expenses = transactions.filter(t => t.transactionType === 'expense');
    const incomes = transactions.filter(t => t.transactionType === 'income');
    const spentRaw = expenses.reduce((a, t) => a + (Number(t.amount) || 0), 0);
    const earnedRaw = incomes.reduce((a, t) => a + (Number(t.amount) || 0), 0);

    // "used" = what counts against this category's plan (positive number)
    const used = isIncome ? (earnedRaw - spentRaw) : (spentRaw - earnedRaw);
    const usedClamped = used < 0 ? 0 : used;
    const remaining = planned - used;
    const pct = !planned ? (used > 0 ? 100 : 0) : (used / planned) * 100;
    const over = !isIncome && remaining < -0.001;

    const txCount = transactions.length;
    const largest = transactions.reduce((max, t) => Math.max(max, Number(t.amount) || 0), 0);

    // Build insight chips conditionally so empty categories stay clean.
    const insights: { key: string; icon: React.ReactNode; label: string; color: 'error' | 'warning' | 'success' | 'default' | 'info' }[] = [];

    if (over) {
        insights.push({
            key: 'over',
            icon: <WarningAmberIcon fontSize='small' />,
            label: `Over by ${formatter.format(Math.abs(remaining))}`,
            color: 'error',
        });
    } else {
        insights.push({
            key: 'remaining',
            icon: <CheckCircleOutlineIcon fontSize='small' />,
            label: `${formatter.format(remaining)} ${isIncome ? 'left to earn' : 'left'}`,
            color: 'success',
        });
    }

    if (txCount > 0) {
        insights.push({
            key: 'count',
            icon: <ReceiptLongIcon fontSize='small' />,
            label: `${txCount} ${txCount === 1 ? 'transaction' : 'transactions'}${largest > 0 ? ` · largest ${formatter.format(largest)}` : ''}`,
            color: 'default',
        });
    }

    const StatTile = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
        <Paper
            elevation={0}
            sx={{
                flex: 1,
                textAlign: 'center',
                py: dense ? 0.5 : 0.75,
                px: 0.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.06 : 0.04),
            }}
        >
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.2 }}>
                {label}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600, color: valueColor }}>
                {value}
            </Typography>
        </Paper>
    );

    return (
        <Paper elevation={1} sx={{ borderRadius: 3, p: dense ? 1.25 : 1.75 }}>
            {/* Stat tiles */}
            <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
                <StatTile label={isIncome ? 'Earned' : 'Spent'} value={formatter.format(usedClamped)} />
                <StatTile label='Planned' value={formatter.format(planned)} />
                <StatTile
                    label={isIncome ? '% earned' : '% used'}
                    value={`${Math.round(Math.max(pct, 0))}%`}
                    valueColor={over ? theme.palette.error.main : undefined}
                />
            </Stack>

            {/* Progress bar */}
            <LinearProgress
                variant='determinate'
                color={over ? 'error' : 'success'}
                value={Math.min(Math.max(pct, 0), 100)}
                sx={{ height: 8, borderRadius: 5 }}
            />

            {/* Insights strip */}
            {insights.length > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        mt: 1.25,
                    }}
                >
                    {insights.map(ins => (
                        <Chip
                            key={ins.key}
                            icon={ins.icon as any}
                            label={ins.label}
                            size='small'
                            variant={ins.color === 'default' ? 'outlined' : 'filled'}
                            color={ins.color === 'default' ? undefined : ins.color}
                            sx={{
                                height: 'auto',
                                '& .MuiChip-label': { py: 0.4, whiteSpace: 'normal' },
                            }}
                        />
                    ))}
                </Box>
            )}
        </Paper>
    );
}
