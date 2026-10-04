import { createTheme, alpha } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

// Palette taken from a hard court: court blue, apron green, line white,
// ball yellow, and the near black of the net. index.css mirrors these.
export const tokens = {
    ink: '#1B1D21',
    inkSoft: '#5C6068',
    court: '#2D5BA6',
    courtDark: '#1F4383',
    courtLight: '#5A80C0',
    apron: '#3E7C5B',
    ball: '#DCEB4B',
    open: '#1E8A4C',
    inUse: '#C8412F',
    offline: '#B7791F',
    surface: '#F5F5F2',
    paper: '#FFFFFF',
    line: '#E3E3DE',
    lineStrong: '#CFCFC8',
    fontDisplay: '"Archivo", "Helvetica Neue", Arial, sans-serif',
    displayStretch: '112%',
    fontBody: '"Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontMono: '"Spline Sans Mono", ui-monospace, "SF Mono", Menlo, monospace',
    hardShadow: '4px 4px 0 #1B1D21',
};

const shadowMenu = '0 1px 2px rgba(27, 29, 33, 0.06), 0 8px 24px -6px rgba(27, 29, 33, 0.14)';
const shadows = ['none', ...Array(24).fill(shadowMenu)] as Shadows;

const theme = createTheme({
    palette: {
        primary: {
            main: tokens.court,
            dark: tokens.courtDark,
            light: tokens.courtLight,
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: tokens.apron,
            contrastText: '#FFFFFF',
        },
        success: {
            main: tokens.open,
            contrastText: '#FFFFFF',
        },
        error: {
            main: tokens.inUse,
        },
        warning: {
            main: tokens.offline,
        },
        background: {
            default: tokens.surface,
            paper: tokens.paper,
        },
        text: {
            primary: tokens.ink,
            secondary: tokens.inkSoft,
        },
        divider: tokens.line,
        grey: {
            50: '#FAFAF8',
            100: '#F0F0EC',
            200: '#E3E3DE',
            300: '#CFCFC8',
            400: '#9E9F99',
            500: '#74766F',
            600: '#55575A',
            700: '#3B3D41',
            800: '#2A2C30',
            900: '#1B1D21',
        },
    },
    typography: {
        fontFamily: tokens.fontBody,
        fontSize: 14,
        h1: { fontFamily: tokens.fontDisplay, fontStretch: tokens.displayStretch, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.02 },
        h2: { fontFamily: tokens.fontDisplay, fontStretch: tokens.displayStretch, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08 },
        h3: { fontFamily: tokens.fontDisplay, fontStretch: tokens.displayStretch, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.15 },
        h4: { fontFamily: tokens.fontDisplay, fontStretch: tokens.displayStretch, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2 },
        h5: { fontFamily: tokens.fontDisplay, fontStretch: tokens.displayStretch, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
        h6: { fontFamily: tokens.fontDisplay, fontStretch: tokens.displayStretch, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.35, fontSize: '1.0625rem' },
        subtitle1: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        body1: { lineHeight: 1.6 },
        body2: { lineHeight: 1.55 },
        overline: {
            fontWeight: 600,
            letterSpacing: '0.06em',
            fontSize: '0.72rem',
            lineHeight: 1.5,
        },
        caption: { lineHeight: 1.45 },
        button: {
            textTransform: 'none' as const,
            fontWeight: 600,
            letterSpacing: '-0.005em',
        },
    },
    shape: {
        borderRadius: 8,
    },
    shadows,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                // No rubber-band scrolling past the top or bottom of the page.
                html: {
                    overscrollBehavior: 'none',
                    height: '100%',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                },
                body: {
                    overscrollBehavior: 'none',
                    minHeight: '100%',
                    textRendering: 'optimizeLegibility',
                },
                '::selection': {
                    backgroundColor: alpha(tokens.court, 0.16),
                },
                ':focus-visible': {
                    outline: `2px solid ${tokens.court}`,
                    outlineOffset: 2,
                },
            },
        },
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                },
                sizeSmall: { padding: '5px 12px', fontSize: '0.8125rem' },
                sizeMedium: { padding: '8px 16px' },
                sizeLarge: { padding: '11px 22px', fontSize: '0.975rem' },
                outlined: {
                    borderColor: tokens.lineStrong,
                    color: tokens.ink,
                    backgroundColor: tokens.paper,
                    '&:hover': {
                        borderColor: tokens.ink,
                        backgroundColor: tokens.paper,
                    },
                },
                outlinedError: {
                    color: tokens.inUse,
                    borderColor: alpha(tokens.inUse, 0.4),
                    '&:hover': { borderColor: tokens.inUse, backgroundColor: alpha(tokens.inUse, 0.04) },
                },
                text: {
                    '&:hover': { backgroundColor: alpha(tokens.court, 0.06) },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    '&:hover': { backgroundColor: alpha(tokens.ink, 0.05) },
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundImage: 'none',
                },
                outlined: {
                    borderColor: tokens.line,
                },
            },
        },
        MuiCard: {
            defaultProps: {
                variant: 'outlined',
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    fontWeight: 500,
                    height: 30,
                },
                sizeSmall: {
                    height: 24,
                    fontSize: '0.75rem',
                },
                outlined: {
                    borderColor: tokens.lineStrong,
                    backgroundColor: tokens.paper,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: tokens.paper,
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: tokens.lineStrong,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: tokens.inkSoft,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                        borderColor: tokens.court,
                    },
                    '&.Mui-disabled': {
                        backgroundColor: tokens.surface,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: tokens.inkSoft,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    border: `1px solid ${tokens.ink}`,
                    boxShadow: tokens.hardShadow,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontFamily: tokens.fontDisplay,
                    fontStretch: tokens.displayStretch,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    letterSpacing: '-0.015em',
                    padding: '20px 24px 8px',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '8px 24px 16px',
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '12px 24px 20px',
                    gap: 8,
                },
            },
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    '&:not(.MuiBackdrop-invisible)': {
                        backgroundColor: alpha(tokens.ink, 0.4),
                    },
                },
            },
        },
        MuiTooltip: {
            defaultProps: {
                arrow: true,
            },
            styleOverrides: {
                tooltip: {
                    backgroundColor: tokens.ink,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '6px 10px',
                    borderRadius: 6,
                },
                arrow: {
                    color: tokens.ink,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    marginTop: 6,
                    border: `1px solid ${tokens.line}`,
                    boxShadow: shadowMenu,
                    borderRadius: 10,
                    minWidth: 220,
                },
                list: {
                    padding: 6,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    minHeight: 38,
                    '& .MuiListItemIcon-root': { minWidth: 30, color: tokens.inkSoft },
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    '&.Mui-selected': {
                        backgroundColor: alpha(tokens.court, 0.08),
                        color: tokens.court,
                        '& .MuiListItemIcon-root': { color: tokens.court },
                        '&:hover': { backgroundColor: alpha(tokens.court, 0.12) },
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: 36,
                },
            },
        },
        MuiToggleButtonGroup: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ECECE7',
                    borderRadius: 8,
                    padding: 3,
                    gap: 2,
                },
                grouped: {
                    border: 0,
                    borderRadius: '6px !important',
                    margin: 0,
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    color: tokens.inkSoft,
                    padding: '5px 12px',
                    gap: 6,
                    '&.Mui-selected': {
                        backgroundColor: tokens.paper,
                        color: tokens.ink,
                        boxShadow: `inset 0 0 0 1px ${tokens.lineStrong}`,
                        '&:hover': { backgroundColor: tokens.paper },
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    height: 2,
                    borderRadius: 2,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 44,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    alignItems: 'flex-start',
                },
                standardInfo: {
                    backgroundColor: alpha(tokens.court, 0.06),
                    color: tokens.ink,
                    '& .MuiAlert-icon': { color: tokens.court },
                },
                standardWarning: {
                    backgroundColor: alpha(tokens.offline, 0.08),
                    color: tokens.ink,
                    '& .MuiAlert-icon': { color: tokens.offline },
                },
                standardError: {
                    backgroundColor: alpha(tokens.inUse, 0.07),
                    color: tokens.ink,
                },
                standardSuccess: {
                    backgroundColor: alpha(tokens.open, 0.08),
                    color: tokens.ink,
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    width: 40,
                    height: 24,
                    padding: 0,
                    margin: '0 8px 0 0',
                },
                switchBase: {
                    padding: 3,
                    '&.Mui-checked': {
                        transform: 'translateX(16px)',
                        color: '#fff',
                        '& + .MuiSwitch-track': { opacity: 1 },
                    },
                },
                thumb: {
                    width: 18,
                    height: 18,
                    boxShadow: 'none',
                },
                track: {
                    borderRadius: 12,
                    opacity: 1,
                    backgroundColor: tokens.lineStrong,
                },
            },
        },
        MuiSkeleton: {
            defaultProps: {
                animation: false,
            },
            styleOverrides: {
                root: {
                    backgroundColor: '#EBEBE6',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: tokens.line,
                },
            },
        },
        MuiLink: {
            defaultProps: {
                underline: 'hover',
            },
        },
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
                color: 'inherit',
            },
        },
    },
});

export default theme;
