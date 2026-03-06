import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Popup from '../../../components/Popup';
import * as React from 'react';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.error(error);
    }

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllStudents(currentUser._id));
            });
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    const uniqueStudents = Array.isArray(studentsList) ? Array.from(new Map(studentsList.map(item => [item._id, item])).values()) : [];

    const studentRows = uniqueStudents.length > 0 && uniqueStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            sclassName: student.sclassName.sclassName,
            id: student._id,
        };
    });

    // Custom Button Component following the SaaS theme rules
    const StudentActions = ({ row }) => {
        const [showDropdown, setShowDropdown] = useState(false);
        const dropdownRef = React.useRef(null);

        // Click outside handler
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setShowDropdown(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className="flex items-center gap-2 justify-end relative">
                <button
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                    className="px-3 py-1.5 bg-background border border-textDark/10 text-brand font-bold text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all shadow-sm"
                >
                    View
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="px-3 py-1.5 bg-brand text-white font-bold text-sm rounded-lg hover:brightness-110 hover:shadow-sm transition-all shadow-sm flex items-center gap-1"
                    >
                        Action
                        <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-textDark/10 z-50 overflow-hidden text-left">
                            <button
                                onClick={() => navigate("/Admin/students/student/attendance/" + row.id)}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-textDark hover:bg-surface hover:text-brand transition-colors border-b border-textDark/5"
                            >
                                Take Attendance
                            </button>
                            <button
                                onClick={() => navigate("/Admin/students/student/marks/" + row.id)}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-textDark hover:bg-surface hover:text-brand transition-colors border-b border-textDark/5"
                            >
                                Provide Marks
                            </button>
                            <button
                                onClick={() => deleteHandler(row.id, "Student")}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-brand hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <PersonRemoveIcon fontSize="small" /> Remove Student
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">

            {/* Header Section */}
            <PageHeader
                title="Student Register"
                subtitle="Manage all enrolled students, records, and performance."
                actions={[
                    {
                        label: 'Clear All',
                        variant: 'danger',
                        onClick: () => deleteHandler(currentUser._id, "Students")
                    },
                    {
                        label: 'Add Student',
                        variant: 'primary',
                        icon: <PersonAddAlt1Icon fontSize="small" />,
                        onClick: () => navigate("/Admin/addstudents")
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
                <ContentCard className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 border border-black/5 shadow-inner">
                        <PersonAddAlt1Icon className="text-accent" style={{ fontSize: 40 }} />
                    </div>
                    <h3 className="text-2xl font-black text-textDark mb-2">No Students Found</h3>
                    <p className="text-textDark/60 max-w-sm mb-8 font-medium">Your student registry is currently empty. Add your first student to begin managing classes and records.</p>
                    <button
                        onClick={() => navigate("/Admin/addstudents")}
                        className="px-8 py-3 bg-brand text-white font-extrabold rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        Add First Student
                    </button>
                </ContentCard>
            ) : (
                <div className="space-y-6">
                    {/* Data List Card */}
                    <div className="bg-white rounded-2xl shadow-md border border-textDark/5 overflow-hidden">
                        {uniqueStudents.length > 0 &&
                            <TableTemplate buttonHaver={StudentActions} columns={studentColumns} rows={studentRows} />
                        }
                    </div>
                </div>
            )}

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default ShowStudents;