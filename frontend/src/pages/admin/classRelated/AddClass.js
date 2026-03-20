import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff, updateUser, getUserDetails as getClassDetails } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import PageHeader from "../../../components/PageHeader";
import ContentCard from "../../../components/ContentCard";
import AddCardIcon from '@mui/icons-material/AddCard';
import EditIcon from '@mui/icons-material/Edit';
import Popup from "../../../components/Popup";
import { DEFAULT_DEPARTMENTS } from "../../../constants/academics";

const AddClass = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const { status, currentUser, response, error, userDetails } = useSelector(state => state.user);
    const { sclassesList } = useSelector(state => state.sclass);

    const editID = params.id;
    const isEditMode = !!editID;
    const adminID = currentUser._id;
    const address = "Sclass";

    const [level, setLevel] = useState("UG");
    const [category, setCategory] = useState("Engineering");
    const [sclassName, setSclassName] = useState("");
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customName, setCustomName] = useState("");

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // Initial load for options and edit data
    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
        if (isEditMode) {
            dispatch(getClassDetails(editID, "Sclass"));
        }
    }, [adminID, editID, isEditMode, dispatch]);

    // Pre-fill form if editing
    useEffect(() => {
        if (isEditMode && userDetails && userDetails._id === editID) {
            setLevel(userDetails.level || "UG");
            setCategory(userDetails.category || "Engineering");
            
            if (userDetails.isCustom) {
                setIsCustomMode(true);
                setCustomName(userDetails.sclassName);
            } else {
                setIsCustomMode(false);
                setSclassName(userDetails.sclassName);
            }
        }
    }, [userDetails, editID, isEditMode]);

    const departmentOptions = useMemo(() => {
        const seen = new Set();
        const options = [];
        DEFAULT_DEPARTMENTS.forEach(d => {
            if (d.level === level && d.category === category) {
                const key = d.name.trim().toLowerCase();
                if (!seen.has(key)) {
                    seen.add(key);
                    options.push({ value: d.name, label: d.name });
                }
            }
        });
        if (Array.isArray(sclassesList)) {
            sclassesList.forEach(sclass => {
                if (sclass.level === level && sclass.category === category && sclass.isCustom) {
                    const key = (sclass.sclassName || "").trim().toLowerCase();
                    if (!seen.has(key)) {
                        seen.add(key);
                        options.push({ value: sclass.sclassName, label: sclass.sclassName + " (Custom)" });
                    }
                }
            });
        }
        return options;
    }, [level, category, sclassesList]);

    useEffect(() => {
        if (!isCustomMode && !isEditMode) {
            if (departmentOptions.length > 0) {
                setSclassName(departmentOptions[0].value);
            } else {
                setSclassName("");
            }
        }
    }, [departmentOptions, isCustomMode, isEditMode]);

    const fields = {
        sclassName: isCustomMode ? customName : sclassName,
        category,
        level,
        isCustom: isCustomMode,
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        if (isEditMode) {
            dispatch(updateUser(fields, editID, "Sclass"));
        } else {
            dispatch(addStuff(fields, address));
        }
    };

    useEffect(() => {
        if (status === 'added') {
            setMessage(isEditMode ? "Department Updated" : "Department Created");
            setShowPopup(true);
            setTimeout(() => {
                navigate("/Admin/classes");
                dispatch(underControl());
                setLoader(false);
            }, 1000);
        }
        else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
        else if (status === 'error') {
            setMessage(String(error || "Network Error"));
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch, isEditMode]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title={isEditMode ? "Modify Department" : "Create New Department"}
                subtitle={isEditMode ? "Update the configuration for an existing department pipeline." : "Initialize a new educational department module."}
                actions={[{ label: 'Return', variant: 'secondary', onClick: () => navigate(-1) }]}
            />

            <div className="mt-8 animate-slide-up max-w-3xl mx-auto">
                <ContentCard>
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            {isEditMode ? <EditIcon /> : <AddCardIcon />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-textDark">Configuration Parameters</h3>
                            <p className="text-sm font-medium text-textDark/60">Configure the department taxonomy and classification.</p>
                        </div>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            <Dropdown label="Academic Level" value={level} onChange={setLevel}>
                                <option value="UG">Undergraduate (UG)</option>
                                <option value="PG">Postgraduate (PG)</option>
                            </Dropdown>
                            <Dropdown label="Dept. Category" value={category} onChange={setCategory}>
                                <option value="Engineering">Engineering</option>
                                <option value="Arts">Arts</option>
                                <option value="Science">Science</option>
                                <option value="Commerce">Commerce & Management</option>
                            </Dropdown>
                        </div>

                        <div className="flex gap-4 p-1 bg-gray-50 rounded-xl w-fit">
                            <TabBtn active={!isCustomMode} onClick={() => setIsCustomMode(false)}>Predefined</TabBtn>
                            <TabBtn active={isCustomMode} onClick={() => setIsCustomMode(true)}>Custom</TabBtn>
                        </div>

                        <div className="mt-4">
                            {!isCustomMode ? (
                                <Dropdown label="Select Department Name" value={sclassName} onChange={setSclassName} required>
                                    <option value="" disabled>Choose department...</option>
                                    {departmentOptions.map((dept) => <option key={dept.value} value={dept.value}>{dept.label}</option>)}
                                </Dropdown>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-blue-600 block">Manual Department Name</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="e.g. B.Tech Cyber Security"
                                        className="w-full px-4 py-3 bg-white rounded-xl border-2 border-blue-100 focus:border-blue-600 outline-none font-bold text-gray-800 transition-all shadow-sm"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loader}
                                className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loader ? 'Processing...' : isEditMode ? 'Update Configuration' : 'Confirm & Create'}
                            </button>
                        </div>
                    </form>
                </ContentCard>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    )
}

const Dropdown = ({ label, value, onChange, children, required }) => (
    <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-4 py-3.5 bg-white rounded-xl border border-black/5 outline-none font-bold text-gray-800 shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20">
            {children}
        </select>
    </div>
);

const TabBtn = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
        {children}
    </button>
);

export default AddClass;