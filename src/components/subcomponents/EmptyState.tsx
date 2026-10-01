import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: React.ReactNode;
    actionDisabled?: boolean;
    /** Tighter spacing for use inside cards/sidebars. */
    dense?: boolean;
}

/**
 * A friendly, centered empty-state placeholder: icon badge + title + optional
 * description and call-to-action. Used wherever a list or section has no
 * content so blank areas read as intentional rather than broken.
 */
export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    actionIcon,
    actionDisabled = false,
    dense = false,
}: EmptyStateProps) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                px: 2,
                py: dense ? 2 : 4,
                gap: dense ? 0.5 : 1,
            }}
        >
            {icon && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: dense ? 40 : 56,
                        height: dense ? 40 : 56,
                        borderRadius: '50%',
                        mb: 0.5,
                        color: 'text.secondary',
                        bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.05),
                        '& svg': { fontSize: dense ? 22 : 28 },
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography variant={dense ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
                {title}
            </Typography>
            {description && (
                <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 320 }}>
                    {description}
                </Typography>
            )}
            {actionLabel && onAction && (
                <Button
                    variant='contained'
                    color='primary'
                    size={dense ? 'small' : 'medium'}
                    startIcon={actionIcon}
                    onClick={onAction}
                    disabled={actionDisabled}
                    sx={{ mt: 1 }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
}
