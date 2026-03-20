import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, updateUser, getUserDetails as getClassDetails } from '../../../redux/userRelated/userHandle';
import api from '../../../utils/api';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EditIcon from '@mui/icons-material/Edit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const { status, currentUser, response, error, userDetails } = useSelector(state => state.user);
    const { sclassesList } = useSelector((state) => state.sclass);

    const editID = params.id;
    const isEditMode = !!editID;
    const adminID = currentUser._id;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [year, setYear] = useState('1st');
    const [semester, setSemester] = useState('1');
    const [gender, setGender] = useState('Male');
    const [address, setAddress] = useState('');
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [fetchingCourses, setFetchingCourses] = useState(false);

    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        dispatch(getAllSclasses(adminID, 'Sclass'));
        if (isEditMode) {
            dispatch(getClassDetails(editID, "Student"));
        }
    }, [adminID, editID, isEditMode, dispatch]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (departmentId) {
                setFetchingCourses(true);
                try {
                    const response = await api.get(`/courses/by-department/${departmentId}`);
                    setAssignedCourses(response.data || []);
                } catch (err) {
                    console.error("No courses found:", err);
                    setAssignedCourses([]);
                } finally {
                    setFetchingCourses(false);
                }
            } else {
                setAssignedCourses([]);
            }
        };
        fetchCourses();
    }, [departmentId]);

    useEffect(() => {
        if (isEditMode && userDetails && userDetails._id === editID) {
            setName(userDetails.name || '');
            setEmail(userDetails.email || '');
            setPhone(userDetails.phone || '');
            setRollNum(userDetails.registerNumber || userDetails.rollNum || '');
            setDepartmentId(userDetails.sclassName?._id || userDetails.sclassName || '');
            setYear(userDetails.year || '1st');
            setSemester(userDetails.semester || '1');
            setGender(userDetails.gender || 'Male');
            setAddress(userDetails.address || '');
        }
    }, [userDetails, editID, isEditMode]);

    useEffect(() => {
        if (situation !== 'Student' && params.id && !isEditMode) {
            setDepartmentId(params.id);
        }
    }, [params.id, situation, isEditMode]);

    const submitHandler = (event) => {
        event.preventDefault();

        if (!name.trim() || !email.trim() || !rollNum.trim() || (!password.trim() && !isEditMode) || !departmentId || !phone.trim()) {
            setMessage('Please fill all required fields.');
            setShowPopup(true);
            return;
        }

        if (assignedCourses.length === 0 && !isEditMode) {
            setMessage('No courses available for this department. Creation restricted.');
            setShowPopup(true);
            return;
        }

        if (!EMAIL_REGEX.test(email.toLowerCase())) {
            setMessage('Invalid email format.');
            setShowPopup(true);
            return;
        }

        const fields = {
            name,
            email: email.trim().toLowerCase(),
            phone,
            rollNum,
            registerNumber: rollNum,
            sclassName: departmentId,
            departmentId,
            year,
            semester,
            gender,
            address,
            adminID,
        };

        if (password.trim()) fields.password = password;

        setLoader(true);
        if (isEditMode) {
            dispatch(updateUser(fields, editID, 'Student'));
        } else {
            dispatch(registerUser(fields, 'Student'));
        }
    };

    useEffect(() => {
        if (status === 'added') {
            setLoader(false);
            setMessage(isEditMode ? 'Student Record Updated' : 'Student Enrolled Successfully');
            setShowPopup(true);
            setTimeout(() => {
                dispatch(underControl());
                navigate('/Admin/students');
            }, 1000);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage(String(error || 'Network error encountered.'));
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, error, dispatch, isEditMode]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title={isEditMode ? "Modify Entrollee Record" : "Enroll New Student"}
                subtitle={isEditMode ? "Update details for the institutional student registry." : "Primary registration for institutional student body."}
                actions={[{ label: 'Return', variant: 'secondary', onClick: () => navigate(-1) }]}
            />

            <div className="mt-8 max-w-4xl mx-auto">
                <ContentCard>
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            {isEditMode ? <EditIcon /> : <PersonAddAltIcon />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-textDark">{isEditMode ? "Edit Profile" : "Create Profile"}</h3>
                            <p className="text-sm font-medium text-textDark/60">Manage personal and academic database records.</p>
                        </div>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Name" value={name} onChange={setName} required />
                            <InputField label="Email" type="email" value={email} onChange={setEmail} required />
                            <InputField label="Phone" type="tel" value={phone} onChange={setPhone} required />
                            <InputField label="Roll Number" value={rollNum} onChange={setRollNum} required />
                            
                            <Dropdown label="Department" value={departmentId} onChange={setDepartmentId} required disabled={situation !== 'Student' && !isEditMode}>
                                <option value="">Select Department</option>
                                {sclassesList && sclassesList.map((item) => <option key={item._id} value={item._id}>{item.sclassName}</option>)}
                            </Dropdown>

                            <div className="grid grid-cols-2 gap-4">
                                <Dropdown label="Year" value={year} onChange={setYear}>
                                    <option value="1st">1st Year</option>
                                    <option value="2nd">2nd Year</option>
                                    <option value="3rd">3rd Year</option>
                                    <option value="4th">4th Year</option>
                                </Dropdown>
                                <Dropdown label="Semester" value={semester} onChange={setSemester}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                                </Dropdown>
                            </div>

                            <InputField label={isEditMode ? "New Password (Leave blank for no change)" : "System Password"} type="password" value={password} onChange={setPassword} required={!isEditMode} />
                            
                             <Dropdown label="Gender" value={gender} onChange={setGender}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </Dropdown>
                        </div>

                        {departmentId && (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-black/5 animate-slide-up">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-600">Auto-assigned Curriculum</h4>
                                    <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-full uppercase">Computed</span>
                                </div>
                                {fetchingCourses ? (
                                    <p className="text-sm font-medium text-gray-400">Loading curriculum...</p>
                                ) : assignedCourses.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {assignedCourses.map((course) => (
                                            <div key={course._id} className="bg-white px-3 py-2 rounded-xl border border-black/5 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                <span className="text-xs font-bold text-gray-700 truncate">{course.subName}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-red-400">No courses defined for this department. Creation will fail.</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 block tracking-widest">Address</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-3 bg-white rounded-xl border border-black/5 outline-none h-20 font-medium text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                                placeholder="..."
                            />
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loader}
                                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loader ? 'Processing...' : isEditMode ? 'Update Enrollee' : 'Enroll Student'}
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
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-4 py-3.5 bg-white rounded-xl border border-black/5 outline-none font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
    </div>
);

const Dropdown = ({ label, value, onChange, children, required, disabled }) => (
    <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled} className="w-full px-4 py-3.5 bg-white rounded-xl border border-black/5 outline-none font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50">
            {children}
        </select>
    </div>
);

export default AddStudent;
