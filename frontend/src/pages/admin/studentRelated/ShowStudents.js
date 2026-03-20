import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Popup from '../../../components/Popup';
import ConfirmDelete from '../../../components/ConfirmDelete';
import * as React from 'react';
import ModuleLayout from '../../../components/ModuleLayout';
import axios from 'axios';
import { getApiErrorMessage, getApiUrl, getAuthHeaders } from '../../../utils/api';
import { deleteUser, getUserDetails as getClassDetails } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const { sclassesList } = useSelector((state) => state.sclass);

    const [selectedDept, setSelectedDept] = useState("all");

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id, selectedDept));
    }, [currentUser._id, dispatch, selectedDept]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadLoading, setUploadLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fileInputRef = useRef(null);

    const deleteHandler = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    }

    const confirmDeletion = () => {
        dispatch(deleteUser(deleteId, "Student"))
            .then(() => {
                dispatch(getAllStudents(currentUser._id));
                setMessage("Student record removed successfully");
                setShowPopup(true);
            })
            .catch((err) => {
                setMessage(err.message || "Failed to remove student");
                setShowPopup(true);
            });
    }

    const handleBulkFileSelection = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('adminID', currentUser._id);

        try {
            setUploadLoading(true);
            const result = await axios.post(getApiUrl('/student/bulk-upload'), formData, {
                headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
            });
            const summary = result.data?.data;
            setMessage(`Bulk upload completed. Added: ${summary?.insertedCount}, Failed: ${summary?.failedCount}.`);
            setShowPopup(true);
            dispatch(getAllStudents(currentUser._id));
        } catch (error) {
            setMessage(getApiErrorMessage(error, 'Bulk upload failed'));
            setShowPopup(true);
        } finally {
            setUploadLoading(false);
        }
    };

    const studentColumns = [
        { id: 'name', label: 'Student Name', minWidth: 170 },
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

    const StudentActions = ({ row }) => {
        const [showDropdown, setShowDropdown] = useState(false);
        const dropdownRef = React.useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className="flex items-center gap-2 justify-end relative">
                <button
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                    View
                </button>
                <button
                    onClick={() => navigate("/Admin/editstudent/" + row.id)}
                    className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-transparent rounded-lg transition-all"
                >
                    <EditIcon fontSize="small" />
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="px-3 py-1.5 bg-gray-900 text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all flex items-center gap-1"
                    >
                        Operations
                        <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 z-50 overflow-hidden text-left p-1">
                            <DropdownItem label="Take Attendance" onClick={() => navigate("/Admin/students/student/attendance/" + row.id)} />
                            <DropdownItem label="Assign Marks" onClick={() => navigate("/Admin/students/student/marks/" + row.id)} />
                            <button
                                onClick={() => deleteHandler(row.id)}
                                className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
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
            title="Student Registry"
            subtitle="Manage institutional student body, enrollments, and academic statuses."
            actions={[
                { label: 'Enroll Student', variant: 'primary', icon: <PersonAddAlt1Icon fontSize="small" />, onClick: () => navigate("/Admin/addstudents") },
                { label: uploadLoading ? 'Uploading...' : 'Bulk Upload', variant: 'secondary', icon: <UploadFileIcon fontSize="small" />, onClick: () => fileInputRef.current?.click() }
            ]}
            loading={loading}
            isEmpty={response}
            emptyTitle={selectedDept !== 'all' ? "No Students Found" : "No Students Enrolled"}
            emptySubtitle={selectedDept !== 'all' ? "There are no students currently registered in the selected department." : "Your student registry is empty. Enroll your first student to begin managing the institution."}
            emptyIcon={<PersonAddAlt1Icon />}
            emptyAction={() => navigate("/Admin/addstudents")}
        >
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleBulkFileSelection} className="hidden" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-textDark uppercase tracking-wider">Department Filter</h4>
                        <p className="text-[10px] font-bold text-textDark/40">Showing {selectedDept !== 'all' ? (sclassesList.find(d => d._id === selectedDept)?.sclassName || 'Selected') : 'All'} Students</p>
                    </div>
                </div>
                
                <select 
                    value={selectedDept} 
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="h-11 px-4 bg-slate-50 border border-black/5 rounded-xl text-sm font-bold text-textDark outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[240px]"
                >
                    <option value="all">All Departments</option>
                    {Array.isArray(sclassesList) && sclassesList.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.sclassName}</option>
                    ))}
                </select>
            </div>

            <TableTemplate buttonHaver={StudentActions} columns={studentColumns} rows={studentRows} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            <ConfirmDelete 
                open={showConfirm} 
                setOpen={setShowConfirm} 
                onConfirm={confirmDeletion} 
                title="Remove Student"
                message="Are you sure you want to remove this student? This will permanently delete their attendance records and performance scores."
            />
        </ModuleLayout>
    );
};

const DropdownItem = ({ label, onClick }) => (
    <button onClick={onClick} className="w-full text-left px-3 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all">
        {label}
    </button>
);

export default ShowStudents;