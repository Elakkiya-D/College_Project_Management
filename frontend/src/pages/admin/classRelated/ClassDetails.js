import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassDetails, getClassStudents, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PageHeader from "../../../components/PageHeader";
import ContentCard from "../../../components/ContentCard";
import TableTemplate from "../../../components/TableTemplate";
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';

const ClassDetails = () => {
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassDetails, loading, error, response, getresponse } = useSelector((state) => state.sclass);

    const classID = params.id

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"))
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    if (error) {
        console.log(error)
    }

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getClassStudents(classID));
                dispatch(getSubjectList(classID, "ClassSubjects"))
            })
    }

    const subjectColumns = [
        { id: 'name', label: 'Subject Name', minWidth: 170 },
        { id: 'code', label: 'Subject Code', minWidth: 100 },
    ]

    const subjectRows = subjectsList && subjectsList.length > 0 && subjectsList.map((subject) => {
        return {
            name: subject.subName,
            code: subject.subCode,
            id: subject._id,
        };
    })

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <div className="flex items-center gap-2 justify-end pr-4">
                <button
                    onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}
                    className="px-3 py-1.5 bg-surface text-brand font-bold text-sm rounded-lg hover:bg-brand hover:text-white transition-all shadow-sm"
                >
                    View Subject
                </button>
                <button
                    onClick={() => deleteHandler(row.id, "Subject")}
                    className="p-1.5 text-red-500 hover:text-white bg-white hover:bg-red-500 border border-transparent rounded-lg transition-all"
                >
                    <DeleteIcon fontSize="small" />
                </button>
            </div>
        );
    };

    const subjectActions = [
        {
            icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
            action: () => navigate("/Admin/addsubject/" + classID)
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
            action: () => deleteHandler(classID, "SubjectsClass")
        }
    ];

    const ClassSubjectsSection = () => {
        return (
            <div className="animate-fade-in">
                {response ?
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
                            <MenuBookIcon className="text-gray-400" fontSize="large" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-semibold text-gray-800">No Subjects Managed</h4>
                            <p className="text-sm text-gray-500 max-w-sm">No subjects are assigned to this class currently.</p>
                        </div>
                        <button
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                            className="mt-4 px-6 py-2 bg-brand text-white font-semibold rounded-lg shadow-sm hover:bg-brand/90 hover:shadow-md transition-all flex items-center gap-2"
                        >
                            <PostAddIcon fontSize="small" /> Register Subject
                        </button>
                    </div>
                    :
                    <div className="space-y-6 pb-20">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Assigned Subjects</h2>
                            <button
                                onClick={() => navigate("/Admin/addsubject/" + classID)}
                                className="px-4 py-2 bg-brand text-white font-semibold rounded-lg text-sm shadow-sm hover:bg-brand/90 transition-all flex items-center gap-2"
                            >
                                <PostAddIcon fontSize="small" /> Add Subject
                            </button>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                            <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                        </div>
                    </div>
                }
            </div>
        )
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        return (
            <div className="flex items-center gap-2 justify-end pr-4">
                <button
                    onClick={() => navigate("/Admin/students/student/attendance/" + row.id)}
                    className="px-3 py-1.5 bg-surface text-brand font-bold text-sm rounded-lg hover:bg-brand hover:text-white transition-all shadow-sm whitespace-nowrap"
                >
                    Attendance
                </button>
                <button
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 font-bold text-sm rounded-lg hover:bg-gray-100 transition-all shadow-sm"
                >
                    View
                </button>
                <button
                    onClick={() => deleteHandler(row.id, "Student")}
                    className="p-1.5 text-red-500 hover:text-white bg-white hover:bg-red-500 border border-transparent rounded-lg transition-all"
                >
                    <PersonRemoveIcon fontSize="small" />
                </button>
            </div>
        );
    };

    const studentActions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student',
            action: () => navigate("/Admin/class/addstudents/" + classID)
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students',
            action: () => deleteHandler(classID, "StudentsClass")
        },
    ];

    const ClassStudentsSection = () => {
        return (
            <div className="animate-fade-in">
                {getresponse ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
                            <SchoolIcon className="text-gray-400" fontSize="large" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-semibold text-gray-800">No Students Enrolled</h4>
                            <p className="text-sm text-gray-500 max-w-sm">No students currently registered for this class.</p>
                        </div>
                        <button
                            onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                            className="mt-4 px-6 py-2 bg-brand text-white font-semibold rounded-lg shadow-sm hover:bg-brand/90 hover:shadow-md transition-all flex items-center gap-2"
                        >
                            <PersonAddAlt1Icon fontSize="small" /> Add Students
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 pb-20">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Student Roster</h2>
                            <button
                                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                                className="px-4 py-2 bg-brand text-white font-semibold rounded-lg text-sm shadow-sm hover:bg-brand/90 transition-all flex items-center gap-2"
                            >
                                <PersonAddAlt1Icon fontSize="small" /> Add Student
                            </button>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                            <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const ClassTeachersSection = () => {
        return (
            <>
                Teachers
            </>
        )
    }

    const ClassDetailsSection = () => {
        const numberOfSubjects = subjectsList.length;
        const numberOfStudents = sclassStudents.length;

        return (
            <div className="space-y-8 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Class Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                        icon={<ClassIcon fontSize="small" />}
                        label="Class Name"
                        value={sclassDetails?.sclassName}
                    />
                    <div className="grid grid-cols-2 gap-6">
                        <InfoCard
                            icon={<SchoolIcon fontSize="small" />}
                            label="Total Enrolled"
                            value={String(numberOfStudents)}
                        />
                        <InfoCard
                            icon={<MenuBookIcon fontSize="small" />}
                            label="Subjects Count"
                            value={String(numberOfSubjects)}
                        />
                    </div>
                </div>

                {(getresponse || response) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {getresponse && (
                            <div className="col-span-1 p-6 bg-slate-50 border border-black/5 rounded-2xl flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-textDark">Student Missing</h4>
                                    <p className="text-sm text-textDark/60">No students are currently enrolled.</p>
                                </div>
                                <button
                                    onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                                    className="px-6 py-2 bg-brand text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all"
                                >
                                    Add Students
                                </button>
                            </div>
                        )}
                        {response && (
                            <div className="col-span-1 p-6 bg-slate-50 border border-black/5 rounded-2xl flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-textDark">Subject Missing</h4>
                                    <p className="text-sm text-textDark/60">No subjects assigned for this class.</p>
                                </div>
                                <button
                                    onClick={() => navigate("/Admin/addsubject/" + classID)}
                                    className="px-6 py-2 bg-brand text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all"
                                >
                                    Add Subject
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 w-full font-poppins bg-gray-50 min-h-screen animate-fade-in">
            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                </div>
            ) : (
                <>
                    <PageHeader
                        title={sclassDetails?.sclassName || "Class Information"}
                        subtitle="Manage student enrollment, class subjects, and structural details."
                        actions={[
                            {
                                label: 'Go Back',
                                variant: 'secondary',
                                onClick: () => navigate(-1)
                            }
                        ]}
                    />

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px] mt-8">
                        <div className="flex gap-8 border-b border-gray-200 mb-8">
                            <TabButton
                                isActive={value === '1'}
                                onClick={() => setValue('1')}
                                label="DETAILS"
                            />
                            <TabButton
                                isActive={value === '2'}
                                onClick={() => setValue('2')}
                                label="SUBJECTS"
                            />
                            <TabButton
                                isActive={value === '3'}
                                onClick={() => setValue('3')}
                                label="STUDENTS"
                            />
                            <TabButton
                                isActive={value === '4'}
                                onClick={() => setValue('4')}
                                label="TEACHERS"
                            />
                        </div>

                        {value === '1' && <ClassDetailsSection />}
                        {value === '2' && <ClassSubjectsSection />}
                        {value === '3' && <ClassStudentsSection />}
                        {value === '4' && <ClassTeachersSection />}
                    </div>
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

/* Mini Info Card Component */
const InfoCard = ({ icon, label, value, highlight }) => (
    <div className="bg-gray-50 rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] border border-gray-100">
        <div className="flex items-center gap-3">
            <div className={`p-2 bg-white rounded-lg shadow-sm ${highlight ? 'text-accent' : 'text-gray-400'}`}>
                {icon}
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">{label}</span>
        </div>
        <span className={`text-xl font-bold tracking-tight truncate ${highlight ? 'text-yellow-700' : 'text-gray-800'}`}>
            {value || 'N/A'}
        </span>
    </div>
);

/* Custom Tab Button */
const TabButton = ({ isActive, onClick, label }) => (
    <button
        className={`pb-4 text-sm font-bold tracking-wide transition-all duration-200 relative ${isActive ? 'text-brand' : 'text-gray-400 hover:text-gray-800'}`}
        onClick={onClick}
    >
        {label}
        {isActive && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-brand rounded-t-sm" />}
    </button>
);

export default ClassDetails;