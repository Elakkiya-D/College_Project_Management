import React from 'react';
import { motion } from 'framer-motion';

const SectionCard = ({ title, subtitle, children, className = '' }) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`rounded-2xl border border-textDark/10 bg-white shadow-sm p-6 sm:p-7 ${className}`}
        >
            {(title || subtitle) && (
                <header className="mb-5 sm:mb-6">
                    {title && <h2 className="text-lg font-semibold text-textDark">{title}</h2>}
                    {subtitle && <p className="text-sm text-textMedium mt-1">{subtitle}</p>}
                </header>
            )}
            {children}
        </motion.section>
    );
};

export default SectionCard;
