import { Typography, Box } from '@mui/material';
import '../../styles/courts/CourtSchedule.css';

interface SubCourtForSchedule {
    id: number | string;
    name: string;
    surface: string;
    status: 'available' | 'in-use' | 'maintenance';
    isConfigured: boolean;
}

interface CourtScheduleProps {
    courts: SubCourtForSchedule[];
}

function CourtSchedule({ courts }: CourtScheduleProps) {
    return (
        <div className="courts-list">
            {courts.map((court, key) => {
                let displayStatusText = '';
                let statusClassName = '';

                if (!court.isConfigured) {
                    displayStatusText = 'Not Configured';
                    statusClassName = 'not-configured';
                } else {
                    switch (court.status) {
                        case 'available':
                            displayStatusText = 'Available';
                            statusClassName = 'available';
                            break;
                        case 'in-use':
                            displayStatusText = 'In Use';
                            statusClassName = 'in-use';
                            break;
                        case 'maintenance':
                            displayStatusText = 'Maintenance';
                            statusClassName = 'maintenance';
                            break;
                        default:
                            displayStatusText = 'Unknown';
                            statusClassName = 'unknown';
                    }
                }

                return (
                    <div key={key} className={`court-item ${statusClassName}`}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {court.name}
                        </Typography>
                        {court.surface && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
                                {court.surface}
                            </Typography>
                        )}
                        <Box className={`court-status-pill ${statusClassName}`}>
                            <span className="court-status-dot" />
                            {displayStatusText}
                        </Box>
                    </div>
                );
            })}
        </div>
    );
}

export default CourtSchedule;
