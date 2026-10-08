import React, { useState, FormEvent, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FcGoogle } from 'react-icons/fc';

import { signUpWithEmail, loginWithEmail, signInWithGoogle, sendPasswordResetLink } from '../../services/authService';
import { useAuth } from './AuthContext';
import PageMeta from '../layout/PageMeta';
import Logo from '../brand/Logo';
import { trackUserSignUp } from '../../services/analyticsService';
import '../../styles/auth/AuthPage.css';

type View = 'login' | 'signup' | 'reset';

const copy: Record<View, { title: string; subtitle: string; submit: string; pending: string }> = {
    login: { title: 'Sign in.', subtitle: 'You only need an account for court alerts.', submit: 'Sign in', pending: 'Signing in…' },
    signup: { title: 'Create an account.', subtitle: 'It’s free. You’ll get an email when a full court opens.', submit: 'Create account', pending: 'Creating account…' },
    reset: { title: 'Reset your password.', subtitle: 'We’ll email you a link to choose a new one.', submit: 'Send reset link', pending: 'Sending…' },
};

function authErrorMessage(error: unknown): string {
    const { code, message } = (error ?? {}) as { code?: string; message?: string };
    switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'That email and password don’t match.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists. Sign in instead.';
        case 'auth/weak-password':
            return 'Use a password with at least 6 characters.';
        case 'auth/invalid-email':
            return 'Enter a valid email address.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Wait a minute, then try again.';
        default:
            return message || 'Something went wrong. Try again.';
    }
}

const AuthPage: React.FC = () => {
    const [view, setView] = useState<View>('login');
    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = location.state?.from?.pathname || '/';
    const redirectTo = fromPath === '/' ? '/dashboard' : fromPath;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const { currentUser, isLoading: authIsLoading } = useAuth();

    useEffect(() => {
        if (!authIsLoading && currentUser) navigate(redirectTo, { replace: true });
    }, [currentUser, authIsLoading, navigate, redirectTo]);

    const switchView = (next: View) => {
        setView(next);
        setPassword('');
        setConfirmPassword('');
        setFormError(null);
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setFormError(null);
        try {
            await signInWithGoogle();
            toast.success('Signed in');
            trackUserSignUp('google');
            navigate(redirectTo);
        } catch {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setFormError(null);

        if (view === 'reset') {
            if (!email) return setFormError('Enter the email you signed up with.');
            setIsLoading(true);
            try {
                await sendPasswordResetLink(email);
                toast.success(`Reset link sent to ${email}`);
                switchView('login');
            } catch (error) {
                setFormError((error as { code?: string })?.code === 'auth/user-not-found'
                    ? 'No account uses this email. Create one instead.'
                    : authErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!email || !password) return setFormError('Enter your email and password.');
        if (view === 'signup' && password !== confirmPassword) return setFormError('The passwords don’t match.');

        setIsLoading(true);
        try {
            if (view === 'signup') {
                await signUpWithEmail(email, password);
                toast.success('Account created');
                trackUserSignUp('email');
            } else {
                await loginWithEmail(email, password);
                toast.success('Signed in');
            }
            navigate(redirectTo);
        } catch (error) {
            console.error('Auth Error:', error);
            setFormError(authErrorMessage(error));
            setIsLoading(false);
        }
    };

    const passwordAdornment = {
        endAdornment: (
            <InputAdornment position="end">
                <IconButton
                    size="small"
                    edge="end"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
            </InputAdornment>
        ),
    };

    const { title, subtitle, submit, pending } = copy[view];

    return (
        <>
            <PageMeta
                title={view === 'signup' ? 'Create an Account' : 'Sign In'}
                description="Sign in to VacantCourt or create a free account to get an email when a court opens."
            />
            <Box className="auth-layout">
                <Box className="auth-form-panel">
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 6, md: 0 } }}>
                        <Box component={RouterLink} to="/" aria-label="VacantCourt home" sx={{ display: 'inline-flex' }}>
                            <Logo size={26} />
                        </Box>
                        <Button
                            component={RouterLink}
                            to={fromPath}
                            startIcon={<ArrowBackIcon />}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                        >
                            Back
                        </Button>
                    </Stack>

                    <Box sx={{ width: '100%', maxWidth: 380, mx: 'auto', my: 'auto', py: { md: 6 } }}>
                        {authIsLoading ? (
                            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>
                        ) : (
                            <>
                                <Typography component="h1" variant="h4" sx={{ fontSize: '1.875rem' }}>{title}</Typography>
                                <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>{subtitle}</Typography>

                                {view !== 'reset' && (
                                    <>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="large"
                                            onClick={handleGoogleSignIn}
                                            disabled={isLoading}
                                            startIcon={<FcGoogle size={20} />}
                                        >
                                            Continue with Google
                                        </Button>
                                        <Divider sx={{ my: 3, color: 'text.secondary', fontSize: '0.8125rem' }}>or</Divider>
                                    </>
                                )}

                                <Box component="form" onSubmit={handleSubmit} noValidate>
                                    <Stack spacing={2}>
                                        {formError && <Alert severity="error">{formError}</Alert>}
                                        <TextField
                                            label="Email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            autoComplete="email"
                                            autoFocus
                                            fullWidth
                                        />
                                        {view !== 'reset' && (
                                            <TextField
                                                label="Password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
                                                helperText={view === 'signup' ? 'At least 6 characters' : undefined}
                                                fullWidth
                                                slotProps={{ input: passwordAdornment }}
                                            />
                                        )}
                                        {view === 'signup' && (
                                            <TextField
                                                label="Confirm password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                autoComplete="new-password"
                                                fullWidth
                                            />
                                        )}
                                        {view === 'login' && (
                                            <Link
                                                component="button"
                                                type="button"
                                                variant="body2"
                                                onClick={() => switchView('reset')}
                                                sx={{ alignSelf: 'flex-end', fontWeight: 500, mt: '12px !important' }}
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={isLoading}
                                            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                                        >
                                            {isLoading ? pending : submit}
                                        </Button>
                                    </Stack>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                                    {view === 'login' && 'New to VacantCourt? '}
                                    {view === 'signup' && 'Already have an account? '}
                                    {view === 'reset' && 'Remembered it? '}
                                    <Link
                                        component="button"
                                        type="button"
                                        variant="body2"
                                        onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
                                        disabled={isLoading}
                                        sx={{ fontWeight: 600, verticalAlign: 'baseline' }}
                                    >
                                        {view === 'login' ? 'Create an account' : 'Sign in'}
                                    </Link>
                                </Typography>
                            </>
                        )}
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        By continuing you agree to our{' '}
                        <Link component={RouterLink} to="/tos" color="inherit" underline="always">Terms</Link> and{' '}
                        <Link component={RouterLink} to="/privacy" color="inherit" underline="always">Privacy Policy</Link>.
                    </Typography>
                </Box>

            </Box>
        </>
    );
};

export default AuthPage;
