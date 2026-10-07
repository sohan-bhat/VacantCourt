import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../styles/courts/CourtMap.css';
import { CourtCardSummary } from '../../data/courtData';
import { tokens } from '../../theme';

interface CourtMapProps {
    courts: CourtCardSummary[];
    userLocation: { latitude: number; longitude: number } | null;
    isProximityFilteringActive: boolean;
}

const MAX_DISTANCE_KM = 40;

function markerColor(court: CourtCardSummary) {
    if (!court.isComplexConfigured) return '#98A2B3';
    return court.available > 0 ? tokens.open : tokens.inUse;
}

// A pin showing the number of open courts, colored by facility status.
const createMarkerIcon = (court: CourtCardSummary) => {
    const label = court.isComplexConfigured ? String(court.available) : '–';
    return L.divIcon({
        className: 'vc-marker',
        html: `<span class="vc-marker-pin" style="--pin:${markerColor(court)}"><span>${label}</span></span>`,
        iconSize: [32, 40],
        iconAnchor: [16, 38],
        popupAnchor: [0, -34],
    });
};

const userIcon = L.divIcon({
    className: 'vc-marker',
    html: '<span class="vc-user-dot"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

function SetMapBounds({ bounds }: { bounds: L.LatLngExpression[] | undefined }) {
    const map = useMap();
    useEffect(() => {
        if (!bounds) return;
        const latLngBounds = L.latLngBounds(bounds);
        if (latLngBounds.isValid()) {
            map.fitBounds(latLngBounds, { padding: [56, 56], maxZoom: 15 });
        }
    }, [map, bounds]);
    return null;
}

function CourtMap({ courts, userLocation, isProximityFilteringActive }: CourtMapProps) {
    const initialCenter: [number, number] = [33.0198, -96.6989];
    const courtsWithCoords = courts.filter(court => court.latitude && court.longitude);

    let mapCenter = initialCenter;
    let mapZoom = 10;
    let boundsToFit: L.LatLngTuple[] | undefined;

    const visibleCourts = isProximityFilteringActive && userLocation
        ? courtsWithCoords.filter(court => court.distanceKm !== undefined && court.distanceKm <= MAX_DISTANCE_KM)
        : courtsWithCoords;

    if (visibleCourts.length > 1) {
        boundsToFit = visibleCourts.map(court => [court.latitude!, court.longitude!] as L.LatLngTuple);
    } else if (visibleCourts.length === 1) {
        mapCenter = [visibleCourts[0].latitude!, visibleCourts[0].longitude!];
        mapZoom = 14;
    } else if (userLocation) {
        mapCenter = [userLocation.latitude, userLocation.longitude];
        mapZoom = 12;
    }

    return (
        <div className="map-wrapper">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom={false}
                className="map-component"
                key={boundsToFit ? JSON.stringify(boundsToFit) : `${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} interactive={false} />
                )}

                {visibleCourts.map(court => (
                    <Marker key={court.id} position={[court.latitude!, court.longitude!]} icon={createMarkerIcon(court)}>
                        <Popup>
                            <div className="vc-popup">
                                <strong className="vc-popup-title">{court.name}</strong>
                                <span className="vc-popup-meta">{court.location} · {court.type}</span>
                                <span className="vc-popup-status" style={{ color: markerColor(court) }}>
                                    {court.isComplexConfigured
                                        ? `${court.available} of ${court.total} courts open`
                                        : `${court.total} courts · no live status`}
                                </span>
                                <div className="vc-popup-actions">
                                    <Link to={`/court/${court.id}`}>View details</Link>
                                    {court.address && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(court.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Directions
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {boundsToFit && <SetMapBounds bounds={boundsToFit} />}
            </MapContainer>
        </div>
    );
}

export default CourtMap;
