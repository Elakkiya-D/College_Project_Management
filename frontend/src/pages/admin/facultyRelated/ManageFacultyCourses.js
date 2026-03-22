import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
    Box, Typography, Paper, Checkbox, 
    FormControlLabel, Grid, CircularProgress, 
    Divider, Snackbar, Alert
} from '@mui/material';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ClassIcon from '@mui/icons-material/Class';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ManageFacultyCourses = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const facultyId = params.id;
    const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    console.log("BASE_URL:", baseUrl);
    console.log("Token:", token);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [faculty, setFaculty] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [assignedCourseIds, setAssignedCourseIds] = useState([]);
    
    // UI State
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch Faculty Details
            const facultyRes = await axios.get(`${baseUrl}/Faculty/${facultyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const facData = facultyRes.data;
            setFaculty(facData);
            
            // Map existing assigned courses (handle both v1 teachSubject and assignedCourses array)
            const existingIds = [];
            if (facData.teachSubject?._id) existingIds.push(facData.teachSubject._id.toString());
            if (Array.isArray(facData.assignedCourses)) {
                facData.assignedCourses.forEach(c => {
                    const id = c._id || c;
                    if (id && !existingIds.includes(id.toString())) {
                        existingIds.push(id.toString());
                    }
                });
            }
            setAssignedCourseIds(existingIds);

            // 2. Fetch All Departments (Classes)
            const deptRes = await axios.get(`${baseUrl}/SclassList/${currentUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(deptRes.data || []);

            // 3. Fetch All Subjects
            const subRes = await axios.get(`${baseUrl}/AllSubjects/${currentUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllCourses(subRes.data || []);

        } catch (error) {
            console.error("Error fetching management data:", error);
            setSnackbar({ open: true, message: "Failed to load management data", severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [baseUrl, facultyId, token, currentUser._id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleCourse = (courseId) => {
        const cIdStr = courseId.toString();
        setAssignedCourseIds(prev => 
            prev.includes(cIdStr) 
                ? prev.filter(id => id !== cIdStr) 
                : [...prev, cIdStr]
        );
    };

    const handleSave = async () => {
        if (assignedCourseIds.length === 0) {
            setSnackbar({ open: true, message: "Please select at least one course", severity: 'warning' });
            return;
        }

        setSaving(true);
        try {
            await axios.put(`${baseUrl}/api/faculty/assign-courses`, {
                facultyId,
                courseIds: assignedCourseIds
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSnackbar({ open: true, message: "Courses assigned successfully!", severity: 'success' });
            setTimeout(() => navigate(-1), 1500);
        } catch (error) {
            console.error("Save Error:", error);
            setSnackbar({ open: true, message: error.response?.data?.message || "Failed to save assignments", severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" py={20}>
                <CircularProgress />
            </Box>
        );
    }

    // Group courses by department
    const groupedCourses = departments.map(dept => {
        const deptCourses = allCourses.filter(sub => 
            (sub.sclassName?._id || sub.sclassName) === dept._id
        );
        return { ...dept, courses: deptCourses };
    }).filter(d => d.courses.length > 0);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title={`Manage Courses: ${faculty?.name}`}
                subtitle="Assign multiple courses across different departments."
                actions={[
                    {
                        label: 'Save Changes',
                        variant: 'primary',
                        onClick: handleSave,
                        loading: saving,
                        icon: <SaveIcon />
                    },
                    {
                        label: 'Cancel',
                        variant: 'secondary',
                        onClick: () => navigate(-1),
                        icon: <ArrowBackIcon />
                    }
                ]}
            />

            <Box mt={4}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <ContentCard title="Faculty Info">
                            <Box textAlign="center" py={2}>
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 border border-blue-100 shadow-sm">
                                    <ClassIcon />
                                </div>
                                <Typography variant="h6" fontWeight="900" color="textPrimary">
                                    {faculty?.name}
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{ opacity: 0.6, letterSpacing: 1 }}>
                                    {faculty?.teachSclass?.sclassName || "No Primary Dept"}
                                </Typography>
                                
                                <Box mt={4} textAlign="left">
                                    <Typography variant="xs" fontWeight="black" color="primary" sx={{ display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                        Selected: {assignedCourseIds.length} Courses
                                    </Typography>
                                    <Divider />
                                    <Box mt={2} maxHeight={300} overflow="auto">
                                        {assignedCourseIds.map(id => {
                                            const course = allCourses.find(c => c._id === id);
                                            return course ? (
                                                <Paper key={id} variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'slate.50', borderColor: 'black.5' }}>
                                                    <MenuBookIcon fontSize="small" color="primary" />
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {course.subName}
                                                    </Typography>
                                                </Paper>
                                            ) : null;
                                        })}
                                    </Box>
                                </Box>
                            </Box>
                        </ContentCard>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <ContentCard title="Course Catalog" subtitle="Select courses from all departments to assign.">
                            <Box maxHeight={600} overflow="auto" pr={2}>
                                {groupedCourses.map(dept => (
                                    <Box key={dept._id} mb={4}>
                                        <Typography variant="subtitle2" fontWeight="900" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 2 }}>
                                            <ClassIcon fontSize="small" /> {dept.sclassName}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {dept.courses.map(course => (
                                                <Grid item xs={12} sm={6} key={course._id}>
                                                    <Paper 
                                                        variant="outlined" 
                                                        sx={{ 
                                                            p: 2, 
                                                            cursor: 'pointer', 
                                                            transition: 'all 0.2s',
                                                            bgcolor: assignedCourseIds.includes(course._id) ? 'blue.50' : 'white',
                                                            borderColor: assignedCourseIds.includes(course._id) ? 'blue.200' : 'divider',
                                                            '&:hover': {
                                                                borderColor: 'blue.400',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                                            }
                                                        }}
                                                        onClick={() => handleToggleCourse(course._id)}
                                                    >
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox 
                                                                    checked={assignedCourseIds.includes(course._id)} 
                                                                    onChange={() => {}} // Handle at Paper level
                                                                />
                                                            }
                                                            label={
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight="bold">
                                                                        {course.subName}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                                                        Code: {course.subCode}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            sx={{ m: 0, width: '100%' }}
                                                        />
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                ))}
                            </Box>
                        </ContentCard>
                    </Grid>
                </Grid>
            </Box>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ManageFacultyCourses;
