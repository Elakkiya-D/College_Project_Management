import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { DEPARTMENT_COURSE_OPTIONS } from '../../../constants/academics';
import { getApiErrorMessage, getApiUrl, getAuthHeaders } from '../../../utils/api';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const userState = useSelector(state => state.user);
    const { status, currentUser, response } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');

    const [departmentId, setDepartmentId] = useState('');
    const [departmentLabel, setDepartmentLabel] = useState('');
    const [legacyDepartmentId, setLegacyDepartmentId] = useState('');

    const [courseId, setCourseId] = useState('');
    const [courseLabel, setCourseLabel] = useState('');
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);
    const [courseLoader, setCourseLoader] = useState(false);
    const [courseError, setCourseError] = useState('');

    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    const adminID = currentUser._id;
    const role = 'Student';
    const attendance = [];

    useEffect(() => {
        if (situation !== 'Student') {
            setLegacyDepartmentId(params.id);
            setDepartmentId(params.id);
        }
    }, [params.id, situation]);

    useEffect(() => {
        dispatch(getAllSclasses(adminID, 'Sclass'));
    }, [adminID, dispatch]);

    useEffect(() => {
        if (!Array.isArray(sclassesList) || !sclassesList.length) return;

        const fallbackDepartments = sclassesList.map((item) => ({
            id: item._id,
            departmentName: item.sclassName,
        }));

        setDepartmentOptions((prev) => (prev.length ? prev : fallbackDepartments));

        if (departmentId && !departmentLabel) {
            const selected = fallbackDepartments.find((item) => item.id === departmentId);
            if (selected) setDepartmentLabel(selected.departmentName);
        }
    }, [departmentId, departmentLabel, sclassesList]);

    useEffect(() => {
        if (situation !== 'Student') return;

        let isMounted = true;

        const loadDepartments = async () => {
            try {
                const result = await axios.get(getApiUrl('/api/v2/departments'), {
                    headers: { ...getAuthHeaders() },
                });

                const apiDepartments = Array.isArray(result.data?.items) ? result.data.items : [];
                if (!isMounted || !apiDepartments.length) return;

                const options = apiDepartments.map((item) => ({
                    id: item._id,
                    departmentName: item.name,
                }));

                setDepartmentOptions(options);

                if (departmentId) {
                    const selected = options.find((item) => item.id === departmentId);
                    if (selected) setDepartmentLabel(selected.departmentName);
                }
            } catch (_error) {
                // Fallback is handled from existing local department state.
            }
        };

        loadDepartments();

        return () => {
            isMounted = false;
        };
    }, [departmentId, situation]);

    useEffect(() => {
        if (situation !== 'Student') return;

        if (!departmentId) {
            setCourseOptions([]);
            setCourseError('');
            return;
        }

        let isMounted = true;

        const loadCourses = async () => {
            setCourseLoader(true);
            setCourseError('');

            try {
                const result = await axios.get(getApiUrl(`/api/v2/courses/by-department/${departmentId}`), {
                    headers: { ...getAuthHeaders() },
                });

                const apiCourses = Array.isArray(result.data?.items) ? result.data.items : [];
                if (!isMounted) return;

                if (apiCourses.length) {
                    setCourseOptions(apiCourses.map((item) => ({
                        id: item._id,
                        courseName: item.courseName || item.name,
                        courseCode: item.courseCode || item.code,
                    })));
                    return;
                }

                const fallbackCourses = DEPARTMENT_COURSE_OPTIONS[departmentLabel] || [];
                setCourseOptions(
                    fallbackCourses.map((item) => ({
                        id: `fallback-${item.courseCode}`,
                        courseName: item.courseName,
                        courseCode: item.courseCode,
                    }))
                );

                if (!fallbackCourses.length) {
                    setCourseError('No courses available for the selected department.');
                }
            } catch (_error) {
                if (!isMounted) return;

                const fallbackCourses = DEPARTMENT_COURSE_OPTIONS[departmentLabel] || [];
                setCourseOptions(
                    fallbackCourses.map((item) => ({
                        id: `fallback-${item.courseCode}`,
                        courseName: item.courseName,
                        courseCode: item.courseCode,
                    }))
                );

                if (!fallbackCourses.length) {
                    setCourseError(getApiErrorMessage(_error, 'Unable to load courses for the selected department.'));
                }
            } finally {
                if (isMounted) setCourseLoader(false);
            }
        };

        loadCourses();

        return () => {
            isMounted = false;
        };
    }, [departmentId, departmentLabel, situation]);

    const handleDepartmentChange = (event) => {
        const nextDepartmentId = event.target.value;
        const selected = departmentOptions.find((item) => item.id === nextDepartmentId);
        const matchedLegacyDepartment = Array.isArray(sclassesList)
            ? sclassesList.find((item) => item.sclassName === selected?.departmentName)
            : null;

        setDepartmentId(nextDepartmentId);
        setDepartmentLabel(selected?.departmentName || '');
        setLegacyDepartmentId(matchedLegacyDepartment?._id || '');

        setCourseId('');
        setCourseLabel('');
        setCourseOptions([]);
        setCourseError('');
    };

    const handleCourseChange = (event) => {
        const nextCourseId = event.target.value;
        const selected = courseOptions.find((item) => item.id === nextCourseId);

        setCourseId(nextCourseId);
        setCourseLabel(selected?.courseName || '');
    };

    const fields = {
        name,
        rollNum,
        password,
        sclassName: legacyDepartmentId,
        departmentId,
        courseId,
        courseName: courseLabel,
        enrolledCourseIds: courseId && !String(courseId).startsWith('fallback-') ? [courseId] : [],
        adminID,
        role,
        attendance,
    };

    const submitHandler = (event) => {
        event.preventDefault();

        if (situation === 'Student' && !departmentId) {
            setMessage('Please select a department.');
            setShowPopup(true);
            return;
        }

        if (situation === 'Student' && !courseId) {
            setMessage('Please select a course.');
            setShowPopup(true);
            return;
        }

        if (situation === 'Student' && !legacyDepartmentId) {
            setMessage('Selected department is not mapped for student enrollment.');
            setShowPopup(true);
            return;
        }

        if (situation !== 'Student' && !legacyDepartmentId) {
            setMessage('Department mapping is missing for this enrollment flow.');
            setShowPopup(true);
            return;
        }

        setLoader(true);
        dispatch(registerUser(fields, role));
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            setLoader(false);
            navigate(-1);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage('Network error encountered while saving student data.');
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, dispatch]);

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
                    <ContentCard title="Student Information" subtitle="Official student identification and enrollment data.">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Full Student Name" placeholder="e.g. Johnathan Smith" value={name} onChange={setName} type="text" required />

                                {situation === 'Student' && (
                                    <div className="flex flex-col space-y-2 group">
                                        <label className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">Department</label>
                                        <select
                                            className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 transition-all appearance-none"
                                            value={departmentId}
                                            onChange={handleDepartmentChange}
                                            required
                                        >
                                            <option value="">Select a department...</option>
                                            {departmentOptions.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.departmentName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {situation === 'Student' && (
                                    <div className="flex flex-col space-y-2 group">
                                        <label className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">Course</label>
                                        <select
                                            className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 transition-all appearance-none disabled:bg-gray-100 disabled:text-gray-500"
                                            value={courseId}
                                            onChange={handleCourseChange}
                                            required
                                            disabled={!departmentId || courseLoader}
                                        >
                                            <option value="">
                                                {!departmentId
                                                    ? 'Select a department first'
                                                    : courseLoader
                                                        ? 'Loading courses...'
                                                        : courseOptions.length
                                                            ? 'Select a course...'
                                                            : 'No courses available'}
                                            </option>
                                            {courseOptions.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.courseName} ({item.courseCode})
                                                </option>
                                            ))}
                                        </select>
                                        {courseError && (
                                            <p className="text-xs text-red-600 font-medium">{courseError}</p>
                                        )}
                                    </div>
                                )}

                                <InputField label="Roll Number / Student ID" placeholder="e.g. 202401" value={rollNum} onChange={setRollNum} type="number" required />
                                <InputField label="Create Account Password" placeholder="••••••••" value={password} onChange={setPassword} type="password" required />
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loader}
                                    className={`px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${loader ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
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
                            <GuideItem title="Unique Roll Numbers" detail="Ensure the roll number has not been assigned to another student in the same department and course pipeline." />
                            <GuideItem title="Secure Passwords" detail="Passwords must be at least 6 characters long for student security." />
                            <GuideItem title="Department and Course Mapping" detail="Each student must be mapped to a department first, then the course must be selected from that department." />
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
        <label className="text-sm font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">{label}</label>
        <input
            className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 transition-all placeholder-gray-400"
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
        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></div>
        <div>
            <p className="text-xs font-black text-textDark leading-tight mb-1">{title}</p>
            <p className="text-[11px] font-medium text-textDark/60 leading-normal">{detail}</p>
        </div>
    </li>
);

export default AddStudent;
