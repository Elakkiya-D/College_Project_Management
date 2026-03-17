import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress } from '@mui/material';
import Popup from '../../../components/Popup';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotesIcon from '@mui/icons-material/Notes';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import DashboardContainer from '../../../components/DashboardContainer';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector(state => state.user);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');

  // UI Only Mock States (Since the original backend schema only asks for Title, Details, Date)
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('All');

  const adminID = currentUser._id;
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const fields = { title, details, date, adminID };
  const address = "Notice";

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    dispatch(addStuff(fields, address));
  };

  const cancelHandler = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl());
      navigate('/Admin/notices');
    } else if (status === 'error') {
      setMessage("Network Error");
      setShowPopup(true);
      setLoader(false);
      dispatch(underControl());
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <DashboardContainer>
      <PageHeader
        title="Add Notice"
        subtitle="Instituion-wide broadcast system."
        actions={[
          { label: 'Back', icon: <ArrowBackIcon />, onClick: () => navigate(-1), variant: 'secondary' },
          { label: 'View All', icon: <ListAltIcon />, onClick: () => navigate('/Admin/notices') },
        ]}
      />

      <ContentCard title="Notification Details" subtitle="Enter precise information to be broadcasted to targeted groups.">
        <form onSubmit={submitHandler} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Notice Title</label>
              <input
                type="text"
                placeholder="E.g., Midterm Examination Details"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Publication Date</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Target Audience</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
              >
                <option value="All">All Institutional Users</option>
                <option value="Students">Student Body</option>
                <option value="Teachers">Faculty Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Notice Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
              >
                <option value="">General Announcement</option>
                <option value="academic">Academic / Exams</option>
                <option value="event">Campus Events</option>
                <option value="administrative">Administrative Notice</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Full Description</label>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Details of the announcement..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 min-h-[160px] resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={cancelHandler}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loader}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loader ? <CircularProgress size={18} color="inherit" /> : <>Publish Announcement <SendIcon sx={{ fontSize: 16 }} /></>}
            </button>
          </div>
        </form>
      </ContentCard>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </DashboardContainer>
  );
};

export default AddNotice;