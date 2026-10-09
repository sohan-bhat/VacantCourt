import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Link, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import Header from '../layout/Header';
import Footer from '../layout/Footer';
import PageMeta from '../layout/PageMeta';
import StatusPill from '../brand/StatusPill';
import { getFacilityStatus, isStale } from '../brand/status';
import { useAuth } from '../auth/AuthContext';
import { CourtCardSummary, subscribeToCourtsSummary } from '../../data/courtData';
import { tokens } from '../../theme';

const CONTACT_EMAIL = 'officialvacantcourt@gmail.com';

// The page's one loud button: ball yellow, ink edge, hard shadow that presses in.
const ballButtonSx = {
    bgcolor: tokens.ball,
    color: tokens.ink,
    border: `2px solid ${tokens.ink}`,
    boxShadow: tokens.hardShadow,
    borderRadius: '8px',
    px: 2.75,
    py: 1.25,
    fontSize: '1rem',
    fontWeight: 700,
    '&:hover': { bgcolor: tokens.ball, boxShadow: tokens.hardShadow },
    '&:active': { boxShadow: 'none', transform: 'translate(4px, 4px)' },
};

const wavyLinkSx = {
    color: 'inherit',
    fontWeight: 600,
    textDecoration: 'underline wavy',
    textDecorationThickness: '1px',
    textUnderlineOffset: '6px',
    '&:hover': { textDecorationColor: tokens.ball },
};

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
    return (
        <Typography id={id} variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
            {children}
        </Typography>
    );
}

const steps = [
    {
        title: 'A camera watches the court.',
        body: 'A phone mounted by the fence runs person detection on the device. Each court has its lines marked out.',
    },
    {
        title: 'The site updates.',
        body: 'Someone steps inside a court’s lines and it shows in use. They leave and it shows open. That takes about two seconds.',
    },
    {
        title: 'You go play.',
        body: 'Head over when a court is open. If they’re all taken, tap the bell and we’ll email you when one frees up.',
    },
];

const faqs = [
    {
        q: 'Is it free?',
        a: 'Yes. Checking courts and getting email alerts are both free.',
    },
    {
        q: 'Do I need an account?',
        a: 'Only for alerts. Anyone can see which courts are open.',
    },
    {
        q: 'How accurate is it?',
        a: 'The camera looks for people inside each court’s lines, so a court with players on it shows in use within a couple of seconds. If a camera stops reporting for five minutes, we mark it offline instead of guessing.',
    },
    {
        q: 'Which courts are on here?',
        a: 'Courts in Frisco and Plano, Texas. Courts without a camera yet still list their hours, address, and photos.',
    },
];

function CourtsList() {
    const [courts, setCourts] = useState<CourtCardSummary[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToCourtsSummary(
            (fetched) => setCourts(fetched),
            () => setFailed(true),
            false
        );
        return () => unsubscribe();
    }, []);

    if (failed) {
        return (
            <Typography color="text.secondary">
                We couldn’t load the courts here. <Link component={RouterLink} to="/dashboard">Open the full list</Link>.
            </Typography>
        );
    }

    const rows = courts
        ? [...courts].sort((a, b) =>
            a.isComplexConfigured === b.isComplexConfigured ? a.name.localeCompare(b.name) : a.isComplexConfigured ? -1 : 1)
        : null;

    return (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderTop: `1px solid ${tokens.ink}` }}>
            {rows === null
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Box component="li" key={i} sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Skeleton width="40%" height={24} />
                    </Box>
                ))
                : rows.map(court => {
                    const { status, label } = getFacilityStatus(court, isStale(court.lastUpdatedStatus));
                    return (
                        <Box component="li" key={court.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box
                                component={RouterLink}
                                to={`/court/${court.id}`}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'minmax(0, 1fr) 200px 150px' },
                                    alignItems: 'center',
                                    gap: 2,
                                    py: 1.75,
                                    color: 'text.primary',
                                    '&:hover .court-name': { textDecoration: 'underline', textUnderlineOffset: '4px' },
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography className="court-name" sx={{ fontWeight: 600 }} noWrap>{court.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: { sm: 'none' } }} noWrap>
                                        {court.location}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }} noWrap>
                                    {court.location}
                                </Typography>
                                <Box sx={{ justifySelf: 'end' }}>
                                    <StatusPill status={status} label={label} />
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
        </Box>
    );
}

const SplashPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const handleAddCourts = () => {
        if (currentUser) navigate('/dashboard');
        else navigate('/auth', { state: { from: { pathname: '/dashboard' } } });
    };

    return (
        <>
            <PageMeta
                title="Live Tennis Court Availability"
                description="See which tennis courts in Frisco and Plano are open right now, and get an email when a full court frees up."
            />

            <Box sx={{ bgcolor: 'primary.main', color: 'common.white', borderBottom: `2px solid ${tokens.ink}` }}>
                <Header variant="marketing" />

                {/* Hero */}
                <Container maxWidth="lg" component="section" sx={{ pt: { xs: 5, md: 9 }, pb: { xs: 7, md: 11 } }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '5fr 6fr' },
                            gap: { xs: 6, md: 8 },
                            alignItems: 'center',
                        }}
                    >
                        <Box>
                            <Typography sx={{ fontWeight: 600, color: alpha('#fff', 0.8), mb: 2.5 }}>
                                Live court status for Frisco and Plano
                            </Typography>
                            <Typography component="h1" variant="h1" sx={{ fontSize: { xs: '2.75rem', sm: '3.5rem', md: '4.25rem' } }}>
                                Skip the drive to a full court.
                            </Typography>
                            <Typography sx={{ mt: 3, fontSize: { xs: '1.05rem', md: '1.2rem' }, color: alpha('#fff', 0.88), maxWidth: 480 }}>
                                A camera at the court sees who’s playing. VacantCourt shows you which courts are
                                open right now, and emails you when a full one frees up.
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={3.5} sx={{ mt: 4.5 }}>
                                <Button component={RouterLink} to="/dashboard" sx={ballButtonSx}>
                                    See open courts
                                </Button>
                                <Link href="#how-it-works" sx={wavyLinkSx}>How it works</Link>
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 3, color: alpha('#fff', 0.7) }}>
                                Free. No account needed to look.
                            </Typography>
                        </Box>

                        <Box component="figure" sx={{ m: 0 }}>
                            <Box
                                component="img"
                                src="/assets/hardware.png"
                                alt="The camera’s view of Centennial High’s tennis courts, with each court outlined and players boxed"
                                sx={{
                                    display: 'block',
                                    width: '100%',
                                    aspectRatio: '16 / 10',
                                    objectFit: 'cover',
                                    objectPosition: '0% 60%',
                                    border: `2px solid ${tokens.ink}`,
                                    borderRadius: '6px',
                                    boxShadow: `6px 6px 0 ${tokens.ink}`,
                                    bgcolor: 'primary.dark',
                                }}
                            />
                            <Typography component="figcaption" variant="body2" sx={{ mt: 2, color: alpha('#fff', 0.7) }}>
                                What the camera sees at Centennial High. A person inside a court’s lines marks it in use.
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* How it works */}
            <Box component="section" id="how-it-works" aria-labelledby="how-title" sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
                <Container maxWidth="lg">
                    <SectionTitle id="how-title">How it works.</SectionTitle>
                    <Box
                        component="ol"
                        sx={{
                            listStyle: 'none',
                            m: 0,
                            mt: { xs: 4, md: 6 },
                            p: 0,
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                            gap: { xs: 4, md: 5 },
                        }}
                    >
                        {steps.map((step, i) => (
                            <Box component="li" key={step.title} sx={{ borderTop: `2px solid ${tokens.ink}`, pt: 2.5 }}>
                                <Typography sx={{ fontFamily: tokens.fontMono, fontSize: '0.85rem', color: 'text.secondary', mb: 1.5 }}>
                                    {i + 1}
                                </Typography>
                                <Typography variant="h6" component="h3">{step.title}</Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>{step.body}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* The courts */}
            <Box
                component="section"
                id="courts"
                aria-labelledby="courts-title"
                sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 }, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2} sx={{ mb: 4 }}>
                        <Box>
                            <SectionTitle id="courts-title">The courts.</SectionTitle>
                            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                                Every court on VacantCourt, as of right now.
                            </Typography>
                        </Box>
                        <Button component={RouterLink} to="/dashboard" variant="outlined" sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
                            Search and map
                        </Button>
                    </Stack>
                    <CourtsList />
                </Container>
            </Box>

            {/* For facilities */}
            <Box component="section" aria-labelledby="facilities-title" sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 3, md: 8 } }}>
                        <SectionTitle id="facilities-title">Run a court?</SectionTitle>
                        <Box>
                            <Typography color="text.secondary" sx={{ fontSize: '1.0625rem' }}>
                                If you manage courts at a school, park, or club, you can list them for free. Hours,
                                address, and photos go up right away, and live status comes once a camera is set up.
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={3} sx={{ mt: 3 }}>
                                <Button variant="contained" onClick={handleAddCourts}>Add your courts</Button>
                                <Link
                                    href={`mailto:${CONTACT_EMAIL}?subject=A%20camera%20for%20our%20courts`}
                                    sx={{ ...wavyLinkSx, '&:hover': { color: 'primary.main' } }}
                                >
                                    Ask about a camera
                                </Link>
                            </Stack>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* FAQ */}
            <Box component="section" id="faq" aria-labelledby="faq-title" sx={{ bgcolor: 'background.paper', pb: { xs: 8, md: 12 } }}>
                <Container maxWidth="lg">
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: { xs: 8, md: 12 } }}>
                        <SectionTitle id="faq-title">Questions.</SectionTitle>
                        <Box
                            component="dl"
                            sx={{
                                m: 0,
                                mt: { xs: 4, md: 6 },
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                columnGap: 8,
                                rowGap: 4,
                            }}
                        >
                            {faqs.map(item => (
                                <Box key={item.q}>
                                    <Typography component="dt" variant="h6">{item.q}</Typography>
                                    <Typography component="dd" color="text.secondary" sx={{ m: 0, mt: 1 }}>{item.a}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Footer />
        </>
    );
};

export default SplashPage;
