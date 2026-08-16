import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const withAuth = (WrappedComponent) => {
    const AuthComponent = (props)=>{

        const navigate = useNavigate();

        const isAuthenticated = ()=>{
            if(localStorage.getItem("token")){
                return true;
            }
            return false;
        }
        useEffect(()=>{
            if(!isAuthenticated()){
               navigate("/signIn")
            }
        },[]);

        return <WrappedComponent {...props}/>
    }
    return AuthComponent;
}

export const saveToken = (token)=>{
    const expiryTime = Date.now() + 24*60*60*1000;//for one day.

    localStorage.setItem("VideoToken", token);
    localStorage.setItem("expirtyToken", expiryTime);
}
export const getToken =()=>{
    const token = localStorage.getItem("VideoToken");
    const expiryTime = localStorage.getItem("expirtyToken");

    if(!token || !expiryTime){
        return null;
    }
    if(Date.now() > Number( expiryTime)){
        removeToken();
        return null;
    }

    return token;
}
export const removeToken = ()=>{
    localStorage.removeItem("VideoToken");
    localStorage.removeItem("expirtyToken");
}