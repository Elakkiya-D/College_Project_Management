import React, { useEffect, useState } from 'react';
import { IconButton, Box, Menu, MenuItem, ListItemIcon, Tooltip } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import TableTemplate from '../../../components/TableTemplate';
import { deleteUser } from '../../../redux/userRelated/userHandle';

import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCardIcon from '@mui/icons-material/AddCard';
import Popup from '../../../components/Popup';
import ConfirmDelete from '../../../components/ConfirmDelete';
import ModuleLayout from '../../../components/ModuleLayout';

const ShowClasses = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const { sclassesList, loading, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user)

  const adminID = currentUser._id

  useEffect(() => {
    dispatch(getAllSclasses(adminID, "Sclass"));
  }, [adminID, dispatch]);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const deleteHandler = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  }

  const confirmDeletion = () => {
    dispatch(deleteUser(deleteId, "Sclass"))
      .then(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
        setMessage("Department removed successfully");
        setShowPopup(true);
      })
      .catch((err) => {
        setMessage(err.message || "Failed to remove department");
        setShowPopup(true);
      });
  }

  const sclassColumns = [
    { id: 'name', label: 'Department Name', minWidth: 170 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'level', label: 'Level', minWidth: 80 },
  ]

  const sclassRows = Array.isArray(sclassesList)
    ? sclassesList.map((sclass) => ({
      name: sclass.sclassName,
      category: sclass.category || '—',
      level: sclass.level || '—',
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
          onClick={() => navigate("/Admin/editclass/" + row.id)}
          className="p-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-transparent rounded-lg transition-all"
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          onClick={() => deleteHandler(row.id)}
          className="p-1.5 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 border border-transparent rounded-lg transition-all"
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
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <Tooltip title="Management Actions">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 1 }}>
              <SpeedDialIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          onClick={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 3,
            sx: styles.styledPaper,
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {actions.map((action, index) => (
            <MenuItem key={index} onClick={action.action} sx={{ px: 2, py: 1.5, gap: 1.5, fontSize: '0.875rem', fontWeight: 700 }}>
              <ListItemIcon sx={{ minWidth: 'auto !important', color: 'primary.main' }}>
                {React.cloneElement(action.icon, { fontSize: 'small' })}
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
      subtitle="Institutional structured organization of academic departments."
      actions={[
        {
          label: 'Create Department',
          variant: 'primary',
          icon: <AddCardIcon fontSize="small" />,
          onClick: () => navigate("/Admin/addclass")
        }
      ]}
      loading={loading}
      isEmpty={getresponse}
      emptyTitle="Registry is Empty"
      emptySubtitle="No departments defined yet. Begin by setting up your first institutional department."
      emptyIcon={<AddCardIcon />}
      emptyAction={() => navigate("/Admin/addclass")}
    >
      <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
      <ConfirmDelete 
        open={showConfirm} 
        setOpen={setShowConfirm} 
        onConfirm={confirmDeletion} 
        title="Delete Department"
        message="This will permanently delete this department along with all its students and assigned courses."
      />
    </ModuleLayout>
  );
};

export default ShowClasses;

const styles = {
  styledPaper: {
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
    mt: 1.5,
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.05)',
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
