import { create } from "zustand";
import { createTheme } from "@mui/material/styles";
import { getSupabaseStorageKey } from "../lib/supabase";

export const primaryMain = '#4c809e';
export const secondaryMain = '#D6A058';

export const themes = {
    darkTheme: createTheme({
        palette: {
            mode: 'dark',
            primary: { main: primaryMain },
            secondary: { main: secondaryMain },
        },
        components: {
            MuiAutocomplete: {
                styleOverrides: { popper: { zIndex: 1500 } },
            },
        },
    }),
    lightTheme: createTheme({
        palette: {
            mode: 'light',
            primary: { main: primaryMain },
            secondary: { main: secondaryMain },
        },
        components: {
            MuiAutocomplete: {
                styleOverrides: { popper: { zIndex: 1500 } },
            },
        },
    }),
};

if (localStorage.getItem("userTheme") === null) {
    localStorage.setItem("userTheme", "dark");
}

let user: any;
let auth: string;
try {
    const storageKey = getSupabaseStorageKey();
    const raw = localStorage.getItem(storageKey);
    if (raw) {
        const parsed = JSON.parse(raw);
        user = parsed?.user ?? null;
        // In newer supabase-js, user may be stored separately at <key>-user
        if (!user) {
            const userRaw = localStorage.getItem(storageKey + '-user');
            if (userRaw) {
                const userParsed = JSON.parse(userRaw);
                user = userParsed?.user ?? null;
            }
        }
    }
} catch {
    user = null;
}

if (user && user.aud === 'authenticated') {
    auth = 'true';
} else {
    user = { id: '' };
    auth = 'false';
}

interface GlobalState {
    themeAtom: string | null;
    setThemeAtom: (val: string | null) => void;
    snackBarText: string;
    setSnackBarText: (val: string) => void;
    snackBarSeverity: string;
    setSnackBarSeverity: (val: string) => void;
    snackBarOpen: boolean;
    setSnackBarOpen: (val: boolean) => void;
    authAtom: string;
    setAuthAtom: (val: string) => void;
    currentUser: { recordID: string; fullName: string | null; userType: string };
    setCurrentUser: (val: { recordID: string; fullName: string | null; userType: string }) => void;
    mainLoading: boolean;
    setMainLoading: (val: boolean) => void;
    areYouSureTitle: string;
    setAreYouSureTitle: (val: string) => void;
    areYouSureDetails: string;
    setAreYouSureDetails: (val: string) => void;
    areYouSureAccept: boolean;
    setAreYouSureAccept: (val: boolean) => void;
    addTransactionCategory: any;
    setAddTransactionCategory: (val: any) => void;
    addTransactionType: any;
    setAddTransactionType: (val: any) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
    themeAtom: localStorage.getItem("userTheme"),
    setThemeAtom: (val) => set({ themeAtom: val }),
    snackBarText: 'message',
    setSnackBarText: (val) => set({ snackBarText: val }),
    snackBarSeverity: 'success',
    setSnackBarSeverity: (val) => set({ snackBarSeverity: val }),
    snackBarOpen: false,
    setSnackBarOpen: (val) => set({ snackBarOpen: val }),
    authAtom: auth,
    setAuthAtom: (val) => set({ authAtom: val }),
    currentUser: {
        recordID: user.id || '',
        fullName: localStorage.getItem('fullName'),
        userType: 'free',
    },
    setCurrentUser: (val) => set({ currentUser: val }),
    mainLoading: false,
    setMainLoading: (val) => set({ mainLoading: val }),
    areYouSureTitle: 'Title',
    setAreYouSureTitle: (val) => set({ areYouSureTitle: val }),
    areYouSureDetails: 'Details',
    setAreYouSureDetails: (val) => set({ areYouSureDetails: val }),
    areYouSureAccept: false,
    setAreYouSureAccept: (val) => set({ areYouSureAccept: val }),
    addTransactionCategory: null,
    setAddTransactionCategory: (val) => set({ addTransactionCategory: val }),
    addTransactionType: 'expense',
    setAddTransactionType: (val) => set({ addTransactionType: val }),
}));

export const appName = 'simpleBudget';

export const dialogPaperStyles = {
    style: {
        bgColor: 'background.paper',
        borderRadius: 15,
        borderColor: '#424242',
        borderStyle: 'solid',
        borderWidth: 1.4,
        borderLeftWidth: 5,
        borderRightWidth: 5,
    },
};
