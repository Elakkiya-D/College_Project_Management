import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import { AccountCircle, School, Group } from '@mui/icons-material';
import bgImage from '../assets/bg-education.jpg';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector(state => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        const email = "yogendra@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Adminlogin');
      }
    } else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "1";
        const studentName = "Dipesh Awasthi";
        const fields = { rollNum, studentName, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Studentlogin');
      }
    } else if (user === "Faculty") {
      if (visitor === "guest") {
        const email = "tony@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Facultylogin');
      }
    }
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      } else if (currentRole === 'Student') {
        navigate('/Student/dashboard');
      } else if (currentRole === 'Faculty') {
        navigate('/Faculty/dashboard');
      }
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden animate-fade-in bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Background Overlay for readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"></div>

      {/* Decorative Subtle Background Element */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-brand/10 rounded-full blur-3xl z-0" />


      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 flex flex-col items-center">

        {/* Header Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="w-16 h-16 bg-brand mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-6 hover:scale-105 transition-transform duration-300">
            <School className="text-white" style={{ fontSize: 32 }} />
          </div>
          <h1 className="text-4xl text-brand font-extrabold tracking-tight mb-3">
            Welcome to EduManage
          </h1>
          <p className="text-lg text-textDark/70 font-medium">
            Choose your role to continue
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-3 gap-8 w-full animate-slide-up-delayed">

          {/* Admin Card */}
          <div
            onClick={() => navigateHandler("Admin")}
            className="group bg-surface rounded-2xl shadow-md p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-accent hover:shadow-xl border border-black/5"
          >
            <div className="w-20 h-20 mx-auto bg-background/50 group-hover:bg-white/20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner">
              <AccountCircle className="text-brand group-hover:text-white transition-colors duration-300" style={{ fontSize: 44 }} />
            </div>
            <h2 className="text-2xl font-bold text-textDark group-hover:text-white mb-3 transition-colors duration-300">
              Admin
            </h2>
            <p className="text-textDark/70 group-hover:text-white/90 text-sm font-medium leading-relaxed transition-colors duration-300">
              Login as an administrator to access the dashboard and manage application data entirely.
            </p>
          </div>

          {/* Student Card */}
          <div
            onClick={() => navigateHandler("Student")}
            className="group bg-surface rounded-2xl shadow-md p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-accent hover:shadow-xl border border-black/5"
          >
            <div className="w-20 h-20 mx-auto bg-background/50 group-hover:bg-white/20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner">
              <School className="text-brand group-hover:text-white transition-colors duration-300" style={{ fontSize: 44 }} />
            </div>
            <h2 className="text-2xl font-bold text-textDark group-hover:text-white mb-3 transition-colors duration-300">
              Student
            </h2>
            <p className="text-textDark/70 group-hover:text-white/90 text-sm font-medium leading-relaxed transition-colors duration-300">
              Login as a student to explore course materials, subjects, view marks, and track attendance.
            </p>
          </div>

          {/* Faculty Card */}
          <div
            onClick={() => navigateHandler("Faculty")}
            className="group bg-surface rounded-2xl shadow-md p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-accent hover:shadow-xl border border-black/5"
          >
            <div className="w-20 h-20 mx-auto bg-background/50 group-hover:bg-white/20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner">
              <Group className="text-brand group-hover:text-white transition-colors duration-300" style={{ fontSize: 44 }} />
            </div>
            <h2 className="text-2xl font-bold text-textDark group-hover:text-white mb-3 transition-colors duration-300">
              Faculty
            </h2>
            <p className="text-textDark/70 group-hover:text-white/90 text-sm font-medium leading-relaxed transition-colors duration-300">
              Login as faculty to manage courses, grade assignments, and monitor class progress.
            </p>
          </div>

        </div>

      </div>

      {/* Modern Loader Overlay */}
      {loader && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-textDark/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-background p-6 rounded-2xl shadow-2xl flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-brand mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-brand font-bold text-lg">Authenticating...</span>
          </div>
        </div>
      )}

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default ChooseUser;