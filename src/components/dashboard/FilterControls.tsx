import { Chip, FormControlLabel, Stack, Switch, Typography } from '@mui/material';

type FilterControlsProps = {
    filterType: string;
    setFilterType: (type: string) => void;
    showOnlyConfigured: boolean;
    setShowOnlyConfigured: (show: boolean) => void;
};

const filterOptions = [
    { value: 'all', label: 'All sports' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'badminton', label: 'Badminton' },
];

function FilterControls({ filterType, setFilterType, showOnlyConfigured, setShowOnlyConfigured }: FilterControlsProps) {
    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
        >
            <Stack
                direction="row"
                spacing={1}
                role="group"
                aria-label="Filter by sport"
                sx={{ overflowX: 'auto', maxWidth: '100%', pb: { xs: 0.5, sm: 0 }, scrollbarWidth: 'none' }}
            >
                {filterOptions.map(({ value, label }) => {
                    const selected = filterType === value;
                    return (
                        <Chip
                            key={value}
                            label={label}
                            onClick={() => setFilterType(value)}
                            variant={selected ? 'filled' : 'outlined'}
                            aria-pressed={selected}
                            sx={{
                                flexShrink: 0,
                                ...(selected && {
                                    bgcolor: 'text.primary',
                                    color: 'common.white',
                                    '&:hover': { bgcolor: 'grey.800' },
                                }),
                            }}
                        />
                    );
                })}
            </Stack>

            <FormControlLabel
                control={
                    <Switch
                        checked={showOnlyConfigured}
                        onChange={(e) => setShowOnlyConfigured(e.target.checked)}
                        color="success"
                    />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Courts with cameras</Typography>}
                sx={{ m: 0, flexShrink: 0 }}
            />
        </Stack>
    );
}

export default FilterControls;
