import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import FormLayout from "../../../components/FormLayout";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "" }]);

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const { status, currentUser, response } = useSelector(state => state.user);

    const sclassName = params.id
    const adminID = currentUser._id
    const address = "Subject"

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const handleSubjectNameChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subName = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSubjectCodeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subCode = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSessionsChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].sessions = event.target.value || 0;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "" }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const fields = {
        sclassName,
        subjects: subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        })),
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error encountered. Please try again.")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, response, dispatch]);

    return (
        <FormLayout
            title="Create New Subjects"
            subtitle="Register academic modules. You can add multiple subjects simultaneously."
            headerActions={[
                {
                    label: 'Back to List',
                    variant: 'secondary',
                    onClick: () => navigate(-1)
                }
            ]}
        >
            <form onSubmit={submitHandler} className="space-y-10">
                <div className="space-y-12">
                    {subjects.map((subject, index) => (
                        <div key={index} className="relative animate-fade-in">
                            {/* Entry Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand bg-surface px-3 py-1 rounded-md">
                                    Subject Entry #{index + 1}
                                </h4>
                                {subjects.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveSubject(index)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Remove Entry"
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </button>
                                )}
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <FormInput
                                    label="Subject Name"
                                    placeholder="e.g. Advanced Mathematics"
                                    value={subject.subName}
                                    onChange={handleSubjectNameChange(index)}
                                    required
                                />
                                <FormInput
                                    label="Subject Code"
                                    placeholder="e.g. MATH-401"
                                    value={subject.subCode}
                                    onChange={handleSubjectCodeChange(index)}
                                    required
                                />
                                <FormInput
                                    label="Weekly Sessions"
                                    placeholder="e.g. 5"
                                    type="number"
                                    value={subject.sessions}
                                    onChange={handleSessionsChange(index)}
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Separator */}
                            {index < subjects.length - 1 && <div className="mt-12 pt-1 border-t border-slate-100" />}
                        </div>
                    ))}
                </div>

                {/* Secondary Action: Add Another */}
                <div className="flex justify-start">
                    <button
                        type="button"
                        onClick={handleAddSubject}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand hover:text-yellow-800 bg-surface hover:bg-yellow-100 px-6 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-sm"
                    >
                        <AddIcon fontSize="small" /> Add Another Subject
                    </button>
                </div>

                {/* Form Footer Actions */}
                <div className="flex justify-end items-center gap-4 pt-8 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="h-12 px-8 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <CloseIcon fontSize="small" /> Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loader}
                        className="h-12 px-10 bg-brand text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-yellow-100 hover:bg-brand/90 hover:shadow-brand/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loader ? <CircularProgress size={20} color="inherit" /> : (
                            <>
                                <SaveIcon fontSize="small" /> Save Curriculum
                            </>
                        )}
                    </button>
                </div>
            </form>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </FormLayout>
    );
}

const FormInput = ({ label, placeholder, value, onChange, type = "text", required, min }) => (
    <div className="flex flex-col space-y-2 group">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-brand transition-colors">
            {label}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            className="h-12 w-full px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-yellow-500 focus:bg-white transition-all shadow-sm"
        />
    </div>
);

export default SubjectForm;