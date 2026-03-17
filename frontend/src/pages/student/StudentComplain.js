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
    const school = currentUser.school?._id || currentUser.school
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
        <div className="max-w-7xl mx-auto px-6 py-10 w-full animate-fade-in space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Grievance Redressal</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Submit formal concerns or academic inquiries directly to the board.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Form Side (7 cols) */}
                <div className="lg:col-span-7">
                    <ContentCard title="Submission Portal" subtitle="Registry for formal feedback.">
                        <form onSubmit={submitHandler} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Incident Registry Date</label>
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
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Comprehensive Description</label>
                                <TextField
                                    fullWidth
                                    placeholder="Provide detailed context regarding your concern..."
                                    variant="outlined"
                                    value={complaint}
                                    onChange={(event) => setComplaint(event.target.value)}
                                    required
                                    multiline
                                    rows={8}
                                    sx={formStyles}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loader}
                                className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {loader ? <CircularProgress size={18} color="inherit" strokeWidth={5} /> : (
                                    <>
                                        Broadcast Grievance <SendIcon fontSize="inherit" />
                                    </>
                                )}
                            </button>
                        </form>
                    </ContentCard>
                </div>

                {/* Info Side (5 cols) */}
                <div className="lg:col-span-5 space-y-10">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <CampaignIcon className="absolute -top-10 -right-10 text-gray-50 text-[200px] -rotate-12 group-hover:rotate-0 transition-transform duration-1000 select-none opacity-50" />
                        <div className="relative z-10 space-y-8">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
                                <InfoIcon />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Institutional Guidelines</h3>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed italic">
                                    Submissions are reviewed by the specialized committee with strict confidentiality protocols.
                                </p>
                            </div>
                            <ul className="space-y-5 pt-8 border-t border-gray-50">
                                <GuidelineItem text="Identify the core nature of the concern." />
                                <GuidelineItem text="Include all relevant institutional dates." />
                                <GuidelineItem text="Maintain formal communication standards." />
                            </ul>
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-3 ml-1">Regulatory Sync</p>
                        <p className="text-sm font-medium text-gray-300 leading-relaxed italic">
                            System-wide integrity is maintained through verified reporting. False telemetry or data may result in temporary account restrictions.
                        </p>
                    </div>
                </div>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

const GuidelineItem = ({ text }) => (
    <li className="flex items-start gap-4 text-xs font-bold text-gray-600">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></div>
        <span>{text}</span>
    </li>
);

const ContentCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

const formStyles = {
    "& .MuiOutlinedInput-root": {
        borderRadius: '20px',
        backgroundColor: '#fafafa',
        fontSize: '0.875rem',
        fontWeight: '500',
        "& fieldset": { borderColor: '#f1f1f1', borderWidth: '2px' },
        "&:hover fieldset": { borderColor: '#e2e2e2' },
        "&.Mui-focused fieldset": { borderColor: '#2563eb' },
    },
    "& .MuiInputLabel-root": { display: 'none' },
};

export default StudentComplain;