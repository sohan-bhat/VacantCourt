import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    Box, Typography, Paper, TextField, Button, Avatar, Badge,
    IconButton, CircularProgress, Stack, Alert, InputAdornment,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemText, Slider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '../../services/cropImage';

import { updateUserProfile, updateUserPassword, deleteCurrentUserAccount } from '../../services/authService';
import { uploadImage } from '../../services/storageService';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/config';
import PageMeta from '../layout/PageMeta';

const ProfileSettings: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPass, setIsUpdatingPass] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [ownershipWarningOpen, setOwnershipWarningOpen] = useState(false);
    const [ownedCourts, setOwnedCourts] = useState<string[]>([]);
    const [isCheckingOwnership, setIsCheckingOwnership] = useState(false);

    const [isPictureDialogOpen, setIsPictureDialogOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarClick = () => setIsPictureDialogOpen(true);
    const closePictureDialog = () => {
        setIsPictureDialogOpen(false);
        setTimeout(() => { setImageSrc(null); setZoom(1); setCrop({ x: 0, y: 0 }); }, 300);
    };
    const handleUploadButtonClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result as string));
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => setCroppedAreaPixels(croppedAreaPixels), []);
    const handleUploadCroppedImage = async () => {
        if (!croppedAreaPixels || !imageSrc || !currentUser) return;
        setIsUploading(true);
        const toastId = toast.loading('Uploading picture...');
        try {
            const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedImageFile) throw new Error('Could not crop image.');
            const photoURL = await uploadImage(croppedImageFile, currentUser.uid);
            await updateUserProfile({ photoURL });
            toast.success('Profile picture updated!', { id: toastId });
            closePictureDialog();
            window.location.reload();
        } catch (error) {
            console.error(error); toast.error('Failed to upload image.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (displayName === currentUser?.displayName) return;
        setIsUpdatingProfile(true);
        try {
            await updateUserProfile({ displayName });
            toast.success('Display name updated!');
            window.location.reload();
        } catch (error) { toast.error('Failed to update profile.'); } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }
        if (newPassword.length < 6) { toast.error("Password must be at least 6 characters long."); return; }
        setIsUpdatingPass(true);
        try {
            await updateUserPassword(newPassword);
            toast.success('Password updated successfully! You have been logged out.');
            await logout();
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') { toast.error("Please log out and log back in to change your password.", { duration: 5000 }); } else { toast.error('Failed to update password.'); }
        } finally {
            setIsUpdatingPass(false);
        }
    };

    const openDeleteDialog = async () => {
        if (!currentUser) return;
        setIsCheckingOwnership(true);
        try {
            const courtsRef = collection(db, "Courts");
            const q = query(courtsRef, where("ownerId", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const courtNames = querySnapshot.docs.map(doc => doc.data().name);
                setOwnedCourts(courtNames); setOwnershipWarningOpen(true);
            } else { setDeleteDialogOpen(true); }
        } catch (error) { toast.error("Could not verify court ownership. Please try again."); } finally {
            setIsCheckingOwnership(false);
        }
    };

    const closeDeleteDialog = () => { setDeleteDialogOpen(false); setConfirmationText(''); };

    const handleDeleteAccount = async () => {
        if (confirmationText !== 'DELETE') { toast.error('Please type DELETE to confirm.'); return; }
        if (!currentUser) { toast.error("No user is signed in."); return; }
        try {
            closeDeleteDialog(); await deleteCurrentUserAccount();
            toast.success("Account deleted successfully."); navigate('/auth', { state: { from: '/dashboard' } });
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') { toast.error("This operation is sensitive and requires recent authentication. Please log out and log back in to delete your account."); } else { toast.error("Failed to delete account. Please try again."); }
        }
    };

    const cardStyles = {
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '14px',
    };

    const buttonStyles = {
        minWidth: 140,
    };

    return (
        <>
            <PageMeta
                title="Account Settings"
                description="Manage your VacantCourt profile. Update your display name, change your password, and manage your account details securely."
            />
            <Stack spacing={3}>
                <Paper variant="outlined" component="form" onSubmit={handleProfileUpdate} sx={cardStyles}>
                    <Typography variant="h6" component="h2">Profile</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                        Update your name and profile photo.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={<IconButton onClick={handleAvatarClick} aria-label="Change profile photo" size="small" sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'text.primary', '&:hover': { bgcolor: 'background.paper' } }}><EditIcon fontSize="small" /></IconButton>}>
                            <Avatar src={currentUser?.photoURL || ''} sx={{ width: 88, height: 88, bgcolor: 'grey.200' }} />
                        </Badge>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />
                        <Stack spacing={2} sx={{ width: '100%' }}>
                            <TextField fullWidth label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                            <TextField fullWidth label="Email Address" value={currentUser?.email || ''} disabled />
                        </Stack>
                    </Stack>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" sx={buttonStyles} disabled={isUpdatingProfile || displayName === currentUser?.displayName}>
                            {isUpdatingProfile ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
                        </Button>
                    </Box>
                </Paper>

                <Paper variant="outlined" component="form" onSubmit={handlePasswordUpdate} sx={cardStyles}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Password</Typography>
                    <Alert severity="info" sx={{ mb: 3 }}>You’ll be signed out after changing your password.</Alert>
                    <Stack spacing={2}>
                        <TextField type={showNewPassword ? 'text' : 'password'} label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">{showNewPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                        <TextField type={showConfirmPassword ? 'text' : 'password'} label="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                    </Stack>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" sx={buttonStyles} disabled={isUpdatingPass || !newPassword}>
                            {isUpdatingPass ? <CircularProgress size={20} color="inherit" /> : 'Update password'}
                        </Button>
                    </Box>
                </Paper>

                <Paper variant="outlined" sx={cardStyles}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Delete account
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        This permanently deletes your profile and court alerts. Transfer or delete any facilities you own first.
                    </Typography>
                    <Button variant="outlined" color="error" onClick={openDeleteDialog} sx={buttonStyles} disabled={isCheckingOwnership}>
                        {isCheckingOwnership ? <CircularProgress size={20} color="inherit" /> : 'Delete account'}
                    </Button>
                </Paper>
            </Stack>
            <Dialog open={isPictureDialogOpen} onClose={closePictureDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Profile Picture</DialogTitle>
                <DialogContent sx={{ ...(imageSrc && { position: 'relative', height: '400px', p: 0 }) }}>
                    {!imageSrc ? (<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, p: 4 }}><Avatar src={currentUser?.photoURL || ''} sx={{ width: 120, height: 120 }} /><Button variant="contained" startIcon={<PhotoCamera />} onClick={handleUploadButtonClick}>Upload New Picture</Button></Box>) : (<><Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} cropShape="round" /><Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 10 }}><Typography sx={{ color: 'white', textShadow: '1px 1px 2px black' }}>Zoom</Typography><Slider value={zoom} min={1} max={3} step={0.1} aria-labelledby="zoom-slider" onChange={(_, zoom) => setZoom(zoom as number)} sx={{ color: 'white' }} /></Box></>)}
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>{imageSrc ? (<><Button onClick={() => setImageSrc(null)} disabled={isUploading}>Back</Button><Button onClick={handleUploadCroppedImage} variant="contained" disabled={isUploading}>{isUploading ? <CircularProgress size={20} color="inherit" /> : 'Save Picture'}</Button></>) : (<Button onClick={closePictureDialog}>Close</Button>)}</DialogActions>
            </Dialog>
            <Dialog open={ownershipWarningOpen} onClose={() => setOwnershipWarningOpen(false)}><DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarningAmberIcon color="error" />Cannot Delete Account</DialogTitle><DialogContent><DialogContentText component="div">You cannot delete your account because you are the owner of the following {ownedCourts.length} facility/facilities:<Paper variant="outlined" sx={{ my: 2, p: 1, maxHeight: 150, overflowY: 'auto' }}><List dense>{ownedCourts.map(name => (<ListItem key={name}><ListItemText primary={name} /></ListItem>))}</List></Paper>Please transfer ownership or delete these facilities first.<br /><br />If you do not know another organizer, it is highly recommended to transfer ownership to: <strong>officialvacantcourt@gmail.com</strong></DialogContentText></DialogContent><DialogActions><Button onClick={() => setOwnershipWarningOpen(false)} autoFocus>OK</Button></DialogActions></Dialog>
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}><DialogTitle sx={{ textAlign: 'center', pt: 3 }}><Stack direction="column" alignItems="center" spacing={1}><WarningAmberIcon sx={{ fontSize: '3.5rem', color: 'error.main' }} /><Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>Are you absolutely sure?</Typography></Stack></DialogTitle><DialogContent><DialogContentText component="div" sx={{ textAlign: 'center', mb: 2 }}>This action is irreversible. All of your data will be permanently deleted.<Box component="ul" sx={{ textAlign: 'left', mt: 2, pl: 4, color: 'text.secondary' }}><li>Your user profile (email, name, photo)</li><li>All active court notification requests</li></Box></DialogContentText><Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>To confirm, please type <strong>DELETE</strong> in the box below.</Typography><TextField autoFocus margin="dense" id="delete-confirmation" label="Type DELETE to confirm" type="text" fullWidth variant="outlined" value={confirmationText} onChange={(e) => setConfirmationText(e.target.value)} placeholder="DELETE" autoComplete="off" /></DialogContent><DialogActions sx={{ p: '16px 24px' }}><Button onClick={closeDeleteDialog} variant="outlined">Cancel</Button><Button onClick={handleDeleteAccount} variant="contained" color="error" disabled={confirmationText !== 'DELETE'}>Delete My Account</Button></DialogActions></Dialog>
        </>
    );
};

export default ProfileSettings;