import { useState, useEffect, useCallback } from 'react';
import CourtCard from '../courts/CourtCard';
import CourtMap from '../courts/CourtMap';
import FilterControls from './FilterControls';
import SearchBar from './SearchBar';
import { subscribeToCourtsSummary, CourtCardSummary, getDistanceFromLatLonInKm } from '../../data/courtData';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LocationDisabledIcon from '@mui/icons-material/LocationDisabled';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import NearMeIcon from '@mui/icons-material/NearMe';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import toast from 'react-hot-toast';
import PageMeta from '../layout/PageMeta';
import { isStale } from '../brand/status';
import { tokens } from '../../theme';

const MAX_DISTANCE_KM = 40;

const LOCATION_PERMISSION_KEY = 'vacantCourtLocationPermission';
const USER_LOCATION_KEY = 'vacantCourtUserLocation';

type GeolocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'error';

function Dashboard() {
    const [courts, setCourts] = useState<CourtCardSummary[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
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
        if (storedPermission === 'granted' && storedLocation) return 'granted';
        if (storedPermission === 'denied') return 'denied';
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
                setError('We couldn’t load courts right now.');
                setLoading(false);
            },
            showOnlyConfigured
        );
        return () => unsubscribe();
    }, [showOnlyConfigured]);

    const initiateGeolocation = useCallback(() => {
        setGeolocationStatus('pending');
        if (!navigator.geolocation) {
            setGeolocationStatus('error');
            setIsLocationFilteringEnabled(false);
            localStorage.setItem(LOCATION_PERMISSION_KEY, 'error');
            localStorage.removeItem(USER_LOCATION_KEY);
            toast.error('This browser doesn’t support location.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(newLocation);
                setGeolocationStatus('granted');
                setIsLocationFilteringEnabled(true);
                localStorage.setItem(LOCATION_PERMISSION_KEY, 'granted');
                localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(newLocation));
                toast.success('Sorting by distance');
            },
            (geoError) => {
                setUserLocation(null);
                const status: GeolocationStatus = geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'error';
                setGeolocationStatus(status);
                localStorage.setItem(LOCATION_PERMISSION_KEY, status);
                localStorage.removeItem(USER_LOCATION_KEY);
                if (status === 'error') {
                    toast.error('Couldn’t get your location. Try again.');
                } else {
                    toast.error('Location is blocked. Allow it in your browser settings.');
                    setIsLocationFilteringEnabled(false);
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    useEffect(() => {
        if (isLocationFilteringEnabled && !userLocation && geolocationStatus !== 'denied' && geolocationStatus !== 'pending') {
            navigator.permissions?.query({ name: 'geolocation' }).then(permissionStatus => {
                if (permissionStatus.state === 'granted') {
                    initiateGeolocation();
                } else if (permissionStatus.state === 'denied') {
                    setGeolocationStatus('denied');
                    localStorage.setItem(LOCATION_PERMISSION_KEY, 'denied');
                    setIsLocationFilteringEnabled(false);
                }
            });
        }
    }, [isLocationFilteringEnabled, userLocation, geolocationStatus, initiateGeolocation]);

    const handleNearMeClick = () => {
        if (geolocationStatus === 'pending') return;
        if (geolocationStatus === 'granted' && userLocation) {
            setIsLocationFilteringEnabled(prev => !prev);
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
    };

    const isProximityActive = isLocationFilteringEnabled && geolocationStatus === 'granted';

    const processedCourts = courts
        .filter(court => filterType === 'all' || court.type.toLowerCase() === filterType.toLowerCase())
        .filter(court => {
            if (searchTerm === '') return true;
            const term = searchTerm.toLowerCase();
            return court.name.toLowerCase().includes(term) || court.location.toLowerCase().includes(term);
        })
        .map(court => ({
            ...court,
            distanceKm: userLocation && court.latitude !== undefined && court.longitude !== undefined
                ? getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, court.latitude, court.longitude)
                : undefined,
        }))
        .sort((a, b) => {
            if (a.isComplexConfigured !== b.isComplexConfigured) return a.isComplexConfigured ? -1 : 1;
            if (isProximityActive && a.distanceKm !== undefined && b.distanceKm !== undefined && a.distanceKm !== b.distanceKm) {
                return a.distanceKm - b.distanceKm;
            }
            return a.name.localeCompare(b.name);
        });

    const configuredCourts = courts.filter(c => c.isComplexConfigured);
    const liveCourts = configuredCourts.filter(c => !isStale(c.lastUpdatedStatus));
    const offlineCount = configuredCourts.length - liveCourts.length;
    const openCourtCount = liveCourts.reduce((sum, c) => sum + c.available, 0);
    const facilitiesWithOpenings = liveCourts.filter(c => c.available > 0).length;
    const summaryText = [
        liveCourts.length > 0
            ? `${openCourtCount} ${openCourtCount === 1 ? 'court' : 'courts'} open at ${facilitiesWithOpenings} of ${liveCourts.length} ${liveCourts.length === 1 ? 'facility' : 'facilities'}`
            : 'No cameras are reporting right now',
        offlineCount > 0 && liveCourts.length > 0 && `${offlineCount} ${offlineCount === 1 ? 'camera' : 'cameras'} offline`,
    ].filter(Boolean).join(' · ');
    const hasActiveFilters = filterType !== 'all' || searchTerm !== '';

    const clearFilters = () => {
        setFilterType('all');
        setSearchTerm('');
    };

    const renderNearMeButton = () => {
        if (geolocationStatus === 'pending') {
            return (
                <Button variant="outlined" disabled startIcon={<CircularProgress size={14} color="inherit" />} sx={{ height: 40, flexShrink: 0 }}>
                    Locating…
                </Button>
            );
        }
        const blocked = geolocationStatus === 'denied' || geolocationStatus === 'error';
        return (
            <Tooltip title={blocked ? 'Location is off. Click to try again.' : isProximityActive ? 'Showing courts within 40 km, nearest first' : 'Sort courts by distance from you'}>
                <Button
                    variant="outlined"
                    onClick={handleNearMeClick}
                    aria-pressed={isProximityActive}
                    startIcon={blocked ? <LocationDisabledIcon /> : isProximityActive ? <NearMeIcon /> : <NearMeOutlinedIcon />}
                    sx={{
                        height: 40,
                        flexShrink: 0,
                        ...(isProximityActive && {
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            bgcolor: alpha(tokens.court, 0.06),
                            '&:hover': { borderColor: 'primary.dark', bgcolor: alpha(tokens.court, 0.1) },
                        }),
                    }}
                >
                    {isProximityActive ? 'Nearest first' : 'Near me'}
                </Button>
            </Tooltip>
        );
    };

    return (
        <>
            <PageMeta
                title="Find Available Courts"
                description="Search for tennis and other courts near you and see their live availability."
            />

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
                spacing={2}
                sx={{ mb: { xs: 3, md: 4 } }}
            >
                <Box>
                    <Typography component="h1" variant="h4" sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                        Courts
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.75, minHeight: 24 }}>
                        {!loading && !error && summaryText}
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                    aria-label="View"
                    sx={{ flexShrink: 0 }}
                >
                    <ToggleButton value="list" aria-label="List view">
                        <ViewAgendaOutlinedIcon sx={{ fontSize: 18 }} />
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>List</Box>
                    </ToggleButton>
                    <ToggleButton value="map" aria-label="Map view">
                        <MapOutlinedIcon sx={{ fontSize: 18 }} />
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Map</Box>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, borderRadius: '10px' }}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1.25}>
                        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        {renderNearMeButton()}
                    </Stack>
                    <FilterControls
                        filterType={filterType}
                        setFilterType={setFilterType}
                        showOnlyConfigured={showOnlyConfigured}
                        setShowOnlyConfigured={setShowOnlyConfigured}
                    />
                </Stack>
            </Paper>

            {error ? (
                <Paper variant="outlined" sx={{ py: 8, px: 3, textAlign: 'center', borderRadius: '10px' }}>
                    <Typography variant="h6" component="p">{error}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.75 }}>Check your connection, then reload the page.</Typography>
                    <Button variant="outlined" onClick={() => window.location.reload()} sx={{ mt: 3 }}>Reload</Button>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    {viewMode === 'map' && (
                        <CourtMap
                            courts={processedCourts}
                            userLocation={userLocation}
                            isProximityFilteringActive={isProximityActive}
                        />
                    )}
                    <CourtCard
                        courts={processedCourts}
                        loading={loading}
                        isProximityFilteringActive={isProximityActive}
                        maxDistanceKm={MAX_DISTANCE_KM}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                    />
                </Stack>
            )}

            <Dialog
                open={showGeolocationDialog}
                onClose={() => setShowGeolocationDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>See the closest courts first</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        Share your location to sort facilities by distance and hide ones more than {MAX_DISTANCE_KM} km away.
                        Your location is saved in this browser only and never sent to our servers.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ flexDirection: isMobile ? 'column-reverse' : 'row', alignItems: 'stretch' }}>
                    <Button onClick={handleDenyLocation} variant="outlined" fullWidth={isMobile}>
                        Not now
                    </Button>
                    <Button onClick={handleAllowLocation} variant="contained" fullWidth={isMobile} sx={{ ml: '0 !important' }}>
                        Share location
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Dashboard;
