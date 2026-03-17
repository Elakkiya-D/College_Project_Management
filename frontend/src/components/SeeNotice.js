import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import CampaignIcon from '@mui/icons-material/Campaign';
import InfoIcon from '@mui/icons-material/Info';

const SeeNotice = ({ inDashboardWidget = false }) => {
    const dispatch = useDispatch();

    const { currentUser, currentRole } = useSelector(state => state.user);
    const { noticesList, loading, response } = useSelector((state) => state.notice);

    useEffect(() => {
        if (currentRole === "Admin") {
            dispatch(getAllNotices(currentUser._id, "Notice"));
        } else {
            dispatch(getAllNotices(currentUser.school?._id || currentUser.school, "Notice"));
        }
    }, [dispatch, currentRole, currentUser]);

    // Data Sanitization: De-duplicate notices based on title and details to prevent UI clutter
    const sanitizedNotices = noticesList ? Array.from(
        new Map(noticesList.map(notice => [`${notice.title}-${notice.details}`, notice])).values()
    ) : [];

    return (
        <div className={`space-y-6 ${!inDashboardWidget && 'animate-fade-in'}`}>
            {/* Page Header (Only for full page view) */}
            {!inDashboardWidget && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Institutional Bulletin</h1>
                        <p className="text-sm font-medium text-gray-500">
                            Real-time synchronization with official campus announcements.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center flex-col items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Synchronizing Board...</p>
                </div>
            ) : (!sanitizedNotices || sanitizedNotices.length === 0 || response) ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-20 flex flex-col items-center text-center space-y-5 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner group">
                        <CampaignIcon className="text-gray-300 group-hover:text-blue-400 transition-colors" style={{ fontSize: 32 }} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">No Active Notices</h2>
                        <p className="text-sm text-gray-500 font-medium max-w-sm">Official announcements from administration will appear here once broadcasted.</p>
                    </div>
                </div>
            ) : (
                <ContentCard
                    title={inDashboardWidget ? "Institutional Board" : "Active Announcements"}
                    subtitle={inDashboardWidget ? "Official campus broadcast stream." : `Registry: ${sanitizedNotices.length} Records`}
                >
                    <div className="space-y-8">
                        {sanitizedNotices.map((notice, index) => {
                            const date = new Date(notice.date);
                            const day = date.getDate();
                            const month = date.toLocaleString('en-US', { month: 'short' });

                            return (
                                <div key={index} className="flex gap-6 group relative">
                                    {/* Timeline Date Marker */}
                                    <div className="flex flex-col items-center shrink-0 pt-1 group-last:after:hidden relative after:content-[''] after:absolute after:top-14 after:bottom-[-20px] after:left-1/2 after:-translate-x-1/2 after:w-px after:bg-gray-100">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-700 transition-all duration-300 shadow-sm">
                                            <span className="text-lg font-bold leading-none">{day}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{month}</span>
                                        </div>
                                    </div>

                                    {/* Notice Body */}
                                    <div className="flex-1 pb-8 border-b border-gray-50 group-last:border-none group-last:pb-0">
                                        <div className="space-y-3">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                                <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{notice.title}</h4>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-400 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-gray-100 whitespace-nowrap">
                                                    Official Release
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                                {notice.details}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ContentCard>
            )}
        </div>
    );
};

const ContentCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
            <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
            </div>
            <CampaignIcon className="text-gray-200" fontSize="small" />
        </div>
        <div className="p-6 flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

export default SeeNotice;