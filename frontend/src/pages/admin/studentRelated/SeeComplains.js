import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllComplains } from '../../../redux/complainRelated/complainHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import ModuleLayout from '../../../components/ModuleLayout';
import FeedbackIcon from '@mui/icons-material/Feedback';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

const SeeComplains = () => {
  const dispatch = useDispatch();
  const { complainsList, loading, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user)

  useEffect(() => {
    dispatch(getAllComplains(currentUser._id, "Complain"));
  }, [currentUser._id, dispatch]);

  const complainColumns = [
    { id: 'user', label: 'From (Student)', minWidth: 170 },
    { id: 'complaint', label: 'Complaint Details', minWidth: 200 },
    { id: 'date', label: 'Recorded Date', minWidth: 130 },
  ];

  const complainRows = Array.isArray(complainsList) && complainsList.length > 0 ? complainsList.map((complain) => {
    const date = new Date(complain.date);
    const dateString = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    return {
      user: complain.user?.name || "Unknown Student",
      complaint: complain.complaint,
      date: dateString,
      id: complain._id,
    };
  }) : [];

  const deleteHandler = (deleteID, address) => {
    if (!window.confirm("Are you sure you want to resolve and delete this complaint?")) return;
    dispatch(deleteUser(deleteID, address))
      .then(() => {
        dispatch(getAllComplains(currentUser._id, "Complain"));
      })
      .catch((error) => console.log(error));
  }

  const ComplainActions = ({ row }) => (
    <div className="flex justify-end pr-4">
      <button
        onClick={() => deleteHandler(row.id, "Complain")}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-black/5 rounded-xl text-[10px] font-black uppercase tracking-wider text-textDark/40 hover:bg-slate-50 hover:text-brand transition-all shadow-sm"
      >
        <MarkEmailReadIcon className="text-accent" style={{ fontSize: 16 }} />
        Resolve
      </button>
    </div>
  );

  return (
    <ModuleLayout
      title="Student Grievances"
      subtitle="Review and address complaints submitted by students across the institution."
      loading={loading}
      isEmpty={response}
      emptyTitle="Inbox is Clear"
      emptySubtitle="No complaints or grievances have been reported yet. Great work maintaining an excellent campus environment!"
      emptyIcon={<FeedbackIcon />}
    >
      <TableTemplate buttonHaver={ComplainActions} columns={complainColumns} rows={complainRows} />
    </ModuleLayout>
  );
};

export default SeeComplains;