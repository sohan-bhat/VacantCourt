import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CourtStatus, statusMeta } from './status';

interface StatusPillProps {
    status: CourtStatus;
    label?: string;
}

// A plain colored tag: "Open", "In use", "Offline".
function StatusPill({ status, label }: StatusPillProps) {
    const { color, label: defaultLabel } = statusMeta[status];
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 0.875,
                height: 22,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color: status === 'unconfigured' ? 'text.secondary' : color,
                bgcolor: alpha(color, status === 'unconfigured' ? 0.16 : 0.12),
            }}
        >
            {label ?? defaultLabel}
        </Box>
    );
}

export default StatusPill;
