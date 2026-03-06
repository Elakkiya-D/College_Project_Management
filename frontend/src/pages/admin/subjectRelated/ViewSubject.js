import React, { useEffect, useState } from 'react';
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import TableTemplate from '../../../components/TableTemplate';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const ViewSubject = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const { subloading, subjectDetails, sclassStudents, getresponse, error } = useSelector((state) => state.sclass);

  const { classID, subjectID } = params;

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  if (error) {
    console.log(error);
  }

  const [activeTab, setActiveTab] = useState('details');
  const [selectedSection, setSelectedSection] = useState('attendance');

  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const deleteHandler = (deleteID, address) => {
    if (!window.confirm("Are you sure you want to remove this subject?")) return;
    dispatch(deleteUser(deleteID, address))
      .then(() => {
        navigate(-1);
      });
  }

  const studentColumns = [
    { id: 'rollNum', label: 'Roll No.', minWidth: 100 },
    { id: 'name', label: 'Name', minWidth: 170 },
  ];

  const studentRows = sclassStudents.map((student) => {
    return {
      rollNum: student.rollNum,
      name: student.name,
      id: student._id,
    };
  });

  const StudentsAttendanceButtonHaver = ({ row }) => {
    return (
      <div className="flex items-center gap-2 justify-end pr-4">
        <button
          onClick={() => navigate("/Admin/students/student/" + row.id)}
          className="px-4 py-1.5 text-xs font-semibold text-brand bg-surface border border-yellow-100 rounded-lg hover:bg-brand hover:text-white transition-all shadow-sm"
        >
          View
        </button>
        <button
          onClick={() => navigate(`/Admin/subject/student/attendance/${row.id}/${subjectID}`)}
          className="px-4 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-600 hover:text-white transition-all shadow-sm"
        >
          Take Attendance
        </button>
      </div>
    );
  };

  const StudentsMarksButtonHaver = ({ row }) => {
    return (
      <div className="flex items-center gap-2 justify-end pr-4">
        <button
          onClick={() => navigate("/Admin/students/student/" + row.id)}
          className="px-4 py-1.5 text-xs font-semibold text-brand bg-surface border border-yellow-100 rounded-lg hover:bg-brand hover:text-white transition-all shadow-sm"
        >
          View
        </button>
        <button
          onClick={() => navigate(`/Admin/subject/student/marks/${row.id}/${subjectID}`)}
          className="px-4 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-600 hover:text-white transition-all shadow-sm"
        >
          Provide Marks
        </button>
      </div>
    );
  };

  const SubjectStudentsSection = () => {
    return (
      <div className="animate-fade-in">
        {getresponse ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
              <PeopleAltOutlinedIcon className="text-gray-400" fontSize="large" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-semibold text-gray-800">No Students Enrolled</h4>
              <p className="text-sm text-gray-500 max-w-sm">No students currently registered in the parent class for this subject.</p>
            </div>
            <button
              onClick={() => navigate("/Admin/class/addstudents/" + classID)}
              className="mt-4 px-6 py-2 bg-brand text-white font-semibold rounded-lg shadow-sm hover:bg-brand/90 hover:shadow-md transition-all flex items-center gap-2"
            >
              <AddCircleOutlineIcon fontSize="small" /> Add Students
            </button>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Enrolled Roster</h2>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
              {selectedSection === 'attendance' &&
                <TableTemplate buttonHaver={StudentsAttendanceButtonHaver} columns={studentColumns} rows={studentRows} />
              }
              {selectedSection === 'marks' &&
                <TableTemplate buttonHaver={StudentsMarksButtonHaver} columns={studentColumns} rows={studentRows} />
              }
            </div>

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={6}>
              <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                <BottomNavigationAction
                  label="Attendance"
                  value="attendance"
                  icon={selectedSection === 'attendance' ? <TableChartIcon className="text-brand" /> : <TableChartOutlinedIcon />}
                />
                <BottomNavigationAction
                  label="Marks"
                  value="marks"
                  icon={selectedSection === 'marks' ? <InsertChartIcon className="text-brand" /> : <InsertChartOutlinedIcon />}
                />
              </BottomNavigation>
            </Paper>
          </div>
        )}
      </div>
    );
  };

  const SubjectDetailsSection = () => {
    const numberOfStudents = sclassStudents.length;

    return (
      <div className="space-y-8 animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Academic Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<MenuBookIcon fontSize="small" />}
            label="Subject Name"
            value={subjectDetails?.subName}
          />
          <InfoCard
            icon={<VpnKeyOutlinedIcon fontSize="small" />}
            label="Subject Code"
            value={subjectDetails?.subCode}
          />
          <InfoCard
            icon={<AccessTimeIcon fontSize="small" />}
            label="Designated Sessions"
            value={subjectDetails?.sessions}
          />
          <InfoCard
            icon={<ClassOutlinedIcon fontSize="small" />}
            label="Parent Class"
            value={subjectDetails?.sclassName?.sclassName}
          />
          <InfoCard
            icon={<PeopleAltOutlinedIcon fontSize="small" />}
            label="Total Enrolled"
            value={String(numberOfStudents)}
          />

          {subjectDetails?.teacher ? (
            <InfoCard
              icon={<PersonOutlineOutlinedIcon fontSize="small" />}
              label="Assigned Lecturer"
              value={subjectDetails.teacher.name}
              highlight
            />
          ) : (
            <div className="bg-orange-50 rounded-xl p-5 flex flex-col justify-between shadow-sm border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-orange-400">
                  <PersonOutlineOutlinedIcon fontSize="small" />
                </div>
                <span className="text-sm font-semibold text-orange-600">Pending Assignment</span>
              </div>
              <button
                onClick={() => navigate("/Admin/teachers/addteacher/" + subjectDetails._id)}
                className="w-full mt-3 px-4 py-2 bg-white text-orange-600 text-sm font-bold rounded-lg border border-orange-200 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
              >
                Assign Subject Teacher
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full font-poppins bg-gray-50 min-h-screen animate-fade-in">
      {subloading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      ) : (
        <>
          {/* TOP SECTION - Header & Actions */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Subject Details</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Dashboard / Subjects / <span className="text-gray-900">{subjectDetails?.subName}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm flex items-center gap-2"
              >
                <ArrowBackIcon fontSize="small" /> Back
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm flex items-center gap-2">
                <EditOutlinedIcon fontSize="small" /> Edit
              </button>
              <button
                onClick={() => deleteHandler(subjectID, "Subject")}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" /> Delete
              </button>
            </div>
          </div>

          {/* MAIN CONTENT CONTAINER */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">

            {/* CUSTOM TABS */}
            <div className="flex gap-8 border-b border-gray-200 mb-8">
              <TabButton
                isActive={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
                label="DETAILS"
              />
              <TabButton
                isActive={activeTab === 'students'}
                onClick={() => setActiveTab('students')}
                label="STUDENTS"
              />
            </div>

            {/* TAB PANELS */}
            {activeTab === 'details' && <SubjectDetailsSection />}
            {activeTab === 'students' && <SubjectStudentsSection />}

          </div>
        </>
      )}
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

export default ViewSubject;