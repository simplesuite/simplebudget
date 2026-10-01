import React from 'react';
import Box from '@mui/material/Box';
import { useTheme, alpha } from '@mui/material/styles';

interface SwipeableNetProps {
    slides: React.ReactNode[];
}

/**
 * A lightweight swipeable carousel. Supports:
 *  - touch swipe left/right
 *  - mouse drag left/right
 *  - clickable dots
 * No external dependencies.
 */
export default function SwipeableNet({ slides }: SwipeableNetProps) {
    const theme = useTheme();
    const [index, setIndex] = React.useState(0);
    const [dragDelta, setDragDelta] = React.useState(0);
    const [dragging, setDragging] = React.useState(false);
    const startX = React.useRef<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const count = slides.length;

    const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));

    const onStart = (clientX: number) => {
        startX.current = clientX;
        setDragging(true);
    };

    const onMove = (clientX: number) => {
        if (startX.current === null) return;
        setDragDelta(clientX - startX.current);
    };

    const onEnd = () => {
        if (startX.current === null) return;
        const width = containerRef.current?.offsetWidth || 1;
        const threshold = Math.min(60, width * 0.2);
        if (dragDelta <= -threshold) {
            setIndex(prev => clamp(prev + 1));
        } else if (dragDelta >= threshold) {
            setIndex(prev => clamp(prev - 1));
        }
        startX.current = null;
        setDragDelta(0);
        setDragging(false);
    };

    return (
        <Box>
            <Box
                ref={containerRef}
                sx={{ overflow: 'hidden', touchAction: 'pan-y', cursor: dragging ? 'grabbing' : 'grab' }}
                onTouchStart={(e) => onStart(e.touches[0].clientX)}
                onTouchMove={(e) => onMove(e.touches[0].clientX)}
                onTouchEnd={onEnd}
                onMouseDown={(e) => onStart(e.clientX)}
                onMouseMove={(e) => { if (dragging) onMove(e.clientX); }}
                onMouseUp={onEnd}
                onMouseLeave={() => { if (dragging) onEnd(); }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        transform: `translateX(calc(${-index * 100}% + ${dragDelta}px))`,
                        transition: dragging ? 'none' : 'transform 0.3s ease',
                    }}
                >
                    {slides.map((slide, i) => (
                        <Box key={i} sx={{ flex: '0 0 100%', minWidth: '100%', px: 0.25, boxSizing: 'border-box' }}>
                            {slide}
                        </Box>
                    ))}
                </Box>
            </Box>
            {count > 1 && (
                <Box display='flex' justifyContent='center' gap={0.75} sx={{ mt: 1 }}>
                    {slides.map((_, i) => (
                        <Box
                            key={i}
                            role='button'
                            aria-label={`Go to panel ${i + 1}`}
                            onClick={() => setIndex(i)}
                            sx={{
                                width: i === index ? 18 : 8,
                                height: 8,
                                borderRadius: 4,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                bgcolor: i === index
                                    ? theme.palette.primary.main
                                    : alpha(theme.palette.text.secondary, 0.35),
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}
