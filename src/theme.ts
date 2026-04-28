import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

const shadows: Shadows = [
    'none',
    '0 1px 3px rgba(0,0,0,0.08)',
    '0 2px 8px rgba(0,0,0,0.10)',
    '0 4px 16px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.14)',
    '0 10px 30px rgba(0,0,0,0.15)',
    '0 12px 36px rgba(0,0,0,0.16)',
    '0 14px 40px rgba(0,0,0,0.17)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
    '0 16px 44px rgba(0,0,0,0.18)',
];

const theme = createTheme({
    palette: {
        primary: {
            main: '#214182',
            dark: '#142a5c',
            light: '#5078b8',
        },
        secondary: {
            main: '#268e85',
        },
        success: {
            main: '#258954',
        },
        error: {
            main: '#c43946',
        },
        warning: {
            main: '#d99818',
        },
        background: {
            default: '#f7f8fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#2c3038',
            secondary: '#6b7280',
        },
    },
    typography: {
        fontFamily: '"Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
        button: {
            textTransform: 'none' as const,
            fontWeight: 600,
        },
        h1: { fontWeight: 800 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: {
        borderRadius: 8,
    },
    shadows,
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    overscrollBehavior: 'none',
                    height: '100%',
                },
                body: {
                    overscrollBehavior: 'none',
                    scrollBehavior: 'smooth',
                    minHeight: '100%',
                },
            },
        },
    },
});

export default theme;
