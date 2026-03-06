import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import BadgeIcon from '@mui/icons-material/Badge';
import ClassIcon from '@mui/icons-material/Class';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    if (error) {
        console.log(error);
    }

    const isSubjectNamePresent = teacherDetails?.teachSubject?.subName;

    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
    };

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center py-40">
                    <svg className="animate-spin h-12 w-12 text-brand" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
                    <PageHeader
                        title={teacherDetails?.name}
                        subtitle="Faculty Member Details"
                        actions={[
                            {
                                label: 'Go Back',
                                variant: 'secondary',
                                onClick: () => navigate(-1)
                            }
                        ]}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        <div className="lg:col-span-1">
                            <ContentCard className="flex flex-col items-center py-10">
                                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-brand shadow-inner">
                                    <BadgeIcon style={{ fontSize: 40 }} />
                                </div>
                                <h3 className="text-2xl font-black text-textDark mb-1">{teacherDetails?.name}</h3>
                                <p className="text-brand font-bold uppercase tracking-widest text-xs mb-6">Faculty Staff</p>
                            </ContentCard>
                        </div>
                        <div className="lg:col-span-2">
                            <ContentCard title="Academic Assignment" subtitle="Current class and subject allocations">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailBlock label="Assigned Class" value={teacherDetails?.teachSclass?.sclassName} icon={<ClassIcon className="text-accent" />} />

                                    {isSubjectNamePresent ? (
                                        <>
                                            <DetailBlock label="Subject Name" value={teacherDetails?.teachSubject?.subName} icon={<MenuBookIcon className="text-accent" />} />
                                            <DetailBlock label="Subject Sessions" value={teacherDetails?.teachSubject?.sessions} icon={<AccessTimeIcon className="text-accent" />} />
                                        </>
                                    ) : (
                                        <div className="col-span-1 md:col-span-2 p-6 bg-slate-50 border border-black/5 rounded-2xl flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-textDark">No Subject Assigned</h4>
                                                <p className="text-sm text-textDark/60">This teacher requires a course allocation.</p>
                                            </div>
                                            <button
                                                onClick={handleAddSubject}
                                                className="px-6 py-2 bg-brand text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all"
                                            >
                                                Assign Subject
                                            </button>
                                        </div>
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

export default TeacherDetails;
export const DetailBlock = ({ label, value, icon }) => (<div className="p-4 bg-slate-50 rounded-2xl border border-black/5 group hover:bg-white hover:shadow-md transition-all"> <div className="flex items-center gap-2 mb-2"> {icon} <p className="text-[10px] uppercase font-black text-textDark/30 group-hover:text-brand transition-colors">{label}</p> </div> <p className="text-lg font-extrabold text-textDark pl-7">{value || 'N/A'}</p> </div>);
