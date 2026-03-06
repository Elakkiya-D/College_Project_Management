import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createFee } from '../../../redux/feeRelated/feeHandle';
import { underControl } from '../../../redux/feeRelated/feeSlice';

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
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL || "http://localhost:5000"}/SclassList/${currentUser._id}`);
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
        <div className="min-h-screen bg-background py-8 px-6 font-sans">
            <div className="mx-auto max-w-7xl flex flex-col items-center">
                <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8 animate-fade-in">
                    <h2 className="text-4xl font-extrabold text-brand tracking-tight">Institutional Billing</h2>
                    <p className="mt-3 text-slate-500 font-bold text-lg bg-white px-4 py-2 rounded-xl inline-block shadow-sm border border-slate-100">
                        Create and distribute fee records to entire student classes.
                    </p>
                </div>

                <div className="w-full sm:max-w-xl animate-slide-up relative z-10">
                    {message && (
                        <div className={`mb-4 px-6 py-4 rounded-xl shadow-md border text-sm font-bold flex items-center justify-between ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            <span>{message.text}</span>
                            <button onClick={() => setMessage('')} className="ml-4 opacity-70 hover:opacity-100 transition-opacity text-xl">&times;</button>
                        </div>
                    )}

                    <div className="bg-white py-10 px-8 shadow-xl rounded-2xl border border-slate-100">
                        <form className="space-y-6" onSubmit={handleInitialSubmit}>
                            <div>
                                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Target Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-yellow-500 font-bold transition-all"
                                    required
                                >
                                    <option value="" disabled>Select Enrollment Group...</option>
                                    {classes.map((sclass) => (
                                        <option key={sclass._id} value={sclass._id}>{sclass.sclassName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Category</label>
                                    <select
                                        name="feeType"
                                        value={feeData.feeType}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-yellow-500 font-bold transition-all"
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
                                <div>
                                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        min="1"
                                        value={feeData.amount}
                                        onChange={handleChange}
                                        className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-yellow-500 font-bold transition-all"
                                        placeholder="5000"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Payment Deadline</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={feeData.dueDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-yellow-500 font-bold transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Invoice Description</label>
                                <textarea
                                    name="remarks"
                                    value={feeData.remarks}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Provide context for this billing cycle..."
                                    className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-yellow-500 font-bold transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || reduxLoading}
                                className="w-full h-14 bg-brand text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-yellow-100 hover:bg-brand/90 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {(loading || reduxLoading) ? "Initializing Distribution..." : "Distribute Fees"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden p-8 space-y-6">
                        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-brand">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirm Distribution</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                You are about to generate <span className="text-brand font-bold">₹{feeData.amount}</span> invoices for all students in the selected class. This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={confirmSubmit} className="flex-[2] h-12 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand transition-all shadow-lg">Confirm & Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddFee;
