import { tokens } from '../../theme';
import type { CourtCardSummary } from '../../data/courtData';

export type CourtStatus = 'open' | 'in-use' | 'maintenance' | 'offline' | 'unconfigured';

export const statusMeta: Record<CourtStatus, { label: string; color: string }> = {
    open: { label: 'Open', color: tokens.open },
    'in-use': { label: 'In use', color: tokens.inUse },
    maintenance: { label: 'Maintenance', color: tokens.offline },
    offline: { label: 'Camera offline', color: tokens.offline },
    unconfigured: { label: 'No camera yet', color: '#9E9F99' },
};

// Cameras report every few minutes; anything older than this is treated as offline.
export const STALE_THRESHOLD_SECONDS = 297;

export function secondsSince(timestamp: { seconds: number } | number | null | undefined): number | null {
    if (!timestamp) return null;
    let seconds = 0;
    if (typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
        seconds = timestamp.seconds;
    } else if (typeof timestamp === 'number') {
        seconds = timestamp / 1000;
    }
    if (seconds <= 0) return null;
    return Math.max(0, Date.now() / 1000 - seconds);
}

export function isStale(timestamp: { seconds: number } | number | null | undefined): boolean {
    const age = secondsSince(timestamp);
    return age !== null && age > STALE_THRESHOLD_SECONDS;
}

export function formatAgo(seconds: number | null): string {
    if (seconds === null) return 'never';
    if (seconds < 60) return `${Math.round(seconds)}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export function getFacilityStatus(court: CourtCardSummary, stale: boolean): { status: CourtStatus; label: string } {
    if (!court.isComplexConfigured) return { status: 'unconfigured', label: 'No camera yet' };
    if (stale) return { status: 'offline', label: 'Camera offline' };
    if (court.available > 0) return { status: 'open', label: `${court.available} of ${court.total} open` };
    return { status: 'in-use', label: 'All in use' };
}
