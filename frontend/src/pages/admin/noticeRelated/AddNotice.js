import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress } from '@mui/material';
import Popup from '../../../components/Popup';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TitleIcon from '@mui/icons-material/Title';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotesIcon from '@mui/icons-material/Notes';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';

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
    <div className="max-w-4xl mx-auto px-6 py-8 bg-gray-50 min-h-[calc(100vh-64px)] font-poppins animate-fade-in w-full">

      {/* 1️⃣ Page Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Add Notice</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Dashboard / Notices / Add Notice</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm flex items-center gap-2"
            type="button"
          >
            <ArrowBackIcon fontSize="small" /> Back
          </button>
          <button
            onClick={() => navigate('/Admin/notices')}
            className="px-4 py-2 text-sm font-semibold text-brand bg-surface border border-yellow-100 rounded-lg hover:bg-brand hover:text-white transition-all shadow-sm flex items-center gap-2 group"
            type="button"
          >
            <ListAltIcon fontSize="small" className="text-accent group-hover:text-yellow-200 transition-colors" /> View Notices
          </button>
        </div>
      </div>

      {/* 2️⃣ Main Form Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={submitHandler} className="space-y-8">

          {/* Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT COLUMN */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <TitleIcon fontSize="small" className="text-gray-400" />
                Notice Title
              </label>
              <input
                type="text"
                placeholder="E.g., Midterm Examination Details"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand/20 focus:border-yellow-500 transition-all outline-none bg-gray-50/50 focus:bg-white text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <CalendarTodayIcon fontSize="small" className="text-gray-400" />
                Notice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand/20 focus:border-yellow-500 transition-all outline-none bg-gray-50/50 focus:bg-white text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            {/* RIGHT COLUMN (Optional UI Extras per prompt request) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <LabelOutlinedIcon fontSize="small" className="text-gray-400" />
                Category <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand/20 focus:border-yellow-500 transition-all outline-none bg-gray-50/50 focus:bg-white text-gray-800 appearance-none"
              >
                <option value="">Select a category</option>
                <option value="academic">Academic</option>
                <option value="event">Event</option>
                <option value="administrative">Administrative</option>
                <option value="financial">Financial</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <VisibilityOutlinedIcon fontSize="small" className="text-gray-400" />
                Visibility <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand/20 focus:border-yellow-500 transition-all outline-none bg-gray-50/50 focus:bg-white text-gray-800 appearance-none"
              >
                <option value="All">All Users</option>
                <option value="Students">Students Only</option>
                <option value="Teachers">Teachers Only</option>
              </select>
            </div>

            {/* FULL WIDTH ROW */}
            <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <NotesIcon fontSize="small" className="text-gray-400" />
                Notice Details
              </label>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Type your full notice content here..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 min-h-[140px] resize-y placeholder-gray-400 focus:ring-2 focus:ring-brand/20 focus:border-yellow-500 transition-all outline-none bg-gray-50/50 focus:bg-white text-gray-800 leading-relaxed"
                required
              />
            </div>

          </div>

          {/* Action Button Section */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={cancelHandler}
              disabled={loader}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm flex items-center gap-2 group disabled:opacity-50"
            >
              <ClearIcon fontSize="small" className="text-gray-400 group-hover:text-gray-600" /> Cancel
            </button>
            <button
              type="submit"
              disabled={loader}
              className="px-6 py-2.5 text-sm font-bold text-white bg-brand rounded-lg hover:bg-brand/90 hover:shadow-md transition-all shadow-sm flex items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-[1px]"
            >
              {loader ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <SendIcon fontSize="small" className="text-yellow-200 group-hover:text-white transition-colors" /> Publish Notice
                </>
              )}
            </button>
          </div>

        </form>
      </div>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default AddNotice;