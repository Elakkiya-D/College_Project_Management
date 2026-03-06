import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Box, Typography, Paper, Checkbox, FormControlLabel, TextField, CssBaseline, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import bgpic from "../../assets/designlogin.jpg"
import { LightPurpleButton } from '../../components/buttonStyles';
import { registerUser } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import Popup from '../../components/Popup';

const defaultTheme = createTheme();

const AdminRegisterPage = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);;

    const [toggle, setToggle] = useState(false)
    const [loader, setLoader] = useState(false)
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [adminNameError, setAdminNameError] = useState(false);
    const [schoolNameError, setSchoolNameError] = useState(false);
    const role = "Admin"

    const handleSubmit = (event) => {
        event.preventDefault();

        const name = event.target.adminName.value;
        const schoolName = event.target.schoolName.value;
        const email = event.target.email.value;
        const password = event.target.password.value;

        if (!name || !schoolName || !email || !password) {
            if (!name) setAdminNameError(true);
            if (!schoolName) setSchoolNameError(true);
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            return;
        }

        const fields = { name, email, password, role, schoolName }
        setLoader(true)
        dispatch(registerUser(fields, role))
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'adminName') setAdminNameError(false);
        if (name === 'schoolName') setSchoolNameError(false);
    };

    useEffect(() => {
        if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
            navigate('/Admin/dashboard');
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            console.log(error)
        }
    }, [status, currentUser, currentRole, navigate, error, response]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Registration Form */}
                <div className="bg-surface p-8 sm:p-12 rounded-2xl shadow-xl border border-black/5 animate-slide-up">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand mb-3">Create Your College Account</h1>
                        <p className="text-textDark/60 font-medium">Start managing your institution with our professional ERP toolkit.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* SECTION 1: Identity */}
                        <div className="space-y-5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-textDark/40 pb-2 border-b border-textDark/10">Institution Information</h2>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-textDark/80 ml-1">Admin Name</label>
                                <input
                                    type="text"
                                    name="adminName"
                                    placeholder="Enter your full name"
                                    autoFocus
                                    className={`w-full h-12 px-4 rounded-xl border ${adminNameError ? 'border-red-500 bg-red-50' : 'border-textDark/10 bg-white'} focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium`}
                                    onChange={handleInputChange}
                                />
                                {adminNameError && <p className="text-xs text-red-500 font-bold ml-1">Admin Name is required</p>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-textDark/80 ml-1">School Name</label>
                                <input
                                    type="text"
                                    name="schoolName"
                                    placeholder="e.g. Harvard University"
                                    className={`w-full h-12 px-4 rounded-xl border ${schoolNameError ? 'border-red-500 bg-red-50' : 'border-textDark/10 bg-white'} focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium`}
                                    onChange={handleInputChange}
                                />
                                {schoolNameError && <p className="text-xs text-red-500 font-bold ml-1">School name is required</p>}
                            </div>
                        </div>

                        {/* SECTION 2: Credentials */}
                        <div className="space-y-5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-textDark/40 pb-2 border-b border-textDark/10">Access Credentials</h2>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-textDark/80 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@institution.edu"
                                    className={`w-full h-12 px-4 rounded-xl border ${emailError ? 'border-red-500 bg-red-50' : 'border-textDark/10 bg-white'} focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium`}
                                    onChange={handleInputChange}
                                />
                                {emailError && <p className="text-xs text-red-500 font-bold ml-1">Email is required</p>}
                            </div>
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-sm font-bold text-textDark/80 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={toggle ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Create a strong password"
                                        className={`w-full h-12 px-4 rounded-xl border ${passwordError ? 'border-red-500 bg-red-50' : 'border-textDark/10 bg-white'} focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium pr-12`}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setToggle(!toggle)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-textDark/40 hover:text-accent transition-colors"
                                    >
                                        {toggle ? <Visibility size={20} /> : <VisibilityOff size={20} />}
                                    </button>
                                </div>
                                {passwordError && <p className="text-xs text-red-500 font-bold ml-1">Password is required</p>}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loader}
                                className="w-full h-14 bg-brand text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loader ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Complete Registration"
                                )}
                            </button>

                            <p className="mt-8 text-center text-textDark/60 font-bold">
                                Already have an account?{" "}
                                <Link to="/Adminlogin" className="text-accent underline hover:text-accent/80 transition-colors">
                                    Log in here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Right Side: Branding Panel */}
                <div className="hidden lg:flex flex-col items-center justify-center text-center p-12 bg-surface/40 border border-black/5 rounded-[40px] h-full min-h-[600px] animate-fade-in relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                    <div className="relative z-10 space-y-8">
                        <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto transform group-hover:rotate-6 transition-transform duration-500">
                            <span className="text-5xl font-black text-brand">E</span>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-brand leading-tight">
                                Start Managing Your <br />
                                <span className="text-accent">Institution Smarter.</span>
                            </h2>
                            <p className="text-lg text-textDark/60 font-medium max-w-sm mx-auto">
                                Join hundreds of colleges worldwide using EduManage to streamline administration and student success.
                            </p>
                        </div>

                        <div className="pt-10 flex gap-4 justify-center">
                            <div className="px-4 py-2 bg-white rounded-full shadow-md text-xs font-black text-textDark/40 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Live Dashboard
                            </div>
                            <div className="px-4 py-2 bg-white rounded-full shadow-md text-xs font-black text-textDark/40 flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent rounded-full"></div>
                                Secure Auth
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
}

export default AdminRegisterPage;
