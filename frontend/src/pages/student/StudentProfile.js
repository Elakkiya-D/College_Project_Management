import React from 'react'
import { useSelector } from 'react-redux';
import { Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const StudentProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in space-y-8">
            {/* 1. Integrated Profile Header */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 relative">
                    <div className="absolute -bottom-12 left-10 p-1.5 bg-white rounded-3xl shadow-2xl">
                        <Avatar
                            alt={currentUser.name}
                            sx={{ width: 120, height: 120, borderRadius: '22px', bgcolor: '#1e40af', fontSize: '3rem', fontWeight: 900 }}
                        >
                            {String(currentUser.name).charAt(0)}
                        </Avatar>
                    </div>
                </div>
                <div className="pt-16 pb-10 px-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{currentUser.name}</h1>
                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-widest rounded-xl border border-blue-200 shadow-sm">
                                Register No: {currentUser.rollNum}
                            </span>
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-widest rounded-xl border border-indigo-200 shadow-sm">
                                {currentUser.sclassName?.sclassName || "N/A"}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-200/50 backdrop-blur-md">
                        <div className="px-6 text-center border-r border-gray-200">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Academic Status</p>
                            <p className="text-sm font-bold text-green-600 flex items-center justify-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Active Member
                            </p>
                        </div>
                        <div className="px-6 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Current Year</p>
                            <p className="text-sm font-bold text-gray-800 italic">{currentUser.year || "1st"} Year</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Detailed Information Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Left Column - Core Academic Details */}
                <div className="xl:col-span-2 space-y-8">
                    <ContentCard title="Academic Profile" subtitle="Official registration and curriculum metadata." icon={<SchoolIcon fontSize="small" className="text-blue-500" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoRow icon={<SchoolIcon className="text-blue-500" />} label="University/College" value={currentUser.school?.schoolName || "Institutional Record"} />
                            <InfoRow icon={<BadgeIcon className="text-blue-500" />} label="Department Name" value={currentUser.sclassName?.sclassName || "Not Defined"} />
                            <InfoRow icon={<CalendarMonthIcon className="text-blue-500" />} label="Current Semester" value={`Semester ${currentUser.semester || "1"}`} />
                            <InfoRow icon={<AccountCircleIcon className="text-blue-500" />} label="Student Category" value="Full-time Enrollment" />
                        </div>
                    </ContentCard>

                    <ContentCard title="Enrolled Curriculum (Auto-Enrollment)" subtitle="Courses dynamically assigned based on your department." icon={<AssignmentIcon fontSize="small" className="text-indigo-500" />}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Course Code</th>
                                        <th className="px-4 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">Course Title</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentUser.courseIds && currentUser.courseIds.length > 0 ? (
                                        currentUser.courseIds.map((course, index) => (
                                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-4 text-xs font-black text-blue-600">{course.subCode || "N/A"}</td>
                                                <td className="px-4 py-4 text-sm font-bold text-gray-800">{course.subName || "Untitled Course"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-4 py-8 text-center text-xs font-medium text-gray-400 italic">
                                                No specific courses found. Please contact the department head.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </ContentCard>
                </div>

                {/* Right Column - Contact & Secure Details */}
                <div className="space-y-8">
                    <ContentCard title="Contact & Access" subtitle="Registry verified contact endpoints." icon={<PhoneIcon fontSize="small" className="text-purple-500" />}>
                        <div className="space-y-8">
                            <InfoRow icon={<EmailIcon className="text-purple-500" />} label="Email Address" value={currentUser.email || "Not Provided"} />
                            <InfoRow icon={<PhoneIcon className="text-purple-500" />} label="Mobile Number" value={currentUser.phone || "Not Registered"} />
                            <InfoRow icon={<LocationOnIcon className="text-purple-500" />} label="Residential Address" value={currentUser.address || "On-Campus / Not Provided"} />
                        </div>
                        <div className="mt-10 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-start gap-4">
                            <InfoIcon className="text-indigo-400 mt-1" fontSize="small" />
                            <p className="text-[11px] font-bold text-indigo-600/70 leading-relaxed italic">
                                Identity verification required for data modification. Visit the administration desk for updates.
                            </p>
                        </div>
                    </ContentCard>

                    <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-white group cursor-default">
                        <div className="relative z-10">
                            <h4 className="text-base font-black mb-2 opacity-80 uppercase tracking-widest">Enrollment Status</h4>
                            <p className="text-2xl font-black mb-6">Officially Verified</p>
                            <div className="w-12 h-1 bg-blue-500 rounded-full mb-6 group-hover:w-20 transition-all duration-300"></div>
                            <p className="text-sm font-medium opacity-60 leading-relaxed">
                                Your account is synced with the {currentUser.school?.schoolName || "Institutional"} digital database.
                            </p>
                        </div>
                        <AccountCircleIcon className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 rotate-12 transition-transform group-hover:scale-110" />
                    </div>
                </div>
            </div>
        </div>
    )
}

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-5 group">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-lg group-hover:border-transparent transition-all duration-300">
            {React.cloneElement(icon, { sx: { fontSize: 20 } })}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</p>
            <p className="text-sm font-black text-gray-800">{value}</p>
        </div>
    </div>
);

const ContentCard = ({ title, subtitle, children, icon }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs font-medium text-gray-400 leading-normal">{subtitle}</p>}
            </div>
            {icon && (
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    {icon}
                </div>
            )}
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

export default StudentProfile;