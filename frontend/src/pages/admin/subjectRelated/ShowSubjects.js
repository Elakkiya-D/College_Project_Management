import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList, getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from "@mui/icons-material/DeleteForever";
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableTemplate from '../../../components/TableTemplate';
import Popup from '../../../components/Popup';
import ConfirmDelete from '../../../components/ConfirmDelete';
import ModuleLayout from '../../../components/ModuleLayout';

const ShowSubjects = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, loading, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    const { sclassesList } = useSelector((state) => state.sclass);
    const [selectedDept, setSelectedDept] = useState("all");

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects", selectedDept));
    }, [currentUser._id, dispatch, selectedDept]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const deleteHandler = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDeletion = () => {
        dispatch(deleteUser(deleteId, "Subject"))
            .then(() => {
                dispatch(getSubjectList(currentUser._id, "AllSubjects"));
                setMessage("Course removed from curriculum inventory.");
                setShowPopup(true);
            })
            .catch((err) => {
                setMessage(err.message || "Failed to remove course.");
                setShowPopup(true);
            });
    };

    const subjectColumns = [
        { id: 'subName', label: 'Course Name', minWidth: 170 },
        { id: 'subCode', label: 'Course Code', minWidth: 100 },
        { id: 'sessions', label: 'Allocated Sessions', minWidth: 140 },
        { id: 'sclassName', label: 'Department', minWidth: 150 },
    ]

    const subjectRows = Array.isArray(subjectsList) && subjectsList.length > 0 ? subjectsList.map((subject) => ({
        subName: subject.subName,
        subCode: subject.subCode || '—',
        sessions: subject.sessions,
        sclassName: subject.sclassName?.sclassName || '—',
        sclassID: subject.sclassName?._id || '',
        id: subject._id,
    })) : [];

    const SubjectActions = ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
            <button
                onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-transparent rounded-lg transition-all"
            >
                <VisibilityIcon fontSize="small" />
            </button>
            <button
                onClick={() => navigate(`/Admin/editsubject/${row.id}`)}
                className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-transparent rounded-lg transition-all"
            >
                <EditIcon fontSize="small" />
            </button>
            <button
                onClick={() => deleteHandler(row.id)}
                className="p-1.5 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 border border-transparent rounded-lg transition-all"
            >
                <DeleteIcon fontSize="small" />
            </button>
        </div>
    );

    return (
        <ModuleLayout
            title="Curriculum Inventory"
            subtitle="Central database for educational course units and academic resource tracking."
            actions={[
                {
                    label: 'Register Course',
                    variant: 'primary',
                    icon: <PostAddIcon fontSize="small" />,
                    onClick: () => navigate("/Admin/subjects/chooseclass")
                }
            ]}
            loading={loading}
            isEmpty={response}
            emptyTitle={selectedDept !== 'all' ? "No Courses Found" : "Inventory is Empty"}
            emptySubtitle={selectedDept !== 'all' ? "There are no academic courses registered under the selected department filter." : "No courses have been defined yet. Initialize your curriculum mapping by registering a course."}
            emptyIcon={<PostAddIcon />}
            emptyAction={() => navigate("/Admin/subjects/chooseclass")}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-textDark uppercase tracking-wider">Inventory Filter</h4>
                        <p className="text-[10px] font-bold text-textDark/40">Showing {selectedDept !== 'all' ? (sclassesList.find(d => d._id === selectedDept)?.sclassName || 'Selected') : 'All'} Courses</p>
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

            <TableTemplate buttonHaver={SubjectActions} columns={subjectColumns} rows={subjectRows} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            <ConfirmDelete 
                open={showConfirm} 
                setOpen={setShowConfirm} 
                onConfirm={confirmDeletion} 
                title="Remove Course Unit"
                message="Are you sure you want to remove this course? This will also purge associated attendance and performance score records."
            />
        </ModuleLayout>
    );
};

export default ShowSubjects;