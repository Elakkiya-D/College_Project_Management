import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Select, MenuItem, 
    FormControl, InputLabel, Snackbar, Alert, Grid, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Card, CardContent, Chip, IconButton, Link
} from '@mui/material';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';

const FacultyAssignments = () => {
    const { currentUser, authToken: reduxToken } = useSelector(state => state.user);
    const token = reduxToken || localStorage.getItem('token') || localStorage.getItem('authToken');
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openSubDialog, setOpenSubDialog] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

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
            const facultyId = currentUser?._id || currentUser?.id;
            const res = await axios.get(`${baseUrl}/api/courses/faculty/${facultyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data.data || res.data || []);
        } catch (error) {
            console.error(error);
        }
    }, [currentUser, token, baseUrl]);

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
                                        <Button 
                                            size="small" 
                                            startIcon={<VisibilityIcon />} 
                                            onClick={() => handleViewSubmissions(asgn)}
                                        >
                                            View
                                        </Button>
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
                                label="Select Course"
                                onChange={(e) => setFormData({...formData, course: e.target.value})}
                            >
                                {courses.map(c => (
                                    <MenuItem key={c._id} value={c._id}>
                                        {c.subName || c.name || c.courseName}
                                    </MenuItem>
                                ))}
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
