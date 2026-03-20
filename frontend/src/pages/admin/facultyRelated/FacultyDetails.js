import React, { useEffect } from 'react';
import { getFacultyDetails } from '../../../redux/facultyRelated/facultyHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import BadgeIcon from '@mui/icons-material/Badge';
import ClassIcon from '@mui/icons-material/Class';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const FacultyDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, facultyDetails, error } = useSelector((state) => state.faculty);

    const facultyID = params.id;

    useEffect(() => {
        dispatch(getFacultyDetails(facultyID));
    }, [dispatch, facultyID]);

    if (error) {
        console.log(error);
    }

    const isSubjectNamePresent = facultyDetails?.teachSubject?.subName;

    const handleAddSubject = () => {
        navigate(`/Admin/faculty/choosesubject/${facultyDetails?.teachSclass?._id}/${facultyDetails?._id}`);
    };

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center py-40">
                    <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
                    <PageHeader
                        title={facultyDetails?.name}
                        subtitle="Faculty Member Details"
                        actions={[
                            {
                                label: 'Manage Courses',
                                variant: 'primary',
                                onClick: () => navigate(`/Admin/faculty/manage-courses/${facultyDetails?._id}`),
                            },
                            {
                                label: 'Go Back',
                                variant: 'secondary',
                                onClick: () => navigate(-1),
                            },
                        ]}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        <div className="lg:col-span-1">
                            <ContentCard className="flex flex-col items-center py-10">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 shadow-inner">
                                    <BadgeIcon style={{ fontSize: 40 }} />
                                </div>
                                <h3 className="text-2xl font-black text-textDark mb-1">{facultyDetails?.name}</h3>
                                <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-6">Faculty Staff</p>
                            </ContentCard>
                        </div>
                        <div className="lg:col-span-2">
                            <ContentCard title="Academic Assignment" subtitle="Current class and course allocations">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailBlock label="Assigned Department" value={facultyDetails?.teachSclass?.sclassName} icon={<ClassIcon className="text-blue-400" />} />

                                    {facultyDetails?.assignedCourses && facultyDetails.assignedCourses.length > 0 ? (
                                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {facultyDetails.assignedCourses.map((course, index) => (
                                                <div key={index} className="p-4 bg-white border border-black/5 rounded-2xl flex items-center gap-3 hover:shadow-sm transition-all">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                        <MenuBookIcon fontSize="small" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-textDark">{course.subName || course.name}</p>
                                                        <p className="text-[10px] font-bold text-textDark/40 uppercase tracking-widest">
                                                            {course.sclassName?.sclassName || course.department?.name || "Shared"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            {isSubjectNamePresent ? (
                                                <>
                                                    <DetailBlock label="Primary Course" value={facultyDetails?.teachSubject?.subName} icon={<MenuBookIcon className="text-blue-400" />} />
                                                    <DetailBlock label="Course Sessions" value={facultyDetails?.teachSubject?.sessions} icon={<AccessTimeIcon className="text-blue-400" />} />
                                                </>
                                            ) : (
                                                <div className="col-span-1 md:col-span-2 p-6 bg-slate-50 border border-black/5 rounded-2xl flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-textDark">No Course Assigned</h4>
                                                        <p className="text-sm text-textDark/60">This faculty member requires a course allocation.</p>
                                                    </div>
                                                    <button
                                                        onClick={handleAddSubject}
                                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all"
                                                    >
                                                        Assign Course
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </ContentCard>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FacultyDetails;

export const DetailBlock = ({ label, value, icon }) => (
    <div className="p-4 bg-slate-50 rounded-2xl border border-black/5 group hover:bg-white hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <p className="text-[10px] uppercase font-black text-textDark/30 group-hover:text-blue-600 transition-colors">{label}</p>
        </div>
        <p className="text-lg font-extrabold text-textDark pl-7">{value || 'N/A'}</p>
    </div>
);
