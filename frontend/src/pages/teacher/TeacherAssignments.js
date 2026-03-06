import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import axios from 'axios';

const TeacherAssignments = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [assignments, setAssignments] = useState([]);
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/TeacherAssignments/${currentUser._id}`);
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
    }, [currentUser._id]);

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const fields = {
                title,
                dueDate,
                teacher: currentUser._id,
                subject: currentUser.teachSubject?._id,
                sclassName: currentUser.teachSclass?._id
            };
            await axios.post(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/AssignmentCreate`, fields);
            setTitle('');
            setDueDate('');
            fetchAssignments();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/Assignment/${id}`);
            fetchAssignments();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Manage Assignments
            </Typography>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Create New Assignment
                </Typography>
                <form onSubmit={handleCreateAssignment} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <TextField
                        label="Assignment Title"
                        variant="outlined"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Due Date"
                        type="date"
                        variant="outlined"
                        required
                        InputLabelProps={{ shrink: true }}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        fullWidth
                    />
                    <Button type="submit" variant="contained" color="primary" sx={{ height: '56px' }}>
                        Create
                    </Button>
                </form>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment._id}>
                                <TableCell>{assignment.title}</TableCell>
                                <TableCell>{assignment.subject?.subName}</TableCell>
                                <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <Button color="error" onClick={() => handleDelete(assignment._id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {assignments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No assignments created yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TeacherAssignments;
