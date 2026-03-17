import React from 'react';

/**
 * PageHeader - Standardized enterprise-grade header for modules.
 * Left: Title + Subtitle | Right: Action Buttons Group (flex justify-between)
 */
const PageHeader = ({ title, subtitle, actions }) => {
    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
            {/* LEFT SIDE: Title & Subtitle */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-3xl font-semibold text-textDark tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm font-medium text-textMedium">{subtitle}</p>}
            </div>

            {/* RIGHT SIDE: Action Buttons Group */}
            {actions && actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-4">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`h-11 min-w-[148px] flex items-center justify-center gap-2 px-5 rounded-xl shadow-sm font-semibold text-sm transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] ${action.variant === 'primary' || !action.variant
                                    ? 'bg-brand text-white hover:bg-brandDark'
                                    : action.variant === 'secondary'
                                        ? 'bg-white border border-gray-200 text-textDark hover:bg-background hover:border-gray-300'
                                        : action.variant === 'danger'
                                            ? 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100'
                                            : 'bg-white border border-gray-200 text-textDark hover:bg-background'
                                }`}
                        >
                            {action.icon && <span className="text-sm">{action.icon}</span>}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PageHeader;

