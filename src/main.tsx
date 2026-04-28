import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.tsx'
import theme from './theme.ts'
import { AuthProvider } from './components/auth/AuthContext.tsx'
import { HelmetProvider } from 'react-helmet-async'
import { initGA } from './services/analyticsService.ts'

initGA();

createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <HelmetProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </HelmetProvider>
    </ThemeProvider>
)