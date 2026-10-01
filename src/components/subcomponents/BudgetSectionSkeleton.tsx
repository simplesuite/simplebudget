import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { CARD_ELEVATION, cardSx } from './uiStyles';

/**
 * Placeholder card shown while budget data is loading, mirroring the shape of a
 * real BudgetSection (header + a few category rows) so the layout doesn't jump.
 */
export default function BudgetSectionSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <Paper elevation={CARD_ELEVATION} sx={{ ...cardSx, width: '100%' }}>
            <Box sx={{ p: 2 }}>
                {/* Header */}
                <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
                    <Skeleton variant='text' width='40%' height={28} />
                    <Skeleton variant='rounded' width={90} height={24} sx={{ borderRadius: 999 }} />
                </Box>
                {/* Rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <Box key={i} sx={{ mb: i < rows - 1 ? 1.5 : 0 }}>
                        <Box display='flex' justifyContent='space-between'>
                            <Skeleton variant='text' width='35%' />
                            <Skeleton variant='text' width='20%' />
                        </Box>
                        <Skeleton variant='text' width='50%' sx={{ fontSize: '0.75rem' }} />
                        <Skeleton variant='rounded' width='100%' height={6} sx={{ borderRadius: 5, mt: 0.5 }} />
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}
