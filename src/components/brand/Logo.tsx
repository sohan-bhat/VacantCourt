import { Box, Typography } from '@mui/material';

interface LogoProps {
    size?: number;
    inverted?: boolean;
    showWordmark?: boolean;
}

// The 3D green court, the original VacantCourt mark.
export function LogoMark({ size = 28 }: { size?: number }) {
    return (
        <Box
            component="img"
            src="/ground.png"
            alt=""
            aria-hidden="true"
            sx={{ width: size * 1.25, height: size * 1.25, display: 'block', objectFit: 'contain', my: -0.5 }}
        />
    );
}

function Logo({ size = 28, inverted = false, showWordmark = true }: LogoProps) {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
            <LogoMark size={size} />
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
