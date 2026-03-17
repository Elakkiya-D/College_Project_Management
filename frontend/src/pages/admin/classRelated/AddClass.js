import React, { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import PageHeader from "../../../components/PageHeader";
import ContentCard from "../../../components/ContentCard";
import AddCardIcon from '@mui/icons-material/AddCard';
import Popup from "../../../components/Popup";
import { DEPARTMENTS } from "../../../constants/academics";

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;

    const adminID = currentUser._id
    const address = "Sclass"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const departmentOptions = useMemo(() => {
        const seen = new Set();
        return DEPARTMENTS.filter(d => {
            const key = (d?.value || "").trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, []);

    const fields = {
        sclassName,
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added' && tempDetails) {
            navigate("/Admin/classes/class/" + tempDetails._id)
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch, tempDetails]);
    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title="Create New Department"
                subtitle="Create a new department to begin enrolling students and assigning courses."
                actions={[
                    {
                        label: 'Cancel',
                        variant: 'secondary',
                        onClick: () => navigate(-1)
                    }
                ]}
            />

            <div className="mt-8 animate-slide-up max-w-2xl mx-auto">
                <ContentCard>
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <AddCardIcon />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-textDark">Department Identification</h3>
                            <p className="text-sm font-medium text-textDark/60">Names must be unique throughout the system.</p>
                        </div>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Department (Dept)</label>
                                <select
                                    value={sclassName}
                                    onChange={(event) => setSclassName(event.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
                                >
                                    <option value="" disabled>Select a department...</option>
                                    {departmentOptions.map((dept) => (
                                        <option key={dept.value} value={dept.value}>
                                            {dept.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loader}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                            >
                                {loader ? <CircularProgress size={20} color="inherit" /> : 'Create Department'}
                            </button>
                        </div>
                    </form>
                </ContentCard>
            </div>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    )
}

export default AddClass;