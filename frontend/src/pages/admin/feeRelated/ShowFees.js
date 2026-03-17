import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddCardIcon from '@mui/icons-material/AddCard';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CloseIcon from '@mui/icons-material/Close';
import ModuleLayout from '../../../components/ModuleLayout';
import { getApiErrorMessage, getApiUrl } from '../../../utils/api';

const ShowFees = () => {
    const navigate = useNavigate();
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [paymentType, setPaymentType] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [submittingReceipt, setSubmittingReceipt] = useState(false);

    const loadFees = useCallback(async () => {
        try {
            const result = await axios.get(getApiUrl('/api/admin/fees/list'));
            if (result.data.message) {
                setFees([]);
                setErrorMessage(result.data.message);
            } else {
                setFees(result.data);
                setErrorMessage('');
            }
            setLoading(false);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, 'Unable to load the fee registry.'));
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFees();
    }, [loadFees]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fee record?")) return;
        try {
            await axios.delete(getApiUrl(`/api/admin/fees/delete/${id}`));
            setFees(fees.filter(fee => fee._id !== id));
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, 'Unable to delete the fee record.'));
        }
    };

    const openReceiptModal = (fee) => {
        setSelectedFee(fee);
        setPaymentType('cash');
        setPaymentReference('');
        setShowReceiptModal(true);
    };

    const handleCreateReceipt = async () => {
        if (!selectedFee) return;

        setSubmittingReceipt(true);
        try {
            const result = await axios.post(getApiUrl('/api/fees/create'), {
                studentFeeId: selectedFee._id,
                paymentType,
                paymentReference: paymentReference.trim() || undefined,
            });

            if (result.data?.receipt?._id) {
                await loadFees();
                setShowReceiptModal(false);
                setSelectedFee(null);
            }
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, 'Unable to generate the receipt.'));
        } finally {
            setSubmittingReceipt(false);
        }
    };

    return (
        <ModuleLayout
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
            loading={loading}
            isEmpty={fees.length === 0}
            emptyTitle="No Fee Records Found"
            emptySubtitle="Your fee registry is currently empty. Start by adding a fee record for a student or department."
            emptyIcon={<CurrencyRupeeIcon />}
            emptyAction={() => navigate("/Admin/addfee")}
            emptyActionLabel="Create First Fee Entry"
        >
            {errorMessage && (
                <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                    {errorMessage}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Student</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Due Date</th>
                            <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {fees.map((fee) => (
                            <tr key={fee._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4 whitespace-nowrap">
                                    <p className="text-sm font-semibold text-gray-900">{fee.studentId?.name || '---'}</p>
                                    <p className="text-xs text-gray-400">Roll: {fee.studentId?.rollNum}</p>
                                </td>
                                <td className="px-8 py-4 whitespace-nowrap">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                        {fee.feeId?.title}
                                    </span>
                                </td>
                                <td className="px-8 py-4 whitespace-nowrap">
                                    <p className="text-sm font-bold text-gray-800 italic">₹{fee.amount}</p>
                                </td>
                                <td className="px-8 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${fee.status === 'paid'
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                        {fee.status}
                                    </span>
                                </td>
                                <td className="px-8 py-4 whitespace-nowrap">
                                    <p className="text-xs font-medium text-gray-500">
                                        {new Date(fee.feeId?.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </td>
                                <td className="px-8 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {fee.receiptId ? (
                                            <button
                                                onClick={() => navigate(`/Admin/fees/receipt/${fee.receiptId?._id || fee.receiptId}`)}
                                                className="px-3 h-9 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2"
                                            >
                                                <ReceiptLongIcon sx={{ fontSize: 16 }} /> Receipt
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => openReceiptModal(fee)}
                                                className="px-3 h-9 rounded-lg border border-gray-200 bg-white text-gray-700 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
                                            >
                                                {fee.status === 'paid' ? (
                                                    <>
                                                        <TaskAltIcon sx={{ fontSize: 16 }} /> Generate
                                                    </>
                                                ) : (
                                                    <>
                                                        <ReceiptLongIcon sx={{ fontSize: 16 }} /> Record
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(fee._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl border border-gray-100 hover:border-red-100 transition-all shadow-sm"
                                        >
                                            <DeleteForeverIcon fontSize="small" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showReceiptModal && selectedFee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-6">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Payment Capture</p>
                                <h3 className="text-lg font-bold text-gray-900">Generate Receipt</h3>
                            </div>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>
                        <div className="px-8 py-6 space-y-6">
                            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                                <p className="text-xs font-semibold text-gray-800">{selectedFee.studentId?.name}</p>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400">{selectedFee.feeId?.title}</p>
                                <p className="text-xs font-bold text-gray-600">₹{selectedFee.amount}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Payment Method</label>
                                <select
                                    value={paymentType}
                                    onChange={(event) => setPaymentType(event.target.value)}
                                    className="w-full h-12 rounded-2xl border border-gray-200 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="card">Card</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reference (Optional)</label>
                                <input
                                    value={paymentReference}
                                    onChange={(event) => setPaymentReference(event.target.value)}
                                    placeholder="Transaction ID / Reference"
                                    className="w-full h-12 rounded-2xl border border-gray-200 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="h-12 px-6 rounded-2xl border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateReceipt}
                                disabled={submittingReceipt}
                                className="h-12 px-6 rounded-2xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-60"
                            >
                                {submittingReceipt ? 'Generating...' : 'Generate Receipt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModuleLayout>
    );

};

export default ShowFees;
