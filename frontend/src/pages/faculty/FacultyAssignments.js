import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Select, MenuItem, 
    FormControl, InputLabel, Snackbar, Alert, Grid, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Card, CardContent, Chip, Link
} from '@mui/material';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';

const FacultyAssignments = () => {
    const { currentUser, authToken: reduxToken } = useSelector(state => state.user);
    const token = reduxToken || localStorage.getItem('token') || localStorage.getItem('authToken');
    const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    console.log("BASE_URL:", baseUrl);
    console.log("Token:", token);

    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openSubDialog, setOpenSubDialog] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editData, setEditData] = useState({ title: '', description: '', course: '', dueDate: '' });

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        dueDate: ''
    });

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

    const fetchAssignments = useCallback(async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/assignments/faculty`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(res.data);
        } catch (error) {
            console.error(error);
            showSnackbar("Failed to fetch assignments", "error");
        }
    }, [token, baseUrl, showSnackbar]);

    useEffect(() => {
        if (currentUser) {
            fetchCourses();
            fetchAssignments();
        }
    }, [currentUser, fetchCourses, fetchAssignments]);

    const handleCreate = async () => {
        if (!formData.title || !formData.description || !formData.course || !formData.dueDate) {
            return showSnackbar("Please fill all fields", "warning");
        }
        try {
            await axios.post(`${baseUrl}/api/assignments`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar("Assignment created successfully");
            setOpenAddDialog(false);
            setFormData({ title: '', description: '', course: '', dueDate: '' });
            fetchAssignments();
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Failed to create", "error");
        }
    };

    const handleViewSubmissions = async (asgn) => {
        try {
            const res = await axios.get(`${baseUrl}/api/assignments/submissions/${asgn._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmissions(res.data);
            setSelectedAssignment(asgn);
            setOpenSubDialog(true);
        } catch (error) {
            showSnackbar("Failed to load submissions", "error");
        }
    };

    const openEdit = (asgn) => {
        setSelectedAssignment(asgn);
        setEditData({
            title: asgn.title,
            description: asgn.description,
            course: asgn.course?._id || asgn.course,
            dueDate: asgn.dueDate ? asgn.dueDate.split('T')[0] : ''
        });
        setOpenEditDialog(true);
    };

    const handleUpdate = async () => {
        if (!editData.title || !editData.description || !editData.course || !editData.dueDate) {
            return showSnackbar("Please fill all fields", "warning");
        }
        try {
            const id = selectedAssignment._id?.toString() || selectedAssignment._id;
            await axios.put(`${baseUrl}/api/assignments/${id}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar("Assignment updated successfully");
            setOpenEditDialog(false);
            fetchAssignments();
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Failed to update", "error");
        }
    };

    return (
        <Box sx={{ p: 4, fontFamily: 'Poppins, sans-serif' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Assignments Management
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenAddDialog(true)}
                    sx={{ borderRadius: 2, px: 3, py: 1 }}
                >
                    New Assignment
                </Button>
            </Box>

            <Grid container spacing={3}>
                {assignments.length > 0 ? (
                    assignments.map((asgn) => (
                        <Grid item xs={12} md={6} lg={4} key={asgn._id}>
                            <Card sx={{ 
                                borderRadius: 3, 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                transition: '0.3s',
                                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }
                            }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" mb={2}>
                                        <Chip 
                                            label={asgn.course?.subName || asgn.course?.name || "Global"} 
                                            color="primary" 
                                            variant="outlined" 
                                            size="small" 
                                        />
                                        <Typography variant="caption" color="textSecondary">
                                            Due: {new Date(asgn.dueDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>{asgn.title}</Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3, minHeight: 40 }}>
                                        {asgn.description.length > 100 ? asgn.description.substring(0, 100) + '...' : asgn.description}
                                    </Typography>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2" color="primary">
                                            {asgn.submissionCount || 0} Submissions
                                        </Typography>
                                        <Box display="flex" gap={1}>
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                startIcon={<EditIcon />} 
                                                onClick={() => openEdit(asgn)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="small" 
                                                startIcon={<VisibilityIcon />} 
                                                onClick={() => handleViewSubmissions(asgn)}
                                            >
                                                View
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Box textAlign="center" width="100%" mt={10}>
                        <DescriptionIcon sx={{ fontSize: 60, color: 'divider' }} />
                        <Typography variant="h6" color="textSecondary">No assignments created yet</Typography>
                    </Box>
                )}
            </Grid>

            {/* Create Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">Create New Assignment</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField 
                            label="Title" 
                            fullWidth 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                        <TextField 
                            label="Description" 
                            multiline 
                            rows={4} 
                            fullWidth 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Select Course</InputLabel>
                            <Select
                            value={formData.course}
                            onChange={(e) => {
                                const cId = e.target.value;
                                const cObj = courses.find(c => c._id === cId);
                                setFormData({ 
                                    ...formData, 
                                    course: cId,
                                    courseModel: cObj?.type === 'v2' ? 'v2_course' : 'subject'
                                });
                            }}
                            label="Course"
                        >
                            {courses.length === 0 ? (
                                <MenuItem disabled value="">No courses assigned</MenuItem>
                            ) : (
                                courses.map((course) => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.name} ({course.department})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                        </FormControl>
                        <TextField 
                            label="Due Date" 
                            type="date" 
                            fullWidth 
                            InputLabelProps={{ shrink: true }}
                            value={formData.dueDate}
                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">Edit Assignment</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField label="Title" fullWidth value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} />
                        <TextField label="Description" multiline rows={4} fullWidth value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
                        <FormControl fullWidth>
                            <InputLabel>Select Course</InputLabel>
                            <Select value={editData.course} label="Select Course" onChange={(e) => setEditData({...editData, course: e.target.value})}>
                                {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.subName || c.name || c.courseName}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={editData.dueDate} onChange={(e) => setEditData({...editData, dueDate: e.target.value})} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Submissions Dialog */}
            <Dialog open={openSubDialog} onClose={() => setOpenSubDialog(false)} fullWidth maxWidth="md">
                <DialogTitle fontWeight="bold">
                    Submissions: {selectedAssignment?.title}
                </DialogTitle>
                <DialogContent>
                    {submissions.length > 0 ? (
                        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f7fa' }}>
                                    <TableRow>
                                        <TableCell><strong>Student</strong></TableCell>
                                        <TableCell><strong>Reg. Number</strong></TableCell>
                                        <TableCell><strong>Submitted At</strong></TableCell>
                                        <TableCell align="center"><strong>Action</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {submissions.map((sub) => (
                                        <TableRow key={sub._id}>
                                            <TableCell>{sub.student?.name}</TableCell>
                                            <TableCell>{sub.student?.rollNum || sub.student?.registerNumber}</TableCell>
                                            <TableCell>{new Date(sub.submittedAt).toLocaleString()}</TableCell>
                                            <TableCell align="center">
                                                <Button 
                                                    size="small" 
                                                    href={`${baseUrl}${sub.fileUrl}`} 
                                                    target="_blank"
                                                    component={Link}
                                                    startIcon={<VisibilityIcon />}
                                                >
                                                    View PDF
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box py={10} textAlign="center">
                            <Typography color="textSecondary">No submissions found</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenSubDialog(false)}>Close</Button>
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

export default FacultyAssignments;
