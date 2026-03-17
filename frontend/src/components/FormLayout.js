import React from 'react';
import PageHeader from './PageHeader';
import ContentCard from './ContentCard';
import DashboardContainer from './DashboardContainer';

/**
 * FormLayout - Reusable standardized form container for Admin Panel.
 * Implements the 10,000% polished enterprise SaaS design system.
 */
const FormLayout = ({
    title,
    subtitle,
    headerActions = [],
    children,
    maxWidth = "max-w-4xl"
}) => {
    return (
        <DashboardContainer>
            <div className={`${maxWidth} mx-auto w-full animate-fade-in`}>
                <PageHeader
                    title={title}
                    subtitle={subtitle}
                    actions={headerActions}
                />

                <div className="mt-6 sm:mt-8">
                    <ContentCard className="p-5 sm:p-8 space-y-8">
                        {children}
                    </ContentCard>
                </div>
            </div>
        </DashboardContainer>
    );
};

export default FormLayout;
