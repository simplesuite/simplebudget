import React from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import { useTableStore } from '../store/tableStore';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import dayjs from 'dayjs';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area, LineChart, Line,
} from 'recharts';
import { supabase } from '../lib/supabase';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const COLORS = ['#4c809e', '#D6A058', '#6bbf8a', '#e07b7b', '#9b7fd4', '#e0a84c', '#5cc2c7', '#d4708f', '#8aad5e', '#c9884c'];

// --- This Month Tab ---
function ThisMonthTab() {
    const categoriesArray = useTableStore(s => s.categories);
    const sectionsArray = useTableStore(s => s.sections);
    const transactionsArray = useTableStore(s => s.transactions);
    const theme = useTheme();
    const textColor = theme.palette.text.secondary;

    const incomeData = categoriesArray
        .filter(c => sectionsArray.find(s => s.recordID === c.sectionID)?.sectionType === 'income')
        .filter(c => c.amount > 0)
        .map(c => ({ name: c.categoryName, value: c.amount }))
        .sort((a, b) => b.value - a.value);

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

    const renderPieLabel = ({ name, value }: any) =>
        value > 0 ? `${name} ${formatter.format(value)}` : '';

    return (
        <Grid container spacing={2} sx={{ maxWidth: { xs: 500, md: 1040 }, width: '100%' }}>
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
    );
}

// --- Trends Tab ---
interface MonthData {
    month: string;
    year: number;
    totalSpent: number;
    totalIncome: number;
    categorySpending: Map<string, number>; // keyed by category NAME
}

function TrendsTab() {
    const currentBudget = useTableStore(s => s.currentBudgetAndMonth);
    const theme = useTheme();
    const textColor = theme.palette.text.secondary;

    const [loading, setLoading] = React.useState(true);
    const [monthsData, setMonthsData] = React.useState<MonthData[]>([]);

    const tooltipStyle = {
        contentStyle: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            color: textColor,
        },
    };

    React.useEffect(() => {
        fetchTrendData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBudget.budgetID, currentBudget.month, currentBudget.year]);

    async function fetchTrendData() {
        setLoading(true);
        try {
            const currentDate = dayjs(`${currentBudget.month} 1, ${currentBudget.year}`);
            // We need: this month, last month, and 12 months ago (plus months in between for 3-month category trend)
            const monthsToFetch = [
                { month: currentDate.format('MMMM'), year: currentDate.year() },
                { month: currentDate.subtract(1, 'month').format('MMMM'), year: currentDate.subtract(1, 'month').year() },
                { month: currentDate.subtract(2, 'month').format('MMMM'), year: currentDate.subtract(2, 'month').year() },
                { month: currentDate.subtract(12, 'month').format('MMMM'), year: currentDate.subtract(12, 'month').year() },
            ];

            // Remove duplicates
            const unique = monthsToFetch.filter((m, i, arr) =>
                arr.findIndex(x => x.month === m.month && x.year === m.year) === i
            );

            const results: MonthData[] = [];

            for (const { month, year } of unique) {
                // Fetch ALL sections for this month (income + expense)
                const { data: allSections } = await supabase
                    .from('sections')
                    .select()
                    .eq('budgetID', currentBudget.budgetID)
                    .eq('sectionMonth', month)
                    .eq('sectionYear', year);

                if (!allSections || allSections.length === 0) {
                    results.push({ month, year, totalSpent: 0, totalIncome: 0, categorySpending: new Map() });
                    continue;
                }

                const expenseSections = allSections.filter((s: any) => s.sectionType === 'expense');
                const incomeSections = allSections.filter((s: any) => s.sectionType === 'income');

                // Fetch categories for all sections
                const { data: categories } = await supabase
                    .from('categories')
                    .select()
                    .in('sectionID', allSections.map((s: any) => s.recordID));

                if (!categories || categories.length === 0) {
                    results.push({ month, year, totalSpent: 0, totalIncome: 0, categorySpending: new Map() });
                    continue;
                }

                const expenseCatIds = new Set(
                    categories
                        .filter((c: any) => expenseSections.some((s: any) => s.recordID === c.sectionID))
                        .map((c: any) => c.recordID)
                );
                const incomeCatIds = new Set(
                    categories
                        .filter((c: any) => incomeSections.some((s: any) => s.recordID === c.sectionID))
                        .map((c: any) => c.recordID)
                );

                // Build a map from category ID -> category name for expense categories
                const idToName = new Map<string, string>();
                categories.forEach((c: any) => {
                    if (expenseCatIds.has(c.recordID)) {
                        idToName.set(c.recordID, c.categoryName);
                    }
                });

                // Fetch transactions for all categories
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select()
                    .in('categoryID', categories.map((c: any) => c.recordID));

                // Aggregate spending by category NAME and compute totals
                const categorySpending = new Map<string, number>();
                let totalSpent = 0;
                let totalIncome = 0;

                (transactions || []).forEach((t: any) => {
                    if (t.transactionType === 'expense' && expenseCatIds.has(t.categoryID)) {
                        totalSpent += t.amount;
                        const catName = idToName.get(t.categoryID) || 'Unknown';
                        const current = categorySpending.get(catName) || 0;
                        categorySpending.set(catName, current + t.amount);
                    } else if (t.transactionType === 'income' && incomeCatIds.has(t.categoryID)) {
                        totalIncome += t.amount;
                    }
                });

                results.push({
                    month,
                    year,
                    totalSpent: Math.round(totalSpent * 100) / 100,
                    totalIncome: Math.round(totalIncome * 100) / 100,
                    categorySpending,
                });
            }

            setMonthsData(results);
        } catch (err) {
            console.error('Error fetching trend data:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Box display='flex' justifyContent='center' py={4}>
                <Typography color='text.secondary'>Loading trends...</Typography>
            </Box>
        );
    }

    const currentDate = dayjs(`${currentBudget.month} 1, ${currentBudget.year}`);
    const thisMonth = monthsData.find(m => m.month === currentDate.format('MMMM') && m.year === currentDate.year());
    const lastMonth = monthsData.find(m => m.month === currentDate.subtract(1, 'month').format('MMMM') && m.year === currentDate.subtract(1, 'month').year());
    const twoMonthsAgo = monthsData.find(m => m.month === currentDate.subtract(2, 'month').format('MMMM') && m.year === currentDate.subtract(2, 'month').year());
    const oneYearAgo = monthsData.find(m => m.month === currentDate.subtract(12, 'month').format('MMMM') && m.year === currentDate.subtract(12, 'month').year());

    // Month vs Last Month comparison chart
    const vsLastMonthData = [
        { name: currentDate.subtract(1, 'month').format('MMM YYYY'), Income: lastMonth?.totalIncome || 0, Expenses: lastMonth?.totalSpent || 0 },
        { name: currentDate.format('MMM YYYY'), Income: thisMonth?.totalIncome || 0, Expenses: thisMonth?.totalSpent || 0 },
    ];

    // Month vs 1 Year Ago comparison chart
    const vsYearAgoData = [
        { name: currentDate.subtract(12, 'month').format('MMM YYYY'), Income: oneYearAgo?.totalIncome || 0, Expenses: oneYearAgo?.totalSpent || 0 },
        { name: currentDate.format('MMM YYYY'), Income: thisMonth?.totalIncome || 0, Expenses: thisMonth?.totalSpent || 0 },
    ];

    // Category spending over past 3 months (keyed by category name)
    const allCategoryNames = new Set<string>();
    [twoMonthsAgo, lastMonth, thisMonth].forEach(m => {
        m?.categorySpending.forEach((_, name) => allCategoryNames.add(name));
    });

    const categoryTrendData = [
        { month: currentDate.subtract(2, 'month').format('MMM'), ...Object.fromEntries([...allCategoryNames].map(name => [name, twoMonthsAgo?.categorySpending.get(name) || 0])) },
        { month: currentDate.subtract(1, 'month').format('MMM'), ...Object.fromEntries([...allCategoryNames].map(name => [name, lastMonth?.categorySpending.get(name) || 0])) },
        { month: currentDate.format('MMM'), ...Object.fromEntries([...allCategoryNames].map(name => [name, thisMonth?.categorySpending.get(name) || 0])) },
    ];

    // Generate insight text for categories
    const categoryInsights: { name: string; change: number; direction: 'up' | 'down' | 'same' }[] = [];
    allCategoryNames.forEach(name => {
        const thisMonthAmt = thisMonth?.categorySpending.get(name) || 0;
        const lastMonthAmt = lastMonth?.categorySpending.get(name) || 0;
        // Skip categories that only exist in the current month (new categories)
        if (lastMonthAmt === 0) return;
        if (thisMonthAmt > 0) {
            const amtChange = Math.round((thisMonthAmt - lastMonthAmt) * 100) / 100;
            if (amtChange !== 0) {
                categoryInsights.push({ name, change: amtChange, direction: amtChange > 0 ? 'up' : 'down' });
            }
        }
    });
    categoryInsights.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    // Top category names for the line chart (limit to top 6 to keep it readable)
    const topCategories = [...allCategoryNames]
        .map(name => ({ name, total: (thisMonth?.categorySpending.get(name) || 0) + (lastMonth?.categorySpending.get(name) || 0) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);

    const hasVsLastMonth = (lastMonth?.totalSpent || 0) > 0 || (lastMonth?.totalIncome || 0) > 0 || (thisMonth?.totalSpent || 0) > 0 || (thisMonth?.totalIncome || 0) > 0;
    const hasVsYearAgo = (oneYearAgo?.totalSpent || 0) > 0 || (oneYearAgo?.totalIncome || 0) > 0 || (thisMonth?.totalSpent || 0) > 0 || (thisMonth?.totalIncome || 0) > 0;
    const hasCategoryTrend = topCategories.length > 0;

    if (!hasVsLastMonth && !hasVsYearAgo && !hasCategoryTrend) {
        return (
            <Box display='flex' justifyContent='center' py={4}>
                <Typography color='text.secondary'>Not enough historical data to show trends yet.</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={2} sx={{ maxWidth: { xs: 500, md: 1040 }, width: '100%' }}>
            {/* This Month vs Last Month */}
            {hasVsLastMonth && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                        <Typography textAlign='center' color='text.secondary' variant='h6' sx={{ fontWeight: '600', mb: 1 }}>
                            This Month vs Last Month
                        </Typography>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={vsLastMonthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                                <YAxis tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                <Tooltip formatter={(val) => formatter.format(Number(val))} {...tooltipStyle} />
                                <Legend />
                                <Bar dataKey="Income" fill="#6bbf8a" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expenses" fill="#e07b7b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        {lastMonth && thisMonth && lastMonth.totalSpent > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    size="small"
                                    icon={thisMonth.totalSpent > lastMonth.totalSpent ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label={`Expenses ${thisMonth.totalSpent > lastMonth.totalSpent ? '+' : ''}${formatter.format(thisMonth.totalSpent - lastMonth.totalSpent)}`}
                                    color={thisMonth.totalSpent > lastMonth.totalSpent ? 'warning' : 'success'}
                                    variant="outlined"
                                />
                                {lastMonth.totalIncome > 0 && (
                                    <Chip
                                        size="small"
                                        icon={thisMonth.totalIncome >= lastMonth.totalIncome ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                        label={`Income ${thisMonth.totalIncome >= lastMonth.totalIncome ? '+' : ''}${formatter.format(thisMonth.totalIncome - lastMonth.totalIncome)}`}
                                        color={thisMonth.totalIncome >= lastMonth.totalIncome ? 'success' : 'warning'}
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            )}

            {/* This Month vs 1 Year Ago */}
            {hasVsYearAgo && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                        <Typography textAlign='center' color='text.secondary' variant='h6' sx={{ fontWeight: '600', mb: 1 }}>
                            This Month vs 1 Year Ago
                        </Typography>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={vsYearAgoData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} />
                                <YAxis tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                <Tooltip formatter={(val) => formatter.format(Number(val))} {...tooltipStyle} />
                                <Legend />
                                <Bar dataKey="Income" fill="#6bbf8a" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Expenses" fill="#e07b7b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        {oneYearAgo && thisMonth && oneYearAgo.totalSpent > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    size="small"
                                    icon={thisMonth.totalSpent > oneYearAgo.totalSpent ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label={`Expenses ${thisMonth.totalSpent > oneYearAgo.totalSpent ? '+' : ''}${formatter.format(thisMonth.totalSpent - oneYearAgo.totalSpent)}`}
                                    color={thisMonth.totalSpent > oneYearAgo.totalSpent ? 'warning' : 'success'}
                                    variant="outlined"
                                />
                                {oneYearAgo.totalIncome > 0 && (
                                    <Chip
                                        size="small"
                                        icon={thisMonth.totalIncome >= oneYearAgo.totalIncome ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                        label={`Income ${thisMonth.totalIncome >= oneYearAgo.totalIncome ? '+' : ''}${formatter.format(thisMonth.totalIncome - oneYearAgo.totalIncome)}`}
                                        color={thisMonth.totalIncome >= oneYearAgo.totalIncome ? 'success' : 'warning'}
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            )}

            {/* Category Spending Trend (3 months) */}
            {hasCategoryTrend && (
                <Grid size={{ xs: 12 }}>
                    <Paper elevation={4} sx={{ borderRadius: 3, p: 2 }}>
                        <Typography textAlign='center' color='text.secondary' variant='h6' sx={{ fontWeight: '600', mb: 1 }}>
                            Category Spending (Past 3 Months)
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={categoryTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} />
                                <YAxis tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                                <Tooltip formatter={(val) => formatter.format(Number(val))} {...tooltipStyle} />
                                <Legend />
                                {topCategories.map((cat, i) => (
                                    <Line
                                        key={cat.name}
                                        type="monotone"
                                        dataKey={cat.name}
                                        stroke={COLORS[i % COLORS.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>

                        {/* Category insights */}
                        {categoryInsights.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1, fontWeight: 600 }}>
                                    Insights
                                </Typography>
                                {categoryInsights.slice(0, 5).map((insight) => (
                                    <Box key={insight.name} display='flex' alignItems='center' gap={1} sx={{ my: 0.5 }}>
                                        {insight.direction === 'up'
                                            ? <TrendingUpIcon fontSize='small' color='warning' />
                                            : <TrendingDownIcon fontSize='small' color='success' />
                                        }
                                        <Typography variant='body2' color='text.secondary'>
                                            You spent <strong>{formatter.format(Math.abs(insight.change))} {insight.direction === 'up' ? 'more' : 'less'}</strong> on <strong>{insight.name}</strong> this month than last month
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            )}
        </Grid>
    );
}

// --- Main Page ---
export default function AnalyticsPage() {
    const [tab, setTab] = React.useState(0);

    React.useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <Box display='flex' flexDirection='column' alignItems='center' sx={{ width: '100%' }}>
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ mb: 2 }}
            >
                <Tab label="This Month" />
                <Tab label="Trends" />
            </Tabs>

            {tab === 0 && <ThisMonthTab />}
            {tab === 1 && <TrendsTab />}
        </Box>
    );
}
