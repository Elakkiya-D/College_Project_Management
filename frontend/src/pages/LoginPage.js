import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Visibility, VisibilityOff, School, AccountCircle, Group } from '@mui/icons-material';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import bgEducation from '../assets/bg-education.jpg';
import studentsPic from '../assets/students.jpg';

const LoginPage = ({ role }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

    const [toggle, setToggle] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [rollNumberError, setRollNumberError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (role === "Student") {
            const rollNum = event.target.rollNumber.value;
            const studentName = event.target.studentName.value;
            const password = event.target.password.value;

            if (!rollNum || !studentName || !password) {
                if (!rollNum) setRollNumberError(true);
                if (!studentName) setStudentNameError(true);
                if (!password) setPasswordError(true);
                return;
            }
            const fields = { rollNum, studentName, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        } else {
            const email = event.target.email.value;
            const password = event.target.password.value;

            if (!email || !password) {
                if (!email) setEmailError(true);
                if (!password) setPasswordError(true);
                return;
            }

            const fields = { email, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        }
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'rollNumber') setRollNumberError(false);
        if (name === 'studentName') setStudentNameError(false);
    };

    useEffect(() => {
        if (status === 'success' || currentUser !== null) {
            if (currentRole === 'Admin') {
                navigate('/Admin/dashboard');
            } else if (currentRole === 'Student') {
                navigate('/Student/dashboard');
            } else if (currentRole === 'Teacher') {
                navigate('/Teacher/dashboard');
            }
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, currentRole, navigate, error, response, currentUser]);

    // Role-based Themes
    const getTheme = (role) => {
        switch (role) {
            case "Admin": return {
                primaryBtn: "bg-accent text-white hover:brightness-110 focus:ring-accent/40 shadow-accent/20",
                textClass: "text-accent",
                iconContainer: "bg-accent/10",
                rightBg: "bg-accent",
                illustrationSrc: bgEducation,
                illustrationBlend: "mix-blend-multiply opacity-40",
                sideTitle: "Enterprise Control System",
                sideSubtitle: "Secure access to manage the entire institution's operational data, users, and core configuration.",
                sideTextColor: "text-white",
                icon: <AccountCircle style={{ fontSize: 36 }} className="text-accent" />
            };
            case "Student": return {
                primaryBtn: "bg-accent text-white hover:brightness-110 focus:ring-accent/40 shadow-accent/20",
                textClass: "text-accent",
                iconContainer: "bg-accent/10",
                rightBg: "bg-surface",
                illustrationSrc: studentsPic,
                illustrationBlend: "mix-blend-multiply opacity-50",
                sideTitle: "Student Learning Hub",
                sideSubtitle: "Your personal space to track attendance, submit assignments, and view educational progress continuously.",
                sideTextColor: "text-brand",
                icon: <School style={{ fontSize: 36 }} className="text-accent" />
            };
            case "Teacher": return {
                primaryBtn: "bg-brand text-white hover:brightness-110 focus:ring-brand/40 shadow-brand/20",
                textClass: "text-brand",
                iconContainer: "bg-brand/10",
                rightBg: "bg-brand",
                illustrationSrc: bgEducation,
                illustrationBlend: "opacity-20 mix-blend-overlay",
                sideTitle: "Faculty Workspace",
                sideSubtitle: "Manage your classes, grade students, and seamlessly organize your daily academic schedule.",
                sideTextColor: "text-white",
                icon: <Group style={{ fontSize: 36 }} className="text-brand" />
            };
            default: return {};
        }
    };

    const theme = getTheme(role);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans animate-fade-in">
            {/* Background Details */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-brand/5 rounded-full blur-3xl z-0" />

            {/* Main Application Container */}
            <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-black/5 min-h-[600px] z-10 animate-slide-up">

                {/* LEFT COLUMN - LOGIN FORM */}
                <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center relative bg-white">
                    <div className="max-w-md w-full mx-auto">

                        {/* Heading Section */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 mb-8">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${theme.iconContainer} transition-colors`}>
                                {theme.icon}
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-textDark tracking-tight">
                                    {role} Login
                                </h1>
                                <p className="text-textDark/60 font-medium md:text-lg">
                                    Welcome back! Please enter your details.
                                </p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit} className="space-y-6 w-full">

                            {/* Inputs Container */}
                            <div className="space-y-4">
                                {role === "Student" ? (
                                    <>
                                        <div className="flex flex-col space-y-1.5 text-left">
                                            <label className="text-sm font-extrabold tracking-wider text-textDark/80 uppercase">Roll Number</label>
                                            <input
                                                name="rollNumber"
                                                type="text"
                                                placeholder="Enter your roll number"
                                                className={`w-full px-4 py-3.5 rounded-xl border ${rollNumberError ? 'border-red-500 bg-red-50' : 'border-black/10'} focus:outline-none focus:ring-4 focus:ring-accent/30 transition-all font-bold text-textDark shadow-sm`}
                                                onChange={handleInputChange}
                                            />
                                            {rollNumberError && <span className="text-xs text-red-500 font-bold">Roll Number is required</span>}
                                        </div>
                                        <div className="flex flex-col space-y-1.5 text-left">
                                            <label className="text-sm font-extrabold tracking-wider text-textDark/80 uppercase">Student Name</label>
                                            <input
                                                name="studentName"
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                className={`w-full px-4 py-3.5 rounded-xl border ${studentNameError ? 'border-red-500 bg-red-50' : 'border-black/10'} focus:outline-none focus:ring-4 focus:ring-accent/30 transition-all font-bold text-textDark shadow-sm`}
                                                onChange={handleInputChange}
                                            />
                                            {studentNameError && <span className="text-xs text-red-500 font-bold">Name is required</span>}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-1.5 text-left">
                                        <label className="text-sm font-extrabold tracking-wider text-textDark/80 uppercase">Email Address</label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="name@institution.edu"
                                            className={`w-full px-4 py-3.5 rounded-xl border ${emailError ? 'border-red-500 bg-red-50' : 'border-black/10'} focus:outline-none focus:ring-4 ${role === 'Admin' ? 'focus:ring-accent/30' : 'focus:ring-slate-400'} transition-all font-bold text-textDark shadow-sm`}
                                            onChange={handleInputChange}
                                        />
                                        {emailError && <span className="text-xs text-red-500 font-bold">Email is required</span>}
                                    </div>
                                )}

                                {/* Shared Password Field */}
                                <div className="flex flex-col space-y-1.5 text-left relative">
                                    <label className="text-sm font-extrabold tracking-wider text-textDark/80 uppercase">Password</label>
                                    <div className="relative">
                                        <input
                                            name="password"
                                            type={toggle ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            className={`w-full pl-4 pr-12 py-3.5 rounded-xl border ${passwordError ? 'border-red-500 bg-red-50' : 'border-black/10'} focus:outline-none focus:ring-4 ${role === 'Admin' ? 'focus:ring-accent/30' : role === 'Student' ? 'focus:ring-accent/30' : 'focus:ring-slate-400'} transition-all font-bold text-textDark shadow-sm`}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setToggle(!toggle)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg text-textDark/40 hover:text-textDark/70 hover:bg-black/5 transition-colors"
                                        >
                                            {toggle ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                                        </button>
                                    </div>
                                    {passwordError && <span className="text-xs text-red-500 font-bold">Password is required</span>}
                                </div>
                            </div>

                            {/* Additional Options Row */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-0 cursor-pointer shadow-sm transition-all"
                                    />
                                    <span className="text-sm font-bold text-textDark/70 group-hover:text-textDark transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <a href="#" className={`text-sm font-bold hover:underline transition-colors ${theme.textClass}`}>
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loader}
                                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5 flex justify-center items-center gap-2 ${theme.primaryBtn} ${loader ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loader ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Authenticating...
                                        </>
                                    ) : (
                                        'Login to Account'
                                    )}
                                </button>
                            </div>

                            {/* Signup Link */}
                            {role === "Admin" && (
                                <p className="text-center text-sm font-bold text-textDark/70 mt-6">
                                    Don't have an account?{' '}
                                    <Link to="/Adminregister" className={`hover:underline ${theme.textClass}`}>
                                        Sign up
                                    </Link>
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN - ILLUSTRATION & BRANDING */}
                <div className={`hidden md:flex md:w-1/2 relative flex-col items-center justify-center p-12 text-center overflow-hidden ${theme.rightBg}`}>
                    {/* Background Mix-Blend Image */}
                    <div
                        className={`absolute inset-0 bg-no-repeat bg-cover bg-center transition-all duration-1000 transform hover:scale-105 ${theme.illustrationBlend}`}
                        style={{ backgroundImage: `url(${theme.illustrationSrc})` }}
                    />

                    {/* Content Overlay */}
                    <div className={`relative z-10 max-w-md ${theme.sideTextColor} space-y-4 animate-slide-up-delayed`}>
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                            {theme.sideTitle}
                        </h2>
                        <p className="font-medium text-lg leading-relaxed opacity-90">
                            {theme.sideSubtitle}
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-1/4 right-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full animate-float z-0" />
                    <div className="absolute bottom-1/4 left-10 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full animate-float-delayed z-0" />
                </div>

            </div>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default LoginPage;
