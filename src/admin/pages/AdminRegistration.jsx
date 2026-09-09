import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FiUserPlus,
    FiUsers,
    FiUserCheck,
    FiSend,
    FiSearch,
    FiRefreshCw,
    FiEye,
    FiEyeOff,
    FiChevronLeft,
    FiChevronRight,
    FiCheckCircle,
    FiAlertCircle,
    FiChevronDown,
    FiChevronUp,
    FiShield,
    FiBriefcase,
    FiCheck,
    FiFileText
} from "react-icons/fi";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import "./registration.css";

const AdminRegistration = () => {
    // Sub-tab State: 'user' or 'analyst'
    const [activeSubTab, setActiveSubTab] = useState("user");

    // Form Expansion Toggle
    const [isFormOpen, setIsFormOpen] = useState(true);

    // Form State
    const [roleType, setRoleType] = useState("user"); // "user" (usertype: 3) or "analyst" (usertype: 2)
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneCodeSelect, setPhoneCodeSelect] = useState("+1");
    const [customPhoneCode, setCustomPhoneCode] = useState("+");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Track touched fields for instant validation
    const [touched, setTouched] = useState({
        phone: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    // Table State
    const [userRecords, setUserRecords] = useState([]);
    const [analystRecords, setAnalystRecords] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [pushingVerificationId, setPushingVerificationId] = useState(null);

    const effectivePhoneCode = phoneCodeSelect === "other" ? customPhoneCode.trim() : phoneCodeSelect;

    // Helper to get user_id from localStorage for API auth validation
    const getUserId = () => {
        const currentUserVal = localStorage.getItem("currentUser");
        let userId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";

        if (currentUserVal) {
            try {
                const parsed = JSON.parse(currentUserVal);
                if (typeof parsed === "string") {
                    userId = parsed;
                } else if (parsed.user_id || parsed.id) {
                    userId = parsed.user_id || parsed.id;
                }
            } catch {
                if (typeof currentUserVal === "string" && currentUserVal.length > 5) {
                    userId = currentUserVal.replace(/"/g, "");
                }
            }
        } else {
            const userInfoStr = localStorage.getItem("userInfo");
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
                } catch {
                    // ignore
                }
            }
        }
        return userId;
    };

    // Validation helpers
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanPhoneDigits = phoneNumber.replace(/\D/g, "");

    const getEmailError = () => {
        if (!email) return "";
        if (!emailRegex.test(email.trim())) {
            return "Please enter a valid email address.";
        }
        return "";
    };

    const getPasswordError = () => {
        if (!password) return "";
        if (password.length < 6) {
            return "Password must be at least 6 characters.";
        }
        return "";
    };

    const getConfirmPasswordStatus = () => {
        if (!confirmPassword) return { error: "", isMatch: false };
        if (confirmPassword !== password) {
            return { error: "Passwords do not match.", isMatch: false };
        }
        return { error: "", isMatch: true };
    };

    const getPhoneError = () => {
        if (!phoneNumber) {
            if (roleType === "user") return "Phone number is required for user.";
            return "";
        }
        if (effectivePhoneCode === "+1" || effectivePhoneCode === "+91") {
            if (cleanPhoneDigits.length !== 10) {
                return "Phone number must be exactly 10 digits.";
            }
        } else {
            if (cleanPhoneDigits.length < 7 || cleanPhoneDigits.length > 15) {
                return "Phone number must be between 7 and 15 digits.";
            }
        }
        return "";
    };

    const emailError = getEmailError();
    const passwordError = getPasswordError();
    const { error: confirmPasswordError, isMatch: isConfirmPasswordMatch } = getConfirmPasswordStatus();
    const phoneError = getPhoneError();

    // Generate random strong password
    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
        let autoPass = "";
        for (let i = 0; i < 10; i++) {
            autoPass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(autoPass);
        setConfirmPassword(autoPass);
        setShowPassword(true);
        setShowConfirmPassword(true);
    };

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Format phone helper
    const formatPhoneNumber = (phone, ext = "+1") => {
        if (!phone) return "-";
        const cleaned = ("" + phone).replace(/\D/g, "");
        if (cleaned.length === 10) {
            return `${ext} (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return `${ext} ${phone}`;
    };

    // Load records from backend APIs:
    // 1. member/getUnverifiedUserList for User tab
    // 2. member/getanalystusers for Analyst tab
    const loadRecords = useCallback(async () => {
        setLoadingTable(true);
        const userId = getUserId();
        try {
            // Fetch unverified users list
            const resUsers = await adminServices.getUnverifiedUserList({ user_id: userId });
            if (resUsers?.data) {
                const list =
                    resUsers.data.unverifiedusers ||
                    resUsers.data.data ||
                    resUsers.data.users ||
                    [];
                setUserRecords(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            console.warn("getUnverifiedUserList API error:", err);
        }

        try {
            // Fetch analyst users list
            const resAnalysts = await adminServices.getanalystusers({ user_id: userId });
            if (resAnalysts?.data) {
                const list =
                    resAnalysts.data.analystusers ||
                    resAnalysts.data.data ||
                    resAnalysts.data.analysts ||
                    [];
                setAnalystRecords(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            console.warn("getanalystusers API error:", err);
        } finally {
            setLoadingTable(false);
        }
    }, []);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    // Handle Form Reset
    const handleResetForm = () => {
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setPhoneCodeSelect("+1");
        setCustomPhoneCode("+");
        setTouched({ phone: false, email: false, password: false, confirmPassword: false });
    };

    // Handle Form Submit -> Calls POST /login/register-analyst-user
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim()) {
            Swal.fire({
                title: "Missing Name",
                text: "Please enter both First Name and Last Name.",
                icon: "warning",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const cleanEmail = email.trim();
        if (!emailRegex.test(cleanEmail)) {
            Swal.fire({
                title: "Invalid Email",
                text: "Please enter a valid email address.",
                icon: "warning",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        if (roleType === "user" && !phoneNumber.trim()) {
            Swal.fire({
                title: "Phone Required",
                text: "Phone number is required for user registration.",
                icon: "warning",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const pErr = getPhoneError();
        if (phoneNumber.trim() && pErr) {
            Swal.fire({
                title: "Invalid Phone Number",
                text: pErr,
                icon: "warning",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        if (!password || password.length < 6) {
            Swal.fire({
                title: "Weak Password",
                text: "Password must be at least 6 characters long.",
                icon: "warning",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                title: "Passwords Do Not Match",
                text: "Password and Confirm Password must match exactly.",
                icon: "warning",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        setFormSubmitting(true);

        // API Payload structure:
        // usertype: 3 for Analyst, 2 for User
        const payload = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: cleanEmail,
            password: password,
            confirmpassword: confirmPassword,
            usertype: roleType === "analyst" ? 3 : 2,
            phone: cleanPhoneDigits || phoneNumber.trim() || undefined,
            mobileCountry: effectivePhoneCode || "+1"
        };

        try {
            const response = await adminServices.registerAnalystUser(payload);

            if (
                response?.status === 200 ||
                response?.data?.http_code === 200 ||
                response?.data?.status_code === 200 ||
                response?.data?.status === true ||
                response?.data?.status === 1 ||
                response?.data?.status === "success"
            ) {
                const successMsg =
                    response?.data?.status_smessage ||
                    response?.data?.message ||
                    `${roleType === "user" ? "User" : "Analyst"} ${firstName} ${lastName} has been registered successfully!`;

                Swal.fire({
                    title: "Registration Successful!",
                    text: successMsg,
                    icon: "success",
                    confirmButtonColor: "#1b2e6b"
                });

                handleResetForm();
                // Refresh list from backend
                loadRecords();
                setActiveSubTab(roleType === "user" ? "user" : "analyst");
            } else {
                const errorMsg =
                    response?.data?.status_smessage ||
                    response?.data?.message ||
                    "Registration could not be completed. Please try again.";

                Swal.fire({
                    title: "Registration Failed",
                    text: errorMsg,
                    icon: "error",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        } catch (err) {
            console.error("Registration API Error:", err);
            const errMsg =
                err?.response?.data?.status_smessage ||
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "An unexpected error occurred while registering. Please try again.";

            Swal.fire({
                title: "Error!",
                text: errMsg,
                icon: "error",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle "Push Verification" -> Calls POST member/forceverifycustomer { client_id: user.user_id }
    const handlePushVerification = async (user) => {
        const clientId = user.user_id || user.id || user.client_id;
        const displayName = user.user_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

        const result = await Swal.fire({
            title: "Push Verification?",
            text: `Confirm verification and file number assignment for ${displayName} (${user.email})?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#f97316",
            cancelButtonColor: "#94a3b8",
            confirmButtonText: "Yes, Push Verification",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            setPushingVerificationId(clientId);
            try {
                const response = await adminServices.forceverifycustomer({
                    client_id: clientId
                });

                if (
                    response?.status === 200 ||
                    response?.data?.http_code === 200 ||
                    response?.data?.status === true ||
                    response?.data?.status === 1
                ) {
                    const fileNumber = response?.data?.file_number;
                    const successMsg =
                        response?.data?.status_smessage ||
                        "Customer verified and assigned successfully.";

                    Swal.fire({
                        title: "Customer Verified!",
                        html: `
                            <p class="mb-2">${successMsg}</p>
                            ${fileNumber ? `<div class="p-2 bg-light rounded border text-primary fw-bold">Assigned File Number: ${fileNumber}</div>` : ""}
                        `,
                        icon: "success",
                        confirmButtonColor: "#1b2e6b"
                    });

                    // Refresh table data
                    loadRecords();
                } else {
                    const errorMsg =
                        response?.data?.status_smessage ||
                        response?.data?.message ||
                        "Failed to push verification.";

                    Swal.fire({
                        title: "Verification Failed",
                        text: errorMsg,
                        icon: "error",
                        confirmButtonColor: "#1b2e6b"
                    });
                }
            } catch (err) {
                console.error("Force verify error:", err);
                const errMsg =
                    err?.response?.data?.status_smessage ||
                    err?.response?.data?.message ||
                    "Could not push verification. Please check backend service.";

                Swal.fire({
                    title: "Action Failed",
                    text: errMsg,
                    icon: "error",
                    confirmButtonColor: "#1b2e6b"
                });
            } finally {
                setPushingVerificationId(null);
            }
        }
    };

    // Filter active records by search
    const currentDataset = activeSubTab === "user" ? userRecords : analystRecords;

    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return currentDataset;
        const q = searchTerm.toLowerCase().trim();
        return currentDataset.filter((item) => {
            const fullName = (item.user_name || `${item.first_name || ""} ${item.last_name || ""}`).toLowerCase();
            const emailMatch = (item.email || "").toLowerCase().includes(q);
            const phoneMatch = (item.phone || "").toString().includes(q);
            const idMatch = (item.user_id || item.id || "").toString().toLowerCase().includes(q);
            return fullName.includes(q) || emailMatch || phoneMatch || idMatch;
        });
    }, [currentDataset, searchTerm]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRecords.slice(start, start + rowsPerPage);
    }, [filteredRecords, currentPage, rowsPerPage]);

    // Reset pagination when subtab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeSubTab, searchTerm, rowsPerPage]);

    // Stats calculations
    const totalUsersCount = userRecords.length;
    const totalAnalystsCount = analystRecords.length;

    return (
        <div className="admin-registration-container">
            {/* Header Title & Stats Bar */}
            <div className="registration-header-bar">
                <div className="reg-title-group">
                    <h2>
                        <span className="reg-title-icon-badge">
                            <FiUserPlus size={20} />
                        </span>
                        Registration & Account Management
                    </h2>
                    <p>Register new users and analysts, view unverified users directory, and push verifications.</p>
                </div>

                <div className="reg-stats-badges">
                    <div className="reg-stat-pill">
                        <div className="reg-stat-icon user">
                            <FiUsers />
                        </div>
                        <div className="reg-stat-info">
                            <span className="reg-stat-count">{totalUsersCount}</span>
                            <span className="reg-stat-label">Unverified Users</span>
                        </div>
                    </div>

                    <div className="reg-stat-pill">
                        <div className="reg-stat-icon analyst">
                            <FiBriefcase />
                        </div>
                        <div className="reg-stat-info">
                            <span className="reg-stat-count">{totalAnalystsCount}</span>
                            <span className="reg-stat-label">Analysts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Form Card */}
            <div className="reg-form-card">
                <div className="reg-form-header">
                    <div className="reg-form-title">
                        <FiUserPlus className="text-primary" size={18} />
                        <div>
                            <h4>Create New Registration</h4>
                            <span className="reg-form-subtitle">Register a new User (Client) or Analyst</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="reg-collapse-btn"
                        onClick={() => setIsFormOpen(!isFormOpen)}
                    >
                        {isFormOpen ? (
                            <>
                                <FiChevronUp size={15} /> Hide Form
                            </>
                        ) : (
                            <>
                                <FiChevronDown size={15} /> Show Form
                            </>
                        )}
                    </button>
                </div>

                {isFormOpen && (
                    <div className="reg-form-body">
                        {/* Role Selector Segment */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                            <div className="role-segment-selector">
                                <button
                                    type="button"
                                    className={`role-segment-btn ${roleType === "user" ? "active" : ""}`}
                                    onClick={() => setRoleType("user")}
                                >
                                    <FiUsers size={16} /> User (Client)
                                </button>
                                <button
                                    type="button"
                                    className={`role-segment-btn ${roleType === "analyst" ? "active" : ""}`}
                                    onClick={() => setRoleType("analyst")}
                                >
                                    <FiBriefcase size={16} /> Analyst
                                </button>
                            </div>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 rounded-pill px-3"
                                onClick={generatePassword}
                            >
                                <FiShield size={13} /> Auto-Generate Password
                            </button>
                        </div>

                        {/* Form Inputs */}
                        <form onSubmit={handleFormSubmit}>
                            <div className="row g-3">
                                {/* First Name */}
                                <div className="col-md-6 col-lg-3">
                                    <label className="reg-input-label">
                                        First Name <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="reg-input-field"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="col-md-6 col-lg-3">
                                    <label className="reg-input-label">
                                        Last Name <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="reg-input-field"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Phone Code & Number */}
                                <div className="col-md-6 col-lg-3">
                                    <label className="reg-input-label">
                                        Phone Number {roleType === "user" && <span className="required-star">*</span>}
                                        {roleType === "analyst" && <span className="text-muted small fw-normal ms-1">(Optional)</span>}
                                    </label>
                                    <div className="d-flex gap-2">
                                        <div style={{ width: "90px", flexShrink: 0 }}>
                                            {phoneCodeSelect === "other" ? (
                                                <input
                                                    type="text"
                                                    className="reg-input-field text-center px-1"
                                                    value={customPhoneCode}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (val && !val.startsWith("+")) {
                                                            val = "+" + val.replace(/\+/g, "");
                                                        }
                                                        setCustomPhoneCode(val);
                                                    }}
                                                    placeholder="+XX"
                                                />
                                            ) : (
                                                <select
                                                    className="reg-select-field text-center"
                                                    value={phoneCodeSelect}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setPhoneCodeSelect(val);
                                                        if (val === "other") setCustomPhoneCode("+");
                                                    }}
                                                >
                                                    <option value="+1">+1 (US)</option>
                                                    <option value="+91">+91 (IN)</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <input
                                                type="tel"
                                                className={`reg-input-field ${touched.phone && phoneError ? "is-invalid" : ""}`}
                                                placeholder={phoneCodeSelect === "+1" ? "10-digit number" : "Phone number"}
                                                value={phoneNumber}
                                                onChange={(e) => {
                                                    setPhoneNumber(e.target.value);
                                                    setTouched((prev) => ({ ...prev, phone: true }));
                                                }}
                                                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                                                required={roleType === "user"}
                                            />
                                        </div>
                                    </div>
                                    {touched.phone && phoneError && (
                                        <div className="reg-helper-feedback error">
                                            <FiAlertCircle size={12} /> {phoneError}
                                        </div>
                                    )}
                                </div>

                                {/* Email ID */}
                                <div className="col-md-6 col-lg-3">
                                    <label className="reg-input-label">
                                        Email Address <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`reg-input-field ${touched.email && emailError ? "is-invalid" : ""}`}
                                        placeholder="e.g. name@example.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setTouched((prev) => ({ ...prev, email: true }));
                                        }}
                                        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                                        required
                                    />
                                    {touched.email && emailError && (
                                        <div className="reg-helper-feedback error">
                                            <FiAlertCircle size={12} /> {emailError}
                                        </div>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="col-md-6 col-lg-3">
                                    <label className="reg-input-label">
                                        Password <span className="required-star">*</span>
                                    </label>
                                    <div className="reg-password-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className={`reg-input-field ${touched.password && passwordError ? "is-invalid" : ""}`}
                                            placeholder="Min. 6 characters"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setTouched((prev) => ({ ...prev, password: true }));
                                            }}
                                            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="reg-pass-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                    {touched.password && passwordError && (
                                        <div className="reg-helper-feedback error">
                                            <FiAlertCircle size={12} /> {passwordError}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="col-md-6 col-lg-3">
                                    <label className="reg-input-label">
                                        Confirm Password <span className="required-star">*</span>
                                    </label>
                                    <div className="reg-password-group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className={`reg-input-field ${confirmPassword && confirmPasswordError ? "is-invalid" : isConfirmPasswordMatch ? "is-valid" : ""}`}
                                            placeholder="Re-enter password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setTouched((prev) => ({ ...prev, confirmPassword: true }));
                                            }}
                                            onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="reg-pass-toggle-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            title={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                    {confirmPassword && confirmPasswordError && (
                                        <div className="reg-helper-feedback error">
                                            <FiAlertCircle size={12} /> {confirmPasswordError}
                                        </div>
                                    )}
                                    {confirmPassword && isConfirmPasswordMatch && (
                                        <div className="reg-helper-feedback success">
                                            <FiCheckCircle size={12} /> Passwords match!
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="reg-form-actions">
                                <button
                                    type="button"
                                    className="btn-reg-reset"
                                    onClick={handleResetForm}
                                    disabled={formSubmitting}
                                >
                                    Clear Form
                                </button>
                                <button
                                    type="submit"
                                    className="btn-reg-submit"
                                    disabled={formSubmitting}
                                >
                                    {formSubmitting ? (
                                        <>
                                            <FiRefreshCw className="spin-animation" size={15} /> Registering...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheck size={16} /> Register {roleType === "user" ? "User" : "Analyst"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Sub-Tabs & Records Directory */}
            <div className="reg-records-card">
                {/* Subtabs and Search Toolbar */}
                <div className="reg-subtabs-toolbar">
                    <div className="reg-subtabs-nav">
                        <button
                            type="button"
                            className={`reg-subtab-btn ${activeSubTab === "user" ? "active" : ""}`}
                            onClick={() => setActiveSubTab("user")}
                        >
                            <FiUsers size={16} />
                            <span>Users (Unverified)</span>
                            <span className="reg-subtab-badge">{userRecords.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`reg-subtab-btn ${activeSubTab === "analyst" ? "active" : ""}`}
                            onClick={() => setActiveSubTab("analyst")}
                        >
                            <FiBriefcase size={16} />
                            <span>Analysts</span>
                            <span className="reg-subtab-badge">{analystRecords.length}</span>
                        </button>
                    </div>

                    <div className="reg-toolbar-controls">
                        <div className="reg-search-box">
                            <input
                                type="text"
                                className="reg-search-input"
                                placeholder={`Search ${activeSubTab === "user" ? "users" : "analysts"} by name, email...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FiSearch className="reg-search-icon" />
                        </div>

                        <button
                            type="button"
                            className="reg-refresh-btn"
                            onClick={loadRecords}
                            title="Refresh Records"
                            disabled={loadingTable}
                        >
                            <FiRefreshCw className={loadingTable ? "spin-animation" : ""} size={16} />
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="reg-table-responsive">
                    <table className="reg-table">
                        <thead>
                            {activeSubTab === "user" ? (
                                <tr>
                                    <th style={{ width: "60px" }}>#</th>
                                    <th>User Name</th>
                                    <th>Email Address</th>
                                    <th>User ID</th>
                                    <th>Verification Status</th>
                                    <th style={{ textAlign: "center", width: "180px" }}>Action</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th style={{ width: "60px" }}>#</th>
                                    <th>Analyst Name</th>
                                    <th>Email Address</th>
                                    <th>User ID</th>
                                    <th>Role / Status</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {loadingTable ? (
                                <tr>
                                    <td colSpan={activeSubTab === "user" ? 6 : 5} className="text-center py-5">
                                        <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                                            <FiRefreshCw className="spin-animation text-primary" size={26} />
                                            <span className="text-muted small">Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={activeSubTab === "user" ? 6 : 5} className="p-0">
                                        <div className="reg-empty-state">
                                            <div className="reg-empty-icon">
                                                <FiUsers />
                                            </div>
                                            <div className="reg-empty-title">
                                                No {activeSubTab === "user" ? "Unverified Users" : "Analysts"} Found
                                            </div>
                                            <div className="reg-empty-desc">
                                                {searchTerm
                                                    ? `No matches found for query "${searchTerm}". Try resetting search.`
                                                    : `No ${activeSubTab === "user" ? "unverified users" : "analysts"} currently in the database.`}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((record, index) => {
                                    const rowNum = (currentPage - 1) * rowsPerPage + index + 1;
                                    const fullName = record.user_name || `${record.first_name || ""} ${record.last_name || ""}`.trim() || "User " + (record.user_id || index + 1);
                                    const currentId = record.user_id || record.id || record.client_id;
                                    const isPushing = pushingVerificationId === currentId;

                                    if (activeSubTab === "user") {
                                        return (
                                            <tr key={currentId || index}>
                                                <td className="text-muted fw-semibold">{rowNum}</td>
                                                <td>
                                                    <div className="user-name-cell">
                                                        <div className="user-avatar-initials">
                                                            {getInitials(fullName)}
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            <span className="name-text">{fullName}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <a
                                                        href={`mailto:${record.email}`}
                                                        className="reg-email-link"
                                                        title={`Email ${record.email}`}
                                                    >
                                                        {record.email || "-"}
                                                    </a>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-secondary border px-2 py-1 font-monospace">
                                                        ID: {currentId}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="status-badge pending">
                                                        <FiAlertCircle size={13} /> Pending Verification
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        type="button"
                                                        className="btn-push-verification"
                                                        onClick={() => handlePushVerification(record)}
                                                        disabled={isPushing}
                                                        title="Push verification and generate file number"
                                                    >
                                                        {isPushing ? (
                                                            <>
                                                                <FiRefreshCw className="spin-animation" size={13} /> Verifying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiSend size={13} /> Push Verification
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    // Analyst Row (No action button as specified)
                                    return (
                                        <tr key={currentId || index}>
                                            <td className="text-muted fw-semibold">{rowNum}</td>
                                            <td>
                                                <div className="user-name-cell">
                                                    <div className="user-avatar-initials analyst">
                                                        {getInitials(fullName)}
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <span className="name-text">{fullName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <a
                                                    href={`mailto:${record.email}`}
                                                    className="reg-email-link"
                                                    title={`Email ${record.email}`}
                                                >
                                                    {record.email || "-"}
                                                </a>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-secondary border px-2 py-1 font-monospace">
                                                    ID: {currentId}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="status-badge active">
                                                    <FiBriefcase size={13} /> Analyst
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {filteredRecords.length > 0 && (
                    <div className="reg-pagination-footer">
                        <div className="reg-pagination-info">
                            Showing{" "}
                            <span className="fw-semibold">
                                {(currentPage - 1) * rowsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="fw-semibold">
                                {Math.min(currentPage * rowsPerPage, filteredRecords.length)}
                            </span>{" "}
                            of <span className="fw-semibold">{filteredRecords.length}</span> records
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <span className="small text-muted">Rows:</span>
                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: "70px" }}
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="reg-pagination-actions">
                                <button
                                    type="button"
                                    className="reg-page-btn"
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    title="Previous Page"
                                >
                                    <FiChevronLeft size={16} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((p, idx, arr) => {
                                        const prev = arr[idx - 1];
                                        return (
                                            <React.Fragment key={p}>
                                                {prev && p - prev > 1 && (
                                                    <span className="px-1 text-muted">...</span>
                                                )}
                                                <button
                                                    type="button"
                                                    className={`reg-page-btn ${currentPage === p ? "active" : ""}`}
                                                    onClick={() => setCurrentPage(p)}
                                                >
                                                    {p}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}

                                <button
                                    type="button"
                                    className="reg-page-btn"
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    title="Next Page"
                                >
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRegistration;
