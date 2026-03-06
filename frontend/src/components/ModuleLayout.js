import React from 'react';
import PageHeader from './PageHeader';
import ContentCard from './ContentCard';

/**
 * ModuleLayout - Standardized layout wrapper for Admin Panel modules.
 * This component ensures consistent alignment, spacing, and hierarchy across all pages.
 */
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
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            {/* 1. Page Header Section */}
            <PageHeader
                title={title}
                subtitle={subtitle}
                actions={actions}
            />

            {/* 2. Main Content Area */}
            <div className="mt-8">
                {loading ? (
                    /* Standard Loading State */
                    <div className="flex justify-center items-center py-24">
                        <svg className="animate-spin h-10 w-10 text-brand" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    /* 3. Content Card System (bg-surface as requested) */
                    <div className="bg-surface rounded-xl shadow-md border border-black/5 p-6 overflow-hidden">
                        {isEmpty ? (
                            /* Standard Empty State Centered inside Card */
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 border border-black/5 shadow-inner">
                                    {emptyIcon && React.cloneElement(emptyIcon, { className: "text-accent", style: { fontSize: 40 } })}
                                </div>
                                <h3 className="text-2xl font-black text-textDark mb-2">{emptyTitle}</h3>
                                <p className="text-textDark/60 max-w-sm mb-8 font-medium">{emptySubtitle}</p>
                                {emptyAction && emptyActionLabel && (
                                    <button
                                        onClick={emptyAction}
                                        className="px-8 py-3 bg-brand text-white font-semibold rounded-xl shadow-md hover:bg-brand/90 hover:-translate-y-[1px] transition-all"
                                    >
                                        {emptyActionLabel}
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* 4. Data Content wrapper */
                            <div className="bg-white rounded-lg overflow-hidden border border-black/5 shadow-sm">
                                {children}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuleLayout;
