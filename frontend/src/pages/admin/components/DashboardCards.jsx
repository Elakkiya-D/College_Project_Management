import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

const colorStyles = {
    blue: 'text-blue-700 bg-blue-50 border-blue-100',
    indigo: 'text-indigo-700 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
};

const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.28, ease: 'easeOut' },
    },
};

const DashboardCards = ({ items = [] }) => {
    return (
        <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
            {items.map((item) => (
                <motion.article
                    key={item.title}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, boxShadow: '0 18px 45px -18px rgba(15, 23, 42, 0.35)' }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm min-h-[168px] flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <h3 className="text-[15px] font-medium text-slate-600">{item.title}</h3>
                        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${colorStyles[item.color] || colorStyles.blue}`}>
                            {item.icon}
                        </div>
                    </div>

                    <div className="mt-5 space-y-1.5">
                        <CountUp
                            start={0}
                            end={item.count || 0}
                            duration={1.8}
                            prefix={item.prefix || ''}
                            className="text-3xl font-extrabold text-slate-900"
                        />
                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                            <TrendingUpRoundedIcon sx={{ fontSize: 15 }} />
                            {item.subtext}
                        </p>
                    </div>
                </motion.article>
            ))}
        </motion.div>
    );
};

export default DashboardCards;
