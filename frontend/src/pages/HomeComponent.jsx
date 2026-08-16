import React, { useEffect, useState } from 'react'
import { withAuth, getToken, removeToken } from '../utils/withAuth'
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import RestoreIcon from '@mui/icons-material/Restore';
import styleHome from "./pages.module.css";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { ToastContainer, toast } from 'react-toastify';
import api from "../api/axiosInstance"
import Divider from '@mui/material/Divider';
import { Link } from 'react-router-dom';
//to mobile
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

function HomeComponent() {

  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [history, setHistory] = useState([]);
  const [token, setToken] = useState();
  const [historyPage, setHistoryPage] = useState(false);


  useEffect(() => {
    //const token = localStorage.getItem("token");
    const token = getToken();
    if (token) {
      setToken(token);
    } else {
      console.log(token);
      navigate('/signIn');
    }
    console.log(historyPage)
  }, [])

  let handleJoinVideoCall = async (e) => {
    setMeetingCode("");
    if (meetingCode.length > 4) {
      const res = await addHistory(e);
      if (res?.status === 201) {
        navigate(`/${meetingCode}`);
      }
      
    } else {
      toast.error("Please Enter your MeetingCode > 4 Char..", { position: ("top-center") })
    }
    
  }

  const addHistory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/add_to_activity',
        { token, meetingCode },
        { withCredentials: true }
      );
      console.log(res)
      return res; 
    } catch (e) {
      if (e.response?.status === 409) {
        toast("MeetingCode already Exist, Try Again.",{position: ("top-center")})
      } else if (e.response?.status === 404) {
        toast("User not Found", { position: ("top-center") });
      }
    }
  }

  const getHistory = async () => {
    // e.preventDefault();
    try {
      const res = await api.get(`/api/auth/get_all_activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true
      });
      setHistory(res.data.history);
      setHistoryPage(!historyPage)
    } catch (e) {
      console.log(e);
    }

  }

  const formatDateTime = (dt) => {
    const date = new Date(dt);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };


  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (historyPage) {
      setHistoryPage(false)
    } else {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Divider></Divider>
      <div className={styleHome.navBar}>
        <div>
          <h2 className={styleHome.navLeft}><Link to="/">Apna video call</Link></h2>
        </div>
        <div className={styleHome.navRight}>
          <Button style={{ color: "#6699" }} onClick={getHistory}>
            <RestoreIcon />
            <p style={{ fontSize: "1rem", marginLeft: "0.7rem" }}>History</p>
          </Button>

          <Button onClick={() => {
            removeToken();
            navigate("/")
          }}>
            LOGOUT
          </Button>
        </div>

        {/* //to mobile */}
        <div className='navListForMobile'>
          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2, }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open}
              >
                <MenuIcon style={{ color: "black", height: "35px" }}></MenuIcon>
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
            <MenuItem onClick={(e) => { getHistory(e); }}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              History
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); removeToken(); navigate("/"); }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </div>

      </div>
      <Divider></Divider>

      <div className={styleHome.HomeContainer}>
        <div className={styleHome.leftPannel}>
            <div>
            <h2>Providing Quality Video Call Just Link Quality Education </h2>
            <div className={styleHome.leftPannelDown}>
              <TextField
                 
                onChange={(e) => setMeetingCode(e.target.value)}
                value={meetingCode}
                id="standard-textarea"
                label="Enter your Meeting Code"
                placeholder="Choose Random Code"
                multiline
                variant="standard"
              />
              <Button
                style={{ marginLeft: "4rem" }}
                onClick={handleJoinVideoCall}
                variant='contained'
              >Join Call</Button>
            </div>
            </div>
        </div>
        <div className={styleHome.rightPanel}>
          {historyPage ? "" : <img src="videoCalling.svg" alt="videoCall" />}
        </div>

        {historyPage ? <div className={styleHome.historyPage}>
          <div style={{ display: "flex", flexDirection: "row", gap: "4rem", margin: "10px", fontWeight: "550" }}>
            <small>User_id</small>
            <small>MeetingCode</small>
            <small>Date</small>
          </div>
          <Divider />
          {history.map((item, index) => {
            return (
              <div key={index} className={styleHome.historyItem}>
                <p>{item.user_id}</p>
                <p>{item.meetingCode}</p>
                <p>{formatDateTime(item.date)}</p>
              </div>
            )
          })}
          {/* </div> */}
        </div> : ""}
      </div>
      <ToastContainer />
    </>
  )
}

//export default withAuth(HomeComponent);
export default HomeComponent