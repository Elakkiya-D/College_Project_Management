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

const StudentProfile = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in space-y-8">
      {/* 1. Integrated Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute -bottom-10 left-8 p-1 bg-white rounded-2xl shadow-md">
            <Avatar
              alt={currentUser.name}
              sx={{ width: 90, height: 90, borderRadius: '12px', bgcolor: '#2563eb', fontSize: '2rem', fontWeight: 800 }}
            >
              {String(currentUser.name).charAt(0)}
            </Avatar>
          </div>
        </div>
        <div className="pt-14 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-blue-100">
                Roll No: {currentUser.rollNum}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-gray-200">
                {currentUser.sclassName.sclassName}
              </span>
            </div>
          </div>
          <div className="flex bg-gray-50 p-4 rounded-xl border border-gray-100 divide-x divide-gray-200">
            <div className="px-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Status</p>
              <p className="text-xs font-bold text-green-600 italic">Active Student</p>
            </div>
            <div className="px-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Campus</p>
              <p className="text-xs font-bold text-gray-700">Main Campus</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detailed Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ContentCard title="Institutional Record" subtitle="Official registration and academic enrollment data.">
          <div className="space-y-6">
            <InfoRow icon={<SchoolIcon className="text-blue-500" fontSize="small" />} label="Educational Institution" value={currentUser.school?.schoolName || "Not Assigned"} />
            <InfoRow icon={<BadgeIcon className="text-blue-500" fontSize="small" />} label="Semester Registry" value={currentUser.sclassName.sclassName} />
            <InfoRow icon={<AccountCircleIcon className="text-blue-500" fontSize="small" />} label="Student Category" value="Full-time Undergraduate" />
          </div>
        </ContentCard>

        <ContentCard title="Security & Contact" subtitle="Registered contact endpoints for administrative use.">
          <div className="space-y-6">
            <InfoRow icon={<EmailIcon className="text-blue-500" fontSize="small" />} label="Institutional Email" value={currentUser.email || "Not Provided"} />
            <InfoRow icon={<PhoneIcon className="text-blue-500" fontSize="small" />} label="Phone Endpoint" value={currentUser.phone || "Not Updated"} />
            <InfoRow icon={<LocationOnIcon className="text-blue-500" fontSize="small" />} label="Physical Address" value={currentUser.address || "Main Campus Residence"} />
          </div>
          <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
            <InfoIcon className="text-blue-400 mt-0.5" fontSize="small" />
            <p className="text-xs font-medium text-blue-600 leading-relaxed italic">
              Verification required for any profile updates. Please contact the registrar's office.
            </p>
          </div>
        </ContentCard>
      </div>
    </div>
  )
}

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
      {icon}
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ContentCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
    <div className="p-6 border-b border-gray-50">
      <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default StudentProfile;