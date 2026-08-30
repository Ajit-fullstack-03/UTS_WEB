import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Helper to get authentication headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("currentUser")?.replace(/"/g, "");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// Generic HTTP helpers
const postUrl = (uri, data) => axios.post(uri, data, { headers: getAuthHeaders() });
const getUrl = (uri) => axios.get(uri, { headers: getAuthHeaders() });
const postFormData = (uri, formData) => {
    const token = localStorage.getItem("currentUser")?.replace(/"/g, "");
    return axios.post(uri, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
};

// ==========================================
// 1. Dashboard & Client Records
// ==========================================
const alluserslist = (data) => postUrl(`${API_URL}member/alluserslist`, data);
const commonprocessingcount = (data) => postUrl(`${API_URL}member/commonprocessingcount`, data);
const commonprocessingclientdata = (data) => postUrl(`${API_URL}member/commonprocessingclientdata`, data);
const utstaxyears = (data) => postUrl(`${API_URL}member/utstaxyears`, data);

// ==========================================
// 2. Client Profile & Info
// ==========================================
const userdetails = (data) => postUrl(`${API_URL}member/userdetails`, data);
const taxpayerinfo = (data) => postUrl(`${API_URL}member/taxpayerinfo`, data);
const getSpouseInfo = (data) => postUrl(`${API_URL}member/spouseinfo`, data);
const getDependentInfo = (data) => postUrl(`${API_URL}member/dependentinfo`, data);
const getEmployerInfo = (data) => postUrl(`${API_URL}member/employerinfo`, data);

// ==========================================
// 3. Document Management
// ==========================================
const gettotalcountofdocs = (data) => postUrl(`${API_URL}upload/gettotalcountofdocs`, data);
const downloadZip = (data) => postUrl(`${API_URL}upload/downloadZip`, data);
const savesynopsys = (formData) => postFormData(`${API_URL}member/savesynopsys`, formData);
const usersynopsys = (data) => postUrl(`${API_URL}member/usersynopsys`, data);

// ==========================================
// 4. Assigned File Number & Account Management
// ==========================================
const usersliist = (data) => postUrl(`${API_URL}member/usersliist`, data);
const setnewfilenumberusers = (data) => postUrl(`${API_URL}member/setnewfilenumberusers`, data);
const existingassignfilenumber = (data) => postUrl(`${API_URL}member/existingassignfilenumber`, data);
const changeemailaddress = (data) => postUrl(`${API_URL}member/changeemailaddress`, data);
const changemobilenumber = (data) => postUrl(`${API_URL}member/changemobilenumber`, data);

// ==========================================
// 5. File Status & Processing History
// ==========================================
const pushtonewfilestatus = (data) => postUrl(`${API_URL}member/pushtonewfilestatus`, data);
const processingstatushistory = (data) => postUrl(`${API_URL}member/processingstatushistory`, data);

// ==========================================
// 6. Referrals
// ==========================================
const allrefferalslist = (data) => postUrl(`${API_URL}member/allrefferalslist`, data);
const refferalslist = (data) => postUrl(`${API_URL}member/refferalslist`, data);

// ==========================================
// 7. Login History & Payments & Call Us & Comments & Emails & Careers
// ==========================================
const loginshistory = (data) => postUrl(`${API_URL}user/loginshistory`, data);
const paymenthistory = (data) => postUrl(`${API_URL}member/paymenthistory`, data);
const paymentshistory = (data) => postUrl(`${API_URL}user/paymentshistory`, data);
const paymentslist = (data) => postUrl(`${API_URL}member/paymentslist`, data);
const createOrder = (data) => postUrl(`${API_URL}payment/createOrder`, data);
const calluslist = (data) => postUrl(`${API_URL}member/calluslist`, data);
const wantusinfo = (data) => postUrl(`${API_URL}user/wantusinfo`, data);
const deletecallus = (data) => postUrl(`${API_URL}member/deletecallus`, data);
const updatecontactstatus = (data) => postUrl(`${API_URL}member/updatecontactstatus`, data);
const commentslist = (data) => postUrl(`${API_URL}member/commentslist`, data);
const usercomments = (data) => postUrl(`${API_URL}member/usercomments`, data);
const sendEmailToClient = (data) => postUrl(`${API_URL}settings/sendemailtoclient`, data);
const emailtemplates = (data) => postUrl(`${API_URL}settings/emailtemplates`, data);
const getemailtemplates = (data) => postUrl(`${API_URL}settings/emailtemplates`, data);
const careerslist = (data) => postUrl(`${API_URL}user/careerslist`, data);
const deletecareer = (data) => postUrl(`${API_URL}user/deletecareer`, data);

// ==========================================
// Exported Service Object
// ==========================================
export const adminServices = {
    // Generic
    getUrl,
    postUrl,

    // Dashboard & Client Records
    alluserslist,
    commonprocessingcount,
    commonprocessingclientdata,
    utstaxyears,

    // Client Profile & Info
    userdetails,
    taxpayerinfo,
    getSpouseInfo,
    getDependentInfo,
    getEmployerInfo,

    // Documents
    gettotalcountofdocs,
    downloadZip,
    savesynopsys,
    usersynopsys,

    // File Number & Account Management
    usersliist,
    setnewfilenumberusers,
    existingassignfilenumber,
    changeemailaddress,
    changemobilenumber,

    // File Status & Processing
    pushtonewfilestatus,
    processingstatushistory,

    // Referrals
    allrefferalslist,
    refferalslist,

    // Login History & Payments & Call Us & Comments & Emails & Careers
    loginshistory,
    paymenthistory,
    paymentshistory,
    paymentslist,
    createOrder,
    calluslist,
    wantusinfo,
    deletecallus,
    updatecontactstatus,
    commentslist,
    usercomments,
    sendEmailToClient,
    emailtemplates,
    getemailtemplates,
    careerslist,
    deletecareer,
};

export default adminServices;