import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Popup from '../../../components/Popup';
import * as React from 'react';
import ModuleLayout from '../../../components/ModuleLayout';
import axios from 'axios';
import { getApiErrorMessage, getApiUrl, getAuthHeaders } from '../../../utils/api';

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
    const [uploadLoading, setUploadLoading] = useState(false);
    const fileInputRef = useRef(null);

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry the delete function has been disabled for now.");
        setShowPopup(true);
    }

    const handleBulkFileSelection = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        if (!/\.(csv|xlsx)$/i.test(file.name)) {
            setMessage('Invalid file format. Please upload .csv or .xlsx only.');
            setShowPopup(true);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('adminID', currentUser._id);

        try {
            setUploadLoading(true);
            const result = await axios.post(getApiUrl('/student/bulk-upload'), formData, {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
            });

            const summary = result.data?.data;
            const inserted = summary?.insertedCount ?? 0;
            const failed = summary?.failedCount ?? 0;

            const firstError = Array.isArray(summary?.errors) && summary.errors.length
                ? ` First error: Row ${summary.errors[0].row} - ${summary.errors[0].message}`
                : '';

            setMessage(`Bulk upload completed. Added: ${inserted}, Failed: ${failed}.${firstError}`);
            setShowPopup(true);
            dispatch(getAllStudents(currentUser._id));
        } catch (error) {
            setMessage(getApiErrorMessage(error, 'Unable to complete student bulk upload'));
            setShowPopup(true);
        } finally {
            setUploadLoading(false);
        }
    };

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Register Number', minWidth: 100 },
        { id: 'sclassName', label: 'Department', minWidth: 170 },
    ];

    const uniqueStudents = Array.isArray(studentsList) ? Array.from(new Map(studentsList.map(item => [item._id, item])).values()) : [];

    const studentRows = uniqueStudents.map((student) => ({
        name: student.name,
        rollNum: student.registerNumber || student.rollNum,
        sclassName: student.sclassName?.sclassName ?? '—',
        id: student._id,
    }));

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
                    className="px-3 py-1.5 bg-background border border-textDark/10 text-blue-600 font-bold text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all shadow-sm"
                >
                    View
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="px-3 py-1.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:brightness-110 hover:shadow-sm transition-all shadow-sm flex items-center gap-1"
                    >
                        Action
                        <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-textDark/10 z-50 overflow-hidden text-left">
                            <button
                                onClick={() => navigate("/Admin/students/student/attendance/" + row.id)}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-textDark hover:bg-surface hover:text-blue-600 transition-colors border-b border-textDark/5"
                            >
                                Take Attendance
                            </button>
                            <button
                                onClick={() => navigate("/Admin/students/student/marks/" + row.id)}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-textDark hover:bg-surface hover:text-blue-600 transition-colors border-b border-textDark/5"
                            >
                                Provide Marks
                            </button>
                            <button
                                onClick={() => deleteHandler(row.id, "Student")}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-red-50 transition-colors flex items-center gap-2"
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
        <ModuleLayout
            title="Student Register"
            subtitle="Manage all enrolled students, records, and performance tracking."
            actions={[
                {
                    label: 'Add Student',
                    variant: 'primary',
                    icon: <PersonAddAlt1Icon fontSize="small" />,
                    onClick: () => navigate("/Admin/addstudents")
                },
                {
                    label: uploadLoading ? 'Uploading...' : 'Upload CSV/Excel',
                    variant: 'secondary',
                    icon: <UploadFileIcon fontSize="small" />,
                    onClick: () => fileInputRef.current?.click()
                }
            ]}
            loading={loading}
            isEmpty={response}
            emptyTitle="Registry is Empty"
            emptySubtitle="No students have been enrolled in the institution yet. Securely register your first student to begin."
            emptyIcon={<PersonAddAlt1Icon />}
            emptyAction={() => navigate("/Admin/addstudents")}
            emptyActionLabel="Enroll Student"
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleBulkFileSelection}
                className="hidden"
            />
            <TableTemplate buttonHaver={StudentActions} columns={studentColumns} rows={studentRows} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </ModuleLayout>
    );
};

export default ShowStudents;