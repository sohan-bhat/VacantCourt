import { useState, useEffect, useCallback } from 'react';
import CourtCard from '../courts/CourtCard';
import CourtMap from '../courts/CourtMap';
import FilterControls from './FilterControls';
import SearchBar from './SearchBar';
import '../../styles/dashboard/Dashboard.css';
import { subscribeToCourtsSummary, CourtCardSummary, getDistanceFromLatLonInKm } from '../../data/courtData';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Tooltip,
    IconButton,
    useTheme,
    useMediaQuery,
    Switch,
    FormControlLabel,
    Stack
} from '@mui/material';
import LocationDisabledIcon from '@mui/icons-material/LocationDisabled';
import LocationOn from '@mui/icons-material/LocationOn'
import MyLocationIcon from '@mui/icons-material/MyLocation';
import toast from 'react-hot-toast';
import PageMeta from '../layout/PageMeta';

const MAX_DISTANCE_KM = 40;

const LOCATION_PERMISSION_KEY = 'vacantCourtLocationPermission';
const USER_LOCATION_KEY = 'vacantCourtUserLocation';

type GeolocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'error';


function Dashboard() {
    const [courts, setCourts] = useState<CourtCardSummary[]>([]);
    const [viewMode, setViewMode] = useState('list');
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(() => {
        const storedLocation = localStorage.getItem(USER_LOCATION_KEY);
        return storedLocation ? JSON.parse(storedLocation) : null;
    });

    const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>(() => {
        const storedPermission = localStorage.getItem(LOCATION_PERMISSION_KEY) as GeolocationStatus | null;
        const storedLocation = localStorage.getItem(USER_LOCATION_KEY);
        if (storedPermission === 'granted' && storedLocation) {
            return 'granted';
        }
        if (storedPermission === 'denied') {
            return 'denied';
        }
        return 'idle';
    });

    const [showGeolocationDialog, setShowGeolocationDialog] = useState(false);

    const [isLocationFilteringEnabled, setIsLocationFilteringEnabled] = useState(() => {
        const storedPermission = localStorage.getItem(LOCATION_PERMISSION_KEY);
        const storedLocation = localStorage.getItem(USER_LOCATION_KEY);
        return storedPermission === 'granted' && !!storedLocation;
    });

    const [showOnlyConfigured, setShowOnlyConfigured] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        setLoading(true);
        setError(null);
        const unsubscribe = subscribeToCourtsSummary(
            (fetchedCourts) => {
                setCourts(fetchedCourts);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError("Failed to load court data. Please try again later.");
                setLoading(false);
            },
            showOnlyConfigured
        );
        return () => unsubscribe();
    }, [showOnlyConfigured]);

    useEffect(() => {
        if (isLocationFilteringEnabled && !userLocation && geolocationStatus !== 'denied' && geolocationStatus !== 'pending') {
            if (navigator.permissions) {
                navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
                    if (permissionStatus.state === 'granted') {
                        initiateGeolocation();
                    } else if (permissionStatus.state === 'prompt') {
                    } else if (permissionStatus.state === 'denied') {
                        setGeolocationStatus('denied');
                        localStorage.setItem(LOCATION_PERMISSION_KEY, 'denied');
                        setIsLocationFilteringEnabled(false);
                    }
                });
            }
        }
    }, [isLocationFilteringEnabled, userLocation, geolocationStatus]);


    const initiateGeolocation = useCallback(() => {
        setGeolocationStatus('pending');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setUserLocation(newLocation);
                    setGeolocationStatus('granted');
                    toast.success('Using location for proximity');
                    setIsLocationFilteringEnabled(true);
                    localStorage.setItem(LOCATION_PERMISSION_KEY, 'granted');
                    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(newLocation));
                },
                (geoError) => {
                    setUserLocation(null);
                    const status: GeolocationStatus = geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'error';
                    setGeolocationStatus(status);
                    localStorage.setItem(LOCATION_PERMISSION_KEY, status);
                    localStorage.removeItem(USER_LOCATION_KEY);
                    if (status === 'error') {
                        toast.error('Failed to get your location. Please try again.');
                    } else if (status === 'denied') {
                        toast.error('Please allow location permissions in your browser.');
                        setIsLocationFilteringEnabled(false);
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setGeolocationStatus('error');
            setIsLocationFilteringEnabled(false);
            localStorage.setItem(LOCATION_PERMISSION_KEY, 'error');
            localStorage.removeItem(USER_LOCATION_KEY);
            toast.error('Geolocation is not supported by your browser.');
        }
    }, []);

    const handleGeolocationIconClick = () => {
        if (geolocationStatus === 'pending') {
            return;
        }

        if (geolocationStatus === 'granted' && userLocation) {
            if (!isLocationFilteringEnabled) {
                setIsLocationFilteringEnabled(true);
            }
            initiateGeolocation();
        } else {
            setShowGeolocationDialog(true);
        }
    };

    const handleAllowLocation = () => {
        setShowGeolocationDialog(false);
        initiateGeolocation();
    };

    const handleDenyLocation = () => {
        setShowGeolocationDialog(false);
        setGeolocationStatus('denied');
        setIsLocationFilteringEnabled(false);
        localStorage.setItem(LOCATION_PERMISSION_KEY, 'denied');
        localStorage.removeItem(USER_LOCATION_KEY);
        toast.error('Proximity filtering disabled as location was denied.');
    };

    const handleLocationFilterToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsLocationFilteringEnabled(checked);

        if (checked) {
            if (geolocationStatus === 'granted' && userLocation) {
            } else if (geolocationStatus !== 'pending') {
                setShowGeolocationDialog(true);
            }
        } else {
        }
    };

    const processedCourts = courts
        .filter(court => {
            if (filterType === 'all') return true;
            return court.type.toLowerCase() === filterType.toLowerCase();
        })
        .filter(court => {
            if (searchTerm === '') return true;
            const lowerSearchTerm = searchTerm.toLowerCase();
            return (
                court.name.toLowerCase().includes(lowerSearchTerm) ||
                court.location.toLowerCase().includes(lowerSearchTerm)
            );
        })
        .map(court => {
            let distanceKmCalculated: number | undefined;
            if (userLocation && court.latitude !== undefined && court.longitude !== undefined) {
                distanceKmCalculated = getDistanceFromLatLonInKm(
                    userLocation.latitude,
                    userLocation.longitude,
                    court.latitude,
                    court.longitude
                );
            }
            return {
                ...court,
                distanceKm: distanceKmCalculated,
            };
        })
        .sort((a, b) => {
            if (a.isComplexConfigured && !b.isComplexConfigured) {
                return -1;
            }
            if (!a.isComplexConfigured && b.isComplexConfigured) {
                return 1;
            }

            if (isLocationFilteringEnabled && geolocationStatus === 'granted' && a.distanceKm !== undefined && b.distanceKm !== undefined) {
                if (a.distanceKm !== b.distanceKm) {
                    return a.distanceKm - b.distanceKm;
                }
            }

            return a.name.localeCompare(b.name);
        });

    const getGeolocationControlUI = () => {
        let element;
        let tooltipTitle = '';
        let iconColor: 'primary' | 'inherit' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'primary';

        switch (geolocationStatus) {
            case 'granted':
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isLocationFilteringEnabled}
                                onChange={handleLocationFilterToggle}
                                color="success"
                                disabled={false}
                            />
                        }
                        label={
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mr: 1 }}>
                                {isMobile ? null : <LocationOn color="success" sx={{ fontSize: '1.1rem' }} />}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        fontWeight: 500,
                                        color: isLocationFilteringEnabled ? theme.palette.success.main : theme.palette.text.secondary,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                >
                                    Proximity
                                </Typography>
                            </Stack>
                        }
                        sx={{
                            mr: { xs: 0, sm: 1 },
                            ml: { xs: 1, sm: 0 },
                            border: `1px solid ${isLocationFilteringEnabled ? theme.palette.success.light : theme.palette.grey[300]}`,
                            borderRadius: 1,
                            py: 0.5,
                            px: 1,
                            bgcolor: isLocationFilteringEnabled ? theme.palette.success.light + '1A' : theme.palette.grey[100],
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                cursor: 'pointer',
                                bgcolor: isLocationFilteringEnabled ? theme.palette.success.light + '33' : theme.palette.grey[200],
                            },
                        }}
                    />
                );
            case 'pending':
                tooltipTitle = 'Locating you...';
                iconColor = 'primary';
                element = <CircularProgress size={20} color="inherit" />;
                break;
            case 'denied':
                tooltipTitle = 'Location denied. Click to allow.';
                iconColor = 'error';
                element = <LocationDisabledIcon />;
                break;
            case 'error':
                tooltipTitle = 'Location error. Click to retry.';
                iconColor = 'error';
                element = <LocationDisabledIcon />;
                break;
            case 'idle':
            default:
                tooltipTitle = 'Find courts near your location.';
                iconColor = 'inherit';
                element = <MyLocationIcon />;
                break;
        }

        return (
            <Tooltip title={tooltipTitle}>
                <span>
                    <IconButton
                        onClick={handleGeolocationIconClick}
                        color={iconColor}
                        disabled={geolocationStatus === 'pending'}
                        aria-label={tooltipTitle}
                        sx={{ ml: { xs: 1, sm: 2 } }}
                    >
                        {element}
                    </IconButton>
                </span>
            </Tooltip>
        );
    };


    if (error) {
        return <div className="dashboard-error">{error}</div>;
    }

    return (
        <>
            <PageMeta
                title="Find Available Courts"
                description="Search for tennis and other sports' courts near you and see their real-time availability."
            />
            <div className="dashboard">
                <div className="dashboard-header">
                    <Typography variant="h5" component="h2" color="primary.dark" sx={{ fontWeight: 700 }}>
                        Find Available Courts Near You!
                    </Typography>
                    <div className="dashboard-header-controls">
                        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        {getGeolocationControlUI()}
                    </div>
                </div>

                <FilterControls
                    filterType={filterType}
                    setFilterType={setFilterType}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    showOnlyConfigured={showOnlyConfigured}
                    setShowOnlyConfigured={setShowOnlyConfigured}
                />

                {viewMode === 'list' ? (
                    <CourtCard
                        courts={processedCourts}
                        loading={loading}
                        isProximityFilteringActive={isLocationFilteringEnabled && geolocationStatus === 'granted'}
                        maxDistanceKm={MAX_DISTANCE_KM}
                        currentFilterType={filterType}
                        currentSearchTerm={searchTerm}
                    />
                ) : (
                    <CourtMap
                        courts={processedCourts}
                        userLocation={userLocation}
                        isProximityFilteringActive={isLocationFilteringEnabled && geolocationStatus === 'granted'}
                    />
                )}

                <Dialog
                    open={showGeolocationDialog}
                    onClose={() => setShowGeolocationDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    fullScreen={isMobile}
                    PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}
                >
                    <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
                        Find Courts Near You
                    </DialogTitle>
                    <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: '15px !important', sm: '20px !important' } }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Allow access to your location to see the closest courts first.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This will allow us to sort available courts by their proximity to you, putting the closest options first. Your location data is used only for this purpose and is not stored on our servers.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                        <Button
                            onClick={handleDenyLocation}
                            variant="outlined"
                            sx={{
                                mr: { sm: 1 }, width: { xs: '100%', sm: 'auto' }, borderColor: 'primary.main', color: 'primary.main',
                                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(30, 58, 138, 0.04)' }
                            }}
                        >
                            No Thanks
                        </Button>
                        <Button
                            onClick={handleAllowLocation}
                            variant="contained"
                            sx={{
                                px: 4, width: { xs: '100%', sm: 'auto' }, bgcolor: 'success.main',
                                '&:hover': { bgcolor: 'success.dark' }
                            }}
                        >
                            Allow Location
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default Dashboard;