import { create } from "zustand";
import { createTheme, type Theme } from "@mui/material/styles";
// Registers x-date-pickers component slots (e.g. MuiPickersOutlinedInput) onto
// the MUI theme `components` type so we can style the DatePicker inputs below.
import type { } from "@mui/x-date-pickers/themeAugmentation";
import { getSupabaseStorageKey } from "../lib/supabase";

// Brand colors — unchanged. simpleBudget keeps its own theme color.
export const primaryMain = '#4c809e';
export const secondaryMain = '#D6A058';

/**
 * Neutral surface/outline design tokens, mirroring simpleTracker's theming
 * approach. These are color-agnostic grays that give the flat, modern look
 * (soft backgrounds, muted text, subtle outlined cards) without touching the
 * brand primary/secondary colors above.
 */
interface UiThemeTokens {
    background: string;
    surface: string;
    onSurface: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
}

const lightTokens: UiThemeTokens = {
    background: '#f8fafc',
    surface: '#ffffff',
    onSurface: '#0f172a',
    onSurfaceVariant: '#64748b',
    outline: '#cbd5e1',
    outlineVariant: '#e2e8f0',
};

const darkTokens: UiThemeTokens = {
    background: '#161719',
    surface: '#202023',
    onSurface: '#f8fafc',
    onSurfaceVariant: '#94a3b8',
    outline: '#475569',
    outlineVariant: '#334155',
};

/**
 * Build an MUI theme from the neutral surface tokens so simpleBudget matches
 * simpleTracker's look. Mapping the semantic token roles into the MUI palette
 * (text.primary, text.secondary, divider, background.paper, etc.) propagates
 * the styling across every component that reads standard theme roles — cards,
 * textfields, and the bottom navigation — without touching individual files.
 * The brand primary/secondary colors are preserved.
 */
const createTokenTheme = (mode: 'light' | 'dark', tokens: UiThemeTokens): Theme =>
    createTheme({
        palette: {
            mode,
            primary: { main: primaryMain },
            secondary: { main: secondaryMain },
            background: {
                default: tokens.background,
                paper: tokens.surface,
            },
            text: {
                primary: tokens.onSurface,
                secondary: tokens.onSurfaceVariant,
            },
            divider: tokens.outlineVariant,
        },
        shape: {
            // Keep simpleBudget's original base radius (4). Many Paper elements
            // use sx borderRadius multipliers (e.g. borderRadius: 3 => 12px) that
            // were tuned against this base, so raising it makes them look huge.
            // Cards opt into the softer 12px radius explicitly below.
            borderRadius: 4,
        },
        components: {
            MuiAutocomplete: {
                styleOverrides: { popper: { zIndex: 1500 } },
            },
            // Flat, bordered cards with a subtle neutral outline (no shadow).
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        // Round only the date-picker popup surface, not every
                        // Paper (budget-page Paper multipliers stay unaffected).
                        '&.MuiPickerPopper-paper': {
                            borderRadius: 16,
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        border: `1px solid ${tokens.outlineVariant}`,
                        boxShadow: 'none',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        // Match simpleTracker's mobile `rounded-2xl` (1rem = 16px).
                        borderRadius: 16,
                        textTransform: 'none',
                        fontWeight: 700,
                    },
                },
            },
            // Rounder text fields / inputs, independent of the modest global
            // base radius so Paper multipliers stay tidy while inputs stay soft.
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
            MuiFilledInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        overflow: 'hidden',
                    },
                },
            },
            // x-date-pickers v8 renders its own input components (not the core
            // MuiOutlinedInput/MuiFilledInput), so they need matching radius
            // overrides to keep DatePicker fields as round as the rest.
            MuiPickersOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
            MuiPickersFilledInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        overflow: 'hidden',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 999,
                    },
                },
            },
            MuiSwitch: {
                styleOverrides: {
                    root: {
                        width: 42,
                        height: 24,
                        padding: 0,
                    },
                    switchBase: {
                        padding: 2,
                        '&.Mui-checked': {
                            transform: 'translateX(18px)',
                            color: '#fff',
                            '& + .MuiSwitch-track': {
                                opacity: 1,
                                backgroundColor: primaryMain,
                            },
                        },
                    },
                    thumb: {
                        width: 20,
                        height: 20,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    },
                    track: {
                        borderRadius: 12,
                        opacity: 1,
                        backgroundColor: 'rgba(150,150,150,0.3)',
                        transition: 'background-color 0.2s ease',
                    },
                },
            },
        },
    });

export const themes = {
    darkTheme: createTokenTheme('dark', darkTokens),
    lightTheme: createTokenTheme('light', lightTokens),
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
        borderRadius: 16,
        borderColor: darkTokens.outlineVariant,
        borderStyle: 'solid',
        borderWidth: 1.4,
        borderLeftWidth: 5,
        borderRightWidth: 5,
    },
};
