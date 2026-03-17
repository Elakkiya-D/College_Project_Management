import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import AddCardIcon from '@mui/icons-material/AddCard';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ModuleLayout from '../../../components/ModuleLayout';

const ShowFees = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/fees/list`);
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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fee record?")) return;
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/admin/fees/delete/${id}`);
            setFees(fees.filter(fee => fee._id !== id));
        } catch (error) {
            console.error("Error deleting fee:", error);
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
                                    <button
                                        onClick={() => handleDelete(fee._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl border border-gray-100 hover:border-red-100 transition-all shadow-sm"
                                    >
                                        <DeleteForeverIcon fontSize="small" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ModuleLayout>
    );

};

export default ShowFees;
