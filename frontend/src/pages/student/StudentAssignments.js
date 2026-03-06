import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

const StudentAssignments = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [assignments, setAssignments] = useState([]);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/AssignmentList/${currentUser.sclassName?._id}`);
            if (Array.isArray(res.data)) {
                setAssignments(res.data);
            } else {
                setAssignments([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [currentUser.sclassName?._id]);

    return (
        <Box sx={{ p: 4, pt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Upcoming Assignments
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Teacher</TableCell>
                            <TableCell>Due Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment._id}>
                                <TableCell>{assignment.title}</TableCell>
                                <TableCell>{assignment.subject?.subName}</TableCell>
                                <TableCell>{assignment.teacher?.name}</TableCell>
                                <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        {assignments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No upcoming assignments.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentAssignments;
