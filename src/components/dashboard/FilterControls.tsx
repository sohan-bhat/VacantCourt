import {
    Switch,
    FormControlLabel,
    Tooltip,
    useTheme,
    Chip,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Box,
} from '@mui/material';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ViewListIcon from '@mui/icons-material/ViewList';
import MapIcon from '@mui/icons-material/Map';

type FilterControlsProps = {
    filterType: string;
    setFilterType: (type: string) => void;
    viewMode: string;
    setViewMode: (mode: string) => void;
    showOnlyConfigured: boolean;
    setShowOnlyConfigured: (show: boolean) => void;
};

const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'badminton', label: 'Badminton' },
];

function FilterControls({
    filterType,
    setFilterType,
    viewMode,
    setViewMode,
    showOnlyConfigured,
    setShowOnlyConfigured
}: FilterControlsProps) {
    const theme = useTheme();

    const handleConfiguredFilterToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowOnlyConfigured(event.target.checked);
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
        }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                {filterOptions.map(({ value, label }) => (
                    <Chip
                        key={value}
                        label={label}
                        onClick={() => setFilterType(value)}
                        variant={filterType === value ? 'filled' : 'outlined'}
                        color={filterType === value ? 'primary' : 'default'}
                        sx={{
                            transition: 'all 0.2s ease',
                            fontWeight: filterType === value ? 600 : 400,
                        }}
                    />
                ))}
                <Tooltip title={showOnlyConfigured ? "Showing only facilities with configured courts" : "Showing all facilities"}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showOnlyConfigured}
                                onChange={handleConfiguredFilterToggle}
                                color="primary"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: theme.palette.success.main,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: theme.palette.success.light,
                                    },
                                }}
                            />
                        }
                        labelPlacement="start"
                        label={
                            <SettingsSuggestIcon
                                sx={{
                                    color: showOnlyConfigured ? theme.palette.success.main : theme.palette.grey[600],
                                    fontSize: '1.3rem',
                                    mt: '4px',
                                }}
                            />
                        }
                        sx={{
                            mr: { xs: 0, sm: 1 },
                            border: `1px solid ${showOnlyConfigured ? theme.palette.success.light : theme.palette.grey[300]}`,
                            borderRadius: 1,
                            py: 0.25,
                            px: 0.75,
                            bgcolor: showOnlyConfigured ? theme.palette.success.light + '1A' : theme.palette.grey[100],
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                cursor: 'pointer',
                                bgcolor: showOnlyConfigured ? theme.palette.success.light + '33' : theme.palette.grey[200],
                            },
                            '& .MuiFormControlLabel-label': {
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: showOnlyConfigured ? theme.palette.success.dark : theme.palette.text.secondary,
                                lineHeight: 1,
                            },
                        }}
                    />
                </Tooltip>
            </Stack>

            <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                    '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        px: 2,
                        gap: 0.5,
                        fontWeight: 500,
                        '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                        },
                    },
                }}
            >
                <ToggleButton value="list">
                    <ViewListIcon fontSize="small" /> List
                </ToggleButton>
                <ToggleButton value="map">
                    <MapIcon fontSize="small" /> Map
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}

export default FilterControls;
