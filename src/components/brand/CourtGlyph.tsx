import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { CourtStatus } from './status';

interface CourtGlyphProps {
    status: CourtStatus;
    sx?: SxProps<Theme>;
    title?: string;
}

const palettes = {
    live: { apron: '#3E7C5B', surface: '#2D5BA6', line: '#FFFFFF' },
    muted: { apron: '#CFCFC8', surface: '#B3B4AE', line: '#F5F5F2' },
};

/*
 * Top-down doubles court drawn to regulation proportions (78 × 36 ft),
 * with a 10 ft apron. One SVG unit is one foot.
 */
function CourtGlyph({ status, sx, title }: CourtGlyphProps) {
    const muted = status === 'unconfigured' || status === 'offline';
    const p = muted ? palettes.muted : palettes.live;
    const occupied = status === 'in-use';

    return (
        <Box
            component="svg"
            viewBox="0 0 98 56"
            role={title ? 'img' : undefined}
            aria-label={title}
            aria-hidden={title ? undefined : true}
            sx={{
                display: 'block',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                ...sx,
            } as SxProps<Theme>}
        >
            {title && <title>{title}</title>}
            <rect width="98" height="56" fill={p.apron} />
            <rect x="10" y="10" width="78" height="36" fill={p.surface} />
            <g fill="none" stroke={p.line} strokeWidth="0.8">
                <rect x="10" y="10" width="78" height="36" />
                <line x1="10" y1="14.5" x2="88" y2="14.5" />
                <line x1="10" y1="41.5" x2="88" y2="41.5" />
                <line x1="28" y1="14.5" x2="28" y2="41.5" />
                <line x1="70" y1="14.5" x2="70" y2="41.5" />
                <line x1="28" y1="28" x2="70" y2="28" />
                <line x1="10" y1="28" x2="11.5" y2="28" />
                <line x1="86.5" y1="28" x2="88" y2="28" />
            </g>
            <line x1="49" y1="8" x2="49" y2="48" stroke={p.line} strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
            {occupied && (
                <>
                    <circle cx="20" cy="22" r="2.6" fill="#FFFFFF" stroke="#1B1D21" strokeWidth="0.9" />
                    <circle cx="78" cy="34" r="2.6" fill="#FFFFFF" stroke="#1B1D21" strokeWidth="0.9" />
                </>
            )}
        </Box>
    );
}

export default CourtGlyph;
