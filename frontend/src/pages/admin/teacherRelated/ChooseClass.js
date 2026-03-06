import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import ClassIcon from '@mui/icons-material/Class';
import TableTemplate from '../../../components/TableTemplate';

const ChooseClass = ({ situation }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error)
    }

    const navigateHandler = (classID) => {
        if (situation === "Teacher") {
            navigate("/Admin/teachers/choosesubject/" + classID)
        }
        else if (situation === "Subject") {
            navigate("/Admin/addsubject/" + classID)
        }
    }

    const sclassColumns = [
        { id: 'name', label: 'Class Name', minWidth: 170 },
    ]

    const sclassRows = sclassesList && sclassesList.length > 0 && sclassesList.map((sclass) => {
        return {
            name: sclass.sclassName,
            id: sclass._id,
        };
    })

    const SclassButtonHaver = ({ row }) => {
        return (
            <div className="flex justify-end pr-4">
                <button
                    onClick={() => navigateHandler(row.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md transition-all"
                >
                    <ClassIcon fontSize="small" /> Select
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
            <PageHeader
                title="Select Deployment Class"
                subtitle={`Assign to a specific student group for ${situation === 'Teacher' ? 'Teaching' : 'Subject'} allocation.`}
                actions={[
                    {
                        label: 'Go Back',
                        variant: 'secondary',
                        onClick: () => navigate(-1)
                    }
                ]}
            />
            {loading ? (
                <div className="flex justify-center items-center py-40">
                    <svg className="animate-spin h-12 w-12 text-brand" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <div className="mt-8 animate-slide-up">
                    {getresponse ? (
                        <ContentCard className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
                                <ClassIcon className="text-accent" style={{ fontSize: 40 }} />
                            </div>
                            <h3 className="text-2xl font-black text-textDark mb-2">No Classes Configured</h3>
                            <p className="text-textDark/60 max-w-sm mb-8 font-medium">Create a class structurally before allocating staff to it.</p>
                            <button
                                onClick={() => navigate("/Admin/addclass")}
                                className="px-8 py-3 bg-brand text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all"
                            >
                                Setup First Class
                            </button>
                        </ContentCard>
                    ) : (
                        <ContentCard title="Available Classes" subtitle="Select a target class to proceed with assignment.">
                            <div className="border border-black/5 rounded-2xl overflow-hidden mt-4 shadow-sm">
                                {Array.isArray(sclassesList) && sclassesList.length > 0 &&
                                    <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
                                }
                            </div>
                        </ContentCard>
                    )}
                </div>
            )}
        </div>
    );
}

export default ChooseClass