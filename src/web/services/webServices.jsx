// src/services/billingService.js
import axios from "axios";
const baseurl = process.env.REACT_APP_API_URL;
const API_URL = baseurl;

// helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("currentUser")?.replace(/"/g, "");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// GET with auth
const getUrl = (uri) => {
    return axios.get(uri, { headers: getAuthHeaders() });
};

// POST with auth
const postUrl = (uri, data) => {
    return axios.post(uri, data, { headers: getAuthHeaders() });
};

// POST without auth
const postNoAuthUrl = (uri, data) => {
    return axios.post(uri, data);
};



// ================= API methods =================
const login = (data) => postNoAuthUrl(`${API_URL}login/check`, data);
const register = (data) => postNoAuthUrl(`${API_URL}login/register`, data);

export const webservices = {
    login,
    register
};