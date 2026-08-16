import React from 'react'
import { Link, useNavigate } from "react-router-dom"
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';
//this style container by the app.js

function LandingPage() {

  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
          <h2>Apna video Call</h2>
        </div>
        <div className='navList'>
          <p onClick={() => navigate("/$^24825*`")}>Join as Guest</p>
          <p onClick={() => navigate("/signUp")}>Register</p>
          <div role='button' onClick={() => navigate("/signIn")}>
            <p>Login</p>
          </div>
        </div>

        {/* to nav Mobile  */}
        <div className='navListForMobile'>
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <MenuIcon style={{color:"white", height:"35px"}}></MenuIcon>
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
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
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { handleClose(); navigate("/gest*&%$($))(01)"); }}>
            <ListItemIcon>
              <GroupIcon fontSize="small" />
            </ListItemIcon>
            Join as Guest
          </MenuItem>
          <MenuItem onClick={() => { handleClose(); navigate("/signUp"); }}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
           Register
          </MenuItem>
          <MenuItem onClick={() => { handleClose(); navigate("/signIn"); }}>
                <ListItemIcon>
                  <LoginIcon fontSize="small" />
                </ListItemIcon>
               Login
          </MenuItem>
        </Menu>
        </div>
      </nav>

      <div className='landingMainContainer'>
        <div className='leftSide'>
          <h1><span style={{ color: "#FF9838" }}>Connect</span> with your loved ones</h1>
          <p>Cover a distance by a Apna video call</p>
          <div role='button'>
            <Link to={"/home"}>Get started</Link>
          </div>
        </div>

        <div className='rigthSide'>
          <img src="callingImg.png" alt="img" />
        </div>
      </div>

    </div>
  )
}

export default LandingPage;