import { supabase } from "../../lib/supabase";
import { useGlobalStore } from "../../store/globalStore";

/**
 * Ensures the public.users record exists for the current authenticated user.
 * If the record doesn't exist (e.g. user confirmed email but never went through login),
 * it creates one. Also populates the global store if needed.
 * 
 * Returns true if the user record is confirmed to exist, false otherwise.
 */
export async function ensureUserRecord(): Promise<boolean> {
    const { currentUser, setCurrentUser } = useGlobalStore.getState();

    // If we already have a recordID in the store, we're good
    if (currentUser.recordID) return true;

    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const userId = session.user.id;
    const fullName = session.user.user_metadata?.full_name || '';

    // Check if public.users record exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('fullName,userType')
        .eq('recordID', userId)
        .maybeSingle();

    if (existingUser) {
        setCurrentUser({
            recordID: userId,
            fullName: existingUser.fullName,
            userType: existingUser.userType,
        });
        localStorage.setItem('fullName', existingUser.fullName || '');
        return true;
    }

    // Create the record
    const { error } = await supabase
        .from('users')
        .insert({
            recordID: userId,
            fullName: fullName,
            userType: 'free',
        });

    if (error) {
        console.error('ensureUserRecord: failed to create public.users record:', error.message);
        return false;
    }

    setCurrentUser({
        recordID: userId,
        fullName: fullName,
        userType: 'free',
    });
    localStorage.setItem('fullName', fullName);
    return true;
}
