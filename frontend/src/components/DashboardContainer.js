import React from 'react';

/**
 * Global Dashboard Alignment Container
 * Enforces strict max-width, horizontal padding, layout spacing, 
 * and ensures it acts as a flexible content zone next to standard sidebars.
 */
const DashboardContainer = ({ children, className = "" }) => {
    return (
        <div className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in ${className}`}>
            {children}
        </div>
    );
};

export default DashboardContainer;
