import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as Form from '@radix-ui/react-form';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';
import { signUpWithEmail, loginWithEmail, signInWithGoogle, sendPasswordResetLink } from '../../services/authService';
import '../../styles/auth/AuthPage.css';
import { useAuth } from './AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageMeta from '../layout/PageMeta';
import { trackUserSignUp } from '../../services/analyticsService';

const AuthPage: React.FC = () => {
    const [view, setView] = useState<'login' | 'signup' | 'reset'>('login');
    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = location.state?.from?.pathname || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const { currentUser, isLoading: authIsLoading } = useAuth();

    useEffect(() => {
        if (!authIsLoading && currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, authIsLoading, navigate]);

    const resetFormState = () => {
        setEmail('');
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
            toast.success('Successfully signed in with Google!');
            trackUserSignUp('google')
            navigate('/dashboard');
        } catch (error: any) {
            setIsLoading(false);
        }
    };

    const handleAuthError = (error: any) => {
        setIsLoading(false);
        console.error("Auth Error:", error);
        let message = "An unexpected error occurred. Please try again.";
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    message = 'Invalid email or password.';
                    break;
                case 'auth/email-already-in-use':
                    message = 'This email is already registered. Please login or use a different email.';
                    break;
                case 'auth/weak-password':
                    message = 'Password is too weak. It should be at least 6 characters long.';
                    break;
                case 'auth/invalid-email':
                    message = 'Please enter a valid email address.';
                    break;
                case 'auth/invalid-credential':
                    message = 'Email and password do not match.';
                    break;
                default:
                    message = error.message || message;
            }
        } else if (error && typeof error.message === 'string') {
            message = error.message;
        }
        setFormError(message);
        toast.error(message);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setFormError(null);

        if (!email || !password) {
            setFormError("Email and password are required.");
            toast.error("Email and password are required.");
            return;
        }
        if (view === 'signup' && !confirmPassword) {
            setFormError("Please confirm your password.");
            toast.error("Please confirm your password.");
            return;
        }
        if (view === 'signup' && password !== confirmPassword) {
            setFormError("Passwords do not match.");
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        if (view === 'signup') {
            try {
                await signUpWithEmail(email, password);
                toast.success('Account created successfully! Welcome!');
                trackUserSignUp('email')
                navigate('/dashboard');
            } catch (error) {
                handleAuthError(error);
            }
        } else {
            try {
                await loginWithEmail(email, password);
                toast.success('Logged in successfully! Welcome back!');
                navigate('/dashboard');
            } catch (error) {
                handleAuthError(error);
            }
        }
    };

    const handlePasswordReset = async (event: FormEvent) => {
        event.preventDefault();
        if (!email) {
            setFormError("Please enter your email address to send a reset link.");
            toast.error("Please enter your email address.");
            return;
        }
        setIsLoading(true);
        setFormError(null);
        try {
            await sendPasswordResetLink(email);
            toast.success(`Password reset link sent to ${email}.`);
            setView('login');
            resetFormState();
        } catch (error: any) {
            handleAuthError(error);
            if (error.code === 'auth/user-not-found') {
                setFormError("No account found with this email. Please sign up instead.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (authIsLoading) {
        return (
            <div className="auth-page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </div>
        );
    }

    if (view === 'reset') {
        return (
            <div className="auth-page-container">
                <div className="auth-form-wrapper">
                    <Link to={fromPath} className="auth-back-link" aria-label="Back to Dashboard">
                        <IconButton component="span" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Link>

                    <h2>Reset Password</h2>
                    <p style={{ fontSize: '0.9em', color: '#555', textAlign: 'center', marginBottom: '20px' }}>
                        Enter your account's email to receive a password reset link.
                    </p>

                    <Form.Root onSubmit={handlePasswordReset} className="auth-form">
                        {formError && <div className="form-error-message">{formError}</div>}

                        <Form.Field name="email" className="form-field">
                            <div className="form-label-container">
                                <Form.Label className="form-label">Email</Form.Label>
                            </div>
                            <Form.Control asChild>
                                <input
                                    className="form-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    autoComplete='off'
                                />
                            </Form.Control>
                            <Form.Message className="form-message" match="valueMissing">
                                Please enter your email
                            </Form.Message>
                        </Form.Field>

                        <Form.Submit asChild>
                            <button className="auth-submit-button" disabled={isLoading}>
                                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </Form.Submit>
                    </Form.Root>

                    <p className="auth-toggle-prompt">
                        Remembered your password?
                        <button onClick={() => { setView('login'); resetFormState(); }} className="auth-toggle-button" disabled={isLoading}>
                            Back to Login
                        </button>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <PageMeta
                title="Login or Sign Up"
                description="Log in to your VacantCourt account or create a free account to receive real-time court availability notifications and manage your preferences."
            />
            <div className="auth-page-container">
                <div className="auth-form-wrapper">
                    <Link to={fromPath} className="auth-back-link" aria-label="Back to Dashboard">
                        <IconButton component="span" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Link>

                    <h2>{view === 'login' ? 'Login' : 'Sign Up'}</h2>

                    <IconButton
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="google-signin-button auth-button-social"
                        disabled={isLoading}
                        sx={{
                            border: '1px solid rgba(0, 0, 0, 0.23)',
                            borderRadius: '0.75rem',
                        }}
                    >
                        <FcGoogle size={30} />
                    </IconButton>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <Form.Root onSubmit={handleSubmit} className="auth-form">
                        {formError && <div className="form-error-message">{formError}</div>}

                        <Form.Field name="email" className="form-field">
                            <div className="form-label-container">
                                <Form.Label className="form-label">Email</Form.Label>
                            </div>
                            <Form.Control asChild>
                                <input
                                    className="form-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    autoComplete='off'
                                />
                            </Form.Control>
                            <Form.Message className="form-message" match="valueMissing">
                                Please enter your email
                            </Form.Message>
                            <Form.Message className="form-message" match="typeMismatch">
                                Please provide a valid email
                            </Form.Message>
                        </Form.Field>

                        <Form.Field name="password" className="form-field">
                            <div className="form-label-container">
                                <Form.Label className="form-label">Password</Form.Label>
                                {view === 'login' && (
                                    <button type="button" onClick={() => { setView('reset'); resetFormState(); }} className="auth-toggle-button" style={{ fontSize: '0.8em', fontWeight: 400 }}>
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <Form.Control asChild>
                                <input
                                    className="form-input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    autoComplete='off'
                                />
                            </Form.Control>
                            <Form.Message className="form-message" match="valueMissing">
                                Please enter your password
                            </Form.Message>
                        </Form.Field>

                        {view === 'signup' && (
                            <Form.Field name="confirmPassword" className="form-field">
                                <div className="form-label-container">
                                    <Form.Label className="form-label">Confirm Password</Form.Label>
                                </div>
                                <Form.Control asChild>
                                    <input
                                        className="form-input"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        autoComplete='off'
                                    />
                                </Form.Control>
                                <Form.Message className="form-message" match="valueMissing">
                                    Please confirm your password
                                </Form.Message>
                            </Form.Field>
                        )}

                        <Form.Submit asChild>
                            <button className="auth-submit-button" disabled={isLoading}>
                                {isLoading ? 'Processing...' : (view === 'login' ? 'Login' : 'Sign Up')}
                            </button>
                        </Form.Submit>
                    </Form.Root>

                    <p className="auth-toggle-prompt">
                        {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
                        <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); resetFormState(); }} className="auth-toggle-button" disabled={isLoading}>
                            {view === 'login' ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
};

export default AuthPage;  