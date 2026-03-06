import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import AddCardIcon from '@mui/icons-material/AddCard';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const ShowFees = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [feeToDelete, setFeeToDelete] = useState(null);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/api/admin/fees/list`);
                if (result.data.message) {
                    setFees([]);
                } else {
                    setFees(result.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching fees:", error);
                setLoading(false);
            }
        };
        fetchFees();
    }, []);

    const deleteHandler = (id) => {
        setFeeToDelete(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (!feeToDelete) return;
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/api/admin/fees/delete/${feeToDelete}`);
            setFees(fees.filter(fee => fee._id !== feeToDelete));
            setShowConfirm(false);
            setFeeToDelete(null);
        } catch (error) {
            console.error("Error deleting fee:", error);
            setShowConfirm(false);
            setFeeToDelete(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            {/* Header Section */}
            <PageHeader
                title="Fees Management"
                subtitle="Track and manage student tuition fees, receipts, and payment statuses."
                actions={[
                    {
                        label: 'Add New Fee',
                        variant: 'primary',
                        icon: <AddCardIcon fontSize="small" />,
                        onClick: () => navigate("/Admin/addfee")
                    }
                ]}
            />

            {/* Content Section */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <svg className="animate-spin h-10 w-10 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : fees.length === 0 ? (
                <ContentCard className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 border border-black/5 shadow-inner">
                        <CurrencyRupeeIcon className="text-brand/40" style={{ fontSize: 40 }} />
                    </div>
                    <h3 className="text-2xl font-black text-textDark mb-2">No Fee Records Found</h3>
                    <p className="text-textDark/60 max-w-sm mb-8 font-medium">Your fee registry is currently empty. Start by adding a fee record for a student or class.</p>
                    <button
                        onClick={() => navigate("/Admin/addfee")}
                        className="px-8 py-3 bg-brand text-white font-semibold rounded-xl shadow-md hover:bg-brand/90 hover:-translate-y-[1px] transition-all"
                    >
                        Create First Fee Entry
                    </button>
                </ContentCard>
            ) : (
                <div className="bg-white rounded-2xl shadow-md border border-textDark/5 overflow-hidden">
                    <table className="min-w-full divide-y divide-black/5">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-black text-textDark/40 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-textDark/40 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-textDark/40 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-textDark/40 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-left text-xs font-black text-textDark/40 uppercase tracking-widest">Due Date</th>
                                <th className="px-8 py-5 text-right text-xs font-black text-textDark/40 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {fees.map((fee) => (
                                <tr key={fee._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <p className="text-sm font-black text-textDark">{fee.studentId?.name || '---'}</p>
                                        <p className="text-[10px] font-bold text-textDark/30 uppercase tracking-tighter">Roll: {fee.studentId?.rollNum}</p>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-textDark/40 bg-background px-2 py-0.5 rounded-full border border-black/5">{fee.feeId?.title}</span>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <p className="text-sm font-black text-gray-800 italic">₹{fee.amount}</p>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${fee.status === 'paid'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <p className="text-xs font-bold text-textDark/50">{new Date(fee.feeId?.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap text-right text-sm">
                                        <button
                                            onClick={() => deleteHandler(fee._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl border border-gray-200 hover:border-red-200 transition-all shadow-sm"
                                        >
                                            <DeleteForeverIcon fontSize="small" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showConfirm && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden p-8 space-y-6">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                            <DeleteForeverIcon fontSize="large" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirm Deletion</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                Are you sure you want to delete this fee record? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={confirmDelete} className="flex-[2] h-12 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default ShowFees;
