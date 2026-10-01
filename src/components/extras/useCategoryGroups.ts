import { useTableStore } from "../../store/tableStore";

export interface CategoryGroupOption {
    sectionName: string;
    id: string;
    label: string;
    remaining: number;
}

/**
 * Builds the grouped category option list used by the transaction category
 * pickers (Add/Edit). Each option carries the category's remaining amount so
 * the dropdown can show how much budget is left. Shared so both modals compute
 * it identically.
 */
export function useCategoryGroups(): CategoryGroupOption[] {
    const categoriesArray = useTableStore(s => s.categories);
    const sectionsArray = useTableStore(s => s.sections);
    const transactionsArr = useTableStore(s => s.transactions);

    return categoriesArray
        .map((option) => {
            const section = sectionsArray.find(x => x.recordID === option.sectionID);
            const sectionName = section?.sectionName ?? "";
            const expenses = transactionsArr
                .filter(x => x.categoryID === option.recordID && x.transactionType === "expense")
                .reduce((a, o) => a + o.amount, 0);
            const incomes = transactionsArr
                .filter(x => x.categoryID === option.recordID && x.transactionType === "income")
                .reduce((a, o) => a + o.amount, 0);
            const tracked = Math.round((incomes - expenses + Number.EPSILON) * 100) / 100;
            const remaining = option.amount + tracked;
            return {
                sectionName,
                id: option.recordID,
                label: option.categoryName,
                remaining: Math.round(remaining * 100) / 100,
            };
        })
        .sort((a, b) => {
            if (a.sectionName < b.sectionName) return -1;
            if (a.sectionName > b.sectionName) return 1;
            return 0;
        });
}
