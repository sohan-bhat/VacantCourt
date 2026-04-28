import { useState, useEffect, useRef, useCallback } from 'react';
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
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { updateDocument } from '../../services/firestoreService';
import { uploadImage } from '../../services/storageService';
import { Court, SubCourt } from '../../data/courtData';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';

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

interface EditCourtProps {
    open: boolean;
    onClose: () => void;
    court: Court | null;
}

interface EditableSubCourt extends SubCourt {
}

interface CourtFormData {
    name: string;
    type: string;
    location: string;
    address: string;
    phone: string;
    hours: string;
    amenities: string[];
    courts: EditableSubCourt[];
    description: string;
    latitude?: number;
    longitude?: number;
}

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

export default function EditCourt({ open, onClose, court }: EditCourtProps) {
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState<CourtFormData | null>(null);
    const [amenityInput, setAmenityInput] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [newImagesToUpload, setNewImagesToUpload] = useState<Array<{ file: File; preview: string }>>([]);
    const [imageUrlsToDelete, setImageUrlsToDelete] = useState<string[]>([]);
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
        if (query.length < 3) {
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
        if (open && inputValue && selectedAddressOption?.display_name !== inputValue) {
            fetchSuggestions(inputValue);
        } else if (!inputValue) {
            setAddressSuggestions([]);
        }
    }, [inputValue, open, fetchSuggestions, selectedAddressOption]);


    useEffect(() => {
        if (court && open) {
            setFormData({
                name: court.name,
                type: court.type,
                location: court.location,
                address: court.address,
                phone: court.phone || '',
                hours: court.hours || '',
                amenities: court.amenities || [],
                courts: court.courts.map(sc => ({ ...sc })),
                description: court.description,
                latitude: court.latitude,
                longitude: court.longitude
            });
            setExistingImageUrls(court.images || []);
            setNewImagesToUpload([]);
            setImageUrlsToDelete([]);
            setErrors({});
            setUploadProgress({});

            if (court.address) {
                setInputValue(court.address);
                if (court.latitude && court.longitude) {
                    setSelectedAddressOption({
                        display_name: court.address,
                        lat: court.latitude.toString(),
                        lon: court.longitude.toString()
                    });
                } else {
                    setSelectedAddressOption(null);
                }
            } else {
                setInputValue('');
                setSelectedAddressOption(null);
            }

        } else if (!open) {
            setFormData(null);
            setAddressSuggestions([]);
            setAutocompleteLoading(false);
            setInputValue('');
            setSelectedAddressOption(null);
        }
    }, [court, open]);

    const validateForm = () => {
        if (!formData) return false;
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
        if (!formData.address.trim() || (!selectedAddressOption && (!formData.latitude || !formData.longitude))) {
            if (!firstErrorRef) firstErrorRef = contactInfoRef;
            newErrors.address = 'Facility address is required and must be selected from suggestions';
            hasErrors = true;
        }

        const courtErrors: CourtError[] = [];
        let hasCourtErrors = false;
        formData.courts.forEach((c, index) => {
            const ce: CourtError = {};
            if (!c.name.trim()) { if (!firstErrorRef) firstErrorRef = courtsRef; ce.name = 'Court name is required'; hasCourtErrors = true; }
            if (!c.surface.trim()) { if (!firstErrorRef) firstErrorRef = courtsRef; ce.surface = 'Surface type is required'; hasCourtErrors = true; }
            courtErrors[index] = ce;
        });
        if (hasCourtErrors) { newErrors.courts = courtErrors; hasErrors = true; }
        if (!formData.description.trim()) {
            if (!firstErrorRef) firstErrorRef = descriptionRef;
            newErrors.description = 'Facility description is required'; hasErrors = true;
        }
        setErrors(newErrors);
        if (firstErrorRef?.current) {
            firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return !hasErrors;
    };

    const handleInputChange = (field: keyof CourtFormData, value: any) => {
        if (formData) {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleSubCourtChange = (index: number, field: keyof EditableSubCourt, value: string) => {
        if (formData) {
            const newCourts = [...formData.courts];
            (newCourts[index] as any)[field] = value;
            setFormData({ ...formData, courts: newCourts });
        }
    };

    const handleAddSubCourt = () => {
        if (formData) {
            setFormData({
                ...formData,
                courts: [...formData.courts, {
                    id: Date.now(), name: '', surface: '', status: 'available',
                    isConfigured: false
                }]
            });
        }
    };

    const handleRemoveSubCourt = (index: number) => {
        if (formData) {
            const newCourts = formData.courts.filter((_, i) => i !== index);
            setFormData({ ...formData, courts: newCourts });
        }
    };

    const handleAddAmenity = () => {
        if (formData && amenityInput && !formData.amenities.includes(amenityInput)) {
            setFormData({ ...formData, amenities: [...formData.amenities, amenityInput] });
            setAmenityInput('');
        }
    };

    const handleRemoveAmenity = (amenityToRemove: string) => {
        if (formData) setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenityToRemove) });
    };

    const handleAddNewImage = (file: File) => {
        const preview = URL.createObjectURL(file);
        setNewImagesToUpload(prev => [...prev, { file, preview }]);
    };

    const handleRemoveNewImage = (index: number) => {
        const imageToRemove = newImagesToUpload[index];
        URL.revokeObjectURL(imageToRemove.preview);
        setNewImagesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingImage = (imageUrl: string) => {
        setExistingImageUrls(prev => prev.filter(url => url !== imageUrl));
        setImageUrlsToDelete(prev => [...prev, imageUrl]);
    };

    const handleSubmit = async () => {
        if (!currentUser) {
            toast.error('You must be logged in to edit a facility.');
            setIsSubmitting(false);
            return;
        }

        if (!court || currentUser.uid !== court.ownerId) {
            toast.error('You are not authorized to edit this facility.');
            setIsSubmitting(false);
            onClose();
            return;
        }

        if (!validateForm() || !formData ) return;
        setIsSubmitting(true);
        setUploadProgress({});

        try {
            const uploadedNewImageUrls: string[] = [];
            for (const image of newImagesToUpload) {
                const url = await uploadImage(
                    image.file,
                    `courts/${court.ownerId}/${court.id}/${Date.now()}_${image.file.name}`,
                    (progress) => { setUploadProgress(prev => ({ ...prev, [image.preview]: progress.progress })); }
                );
                uploadedNewImageUrls.push(url);
                URL.revokeObjectURL(image.preview);
            }

            const finalImageUrls = [...existingImageUrls, ...uploadedNewImageUrls];

            const courtsToSave = formData.courts.map(c => ({
                ...c,
                id: typeof c.id === 'string' ? parseInt(c.id) : c.id || Date.now()
            }));

            const updatedCourtData = {
                name: formData.name,
                type: formData.type,
                location: formData.location,
                address: formData.address,
                phone: formData.phone,
                hours: formData.hours,
                amenities: formData.amenities,
                courts: courtsToSave,
                description: formData.description,
                images: finalImageUrls,
                latitude: selectedAddressOption?.lat ? parseFloat(selectedAddressOption.lat) : formData.latitude,
                longitude: selectedAddressOption?.lon ? parseFloat(selectedAddressOption.lon) : formData.longitude,
            };

            await updateDocument('Courts', court.id, updatedCourtData);


            toast.success('Facility updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error updating facility:', error);
            toast.error('Failed to update facility. Please try again.');
        } finally {
            setIsSubmitting(false);
            setUploadProgress({});
        }
    };

    if (!formData) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: { xs: 2, sm: 3 } }}>Edit Sports Facility</DialogTitle>
            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    You are editing details for: <strong>{court?.name}</strong>. Status of individual courts is managed elsewhere.
                </Alert>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box ref={basicInfoRef}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Facility Information</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField required label="Facility Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} error={!!errors.name} helperText={errors.name} />
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <TextField required label="Sport Type" value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)} error={!!errors.type} helperText={errors.type} fullWidth />
                                <TextField required label="General Area" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} error={!!errors.location} helperText={errors.location} fullWidth />
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
                                        setFormData(prev => ({ ...prev!, address: newInputValue, latitude: undefined, longitude: undefined }));
                                    }
                                }}
                                value={selectedAddressOption}
                                onChange={(event, newValue) => {
                                    setSelectedAddressOption(newValue);
                                    if (newValue) {
                                        setFormData(prev => ({
                                            ...prev!,
                                            address: newValue.display_name,
                                            latitude: parseFloat(newValue.lat),
                                            longitude: parseFloat(newValue.lon)
                                        }));
                                    } else {
                                        setFormData(prev => ({ ...prev!, address: '', latitude: undefined, longitude: undefined }));
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
                                <TextField label="Contact Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} fullWidth />
                                <TextField label="Operating Hours" value={formData.hours} onChange={(e) => handleInputChange('hours', e.target.value)} fullWidth />
                            </Box>
                        </Box>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Amenities</Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2, alignItems: { sm: 'center' } }}>
                            <TextField size="small" value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} placeholder="Enter an amenity" fullWidth />
                            <Button onClick={handleAddAmenity} variant="contained" size="small" sx={{ minWidth: '100px', width: { xs: '100%', sm: 'auto' }, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>Add</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.amenities.map((item, index) => (
                                <Chip key={index} label={item} onDelete={() => handleRemoveAmenity(item)} sx={{ bgcolor: 'primary.main', color: 'white', '& .MuiChip-deleteIcon': { color: 'white' } }} />
                            ))}
                        </Box>
                    </Box>
                    <Divider />
                    <Box ref={courtsRef}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Individual Courts</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Note: Court statuses ('available', 'in-use') are updated live and not edited here.
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            {formData.courts.map((subCourt, index) => (
                                <Box key={subCourt.id || index} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, alignItems: { sm: 'center' } }}>
                                    <TextField required size="small" label="Court Name/Number" value={subCourt.name} onChange={(e) => handleSubCourtChange(index, 'name', e.target.value)} error={!!(errors.courts?.[index]?.name)} helperText={errors.courts?.[index]?.name} fullWidth />
                                    <TextField required size="small" label="Surface Type" value={subCourt.surface} onChange={(e) => handleSubCourtChange(index, 'surface', e.target.value)} error={!!(errors.courts?.[index]?.surface)} helperText={errors.courts?.[index]?.surface} fullWidth />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '120px' }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Status: {subCourt.status}
                                        </Typography>
                                        {!subCourt.isConfigured && (
                                            <Chip label="Not Configured" size="small" sx={{ mt: 0.5, backgroundColor: '#fff3e0', color: '#e65100' }} />
                                        )}
                                    </Box>
                                    <IconButton onClick={() => handleRemoveSubCourt(index)} disabled={formData.courts.length === 1} color="error" sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                        <Button startIcon={<AddIcon />} onClick={handleAddSubCourt} variant="outlined" size="small" sx={{ mb: 2, borderColor: 'primary.main', color: 'primary.main', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(30, 58, 138, 0.04)' } }}>Add Another Court</Button>
                    </Box>
                    <Divider />
                    <Box ref={descriptionRef}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Facility Description</Typography>
                        <TextField required multiline rows={4} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} error={!!errors.description} helperText={errors.description} fullWidth />
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>Facility Images</Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                            {existingImageUrls.map((url, index) => (
                                <Box key={`existing-${url}-${index}`} sx={{ position: 'relative', width: { xs: 'calc(50% - 6px)', sm: 150 }, height: { xs: 120, sm: 150 }, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
                                    <img src={url} alt={`Existing ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {!isSubmitting && (
                                        <IconButton onClick={() => handleDeleteExistingImage(url)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }, p: 0.5 }}>
                                            <DeleteIcon sx={{ color: 'white', fontSize: '1rem' }} />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}
                            {newImagesToUpload.map((image, index) => (
                                <Box key={`new-${image.preview}-${index}`} sx={{ position: 'relative', width: { xs: 'calc(50% - 6px)', sm: 150 }, height: { xs: 120, sm: 150 }, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
                                    {uploadProgress[image.preview] !== undefined && uploadProgress[image.preview] < 100 && (
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.7)' }}>
                                            <CircularProgress variant="determinate" value={uploadProgress[image.preview]} size={40} />
                                        </Box>
                                    )}
                                    <img src={image.preview} alt={`New Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {!isSubmitting && (
                                        <IconButton onClick={() => handleRemoveNewImage(index)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }, p: 0.5 }}>
                                            <DeleteIcon sx={{ color: 'white', fontSize: '1rem' }} />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}
                            {(existingImageUrls.length + newImagesToUpload.length) < 5 && !isSubmitting && (
                                <Box component="label" sx={{ width: { xs: 'calc(50% - 6px)', sm: 150 }, height: { xs: 120, sm: 150 }, border: '2px dashed #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(30, 58, 138, 0.04)' } }}>
                                    <input autoComplete='off' type="file" hidden accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleAddNewImage(file); e.target.value = ''; } }} />
                                    <AddPhotoAlternateIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#666', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Add Image</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>(Max 5)</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                <Button onClick={onClose} variant="outlined" disabled={isSubmitting} sx={{ mr: { sm: 1 }, width: { xs: '100%', sm: 'auto' }, borderColor: 'primary.main', color: 'primary.main', '&:hover': { borderColor: 'primary.dark', bgcolor: 'rgba(30, 58, 138, 0.04)' } }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting} sx={{ px: 4, width: { xs: '100%', sm: 'auto' }, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}