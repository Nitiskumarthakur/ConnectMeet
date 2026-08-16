import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import { Link } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
//import { GoogleIcon, FacebookIcon, SitemarkIcon } from './components/CustomIcons';
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance.js"

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));

export default function SignUp() {
    
    const [usernameError, setUsernameError] = React.useState(false);
    const [usernameErrorMessage, setusernameErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [nameError, setNameError] = React.useState(false);
    const [nameErrorMessage, setNameErrorMessage] = React.useState('');
    const [userData, setUserData] = React.useState({name:"",username:"", password:""});
    
    const navigate = useNavigate();

    const validateInputs = () => {
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const name = document.getElementById('name');

        let isValid = true;

        if (!username.value || !/^[a-zA-Z0-9_]{3,20}$/.test(username.value)) {
            setUsernameError(true);
            setusernameErrorMessage('Please enter a valid username.');
            isValid = false;
        } else {
            setUsernameError(false);
            setusernameErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (!name.value || name.value.length < 1) {
            setNameError(true);
            setNameErrorMessage('Name is required.');
            isValid = false;
        } else {
            setNameError(false);
            setNameErrorMessage('');
        }

        return isValid;
    };

    const handleChange = (e)=>{
        setUserData({
            ...userData, 
            [e.target.name]:e.target.value
        });
    }
    
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if(!usernameError && !passwordError && !nameError){
          userRegister();
        }
        
        
        async function userRegister() {
            try {
                const res = await api.post("/api/auth/register",
                    { userData },
                    { withCredentials: true }
                );
                
                console.log(res);
                toast.success(res.data.message, { position: "top-center" })
                setTimeout(() => {
                    navigate("/")
                }, 1500)
            } catch (e) {
                if(e.status === 409){
                  toast.error("User already exits", {position:"top-center"})  
                }
            }
        }

        setUserData({username:"",name:"",password:""})
    }

    return (
        <div className='authpagebg'>
            <div className='signUpcallImg'>
                <img src="callingImg2.jpg" alt="image" style={{margin:"auto", display:"block"}}/>
            </div>
            <div>
            <SignUpContainer direction="column" sx={{ justifyContent: 'space-between' }}>
                <Card variant="outlined">
                    {/* <SitemarkIcon /> */}
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                    >
                        Create an Account
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <FormControl>
                            <FormLabel htmlFor="name">Full name</FormLabel>
                            <TextField
                                autoComplete="name"
                                name="name"
                                value={userData.name}
                                onChange={handleChange}
                                required
                                fullWidth
                                id="name"
                                placeholder="Jon Snow"
                                error={nameError}
                                helperText={nameErrorMessage}
                                color={nameError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="username">Username</FormLabel>
                            <TextField
                                required
                                fullWidth
                                type='text'
                                id="username"
                                name="username"
                                value={userData.username}
                                onChange={handleChange}
                                placeholder="your_username"
                                autoComplete="username"
                                variant="outlined"
                                error={usernameError}
                                helperText={usernameErrorMessage}
                                color={passwordError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="••••••"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                variant="outlined"
                                error={passwordError}
                                helperText={passwordErrorMessage}
                                color={passwordError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            onClick={validateInputs}
                        >
                            Sign up
                        </Button>
                    </Box>
                    <Divider>
                        <Typography sx={{ color: 'text.secondary' }}>or</Typography>
                    </Divider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ textAlign: 'center' }}>
                            Already have an account?{' '}
                            <Link
                                to={"/signIn"}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </SignUpContainer>
            </div>
            <ToastContainer/>
        </div>
    );
}