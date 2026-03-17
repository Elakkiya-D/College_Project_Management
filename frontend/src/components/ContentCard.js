import React from 'react';

/**
 * ContentCard - Professional SaaS-style card component.
 * Follows strict design system rules: rounded-xl, shadow-md, bg-surface, p-6, space-y-6.
 */
const ContentCard = ({ title, children, subtitle, className = "" }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-textDark/10 p-6 space-y-6 animate-fade-in ${className}`}>
            {(title || subtitle) && (
                <div className="flex flex-col space-y-1">
                    {title && <h3 className="text-xl font-semibold text-textDark tracking-tight">{title}</h3>}
                    {subtitle && <p className="text-sm font-medium text-textMedium">{subtitle}</p>}
                </div>
            )}
            <div className="w-full">
                {children}
            </div>
        </div>
    );
};

export default ContentCard;

