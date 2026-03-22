import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, Typography, Button, Select, MenuItem, 
    FormControl, InputLabel, Snackbar, Alert, Grid, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Card, CardContent, Chip, RadioGroup, FormControlLabel, Radio,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LinkIcon from '@mui/icons-material/Link';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const FacultyMaterials = () => {
    const { currentUser, authToken: reduxToken } = useSelector(state => state.user);
    const token = reduxToken || localStorage.getItem('token') || localStorage.getItem('authToken');
    const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    console.log("BASE_URL:", baseUrl);
    console.log("Token:", token);

    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        chapter: '',
        course: '',
        type: 'pdf',
        linkUrl: ''
    });
    const [file, setFile] = useState(null);

    // Snackbar
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = useCallback((msg, severity = 'success') => {
        setSnackbarMsg(msg);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    }, []);

    const fetchCourses = useCallback(async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/faculty/my-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Courses:", res.data);
            setCourses(res.data || []);
        } catch (error) {
            console.error(error);
        }
    }, [token, baseUrl]);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/api/materials/faculty`, {
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
            fetchCourses();
            fetchMaterials();
        }
    }, [currentUser, fetchCourses, fetchMaterials]);

    const handleSave = async () => {
        if (!formData.title || !formData.chapter || !formData.course) {
            return showSnackbar("Please fill initial fields", "warning");
        }
        
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('description', formData.description);
        payload.append('chapter', formData.chapter);
        payload.append('course', formData.course);
        payload.append('type', formData.type);

        if (formData.type === 'pdf') {
            if (file) payload.append('file', file);
            else if (!isEdit) return showSnackbar("Select a PDF file", "warning");
        } else {
            if (!formData.linkUrl) return showSnackbar("Provide link URL", "warning");
            payload.append('linkUrl', formData.linkUrl);
        }

        try {
            setUploading(true);
            const matId = selectedMaterial?._id?.toString() || selectedMaterial?._id;
            const endpoint = isEdit ? `${baseUrl}/api/materials/${matId}` : `${baseUrl}/api/materials`;
            const method = isEdit ? 'put' : 'post';

            await axios[method](endpoint, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            showSnackbar(isEdit ? "Material updated successfully" : "Material uploaded successfully");
            setOpenAddDialog(false);
            setFormData({ title: '', description: '', chapter: '', course: '', type: 'pdf', linkUrl: '' });
            setFile(null);
            setIsEdit(false);
            fetchMaterials();
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Failed to save", "error");
        } finally {
            setUploading(false);
        }
    };

    const openEdit = (mat) => {
        setSelectedMaterial(mat);
        setFormData({
            title: mat.title || '',
            description: mat.description || '',
            chapter: mat.chapter || '',
            course: mat.course?._id || mat.course || '',
            type: mat.type || 'pdf',
            linkUrl: mat.linkUrl || ''
        });
        setIsEdit(true);
        setOpenAddDialog(true);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Study Materials</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenAddDialog(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Add Material
                </Button>
            </Box>

            {loading ? <Box py={5} textAlign="center"><CircularProgress /></Box> : (
            <Grid container spacing={3}>
                {materials.length > 0 ? (
                    materials.map((mat) => (
                        <Grid item xs={12} md={6} lg={4} key={mat._id}>
                            <Card sx={{ 
                                borderRadius: 3, 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                '&:hover': { boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                                        {mat.type === 'pdf' ? <PictureAsPdfIcon color="error" /> : <LinkIcon color="primary" />}
                                        <Chip label={mat.type.toUpperCase()} size="small" variant="outlined" />
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" noWrap>{mat.title}</Typography>
                                    <Typography variant="caption" color="textSecondary" display="block"> Chapter: {mat.chapter} </Typography>
                                    <Typography variant="caption" color="primary" fontWeight="bold"> {mat.course?.subName || mat.course?.name} </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, minHeight: 40 }} color="textSecondary">
                                        {mat.description || "No description provided"}
                                    </Typography>
                                </CardContent>
                                <Box sx={{ p: 2, borderTop: '1px solid #eee' }} display="flex" justifyContent="space-between">
                                    <Button 
                                        size="small" 
                                        onClick={() => openEdit(mat)}
                                        startIcon={<LibraryBooksIcon sx={{ fontSize: 16 }} />}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        size="small" 
                                        href={mat.type === 'pdf' ? `${baseUrl}${mat.fileUrl}` : mat.linkUrl} 
                                        target="_blank"
                                        startIcon={<VisibilityIcon />}
                                    >
                                        Open
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Box textAlign="center" width="100%" mt={10}>
                        <LibraryBooksIcon sx={{ fontSize: 60, color: 'divider' }} />
                        <Typography color="textSecondary">No study materials found</Typography>
                    </Box>
                )}
            </Grid>
            )}

            {/* Add Dialog */}
            <Dialog open={openAddDialog} onClose={() => !uploading && setOpenAddDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">Add Study Material</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
                        <TextField label="Title" fullWidth value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        <TextField label="Chapter / Topic" fullWidth value={formData.chapter} onChange={e => setFormData({...formData, chapter: e.target.value})} />
                        <TextField label="Description" multiline rows={2} fullWidth value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        
                        <FormControl fullWidth>
                            <InputLabel>Course</InputLabel>
                            <Select
                                value={formData.course}
                                label="Course"
                                onChange={(e) => {
                                    const cId = e.target.value;
                                    const cObj = courses.find(c => c._id === cId);
                                    setFormData({ 
                                        ...formData, 
                                        course: cId,
                                        courseModel: cObj?.type === 'v2' ? 'v2_course' : 'subject'
                                    });
                                }}
                            >
                                {courses.length === 0 ? (
                                    <MenuItem disabled value="">No courses assigned</MenuItem>
                                ) : (
                                    courses.map(c => (
                                        <MenuItem key={c._id} value={c._id}>
                                            {c.name} ({c.department})
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <Typography variant="subtitle2" gutterBottom>Type</Typography>
                            <RadioGroup row value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <FormControlLabel value="pdf" control={<Radio />} label="PDF File" />
                                <FormControlLabel value="link" control={<Radio />} label="Website Link" />
                            </RadioGroup>
                        </FormControl>

                        {formData.type === 'pdf' ? (
                            <Box textAlign="center" py={2} sx={{ border: '1px dashed #ccc', borderRadius: 2 }}>
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    onChange={e => setFile(e.target.files[0])} 
                                    style={{ display: 'none' }} 
                                    id="file-input" 
                                />
                                <label htmlFor="file-input">
                                    <Button variant="outlined" component="span">Select PDF</Button>
                                </label>
                                {file && <Typography sx={{ mt: 1 }} color="primary" variant="caption">{file.name}</Typography>}
                            </Box>
                        ) : (
                            <TextField label="Link URL" placeholder="https://..." fullWidth value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAddDialog(false)} disabled={uploading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={uploading}>
                        {uploading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? "Update" : "Upload")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)} variant="filled"> {snackbarMsg} </Alert>
            </Snackbar>
        </Box>
    );
};

export default FacultyMaterials;
