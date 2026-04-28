import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  return (
    <TextField
      size="small"
      placeholder="Search courts..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      autoComplete="off"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        maxWidth: 400,
        width: '100%',
        '& .MuiOutlinedInput-root': {
          borderRadius: 'var(--border-radius)',
        },
      }}
    />
  );
}

export default SearchBar;
