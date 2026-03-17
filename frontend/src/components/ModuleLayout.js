import React from 'react';
import PageHeader from './PageHeader';

/**
 * ModuleLayout - Standardized layout wrapper for Admin Panel modules.
 * This component ensures consistent alignment, spacing, and hierarchy across all pages.
 */
import DashboardContainer from './DashboardContainer';

const ModuleLayout = ({
    title,
    subtitle,
    actions = [],
    loading = false,
    isEmpty = false,
    emptyTitle,
    emptySubtitle,
    emptyIcon,
    emptyAction,
    emptyActionLabel,
    children
}) => {
    return (
        <DashboardContainer>
            <PageHeader
                title={title}
                subtitle={subtitle}
                actions={actions}
            />

            <div className="mt-6 sm:mt-8">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-brand/15 border-t-brand rounded-full animate-spin"></div>
                        <p className="text-sm font-semibold text-brand uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-textDark/10 overflow-hidden">
                        {isEmpty ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center mb-6 border border-brand/20 shadow-sm transition-transform hover:scale-110 duration-500">
                                    {emptyIcon && React.cloneElement(emptyIcon, { className: "text-brand", style: { fontSize: 40 } })}
                                </div>
                                <h3 className="text-2xl font-semibold text-textDark mb-2">{emptyTitle}</h3>
                                <p className="text-textMedium max-w-sm mb-8 font-medium leading-relaxed">{emptySubtitle}</p>
                                {emptyAction && emptyActionLabel && (
                                    <button
                                        onClick={emptyAction}
                                        className="px-8 py-3 bg-brand text-white font-semibold rounded-xl shadow-md hover:bg-brandDark hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        {emptyIcon && React.cloneElement(emptyIcon, { sx: { fontSize: 18 } })}
                                        {emptyActionLabel}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="w-full">
                                {children}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardContainer>
    );
};

export default ModuleLayout;
