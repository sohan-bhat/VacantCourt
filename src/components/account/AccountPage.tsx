import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useAuth } from '../auth/AuthContext';

const sections = [
    { path: '/account/profile', label: 'Profile', icon: <PersonOutlineIcon fontSize="small" /> },
    { path: '/account/subscriptions', label: 'Court alerts', icon: <NotificationsNoneIcon fontSize="small" /> },
];

const AccountPage: React.FC = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const activePath = location.pathname === '/account' ? '/account/profile' : location.pathname;

    return (
        <>
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
                <Typography component="h1" variant="h4" sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                    Account
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>{currentUser?.email}</Typography>
            </Box>

            <Tabs
                value={activePath}
                variant="fullWidth"
                sx={{ display: { xs: 'flex', md: 'none' }, mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                {sections.map(section => (
                    <Tab key={section.path} value={section.path} label={section.label} component={NavLink} to={section.path} />
                ))}
            </Tabs>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' }, gap: { md: 5 }, alignItems: 'start' }}>
                <List component="nav" aria-label="Account sections" sx={{ display: { xs: 'none', md: 'block' }, p: 0, position: 'sticky', top: 88 }}>
                    {sections.map(section => (
                        <ListItemButton
                            key={section.path}
                            component={NavLink}
                            to={section.path}
                            selected={activePath === section.path}
                            sx={{ mb: 0.5, py: 1 }}
                        >
                            <ListItemIcon>{section.icon}</ListItemIcon>
                            <ListItemText primary={section.label} slotProps={{ primary: { sx: { fontWeight: 500, fontSize: '0.9rem' } } }} />
                        </ListItemButton>
                    ))}
                </List>
                <Box sx={{ minWidth: 0, maxWidth: 720 }}>
                    <Outlet />
                </Box>
            </Box>
        </>
    );
};

export default AccountPage;
