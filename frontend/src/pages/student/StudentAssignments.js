import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, Typography, Button, Grid, Card, CardContent, 
    Chip, Snackbar, Alert, CircularProgress, Dialog, DialogTitle, 
    DialogContent, DialogActions, LinearProgress, Link
} from '@mui/material';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';

const StudentAssignments = () => {
    const { currentUser, authToken: reduxToken } = useSelector(state => state.user);
    const token = reduxToken || localStorage.getItem('token') || localStorage.getItem('authToken');
    const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    console.log("BASE_URL:", baseUrl);
    console.log("Token:", token);

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Snackbar
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = useCallback((msg, severity = 'success') => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    }, []);

    const fetchAssignments = useCallback(async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/assignments/student`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(res.data);
        } catch (error) {
            console.error(error);
            showSnackbar("Failed to fetch assignments", "error");
        } finally {
            setLoading(false);
        }
    }, [token, baseUrl, showSnackbar]);

    useEffect(() => {
        if (currentUser) {
            fetchAssignments();
        }
    }, [currentUser, fetchAssignments]);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Validation
        if (selectedFile.type !== "application/pdf") {
            return showSnackbar("Only PDF files are allowed", "error");
        }
        if (selectedFile.size > 1024 * 1024) {
             return showSnackbar("File size must be less than 1MB", "error");
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file || !selectedAssignment) return showSnackbar("Select a file first", "warning");

        const formData = new FormData();
        formData.append('file', file);
        if (!isEdit) formData.append('assignmentId', selectedAssignment._id);

        try {
            setUploading(true);
            const subId = selectedAssignment.submissionId?.toString() || selectedAssignment.submissionId;
            const endpoint = isEdit ? `${baseUrl}/api/submissions/${subId}` : `${baseUrl}/api/submissions`;
            const method = isEdit ? 'put' : 'post';

            await axios[method](endpoint, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            showSnackbar(isEdit ? "Submission updated" : "Assignment submitted successfully");
            setOpenUploadDialog(false);
            setFile(null);
            setIsEdit(false);
            fetchAssignments();
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Upload failed", "error");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, fontFamily: 'Poppins, sans-serif' }}>
            <Typography variant="h4" fontWeight="black" color="primary" gutterBottom sx={{ mb: 4 }}>
                My Assignments
            </Typography>

            <Grid container spacing={3}>
                {assignments.length > 0 ? (
                    assignments.map((asgn) => (
                        <Grid item xs={12} key={asgn._id}>
                            <Card sx={{ 
                                borderRadius: 3, 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                transition: '0.3s',
                                '&:hover': { transform: 'translateX(5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' },
                                display: 'flex',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{ 
                                    width: 10, 
                                    bgcolor: asgn.status === 'Submitted' ? 'success.main' : 'error.main',
                                    transition: '0.3s'
                                }} />
                                <CardContent sx={{ flex: 1, p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box>
                                            <Typography variant="h5" fontWeight="black" color="textPrimary">{asgn.title}</Typography>
                                            <Box display="flex" gap={3} mt={1}>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="textSecondary">{asgn.faculty?.name || "Faculty"}</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="textSecondary">Due: {new Date(asgn.dueDate).toLocaleDateString()}</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box textAlign="right">
                                            <Chip 
                                                label={asgn.course?.subName || "Course"} 
                                                variant="outlined" 
                                                size="small" 
                                                sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main', border: '1.5px solid' }} 
                                            />
                                            <Box>
                                                {asgn.status === 'Submitted' ? (
                                                    <Chip 
                                                        icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />} 
                                                        label="Submitted" 
                                                        color="success" 
                                                        size="small" 
                                                        sx={{ fontWeight: 'bold' }} 
                                                    />
                                                ) : (
                                                    <Chip 
                                                        label="Not Submitted" 
                                                        color="error" 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ fontWeight: 'bold' }} 
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                        {asgn.description}
                                    </Typography>

                                    <Box display="flex" justifyContent="flex-end" gap={2}>
                                        {asgn.status === 'Submitted' ? (
                                            <>
                                                <Button size="small" startIcon={<VisibilityIcon />} href={`${baseUrl}${asgn.fileUrl}`} target="_blank" component={Link}>View</Button>
                                                <Button 
                                                    size="small" 
                                                    variant="outlined" 
                                                    onClick={() => {
                                                        setSelectedAssignment(asgn);
                                                        setIsEdit(true);
                                                        setOpenUploadDialog(true);
                                                    }}
                                                >
                                                    Edit Submission
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => {
                                                setSelectedAssignment(asgn);
                                                setIsEdit(false);
                                                setOpenUploadDialog(true);
                                            }} sx={{ borderRadius: 2 }}>
                                                Upload Submission
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Box textAlign="center" width="100%" mt={10}>
                        <InfoIcon sx={{ fontSize: 60, color: 'divider', mb: 2 }} />
                        <Typography variant="h6" color="textSecondary">No assignments found for your courses</Typography>
                    </Box>
                )}
            </Grid>

            {/* Upload Dialog */}
            <Dialog open={openUploadDialog} onClose={() => !uploading && setOpenUploadDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="black">{isEdit ? "Edit Submission" : "Submit Assignment"}</DialogTitle>
                <DialogContent>
                    <Box textAlign="center" py={4} sx={{ border: '2px dashed #eee', borderRadius: 3, mt: 1 }}>
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" gutterBottom>{selectedAssignment?.title}</Typography>
                        <Typography variant="caption" color="textSecondary" display="block" mb={3}>
                            Only PDF allowed (Max 1MB)
                        </Typography>
                        
                        <input
                            type="file"
                            id="pdf-upload"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="pdf-upload">
                            <Button variant="outlined" component="span" sx={{ borderRadius: 2 }}>
                                Select PDF File
                            </Button>
                        </label>

                        {file && (
                            <Typography variant="body2" color="primary" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Selected: {file.name}
                            </Typography>
                        )}
                    </Box>
                    {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenUploadDialog(false)} disabled={uploading}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleUpload} 
                        disabled={!file || uploading}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {uploading ? "Submitting..." : (isEdit ? "Update" : "Submit")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={4000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentAssignments;
