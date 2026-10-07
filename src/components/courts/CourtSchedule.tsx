import { Box, Stack, Typography } from '@mui/material';
import { SubCourt } from '../../data/courtData';
import CourtGlyph from '../brand/CourtGlyph';
import StatusPill from '../brand/StatusPill';
import { CourtStatus } from '../brand/status';

interface CourtScheduleProps {
    courts: SubCourt[];
    isStale?: boolean;
}

function subCourtStatus(court: SubCourt, isStale: boolean): CourtStatus {
    if (!court.isConfigured) return 'unconfigured';
    if (isStale) return 'offline';
    if (court.status === 'available') return 'open';
    if (court.status === 'maintenance') return 'maintenance';
    return 'in-use';
}

function CourtSchedule({ courts, isStale = false }: CourtScheduleProps) {
    return (
        <Box
            component="ul"
            sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fill, minmax(200px, 1fr))' },
                gap: { xs: 1.5, sm: 2 },
            }}
        >
            {courts.map((court, index) => {
                const status = subCourtStatus(court, isStale);
                return (
                    <Box component="li" key={court.id ?? index}>
                        <CourtGlyph status={status} title={`${court.name}: ${status.replace('-', ' ')}`} />
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 1.25 }}>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }} noWrap>{court.name}</Typography>
                                {court.surface && (
                                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                                        {court.surface}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
                                <StatusPill status={status} />
                            </Box>
                        </Stack>
                        <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.75 }}>
                            <StatusPill status={status} />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

export default CourtSchedule;
