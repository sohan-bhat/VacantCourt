import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getRequestsByUserId, removeNotificationRequest, NotificationRequest } from '../../services/notificationService';
import { Link as RouterLink } from 'react-router-dom';
import { Paper, Typography, IconButton, Box, Button, Skeleton, Stack, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import toast from 'react-hot-toast';
import PageMeta from '../layout/PageMeta';

function formatRequestedAt(value: unknown): string | null {
    // Firestore returns a Timestamp; older records may hold a Date or nothing.
    const date = value && typeof (value as { toDate?: () => Date }).toDate === 'function'
        ? (value as { toDate: () => Date }).toDate()
        : value instanceof Date ? value : null;
    return date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;
}

const SubscriptionManager: React.FC = () => {
    const { currentUser } = useAuth();
    const [subscriptions, setSubscriptions] = useState<NotificationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        const fetchSubs = async () => {
            setIsLoading(true);
            try {
                const subs = await getRequestsByUserId(currentUser.uid);
                setSubscriptions(subs);
            } catch (error) {
                toast.error('Couldn’t load your alerts.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubs();
    }, [currentUser]);

    const handleCancelSub = async (requestId: string) => {
        const originalSubscriptions = subscriptions;
        // Optimistically update the UI
        setSubscriptions(prev => prev.filter(sub => sub.id !== requestId));

        try {
            await removeNotificationRequest(requestId);
            toast.success('Alert turned off');
        } catch (error) {
            // Revert UI on failure
            setSubscriptions(originalSubscriptions);
            toast.error('Couldn’t turn off the alert. Try again.');
        }
    };

    return (
        <>
            <PageMeta
                title="Court Alerts"
                description="See the courts you've asked to be alerted about and turn alerts off."
            />
            <Paper variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden' }}>
                <Box sx={{ px: { xs: 2.5, md: 3.5 }, pt: { xs: 2.5, md: 3.5 }, pb: 2 }}>
                    <Typography variant="h6" component="h2">Court alerts</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        We email you when a court opens at any of these facilities.
                    </Typography>
                </Box>

                {isLoading ? (
                    <Stack sx={{ px: { xs: 2.5, md: 3.5 }, pb: 3 }} spacing={1.5}>
                        {[0, 1].map(i => <Skeleton key={i} variant="rounded" height={56} />)}
                    </Stack>
                ) : subscriptions.length === 0 ? (
                    <Box sx={{ textAlign: 'center', px: 3, py: 6, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'grey.100', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>
                            <NotificationsNoneIcon sx={{ color: 'text.secondary' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 600 }}>No alerts yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 340, mx: 'auto' }}>
                            When every court at a facility is in use, tap the bell on its card to get an email when one opens.
                        </Typography>
                        <Button component={RouterLink} to="/dashboard" variant="outlined" sx={{ mt: 3 }}>Browse courts</Button>
                    </Box>
                ) : (
                    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                        {subscriptions.map(sub => {
                            const requested = formatRequestedAt(sub.requestedAt);
                            return (
                                <Stack
                                    component="li"
                                    key={sub.id}
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                    sx={{ px: { xs: 2.5, md: 3.5 }, py: 2, borderTop: '1px solid', borderColor: 'divider' }}
                                >
                                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'grey.100', color: 'primary.main', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                        <NotificationsActiveOutlinedIcon fontSize="small" />
                                    </Box>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography
                                            component={RouterLink}
                                            to={`/court/${sub.courtId}`}
                                            sx={{ fontWeight: 600, color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                                            noWrap
                                        >
                                            {sub.courtName}
                                        </Typography>
                                        {requested && (
                                            <Typography variant="caption" color="text.secondary" component="div">Since {requested}</Typography>
                                        )}
                                    </Box>
                                    <Tooltip title="Turn off alert">
                                        <IconButton aria-label={`Turn off alert for ${sub.courtName}`} onClick={() => handleCancelSub(sub.id)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            );
                        })}
                    </Box>
                )}
            </Paper>
        </>
    );
};

export default SubscriptionManager;