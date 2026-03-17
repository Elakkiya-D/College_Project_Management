import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Collapse, Table, TableBody, TableHead, Typography } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { PurpleButton } from '../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const FacultyViewStudent = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { currentUser, userDetails, response, loading, error } = useSelector((state) => state.user);

    const address = 'Student';
    const studentID = params.id;
    const teachSubject = currentUser?.teachSubject?.subName;
    const teachSubjectID = currentUser?.teachSubject?._id;

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    if (response) { console.log(response); }
    else if (error) { console.log(error); }

    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [openStates, setOpenStates] = useState({});

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    useEffect(() => {
        if (userDetails) {
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || '');
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage },
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h1 className="text-xl font-bold text-gray-900">{userDetails?.name}</h1>
                        <p className="text-sm text-gray-500">Register Number: {userDetails?.rollNum}</p>
                        <p className="text-sm text-gray-500">Department: {sclassName?.sclassName}</p>
                        <p className="text-sm text-gray-500">College: {studentSchool?.schoolName}</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h3>
                        {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
                            <>
                                {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => {
                                    if (subName === teachSubject) {
                                        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);

                                        return (
                                            <Table key={index}>
                                                <TableHead>
                                                    <StyledTableRow>
                                                        <StyledTableCell>Course</StyledTableCell>
                                                        <StyledTableCell>Present</StyledTableCell>
                                                        <StyledTableCell>Total Sessions</StyledTableCell>
                                                        <StyledTableCell>Attendance %</StyledTableCell>
                                                        <StyledTableCell align="center">Actions</StyledTableCell>
                                                    </StyledTableRow>
                                                </TableHead>

                                                <TableBody>
                                                    <StyledTableRow>
                                                        <StyledTableCell>{subName}</StyledTableCell>
                                                        <StyledTableCell>{present}</StyledTableCell>
                                                        <StyledTableCell>{sessions}</StyledTableCell>
                                                        <StyledTableCell>{subjectAttendancePercentage}%</StyledTableCell>
                                                        <StyledTableCell align="center">
                                                            <Button variant="contained" onClick={() => handleOpen(subId)}>
                                                                {openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}Details
                                                            </Button>
                                                        </StyledTableCell>
                                                    </StyledTableRow>
                                                    <StyledTableRow>
                                                        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                            <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                                <Box sx={{ margin: 1 }}>
                                                                    <Typography variant="h6" gutterBottom component="div">
                                                                        Attendance Details
                                                                    </Typography>
                                                                    <Table size="small" aria-label="purchases">
                                                                        <TableHead>
                                                                            <StyledTableRow>
                                                                                <StyledTableCell>Date</StyledTableCell>
                                                                                <StyledTableCell align="right">Status</StyledTableCell>
                                                                            </StyledTableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {allData.map((data, idx) => {
                                                                                const date = new Date(data.date);
                                                                                const dateString = date.toString() !== 'Invalid Date' ? date.toISOString().substring(0, 10) : 'Invalid Date';
                                                                                return (
                                                                                    <StyledTableRow key={idx}>
                                                                                        <StyledTableCell component="th" scope="row">
                                                                                            {dateString}
                                                                                        </StyledTableCell>
                                                                                        <StyledTableCell align="right">{data.status}</StyledTableCell>
                                                                                    </StyledTableRow>
                                                                                );
                                                                            })}
                                                                        </TableBody>
                                                                    </Table>
                                                                </Box>
                                                            </Collapse>
                                                        </StyledTableCell>
                                                    </StyledTableRow>
                                                </TableBody>
                                            </Table>
                                        );
                                    }
                                    return null;
                                })}
                                <div className="mt-4">
                                    Overall Attendance Percentage: {overallAttendancePercentage.toFixed(2)}%
                                </div>

                                <CustomPieChart data={chartData} />
                            </>
                        )}
                        <div className="mt-6">
                            <Button
                                variant="contained"
                                onClick={() =>
                                    navigate(
                                        `/Faculty/class/student/attendance/${studentID}/${teachSubjectID}`
                                    )
                                }
                            >
                                Add Attendance
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marks</h3>
                        {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 && (
                            <>
                                {subjectMarks.map((result, index) => {
                                    if (result.subName?.subName === teachSubject) {
                                        return (
                                            <Table key={index}>
                                                <TableHead>
                                                    <StyledTableRow>
                                                        <StyledTableCell>Course</StyledTableCell>
                                                        <StyledTableCell>Marks</StyledTableCell>
                                                    </StyledTableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <StyledTableRow>
                                                        <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                                        <StyledTableCell>{result.marksObtained}</StyledTableCell>
                                                    </StyledTableRow>
                                                </TableBody>
                                            </Table>
                                        );
                                    }
                                    if (!result.subName || !result.marksObtained) {
                                        return null;
                                    }
                                    return null;
                                })}
                            </>
                        )}
                        <div className="mt-6">
                            <PurpleButton
                                variant="contained"
                                onClick={() =>
                                    navigate(
                                        `/Faculty/class/student/marks/${studentID}/${teachSubjectID}`
                                    )
                                }
                            >
                                Add Marks
                            </PurpleButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyViewStudent;
