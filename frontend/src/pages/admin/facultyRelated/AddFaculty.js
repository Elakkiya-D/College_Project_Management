import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import { registerUser, updateUser, getUserDetails as getClassDetails } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddFaculty = () => {
    const { subjectID, facultyID } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isEditMode = !!facultyID;
    const activeID = isEditMode ? facultyID : subjectID;

    console.log("Mode:", isEditMode ? "Edit" : "Add");
    console.log("Active ID:", activeID);

    const { status, response, error, userDetails } = useSelector(state => state.user);
    const { subjectDetails } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [designation, setDesignation] = useState('Faculty');

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            dispatch(getClassDetails(facultyID, "Faculty"));
        } else if (subjectID) {
            dispatch(getSubjectDetails(subjectID, 'Subject'));
        }
    }, [dispatch, subjectID, facultyID, isEditMode]);

    useEffect(() => {
        if (isEditMode && userDetails && userDetails._id === facultyID) {
            setName(userDetails.name || '');
            setEmail(userDetails.email || '');
            setDesignation(userDetails.designation || 'Faculty');
        }
    }, [userDetails, facultyID, isEditMode]);

    const submitHandler = (event) => {
        event.preventDefault();
        console.log("Submitting form...");

        if (!name.trim() || !email.trim() || (!password.trim() && !isEditMode) || !designation.trim()) {
            setMessage('Please fill all required fields.');
            setShowPopup(true);
            return;
        }

        if (!EMAIL_REGEX.test(email.toLowerCase())) {
            setMessage('Invalid email address.');
            setShowPopup(true);
            return;
        }
        const fields = {
            name,
            email: email.trim().toLowerCase(),
            designation,
        };
        console.log("Submitting faculty data payload:", fields);

        if (password.trim()) fields.password = password;
        if (!isEditMode) {
            fields.role = 'Faculty';
            fields.school = subjectDetails?.school;
            fields.teachSubject = subjectDetails?._id;
            fields.teachSclass = subjectDetails?.sclassName?._id;
            
            if (!fields.school || !fields.teachSclass) {
                setMessage('Department mapping is required.');
                setShowPopup(true);
                return;
            }
        }

        setLoader(true);
        if (isEditMode) {
            dispatch(updateUser(fields, facultyID, "Faculty"));
        } else {
            dispatch(registerUser(fields, 'Faculty'));
        }
    };

    useEffect(() => {
        if (status === 'added') {
            setLoader(false);
            setMessage(isEditMode ? 'Faculty Data Updated' : 'Faculty Registered Successfully');
            setShowPopup(true);
            setTimeout(() => {
                dispatch(underControl());
                navigate('/Admin/faculty');
            }, 1000);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage(error || 'Network connection failed.');
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch, isEditMode]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title={isEditMode ? "Modify Faculty Record" : "Onboard Faculty Member"}
                subtitle={isEditMode ? "Update the professional database for academic staff." : "Initialize a new faculty account and assign the primary course load."}
                actions={[{ label: 'Return', variant: 'secondary', onClick: () => navigate(-1) }]}
            />

            <div className="mt-8 animate-slide-up max-w-2xl mx-auto">
                <ContentCard>
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            {isEditMode ? <EditIcon /> : <PersonAddAlt1Icon />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-textDark">{isEditMode ? "Edit Profile" : "Onboard Staff"}</h3>
                            <p className="text-sm font-medium text-textDark/60">
                                {!isEditMode ? `Assigning to: ${subjectDetails?.subName || '...'}` : 'Manage authentication and professional data.'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="space-y-4">
                            <InputField label="Staff Full Name" value={name} onChange={setName} required />
                            <InputField label="Institutional Email" type="email" value={email} onChange={setEmail} required />
                            <InputField label="Designation / Title" value={designation} onChange={setDesignation} required />
                            <InputField label={isEditMode ? "New Password (Optional)" : "System Password"} type="password" value={password} onChange={setPassword} required={!isEditMode} />
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loader}
                                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {loader ? 'Processing...' : isEditMode ? 'Update Staff Member' : 'Confirm Registration'}
                            </button>
                        </div>
                    </form>
                </ContentCard>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

const InputField = ({ label, value, onChange, type = "text", required = false }) => (
    <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block">{label}</label>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-4 py-3.5 bg-white rounded-xl border border-black/5 outline-none font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-poppins" />
    </div>
);

export default AddFaculty;
