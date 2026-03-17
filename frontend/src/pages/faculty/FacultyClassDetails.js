import { useEffect } from 'react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
import { Paper, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import { BlackButton, BlueButton } from '../../components/buttonStyles';
import TableTemplate from '../../components/TableTemplate';
import ModuleLayout from '../../components/ModuleLayout';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const FacultyClassDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);

    const { currentUser } = useSelector((state) => state.user);
    const classID = currentUser?.teachSclass?._id;
    const subjectID = currentUser?.teachSubject?._id;

    useEffect(() => {
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [dispatch, classID]);

    if (error) {
        console.log(error);
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Register Number', minWidth: 100 },
    ];

    const studentRows = Array.isArray(sclassStudents)
        ? sclassStudents.map((student) => ({
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        }))
        : [];

    const StudentsButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];
        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            if (selectedIndex === 0) {
                handleAttendance();
            } else if (selectedIndex === 1) {
                handleMarks();
            }
        };

        const handleAttendance = () => {
            navigate(`/Faculty/class/student/attendance/${row.id}/${subjectID}`);
        };
        const handleMarks = () => {
            navigate(`/Faculty/class/student/marks/${row.id}/${subjectID}`);
        };

        const handleMenuItemClick = (_event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }

            setOpen(false);
        };

        return (
            <div className="flex items-center gap-3">
                <BlueButton
                    variant="contained"
                    onClick={() => navigate('/Faculty/class/student/' + row.id)}
                >
                    View
                </BlueButton>
                <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                    <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                    <BlackButton
                        size="small"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                    >
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </BlackButton>
                </ButtonGroup>
                <Popper
                    sx={{ zIndex: 1 }}
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu" autoFocusItem>
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={option}
                                                selected={index === selectedIndex}
                                                onClick={(event) => handleMenuItemClick(event, index)}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        );
    };

    return (
        <ModuleLayout
            title="Department Roster"
            subtitle="Review learners assigned to your department and record engagement metrics."
            actions={[
                {
                    label: 'Add Student',
                    variant: 'primary',
                    icon: <PersonAddAltOutlinedIcon fontSize="small" />,
                    onClick: () => navigate('/Faculty/addstudent'),
                },
            ]}
            loading={loading}
            isEmpty={Boolean(getresponse)}
            emptyTitle="No Students Found"
            emptySubtitle="Invite students to your department to begin attendance tracking."
            emptyAction={() => navigate('/Faculty/addstudent')}
            emptyActionLabel="Add Student"
        >
            {Array.isArray(studentRows) && studentRows.length > 0 && (
                <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
            )}
        </ModuleLayout>
    );
};

export default FacultyClassDetails;
