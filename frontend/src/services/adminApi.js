import axios from "axios";

const adminApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    headers: {
        "Content-Type": "application/json"
    }
});

adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
        config.headers.Authorization = token;
    }

    return config;
});

export default adminApi;