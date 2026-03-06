import { useEffect, useState } from 'react';
import { CircularProgress, TextField } from '@mui/material';
import Popup from '../../components/Popup';
import { addStuff } from '../../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';
import CampaignIcon from '@mui/icons-material/Campaign';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';

const StudentComplain = () => {
    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState("");

    const dispatch = useDispatch()
    const { status, currentUser, error } = useSelector(state => state.user);

    const user = currentUser._id
    const school = currentUser.school._id
    const address = "Complain"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = { user, date, complaint, school };

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false)
            setShowPopup(true)
            setMessage("Grievance submitted successfully. The administration will review it shortly.")
            setComplaint("");
            setDate("");
        }
        else if (error) {
            setLoader(false)
            setShowPopup(true)
            setMessage("Network Error. Please try again later.")
        }
    }, [status, error])

    return (
        <div className="max-w-7xl mx-auto px-8 py-8 w-full animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Grievance Redressal</h1>
                    <p className="text-sm text-gray-500 tracking-wide">
                        Submit your concerns or formal complaints directly to the institutional board.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Side (7 cols) */}
                <div className="lg:col-span-7">
                    <DashboardCard title="Submission Portal" subtitle="Formalize your feedback or concern.">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incident Date</label>
                                <TextField
                                    fullWidth
                                    type="date"
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    sx={formStyles}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Description</label>
                                <TextField
                                    fullWidth
                                    placeholder="Please provide a clear and concise description of your grievance..."
                                    variant="outlined"
                                    value={complaint}
                                    onChange={(event) => setComplaint(event.target.value)}
                                    required
                                    multiline
                                    rows={6}
                                    sx={formStyles}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loader}
                                className="w-full h-14 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand/20 hover:bg-brand/90 hover:shadow-yellow-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {loader ? <CircularProgress size={20} color="inherit" /> : (
                                    <>
                                        Submit Grievance <SendIcon fontSize="small" />
                                    </>
                                )}
                            </button>
                        </form>
                    </DashboardCard>
                </div>

                {/* Info Side (5 cols) */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden group">
                        <CampaignIcon className="absolute -top-6 -right-6 text-yellow-50 text-[160px] -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-brand border border-yellow-100">
                                <InfoIcon />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">University Guidelines</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                    Your grievances are handled with complete confidentiality and priority. Please ensure all details are accurate to facilitate a faster resolution.
                                </p>
                            </div>
                            <ul className="space-y-4 pt-4 border-t border-slate-100">
                                <GuidelineItem text="Identify the exact nature of the concern." />
                                <GuidelineItem text="Mention relevant dates and modules involved." />
                                <GuidelineItem text="Provide concrete details for faster verification." />
                            </ul>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-800 rounded-3xl text-white shadow-xl shadow-slate-200">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300 mb-2">Notice</p>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">
                            False or misleading submissions may delay the resolution process for other students. Please adhere to the ethical conduct guidelines.
                        </p>
                    </div>
                </div>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

const GuidelineItem = ({ text }) => (
    <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
        <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
        {text}
    </li>
);

const DashboardCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const formStyles = {
    "& .MuiOutlinedInput-root": {
        borderRadius: '16px',
        backgroundColor: '#f8fafc',
        "& fieldset": { borderColor: '#e2e8f0' },
        "&:hover fieldset": { borderColor: '#ca8a04' },
        "&.Mui-focused fieldset": { borderColor: '#ca8a04' },
    },
    "& .MuiInputLabel-root": { display: 'none' },
};

export default StudentComplain;