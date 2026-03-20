import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, CircularProgress
} from '@mui/material';
import axios from 'axios';

const ViewStdAttendance = () => {
    const { currentUser, authToken: reduxToken } = useSelector(state => state.user);
    const token = reduxToken || localStorage.getItem('token') || localStorage.getItem('authToken');
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // Use the streamlined student endpoint
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/api/attendance/student`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setAttendanceData(res.data);
            } catch (error) {
                console.error("Failed to fetch attendance", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchAttendance();
        }
    }, [currentUser, token]);

    if (loading) {
        return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 4, fontFamily: 'Poppins, sans-serif' }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="textPrimary">
                My Attendance History
            </Typography>

            {attendanceData.length > 0 ? (
                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f4f6f8' }}>
                            <TableRow>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell><strong>Course</strong></TableCell>
                                <TableCell align="center"><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceData.map((item) => (
                                <TableRow key={item._id} hover>
                                    <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>{item.course?.subName || item.course?.name || item.course?.courseName || 'Deleted Course'}</TableCell>
                                    <TableCell align="center">
                                        <Typography color={item.status === 'Present' ? 'success.main' : 'error.main'} fontWeight="bold">
                                            {item.status}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Box mt={4} textAlign="center">
                    <Typography variant="h5" color="textSecondary">No attendance records found</Typography>
                </Box>
            )}
        </Box>
    );
};

export default ViewStdAttendance;