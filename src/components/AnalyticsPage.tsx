import React from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useTableStore } from '../store/tableStore';
import Typography from '@mui/material/Typography';

import dayjs from 'dayjs';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area,
} from 'recharts';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const COLORS = ['#4c809e', '#D6A058', '#6bbf8a', '#e07b7b', '#9b7fd4', '#e0a84c', '#5cc2c7', '#d4708f', '#8aad5e', '#c9884c'];

export default function AnalyticsPage() {
    const categoriesArray = useTableStore(s => s.categories);
    const sectionsArray = useTableStore(s => s.sections);
    const transactionsArray = useTableStore(s => s.transactions);
    const theme = useTheme();
    const textColor = theme.palette.text.secondary;

    React.useEffect(() => { window.scrollTo(0, 0); }, []);

    // Income pie data
    const incomeData = categoriesArray
        .filter(c => sectionsArray.find(s => s.recordID === c.sectionID)?.sectionType === 'income')
        .filter(c => c.amount > 0)
        .map(c => ({ name: c.categoryName, value: c.amount }))
        .sort((a, b) => b.value - a.value);

    // Expense pie data (by section)
    const expenseData = sectionsArray
        .filter(s => s.sectionType === 'expense')
        .map(s => ({
            name: s.sectionName,
            value: categoriesArray
                .filter(c => c.sectionID === s.recordID)
                .reduce((acc, c) => acc + c.amount, 0),
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);

    // Budgeted vs Actual bar chart data (by expense section)
    const barData = sectionsArray
        .filter(s => s.sectionType === 'expense')
        .map(s => {
            const cats = categoriesArray.filter(c => c.sectionID === s.recordID);
            const budgeted = cats.reduce((acc, c) => acc + c.amount, 0);
            const spent = transactionsArray
                .filter(t => cats.some(c => c.recordID === t.categoryID) && t.transactionType === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);
            return { name: s.sectionName, Budgeted: Math.round(budgeted * 100) / 100, Spent: Math.round(spent * 100) / 100 };
        })
        .filter(d => d.Budgeted > 0 || d.Spent > 0);

    // Spending over time (cumulative daily spend for the month)
    const sortedTransactions = [...transactionsArray]
        .filter(t => t.transactionType === 'expense')
        .sort((a, b) => a.transactionDate - b.transactionDate);

    const spendingByDay: { date: string; amount: number }[] = [];
    let cumulative = 0;
    const dayMap = new Map<string, number>();
    sortedTransactions.forEach(t => {
        const day = dayjs(t.transactionDate).format('MMM D');
        cumulative += t.amount;
        dayMap.set(day, cumulative);
    });
    dayMap.forEach((val, key) => {
        spendingByDay.push({ date: key, amount: Math.round(val * 100) / 100 });
    });

    const tooltipStyle = {
        contentStyle: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            color: textColor,
        },
    };

    const renderPieLabel = ({ name, percent }: any) =>
        percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : '';

    return (
        <Box display='flex' flexDirection='column' alignItems='center' sx={{ width: '100%' }}>
            <Grid container spacing={2} sx={{ maxWidth: { xs: 500, md: 1040 }, width: '100%' }}>

                {/* Income Sources Pie */}
                {incomeData.length > 0 && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                            <Typography textAlign='center' color='text.secondary' variant='h6' sx={{ fontWeight: '600', mb: 1 }}>
                                Income Sources
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={incomeData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={90} innerRadius={50} cornerRadius="1%" paddingAngle={2}
                                        label={renderPieLabel} labelLine={false}>
                                        {incomeData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => formatter.format(Number(val))} {...tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            {incomeData.map((d, i) => (
                                <Box key={d.name} display='flex' justifyContent='space-between' sx={{ mx: 1, my: 0.5 }}>
                                    <Box display='flex' alignItems='center' gap={1}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                                        <Typography variant='body2' color='text.secondary'>{d.name}</Typography>
                                    </Box>
                                    <Typography variant='body2' color='text.secondary' fontWeight='bold'>{formatter.format(d.value)}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                )}

                {/* Expense Distribution Pie */}
                {expenseData.length > 0 && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                            <Typography textAlign='center' color='text.secondary' variant='h6' sx={{ fontWeight: '600', mb: 1 }}>
                                Expense Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={90} innerRadius={50} cornerRadius="1%" paddingAngle={2}
                                        label={renderPieLabel} labelLine={false}>
                                        {expenseData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => formatter.format(Number(val))} {...tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            {expenseData.map((d, i) => (
                                <Box key={d.name} display='flex' justifyContent='space-between' sx={{ mx: 1, my: 0.5 }}>
                                    <Box display='flex' alignItems='center' gap={1}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                                        <Typography variant='body2' color='text.secondary'>{d.name}</Typography>
                                    </Box>
                                    <Typography variant='body2' color='text.secondary' fontWeight='bold'>{formatter.format(d.value)}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                )}

                {/* Budgeted vs Actual Bar Chart */}
                {barData.length > 0 && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                            <Typography textAlign='center' color='text.secondary' variant='h6' sx={{ fontWeight: '600', mb: 1 }}>
                                Budgeted vs Spent
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                    <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                                    <YAxis tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                    <Tooltip formatter={(val) => formatter.format(Number(val))} {...tooltipStyle} />
                                    <Legend />
                                    <Bar dataKey="Budgeted" fill="#4c809e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Spent" fill="#D6A058" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                )}

                {/* Cumulative Spending Over Time */}
                {spendingByDay.length > 1 && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                            <Typography textAlign='center' color='text.secondary' variant='h6' sx={{ fontWeight: '600', mb: 1 }}>
                                Spending Over Time
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={spendingByDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e07b7b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#e07b7b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                    <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 12 }} />
                                    <YAxis tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                    <Tooltip formatter={(val) => formatter.format(Number(val))} {...tooltipStyle} />
                                    <Area type="monotone" dataKey="amount" stroke="#e07b7b" fill="url(#spendGradient)" strokeWidth={2} name="Total Spent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                )}

            </Grid>
        </Box>
    );
}
