import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import TableTemplate from '../../../components/TableTemplate';
import Popup from '../../../components/Popup';
import PageHeader from '../../../components/PageHeader';
import ModuleLayout from '../../../components/ModuleLayout';

const ShowTeachers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (error) {
        console.error(error);
    }

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry the delete function has been disabled for now.");
        setShowPopup(true);
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubject', label: 'Course', minWidth: 100 },
        { id: 'teachSclass', label: 'Dept', minWidth: 170 },
    ];

    const rows = Array.isArray(teachersList) ? teachersList.map((teacher) => {
        return {
            name: teacher.name,
            teachSubject: teacher.teachSubject?.subName || (
                <button
                    onClick={() => navigate(`/Admin/teachers/choosesubject/${teacher.teachSclass._id}/${teacher._id}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-sm hover:brightness-110 transition-all"
                >
                    Assign Course
                </button>
            ),
            teachSclass: teacher.teachSclass.sclassName,
            teachSclassID: teacher.teachSclass._id,
            id: teacher._id,
        };
    }) : [];

    const TeacherActions = ({ row }) => (
        <div className="flex items-center gap-3 justify-end">
            <button
                onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
                className="px-3 py-1.5 bg-background border border-textDark/10 text-blue-600 font-bold text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all shadow-sm"
            >
                View
            </button>
            <button
                onClick={() => deleteHandler(row.id, "Teacher")}
                className="p-1.5 rounded-lg border border-transparent hover:bg-red-50 hover:border-red-200 text-red-500 transition-all"
                title="Remove Teacher"
            >
                <PersonRemoveIcon fontSize="small" />
            </button>
        </div>
    );

    return (
        <ModuleLayout
            title="Faculty Registry"
            subtitle="Manage all teaching staff, assignments, and class allocations."
            actions={[
                {
                    label: 'Add Teacher',
                    variant: 'primary',
                    icon: <PersonAddAlt1Icon fontSize="small" />,
                    onClick: () => navigate("/Admin/teachers/chooseclass")
                }
            ]}
            loading={loading}
            isEmpty={response}
            emptyTitle="No Faculty Members"
            emptySubtitle="The teaching staff directory is currently empty. Onboard your first faculty member to begin assigning courses."
            emptyIcon={<PersonAddAlt1Icon />}
            emptyAction={() => navigate("/Admin/teachers/chooseclass")}
            emptyActionLabel="Onboard Teacher"
        >
            <TableTemplate buttonHaver={TeacherActions} columns={columns} rows={rows} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </ModuleLayout>
    );
};

export default ShowTeachers;