import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, Typography, Button, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Select, MenuItem, 
    FormControl, InputLabel, Snackbar, Alert, CircularProgress,
    TextField, Grid
} from '@mui/material';
import axios from 'axios';

const FacultyAttendance = () => {
    const { currentUser, authToken: reduxToken } = useSelector(state => state.user);
    const token = reduxToken || localStorage.getItem('token') || localStorage.getItem('authToken');
    const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    
    // For popup
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const showSnackbar = useCallback((message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const facultyId = currentUser?._id || currentUser?.id;
                if (!facultyId) return;
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/api/courses/faculty/${facultyId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedCourses = res.data.data || res.data || [];
                setCourses(fetchedCourses);
            } catch (error) {
                console.error(error);
                showSnackbar("Failed to fetch courses", "error");
            }
        };

        if (currentUser && (currentUser._id || currentUser.id)) {
            fetchCourses();
        }
    }, [currentUser, token, showSnackbar]);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                // First get the student list for this course
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/api/students/by-course/${selectedCourse}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedStudents = res.data.data || res.data || [];
                setStudents(fetchedStudents);

                // Then check if attendance is already published for this date
                const attRes = await axios.get(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/api/attendance/course/${selectedCourse}?date=${selectedDate}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const existingRecords = attRes.data || [];
                
                // Map existing progress to attendanceData or initialize with Present
                const initialData = fetchedStudents.map(student => {
                    const sId = student._id || student.id;
                    const existing = existingRecords.find(er => {
                        const erSId = (er.student && (er.student._id || er.student)) || er.studentId;
                        return erSId === sId;
                    });
                    return {
                        studentId: sId,
                        status: existing ? existing.status : 'Present'
                    };
                });
                setAttendanceData(initialData);

                if (existingRecords.length > 0) {
                    showSnackbar(`Viewing published attendance for ${selectedDate}`, "info");
                }

            } catch (error) {
                console.error(error);
                showSnackbar("Failed to load attendance roster", "error");
            } finally {
                setLoadingStudents(false);
            }
        };

        if (selectedCourse && selectedDate) {
            fetchStudents();
        }
    }, [selectedCourse, selectedDate, token, showSnackbar]);

    const handleSubmit = async () => {
        if (!selectedCourse || !selectedDate) {
            return showSnackbar("Please select both course and date", "warning");
        }
        if (attendanceData.length === 0) return showSnackbar("No students to mark", "warning");

        try {
            const res = await axios.post(`${baseUrl}/api/attendance`, {
                course: selectedCourse,
                date: selectedDate,
                records: attendanceData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                showSnackbar("Attendance published successfully", "success");
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Attendance publication failed";
            showSnackbar(msg, "error");
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Faculty Attendance Module
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="course-select-label">Select Course</InputLabel>
                            <Select
                                labelId="course-select-label"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                label="Select Course"
                            >
                                <MenuItem value=""><em>Select Course</em></MenuItem>
                                {courses.map(course => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.name || course.subName || course.courseName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Select Date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>

                {!selectedCourse || !selectedDate ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="textSecondary">Please select a Course and Date to load the student list</Typography>
                    </Box>
                ) : loadingStudents ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                ) : students.length > 0 ? (
                    <>
                        <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 'bold' }}>Attendance Roster</Typography>
                        <TableContainer component={Paper} elevation={2} sx={{ mb: 3 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell><strong>Student Name</strong></TableCell>
                                        <TableCell><strong>Register Number</strong></TableCell>
                                        <TableCell align="center"><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => {
                                        const sId = student._id || student.id;
                                        const record = attendanceData.find(r => r.studentId === sId);
                                        const status = record ? record.status : 'Present';
                                        
                                        return (
                                            <TableRow key={sId}>
                                                <TableCell>{student.name}</TableCell>
                                                <TableCell>{student.registerNumber || student.rollNum || "N/A"}</TableCell>
                                                <TableCell align="center">
                                                    <Select
                                                        size="small"
                                                        value={status}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            setAttendanceData(prev => prev.map(rec => 
                                                                rec.studentId === sId ? { ...rec, status: newStatus } : rec
                                                            ));
                                                        }}
                                                        sx={{
                                                            minWidth: 120,
                                                            color: status === 'Present' ? 'green' : 'red',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        <MenuItem value="Present">Present</MenuItem>
                                                        <MenuItem value="Absent">Absent</MenuItem>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button 
                            fullWidth
                            variant="contained" 
                            color="primary" 
                            onClick={handleSubmit}
                            size="large"
                            sx={{ mt: 2, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                        >
                            Publish Attendance
                        </Button>
                    </>
                ) : (
                    <Box textAlign="center" py={4}>
                        <Typography color="textSecondary">No students found for this course.</Typography>
                    </Box>
                )}
            </Paper>

            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={4000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FacultyAttendance;
