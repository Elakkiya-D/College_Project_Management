import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import NoteAddIcon from '@mui/icons-material/AddAlert';
import DeleteIcon from "@mui/icons-material/DeleteSweep";
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import ModuleLayout from '../../../components/ModuleLayout';
import ConfirmModal from '../../../components/ConfirmModal';

const ShowNotices = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { noticesList, loading, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteInfo, setDeleteInfo] = useState({ id: null, address: "" });

    const deleteHandler = (deleteID, address) => {
        setDeleteInfo({ id: deleteID, address: address });
        setConfirmOpen(true);
    }

    const confirmDelete = () => {
        dispatch(deleteUser(deleteInfo.id, deleteInfo.address))
            .then(() => {
                dispatch(getAllNotices(currentUser._id, "Notice"));
                setConfirmOpen(false);
            })
    }

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: 170 },
        { id: 'details', label: 'Message Details', minWidth: 200 },
        { id: 'date', label: 'Posted Date', minWidth: 130 },
    ];

    const noticeRows = Array.isArray(noticesList) && noticesList.length > 0 ? noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
        };
    }) : [];

    const NoticeActions = ({ row }) => (
        <div className="flex justify-end pr-4">
            <button
                onClick={() => deleteHandler(row.id, "Notice")}
                className="p-2 text-brand/40 hover:text-brand bg-white hover:bg-red-50 rounded-xl border border-black/5 hover:border-brand/20 transition-all shadow-sm"
            >
                <DeleteIcon fontSize="small" />
            </button>
        </div>
    );

    return (
        <ModuleLayout
            title="Broadcast Notices"
            subtitle="Announce important updates and schedules to students and faculty."
            actions={[
                {
                    label: 'Post New Notice',
                    variant: 'primary',
                    icon: <NoteAddIcon fontSize="small" />,
                    onClick: () => navigate("/Admin/addnotice")
                }
            ]}
            loading={loading}
            isEmpty={response}
            emptyTitle="Notice Board Empty"
            emptySubtitle="There are currently no active notices. Broadcast your first announcement to keep everyone informed."
            emptyIcon={<NoteAddIcon />}
            emptyAction={() => navigate("/Admin/addnotice")}
            emptyActionLabel="Create Announcement"
        >
            <TableTemplate buttonHaver={NoticeActions} columns={noticeColumns} rows={noticeRows} />
            <ConfirmModal
                open={confirmOpen}
                handleClose={() => setConfirmOpen(false)}
                handleConfirm={confirmDelete}
                title="Delete Notice"
                description="Are you sure you want to delete this notice? This announcement will be removed permanently."
            />
        </ModuleLayout>
    );
};

export default ShowNotices;