import React from 'react';
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { IconButton } from '@mui/material';
import { Fade, Flip } from "react-awesome-reveal";
import { useAuth } from '../auth/AuthContext';
import PageMeta from '../layout/PageMeta';

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
        } else {
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
        }
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

    return (
        <>
            <PageMeta
                title="Find Available Courts"
                description="Know before you go. VacantCourt shows you the real-time availability of tennis & pickleball courts, powered by our unique hardware sensor system."
            />
            <FloatingHeader />
            <Box sx={{ width: '100%', overflowX: 'hidden', bgcolor: 'background.paper' }}>
                <Box sx={{ background: 'radial-gradient(circle, rgba(230,230,255,0.4) 0%, rgba(255,255,255,0) 60%)', pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 }, textAlign: 'center' }}>
                    <Container maxWidth="lg">
                        <Fade direction="up" triggerOnce cascade damping={0.2}>
                            <Typography variant="h1" sx={{ fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.5rem' }, fontWeight: 800, letterSpacing: '-1.5px', background: 'linear-gradient(90deg, #2d4a7a, #5a8ec7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Know Before You Go.
                            </Typography>
                            <Typography variant="h5" color="text.secondary" sx={{ mt: 3, mb: 4, mx: 'auto', maxWidth: '700px', fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                                VacantCourt shows you the real-time availability of tennis & pickleball courts, powered by our unique hardware sensor system.
                            </Typography>
                            <Button variant="contained" size="large" onClick={() => navigate('/dashboard')} sx={{ borderRadius: '999px', px: { xs: 4, md: 5 }, py: 1.5, fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'none', boxShadow: '0 8px 25px -8px #2d4a7a' }}>
                                Explore Available Courts
                            </Button>
                        </Fade>

                        {isMobile ?
                            <>
                                <Fade direction="left" triggerOnce delay={isMobile ? 0 : 800}>
                                    <Paper
                                        elevation={6}
                                        sx={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            borderTop: '1px solid',
                                            borderColor: 'grey.200',
                                            mt: { xs: 6, md: 8 },
                                            boxShadow: '0 16px 40px -15px rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            position: 'relative',
                                        }}>
                                        <img src="/assets/hardware.png" alt="VacantCourt hardware sensor" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '20/9', objectFit: 'cover' }} />
                                    </Paper>
                                </Fade>
                                <Fade direction="up" triggerOnce delay={500}>
                                    <Box sx={{ mt: { xs: 8, md: 10 }, borderTop: '1px solid', borderColor: 'grey.200', pt: { xs: 6, md: 8 } }}>
                                        <Stack
                                            direction={{ xs: 'column', md: 'row' }}
                                            spacing={{ xs: 5, md: 4 }}
                                            justifyContent="space-around"
                                            alignItems="center"
                                        >
                                            {whyData.map(item => (
                                                <Box key={item.question} sx={{ textAlign: 'center', maxWidth: '320px' }}>
                                                    {item.icon}
                                                    <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5, fontWeight: 'bold' }}>
                                                        {item.question}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.answer}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Fade>
                            </>
                            :
                            <>
                                <Fade direction="up" triggerOnce delay={500}>
                                    <Box sx={{ mt: { xs: 8, md: 10 }, borderTop: '1px solid', borderColor: 'grey.200', pt: { xs: 6, md: 8 } }}>
                                        <Stack
                                            direction={{ xs: 'column', md: 'row' }}
                                            spacing={{ xs: 5, md: 4 }}
                                            justifyContent="space-around"
                                            alignItems="center"
                                        >
                                            {whyData.map(item => (
                                                <Box key={item.question} sx={{ textAlign: 'center', maxWidth: '320px' }}>
                                                    {item.icon}
                                                    <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5, fontWeight: 'bold' }}>
                                                        {item.question}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.answer}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Fade>

                                <Fade direction="left" triggerOnce delay={isMobile ? 0 : 800}>
                                    <Paper
                                        elevation={6}
                                        sx={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            borderTop: '1px solid',
                                            borderColor: 'grey.200',
                                            mt: { xs: 6, md: 8 },
                                            boxShadow: '0 16px 40px -15px rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            position: 'relative',
                                        }}>
                                        <img src="/assets/hardware.png" alt="VacantCourt hardware sensor" style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '20/9', objectFit: 'cover' }} />
                                    </Paper>
                                </Fade>
                            </>
                        }


                    </Container>
                </Box>

                <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f7f9fc' }}>
                    <Container maxWidth="lg">
                        <Stack spacing={{ xs: 6, md: 8 }}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 8 }} alignItems="center">
                                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                    <Fade direction="left" triggerOnce><Typography variant="overline" color="secondary.main" sx={{ fontWeight: 'bold' }}>The Magic Behind It All</Typography><Typography variant="h3" sx={{ mt: 1, mb: 2, fontWeight: 'bold', fontSize: { xs: '2rem', md: '2.5rem' } }}>Real-Time, For Real.</Typography><Typography variant="body1" color="text.secondary" sx={{ maxWidth: '500px', mx: { xs: 'auto', md: 0 } }}>We don't rely on users checking in. Our custom-built hardware uses computer vision to detect if a court is occupied. This means the status you see is the real status, right now.</Typography></Fade>
                                </Box>
                                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                    <Fade direction="right" triggerOnce><Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', textAlign: 'center', width: '100%', maxWidth: '400px' }}><MemoryIcon sx={{ fontSize: { xs: 50, md: 60 }, color: 'secondary.main', mb: 2 }} /><Typography variant="h6" sx={{ fontWeight: 'bold' }}>The VC-Sensor 1.0</Typography><Typography variant="body2" color="text.secondary">A low-power, non-intrusive device installed at partner facilities provides ground-truth data.</Typography></Paper></Fade>
                                </Box>
                            </Stack>
                        </Stack>
                    </Container>
                </Box>

                <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
                    <Container maxWidth="lg">
                        <Fade direction="up" triggerOnce>
                            <Typography variant="h3" sx={{ textAlign: 'center', mb: { xs: 4, md: 6 }, fontWeight: 'bold', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                                Everything You Need to Play More
                            </Typography>
                        </Fade>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center" alignItems={{ xs: 'center', sm: 'stretch' }}>
                            <Fade direction="up" triggerOnce cascade damping={0.3}>
                                {[{
                                    icon: <SearchIcon color="primary" sx={{ fontSize: 40 }} />,
                                    title: 'Find & Filter',
                                    desc: 'Quickly search for courts in your area. Filter by type, distance, and availability to find the perfect spot.'
                                }, {
                                    icon: <NotificationsActiveIcon color="primary" sx={{ fontSize: 40 }} />,
                                    title: 'Instant Alerts',
                                    desc: 'Don’t see an open court? Subscribe to get an email notification the second it becomes available.'
                                }, {
                                    icon: <SportsTennisIcon color="primary" sx={{ fontSize: 40 }} />,
                                    title: 'For Players, By Players',
                                    desc: 'Built by and for the community to solve the one problem we all share: waiting.'
                                }].map(item => (
                                    <Paper key={item.title} variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: '16px', flex: 1, maxWidth: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                        {item.icon}
                                        <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>{item.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                    </Paper>
                                ))}
                            </Fade>
                        </Stack>
                    </Container>
                </Box>

                <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 8, md: 12 }, textAlign: 'center' }}>
                    <Container maxWidth="md"><Fade direction="up" triggerOnce><Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', sm: '3rem' }, fontWeight: 800 }}>Ready to Find Your <i> Vacant</i> Court?</Typography><Typography sx={{ my: 3, mx: 'auto', maxWidth: '600px', color: 'grey.300' }}>Spend less time waiting and more time playing. It's free to use and always will be for players.</Typography><Button variant="contained" size="large" onClick={() => navigate('/dashboard')} color="secondary" sx={{ borderRadius: '999px', px: 5, py: 1.5, fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'none', bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.200' } }}>Start Searching Now</Button></Fade></Container>
                </Box>
            </Box>
        </>
    );
};

export default SplashPage;