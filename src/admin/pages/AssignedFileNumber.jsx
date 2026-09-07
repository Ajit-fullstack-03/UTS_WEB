import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { FiMail, FiPhone, FiCheckCircle, FiLoader, FiRefreshCw } from "react-icons/fi";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import { isAnalystUser } from "../../utils/userRole";
import "./admin_dashboard.css";

const AssignedFileNumber = () => {
    const isAnalyst = isAnalystUser();
    const [userList, setUserList] = useState([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    // Form 1: Assign File Number
    const [assignedUser, setAssignedUser] = useState("");
    const [assignedFileNum, setAssignedFileNum] = useState("");
    const [loadingAssigned, setLoadingAssigned] = useState(false);

    // Form 2: Edit File Number
    const [editUser, setEditUser] = useState("");
    const [editFileNum, setEditFileNum] = useState("");
    const [loadingEdit, setLoadingEdit] = useState(false);

    // Form 3: Set Email Address
    const [emailUser, setEmailUser] = useState("");
    const [emailAddr, setEmailAddr] = useState("");
    const [loadingEmail, setLoadingEmail] = useState(false);

    // Form 4: Set Mobile Number
    const [phoneUser, setPhoneUser] = useState("");
    const [countryCode, setCountryCode] = useState("US");
    const [phoneNum, setPhoneNum] = useState("");
    const [loadingPhone, setLoadingPhone] = useState(false);

    const getAdminCredentials = () => {
        const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
        let userId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";
        let taxYear = getStoredTaxYear();
        if (userInfoStr) {
            try {
                const parsed = JSON.parse(userInfoStr);
                if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
            } catch {
                if (typeof userInfoStr === "string" && userInfoStr.length > 5) {
                    userId = userInfoStr.replace(/"/g, "");
                }
            }
        }
        return { userId, taxYear };
    };

    const fetchUsers = useCallback(async () => {
        setFetchingUsers(true);
        try {
            const { userId, taxYear } = getAdminCredentials();
            let rawList = [];

            // Primary: try usersliist endpoint
            try {
                const res = await adminServices.usersliist({
                    user_id: userId,
                    taxYear: String(taxYear)
                });
                if (res && res.data) {
                    rawList = res.data.data || res.data.users || res.data.list || (Array.isArray(res.data) ? res.data : []);
                }
            } catch (err) {
                console.warn("usersliist endpoint fallback to alluserslist:", err);
            }

            // Fallback: if empty, query alluserslist
            if (!rawList || rawList.length === 0) {
                const resAll = await adminServices.alluserslist({
                    filestate: "ALL",
                    user_id: userId,
                    taxYear: String(taxYear),
                    per_page: 200,
                    page: 1
                });
                if (resAll && resAll.data) {
                    rawList = resAll.data.data || resAll.data.users || resAll.data.list || (Array.isArray(resAll.data) ? resAll.data : []);
                }
            }

            const mapped = (rawList || []).map((item, idx) => {
                const dbUserId = item.u_user_id || item.user_id || item.client_id || item.id || "";
                const rawUniqueCode = item.unique_code !== undefined && item.unique_code !== null ? String(item.unique_code).trim() : "";
                const name = item.user_name || item.client_name || item.name || `${item.first_name || ""} ${item.last_name || ""}`.trim() || "Client";
                const filenumber = item.filenumber || item.file_number || "";
                const email = item.email || item.email_id || item.emailaddress || item.email_address || "";
                const phone = item.phone || item.phone_no || item.mobilenumber || item.mobile || item.mobile_no || "";
                const phoneext = item.phoneext || item.phone_ext || "US";

                return {
                    id: String(rawUniqueCode || dbUserId || `U_${idx}`),
                    unique_code: rawUniqueCode,
                    client_id: String(dbUserId),
                    user_id: String(dbUserId),
                    name,
                    filenumber: String(filenumber),
                    email: String(email),
                    phone: String(phone),
                    phoneext: String(phoneext),
                    rawData: item
                };
            });

            setUserList(mapped);
        } catch (err) {
            console.error("Failed to load users for AssignedFileNumber:", err);
        } finally {
            setFetchingUsers(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        window.addEventListener("taxYearChanged", fetchUsers);
        return () => {
            window.removeEventListener("taxYearChanged", fetchUsers);
        };
    }, [fetchUsers]);

    // Handle Assign File Number (Card 1)
    const handleAssignFileNumber = async () => {
        if (!assignedUser || !assignedFileNum.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please select a user and enter a file number (e.g. UTS0001).",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        let newCode = assignedFileNum.trim();
        if (newCode.toLowerCase().startsWith("uts")) {
            newCode = "UTS" + newCode.slice(3);
        } else if (!newCode.startsWith("UTS")) {
            newCode = "UTS" + newCode;
        }

        const selectedObj = userList.find(u => u.unique_code === assignedUser || u.client_id === assignedUser || u.id === assignedUser);
        setLoadingAssigned(true);
        try {
            const { userId, taxYear } = getAdminCredentials();
            const payload = {
                user_id: userId,
                client_id: selectedObj?.client_id || selectedObj?.user_id || assignedUser,
                unique_code: newCode,
                filenumber: newCode,
                file_number: newCode,
                old_unique_code: selectedObj?.rawData?.unique_code || selectedObj?.unique_code || "",
                taxYear: String(taxYear)
            };

            const response = await adminServices.confirmAssigningFileNumberToNewUsers(payload);
            const dataObj = response?.data?.data;
            const filestatus = dataObj?.filestatus;

            if (filestatus) {
                if (filestatus.toLowerCase().includes("other client")) {
                    Swal.fire({
                        icon: "error",
                        title: "Already Assigned",
                        text: filestatus,
                        confirmButtonColor: "#1b2e6b"
                    });
                } else if (filestatus.toLowerCase().includes("this client") || filestatus.toLowerCase().includes("already exits")) {
                    Swal.fire({
                        icon: "info",
                        title: "File Number Notice",
                        text: filestatus,
                        confirmButtonColor: "#1b2e6b"
                    });
                } else {
                    Swal.fire({
                        icon: "warning",
                        title: "File Number Notice",
                        text: filestatus,
                        confirmButtonColor: "#1b2e6b"
                    });
                }
            } else if (response?.data?.status === true || response?.data?.http_code === 200 || response?.status === 200) {
                const message = response?.data?.status_smessage || response?.data?.message || `File number ${newCode} has been assigned successfully.`;
                Swal.fire({
                    icon: "success",
                    title: "File Number Assigned",
                    text: message,
                    confirmButtonColor: "#1b2e6b"
                });
                setAssignedUser("");
                setAssignedFileNum("");
                fetchUsers();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Assign File Number",
                    text: response?.data?.status_smessage || response?.data?.message || "An error occurred while assigning the file number.",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        } catch (err) {
            console.error("Error assigning file number:", err);
            const errMsg = err?.response?.data?.status_smessage || err?.response?.data?.message || err?.response?.data?.errMessage || "Entered File number format is wrong (EX: UTS0001).";
            Swal.fire({
                icon: "error",
                title: "Error",
                text: errMsg,
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setLoadingAssigned(false);
        }
    };

    // Handle Edit File Number (Card 2)
    const handleEditUserChange = (selectedCode) => {
        setEditUser(selectedCode);
        const found = userList.find(u => u.unique_code === selectedCode || u.client_id === selectedCode || u.id === selectedCode);
        if (found) {
            const rawUnique = found.rawData?.unique_code;
            if (rawUnique !== undefined && rawUnique !== null && String(rawUnique).trim() !== "" && !String(rawUnique).startsWith("U_")) {
                setEditFileNum(String(rawUnique).trim());
            } else {
                setEditFileNum("");
            }
        } else {
            setEditFileNum("");
        }
    };

    const handleEditFileNumber = async () => {
        if (!editUser || !editFileNum.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please select a user and enter updated file number (e.g. UTS0001).",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        let updatedCode = editFileNum.trim();
        if (updatedCode.toLowerCase().startsWith("uts")) {
            updatedCode = "UTS" + updatedCode.slice(3);
        } else if (!updatedCode.startsWith("UTS")) {
            updatedCode = "UTS" + updatedCode;
        }

        const selectedObj = userList.find(u => u.unique_code === editUser || u.client_id === editUser || u.id === editUser);
        setLoadingEdit(true);
        try {
            const { userId, taxYear } = getAdminCredentials();
            const payload = {
                user_id: userId,
                client_id: selectedObj?.client_id || selectedObj?.user_id || editUser,
                unique_code: updatedCode,
                filenumber: updatedCode,
                file_number: updatedCode,
                old_unique_code: selectedObj?.rawData?.unique_code || selectedObj?.unique_code || editUser,
                old_filenumber: selectedObj?.rawData?.unique_code || selectedObj?.filenumber || selectedObj?.unique_code || editUser,
                new_filenumber: updatedCode,
                new_unique_code: updatedCode,
                taxYear: String(taxYear)
            };

            const response = await adminServices.confirmAssigningFileNumberToNewUsers(payload);
            const dataObj = response?.data?.data;
            const filestatus = dataObj?.filestatus;

            if (filestatus) {
                if (filestatus.toLowerCase().includes("other client")) {
                    Swal.fire({
                        icon: "error",
                        title: "Already Assigned",
                        text: filestatus,
                        confirmButtonColor: "#1b2e6b"
                    });
                } else if (filestatus.toLowerCase().includes("this client") || filestatus.toLowerCase().includes("already exits")) {
                    Swal.fire({
                        icon: "info",
                        title: "File Number Notice",
                        text: filestatus,
                        confirmButtonColor: "#1b2e6b"
                    });
                } else {
                    Swal.fire({
                        icon: "warning",
                        title: "File Number Notice",
                        text: filestatus,
                        confirmButtonColor: "#1b2e6b"
                    });
                }
            } else if (response?.data?.status === true || response?.data?.http_code === 200 || response?.status === 200) {
                const message = response?.data?.status_smessage || response?.data?.message || `File number updated to ${updatedCode} successfully.`;
                Swal.fire({
                    icon: "success",
                    title: "File Number Updated",
                    text: message,
                    confirmButtonColor: "#1b2e6b"
                });
                setEditUser("");
                setEditFileNum("");
                fetchUsers();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Update File Number",
                    text: response?.data?.status_smessage || response?.data?.message || "An error occurred while updating the file number.",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        } catch (err) {
            console.error("Error editing file number:", err);
            const errMsg = err?.response?.data?.status_smessage || err?.response?.data?.message || err?.response?.data?.errMessage || "Entered File number format is wrong (EX: UTS0001).";
            Swal.fire({
                icon: "error",
                title: "Error",
                text: errMsg,
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setLoadingEdit(false);
        }
    };

    // Handle Set Email Address (Card 3)
    const handleEmailUserChange = (selectedCode) => {
        setEmailUser(selectedCode);
        const found = userList.find(u => u.client_id === selectedCode || u.user_id === selectedCode || u.unique_code === selectedCode || u.id === selectedCode);
        if (found && found.email) {
            setEmailAddr(found.email);
        } else {
            setEmailAddr("");
        }
    };

    const handleUpdateEmail = async () => {
        if (!emailUser || !emailAddr.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please select a user and enter an email address.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailAddr.trim())) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Email",
                text: "Please enter a valid email address.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const selectedObj = userList.find(u => u.client_id === emailUser || u.user_id === emailUser || u.unique_code === emailUser || u.id === emailUser);
        setLoadingEmail(true);
        try {
            const { userId, taxYear } = getAdminCredentials();
            const emailVal = emailAddr.trim();
            const payload = {
                user_id: userId,
                client_id: selectedObj?.client_id || selectedObj?.user_id || emailUser,
                newemailaddr: emailVal,
                email: emailVal,
                unique_code: selectedObj?.rawData?.unique_code || selectedObj?.unique_code || emailUser,
                taxYear: String(taxYear)
            };

            const response = await adminServices.changeemailaddress(payload);
            const isSuccess = response?.data?.status === true || response?.data?.status === "success" || response?.status === 200;
            const message = response?.data?.message || `Email address updated to ${emailVal} successfully.`;

            if (isSuccess) {
                Swal.fire({
                    icon: "success",
                    title: "Email Updated",
                    text: message,
                    confirmButtonColor: "#1b2e6b"
                });
                setEmailUser("");
                setEmailAddr("");
                fetchUsers();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Update Email",
                    text: response?.data?.message || "An error occurred while updating the email address.",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        } catch (err) {
            console.error("Error updating email address:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.message || "Failed to communicate with the server.",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setLoadingEmail(false);
        }
    };

    // Handle Set Mobile Number (Card 4)
    const handlePhoneUserChange = (selectedCode) => {
        setPhoneUser(selectedCode);
        const found = userList.find(u => u.client_id === selectedCode || u.user_id === selectedCode || u.unique_code === selectedCode || u.id === selectedCode);
        if (found) {
            if (found.phone) setPhoneNum(found.phone);
            if (found.phoneext) setCountryCode(found.phoneext);
        } else {
            setPhoneNum("");
        }
    };

    const handleUpdatePhone = async () => {
        if (!phoneUser || !phoneNum.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please select a user and enter mobile number.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const selectedObj = userList.find(u => u.client_id === phoneUser || u.user_id === phoneUser || u.unique_code === phoneUser || u.id === phoneUser);
        setLoadingPhone(true);
        try {
            const { userId, taxYear } = getAdminCredentials();
            const phoneVal = phoneNum.trim();
            const payload = {
                user_id: userId,
                client_id: selectedObj?.client_id || selectedObj?.user_id || phoneUser,
                mobilenumber: phoneVal,
                phone_ext: countryCode,
                phone: phoneVal,
                phone_no: phoneVal,
                unique_code: selectedObj?.rawData?.unique_code || selectedObj?.unique_code || phoneUser,
                taxYear: String(taxYear)
            };

            const response = await adminServices.changemobilenumber(payload);
            const isSuccess = response?.data?.status === true || response?.data?.status === "success" || response?.status === 200;
            const message = response?.data?.message || `Mobile number updated to ${phoneVal} successfully.`;

            if (isSuccess) {
                Swal.fire({
                    icon: "success",
                    title: "Mobile Number Updated",
                    text: message,
                    confirmButtonColor: "#1b2e6b"
                });
                setPhoneUser("");
                setPhoneNum("");
                fetchUsers();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Update Mobile Number",
                    text: response?.data?.message || "An error occurred while updating the mobile number.",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        } catch (err) {
            console.error("Error updating mobile number:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.message || "Failed to communicate with the server.",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setLoadingPhone(false);
        }
    };

    return (
        <div className="row g-4">
            {/* Header controls */}
            <div className="col-12 d-flex justify-content-end mb-n2">
                <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={fetchUsers}
                    disabled={fetchingUsers}
                >
                    <FiRefreshCw className={fetchingUsers ? "spin" : ""} /> Refresh User List
                </button>
            </div>

            {/* 1. Assigned File Number Card (Admin Only) */}
            {!isAnalyst && (
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 rounded-3 p-4 card-config h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                                <h5 className="fw-bold text-dark mb-0">Assigned File Number</h5>
                                {fetchingUsers && <span className="badge bg-light text-muted small"><FiLoader className="me-1 spin" /> Loading...</span>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Users:</label>
                                <select
                                    className="form-select config-select"
                                    value={assignedUser}
                                    onChange={e => setAssignedUser(e.target.value)}
                                    disabled={fetchingUsers}
                                >
                                    <option value="">Select User</option>
                                    {userList.map(c => (
                                        <option key={`assign-${c.id || c.client_id || c.unique_code}`} value={c.id || c.client_id || c.unique_code}>
                                            {c.name} {c.unique_code ? `(${c.unique_code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Update File Number:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="File Number Ex: UTS0001"
                                    value={assignedFileNum}
                                    onChange={e => setAssignedFileNum(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-config-update w-100 py-2 mt-2 fw-semibold d-flex align-items-center justify-content-center"
                            onClick={handleAssignFileNumber}
                            disabled={loadingAssigned || fetchingUsers}
                        >
                            {loadingAssigned ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle className="me-2" /> Update
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Edit File Number Card (Admin Only) */}
            {!isAnalyst && (
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 rounded-3 p-4 card-config h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                                <h5 className="fw-bold text-dark mb-0">Edit File Number</h5>
                                {fetchingUsers && <span className="badge bg-light text-muted small"><FiLoader className="me-1 spin" /> Loading...</span>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Users:</label>
                                <select
                                    className="form-select config-select"
                                    value={editUser}
                                    onChange={e => handleEditUserChange(e.target.value)}
                                    disabled={fetchingUsers}
                                >
                                    <option value="">Select User</option>
                                    {userList.map(c => (
                                        <option key={`edit-${c.id || c.client_id || c.unique_code}`} value={c.id || c.client_id || c.unique_code}>
                                            {c.name} {c.unique_code ? `(${c.unique_code})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Update File Number:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="File Number Ex: UTS0001"
                                    value={editFileNum}
                                    onChange={e => setEditFileNum(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-config-update w-100 py-2 mt-2 fw-semibold d-flex align-items-center justify-content-center"
                            onClick={handleEditFileNumber}
                            disabled={loadingEdit || fetchingUsers}
                        >
                            {loadingEdit ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle className="me-2" /> Update
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* 3. Set Email Address Card */}
            <div className="col-12 col-md-6">
                <div className="card shadow-sm border-0 rounded-3 p-4 card-config h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                            <h5 className="fw-bold text-dark mb-0">Set Email Address</h5>
                            {fetchingUsers && <span className="badge bg-light text-muted small"><FiLoader className="me-1 spin" /> Loading...</span>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary">Users:</label>
                            <select
                                className="form-select config-select"
                                value={emailUser}
                                onChange={e => handleEmailUserChange(e.target.value)}
                                disabled={fetchingUsers}
                            >
                                <option value="">Select User</option>
                                {userList.map(c => (
                                    <option key={`email-${c.id || c.client_id || c.unique_code}`} value={c.id || c.client_id || c.unique_code}>
                                        {c.name} {c.unique_code ? `(${c.unique_code})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary">Update Email Address:</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light text-muted border-end-0"><FiMail /></span>
                                <input
                                    type="email"
                                    className="form-control border-start-0"
                                    placeholder="example@gmail.com"
                                    value={emailAddr}
                                    onChange={e => setEmailAddr(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        className="btn btn-config-update w-100 py-2 mt-2 fw-semibold d-flex align-items-center justify-content-center"
                        onClick={handleUpdateEmail}
                        disabled={loadingEmail || fetchingUsers}
                    >
                        {loadingEmail ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Updating...
                            </>
                        ) : (
                            <>
                                <FiCheckCircle className="me-2" /> Update
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 4. Set Mobile Number Card */}
            <div className="col-12 col-md-6">
                <div className="card shadow-sm border-0 rounded-3 p-4 card-config h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                            <h5 className="fw-bold text-dark mb-0">Set Mobile Number</h5>
                            {fetchingUsers && <span className="badge bg-light text-muted small"><FiLoader className="me-1 spin" /> Loading...</span>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary">Users:</label>
                            <select
                                className="form-select config-select"
                                value={phoneUser}
                                onChange={e => handlePhoneUserChange(e.target.value)}
                                disabled={fetchingUsers}
                            >
                                <option value="">Select User</option>
                                {userList.map(c => (
                                    <option key={`phone-${c.id || c.client_id || c.unique_code}`} value={c.id || c.client_id || c.unique_code}>
                                        {c.name} {c.unique_code ? `(${c.unique_code})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary">Update Mobile Number:</label>
                            <div className="row g-2">
                                <div className="col-4">
                                    <select
                                        className="form-select"
                                        value={countryCode}
                                        onChange={e => setCountryCode(e.target.value)}
                                    >
                                        <option value="US">+1 (US)</option>
                                        <option value="IN">+91 (IN)</option>
                                    </select>
                                </div>
                                <div className="col-8">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0"><FiPhone /></span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0"
                                            placeholder="(912)-458-3320"
                                            value={phoneNum}
                                            onChange={e => setPhoneNum(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        className="btn btn-config-update w-100 py-2 mt-2 fw-semibold d-flex align-items-center justify-content-center"
                        onClick={handleUpdatePhone}
                        disabled={loadingPhone || fetchingUsers}
                    >
                        {loadingPhone ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Updating...
                            </>
                        ) : (
                            <>
                                <FiCheckCircle className="me-2" /> Update
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignedFileNumber;
