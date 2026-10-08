import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, TextField,
    DialogActions, Button, CircularProgress, Box
} from '@mui/material';
import { transferCourtOwnership } from '../../services/courtService';
import toast from 'react-hot-toast';

interface TransferOwnershipDialogProps {
    open: boolean;
    onClose: () => void;
    courtId: string;
    courtName: string;
    onSuccess: () => void;
}

const TransferOwnershipDialog: React.FC<TransferOwnershipDialogProps> = ({ open, onClose, courtId, courtName, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTransfer = async () => {
        if (!email) {
            toast.error("Please enter the new owner's email address.");
            return;
        }
        setIsLoading(true);
        try {
            await transferCourtOwnership(courtId, email);
            toast.success(`Ownership of ${courtName} transferred successfully!`);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const closeDialog = () => {
        if (isLoading) return;
        setEmail('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={closeDialog} maxWidth="xs" fullWidth>
            <DialogTitle>Transfer {courtName}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Enter the email of the VacantCourt user who should own this facility. You’ll lose the ability to edit or delete it, and you can’t undo this.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="email"
                    label="New owner’s email"
                    autoComplete='off'
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={closeDialog} disabled={isLoading}>Cancel</Button>
                <Box sx={{ position: 'relative' }}>
                    <Button
                        onClick={handleTransfer}
                        variant="contained"
                        color="primary"
                        disabled={isLoading || !email}
                    >
                        Transfer ownership
                    </Button>
                    {isLoading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: 'primary.main',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}
                        />
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default TransferOwnershipDialog;