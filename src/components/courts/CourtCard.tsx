import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import toast from 'react-hot-toast';

import { CourtCardSummary } from '../../data/courtData';
import { useAuth } from '../auth/AuthContext';
import { addNotificationRequest, getNotificationRequestForUser, removeNotificationRequest } from '../../services/notificationService';
import { trackNotificationSubscribed } from '../../services/analyticsService';
import StatusPill from '../brand/StatusPill';
import { getFacilityStatus, isStale } from '../brand/status';
import { tokens } from '../../theme';
import '../../styles/courts/CourtCard.css';

function useIsStale(lastUpdated: CourtCardSummary['lastUpdatedStatus']) {
    const [stale, setStale] = useState(() => isStale(lastUpdated));
    useEffect(() => {
        setStale(isStale(lastUpdated));
        const id = setInterval(() => setStale(isStale(lastUpdated)), 15000);
        return () => clearInterval(id);
    }, [lastUpdated]);
    return stale;
}

const CourtCardSkeleton = () => (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '10px' }}>
        <Skeleton variant="text" width="70%" height={26} />
        <Skeleton variant="text" width="45%" height={20} />
        <Skeleton variant="rounded" width={90} height={22} sx={{ mt: 3 }} />
    </Paper>
);

function SingleCourtCard({ court }: { court: CourtCardSummary }) {
    const stale = useIsStale(court.lastUpdatedStatus);
    const { status, label } = getFacilityStatus(court, stale);

    return (
        <Paper
            variant="outlined"
            className="court-card"
            sx={{
                position: 'relative',
                p: 2.5,
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                '&:hover': { borderColor: 'text.primary' },
            }}
        >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        component={RouterLink}
                        to={`/court/${court.id}`}
                        className="court-card-link"
                        sx={{ fontWeight: 600, fontSize: '1.0625rem', color: 'text.primary', display: 'block' }}
                    >
                        {court.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} noWrap>
                        {court.location}
                    </Typography>
                </Box>
                {status === 'in-use' && (
                    <Box sx={{ position: 'relative', zIndex: 1, mt: -0.5, mr: -0.75 }}>
                        <NotificationButton court={court} />
                    </Box>
                )}
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 'auto' }}>
                <Tooltip
                    title={
                        status === 'offline'
                            ? 'This camera hasn’t reported in over five minutes, so we can’t say what’s open.'
                            : status === 'unconfigured'
                                ? 'No camera here yet. Hours and address are still listed.'
                                : ''
                    }
                >
                    <span><StatusPill status={status} label={label} /></span>
                </Tooltip>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {court.distanceKm !== undefined
                        ? `${court.distanceKm.toFixed(1)} km away`
                        : `${court.total} ${court.total === 1 ? 'court' : 'courts'}`}
                </Typography>
            </Stack>
        </Paper>
    );
}

interface NotificationButtonProps {
    court: Pick<CourtCardSummary, 'id' | 'name'>;
    variant?: 'icon' | 'button';
}

export function NotificationButton({ court, variant = 'icon' }: NotificationButtonProps) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    type NotificationState = 'idle' | 'loading' | 'subscribed' | 'error';
    const [state, setState] = useState<NotificationState>('loading');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setState('idle');
            return;
        }

        let isMounted = true;
        setState('loading');

        getNotificationRequestForUser(court.id, currentUser.uid)
            .then(existingRequestId => {
                if (!isMounted) return;
                if (existingRequestId) {
                    setRequestId(existingRequestId);
                    setState('subscribed');
                } else {
                    setState('idle');
                }
            })
            .catch(() => {
                if (isMounted) setState('error');
            });

        return () => { isMounted = false; };
    }, [currentUser, court.id]);

    const handleBellClick = () => {
        if (!currentUser) {
            setAuthModalOpen(true);
        } else if (state === 'idle') {
            setConfirmModalOpen(true);
        } else if (state === 'subscribed') {
            handleUnsubscribe();
        }
    };

    const handleSubscribe = async () => {
        if (!currentUser || !currentUser.email) {
            toast.error('Your account has no email address, so we can’t send alerts.');
            return;
        }
        setConfirmModalOpen(false);
        setState('loading');
        try {
            const newRequestId = await addNotificationRequest(court.id, court.name, currentUser.uid, currentUser.email);
            setRequestId(newRequestId);
            setState('subscribed');
            toast.success(`Alert on for ${court.name}`);
            trackNotificationSubscribed(court.id, court.name, currentUser.uid, currentUser.email);
        } catch {
            setState('error');
            toast.error('Couldn’t turn on the alert. Try again.');
        }
    };

    const handleUnsubscribe = async () => {
        if (!requestId) return;
        setState('loading');
        try {
            await removeNotificationRequest(requestId);
            setRequestId(null);
            setState('idle');
            toast.success('Alert turned off');
        } catch {
            setState('error');
            toast.error('Couldn’t turn off the alert. Try again.');
        }
    };

    const tooltip = {
        subscribed: 'Alert on. Click to turn it off.',
        loading: 'Loading…',
        error: 'Something went wrong. Refresh the page.',
        idle: 'Email me when a court opens',
    }[state];

    return (
        <>
            {variant === 'button' ? (
                <Button
                    variant="outlined"
                    onClick={handleBellClick}
                    disabled={state === 'loading' || state === 'error'}
                    aria-pressed={state === 'subscribed'}
                    startIcon={state === 'loading'
                        ? <CircularProgress size={16} color="inherit" />
                        : state === 'subscribed' ? <NotificationsActiveIcon /> : <NotificationsNoneIcon />}
                    sx={state === 'subscribed' ? { color: 'primary.main', borderColor: 'primary.main' } : undefined}
                >
                    {state === 'subscribed' ? 'Alert on' : 'Alert me when one opens'}
                </Button>
            ) : (
            <Tooltip title={tooltip}>
                <span>
                    <IconButton
                        size="small"
                        onClick={handleBellClick}
                        disabled={state === 'loading' || state === 'error'}
                        aria-label={tooltip}
                        aria-pressed={state === 'subscribed'}
                        sx={{
                            color: state === 'subscribed' ? 'primary.main' : 'text.secondary',
                            bgcolor: state === 'subscribed' ? alpha(tokens.court, 0.08) : 'transparent',
                        }}
                    >
                        {state === 'loading' && <CircularProgress size={18} color="inherit" />}
                        {state === 'idle' && <NotificationsNoneIcon fontSize="small" />}
                        {state === 'subscribed' && <NotificationsActiveIcon fontSize="small" />}
                        {state === 'error' && <NotificationsNoneIcon fontSize="small" color="error" />}
                    </IconButton>
                </span>
            </Tooltip>
            )}

            <Dialog open={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Get an alert for {court.name}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        We’ll email you as soon as a court opens here. Alerts can arrive a minute or two after the court frees up.
                    </DialogContentText>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ px: 1.75, py: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}
                    >
                        <MailOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{currentUser?.email}</Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubscribe} variant="contained" autoFocus>Turn on alert</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Sign in to get alerts</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Create a free account or sign in, and we’ll email you when a court opens at {court.name}.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setAuthModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => navigate('/auth', { state: { from: location } })} autoFocus>
                        Sign in
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

interface CourtCardProps {
    courts: CourtCardSummary[];
    loading?: boolean;
    isProximityFilteringActive?: boolean;
    maxDistanceKm?: number;
    onClearFilters?: () => void;
    hasActiveFilters?: boolean;
}

function CourtCard({
    courts,
    loading,
    isProximityFilteringActive,
    maxDistanceKm,
    onClearFilters,
    hasActiveFilters,
}: CourtCardProps) {
    const displayedCourts = isProximityFilteringActive
        ? courts.filter(court => court.distanceKm !== undefined && court.distanceKm <= maxDistanceKm!)
        : courts;

    if (loading) {
        return (
            <div className="court-list">
                {Array.from({ length: 6 }).map((_, index) => <CourtCardSkeleton key={index} />)}
            </div>
        );
    }

    if (displayedCourts.length === 0) {
        return (
            <Paper
                variant="outlined"
                sx={{ py: { xs: 6, md: 8 }, px: 3, textAlign: 'center', borderRadius: '10px', borderStyle: 'dashed' }}
            >
                <Typography variant="h6" component="p">
                    {isProximityFilteringActive ? `No courts within ${maxDistanceKm} km` : 'No courts match these filters'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 380, mx: 'auto' }}>
                    {isProximityFilteringActive
                        ? 'Turn off “Nearest first” to see every facility.'
                        : 'Try a different sport or search term.'}
                </Typography>
                {hasActiveFilters && onClearFilters && (
                    <Button variant="outlined" onClick={onClearFilters} sx={{ mt: 3 }}>
                        Clear filters
                    </Button>
                )}
            </Paper>
        );
    }

    return (
        <div className="court-list">
            {displayedCourts.map(court => <SingleCourtCard key={court.id} court={court} />)}
        </div>
    );
}

export default CourtCard;
