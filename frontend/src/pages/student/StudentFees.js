import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentFees } from '../../redux/feeRelated/feeHandle';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import PaymentIcon from '@mui/icons-material/Payment';

const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

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

    const outstandingBalance = feesList && !feesList.empty
        ? feesList.filter(f => f.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0)
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 w-full animate-fade-in space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Analytical summary of your academic tuition and auxiliary fee obligations.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center flex-col items-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Auditing Accounts...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Fees List */}
                    <div className="lg:col-span-8 space-y-8">
                        <ContentCard title="Invoice Registry" subtitle="Active institutional payment requests.">
                            <div className="space-y-6">
                                {feesList && feesList.length > 0 && !feesList.empty ? (
                                    feesList.map((item, index) => (
                                        <FeeRow
                                            key={index}
                                            fee={item}
                                            onPay={() => handlePayNow(item)}
                                        />
                                    ))
                                ) : (
                                    <div className="py-16 flex flex-col items-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner">
                                            <AccountBalanceWalletIcon className="text-gray-300" fontSize="large" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold text-gray-900">Account Balanced</p>
                                            <p className="text-sm text-gray-500 font-medium italic">No active or pending invoices found in your registry.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ContentCard>
                    </div>

                    {/* Stats & Sidebar */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="p-10 bg-gradient-to-br from-gray-800 to-gray-950 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-gray-800">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="relative z-10 space-y-8">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 ml-1">Aggregate Balance</p>
                                <div className="space-y-3">
                                    <h2 className="text-5xl font-bold tracking-tighter">
                                        ₹{outstandingBalance.toLocaleString()}
                                    </h2>
                                    <p className="text-sm font-medium text-gray-400 leading-relaxed italic">
                                        Active semester obligations. Complete payments to ensure continuous system access.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 px-1">
                                <HistoryIcon fontSize="inherit" className="text-gray-300" /> Transactional Telemetry
                            </h3>
                            <div className="space-y-4">
                                <TimelineItem label="Invoices Staged" value={feesList && !feesList.empty ? feesList.length : 0} />
                                <TimelineItem label="Settlements Validated" value={feesList && !feesList.empty ? feesList.filter(f => f.status === 'paid').length : 0} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Payment Modal */}
            {showPayment && selectedFee && (
                <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-gray-100">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white relative">
                            <button
                                onClick={() => setShowPayment(false)}
                                className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white border border-white/10 shadow-inner group"
                            >
                                <CloseIcon className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60 ml-1">System Authorization</p>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">{selectedFee.feeId.title}</h2>
                                    <p className="text-xs font-medium text-blue-100/60 uppercase tracking-widest">{selectedFee.feeId.feeType} | Semester Installment</p>
                                </div>
                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-5xl font-bold tracking-tighter">₹{selectedFee.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 bg-gray-50/50">
                            {stripePromise ? (
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
                            ) : (
                                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-[11px] font-bold text-red-700">
                                    Stripe is not configured. Set <span className="font-black">REACT_APP_STRIPE_PUBLIC_KEY</span> in your frontend environment and restart the frontend.
                                </div>
                            )}
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
        <div className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-6 group ${isPaid ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-gray-50 hover:border-blue-100 hover:shadow-md'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${isPaid ? 'bg-white text-gray-300 border-gray-100' : 'bg-gray-50 text-gray-400 border-gray-50 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-700 shadow-inner'}`}>
                <PaymentIcon fontSize="small" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-base font-bold text-gray-900 truncate tracking-tight uppercase">{fee.feeId.title}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><HistoryIcon sx={{ fontSize: 12 }} /> Due: {new Date(fee.feeId.dueDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={isPaid ? 'text-green-600' : 'text-amber-500'}>{fee.status}</span>
                </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                <div className="text-right whitespace-nowrap px-4 border-r border-gray-100 sm:border-none">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valuation</p>
                    <p className="text-xl font-bold text-gray-900 tracking-tighter">₹{fee.amount.toLocaleString()}</p>
                </div>
                <div className="shrink-0">
                    {!isPaid ? (
                        <button
                            onClick={onPay}
                            className="h-11 px-6 bg-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-lg active:translate-y-0"
                        >
                            Authorize
                        </button>
                    ) : (
                        <div className="h-11 px-6 bg-green-50 text-green-700 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 border border-green-100 cursor-default shadow-sm italic">
                            Validated
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TimelineItem = ({ label, value }) => (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-none last:pb-0">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
);

const ContentCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

const CloseIcon = ({ className }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default StudentFees;
