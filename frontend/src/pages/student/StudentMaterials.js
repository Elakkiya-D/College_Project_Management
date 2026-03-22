import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, Typography, Grid, Card, CardContent, 
    Chip, Snackbar, Alert, CircularProgress, Link
} from '@mui/material';
import axios from 'axios';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LinkIcon from '@mui/icons-material/Link';
import SchoolIcon from '@mui/icons-material/School';
import BookmarkIcon from '@mui/icons-material/Bookmark';


const StudentMaterials = () => {
    const { currentUser, authToken: reduxToken } = useSelector(state => state.user);
    const token = reduxToken || localStorage.getItem('token') || localStorage.getItem('authToken');
    const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    console.log("BASE_URL:", baseUrl);
    console.log("Token:", token);

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = useCallback((msg, severity = 'success') => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    }, []);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/api/materials/student`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(res.data);
        } catch (error) {
            showSnackbar("Failed to fetch materials", "error");
        } finally {
            setLoading(false);
        }
    }, [token, baseUrl, showSnackbar]);

    useEffect(() => {
        if (currentUser) {
            fetchMaterials();
        }
    }, [currentUser, fetchMaterials]);

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    const groupedMaterials = materials.reduce((acc, mat) => {
        const courseName = mat.course?.subName || mat.course?.name || "Global";
        if (!acc[courseName]) acc[courseName] = [];
        acc[courseName].push(mat);
        return acc;
    }, {});

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="black" color="primary" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolIcon fontSize="inherit" /> Study Materials
            </Typography>

            {Object.keys(groupedMaterials).length > 0 ? (
                Object.entries(groupedMaterials).map(([course, mats]) => (
                    <Box key={course} mb={6}>
                        <Typography variant="h6" fontWeight="bold" sx={{ 
                            borderBottom: '2px solid #eee', 
                            pb: 1, 
                            mb: 3, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'primary.dark'
                        }}>
                             {course}
                        </Typography>
                        <Grid container spacing={3}>
                            {mats.map((mat) => (
                                <Grid item xs={12} key={mat._id}>
                                    <Card sx={{ 
                                        borderRadius: 3, 
                                        display: 'flex', 
                                        overflow: 'hidden',
                                        transition: '0.3s',
                                        '&:hover': { transform: 'translateX(8px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }
                                    }}>
                                        <Box sx={{ 
                                            width: 10, 
                                            bgcolor: mat.type === 'pdf' ? 'error.main' : 'primary.main' 
                                        }} />
                                        <CardContent sx={{ flex: 1, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <BookmarkIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.6 }} />
                                                    <Typography variant="h6" fontWeight="bold" color="textPrimary">{mat.title}</Typography>
                                                </Box>
                                                <Box display="flex" gap={3}>
                                                    <Typography variant="caption" color="textSecondary" fontWeight="bold">
                                                        Chapter: {mat.chapter}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Added: {new Date(mat.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                {mat.description && (
                                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                                        {mat.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box display="flex" gap={2} alignItems="center">
                                                <Chip 
                                                    icon={mat.type === 'pdf' ? <PictureAsPdfIcon /> : <LinkIcon />} 
                                                    label={mat.type === 'pdf' ? "Download PDF" : "Open Link"} 
                                                    onClick={() => window.open(mat.type === 'pdf' ? `${baseUrl}${mat.fileUrl}` : mat.linkUrl, '_blank')}
                                                    component={Link}
                                                    color={mat.type === 'pdf' ? 'error' : 'primary'}
                                                    variant="contained"
                                                    sx={{ 
                                                        cursor: 'pointer', 
                                                        fontWeight: 'bold', 
                                                        borderRadius: 2, 
                                                        px: 2, 
                                                        py: 2.5,
                                                        textDecoration: 'none !important'
                                                    }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))
            ) : (
                <Box textAlign="center" py={10}>
                    <Typography color="textSecondary">No study materials available yet.</Typography>
                </Box>
            )}

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)} variant="filled"> {snackbarMsg} </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentMaterials;
