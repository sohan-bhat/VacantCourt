import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import CourtSchedule from './CourtSchedule';
import TransferOwnershipDialog from '../dialog/TransferOwnershipDialog';
import { Court, subscribeToCourtById } from '../../data/courtData';
import EditCourt from './EditCourt';
import '../../styles/courts/CourtDetails.css';
import {
    CircularProgress,
    IconButton,
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    useTheme,
    useMediaQuery,
    Grow,
    alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PlaceIcon from '@mui/icons-material/Place';
import DirectionsIcon from '@mui/icons-material/Directions';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useAuth } from '../auth/AuthContext';
import { deleteDocument } from '../../services/firestoreService';
import { useNavigate } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {
    Dialog as ConfirmationDialog,
    DialogActions as ConfirmationDialogActions,
    DialogContent as ConfirmationDialogContent,
    DialogContentText as ConfirmationDialogContentText,
    DialogTitle as ConfirmationDialogTitle,
} from '@mui/material';
import toast from 'react-hot-toast';
import PageMeta from '../layout/PageMeta';



interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    isMobile: boolean;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, isMobile, ...other } = props;

    if (isMobile) {
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 0 }}>
                        {children}
                    </Box>
                )}
            </div>
        );
    }
    return <Box sx={{ p: 0 }}>{children}</Box>;
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


function CourtDetails() {
    const { currentUser } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [courtDetails, setCourtDetails] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);

    const theme = useTheme();
    const isMobileView = useMediaQuery(theme.breakpoints.down('md'));

    const imagePanelRef = useRef<HTMLDivElement>(null);
    const detailsPanelRef = useRef<HTMLDivElement>(null);
    const [panelsMinHeight, setPanelsMinHeight] = useState<number | 'auto'>('auto');

    const [court, setCourt] = useState<Court | null>(null);
    const [isTransferDialogOpen, setTransferDialogOpen] = useState(false); // <-- ADD STATE

    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("Court ID is missing.");
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
                console.error("Failed to subscribe to court details:", err);
                setError("Failed to load court details. Please try again.");
                setLoading(false);
            }
        );
        return () => {
            unsubscribe();
        };
    }, [id]);

    useEffect(() => {
        if (courtDetails && courtDetails.images && courtDetails.images.length > 0) {
            if (selectedImageIndex >= courtDetails.images.length) {
                setSelectedImageIndex(0);
            }
        } else {
            setSelectedImageIndex(0);
        }
    }, [courtDetails, selectedImageIndex]);


    useEffect(() => {
        if (!isMobileView && imagePanelRef.current && detailsPanelRef.current) {
            const imageHeight = imagePanelRef.current.scrollHeight;
            const detailsHeight = detailsPanelRef.current.scrollHeight;
            setPanelsMinHeight(Math.max(imageHeight, detailsHeight));
        } else {
            setPanelsMinHeight('auto');
        }
    }, [courtDetails, isMobileView, activeTab]);

    const isOwner = currentUser && courtDetails && currentUser.uid === courtDetails.ownerId;

    const handleOpenEditModal = () => {
        if (!isOwner) {
            toast.error("You are not authorized to edit this facility.");
            return;
        }
        setEditModalOpen(true);
    };


    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    const handleOpenDeleteConfirm = () => {
        if (!isOwner) {
            toast.error("You are not authorized to delete this facility.");
            return;
        }
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
    };

    const handleDeleteCourt = async () => {
        if (!isOwner || !courtDetails || !id) {
            toast.error("Cannot delete facility. Authorization or data missing.");
            setDeleteConfirmOpen(false);
            return;
        }
        try {
            await deleteDocument('Courts', id);
            toast.success('Facility deleted successfully.');
            navigate('/dashboard');
        } catch (error) {
            console.error("Error deleting facility:", error);
            toast.error('Failed to delete facility. Please try again.');
        } finally {
            setDeleteConfirmOpen(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleImageNav = (direction: 'prev' | 'next') => {
        if (!courtDetails?.images || courtDetails.images.length === 0) return;
        const totalImages = courtDetails.images.length;
        if (direction === 'next') {
            setSelectedImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
        } else {
            setSelectedImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
        }
    };

    const getDirectionsLink = () => {
        if (courtDetails?.address) {
            return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(courtDetails.address)}`;
        } else if (courtDetails?.latitude && courtDetails?.longitude) {
            return `https://www.google.com/maps/dir/?api=1&destination=${courtDetails.latitude},${courtDetails.longitude}`;
        }
        return '#';
    };


    if (loading) {
        return (<>
            <PageMeta title="Loading Court..." />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        </>);
    }
    if (error) {
        return <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>{error}</Box>;
    }
    if (!courtDetails) {
        return <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>Court not found or is not currently available.</Box>;
    }

    return (
        <>
            {courtDetails && (
                <PageMeta
                    title={courtDetails.name}
                    description={`Check the status and details for the ${courtDetails.courts} courts at ${courtDetails.name}, located in ${courtDetails.location}.`}
                />
            )}
            <Box className="court-details-page-container">
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: { xs: 2, md: 3 },
                    gap: { xs: 1, md: 1.5 }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
                        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                            <IconButton color="primary" sx={{ p: 0.5 }}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Link>
                        <Typography variant={isMobileView ? "h5" : "h4"} component="h2" sx={{
                            ml: { xs: 1, sm: 2 },
                            color: 'primary.dark',
                            fontWeight: 700,
                            flexShrink: 1,
                            minWidth: 0,
                            wordBreak: 'break-word',
                        }}>
                            {courtDetails.name}
                        </Typography>
                        <Box sx={{
                            ml: { xs: 1, sm: 2 },
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.dark,
                            px: '8px', py: '4px',
                            borderRadius: '16px',
                            fontSize: isMobileView ? '0.9rem' : '1.1rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}>
                            {courtDetails.type}
                        </Box>
                    </Box>
                    {isOwner && (
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                            <IconButton onClick={handleOpenEditModal} color="primary" aria-label="edit court" sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: '8px', p: 0.75 }}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={handleOpenDeleteConfirm} color="error" aria-label="delete court" sx={{ border: `1px solid ${theme.palette.error.main}`, borderRadius: '8px', p: 0.75 }}>
                                <DeleteForeverIcon />
                            </IconButton>
                            <IconButton
                                color="secondary"
                                onClick={() => setTransferDialogOpen(true)}
                                sx={{ border: `1px solid ${theme.palette.secondary.main}`, borderRadius: '8px', p: 0.75 }}
                            >
                                <SwapHorizIcon />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                {isMobileView && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            aria-label="court details tabs"
                            variant="fullWidth"
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                '& .MuiTabs-flexContainer': {
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    borderRadius: 1.25,
                                    overflow: 'hidden',
                                },
                                '& .MuiTab-root': {
                                    color: theme.palette.primary.main,
                                    '&.Mui-selected': {
                                        color: theme.palette.common.white,
                                        backgroundColor: theme.palette.primary.main,
                                    },
                                    '&:not(:last-of-type)': {
                                        borderRight: `1px solid ${theme.palette.primary.main}`,
                                    },
                                },
                                '& .MuiTabs-indicator': {
                                    display: 'none',
                                },
                            }}
                        >
                            <Tab label="Information" {...a11yProps(0)} />
                            <Tab label="Availability" {...a11yProps(1)} />
                        </Tabs>
                    </Box>
                )}

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 3 },
                }}>
                    {(!isMobileView || (isMobileView && activeTab === 0)) && (
                        <Box sx={{ flex: { md: '1 1 50%' }, minWidth: 0 }}>
                            <Paper elevation={3} sx={{
                                p: 0,
                                borderRadius: 1.25,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    width: '100%',
                                    height: { xs: 200, sm: 250 },
                                    overflow: 'hidden',
                                    position: 'relative',
                                    bgcolor: 'grey.200',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {courtDetails.images && courtDetails.images.length > 0 ? (
                                        <>
                                            <Grow in={true} key={selectedImageIndex}>
                                                <img
                                                    src={courtDetails.images[selectedImageIndex]}
                                                    alt={`${courtDetails.name} - Image ${selectedImageIndex + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </Grow>
                                            {courtDetails.images.length > 1 && (
                                                <>
                                                    <IconButton
                                                        onClick={() => handleImageNav('prev')}
                                                        sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: alpha(theme.palette.common.black, 0.4), color: 'white', '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.6) }, p: 1, borderRadius: '50%', fontSize: '2rem' }}>
                                                        <ChevronLeftIcon fontSize="inherit" />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleImageNav('next')}
                                                        sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: alpha(theme.palette.common.black, 0.4), color: 'white', '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.6) }, p: 1, borderRadius: '50%', fontSize: '2rem' }}>
                                                        <ChevronRightIcon fontSize="inherit" />
                                                    </IconButton>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="body1" color="text.secondary">No Images Available</Typography>
                                    )}
                                </Box>

                                {courtDetails.amenities && courtDetails.amenities.length > 0 && (
                                    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                                        <Typography variant="h6" component="h3" color="primary.dark" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                            Amenities
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {courtDetails.amenities.map((amenity, index) => (
                                                <Grid key={index}>
                                                    <ListItem disableGutters sx={{ py: 0.5 }}>
                                                        <ListItemIcon sx={{ minWidth: 35, color: 'success.main' }}><CheckCircleOutlineIcon /></ListItemIcon>
                                                        <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem' }}>{amenity}</Typography>} />
                                                    </ListItem>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    )}

                    {(!isMobileView || (isMobileView && activeTab === 0)) && (
                        <Box sx={{ flex: { md: '1 1 50%' }, minWidth: 0 }}>
                            <Paper elevation={3} sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: 1.25,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {courtDetails.description && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" component="h3" color="primary.dark" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                            About
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                            {courtDetails.description}
                                        </Typography>
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="h6" component="h3" color="primary.dark" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                        Contact & Location
                                    </Typography>
                                    <List dense disablePadding>
                                        {courtDetails.location && (
                                            <ListItem disableGutters sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}><PlaceIcon /></ListItemIcon>
                                                <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>General Area: <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>{courtDetails.location}</Typography></Typography>} />
                                            </ListItem>
                                        )}
                                        {courtDetails.address && (
                                            <ListItem disableGutters sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}><LocationOnIcon /></ListItemIcon>
                                                <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Address: <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>{courtDetails.address}</Typography></Typography>} />
                                            </ListItem>
                                        )}
                                        {courtDetails.phone && (
                                            <ListItem disableGutters sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}><PhoneIcon /></ListItemIcon>
                                                <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Phone: <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>{courtDetails.phone}</Typography></Typography>} />
                                            </ListItem>
                                        )}
                                        {courtDetails.hours && (
                                            <ListItem disableGutters sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}><AccessTimeIcon /></ListItemIcon>
                                                <ListItemText primary={<Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Hours: <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>{courtDetails.hours}</Typography></Typography>} />
                                            </ListItem>
                                        )}
                                        {courtDetails.address && (
                                            <ListItem disableGutters sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 35, color: 'primary.main' }}>
                                                    <DirectionsIcon />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    <a href={getDirectionsLink()} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                        <Button variant="outlined" size="small"
                                                            sx={{
                                                                borderColor: 'primary.main', color: 'primary.main',
                                                                '&:hover': { borderColor: 'primary.dark', bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                                                fontSize: '0.8rem'
                                                            }}>
                                                            Get Directions
                                                        </Button>
                                                    </a>
                                                </ListItemText>
                                            </ListItem>
                                        )}
                                    </List>
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </Box>

                {(!isMobileView || (isMobileView && activeTab === 1)) && (
                    <Box sx={{ mt: { xs: 2, md: 4 } }}>
                        <Paper elevation={3} sx={{
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 1.25,
                        }}>
                            <Typography variant="h6" component="h3" color="primary.dark" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                Court Availability
                            </Typography>
                            {courtDetails.courts && courtDetails.courts.length > 0 ? (
                                <CourtSchedule courts={courtDetails.courts} />
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.9rem' }}>
                                    No individual courts have been configured for this facility yet.
                                </Typography>
                            )}
                        </Paper>
                    </Box>
                )}
            </Box >

            {courtDetails && (
                <>
                    <EditCourt
                        open={editModalOpen}
                        onClose={handleCloseEditModal}
                        court={courtDetails}
                    />

                    <TransferOwnershipDialog
                        open={isTransferDialogOpen}
                        onClose={() => setTransferDialogOpen(false)}
                        courtId={courtDetails.id}
                        courtName={courtDetails.name}
                        onSuccess={() => {
                            setTransferDialogOpen(false);
                            navigate('/dashboard');
                        }} />
                </>
            )}



            <ConfirmationDialog
                open={deleteConfirmOpen}
                onClose={handleCloseDeleteConfirm}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <ConfirmationDialogTitle id="alert-dialog-title">
                    {"Confirm Deletion"}
                </ConfirmationDialogTitle>
                <ConfirmationDialogContent>
                    <ConfirmationDialogContentText id="alert-dialog-description">
                        Are you sure you want to delete the facility "{courtDetails?.name}"? This action cannot be undone.
                    </ConfirmationDialogContentText>
                </ConfirmationDialogContent>
                <ConfirmationDialogActions>
                    <Button onClick={handleCloseDeleteConfirm} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteCourt} color="error" autoFocus>
                        Delete
                    </Button>
                </ConfirmationDialogActions>
            </ConfirmationDialog>
        </>
    );
}

export default CourtDetails;