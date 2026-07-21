import { supabase } from './supabase';

/**
 * Searches public.users by name or email (case-insensitive, partial match).
 * Returns up to 10 matching users excluding the current user.
 */
export async function searchUsers(
    query: string,
    currentUserID: string
): Promise<{ recordID: string; fullName: string; email: string }[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const { data, error } = await supabase
        .from('users')
        .select('recordID, fullName, email')
        .neq('recordID', currentUserID)
        .or(`fullName.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
        .limit(10);

    if (error || !data) {
        return [];
    }

    return data.map((u) => ({
        recordID: u.recordID,
        fullName: u.fullName || '',
        email: u.email || '',
    }));
}

/**
 * Returns users the current user has previously shared budgets with.
 * Fetches distinct sharedToIDs from the 'shared' table and resolves user details.
 */
export async function getRecentlySharedWithUsers(
    currentUserID: string
): Promise<{ recordID: string; fullName: string; email: string }[]> {
    // The 'shared' table uses budgetID which is owned by the current user
    // We need to find all budgets owned by this user, then get shared records
    const { data: budgets } = await supabase
        .from('budgets')
        .select('recordID')
        .eq('creatorID', currentUserID);

    if (!budgets || budgets.length === 0) return [];

    const budgetIDs = budgets.map((b) => b.recordID);
    const { data: shareRecords } = await supabase
        .from('shared')
        .select('sharedToID')
        .in('budgetID', budgetIDs);

    if (!shareRecords || shareRecords.length === 0) return [];

    const ids = new Set<string>();
    shareRecords.forEach((s) => ids.add(s.sharedToID));

    const { data: users, error } = await supabase
        .from('users')
        .select('recordID, fullName, email')
        .in('recordID', Array.from(ids));

    if (error || !users) return [];

    return users.map((u) => ({
        recordID: u.recordID,
        fullName: u.fullName || '',
        email: u.email || '',
    }));
}
