import { useState, MouseEvent } from 'react';
import { Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    ButtonBase,
    Container,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import toast from 'react-hot-toast';

import AddCourt from '../courts/AddCourt';
import Logo from '../brand/Logo';
import { useAuth } from '../auth/AuthContext';

interface HeaderProps {
    variant?: 'app' | 'marketing';
}

const marketingLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Courts', href: '#courts' },
    { label: 'Questions', href: '#faq' },
];

const navLinkSx = {
    px: 1.25,
    py: 0.75,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'inherit',
    opacity: 0.8,
    '&:hover, &.active': { opacity: 1, textDecoration: 'underline', textUnderlineOffset: '6px', textDecorationThickness: '1px' },
};

function Header({ variant = 'app' }: HeaderProps) {
    const [openAddCourt, setOpenAddCourt] = useState(false);
    const { currentUser, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const isMarketing = variant === 'marketing';

    const openMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const closeMenu = () => setAnchorEl(null);

    const goToAuth = () => navigate('/auth', { state: { from: location } });

    const handleLogout = async () => {
        closeMenu();
        try {
            await logout();
            toast.success('Signed out');
            navigate('/');
        } catch (error) {
            toast.error('Sign out failed. Try again.');
            console.error('Logout error:', error);
        }
    };

    const initials = (currentUser?.displayName || currentUser?.email || '?')
        .split(/[\s@]/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('');

    const renderActions = () => {
        if (isLoading) {
            return <Box sx={{ width: 120, height: 36 }} />;
        }

        if (!currentUser) {
            return (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        variant={isMarketing ? 'text' : 'outlined'}
                        color="inherit"
                        onClick={goToAuth}
                        sx={isMarketing ? { color: 'inherit', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } } : undefined}
                    >
                        Sign in
                    </Button>
                    <IconButton
                        onClick={openMenu}
                        aria-label="Open menu"
                        aria-controls={menuOpen ? 'site-menu' : undefined}
                        aria-haspopup="true"
                        sx={{ display: { xs: isMarketing ? 'none' : 'inline-flex', sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Stack>
            );
        }

        return (
            <Stack direction="row" spacing={1} alignItems="center">
                {isMarketing ? (
                    <Button
                        component={RouterLink}
                        to="/dashboard"
                        sx={{ color: 'inherit', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        Courts
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={() => setOpenAddCourt(true)}
                        startIcon={<AddIcon />}
                        sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                    >
                        Add court
                    </Button>
                )}
                <ButtonBase
                    onClick={openMenu}
                    aria-label="Account menu"
                    aria-controls={menuOpen ? 'site-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? 'true' : undefined}
                    sx={{ borderRadius: '50%', ml: 0.5 }}
                >
                    <Avatar
                        src={currentUser.photoURL || undefined}
                        alt={currentUser.displayName || 'Account'}
                        sx={{
                            width: 36,
                            height: 36,
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            bgcolor: 'primary.main',
                            border: '2px solid',
                            borderColor: isMarketing ? 'common.white' : 'divider',
                        }}
                    >
                        {initials}
                    </Avatar>
                </ButtonBase>
            </Stack>
        );
    };

    return (
        <AppBar
            position={isMarketing ? 'static' : 'sticky'}
            sx={isMarketing
                ? { bgcolor: 'transparent', color: 'common.white' }
                : { top: 0, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary' }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: { xs: 60, sm: 64 }, gap: 3 }}>
                    <Box component={RouterLink} to="/" aria-label="VacantCourt home" sx={{ display: 'inline-flex', borderRadius: 1 }}>
                        <Logo size={28} inverted={isMarketing} />
                    </Box>

                    <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
                        {isMarketing
                            ? marketingLinks.map(link => (
                                <Box key={link.href} component="a" href={link.href} sx={navLinkSx}>
                                    {link.label}
                                </Box>
                            ))
                            : (
                                <Box component={NavLink} to="/dashboard" sx={navLinkSx}>
                                    Courts
                                </Box>
                            )}
                    </Stack>
                    <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }} />

                    {renderActions()}
                </Toolbar>
            </Container>

            <Menu
                id="site-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={closeMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {currentUser && (
                    <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
                        <Typography variant="subtitle2" noWrap>
                            {currentUser.displayName || 'Your account'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap component="div">
                            {currentUser.email}
                        </Typography>
                    </Box>
                )}
                {currentUser && <Divider sx={{ my: 0.5 }} />}
                {currentUser && (
                    <MenuItem onClick={() => { closeMenu(); setOpenAddCourt(true); }} sx={{ display: { sm: 'none' } }}>
                        <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Add court</ListItemText>
                    </MenuItem>
                )}
                {currentUser && (
                    <MenuItem component={RouterLink} to="/account/profile" onClick={closeMenu}>
                        <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Account settings</ListItemText>
                    </MenuItem>
                )}
                {currentUser && (
                    <MenuItem component={RouterLink} to="/account/subscriptions" onClick={closeMenu}>
                        <ListItemIcon><NotificationsNoneIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Court alerts</ListItemText>
                    </MenuItem>
                )}
                {currentUser && <Divider sx={{ my: 0.5 }} />}
                <MenuItem component={RouterLink} to="/privacy" onClick={closeMenu}>
                    <ListItemIcon><ShieldOutlinedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Privacy policy</ListItemText>
                </MenuItem>
                <MenuItem component={RouterLink} to="/tos" onClick={closeMenu}>
                    <ListItemIcon><DescriptionOutlinedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Terms of service</ListItemText>
                </MenuItem>
                {currentUser && <Divider sx={{ my: 0.5 }} />}
                {currentUser && (
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Sign out</ListItemText>
                    </MenuItem>
                )}
            </Menu>

            {currentUser && <AddCourt open={openAddCourt} onClose={() => setOpenAddCourt(false)} />}
        </AppBar>
    );
}

export default Header;
