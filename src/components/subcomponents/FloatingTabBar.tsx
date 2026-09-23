import * as React from 'react';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaidIcon from '@mui/icons-material/Paid';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

type TabDef = {
    label: string;
    to: string;
    match: RegExp;
    icon: React.ReactNode;
};

interface FloatingTabBarProps {
    /** Count of uncategorized transactions, shown as a badge on the Transactions tab. */
    unCategorized?: number;
}

/**
 * Web counterpart to simpleTracker's FloatingTabBar: an absolutely-positioned,
 * frosted, rounded pill bar. A single primary "pill" indicator slides
 * horizontally to the active tab. Icons/labels cross-fade between the active
 * (on-primary) and inactive (muted secondary) colors. Colors come from the
 * shared MUI theme, so this respects simpleBudget's own brand color.
 */
export default function FloatingTabBar({ unCategorized = 0 }: FloatingTabBarProps) {
    const location = useLocation();

    const tabs: TabDef[] = React.useMemo(
        () => [
            { label: 'Budget', to: '/budget', match: /^\/budget/, icon: <DashboardIcon sx={{ fontSize: 22 }} /> },
            {
                label: 'Transactions',
                to: '/transactions',
                match: /^\/transactions/,
                icon: (
                    <Badge badgeContent={unCategorized} color="secondary">
                        <PaidIcon sx={{ fontSize: 22 }} />
                    </Badge>
                ),
            },
            { label: 'Analytics', to: '/analytics', match: /^\/analytics/, icon: <AssessmentIcon sx={{ fontSize: 22 }} /> },
            { label: 'Settings', to: '/settings', match: /^\/settings/, icon: <SettingsIcon sx={{ fontSize: 22 }} /> },
        ],
        [unCategorized],
    );

    const activeIndex = Math.max(
        0,
        tabs.findIndex((tab) => tab.match.test(location.pathname)),
    );
    const hasActive = tabs.some((tab) => tab.match.test(location.pathname));

    return (
        <Box
            sx={{
                position: 'fixed',
                left: 12,
                right: 12,
                bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
                zIndex: (theme) => theme.zIndex.appBar,
                mx: 'auto',
                maxWidth: 600,
                borderRadius: '30px',
                border: '1px solid',
                borderColor: 'divider',
                p: 0.5,
                display: 'flex',
                gap: 0.5,
                backdropFilter: 'blur(12px)',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                        ? 'rgba(32, 32, 35, 0.82)'
                        : 'rgba(255, 255, 255, 0.9)',
                boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                        ? '0 4px 12px rgba(0, 0, 0, 0.24)'
                        : '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
        >
            {/* Sliding active-tab indicator. Positioned over one tab's width and
                translated horizontally to the active index. */}
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 4,
                    width: `calc((100% - 8px - ${(tabs.length - 1) * 4}px) / ${tabs.length})`,
                    borderRadius: '30px',
                    bgcolor: 'primary.main',
                    opacity: hasActive ? 1 : 0,
                    transform: `translateX(calc(${activeIndex} * (100% + 4px)))`,
                    transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease',
                    pointerEvents: 'none',
                }}
            />
            {tabs.map((tab) => {
                const active = tab.match.test(location.pathname);
                return (
                    <Box
                        key={tab.to}
                        component={RouterLink}
                        to={tab.to}
                        aria-label={tab.label}
                        aria-current={active ? 'page' : undefined}
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            flex: 1,
                            minHeight: 50,
                            borderRadius: '30px',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            px: 1,
                            textDecoration: 'none',
                            transition: 'color 0.28s ease',
                            color: active ? 'primary.contrastText' : 'text.secondary',
                            '&:hover': {
                                bgcolor: active ? 'transparent' : 'action.hover',
                            },
                        }}
                    >
                        {tab.icon}
                        <Box
                            component="span"
                            sx={{ fontSize: 11, fontWeight: 600, lineHeight: 1 }}
                        >
                            {tab.label}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
