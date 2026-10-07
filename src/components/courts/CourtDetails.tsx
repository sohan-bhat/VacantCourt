import { useState, useEffect, MouseEvent } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import toast from 'react-hot-toast';

import CourtSchedule from './CourtSchedule';
import EditCourt from './EditCourt';
import TransferOwnershipDialog from '../dialog/TransferOwnershipDialog';
import { NotificationButton } from './CourtCard';
import { Court, subscribeToCourtById } from '../../data/courtData';
import { useAuth } from '../auth/AuthContext';
import { deleteDocument } from '../../services/firestoreService';
import PageMeta from '../layout/PageMeta';
import StatusPill from '../brand/StatusPill';
import { STALE_THRESHOLD_SECONDS, formatAgo, secondsSince } from '../brand/status';
import { tokens } from '../../theme';

function SectionHeading({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
    return (
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h6" component="h2">{children}</Typography>
            {aside}
        </Stack>
    );
}

function useSecondsSince(timestamp: number | undefined) {
    const [age, setAge] = useState(() => secondsSince(timestamp ?? null));
    useEffect(() => {
        setAge(secondsSince(timestamp ?? null));
        const id = setInterval(() => setAge(secondsSince(timestamp ?? null)), 5000);
        return () => clearInterval(id);
    }, [timestamp]);
    return age;
}

function DetailsSkeleton() {
    return (
        <Box>
            <Skeleton variant="text" width={120} height={22} />
            <Skeleton variant="text" width="50%" height={52} sx={{ mt: 2 }} />
            <Skeleton variant="text" width="30%" height={24} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mt: 4 }}>
                <Skeleton variant="rounded" height={320} sx={{ borderRadius: '10px' }} />
                <Skeleton variant="rounded" height={260} sx={{ borderRadius: '10px' }} />
            </Box>
        </Box>
    );
}

function CourtDetails() {
    const { currentUser } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [courtDetails, setCourtDetails] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [isTransferDialogOpen, setTransferDialogOpen] = useState(false);
    const [manageAnchor, setManageAnchor] = useState<null | HTMLElement>(null);

    const age = useSecondsSince(courtDetails?.lastUpdatedStatus);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError('This link is missing a court ID.');
            setCourtDetails(null);
            return;
        }
        setLoading(true);
        setError(null);
        setCourtDetails(null);
        const unsubscribe = subscribeToCourtById(
            id,
            (fetchedCourt) => {
                setCourtDetails(fetchedCourt);
                setLoading(false);
            },
            (err) => {
                console.error('Failed to subscribe to court details:', err);
                setError('We couldn’t load this facility. Check your connection and reload.');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const count = courtDetails?.images?.length ?? 0;
        if (selectedImageIndex >= count && selectedImageIndex !== 0) setSelectedImageIndex(0);
    }, [courtDetails, selectedImageIndex]);

    const isOwner = !!(currentUser && courtDetails && currentUser.uid === courtDetails.ownerId);

    const openManageMenu = (event: MouseEvent<HTMLElement>) => setManageAnchor(event.currentTarget);
    const closeManageMenu = () => setManageAnchor(null);

    const handleDeleteCourt = async () => {
        if (!isOwner || !courtDetails || !id) {
            toast.error('Only the facility owner can delete it.');
            setDeleteConfirmOpen(false);
            return;
        }
        try {
            await deleteDocument('Courts', id);
            toast.success('Facility deleted');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error deleting facility:', err);
            toast.error('Couldn’t delete the facility. Try again.');
        } finally {
            setDeleteConfirmOpen(false);
        }
    };

    const handleImageNav = (direction: 'prev' | 'next') => {
        const total = courtDetails?.images?.length ?? 0;
        if (!total) return;
        setSelectedImageIndex(prev => (direction === 'next' ? (prev + 1) % total : (prev - 1 + total) % total));
    };

    const getDirectionsLink = () => {
        if (courtDetails?.address) {
            return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(courtDetails.address)}`;
        }
        if (courtDetails?.latitude && courtDetails?.longitude) {
            return `https://www.google.com/maps/dir/?api=1&destination=${courtDetails.latitude},${courtDetails.longitude}`;
        }
        return undefined;
    };

    const backLink = (
        <Button
            component={RouterLink}
            to="/dashboard"
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ color: 'text.secondary', ml: -1, mb: 2, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
        >
            All courts
        </Button>
    );

    if (loading) {
        return (
            <>
                <PageMeta title="Loading court" />
                <DetailsSkeleton />
            </>
        );
    }

    if (error || !courtDetails) {
        return (
            <>
                {backLink}
                <Paper variant="outlined" sx={{ py: 8, px: 3, textAlign: 'center', borderRadius: '10px' }}>
                    <Typography variant="h6" component="h1">{error ? 'Something went wrong' : 'Facility not found'}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        {error ?? 'It may have been removed, or the link is wrong.'}
                    </Typography>
                    <Button component={RouterLink} to="/dashboard" variant="contained" sx={{ mt: 3 }}>Browse courts</Button>
                </Paper>
            </>
        );
    }

    const subCourts = courtDetails.courts ?? [];
    const configured = subCourts.filter(c => c.isConfigured);
    const openCount = configured.filter(c => c.status === 'available').length;
    const isStale = age !== null && age > STALE_THRESHOLD_SECONDS;
    const hasLive = configured.length > 0;
    const allInUse = hasLive && !isStale && openCount === 0;
    const images = courtDetails.images ?? [];
    const directionsLink = getDirectionsLink();

    const summaryPill = !hasLive
        ? <StatusPill status="unconfigured" label="No live status" />
        : isStale
            ? <StatusPill status="offline" />
            : openCount > 0
                ? <StatusPill status="open" label={`${openCount} of ${configured.length} open`} />
                : <StatusPill status="in-use" label="All courts in use" />;

    const infoRows = [
        courtDetails.address && { icon: <PlaceOutlinedIcon fontSize="small" />, label: 'Address', value: courtDetails.address },
        courtDetails.hours && { icon: <AccessTimeIcon fontSize="small" />, label: 'Hours', value: courtDetails.hours },
        courtDetails.phone && {
            icon: <PhoneOutlinedIcon fontSize="small" />,
            label: 'Phone',
            value: <Box component="a" href={`tel:${courtDetails.phone}`} sx={{ color: 'inherit', '&:hover': { color: 'primary.main' } }}>{courtDetails.phone}</Box>,
        },
    ].filter(Boolean) as { icon: React.ReactNode; label: string; value: React.ReactNode }[];

    return (
        <>
            <PageMeta
                title={courtDetails.name}
                description={`Live status, hours, and directions for the ${subCourts.length} courts at ${courtDetails.name} in ${courtDetails.location}.`}
            />

            {backLink}

            {/* Header */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                spacing={2.5}
                sx={{ mb: { xs: 3, md: 4 } }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography component="h1" variant="h3" sx={{ fontSize: { xs: '1.875rem', md: '2.5rem' }, wordBreak: 'break-word' }}>
                        {courtDetails.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={1.25} sx={{ mt: 1.5 }}>
                        {summaryPill}
                        <Typography variant="body2" color="text.secondary">{courtDetails.location} · {courtDetails.type}</Typography>
                    </Stack>
                </Box>

                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    {allInUse && <NotificationButton court={{ id: courtDetails.id, name: courtDetails.name }} variant="button" />}
                    {directionsLink && (
                        <Button
                            component="a"
                            href={directionsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            startIcon={<DirectionsOutlinedIcon />}
                        >
                            Directions
                        </Button>
                    )}
                    {isOwner && (
                        <Button variant="outlined" onClick={openManageMenu} endIcon={<ExpandMoreIcon />} aria-haspopup="true">
                            Manage
                        </Button>
                    )}
                </Stack>
            </Stack>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(280px, 1fr)' },
                    gap: { xs: 3, md: 4 },
                    alignItems: 'start',
                }}
            >
                <Stack spacing={3} sx={{ minWidth: 0 }}>
                    {/* Live courts */}
                    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: '10px' }}>
                        <SectionHeading
                            aside={hasLive && (
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                    Updated {formatAgo(age)}
                                </Typography>
                            )}
                        >
                            Courts
                        </SectionHeading>
                        {isStale && (
                            <Alert severity="warning" sx={{ mb: 2.5 }}>
                                The camera here last reported {formatAgo(age)}, so we can’t say which courts are open right now.
                            </Alert>
                        )}
                        {subCourts.length > 0 ? (
                            <CourtSchedule courts={subCourts} isStale={isStale} />
                        ) : (
                            <Typography color="text.secondary">This facility hasn’t listed its courts yet.</Typography>
                        )}
                    </Paper>

                    {/* Photos */}
                    {images.length > 0 && (
                        <Paper variant="outlined" sx={{ p: { xs: 1, sm: 1.5 }, borderRadius: '10px' }}>
                            <Box sx={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', bgcolor: 'grey.100', aspectRatio: '16 / 9' }}>
                                <Box
                                    component="img"
                                    key={selectedImageIndex}
                                    src={images[selectedImageIndex]}
                                    alt={`${courtDetails.name}, photo ${selectedImageIndex + 1} of ${images.length}`}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                                {images.length > 1 && (
                                    <>
                                        {(['prev', 'next'] as const).map(direction => (
                                            <IconButton
                                                key={direction}
                                                onClick={() => handleImageNav(direction)}
                                                aria-label={direction === 'prev' ? 'Previous photo' : 'Next photo'}
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    [direction === 'prev' ? 'left' : 'right']: 12,
                                                    transform: 'translateY(-50%)',
                                                    bgcolor: '#fff',
                                                    border: `1px solid ${tokens.ink}`,
                                                    '&:hover': { bgcolor: '#fff' },
                                                }}
                                            >
                                                {direction === 'prev' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                                            </IconButton>
                                        ))}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 12,
                                                right: 12,
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: 999,
                                                bgcolor: alpha(tokens.ink, 0.7),
                                                color: 'common.white',
                                                fontFamily: tokens.fontMono,
                                                fontSize: '0.72rem',
                                            }}
                                        >
                                            {selectedImageIndex + 1} / {images.length}
                                        </Box>
                                    </>
                                )}
                            </Box>
                            {images.length > 1 && (
                                <Stack direction="row" spacing={1} sx={{ mt: 1, overflowX: 'auto', pb: 0.5 }}>
                                    {images.map((src, i) => (
                                        <Box
                                            key={src + i}
                                            component="button"
                                            type="button"
                                            onClick={() => setSelectedImageIndex(i)}
                                            aria-label={`Show photo ${i + 1}`}
                                            aria-current={i === selectedImageIndex}
                                            sx={{
                                                p: 0,
                                                border: '2px solid',
                                                borderColor: i === selectedImageIndex ? 'primary.main' : 'transparent',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                flexShrink: 0,
                                                width: 72,
                                                height: 48,
                                                bgcolor: 'grey.100',
                                                opacity: i === selectedImageIndex ? 1 : 0.7,
                                                '&:hover': { opacity: 1 },
                                            }}
                                        >
                                            <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Paper>
                    )}

                    {/* About */}
                    {(courtDetails.description || courtDetails.amenities?.length > 0) && (
                        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: '10px' }}>
                            {courtDetails.description && (
                                <>
                                    <SectionHeading>About</SectionHeading>
                                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{courtDetails.description}</Typography>
                                </>
                            )}
                            {courtDetails.description && courtDetails.amenities?.length > 0 && <Divider sx={{ my: 3 }} />}
                            {courtDetails.amenities?.length > 0 && (
                                <>
                                    <SectionHeading>Amenities</SectionHeading>
                                    <Box
                                        component="ul"
                                        sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}
                                    >
                                        {courtDetails.amenities.map(amenity => (
                                            <Stack component="li" key={amenity} direction="row" spacing={1.25} alignItems="center">
                                                <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
                                                <Typography variant="body2">{amenity}</Typography>
                                            </Stack>
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Paper>
                    )}
                </Stack>

                {/* Sidebar */}
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: '10px', position: { md: 'sticky' }, top: { md: 88 } }}>
                    <SectionHeading>Visit</SectionHeading>
                    {infoRows.length > 0 ? (
                        <Stack divider={<Divider />} spacing={2}>
                            {infoRows.map(row => (
                                <Stack key={row.label} direction="row" spacing={1.5}>
                                    <Box sx={{ color: 'text.secondary', pt: 0.25 }}>{row.icon}</Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="overline" color="text.secondary" component="div" sx={{ lineHeight: 1.4 }}>
                                            {row.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{row.value}</Typography>
                                    </Box>
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">No contact details listed.</Typography>
                    )}
                    {directionsLink && (
                        <Button
                            component="a"
                            href={directionsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            fullWidth
                            startIcon={<DirectionsOutlinedIcon />}
                            sx={{ mt: 3 }}
                        >
                            Open in Google Maps
                        </Button>
                    )}
                </Paper>
            </Box>

            <Menu
                anchorEl={manageAnchor}
                open={Boolean(manageAnchor)}
                onClose={closeManageMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => { closeManageMenu(); setEditModalOpen(true); }}>
                    <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit facility</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { closeManageMenu(); setTransferDialogOpen(true); }}>
                    <ListItemIcon><SwapHorizIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Transfer ownership</ListItemText>
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={() => { closeManageMenu(); setDeleteConfirmOpen(true); }} sx={{ color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main' } }}>
                    <ListItemIcon><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Delete facility</ListItemText>
                </MenuItem>
            </Menu>

            {isOwner && (
                <>
                    <EditCourt open={editModalOpen} onClose={() => setEditModalOpen(false)} court={courtDetails} />
                    <TransferOwnershipDialog
                        open={isTransferDialogOpen}
                        onClose={() => setTransferDialogOpen(false)}
                        courtId={courtDetails.id}
                        courtName={courtDetails.name}
                        onSuccess={() => {
                            setTransferDialogOpen(false);
                            navigate('/dashboard');
                        }}
                    />
                </>
            )}

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete {courtDetails.name}?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This removes the facility and its courts for everyone. You can’t undo this.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteCourt}>Delete facility</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default CourtDetails;
