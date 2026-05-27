import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { supabase } from '../../lib/supabase';
import { useTableStore } from '../../store/tableStore';

interface HistoricalAmounts {
    oneMonthAgo: number | null;
    oneYearAgo: number | null;
    loading: boolean;
}

/**
 * Fetches the budgeted amount for a category (by name) from 1 month ago and 1 year ago.
 * Returns null for a period if no matching category was found.
 */
export function useHistoricalBudget(categoryName: string | undefined, enabled: boolean): HistoricalAmounts {
    const currentBudget = useTableStore(s => s.currentBudgetAndMonth);
    const [oneMonthAgo, setOneMonthAgo] = useState<number | null>(null);
    const [oneYearAgo, setOneYearAgo] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled || !categoryName) {
            setOneMonthAgo(null);
            setOneYearAgo(null);
            return;
        }

        let cancelled = false;

        async function fetchHistorical() {
            setLoading(true);
            try {
                const currentDate = dayjs(`${currentBudget.month} 1, ${currentBudget.year}`);
                const oneMonthBack = currentDate.subtract(1, 'month');
                const oneYearBack = currentDate.subtract(12, 'month');

                const periods = [
                    { month: oneMonthBack.format('MMMM'), year: oneMonthBack.year() },
                    { month: oneYearBack.format('MMMM'), year: oneYearBack.year() },
                ];

                const results: (number | null)[] = [null, null];

                for (let i = 0; i < periods.length; i++) {
                    const { month, year } = periods[i];

                    // Find sections for this budget/month/year
                    const { data: sections } = await supabase
                        .from('sections')
                        .select('recordID')
                        .eq('budgetID', currentBudget.budgetID)
                        .eq('sectionMonth', month)
                        .eq('sectionYear', year);

                    if (!sections || sections.length === 0) continue;

                    // Find category with matching name in those sections
                    const { data: categories } = await supabase
                        .from('categories')
                        .select('amount')
                        .eq('categoryName', categoryName)
                        .in('sectionID', sections.map((s: any) => s.recordID));

                    if (categories && categories.length > 0) {
                        // Sum in case there are multiple matches (unlikely but safe)
                        results[i] = categories.reduce((acc: number, c: any) => acc + c.amount, 0);
                    }
                }

                if (!cancelled) {
                    setOneMonthAgo(results[0]);
                    setOneYearAgo(results[1]);
                }
            } catch (err) {
                console.error('Error fetching historical budget:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchHistorical();
        return () => { cancelled = true; };
    }, [categoryName, enabled, currentBudget.budgetID, currentBudget.month, currentBudget.year]);

    return { oneMonthAgo, oneYearAgo, loading };
}
