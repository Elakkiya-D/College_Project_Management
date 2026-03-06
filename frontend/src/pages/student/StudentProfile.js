import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/userRelated/userHandle';
import { Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';

const StudentProfile = () => {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    address: currentUser.address || '',
    studentCategory: currentUser.studentCategory || 'Undergraduate'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    dispatch(updateUser(formData, currentUser._id, "Student"));
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 w-full animate-fade-in">
      {/* 1. Integrated Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand to-brand relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-lg border border-slate-100">
            <Avatar
              alt={currentUser.name}
              sx={{ width: 100, height: 100, borderRadius: '14px', bgcolor: '#065F46', fontSize: '2.5rem', fontWeight: 900 }}
            >
              {String(currentUser.name).charAt(0)}
            </Avatar>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">{currentUser.name}</h1>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface text-brand text-[10px] font-black uppercase tracking-widest rounded-full border border-brand/20">
                <BadgeIcon sx={{ fontSize: 12 }} /> Roll No: {currentUser.rollNum}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface text-brand text-[10px] font-black uppercase tracking-widest rounded-full border border-brand/20">
                <SchoolIcon sx={{ fontSize: 12 }} /> {currentUser.sclassName.sclassName}
              </span>
            </div>
          </div>
          <div className="flex bg-slate-50 p-4 rounded-2xl border border-slate-100 gap-6">
            <div className="text-center px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Academic Class</p>
              <p className="text-sm font-black text-slate-700">{currentUser.sclassName.sclassName}</p>
            </div>
            <div className="w-px h-full bg-slate-200"></div>
            <div className="text-center px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Institution ID</p>
              <p className="text-sm font-black text-slate-700">{currentUser.school.schoolName.substring(0, 15)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detailed Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Academic Information */}
        <DashboardCard title="Institutional Record" subtitle="Official registration details from university registry.">
          <div className="space-y-4">
            <InfoRow icon={<SchoolIcon className="text-brand w-5 h-5" />} label="Educational Institution" value={currentUser.school.schoolName} />
            <InfoRow icon={<BadgeIcon className="text-brand w-5 h-5" />} label="Semester Registry" value={currentUser.sclassName.sclassName} />
            <InfoRow icon={<AccountCircleIcon className="text-brand w-5 h-5" />} label="Student Category" value={currentUser.studentCategory || "Undergraduate"} />
          </div>
        </DashboardCard>

        {/* Personal Data */}
        <DashboardCard title="Security & Contact" subtitle="Manage your registered personal information.">
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-gray-800" placeholder="student@example.com" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile Presence</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-gray-800" placeholder="+1 555-000-0000" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resident Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-gray-800" placeholder="Your residential address..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Category</label>
                  <select name="studentCategory" value={formData.studentCategory} onChange={handleChange} className="w-full px-4 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand text-gray-800 bg-white">
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button onClick={handleSave} disabled={loading} className="px-5 py-2 rounded-lg bg-brand text-white font-bold shadow-sm hover:opacity-90 transition-colors disabled:opacity-50">Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <InfoRow icon={<EmailIcon className="text-brand w-5 h-5" />} label="Registered Email" value={currentUser.email || "Not Provided"} />
                <InfoRow icon={<PhoneIcon className="text-brand w-5 h-5" />} label="Mobile Presence" value={currentUser.phone || "Not Provided"} />
                <InfoRow icon={<LocationOnIcon className="text-brand w-5 h-5" />} label="Resident Address" value={currentUser.address || "Not Provided"} />
                <div className="pt-4 border-t border-gray-100">
                  <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-lg bg-white border border-gray-200 text-brand font-bold shadow-sm hover:bg-gray-50 transition-colors">Update Information</button>
                </div>
              </>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="space-y-0.5">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-base font-semibold text-gray-800 tracking-tight">{value}</p>
    </div>
  </div>
);

const DashboardCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-200">
    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
      <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default StudentProfile