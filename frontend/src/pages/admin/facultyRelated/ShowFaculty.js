import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllFaculty } from '../../../redux/facultyRelated/facultyHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TableTemplate from '../../../components/TableTemplate';
import Popup from '../../../components/Popup';
import ModuleLayout from '../../../components/ModuleLayout';
import axios from 'axios';
import { getApiErrorMessage, getApiUrl, getAuthHeaders } from '../../../utils/api';

const ShowFaculty = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { facultyList, loading, error, response } = useSelector((state) => state.faculty);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllFaculty(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (error) {
        console.error(error);
    }

    const deleteHandler = () => {
        setMessage('Sorry the delete function has been disabled for now.');
        setShowPopup(true);
    };

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
            const result = await axios.post(getApiUrl('/faculty/bulk-upload'), formData, {
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
            dispatch(getAllFaculty(currentUser._id));
        } catch (error) {
            setMessage(getApiErrorMessage(error, 'Unable to complete faculty bulk upload'));
            setShowPopup(true);
        } finally {
            setUploadLoading(false);
        }
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubject', label: 'Course', minWidth: 100 },
        { id: 'teachSclass', label: 'Department', minWidth: 170 },
    ];

    const rows = Array.isArray(facultyList) ? facultyList.map((member) => {
        return {
            name: member.name,
            teachSubject: member.teachSubject?.subName || (
                <button
                    onClick={() => navigate(`/Admin/faculty/choosesubject/${member.teachSclass._id}/${member._id}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-sm hover:brightness-110 transition-all"
                >
                    Assign Course
                </button>
            ),
            teachSclass: member.teachSclass.sclassName,
            teachSclassID: member.teachSclass._id,
            id: member._id,
        };
    }) : [];

    const FacultyActions = ({ row }) => (
        <div className="flex items-center gap-3 justify-end">
            <button
                onClick={() => navigate('/Admin/faculty/member/' + row.id)}
                className="px-3 py-1.5 bg-background border border-textDark/10 text-blue-600 font-bold text-sm rounded-lg hover:bg-white hover:shadow-sm transition-all shadow-sm"
            >
                View
            </button>
            <button
                onClick={deleteHandler}
                className="p-1.5 rounded-lg border border-transparent hover:bg-red-50 hover:border-red-200 text-red-500 transition-all"
                title="Remove Faculty"
            >
                <PersonRemoveIcon fontSize="small" />
            </button>
        </div>
    );

    return (
        <ModuleLayout
            title="Faculty Registry"
            subtitle="Manage all faculty members, assignments, and class allocations."
            actions={[
                {
                    label: 'Add Faculty',
                    variant: 'primary',
                    icon: <PersonAddAlt1Icon fontSize="small" />,
                    onClick: () => navigate('/Admin/faculty/chooseclass'),
                },
                {
                    label: uploadLoading ? 'Uploading...' : 'Upload CSV/Excel',
                    variant: 'secondary',
                    icon: <UploadFileIcon fontSize="small" />,
                    onClick: () => fileInputRef.current?.click(),
                },
            ]}
            loading={loading}
            isEmpty={response}
            emptyTitle="No Faculty Members"
            emptySubtitle="The faculty directory is currently empty. Onboard your first faculty member to begin assigning courses."
            emptyIcon={<PersonAddAlt1Icon />}
            emptyAction={() => navigate('/Admin/faculty/chooseclass')}
            emptyActionLabel="Onboard Faculty"
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleBulkFileSelection}
                className="hidden"
            />
            <TableTemplate buttonHaver={FacultyActions} columns={columns} rows={rows} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </ModuleLayout>
    );
};

export default ShowFaculty;
