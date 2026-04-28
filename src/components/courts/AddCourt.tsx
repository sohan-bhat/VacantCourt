import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Box,
    Typography,
    Chip,
    Alert,
    Divider,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { createDocument } from '../../services/firestoreService';
import toast from 'react-hot-toast';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { uploadImage } from '../../services/storageService';
import { useAuth } from '../auth/AuthContext'

interface SubCourt {
    name: string;
    surface: string;
    status: string;
    isConfigured: boolean;
    id?: number | string;
}

interface CourtError {
    name?: string;
    surface?: string;
}

interface FormErrors {
    name?: string;
    type?: string;
    location?: string;
    address?: string;
    description?: string;
    courts?: CourtError[];
}

interface AddCourtProps {
    open: boolean;
    onClose: () => void;
}

interface CourtFormData {
    name: string;
    type: string;
    location: string;
    address: string;
    phone: string;
    hours: string;
    amenities: string[];
    courts: SubCourt[];
    description: string;
    images: Array<{ file: File; preview: string }>;
    latitude?: number;
    longitude?: number;
}

const initialFormData: CourtFormData = {
    name: '',
    type: '',
    location: '',
    address: '',
    phone: '',
    hours: '',
    amenities: [],
    courts: [{
        id: Date.now(),
        name: '',
        surface: '',
        status: 'available',
        isConfigured: false,
    }],
    description: '',
    images: [],
    latitude: undefined,
    longitude: undefined
};

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

export default function AddCourt({ open, onClose }: AddCourtProps) {
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState<CourtFormData>(initialFormData);
    const [amenity, setAmenity] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [autocompleteLoading, setAutocompleteLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedAddressOption, setSelectedAddressOption] = useState<any | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const basicInfoRef = useRef<HTMLDivElement>(null);
    const contactInfoRef = useRef<HTMLDivElement>(null);
    const courtsRef = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLDivElement>(null);

    const debounce = <T extends Function>(func: T, delay: number): T => {
        let timeout: ReturnType<typeof setTimeout>;
        return ((...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        }) as any;
    };

    const fetchSuggestions = useCallback(debounce(async (query: string) => {
        if (query.length < 2) {
            setAddressSuggestions([]);
            setAutocompleteLoading(false);
            return;
        }

        setAutocompleteLoading(true);
        try {
            const response = await fetch(
                `${NOMINATIM_API_URL}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
                {
                    headers: {
                        'User-Agent': 'VacantCourtApp/1.0 (your-email@example.com)'
                    }
                }
            );
            const data = await response.json();
            setAddressSuggestions(data);
        } catch (err) {
            console.error('Error fetching address suggestions:', err);
            setAddressSuggestions([]);
        } finally {
            setAutocompleteLoading(false);
        }
    }, 500), []);

    useEffect(() => {
        if (open && inputValue) {
            fetchSuggestions(inputValue);
        } else if (!inputValue) {
            setAddressSuggestions([]);
        }
    }, [inputValue, open, fetchSuggestions]);

    useEffect(() => {
        if (open) {
            setFormData(initialFormData);
            setAmenity('');
            setErrors({});
            setAddressSuggestions([]);
            setAutocompleteLoading(false);
            setInputValue('');
            setSelectedAddressOption(null);
        }
    }, [open]);

    const validateForm = () => {
        const newErrors: FormErrors = {};
        let hasErrors = false;
        let firstErrorRef: React.RefObject<HTMLDivElement | null> | null = null;

        if (!formData.name.trim() || !formData.type.trim() || !formData.location.trim()) {
            if (!firstErrorRef) firstErrorRef = basicInfoRef;
            if (!formData.name.trim()) newErrors.name = 'Facility name is required';
            if (!formData.type.trim()) newErrors.type = 'Sport type is required';
            if (!formData.location.trim()) newErrors.location = 'Facility location is required';
            hasErrors = true;
        }

        if (!formData.address.trim() || !selectedAddressOption) {
            if (!firstErrorRef) firstErrorRef = contactInfoRef;
            newErrors.address = 'Facility address is required and must be selected from suggestions';
            hasErrors = true;
        }

        const courtErrors: CourtError[] = [];
        let hasCourtErrors = false;
        formData.courts.forEach((court, index) => {
            const courtError: CourtError = {};
            if (!court.name.trim()) { if (!firstErrorRef) firstErrorRef = courtsRef; courtError.name = 'Court name is required'; hasCourtErrors = true; }
            if (!court.surface.trim()) { if (!firstErrorRef) firstErrorRef = courtsRef; courtError.surface = 'Surface type is required'; hasCourtErrors = true; }
            courtErrors[index] = courtError;
        });
        if (hasCourtErrors) { newErrors.courts = courtErrors; hasErrors = true; }

        if (!formData.description.trim()) {
            if (!firstErrorRef) firstErrorRef = descriptionRef;
            newErrors.description = 'Facility description is required';
            hasErrors = true;
        }

        setErrors(newErrors);
        if (firstErrorRef?.current) {
            firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return !hasErrors;
    };

    const handleSubmit = async () => {
        if (!currentUser) {
            toast.error('You must be logged in to add a facility.');
            setIsSubmitting(false);
            return;
        }

        if (!validateForm()) return;
        setIsSubmitting(true);
        setUploadProgress({});

        try {
            const uploadedUrls: string[] = [];
            const initialProgress: Record<string, number> = {};
            formData.images.forEach(img => initialProgress[img.preview] = 0);
            setUploadProgress(initialProgress);

            for (const image of formData.images) {
                const url = await uploadImage(
                    image.file,
                    `courts/${currentUser.uid}/${Date.now()}_${image.file.name}`,
                    (progress) => {
                        setUploadProgress(prev => ({ ...prev, [image.preview]: progress.progress }));
                    }
                );
                uploadedUrls.push(url);
                URL.revokeObjectURL(image.preview);
            }

            const courtsToSave = formData.courts.map(c => ({
                ...c,
                id: typeof c.id === 'string' ? parseInt(c.id) : c.id || Date.now()
            }));

            const courtDataToSave = {
                ...formData,
                courts: courtsToSave,
                images: uploadedUrls,
                latitude: selectedAddressOption?.lat ? parseFloat(selectedAddressOption.lat) : undefined,
                longitude: selectedAddressOption?.lon ? parseFloat(selectedAddressOption.lon) : undefined,
                ownerId: currentUser.uid,
            };

            await createDocument('Courts', courtDataToSave);

            toast.success('Facility added successfully!');
            onClose();
        } catch (error) {
            console.error('Error adding facility:', error);
            if ((error as any)?.code?.startsWith('storage/')) {
                 toast.error(`Image upload failed: ${(error as any).message}`);
            } else {
                toast.error('Failed to add facility. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
            setUploadProgress({});
        }
    };

    const handleImageAdd = (file: File) => {
        const preview = URL.createObjectURL(file);
        setFormData({ ...formData, images: [...formData.images, { file, preview }] });
    };

    const handleAddAmenity = () => {
        if (amenity && !formData.amenities.includes(amenity)) {
            setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
            setAmenity('');
        }
    };

    const handleAddCourt = () => {
        setFormData({
            ...formData,
            courts: [...formData.courts, {
                id: Date.now(),
                name: '',
                surface: '',
                status: 'available',
                isConfigured: false,
            }]
        });
    };

    const handleRemoveCourt = (index: number) => {
        const newCourts = formData.courts.filter((_, i) => i !== index);
        setFormData({ ...formData, courts: newCourts });
    };

    const renderCourts = () => {
        return formData.courts.map((court, index) => (
            <Box
                key={court.id || index}
                sx={{
                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, alignItems: { sm: 'center' }
                }}
            >
                <TextField autoComplete='off' required size="small" label="Court Name/Number"
                    placeholder="e.g. Court 1" value={court.name}
                    onChange={(e) => {
                        const newCourts = [...formData.courts];
                        newCourts[index].name = e.target.value;
                        setFormData({ ...formData, courts: newCourts });
                    }}
                    error={!!(errors.courts?.[index]?.name)} helperText={errors.courts?.[index]?.name} fullWidth
                />
                <TextField autoComplete='off' required size="small" label="Surface Type"
                    placeholder="e.g. Hard, Clay" value={court.surface}
                    onChange={(e) => {
                        const newCourts = [...formData.courts];
                        newCourts[index].surface = e.target.value;
                        setFormData({ ...formData, courts: newCourts });
                    }}
                    error={!!(errors.courts?.[index]?.surface)} helperText={errors.courts?.[index]?.surface} fullWidth
                />
                <IconButton onClick={() => handleRemoveCourt(index)} disabled={formData.courts.length === 1} color="error" sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                    <DeleteIcon />
                </IconButton>
            </Box>
        ));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2, bgcolor: 'background.paper' } }}>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: { xs: 2, sm: 3 } }}>Add New Sports Facility</DialogTitle>
            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-icon': { color: 'warning.dark' } }}>
                    Note: The facility will not be visible until configured with our hardware system.
                </Alert>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box ref={basicInfoRef}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Facility Information</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Enter general information</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField autoComplete='off' required label="Facility Name" placeholder="e.g. Downtown Tennis Center"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={!!errors.name} helperText={errors.name}
                            />
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <TextField autoComplete='off' required label="Sport Type" placeholder="e.g. Tennis"
                                    value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    error={!!errors.type} helperText={errors.type} fullWidth
                                />
                                <TextField autoComplete='off' required label="General Area" placeholder="e.g. Downtown"
                                    value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    error={!!errors.location} helperText={errors.location} fullWidth
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Divider />
                    <Box ref={contactInfoRef}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Facility Details</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Facility contact information</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Autocomplete
                                fullWidth
                                options={addressSuggestions}
                                getOptionLabel={(option) => option.display_name || ''}
                                filterOptions={(x) => x}
                                loading={autocompleteLoading}
                                inputValue={inputValue}
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                    if (selectedAddressOption && selectedAddressOption.display_name !== newInputValue) {
                                        setSelectedAddressOption(null);
                                        setFormData(prev => ({ ...prev, address: newInputValue, latitude: undefined, longitude: undefined }));
                                    }
                                }}
                                value={selectedAddressOption}
                                onChange={(event, newValue) => {
                                    setSelectedAddressOption(newValue);
                                    if (newValue) {
                                        setFormData(prev => ({
                                            ...prev,
                                            address: newValue.display_name,
                                            latitude: parseFloat(newValue.lat),
                                            longitude: parseFloat(newValue.lon)
                                        }));
                                    } else {
                                        setFormData(prev => ({ ...prev, address: '', latitude: undefined, longitude: undefined }));
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Facility Address"
                                        placeholder="Complete street address"
                                        error={!!errors.address}
                                        helperText={errors.address}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {autocompleteLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <TextField autoComplete='off' label="Contact Phone" placeholder="(555) 123-4567"
                                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth
                                />
                                <TextField autoComplete='off' label="Operating Hours" placeholder="6 AM - 10 PM"
                                    value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} fullWidth
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Amenities</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>List available amenities</Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2, alignItems: { sm: 'center' } }}>
                            <TextField autoComplete='off' size="small" value={amenity} onChange={(e) => setAmenity(e.target.value)}
                                placeholder="Enter an amenity" fullWidth
                            />
                            <Button onClick={handleAddAmenity} variant="contained" size="small" sx={{ minWidth: '100px', width: { xs: '100%', sm: 'auto' }, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>Add</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.amenities.map((item, index) => (
                                <Chip key={index} label={item} onDelete={() => setFormData({ ...formData, amenities: formData.amenities.filter((_, i) => i !== index) })}
                                    sx={{ bgcolor: 'primary.main', color: 'white', '& .MuiChip-deleteIcon': { color: 'white' } }}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Divider />
                    <Box ref={courtsRef}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Individual Courts</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Details for each court</Typography>
                        <Box sx={{ mb: 2 }}>{renderCourts()}</Box>
                        <Button startIcon={<AddIcon />} onClick={handleAddCourt} variant="outlined" size="small"
                            sx={{ mb: 2, borderColor: 'primary.main', color: 'primary.main', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(30, 58, 138, 0.04)' } }}
                        >Add Another Court</Button>
                    </Box>
                    <Divider />
                    <Box ref={descriptionRef}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Facility Description</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Detailed description</Typography>
                        <TextField autoComplete='off' required multiline rows={4} placeholder="Describe your facility..."
                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            error={!!errors.description} helperText={errors.description} fullWidth
                        />
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Facility Images</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Add images (recommended)</Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                            {formData.images.map((image, index) => (
                                <Box key={index} sx={{ position: 'relative', width: { xs: 'calc(50% - 6px)', sm: 150 }, height: { xs: 120, sm: 150 }, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd', }}>
                                    {uploadProgress[image.preview] !== undefined && uploadProgress[image.preview] < 100 && (
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.7)' }}>
                                            <CircularProgress variant="determinate" value={uploadProgress[image.preview]} size={40} />
                                        </Box>
                                    )}
                                    <img src={image.preview} alt={`Facility ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    {!isSubmitting && (
                                        <IconButton onClick={() => { URL.revokeObjectURL(image.preview); const newImages = formData.images.filter((_, i) => i !== index); setFormData({ ...formData, images: newImages }); }}
                                            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }, p: 0.5 }}
                                        >
                                            <DeleteIcon sx={{ color: 'white', fontSize: '1rem' }} />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}
                            {formData.images.length < 5 && !isSubmitting && (
                                <Box component="label" sx={{ width: { xs: 'calc(50% - 6px)', sm: 150 }, height: { xs: 120, sm: 150 }, border: '2px dashed #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(30, 58, 138, 0.04)' } }}>
                                    <input type="file" autoComplete='off' hidden accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleImageAdd(file); e.target.value = ''; } }} />
                                    <AddPhotoAlternateIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#666', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }} >Add Image</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>(Max 5)</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                <Button onClick={onClose} variant="outlined" disabled={isSubmitting}
                    sx={{ mr: { sm: 1 }, width: { xs: '100%', sm: 'auto' }, borderColor: 'primary.main', color: 'primary.main', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(30, 58, 138, 0.04)' } }}
                >Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}
                    sx={{ px: 4, width: { xs: '100%', sm: 'auto' }, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                >{isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Add Facility'}</Button>
            </DialogActions>
        </Dialog>
    );
}