import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../styles/courts/CourtMap.css';
import { CourtCardSummary } from '../../data/courtData';
import {
    Box,
    Typography,
    Paper,
    Tooltip,
    Button as MuiButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';


delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


interface CourtMapProps {
    courts: CourtCardSummary[];
    userLocation: { latitude: number; longitude: number } | null;
    isProximityFilteringActive: boolean;
}

const createCustomMapIcon = (isComplexConfigured: boolean, isAvailable: boolean) => {
    const defaultIconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
    const defaultIconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
    const defaultShadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
    const iconSize: [number, number] = [25, 41];

    let wrapperClass = 'leaflet-marker-icon-wrapper';
    if (!isComplexConfigured) {
        wrapperClass += ' marker-grayscale';
    } else if (!isAvailable) {
        wrapperClass += ' marker-unavailable-strikethrough';
    }

    const htmlContent = `
        <div class="${wrapperClass}">
            <img src="${defaultIconUrl}" srcset="${defaultIconRetinaUrl} 2x" class="leaflet-marker-icon" alt="" style="width: ${iconSize[0]}px; height: ${iconSize[1]}px;">
        </div>
        <img src="${defaultShadowUrl}" class="leaflet-marker-shadow" alt="" style="width: 41px; height: 41px; left: 0px; top: 0px;">
    `;

    return L.divIcon({
        className: 'custom-leaflet-icon-container',
        html: htmlContent,
        iconSize: iconSize,
        iconAnchor: [iconSize[0] / 2, iconSize[1]],
        popupAnchor: [1, -34],
    });
};


interface SetMapBoundsProps {
    bounds: L.LatLngExpression[] | undefined;
}

function SetMapBounds({ bounds }: SetMapBoundsProps) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            const LBounds = L.latLngBounds(bounds);
            if (LBounds.isValid()) {
                map.fitBounds(LBounds, { padding: [50, 50] });
            }
        }
    }, [map, bounds]);

    return null;
}

const MAX_DISTANCE_KM = 40;

function CourtMap({ courts, userLocation, isProximityFilteringActive }: CourtMapProps) {
    const initialCenter: [number, number] = [34.0522, -118.2437];
    const defaultZoomForNoCourtsOrUserLocation = 3;
    const zoomForUserLocationIfNoCourtsInRange = 12;
    const zoomForSingleCourt = 14;

    const courtsWithCoords = courts.filter(court => court.latitude && court.longitude);

    let mapCenter = initialCenter;
    let mapZoom = defaultZoomForNoCourtsOrUserLocation;
    let boundsToFit: L.LatLngBoundsExpression | undefined = undefined;

    if (isProximityFilteringActive && userLocation) {
        const courtsWithinProximity = courtsWithCoords.filter(
            court => court.distanceKm !== undefined && court.distanceKm <= MAX_DISTANCE_KM
        );

        if (courtsWithinProximity.length > 0) {
            boundsToFit = courtsWithinProximity.map(court => [court.latitude!, court.longitude!] as L.LatLngTuple);
        } else {
            mapCenter = [userLocation.latitude, userLocation.longitude];
            mapZoom = zoomForUserLocationIfNoCourtsInRange;
        }
    } else if (courtsWithCoords.length > 0) {
        boundsToFit = courtsWithCoords.map(court => [court.latitude!, court.longitude!] as L.LatLngTuple);
    } else if (userLocation) {
        mapCenter = [userLocation.latitude, userLocation.longitude];
        mapZoom = zoomForUserLocationIfNoCourtsInRange;
    }


    if (!boundsToFit && courtsWithCoords.length === 1) {
        mapCenter = [courtsWithCoords[0].latitude!, courtsWithCoords[0].longitude!];
        mapZoom = zoomForSingleCourt;
    }

    return (
        <div className="court-map-container">
            <div className="map-wrapper">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                    className="map-component"
                    key={boundsToFit ? JSON.stringify(boundsToFit) : `${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                >
                    <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {courtsWithCoords.map(court => {
                        const isConfigured = court.isComplexConfigured;
                        const isCurrentlyAvailable = court.available > 0;

                        return (
                            <Marker
                                key={court.id}
                                position={[court.latitude!, court.longitude!]}
                                icon={createCustomMapIcon(isConfigured, isCurrentlyAvailable)}
                            >
                                <Popup>
                                    <strong>{court.name}</strong><br />
                                    {!isConfigured
                                        ? `${court.total} total courts (not configured)`
                                        : `${court.available} / ${court.total} courts available`}
                                    <br />
                                    <Link to={`/court/${court.id}`}>Details</Link>
                                    <br />
                                    {court.address && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(court.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'inline-block', marginTop: '5px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}
                                        >
                                            Get Directions (Google Maps)
                                        </a>
                                    )}
                                </Popup>
                            </Marker>
                        );
                    })}

                    {boundsToFit && <SetMapBounds bounds={boundsToFit} />}

                </MapContainer>
            </div>

            <div className="map-court-list">
                {(isProximityFilteringActive && userLocation
                    ? courts.filter(court => court.distanceKm !== undefined && court.distanceKm <= MAX_DISTANCE_KM)
                    : courts
                ).map(court => (
                    <div className="court-map-card-item" key={court.id}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                borderRadius: 2,
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                },
                                border: `1px solid ${!court.isComplexConfigured ? '#bdbdbd' : (court.available > 0 ? 'var(--success-color)' : 'var(--error-color)')}`,
                                opacity: !court.isComplexConfigured ? 0.85 : 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
                                <Typography variant="h6" component="h4" sx={{ color: 'primary.main', fontWeight: 600, flexGrow: 1 }}>
                                    {court.name}
                                </Typography>
                                {!court.isComplexConfigured && (
                                    <Tooltip title="This facility's courts are not yet configured.">
                                        <SettingsSuggestIcon color="disabled" sx={{ fontSize: '1.2rem' }} />
                                    </Tooltip>
                                )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary', transform: 'translateY(-0.27rem)'  }} />
                                <Typography variant="body2" color="text.secondary">
                                    {court.location}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <SportsTennisIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary', transform: 'translateY(-0.27rem)'  }} />
                                <Typography variant="body2" color="text.secondary">
                                    {court.type}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, minHeight: '24px' }}>
                                {!court.isComplexConfigured ? (
                                    <>
                                        <SettingsSuggestIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.disabled', transform: 'translateY(-0.27rem)'  }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                            Not Configured ({court.total} total courts)
                                        </Typography>
                                    </>
                                ) : court.available > 0 ? (
                                    <>
                                        <CheckCircleIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'success.main', transform: 'translateY(-0.27rem)'  }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }} >
                                            Available ({court.available}/{court.total})
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <CancelIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'error.main', transform: 'translateY(-0.27rem)'  }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }} >
                                            Unavailable ({court.available}/{court.total})
                                        </Typography>
                                    </>
                                )}
                            </Box>

                            {court.distanceKm !== undefined && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1, fontWeight: 500 }}>
                                    {court.distanceKm} km away
                                </Typography>
                            )}

                            <Box sx={{ marginTop: 'auto', width: '100%' }}>
                                <Link to={`/court/${court.id}`} style={{ textDecoration: 'none', width: '100%' }}>
                                    <MuiButton
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                                    >
                                        View Details
                                    </MuiButton>
                                </Link>
                            </Box>
                        </Paper>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CourtMap;