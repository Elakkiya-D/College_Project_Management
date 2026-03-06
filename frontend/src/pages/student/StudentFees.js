import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentFees } from '../../redux/feeRelated/feeHandle';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import PaymentIcon from '@mui/icons-material/Payment';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

const StudentFees = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { feesList, loading } = useSelector(state => state.fee);

    const [selectedFee, setSelectedFee] = useState(null);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        dispatch(getStudentFees(currentUser._id));
    }, [dispatch, currentUser._id]);

    const handlePayNow = (fee) => {
        setSelectedFee(fee);
        setShowPayment(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-8 py-8 w-full animate-fade-in pb-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-sm text-gray-500 tracking-wide">
                        Manage your academic tuition, library dues, and recurring institutional fees.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-yellow-100 border-t-yellow-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-brand uppercase tracking-widest">Auditing Accounts...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Fees List */}
                    <div className="lg:col-span-8 space-y-6">
                        <DashboardCard title="Active Invoices" subtitle="Pending payments required for current semester.">
                            <div className="space-y-4">
                                {feesList && feesList.length > 0 && !feesList.empty ? (
                                    feesList.map((item, index) => (
                                        <FeeRow
                                            key={index}
                                            fee={item}
                                            onPay={() => handlePayNow(item)}
                                        />
                                    ))
                                ) : (
                                    <div className="py-12 flex flex-col items-center text-center space-y-4 text-slate-400">
                                        <AccountBalanceWalletIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                                        <p className="font-bold text-sm">No active fees assigned to your account.</p>
                                    </div>
                                )}
                            </div>
                        </DashboardCard>
                    </div>

                    {/* Stats & Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                            <AccountBalanceWalletIcon className="absolute -bottom-4 -right-4 text-white/5 text-9xl group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-10 space-y-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Total Outstanding</p>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black tracking-tight">
                                        ₹{feesList && !feesList.empty ? feesList.filter(f => f.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0) : 0}
                                    </h2>
                                    <p className="text-xs font-medium text-white/50 tracking-wide italic leading-relaxed">
                                        Clear outstanding balances to avoid registration holds for next semester modules.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <HistoryIcon fontSize="small" /> Account History
                            </h3>
                            <div className="space-y-3">
                                <TimelineItem label="Invoices Generated" value={feesList && !feesList.empty ? feesList.length : 0} />
                                <TimelineItem label="Payments Completed" value={feesList && !feesList.empty ? feesList.filter(f => f.status === 'paid').length : 0} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal/Overlay */}
            {showPayment && selectedFee && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in shadow-2xl">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="bg-brand p-8 text-white relative">
                            <button
                                onClick={() => setShowPayment(false)}
                                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white border border-white/10"
                            >
                                <CloseIcon />
                            </button>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Authorize Payment</p>
                                <h2 className="text-2xl font-black tracking-tight">{selectedFee.feeId.title}</h2>
                                <p className="text-4xl font-black tracking-tighter pt-4">₹{selectedFee.amount}</p>
                            </div>
                        </div>
                        <div className="p-10">
                            <Elements stripe={stripePromise}>
                                <PaymentForm
                                    studentFeeId={selectedFee._id}
                                    onSuccess={() => {
                                        setShowPayment(false);
                                        dispatch(getStudentFees(currentUser._id));
                                    }}
                                    onClose={() => setShowPayment(false)}
                                />
                            </Elements>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FeeRow = ({ fee, onPay }) => {
    const isPaid = fee.status === 'paid';
    return (
        <div className={`p-6 rounded-2xl border transition-all duration-300 flex items-center gap-6 group ${isPaid ? 'bg-slate-50 border-slate-100 opacity-80' : 'bg-white border-slate-100 hover:border-yellow-200 hover:shadow-md'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${isPaid ? 'bg-surface text-brand border-yellow-100' : 'bg-slate-50 text-slate-400 border-slate-200 group-hover:bg-brand group-hover:text-white group-hover:border-yellow-600'}`}>
                <PaymentIcon />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-800 truncate tracking-tight">{fee.feeId.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Due: {new Date(fee.feeId.dueDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={isPaid ? 'text-green-500' : 'text-amber-500'}>{fee.status}</span>
                </div>
            </div>
            <div className="text-right shrink-0 px-4">
                <p className="text-lg font-black text-slate-800 tracking-tighter">₹{fee.amount}</p>
            </div>
            {!isPaid && (
                <button
                    onClick={onPay}
                    className="h-10 px-6 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand hover:-translate-y-0.5 transition-all shadow-sm"
                >
                    Pay Now
                </button>
            )}
            {isPaid && (
                <div className="h-10 px-6 bg-surface text-brand rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-yellow-100 cursor-default">
                    Paid ✅
                </div>
            )}
        </div>
    );
};

const TimelineItem = ({ label, value }) => (
    <div className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-none last:pb-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-slate-800">{value}</span>
    </div>
);

const DashboardCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default StudentFees;
