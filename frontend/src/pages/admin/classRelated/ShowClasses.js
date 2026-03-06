import { useEffect, useState } from 'react';
import { IconButton, Box, Menu, MenuItem, ListItemIcon, Tooltip } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';

import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCardIcon from '@mui/icons-material/AddCard';
import styled from 'styled-components';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import PageHeader from '../../../components/PageHeader';

const ShowClasses = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user)

  const adminID = currentUser._id

  useEffect(() => {
    dispatch(getAllSclasses(adminID, "Sclass"));
  }, [adminID, dispatch]);

  if (error) {
    console.log(error)
  }

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address))
      .then(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
      })
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
    const actions = [
      { icon: <PostAddIcon />, name: 'Add Subjects', action: () => navigate("/Admin/addsubject/" + row.id) },
      { icon: <PersonAddAlt1Icon />, name: 'Add Student', action: () => navigate("/Admin/class/addstudents/" + row.id) },
    ];
    return (
      <div className="flex items-center gap-2 justify-end pr-4">
        <button
          onClick={() => navigate("/Admin/classes/class/" + row.id)}
          className="px-3 py-1.5 bg-surface text-brand font-bold text-sm rounded-lg hover:bg-brand hover:text-white transition-all shadow-sm"
        >
          View
        </button>
        <button
          onClick={() => deleteHandler(row.id, "Sclass")}
          className="p-1.5 text-red-500 hover:text-white bg-white hover:bg-red-500 border border-transparent rounded-lg transition-all"
        >
          <DeleteIcon fontSize="small" />
        </button>
        <ActionMenu actions={actions} />
      </div>
    );
  };

  const ActionMenu = ({ actions }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <Tooltip title="Add Students & Subjects">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <h5>Add</h5>
              <SpeedDialIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: styles.styledPaper,
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {actions.map((action) => (
            <MenuItem onClick={action.action}>
              <ListItemIcon fontSize="small">
                {action.icon}
              </ListItemIcon>
              {action.name}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full animate-fade-in">
      <PageHeader
        title="Class Registry"
        subtitle="Manage academic classes, assign subjects, and organize students."
        actions={[
          {
            label: 'Clear All',
            variant: 'danger',
            onClick: () => deleteHandler(adminID, "Sclasses")
          },
          {
            label: 'Add Class',
            variant: 'primary',
            icon: <AddCardIcon fontSize="small" />,
            onClick: () => navigate("/Admin/addclass")
          }
        ]}
      />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-10 w-10 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : getresponse ? (
        <div className="bg-surface rounded-xl border border-black/5 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <AddCardIcon className="text-brand" style={{ fontSize: 32 }} />
          </div>
          <h3 className="text-xl font-bold text-textDark mb-2">No Classes Found</h3>
          <p className="text-textDark/70 max-w-sm mb-6">Your registry is currently empty. Add your first class to begin enrollment.</p>
          <button
            onClick={() => navigate("/Admin/addclass")}
            className="px-6 py-3 bg-brand text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Add First Class
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-textDark/5 overflow-hidden">
          {Array.isArray(sclassesList) && sclassesList.length > 0 &&
            <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
          }
        </div>
      )}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default ShowClasses;

const styles = {
  styledPaper: {
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    mt: 1.5,
    '& .MuiAvatar-root': {
      width: 32,
      height: 32,
      ml: -0.5,
      mr: 1,
    },
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 14,
      width: 10,
      height: 10,
      bgcolor: 'background.paper',
      transform: 'translateY(-50%) rotate(45deg)',
      zIndex: 0,
    },
  }
}

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;