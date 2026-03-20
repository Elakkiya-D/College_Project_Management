import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllFaculty as getFacultyList } from '../../../redux/facultyRelated/facultyHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EditIcon from '@mui/icons-material/Edit';
import Popup from '../../../components/Popup';
import ConfirmDelete from '../../../components/ConfirmDelete';
import ModuleLayout from '../../../components/ModuleLayout';

import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

const ShowFaculty = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { facultyList, loading, response } = useSelector((state) => state.faculty);
    const { currentUser } = useSelector(state => state.user);

    const { sclassesList } = useSelector((state) => state.sclass);
    const [selectedDept, setSelectedDept] = useState("all");

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        dispatch(getFacultyList(currentUser._id, selectedDept));
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
        dispatch(deleteUser(deleteId, "Faculty"))
            .then(() => {
                dispatch(getFacultyList(currentUser._id));
                setMessage("Faculty record removed successfully");
                setShowPopup(true);
            })
            .catch((err) => {
                setMessage(err.message || "Failed to remove faculty member");
                setShowPopup(true);
            });
    };

    const facultyColumns = [
        { id: 'name', label: 'Faculty Name', minWidth: 170 },
        { id: 'designation', label: 'Designation', minWidth: 120 },
        { id: 'sclassName', label: 'Department', minWidth: 150 },
        { id: 'teachSubject', label: 'Assigned Course', minWidth: 150 },
    ];

    const facultyRows = Array.isArray(facultyList) ? facultyList.map((faculty) => ({
        name: faculty.name,
        designation: faculty.designation || 'Academic Staff',
        sclassName: faculty.teachSclass?.sclassName || '—',
        teachSubject: faculty.teachSubject?.subName || 'Unassigned',
        id: faculty._id,
    })) : [];

    const FacultyButtonHaver = ({ row }) => {
        return (
            <div className="flex items-center gap-2 justify-end">
                <button
                    onClick={() => navigate("/Admin/faculty/member/" + row.id)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                    View
                </button>
                <button
                    onClick={() => navigate("/Admin/faculty/edit/" + row.id)}
                    className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-transparent rounded-lg transition-all"
                >
                    <EditIcon fontSize="small" />
                </button>
                <button
                    onClick={() => deleteHandler(row.id)}
                    className="p-1.5 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 border border-transparent rounded-lg transition-all"
                >
                    <PersonRemoveIcon fontSize="small" />
                </button>
            </div>
        );
    };

    return (
        <ModuleLayout
            title="Faculty Directory"
            subtitle="Manage academic staff, department assignments, and professional records."
            actions={[
                {
                    label: 'Onboard Faculty',
                    variant: 'primary',
                    icon: <PersonAddAlt1Icon fontSize="small" />,
                    onClick: () => navigate("/Admin/faculty/chooseclass")
                }
            ]}
            loading={loading}
            isEmpty={response}
            emptyTitle={selectedDept !== 'all' ? "No Faculty Found" : "Directory is Empty"}
            emptySubtitle={selectedDept !== 'all' ? "No faculty members match the selected department filter." : "No faculty members have been registered. Begin onboarding your academic staff to build the curriculum."}
            emptyIcon={<PersonAddAlt1Icon />}
            emptyAction={() => navigate("/Admin/faculty/chooseclass")}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-textDark uppercase tracking-wider">Department Filter</h4>
                        <p className="text-[10px] font-bold text-textDark/40">Showing {selectedDept !== 'all' ? (sclassesList.find(d => d._id === selectedDept)?.sclassName || 'Selected') : 'All'} Academic Staff</p>
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

            <TableTemplate buttonHaver={FacultyButtonHaver} columns={facultyColumns} rows={facultyRows} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            <ConfirmDelete 
                open={showConfirm} 
                setOpen={setShowConfirm} 
                onConfirm={confirmDeletion} 
                title="Remove Faculty Member"
                message="Are you sure you want to remove this faculty record? This will also unassign them from their current courses and schedules."
            />
        </ModuleLayout>
    );
};

export default ShowFaculty;
