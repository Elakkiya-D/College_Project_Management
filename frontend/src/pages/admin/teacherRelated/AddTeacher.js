import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress } from '@mui/material';
import PageHeader from '../../../components/PageHeader';
import ContentCard from '../../../components/ContentCard';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const AddTeacher = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const subjectID = params.id

  const { status, response, error } = useSelector(state => state.user);
  const { subjectDetails } = useSelector((state) => state.sclass);

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
  }, [dispatch, subjectID]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false)

  const role = "Teacher"
  const school = subjectDetails && subjectDetails.school
  const teachSubject = subjectDetails && subjectDetails._id
  const teachSclass = subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName._id

  const fields = { name, email, password, role, school, teachSubject, teachSclass }

  const submitHandler = (event) => {
    event.preventDefault()
    setLoader(true)
    dispatch(registerUser(fields, role))
  }

  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl())
      navigate("/Admin/teachers")
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
  }, [status, navigate, error, response, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
      <PageHeader
        title="Register Faculty Member"
        subtitle="Create a new teacher account and assign them to the selected subject."
        actions={[
          {
            label: 'Go Back',
            variant: 'secondary',
            onClick: () => navigate(-1)
          }
        ]}
      />

      <div className="mt-8 animate-slide-up max-w-2xl mx-auto">
        <ContentCard>
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/5">
            <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-brand">
              <PersonAddAlt1Icon />
            </div>
            <div>
              <h3 className="text-xl font-black text-textDark">Account Details</h3>
              <p className="text-sm font-medium text-textDark/60">
                Assigning to: <span className="text-brand font-bold">{subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName.sclassName}</span> - <span className="font-bold text-textDark">{subjectDetails && subjectDetails.subName}</span>
              </p>
            </div>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="Enter teacher's name..."
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand transition-all text-gray-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Email Address</label>
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand transition-all text-gray-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">System Password</label>
                <input
                  type="password"
                  placeholder="Create strong password..."
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand transition-all text-gray-800"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loader}
                className="px-5 py-2.5 bg-brand text-white rounded-lg shadow-sm font-semibold hover:bg-brand/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
              >
                {loader ? <CircularProgress size={20} color="inherit" /> : 'Register Faculty'}
              </button>
            </div>
          </form>
        </ContentCard>
      </div>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
}

export default AddTeacher