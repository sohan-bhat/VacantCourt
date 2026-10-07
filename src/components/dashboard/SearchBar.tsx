import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
    return (
        <TextField
            size="small"
            placeholder="Search by facility or area"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            fullWidth
            slotProps={{
                htmlInput: { 'aria-label': 'Search courts' },
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm ? (
                        <InputAdornment position="end">
                            <IconButton size="small" aria-label="Clear search" onClick={() => setSearchTerm('')} edge="end">
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ) : undefined,
                },
            }}
            sx={{ '& .MuiOutlinedInput-root': { height: 40 } }}
        />
    );
}

export default SearchBar;
