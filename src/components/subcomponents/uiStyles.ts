import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Shared card styling tokens so every surface in the app speaks the same
 * visual language: one radius, one elevation, one hover treatment.
 *
 * Usage:
 *   <Paper elevation={CARD_ELEVATION} sx={cardSx}>
 *   <Paper elevation={CARD_ELEVATION} sx={interactiveCardSx}>  // adds hover lift
 */
export const CARD_ELEVATION = 3;
export const CARD_RADIUS = 3; // theme spacing multiplier => 12px

export const cardSx: SxProps<Theme> = {
    borderRadius: CARD_RADIUS,
};

/** Card that reacts to hover/press — use for clickable surfaces. */
export const interactiveCardSx: SxProps<Theme> = {
    borderRadius: CARD_RADIUS,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 6,
    },
    '&:active': {
        transform: 'translateY(0)',
    },
};

/** Subtle hover highlight for list rows / ListItemButtons. */
export const rowHoverSx: SxProps<Theme> = {
    transition: 'background-color 0.15s ease',
    '&:hover': {
        backgroundColor: 'action.hover',
    },
};
