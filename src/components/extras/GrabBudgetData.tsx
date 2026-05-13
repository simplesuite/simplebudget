import { useTableStore } from "../../store/tableStore";
import { useGlobalStore } from "../../store/globalStore";
import {
    supaCategories,
    supaSections,
    supaTransactions,
    supaTransactionsFromCategories
} from './api_functions';
import { supabase } from "../../lib/supabase";

export default function useGrabBudgetData() {
    const setSections = useTableStore(s => s.setSections);
    const setLoadingOpen = useGlobalStore(s => s.setMainLoading);
    const setCategories = useTableStore(s => s.setCategories);
    const setTransactions = useTableStore(s => s.setTransactions);
    const currentUserData = useGlobalStore(s => s.currentUser);
    const setCurrentUser = useGlobalStore(s => s.setCurrentUser);

    async function refreshUserProfile() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select()
                .eq('recordID', currentUserData.recordID)
                .single();
            if (error) {
                console.error('Error fetching user profile:', error.message);
                return;
            }
            if (data) {
                setCurrentUser({
                    recordID: currentUserData.recordID,
                    fullName: data.fullName,
                    userType: data.userType,
                });
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    }

    async function grabBudgetData(budgetID: string, year: number, month: string) {
        setLoadingOpen(true);

        // If offline, load from localStorage cache
        if (!navigator.onLine) {
            loadCachedBudgetData();
            setLoadingOpen(false);
            return;
        }

        try {
            // Refresh user profile
            await refreshUserProfile();

            // Fetch sections
            const allSections = await supaSections(budgetID, month, year);
            if (!allSections || allSections.length === 0) {
                setSections([]);
                setCategories([]);
                setTransactions([]);
                cacheBudgetData([], [], []);
                return;
            }
            setSections(allSections);

            // Fetch categories
            const allCategories = await supaCategories(allSections.map(x => x.recordID));
            if (!allCategories || allCategories.length === 0) {
                setCategories([]);
                setTransactions([]);
                cacheBudgetData(allSections, [], []);
                return;
            }
            setCategories(allCategories);

            // Fetch transactions — both categorized and uncategorized
            const [noCategoryTransactions, categorizedTransactions] = await Promise.all([
                supaTransactions(budgetID),
                supaTransactionsFromCategories(allCategories.map(x => x.recordID)),
            ]);

            const allTransactions = [
                ...(categorizedTransactions || []),
                ...(noCategoryTransactions || []),
            ];
            setTransactions(allTransactions);

            // Cache for offline use
            cacheBudgetData(allSections, allCategories, allTransactions);
        } catch (error) {
            console.error('Error fetching budget data:', error);
            // Fallback to cache on network failure
            loadCachedBudgetData();
        } finally {
            setLoadingOpen(false);
        }
    }

    function cacheBudgetData(sections: any[], categories: any[], transactions: any[]) {
        try {
            localStorage.setItem('cachedSections', JSON.stringify(sections));
            localStorage.setItem('cachedCategories', JSON.stringify(categories));
            localStorage.setItem('cachedTransactions', JSON.stringify(transactions));
        } catch (e) {
            console.warn('Failed to cache budget data:', e);
        }
    }

    function loadCachedBudgetData() {
        try {
            const sections = JSON.parse(localStorage.getItem('cachedSections') || '[]');
            const categories = JSON.parse(localStorage.getItem('cachedCategories') || '[]');
            const transactions = JSON.parse(localStorage.getItem('cachedTransactions') || '[]');
            setSections(sections);
            setCategories(categories);
            setTransactions(transactions);
        } catch (e) {
            console.warn('Failed to load cached budget data:', e);
        }
    }

    return { grabBudgetData, refreshUserProfile, loadCachedBudgetData };
}
