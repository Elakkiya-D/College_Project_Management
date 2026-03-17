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
import ModuleLayout from '../../../components/ModuleLayout';

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
    console.log(deleteID);
    console.log(address);
    setMessage("Sorry the delete function has been disabled for now.")
    setShowPopup(true)
    // dispatch(deleteUser(deleteID, address))
    //   .then(() => {
    //     dispatch(getAllSclasses(adminID, "Sclass"));
    //   })
  }

  const sclassColumns = [
    { id: 'name', label: 'Department (Dept)', minWidth: 170 },
  ]

  const sclassRows = Array.isArray(sclassesList)
    ? sclassesList.map((sclass) => ({
      name: sclass.sclassName,
      id: sclass._id,
    }))
    : [];

  const SclassButtonHaver = ({ row }) => {
    const actions = [
      { icon: <PostAddIcon />, name: 'Add Courses', action: () => navigate("/Admin/addsubject/" + row.id) },
      { icon: <PersonAddAlt1Icon />, name: 'Add Student', action: () => navigate("/Admin/class/addstudents/" + row.id) },
    ];
    return (
      <div className="flex items-center gap-2 justify-end pr-4">
        <button
          onClick={() => navigate("/Admin/classes/class/" + row.id)}
          className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
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
    <ModuleLayout
      title="Department Registry"
      subtitle="Manage departments, assign courses, and organize students."
      actions={[
        {
          label: 'Add Department',
          variant: 'primary',
          icon: <AddCardIcon fontSize="small" />,
          onClick: () => navigate("/Admin/addclass")
        }
      ]}
      loading={loading}
      isEmpty={getresponse}
      emptyTitle="No Departments Assigned"
      emptySubtitle="Your academic registry is currently empty. Define your first department to begin curriculum mapping."
      emptyIcon={<AddCardIcon />}
      emptyAction={() => navigate("/Admin/addclass")}
      emptyActionLabel="Create Department"
    >
      <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </ModuleLayout>
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