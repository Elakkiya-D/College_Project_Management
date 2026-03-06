import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoIcon from '@mui/icons-material/Info';

const SeeNotice = ({ inDashboardWidget = false }) => {
    const dispatch = useDispatch();

    const { currentUser, currentRole } = useSelector(state => state.user);
    const { noticesList, loading, response } = useSelector((state) => state.notice);

    useEffect(() => {
        if (currentRole === "Admin") {
            dispatch(getAllNotices(currentUser._id, "Notice"));
        } else {
            dispatch(getAllNotices(currentUser.school._id, "Notice"));
        }
    }, [dispatch, currentRole, currentUser]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            {!inDashboardWidget && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Institutional Bulletin</h1>
                        <p className="text-sm font-medium text-slate-500 tracking-wide">
                            Real-time updates and official announcements from university administration.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-yellow-100 rounded-xl">
                        <CampaignIcon className="text-brand" fontSize="small" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand">Sync Active</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-yellow-100 border-t-yellow-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-brand uppercase tracking-widest">Fetching Bulletin...</p>
                </div>
            ) : (!noticesList || noticesList.length === 0 || response) ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-20 flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner group hover:scale-110 transition-transform duration-500">
                        <CampaignIcon className="text-yellow-200 group-hover:text-accent transition-colors" style={{ fontSize: 40 }} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-slate-800">No Active Notices</h2>
                        <p className="text-sm font-medium text-slate-400 max-w-sm">There are no official institutional notices to display at this time. Future announcements will appear here synchronized with the university board.</p>
                    </div>
                </div>
            ) : (
                <DashboardCard
                    title={inDashboardWidget ? "Institutional Notices" : "Active Announcements"}
                    subtitle={inDashboardWidget ? "Stay updated with the latest campus announcements." : `Total Registered Notices: ${noticesList.length}`}
                    noPadding={inDashboardWidget}
                >
                    <div className="space-y-6">
                        {noticesList.map((notice, index) => {
                            const date = new Date(notice.date);
                            const day = date.getDate();
                            const month = date.toLocaleString('en-US', { month: 'short' });
                            const year = date.getFullYear();

                            return (
                                <div key={index} className="flex gap-6 group transition-all">
                                    {/* Date Column */}
                                    <div className="flex flex-col items-center pt-1 group-last:after:hidden relative after:content-[''] after:absolute after:top-14 after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-px after:bg-slate-100">
                                        <div className="w-14 h-14 rounded-2xl bg-surface border border-yellow-100 flex flex-col items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300">
                                            <span className="text-lg font-black leading-none">{day}</span>
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{month}</span>
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 pb-10 border-b border-slate-50 last:border-none last:pb-0">
                                        <div className="space-y-3">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <h4 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-brand transition-colors">{notice.title}</h4>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                                                    <CalendarMonthIcon sx={{ fontSize: 10 }} /> Published in {year}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                                                {notice.details}
                                            </p>
                                            <div className="pt-4 flex items-center gap-4">
                                                <div className="h-0.5 w-12 bg-yellow-100 rounded-full"></div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-accent uppercase tracking-[0.2em]">
                                                    <InfoIcon sx={{ fontSize: 12 }} /> Formal Update
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DashboardCard>
            )}
        </div>
    );
};

const DashboardCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm font-medium text-slate-500">{subtitle}</p>}
        </div>
        <div className="p-6 flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

export default SeeNotice;