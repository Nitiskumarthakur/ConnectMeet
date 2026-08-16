import axios from "axios";

export const server_url = "https://connectmeet-znvm.onrender.com";

const api = axios.create({
    baseURL:server_url,
    headers:{
        "Content-Type": "application/json",
    }
});

export default api;
