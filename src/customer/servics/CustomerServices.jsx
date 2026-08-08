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
const taxpayerinfo = (data) => postUrl(`${API_URL}member/taxpayerinfo`, data);
const spouseinfo = (data) => postUrl(`${API_URL}member/spouseinfo`, data);
const dependentinfo = (data) => postUrl(`${API_URL}member/dependentinfo`, data);
const saveTaxpayerInfo = (data) => postUrl(`${API_URL}member/saveTaxpayerInfo`, data);
const saveSpouseInfo = (data) => postUrl(`${API_URL}member/saveSpouseInfo`, data);
const saveDependentsInfo = (data) => postUrl(`${API_URL}member/saveDependentsInfo`, data);

export const webservices = {
    taxpayerinfo,
    spouseinfo,
    dependentinfo,
    saveTaxpayerInfo,
    saveSpouseInfo,
    saveDependentsInfo
};