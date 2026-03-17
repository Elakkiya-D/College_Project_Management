import React, { useState } from 'react';
import { Box, Avatar, Menu, MenuItem, ListItemIcon, Divider, IconButton, Tooltip } from '@mui/material';
import { Settings, Logout } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const { currentRole, currentUser } = useSelector(state => state.user);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Institutional Controls">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{
                            ml: 2,
                            p: 0.5,
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.04)',
                                transform: 'scale(1.05)'
                            }
                        }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#111827',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.05em'
                        }}>
                            {String(currentUser.name).charAt(0)}
                        </Avatar>
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
                    sx: {
                        backgroundColor: '#ffffff',
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.1))',
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: '24px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        padding: '8px',
                        '& .MuiMenuItem-root': {
                            borderRadius: '16px',
                            margin: '4px 0',
                            padding: '10px 16px',
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: '#f9fafb'
                            }
                        }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <div className="px-4 py-3 mb-2 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated as</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] font-medium text-gray-500 truncate opacity-60 uppercase tracking-wider mt-1">{currentRole} ID: {currentUser._id.slice(-6)}</p>
                </div>

                <MenuItem component={Link} to={`/${currentRole}/profile`} sx={{ gap: 2 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem', backgroundColor: '#f3f4f6', color: '#374151' }} />
                    <span className="text-xs font-bold text-gray-700 tracking-tight">Identity Profile</span>
                </MenuItem>

                <Divider sx={{ my: 1, borderColor: '#f3f4f6' }} />

                <MenuItem component={Link} to="/logout" sx={{ gap: 2 }}>
                    <ListItemIcon sx={{ minWidth: 'auto !important' }}>
                        <Logout fontSize="inherit" sx={{ color: '#ef4444' }} />
                    </ListItemIcon>
                    <span className="text-xs font-bold text-red-500 tracking-tight">Terminate Session</span>
                </MenuItem>
            </Menu>
        </>
    );
}

export default AccountMenu;
