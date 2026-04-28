import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getRequestsByUserId, removeNotificationRequest, NotificationRequest } from '../../services/notificationService';
import { Paper, Typography, List, ListItem, ListItemText, IconButton, CircularProgress, Box, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import PageMeta from '../layout/PageMeta';

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
                toast.error("Could not fetch your subscriptions.");
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
            toast.success("Subscription cancelled.");
        } catch (error) {
            // Revert UI on failure
            setSubscriptions(originalSubscriptions);
            toast.error("Failed to cancel subscription.");
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    return (
        <>
            <PageMeta
                title="My Subscriptions"
                description="View and manage your active court availability notifications. See all the courts you are subscribed to and easily cancel notifications with a single click."
            />
            <Paper elevation={3} sx={{
                p: { xs: 2, md: 3 }, // Responsive padding
                maxWidth: '800px',
                mx: 'auto',
                borderRadius: '16px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                    My Subscriptions
                </Typography>
                {subscriptions.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '8px' }}>
                        You are not subscribed to any court notifications.
                    </Alert>
                ) : (
                    <List sx={{ p: 0 }}>
                        {subscriptions.map((sub, index) => (
                            <ListItem
                                key={sub.id}
                                divider={index < subscriptions.length - 1}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleCancelSub(sub.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                                sx={{ py: 1.5 }}
                            >
                                <ListItemText
                                    primary={<Typography variant="body1" sx={{ fontWeight: 500 }}>{sub.courtName}</Typography>}
                                    secondary={`Requested on: ${new Date().toLocaleDateString()}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </>
    );
};

export default SubscriptionManager;