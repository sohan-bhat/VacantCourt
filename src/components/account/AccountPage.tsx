import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    useTheme,
    useMediaQuery
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import PageMeta from '../layout/PageMeta';

const drawerWidth = 280;

const AccountPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const isLinkActive = (path: string) => {
        const baseAccountPath = '/account';
        const profilePath = '/account/profile';
        if (path === profilePath) {
            return location.pathname === baseAccountPath || location.pathname === profilePath;
        }
        return location.pathname === path;
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Toolbar sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'grey.200' }}>
                <img src='/ground.png' alt="Logo" style={{ height: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Account Center
                </Typography>
            </Toolbar>
            <Box sx={{ flexGrow: 1, p: 1.5 }}>
                <List component="nav">
                    <ListItemButton
                        selected={isLinkActive('/account/profile')}
                        onClick={() => { navigate('/account/profile'); if (isMobile) setMobileOpen(false); }}
                        sx={{ borderRadius: '8px', mb: 1 }}
                    >
                        <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                        <ListItemText primary="Profile Settings" />
                    </ListItemButton>
                    <ListItemButton
                        selected={isLinkActive('/account/subscriptions')}
                        onClick={() => { navigate('/account/subscriptions'); if (isMobile) setMobileOpen(false); }}
                        sx={{ borderRadius: '8px' }}
                    >
                        <ListItemIcon><NotificationsIcon /></ListItemIcon>
                        <ListItemText primary="My Subscriptions" />
                    </ListItemButton>
                </List>
            </Box>
            <Divider />
            <Box sx={{ p: 1.5 }}>
                <ListItemButton onClick={() => navigate('/dashboard')} sx={{ borderRadius: '8px' }}>
                    <ListItemIcon><ArrowBackIcon /></ListItemIcon>
                    <ListItemText primary="Back to Dashboard" />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <>
            <PageMeta
                title="Account Settings"
                description="Manage your VacantCourt profile. Update your display name, change your password, and manage your account details securely."
            />
            <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                {isMobile ? (
                    <>
                        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'grey.200', boxShadow: 'none' }}>
                            <Toolbar>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                    sx={{ mr: 2 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                                    Account Center
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <Drawer
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{ keepMounted: true }}
                            sx={{
                                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                            }}
                        >
                            {drawerContent}
                        </Drawer>
                    </>
                ) : (
                    <Box
                        component="aside"
                        sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
                    >
                        <Drawer variant="permanent" sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'grey.200' } }}>
                            {drawerContent}
                        </Drawer>
                    </Box>
                )}

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3, md: 4 },
                        overflowY: 'auto',
                        backgroundColor: '#f4f6f8',
                        mt: isMobile ? '64px' : '0',
                        height: isMobile ? 'calc(100vh - 64px)' : '100vh',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </>
    );
};

export default AccountPage;