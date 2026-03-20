import { useEffect } from 'react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getClassStudents } from '../../redux/sclassRelated/sclassHandle';
import { BlueButton } from '../../components/buttonStyles';
import TableTemplate from '../../components/TableTemplate';
import ModuleLayout from '../../components/ModuleLayout';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';

const FacultyClassDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);

    const { currentUser } = useSelector((state) => state.user);
    const classID = currentUser?.teachSclass?._id;

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
        return (
            <div className="flex items-center gap-3">
                <BlueButton
                    variant="contained"
                    onClick={() => navigate('/Faculty/class/student/' + row.id)}
                >
                    View
                </BlueButton>
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
