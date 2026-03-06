import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import Popup from '../../../components/Popup';
import PageHeader from '../../../components/PageHeader';

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
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllTeachers(currentUser._id));
            });
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubject', label: 'Subject', minWidth: 100 },
        { id: 'teachSclass', label: 'Class', minWidth: 170 },
    ];

    const rows = Array.isArray(teachersList) ? teachersList.map((teacher) => {
        return {
            name: teacher.name,
            teachSubject: teacher.teachSubject?.subName || (
                <button
                    onClick={() => navigate(`/Admin/teachers/choosesubject/${teacher.teachSclass._id}/${teacher._id}`)}
                    className="px-3 py-1 bg-brand text-white text-xs font-bold rounded shadow-sm hover:brightness-110 transition-all"
                >
                    Assign Subject
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
                className="px-3 py-1.5 bg-background border border-textDark/10 text-brand font-bold text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all shadow-sm"
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
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">

            {/* Header Section */}
            <PageHeader
                title="Faculty Registry"
                subtitle="Manage all teaching staff, assignments, and class allocations."
                actions={[
                    {
                        label: 'Clear All',
                        variant: 'danger',
                        onClick: () => deleteHandler(currentUser._id, "Teachers")
                    },
                    {
                        label: 'Add Teacher',
                        variant: 'primary',
                        icon: <PersonAddAlt1Icon fontSize="small" />,
                        onClick: () => navigate("/Admin/teachers/chooseclass")
                    }
                ]}
            />

            {/* Content Cards / Tables */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <svg className="animate-spin h-10 w-10 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : response ? (
                <div className="bg-surface rounded-xl border border-black/5 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <PersonAddAlt1Icon className="text-brand" style={{ fontSize: 32 }} />
                    </div>
                    <h3 className="text-xl font-bold text-textDark mb-2">No Faculty Found</h3>
                    <p className="text-textDark/70 max-w-sm mb-6">Your teaching staff registry is currently empty. Add your first teacher to begin allocating courses.</p>
                    <button
                        onClick={() => navigate("/Admin/teachers/chooseclass")}
                        className="px-6 py-3 bg-brand text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        Add First Teacher
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md border border-textDark/5 overflow-hidden">
                    {Array.isArray(teachersList) && teachersList.length > 0 &&
                        <TableTemplate buttonHaver={TeacherActions} columns={columns} rows={rows} />
                    }
                </div>
            )}

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default ShowTeachers;