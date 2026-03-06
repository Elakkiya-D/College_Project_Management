import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const ChooseSubject = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const [classID, setClassID] = useState("");
    const [teacherID, setTeacherID] = useState("");
    const [loader, setLoader] = useState(false)

    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

    useEffect(() => {
        if (situation === "Norm") {
            setClassID(params.id);
            const classID = params.id
            dispatch(getTeacherFreeClassSubjects(classID));
        }
        else if (situation === "Teacher") {
            const { classID, teacherID } = params
            setClassID(classID);
            setTeacherID(teacherID);
            dispatch(getTeacherFreeClassSubjects(classID));
        }
    }, [situation]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <svg className="animate-spin h-12 w-12 text-brand" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    } else if (response) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
                <PageHeader
                    title="Assign Subject"
                    subtitle="All subjects for this class are currently staffed."
                    actions={[{ label: 'Go Back', variant: 'secondary', onClick: () => navigate(-1) }]}
                />
                <div className="mt-8 animate-slide-up">
                    <ContentCard className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
                            <MenuBookIcon className="text-accent" style={{ fontSize: 40 }} />
                        </div>
                        <h3 className="text-2xl font-black text-textDark mb-2">No Free Subjects Available</h3>
                        <p className="text-textDark/60 max-w-sm mb-8 font-medium">All subjects assigned to the selected class already have a designated teacher.</p>
                        <button
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                            className="px-8 py-3 bg-brand text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all"
                        >
                            Create New Subject
                        </button>
                    </ContentCard>
                </div>
            </div>
        );
    } else if (error) {
        console.log(error)
    }

    const updateSubjectHandler = (teacherId, teachSubject) => {
        setLoader(true)
        dispatch(updateTeachSubject(teacherId, teachSubject))
        navigate("/Admin/teachers")
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title="Select Academic Subject"
                subtitle="Assign an available subject to the designated faculty member."
                actions={[
                    {
                        label: 'Go Back',
                        variant: 'secondary',
                        onClick: () => navigate(-1)
                    }
                ]}
            />
            <div className="mt-8 animate-slide-up">
                <ContentCard title="Available Course Catalog" subtitle="Select an unassigned subject from the list below.">
                    <div className="border border-black/5 rounded-2xl overflow-hidden mt-4 shadow-sm bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-black/5">
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-textDark/40">#</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-textDark/40">Subject Name</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-textDark/40">Subject Code</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-textDark/40 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(subjectsList) && subjectsList.map((subject, index) => (
                                    <tr key={subject._id} className="border-b border-black/5 hover:bg-slate-50/50 transition-colors last:border-0">
                                        <td className="px-6 py-4 text-sm font-bold text-textDark/40">{index + 1}</td>
                                        <td className="px-6 py-4 text-base font-bold text-textDark">{subject.subName}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-textDark/60 tabular-nums">{subject.subCode}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end">
                                            {situation === "Norm" ? (
                                                <button
                                                    onClick={() => navigate("/Admin/teachers/addteacher/" + subject._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md transition-all"
                                                >
                                                    <MenuBookIcon fontSize="small" /> Register
                                                </button>
                                            ) : (
                                                <button
                                                    disabled={loader}
                                                    onClick={() => updateSubjectHandler(teacherID, subject._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md transition-all disabled:opacity-50"
                                                >
                                                    {loader ? (
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <><MenuBookIcon fontSize="small" /> Assign</>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ContentCard>
            </div>
        </div>
    );
};

export default ChooseSubject;