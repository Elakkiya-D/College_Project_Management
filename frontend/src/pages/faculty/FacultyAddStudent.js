import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModuleLayout from '../../components/ModuleLayout';
import ContentCard from '../../components/ContentCard';
import Popup from '../../components/Popup';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { getApiErrorMessage, getApiUrl, getAuthHeaders } from '../../utils/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FacultyAddStudent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [registerNumber, setRegisterNumber] = useState('');
    const [courseId, setCourseId] = useState('');
    const [courseName, setCourseName] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const departmentId = currentUser?.teachSclass?._id || '';
    const departmentName = currentUser?.teachSclass?.sclassName || '';

    useEffect(() => {
        if (departmentId) {
            dispatch(getSubjectList(departmentId, 'ClassSubjects'));
        }
    }, [departmentId, dispatch]);

    const handleCourseChange = (event) => {
        const nextId = event.target.value;
        const selected = Array.isArray(subjectsList)
            ? subjectsList.find((subject) => subject._id === nextId)
            : null;

        setCourseId(nextId);
        setCourseName(selected?.subName || '');
    };

    const submitHandler = async (event) => {
        event.preventDefault();

        if (!name.trim() || !email.trim() || !registerNumber.trim()) {
            setMessage('Please fill all required fields before submitting.');
            setShowPopup(true);
            return;
        }

        if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
            setMessage('Please enter a valid student email address.');
            setShowPopup(true);
            return;
        }

        if (!courseId) {
            setMessage('Please select a course.');
            setShowPopup(true);
            return;
        }

        if (!departmentId) {
            setMessage('Your department mapping is missing. Contact an administrator.');
            setShowPopup(true);
            return;
        }

        try {
            setLoading(true);
            await axios.post(getApiUrl('/student/create'), {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                registerNumber: registerNumber.trim(),
                departmentId,
                departmentName,
                courseId,
                courseName,
            }, {
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            });

            setMessage('Student added successfully.');
            setShowPopup(true);
            setName('');
            setEmail('');
            setRegisterNumber('');
            setCourseId('');
            setCourseName('');
        } catch (error) {
            setMessage(getApiErrorMessage(error, 'Unable to add student.'));
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModuleLayout
            title="Add Student"
            subtitle="Enroll a new student within your department."
            actions={[
                {
                    label: 'Back to Roster',
                    variant: 'secondary',
                    onClick: () => navigate('/Faculty/class'),
                },
            ]}
        >
            <div className="max-w-3xl">
                <ContentCard>
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Student Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter student name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="student@college.edu"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Register Number</label>
                                <input
                                    type="text"
                                    value={registerNumber}
                                    onChange={(event) => setRegisterNumber(event.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Register number"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Department</label>
                                <input
                                    type="text"
                                    value={departmentName}
                                    disabled
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Course</label>
                                <select
                                    value={courseId}
                                    onChange={handleCourseChange}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select course</option>
                                    {Array.isArray(subjectsList) && subjectsList.map((subject) => (
                                        <option key={subject._id} value={subject._id}>{subject.subName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 px-6 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-60 flex items-center gap-2"
                            >
                                <PersonAddAltOutlinedIcon fontSize="small" />
                                {loading ? 'Saving...' : 'Add Student'}
                            </button>
                        </div>
                    </form>
                </ContentCard>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </ModuleLayout>
    );
};

export default FacultyAddStudent;
