import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [className, setClassName] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const adminID = currentUser._id;
    const role = "Student";
    const attendance = [];

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    };

    const fields = { name, rollNum, password, sclassName, adminID, role, attendance };

    const submitHandler = (event) => {
        event.preventDefault();
        if (sclassName === "") {
            setMessage("Please select a valid class for the student.");
            setShowPopup(true);
        } else {
            setLoader(true);
            dispatch(registerUser(fields, role));
        }
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate(-1);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error encountered saving student.");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title="Enroll New Student"
                subtitle="Add a student record to the central registry. Ensure roll numbers are unique."
                actions={[
                    {
                        label: 'Cancel',
                        variant: 'secondary',
                        onClick: () => navigate(-1)
                    }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
                <div className="lg:col-span-7">
                    <ContentCard title="Demographic Information" subtitle="Official student identification and enrollment data.">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Full Student Name" placeholder="e.g. Johnathan Smith" value={name} onChange={setName} type="text" required />

                                {situation === "Student" && (
                                    <div className="flex flex-col space-y-2 group">
                                        <label className="text-sm font-medium text-gray-700 group-focus-within:text-brand transition-colors">Assign to Class</label>
                                        <select
                                            className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand text-gray-800 transition-all appearance-none"
                                            value={className}
                                            onChange={changeHandler}
                                            required
                                        >
                                            <option value='Select Class'>Select a Class...</option>
                                            {sclassesList.map((classItem, index) => (
                                                <option key={index} value={classItem.sclassName}>{classItem.sclassName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <InputField label="Roll Number / Student ID" placeholder="e.g. 2024A01" value={rollNum} onChange={setRollNum} type="text" required />
                                <InputField label="Create Account Password" placeholder="••••••••" value={password} onChange={setPassword} type="password" required />
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loader}
                                    className={`px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${loader ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-brand text-white hover:bg-brand/90'}`}
                                >
                                    {loader ? (
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>
                                            <PersonAddAltIcon fontSize="small" />
                                            Confirm Registration
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </ContentCard>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <ContentCard title="Registration Guide" subtitle="Essential requirements for enrollment.">
                        <ul className="space-y-4">
                            <GuideItem title="Unique Roll Numbers" detail="Ensure the roll number has not been assigned to any other student in the same class." />
                            <GuideItem title="Secure Passwords" detail="Passwords must be at least 6 characters long for student security." />
                            <GuideItem title="Class Assignment" detail="A student must belong to exactly one class for subjects and attendance tracking." />
                        </ul>
                    </ContentCard>
                </div>
            </div>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

const InputField = ({ label, placeholder, value, onChange, type, required }) => (
    <div className="flex flex-col space-y-2 group">
        <label className="text-sm font-medium text-gray-700 group-focus-within:text-brand transition-colors">{label}</label>
        <input
            className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand text-gray-800 transition-all placeholder-gray-400"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
        />
    </div>
);

const GuideItem = ({ title, detail }) => (
    <li className="flex gap-3">
        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0"></div>
        <div>
            <p className="text-xs font-black text-textDark leading-tight mb-1">{title}</p>
            <p className="text-[11px] font-medium text-textDark/60 leading-normal">{detail}</p>
        </div>
    </li>
);

export default AddStudent;