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

const getUploadFileAuthHeaders = () => {
    const token = localStorage.getItem("currentUser")?.replace(/"/g, "");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
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

const postUrlFile = (uri, data) => {
    return axios.post(uri, data, { headers: getUploadFileAuthHeaders() });
};

// POST without auth
const postNoAuthUrl = (uri, data) => {
    return axios.post(uri, data);
};



// ================= API methods =================
const currentfileststus = (data) => postUrl(`${API_URL}member/currentfileststus`, data);
const taxpayerinfo = (data) => postUrl(`${API_URL}member/taxpayerinfo`, data);
const spouseinfo = (data) => postUrl(`${API_URL}member/spouseinfo`, data);
const dependentinfo = (data) => postUrl(`${API_URL}member/dependentinfo`, data);
const saveTaxpayerInfo = (data) => postUrl(`${API_URL}member/saveTaxpayerInfo`, data);
const saveSpouseInfo = (data) => postUrl(`${API_URL}member/saveSpouseInfo`, data);
const saveDependentsInfo = (data) => postUrl(`${API_URL}member/saveDependentsInfo`, data);
const uploaddocs = (data) => postUrlFile(`${API_URL}upload/uploaddocs`, data);
const getuploaddocs = (data) => postUrl(`${API_URL}upload/getuploaddocs`, data);
const deleteuploaddoc = (data) => postUrl(`${API_URL}upload/deleteuploaddoc`, data);
const saveReferralContact = (data) => postUrl(`${API_URL}saveReferralContact`, data);
const refferalslist = (data) => postUrl(`${API_URL}member/refferalslist`, data);
const confirmdocupload = (data) => postUrl(`${API_URL}upload/confirmdocupload`, data);

export const webservices = {
    currentfileststus,
    taxpayerinfo,
    spouseinfo,
    dependentinfo,
    saveTaxpayerInfo,
    saveSpouseInfo,
    saveDependentsInfo,
    uploaddocs,
    getuploaddocs,
    deleteuploaddoc,
    saveReferralContact,
    refferalslist,
    confirmdocupload
};