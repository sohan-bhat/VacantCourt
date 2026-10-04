import { BrowserRouter as Router, Routes, Route, useMatch } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import CourtDetails from './components/courts/CourtDetails';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast'
import './styles/App.css';
import AuthPage from './components/auth/AuthPage';
import Page404 from './components/layout/Page404';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsOfService from './components/pages/TermsOfService';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AccountPage from './components/account/AccountPage';
import ProfileSettings from './components/account/ProfileSettings';
import SubscriptionManager from './components/account/SubscriptionManager';
import SplashPage from './components/pages/SplashPage';
import { tokens } from './theme';

const AppContent: React.FC = () => {
    const onSplashPage = useMatch({ path: "/", end: true });
    const onAuthPage = useMatch("/auth");
    const onPrivacyPolicy = useMatch("/privacy");
    const onTermsOfService = useMatch("/tos");
    const onLegalPage = onPrivacyPolicy || onTermsOfService;

    // The splash page renders its own marketing header; auth has a standalone layout.
    const showHeaderAndFooter = !onSplashPage && !onAuthPage;
    const isFullWidth = onSplashPage || onAuthPage || onLegalPage;

    return (
        <div className="app-container">
            {showHeaderAndFooter && <Header />}

            <main className={isFullWidth ? 'app-content full-width-content' : 'app-content'}>
                <Routes>
                    <Route path="/" element={<SplashPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/court/:id" element={<CourtDetails />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/tos" element={<TermsOfService />} />

                    <Route path="/account" element={<ProtectedRoute />}>
                        <Route element={<AccountPage />}>
                            <Route index element={<ProfileSettings />} />
                            <Route path="profile" element={<ProfileSettings />} />
                            <Route path="subscriptions" element={<SubscriptionManager />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Page404 />} />
                </Routes>
            </main>

            {showHeaderAndFooter && <Footer />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
            <Toaster
                position="bottom-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: tokens.ink,
                        color: '#fff',
                        fontFamily: tokens.fontDisplay,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        borderRadius: 10,
                        padding: '10px 14px',
                    },
                    success: {
                        iconTheme: { primary: '#2BD17E', secondary: tokens.ink },
                    },
                    error: {
                        iconTheme: { primary: '#FF7A6E', secondary: tokens.ink },
                    },
                }}
            />
        </Router>
    );
}

export default App;
