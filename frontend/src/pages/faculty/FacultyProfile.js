import React from 'react';
import { useSelector } from 'react-redux';

const FacultyProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 w-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">Profile</p>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Faculty Profile</h1>
                    <p className="text-sm text-gray-500">Personal and assignment details.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="Name" value={currentUser?.name} />
                    <InfoItem label="Email" value={currentUser?.email} />
                    <InfoItem label="Department" value={currentUser?.teachSclass?.sclassName} />
                    <InfoItem label="Course" value={currentUser?.teachSubject?.subName} />
                    <InfoItem label="College" value={currentUser?.school?.schoolName} />
                    <InfoItem label="Designation" value={currentUser?.designation || 'Faculty'} />
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{label}</p>
        <p className="text-base font-semibold text-gray-900 mt-2">{value || 'Not available'}</p>
    </div>
);

export default FacultyProfile;
