import { Box, Typography } from '@mui/material';

interface LogoProps {
    size?: number;
    inverted?: boolean;
    showWordmark?: boolean;
}

export function LogoMark({ size = 28, inverted = false }: { size?: number; inverted?: boolean }) {
    const bg = inverted ? '#FFFFFF' : 'var(--primary-color)';
    const fg = inverted ? 'var(--primary-color)' : '#FFFFFF';
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <rect width="64" height="64" rx="14" fill={bg} />
            <rect x="9" y="18" width="46" height="28" rx="1.5" fill="none" stroke={fg} strokeWidth="3" />
            <line x1="32" y1="14" x2="32" y2="50" stroke={fg} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="20" y1="18" x2="20" y2="46" stroke={fg} strokeWidth="2" opacity=".6" />
            <line x1="44" y1="18" x2="44" y2="46" stroke={fg} strokeWidth="2" opacity=".6" />
            <line x1="20" y1="32" x2="44" y2="32" stroke={fg} strokeWidth="2" opacity=".6" />
            <circle cx="51" cy="13" r="6.5" fill="#DCEB4B" stroke={bg} strokeWidth="3" />
        </svg>
    );
}

function Logo({ size = 28, inverted = false, showWordmark = true }: LogoProps) {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
            <LogoMark size={size} inverted={inverted} />
            {showWordmark && (
                <Typography
                    component="span"
                    sx={{
                        fontFamily: 'var(--font-display)',
                        fontStretch: '112%',
                        fontWeight: 800,
                        fontSize: size * 0.66,
                        letterSpacing: '-0.025em',
                        color: inverted ? 'common.white' : 'text.primary',
                        lineHeight: 1,
                    }}
                >
                    VacantCourt
                </Typography>
            )}
        </Box>
    );
}

export default Logo;
