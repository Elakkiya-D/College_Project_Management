import { useSelector } from 'react-redux';
import { Avatar } from '@mui/material';
import PageHeader from '../../components/PageHeader';
import ContentCard from '../../components/ContentCard';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import DashboardContainer from '../../components/DashboardContainer';

const AdminProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <DashboardContainer className="space-y-8">
            {/* 1. Page Header */}
            <PageHeader
                title="Account Settings"
                subtitle="Manage your administrative credentials and institutional profile."
                actions={[
                    {
                        label: 'Update Password',
                        variant: 'secondary',
                        onClick: () => console.log("Update Password clicked")
                    },
                    {
                        label: 'Edit Credentials',
                        variant: 'primary',
                        onClick: () => console.log("Edit Profile clicked")
                    }
                ]}
            />

            {/* 2. Structured Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT: Identity Card (3 of 12 columns) */}
                <div className="lg:col-span-4 space-y-8">
                    <ContentCard className="flex flex-col items-center py-10 text-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full border-4 border-blue-600/10 p-1 flex items-center justify-center">
                                <Avatar
                                    sx={{ width: '100%', height: '100%', bgcolor: '#2563EB', fontSize: '2.5rem', fontWeight: 900 }}
                                >
                                    {currentUser.name?.charAt(0)}
                                </Avatar>
                            </div>
                            <div className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                <VerifiedUserIcon className="text-white" fontSize="small" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{currentUser.name}</h2>
                            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">Super Administrator</p>
                        </div>

                        <div className="w-full mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider italic">System Authenticated</span>
                            </div>
                        </div>
                    </ContentCard>
                </div>

                {/* RIGHT: Information Sections (8 of 12 columns) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Official Credentials Card */}
                    <ContentCard title="Administrative Identity" subtitle="Primary account verification and login details.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                            <ProfileInfoRow label="Legal Admin Name" value={currentUser.name} icon={<PersonIcon />} />
                            <ProfileInfoRow label="Primary Email Endpoint" value={currentUser.email} icon={<EmailIcon />} />
                            <ProfileInfoRow label="Educational Institution" value={currentUser.schoolName} icon={<SchoolIcon />} />
                            <ProfileInfoRow label="Authorization Tier" value="Master Access" icon={<VerifiedUserIcon />} />
                        </div>
                    </ContentCard>

                    {/* Branding Preview */}
                    <div className="bg-white rounded-xl border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl rotate-3">
                            {currentUser.schoolName?.charAt(0)}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-1">
                            <h4 className="text-xl font-bold text-gray-900">{currentUser.schoolName}</h4>
                            <p className="text-sm text-gray-500 font-medium tracking-wide">Authorized Academic Management Infrastructure | Instance ID: {currentUser._id?.substring(0, 8)}</p>
                        </div>
                        <button className="px-5 py-2.5 bg-gray-50 border border-gray-100 text-gray-700 font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-white hover:text-blue-600 transition-all">
                            View Branding
                        </button>
                    </div>

                </div>
            </div>
        </DashboardContainer>
    );
};

/* Internal Row Component following the Label (small muted) / Value (bold) rule */
const ProfileInfoRow = ({ label, value, icon }) => (
    <div className="flex items-start gap-4 group">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-inner border border-gray-100">
            {icon}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">{label}</p>
            <p className="text-base font-bold text-gray-900 leading-snug">{value}</p>
        </div>
    </div>
);

export default AdminProfile;

// const styles = {
//     attendanceButton: {
//         backgroundColor: "#270843",
//         "&:hover": {
//             backgroundColor: "#3f1068",
//         }
//     }
// }