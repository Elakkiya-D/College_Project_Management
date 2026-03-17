import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createFee } from '../../../redux/feeRelated/feeHandle';
import { underControl } from '../../../redux/feeRelated/feeSlice';
import FormLayout from '../../../components/FormLayout';

const AddFee = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { status, response, error, loading: reduxLoading } = useSelector(state => state.fee);

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const [feeData, setFeeData] = useState({
        feeType: 'Tuition Fee',
        amount: '',
        dueDate: '',
        remarks: ''
    });

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${currentUser._id}`);
                if (!result.data.message) {
                    setClasses(result.data);
                }
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };
        fetchClasses();
    }, [currentUser._id]);

    useEffect(() => {
        if (status === 'added') {
            setMessage({ text: "Fees assigned successfully", type: 'success' });
            setLoading(false);
            setTimeout(() => {
                navigate('/Admin/fees');
                dispatch(underControl());
            }, 2000);
        } else if (response || error) {
            setMessage({ text: response || error, type: 'error' });
            setLoading(false);
        }
    }, [status, response, error, navigate, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeeData({ ...feeData, [name]: value });
    };

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        setLoading(true);
        setMessage('');

        const dataToSubmit = {
            title: feeData.feeType,
            amount: Number(feeData.amount),
            sclassName: selectedClass,
            school: currentUser._id,
            description: feeData.remarks,
            dueDate: feeData.dueDate,
            adminID: currentUser._id
        };

        dispatch(createFee(dataToSubmit));
    };

    return (
        <FormLayout
            title="Institutional Billing"
            subtitle="Create and distribute fee records to entire departments."
            headerActions={[
                { label: 'Back to Fees', variant: 'secondary', onClick: () => navigate('/Admin/fees') }
            ]}
        >
            <form className="space-y-8" onSubmit={handleInitialSubmit}>
                {message && (
                    <div className={`px-5 py-3 rounded-lg border text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Enrollment Group (Dept)</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                            required
                        >
                            <option value="" disabled>Select a department...</option>
                            {classes.map((sclass) => (
                                <option key={sclass._id} value={sclass._id}>{sclass.sclassName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Fee Category</label>
                        <select
                            name="feeType"
                            value={feeData.feeType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                            required
                        >
                            <option value="Tuition Fee">Tuition Fee</option>
                            <option value="Library Fee">Library Fee</option>
                            <option value="Transport Fee">Transport Fee</option>
                            <option value="Hostel Fee">Hostel Fee</option>
                            <option value="Activity Fee">Activity Fee</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Billing Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            min="1"
                            value={feeData.amount}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                            placeholder="e.g. 5000"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Payment Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={feeData.dueDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white font-sans"
                            required
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Internal Billing Remarks</label>
                        <textarea
                            name="remarks"
                            value={feeData.remarks}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Provide details for this billing cycle..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={loading || reduxLoading}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {(loading || reduxLoading) ? "Initializing..." : "Distribute Invoices"}
                    </button>
                </div>

                {showConfirm && (
                    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                        <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-8 space-y-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">Confirm Billing Distribution</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    You are about to generate <span className="text-blue-600 font-bold">₹{feeData.amount}</span> invoices. This operation cannot be reversed.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all">Cancel</button>
                                <button onClick={confirmSubmit} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-all shadow-sm">Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </FormLayout>
    );
};

export default AddFee;
