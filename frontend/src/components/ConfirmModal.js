import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

const ConfirmModal = ({ open, handleClose, handleConfirm, title, description }) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    padding: '8px',
                    maxWidth: '400px',
                    width: '100%',
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            
            <DialogContent sx={{ textAlign: 'center', pt: 0 }}>
                <Box
                    sx={{
                        backgroundColor: '#fef2f2',
                        borderRadius: '50%',
                        width: '64px',
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}
                >
                    <WarningAmberIcon sx={{ color: '#ef4444', fontSize: '32px' }} />
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                    {title || 'Are you sure?'}
                </Typography>
                
                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                    {description || 'Do you really want to delete this? This process cannot be undone.'}
                </Typography>
            </DialogContent>
            
            <DialogActions sx={{ display: 'flex', gap: 1, px: 3, pb: 3 }}>
                <Button
                    onClick={handleClose}
                    fullWidth
                    variant="outlined"
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        '&:hover': {
                            borderColor: '#cbd5e1',
                            backgroundColor: '#f8fafc',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    fullWidth
                    variant="contained"
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        backgroundColor: '#ef4444',
                        '&:hover': {
                            backgroundColor: '#dc2626',
                        }
                    }}
                >
                    Confirm Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;
