import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Container, Typography, Stack, Paper, AppBar, Toolbar, useMediaQuery, CircularProgress, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import MemoryIcon from '@mui/icons-material/Memory';
import LoginIcon from '@mui/icons-material/Login';
import GridViewIcon from '@mui/icons-material/GridView';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { IconButton } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import PageMeta from '../layout/PageMeta';

const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

function useInView<T extends HTMLElement = HTMLDivElement>(rootMargin = '0px 0px -10% 0px') {
    const ref = useRef<T | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin, threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [rootMargin]);

    return { ref, inView };
}

interface RevealProps {
    children: React.ReactNode;
    delay?: number;
    y?: number;
    duration?: number;
}

const Reveal: React.FC<RevealProps> = ({ children, delay = 0, y = 16, duration = 700 }) => {
    const { ref, inView } = useInView();
    return (
        <Box
            ref={ref}
            sx={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translate3d(0,0,0)' : `translate3d(0, ${y}px, 0)`,
                transition: `opacity ${duration}ms ${EASE_OUT_EXPO} ${delay}ms, transform ${duration}ms ${EASE_OUT_EXPO} ${delay}ms`,
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </Box>
    );
};

const SpotlightCard: React.FC<{ children: React.ReactNode; variant?: 'outlined' | 'elevation'; elevation?: number; sx?: object }> = ({
    children,
    variant = 'outlined',
    elevation,
    sx,
}) => {
    const cardRef = useRef<HTMLDivElement | null>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };

    return (
        <Paper
            ref={cardRef}
            variant={variant}
            elevation={elevation}
            onMouseMove={handleMouseMove}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                transition: `border-color 300ms ${EASE_OUT_EXPO}, box-shadow 300ms ${EASE_OUT_EXPO}`,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    background: 'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(33, 65, 130, 0.10), transparent 45%)',
                    opacity: 0,
                    transition: `opacity 300ms ${EASE_OUT_EXPO}`,
                    pointerEvents: 'none',
                },
                '&:hover': {
                    borderColor: 'rgba(33, 65, 130, 0.25)',
                },
                '&:hover::before': { opacity: 1 },
                ...sx,
            }}
        >
            {children}
        </Paper>
    );
};

const FloatingHeader: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { currentUser, isLoading } = useAuth();

    const renderAuthButtons = () => {
        if (isLoading) {
            return <Box sx={{ width: 90, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>;
        }

        if (currentUser) {
            return isMobile ? (
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Button variant="outlined" color="primary" size="small" onClick={() => navigate('/dashboard')} startIcon={<GridViewIcon />} sx={{ borderRadius: '999px', textTransform: 'none' }}>
                        Dashboard
                    </Button>
                    <IconButton color="primary" onClick={() => navigate('/account')} aria-label="account">
                        <AccountCircleIcon />
                    </IconButton>
                </Stack>
            ) : (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Button variant="outlined" color="primary" size="small" onClick={() => navigate('/dashboard')} startIcon={<GridViewIcon />} sx={{ borderRadius: '999px', textTransform: 'none' }}>
                        Dashboard
                    </Button>
                    <Button variant="contained" color="primary" size="small" onClick={() => navigate('/account')} startIcon={<AccountCircleIcon />} sx={{ borderRadius: '999px', textTransform: 'none' }}>
                        My Account
                    </Button>
                </Stack>
            );
        }

        return (
            <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" color="primary" size="small" onClick={() => navigate('/dashboard')} startIcon={<GridViewIcon />} sx={{ borderRadius: '999px', textTransform: 'none', display: { xs: 'none', sm: 'inline-flex' } }}>
                    Dashboard
                </Button>
                <Button variant="contained" color="primary" size="small" onClick={() => navigate('/auth', { state: { from: location } })} startIcon={<LoginIcon />} sx={{ borderRadius: '999px', textTransform: 'none' }}>
                    {isMobile ? 'Login' : 'Login / Sign Up'}
                </Button>
            </Stack>
        );
    };

    return (
        <AppBar position="sticky" sx={{ top: 0, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.8)', boxShadow: 'inset 0 -1px 0 0 #e5e7eb', color: 'text.primary' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
                        <img src='/ground.png' alt="Logo" style={{ height: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>VacantCourt</Typography>
                    </Stack>
                    {renderAuthButtons()}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

const SplashPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const whyData = [
        {
            icon: <HelpOutlineIcon color="secondary" sx={{ fontSize: { xs: 32, md: 40 } }} />,
            question: "Tired of guessing?",
            answer: "Stop wasting time and energy going to courts that might be full."
        },
        {
            icon: <AccessTimeIcon color="secondary" sx={{ fontSize: { xs: 32, md: 40 } }} />,
            question: "Hate waiting around?",
            answer: "Get an email alert the second a court frees up so you can head straight there."
        },
        {
            icon: <MyLocationIcon color="secondary" sx={{ fontSize: { xs: 32, md: 40 } }} />,
            question: "Is the data reliable?",
            answer: "Our system uses on-site hardware, not unreliable user check-ins. It's ground truth."
        }
    ];

    const featureData = [
        {
            icon: <SearchIcon color="primary" sx={{ fontSize: 40 }} />,
            title: 'Find & Filter',
            desc: 'Quickly search for courts in your area. Filter by type, distance, and availability to find the perfect spot.',
        },
        {
            icon: <NotificationsActiveIcon color="primary" sx={{ fontSize: 40 }} />,
            title: 'Instant Alerts',
            desc: "Don't see an open court? Subscribe to get an email notification the second it becomes available.",
        },
        {
            icon: <SportsTennisIcon color="primary" sx={{ fontSize: 40 }} />,
            title: 'For Players, By Players',
            desc: 'Built by and for the community to solve the one problem we all share: waiting.',
        },
    ];

    return (
        <>
            <PageMeta
                title="Find Available Courts"
                description="Know before you go. VacantCourt shows you the real-time availability of tennis & pickleball courts, powered by our unique hardware sensor system."
            />
            <FloatingHeader />
            <Box sx={{ width: '100%', overflowX: 'hidden', bgcolor: 'background.paper' }}>
                {/* HERO */}
                <Box
                    sx={{
                        position: 'relative',
                        background: 'radial-gradient(circle at 50% 0%, rgba(80, 120, 184, 0.10) 0%, rgba(255,255,255,0) 55%)',
                        pt: { xs: 6, md: 10 },
                        pb: { xs: 8, md: 12 },
                        textAlign: 'center',
                    }}
                >
                    <Container maxWidth="lg">
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.5rem' },
                                fontWeight: 800,
                                letterSpacing: '-0.03em',
                                lineHeight: 1.05,
                                background: 'linear-gradient(90deg, #2d4a7a, #5a8ec7)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                color: 'transparent',
                            }}
                        >
                            Know Before You Go.
                        </Typography>

                        <Typography
                            variant="h5"
                            color="text.secondary"
                            sx={{
                                mt: 3,
                                mb: 4,
                                mx: 'auto',
                                maxWidth: '700px',
                                fontSize: { xs: '1.1rem', md: '1.5rem' },
                            }}
                        >
                            See live tennis court availability, powered by on-site hardware sensors.
                        </Typography>

                        <Box sx={{ display: 'inline-block' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    borderRadius: '999px',
                                    px: { xs: 4, md: 5 },
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px -4px rgba(33, 65, 130, 0.30)',
                                    transition: `box-shadow 250ms ${EASE_OUT_EXPO}`,
                                    '&:hover': {
                                        boxShadow: '0 6px 16px -6px rgba(33, 65, 130, 0.38)',
                                    },
                                }}
                            >
                                Explore Available Courts
                            </Button>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                mt: { xs: 6, md: 10 },
                                gap: { xs: 6, md: 8 },
                            }}
                        >
                            <Box sx={{ order: { xs: 1, md: 2 } }}>
                                <Reveal y={20}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: '0 24px 50px -20px rgba(20, 42, 92, 0.25)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                        }}
                                    >
                                        <img
                                            src="/assets/hardware.png"
                                            alt="VacantCourt hardware sensor"
                                            style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '20/9', objectFit: 'cover' }}
                                        />
                                    </Paper>
                                </Reveal>
                            </Box>

                            <Box sx={{ order: { xs: 2, md: 1 }, borderTop: '1px solid', borderColor: 'grey.200', pt: { xs: 6, md: 8 } }}>
                                <Stack
                                    direction={{ xs: 'column', md: 'row' }}
                                    spacing={{ xs: 5, md: 4 }}
                                    justifyContent="space-around"
                                    alignItems={{ xs: 'center', md: 'flex-start' }}
                                >
                                    {whyData.map((item, i) => (
                                        <Reveal key={item.question} delay={i * 90} y={16}>
                                            <Box sx={{ textAlign: 'center', maxWidth: '320px' }}>
                                                {item.icon}
                                                <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5, fontWeight: 'bold' }}>
                                                    {item.question}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.answer}
                                                </Typography>
                                            </Box>
                                        </Reveal>
                                    ))}
                                </Stack>
                            </Box>
                        </Box>
                    </Container>
                </Box>

                {/* MAGIC BEHIND IT */}
                <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f7f9fc' }}>
                    <Container maxWidth="lg">
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 8 }} alignItems="center">
                            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                <Reveal>
                                    <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 'bold', letterSpacing: '0.15em' }}>
                                        The Magic Behind It All
                                    </Typography>
                                </Reveal>
                                <Reveal delay={80}>
                                    <Typography variant="h3" sx={{ mt: 1, mb: 2, fontWeight: 'bold', fontSize: { xs: '2rem', md: '2.5rem' }, letterSpacing: '-0.02em' }}>
                                        Real-Time, For Real.
                                    </Typography>
                                </Reveal>
                                <Reveal delay={160}>
                                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '500px', mx: { xs: 'auto', md: 0 } }}>
                                        We don't rely on users checking in. Our custom-built hardware uses computer vision to detect if a court is occupied. This means the status you see is the real status, right now.
                                    </Typography>
                                </Reveal>
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                <Reveal delay={isMobile ? 0 : 200} y={20}>
                                    <SpotlightCard
                                        variant="elevation"
                                        elevation={2}
                                        sx={{
                                            p: { xs: 3, md: 4 },
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            width: '100%',
                                            maxWidth: '400px',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                        }}
                                    >
                                        <MemoryIcon sx={{ fontSize: { xs: 50, md: 60 }, color: 'secondary.main', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>The VC-Sensor 1.0</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            A low-power, non-intrusive device installed at partner facilities provides ground-truth data.
                                        </Typography>
                                    </SpotlightCard>
                                </Reveal>
                            </Box>
                        </Stack>
                    </Container>
                </Box>

                {/* FEATURES */}
                <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
                    <Container maxWidth="lg">
                        <Reveal>
                            <Typography
                                variant="h3"
                                sx={{
                                    textAlign: 'center',
                                    mb: { xs: 4, md: 6 },
                                    fontWeight: 'bold',
                                    fontSize: { xs: '2rem', md: '2.5rem' },
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Everything You Need to Play More
                            </Typography>
                        </Reveal>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center" alignItems={{ xs: 'center', sm: 'stretch' }}>
                            {featureData.map((item, i) => (
                                <Reveal key={item.title} delay={i * 100} y={18}>
                                    <SpotlightCard
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            borderRadius: '16px',
                                            flex: 1,
                                            maxWidth: '350px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            height: '100%',
                                        }}
                                    >
                                        {item.icon}
                                        <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{item.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                    </SpotlightCard>
                                </Reveal>
                            ))}
                        </Stack>
                    </Container>
                </Box>

                {/* CTA */}
                <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 8, md: 12 }, textAlign: 'center' }}>
                    <Container maxWidth="md">
                        <Reveal>
                            <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', sm: '3rem' }, fontWeight: 800, letterSpacing: '-0.02em' }}>
                                Ready to Find Your <i>Vacant</i> Court?
                            </Typography>
                        </Reveal>
                        <Reveal delay={100}>
                            <Typography sx={{ my: 3, mx: 'auto', maxWidth: '600px', color: 'grey.300' }}>
                                Spend less time waiting and more time playing. It's free to use and always will be for players.
                            </Typography>
                        </Reveal>
                        <Reveal delay={180}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/dashboard')}
                                color="secondary"
                                sx={{
                                    borderRadius: '999px',
                                    px: 5,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    transition: `box-shadow 250ms ${EASE_OUT_EXPO}`,
                                    '&:hover': {
                                        bgcolor: 'grey.100',
                                        boxShadow: '0 8px 20px -8px rgba(0,0,0,0.3)',
                                    },
                                }}
                            >
                                Start Searching Now
                            </Button>
                        </Reveal>
                    </Container>
                </Box>
            </Box>
        </>
    );
};

export default SplashPage;
