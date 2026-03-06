import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from "@mui/icons-material/DeleteForever";
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableTemplate from '../../../components/TableTemplate';
import Popup from '../../../components/Popup';
import ModuleLayout from '../../../components/ModuleLayout';
import ConfirmModal from '../../../components/ConfirmModal';

const ShowSubjects = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, loading, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteInfo, setDeleteInfo] = useState({ id: null, address: "" });

    const deleteHandler = (deleteID, address) => {
        setDeleteInfo({ id: deleteID, address: address });
        setConfirmOpen(true);
    }

    const confirmDelete = () => {
        dispatch(deleteUser(deleteInfo.id, deleteInfo.address))
            .then(() => {
                dispatch(getSubjectList(currentUser._id, "AllSubjects"));
                setConfirmOpen(false);
            });
    }

    const subjectColumns = [
        { id: 'subName', label: 'Subject Name', minWidth: 170 },
        { id: 'sessions', label: 'Allocated Sessions', minWidth: 140 },
        { id: 'sclassName', label: 'Class / Grade', minWidth: 150 },
    ]

    const subjectRows = Array.isArray(subjectsList) && subjectsList.length > 0 ? subjectsList.map((subject) => {
        return {
            subName: subject.subName,
            sessions: subject.sessions,
            sclassName: subject.sclassName.sclassName,
            sclassID: subject.sclassName._id,
            id: subject._id,
        };
    }) : [];

    const SubjectActions = ({ row }) => (
        <div className="flex items-center gap-2 justify-end pr-4">
            <button
                onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                className="p-2 text-textDark/40 hover:text-brand bg-white hover:bg-slate-50 border border-black/5 rounded-xl shadow-sm transition-all"
            >
                <VisibilityIcon fontSize="small" />
            </button>
            <button
                onClick={() => deleteHandler(row.id, "Subject")}
                className="p-2 text-red-400 hover:text-red-600 bg-white hover:bg-red-50 border border-black/5 rounded-xl shadow-sm transition-all"
            >
                <DeleteIcon fontSize="small" />
            </button>
        </div>
    );

    return (
        <ModuleLayout
            title="Subjects Inventory"
            subtitle="Central curriculum database managing courses and academic resource allocation."
            actions={[
                {
                    label: 'Register New Subject',
                    variant: 'primary',
                    icon: <PostAddIcon fontSize="small" />,
                    onClick: () => navigate("/Admin/subjects/chooseclass")
                }
            ]}
            loading={loading}
            isEmpty={response}
            emptyTitle="Curriculum Inventory Empty"
            emptySubtitle="Your academic subject registry is currently empty. Define and assign subjects to classes to begin session tracking."
            emptyIcon={<PostAddIcon />}
            emptyAction={() => navigate("/Admin/subjects/chooseclass")}
            emptyActionLabel="Register First Course"
        >
            <TableTemplate buttonHaver={SubjectActions} columns={subjectColumns} rows={subjectRows} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            <ConfirmModal
                open={confirmOpen}
                handleClose={() => setConfirmOpen(false)}
                handleConfirm={confirmDelete}
                title="Remove Subject"
                description="Are you sure you want to remove this subject? This action will remove it from the curriculum permanently."
            />
        </ModuleLayout>
    );
};

export default ShowSubjects;