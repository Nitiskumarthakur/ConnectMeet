import axios from "axios";

export const server_url = "http://localhost:1600";

const api = axios.create({
    baseURL:server_url,
    headers:{
        "Content-Type": "application/json",
    }
});

export default api;