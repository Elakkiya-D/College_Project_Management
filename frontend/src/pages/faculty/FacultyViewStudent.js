import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Divider, CircularProgress } from '@mui/material';

const FacultyViewStudent = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { userDetails, loading, error } = useSelector((state) => state.user);

    const address = 'Student';
    const studentID = params.id;

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    if (error) { console.log(error); }

    const [sclassName, setSclassName] = useState('');

    useEffect(() => {
        if (userDetails) {
            setSclassName(userDetails.sclassName?.sclassName || userDetails.department?.departmentName || 'N/A');
        }
    }, [userDetails]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!userDetails) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography variant="h6" color="textSecondary">Student not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 4, fontFamily: 'Poppins, sans-serif' }}>
            <Card elevation={0} sx={{ borderRadius: 3, p: 2, border: '1px solid #f0f0f0', backgroundColor: '#ffffff' }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
                        Student Details
                    </Typography>
                    <Divider sx={{ mb: 4, borderColor: '#f0f0f0' }} />

                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold', tracking: 'widest' }}>
                                Name
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="textPrimary">
                                {userDetails.name || 'N/A'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold', tracking: 'widest' }}>
                                Register Number
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="textPrimary">
                                {userDetails.rollNum || 'N/A'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold', tracking: 'widest' }}>
                                Department
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="textPrimary">
                                {sclassName}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold', tracking: 'widest' }}>
                                Email
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="textPrimary">
                                {userDetails.email || 'N/A'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold', tracking: 'widest' }}>
                                Phone
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="textPrimary">
                                {userDetails.phone || 'N/A'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 'bold', tracking: 'widest' }}>
                                Address
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="textPrimary">
                                {userDetails.address || 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default FacultyViewStudent;
