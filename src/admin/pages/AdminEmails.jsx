import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown, FiX, FiUser, FiMail, FiSearch } from "react-icons/fi";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import "./emails.css";

const AdminEmails = () => {
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [showNameSuggestions, setShowNameSuggestions] = useState(false);
    const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const nameWrapperRef = useRef(null);
    const emailWrapperRef = useRef(null);

    // Extract credentials helper
    const getCredentials = () => {
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
        return { userId, taxYear: getStoredTaxYear() };
    };

    // Close suggestion dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (nameWrapperRef.current && !nameWrapperRef.current.contains(event.target)) {
                setShowNameSuggestions(false);
            }
            if (emailWrapperRef.current && !emailWrapperRef.current.contains(event.target)) {
                setShowEmailSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load available email templates & customer users list
    useEffect(() => {
        const fetchTemplates = async () => {
            setTemplatesLoading(true);
            try {
                const { userId } = getCredentials();
                const res = await adminServices.emailtemplates({ user_id: userId });
                const list = res?.data?.templatesinfo || res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
                if (Array.isArray(list) && list.length > 0) {
                    const mapped = list.map((tmpl, idx) => ({
                        id: String(tmpl.ettemplateid || tmpl.id || idx + 1),
                        label: tmpl.ettemplatedisplay || tmpl.etname || tmpl.title || tmpl.name || `Template ${idx + 1}`
                    }));
                    setTemplates(mapped);
                    if (mapped[0]?.id) setSelectedTemplate(mapped[0].id);
                } else {
                    setTemplates([]);
                }
            } catch (err) {
                console.error("Failed to load email templates from API:", err);
                setTemplates([]);
            } finally {
                setTemplatesLoading(false);
            }
        };

        const fetchAllUsers = async () => {
            setUsersLoading(true);
            try {
                const { userId, taxYear } = getCredentials();
                let rawList = [];

                // Try usersliist first
                try {
                    const res = await adminServices.usersliist({
                        user_id: userId,
                        taxYear: String(taxYear)
                    });
                    if (res?.data) {
                        rawList = res.data.data || res.data.users || res.data.list || (Array.isArray(res.data) ? res.data : []);
                    }
                } catch (e) {
                    console.warn("usersliist fallback to alluserslist:", e);
                }

                // Fallback to alluserslist
                if (!rawList || rawList.length === 0) {
                    const resAll = await adminServices.alluserslist({
                        filestate: "ALL",
                        user_id: userId,
                        taxYear: String(taxYear),
                        per_page: 500,
                        page: 1
                    });
                    if (resAll?.data) {
                        rawList = resAll.data.data || resAll.data.users || resAll.data.list || (Array.isArray(resAll.data) ? resAll.data : []);
                    }
                }

                const mapped = (rawList || []).map((item, idx) => {
                    const uId = item.u_user_id || item.user_id || item.client_id || item.id || idx;
                    const uName = item.user_name || item.client_name || item.name || `${item.first_name || ""} ${item.last_name || ""}`.trim() || "";
                    const uEmail = item.email || item.email_id || item.emailaddress || item.email_address || "";
                    const uFilenumber = item.unique_code || item.filenumber || item.file_number || "";
                    return {
                        id: uId,
                        name: uName,
                        email: uEmail,
                        filenumber: uFilenumber
                    };
                }).filter(u => u.name || u.email);

                setAllUsers(mapped);
            } catch (err) {
                console.error("Failed to fetch all users list:", err);
            } finally {
                setUsersLoading(false);
            }
        };

        fetchTemplates();
        fetchAllUsers();
    }, []);

    // Handle pick from suggestions
    const handleSelectUser = (user) => {
        setName(user.name || "");
        setEmail(user.email || "");
        setShowNameSuggestions(false);
        setShowEmailSuggestions(false);
    };

    // Filter suggestions based on name query
    const filteredByName = allUsers.filter((u) => {
        const q = name.toLowerCase().trim();
        if (!q) return true;
        return (
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.filenumber && String(u.filenumber).toLowerCase().includes(q))
        );
    });

    // Filter suggestions based on email query
    const filteredByEmail = allUsers.filter((u) => {
        const q = email.toLowerCase().trim();
        if (!q) return true;
        return (
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.filenumber && String(u.filenumber).toLowerCase().includes(q))
        );
    });

    // Submit single user email
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTemplate) {
            Swal.fire({
                icon: "warning",
                title: "Template Required",
                text: "Please select an email template.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        if (!name.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Name Required",
                text: "Please enter or select a client name.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        if (!email.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Email Required",
                text: "Please enter a valid email address.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Email",
                text: "Please enter a valid email format.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        setSubmitting(true);
        try {
            const { userId } = getCredentials();
            const payload = {
                ettemplateid: selectedTemplate,
                clientname: name.trim(),
                useremail: email.trim(),
                user_id: userId
            };
            const res = await adminServices.sendEmailToClient(payload);

            const selectedTmplObj = templates.find((t) => t.id === selectedTemplate);
            const tmplName = selectedTmplObj ? selectedTmplObj.label : selectedTemplate;

            if (res?.data?.http_code !== 999 && res?.data?.status !== false) {
                Swal.fire({
                    icon: "success",
                    title: "Email Sent!",
                    text: `"${tmplName}" email has been sent successfully to ${name.trim()} (${email.trim()}).`,
                    confirmButtonColor: "#1b2e6b"
                });
                setName("");
                setEmail("");
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Send",
                    text: res?.data?.status_smessage || "Could not send email. Please verify email template settings.",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        } catch (error) {
            console.error("Error sending email:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "An error occurred while sending email. Please try again.",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-emails-container">
            {/* Main Heading */}
            <h1 className="emails-main-title">Sending Emails To Client</h1>

            <form className="emails-form-wrapper" onSubmit={handleSubmit}>
                {/* Occasion / Template Dropdown */}
                <div className="emails-select-group">
                    <select
                        className="emails-select-input"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        disabled={templatesLoading || templates.length === 0}
                    >
                        {templatesLoading ? (
                            <option value="">Loading templates...</option>
                        ) : templates.length === 0 ? (
                            <option value="">No templates available</option>
                        ) : (
                            templates.map((tmpl) => (
                                <option key={tmpl.id} value={tmpl.id}>
                                    {tmpl.label}
                                </option>
                            ))
                        )}
                    </select>
                    <FiChevronDown className="emails-select-arrow" />
                </div>

                {/* Input Fields Row with Auto-suggestions */}
                <div className="emails-inputs-row">
                    {/* Name Input with Autocomplete Dropdown */}
                    <div className="emails-input-box position-relative" ref={nameWrapperRef}>
                        <div className="emails-input-with-icon">
                            <FiUser className="input-leading-icon" />
                            <input
                                type="text"
                                className="emails-text-input"
                                placeholder="Client Name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setShowNameSuggestions(true);
                                }}
                                onFocus={() => setShowNameSuggestions(true)}
                                autoComplete="off"
                            />
                            {name && (
                                <button
                                    type="button"
                                    className="input-clear-btn"
                                    onClick={() => setName("")}
                                    title="Clear name"
                                >
                                    <FiX size={14} />
                                </button>
                            )}
                        </div>

                        {/* Name Suggestions Dropdown */}
                        {showNameSuggestions && (
                            <div className="emails-suggestion-dropdown">
                                {usersLoading ? (
                                    <div className="suggestion-item text-muted small py-2 text-center">
                                        Loading users...
                                    </div>
                                ) : filteredByName.length === 0 ? (
                                    <div className="suggestion-item text-muted small py-2 px-3">
                                        No matching user (custom name)
                                    </div>
                                ) : (
                                    filteredByName.slice(0, 8).map((user) => (
                                        <div
                                            key={user.id}
                                            className="suggestion-item"
                                            onMouseDown={() => handleSelectUser(user)}
                                        >
                                            <div className="suggestion-user-info">
                                                <span className="suggestion-name">{user.name}</span>
                                                <span className="suggestion-email">{user.email}</span>
                                            </div>
                                            {user.filenumber && (
                                                <span className="suggestion-badge">#{user.filenumber}</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Email Input with Autocomplete Dropdown */}
                    <div className="emails-input-box position-relative" ref={emailWrapperRef}>
                        <div className="emails-input-with-icon">
                            <FiMail className="input-leading-icon" />
                            <input
                                type="email"
                                className="emails-text-input"
                                placeholder="Client Email Id"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setShowEmailSuggestions(true);
                                }}
                                onFocus={() => setShowEmailSuggestions(true)}
                                autoComplete="off"
                            />
                            {email && (
                                <button
                                    type="button"
                                    className="input-clear-btn"
                                    onClick={() => setEmail("")}
                                    title="Clear email"
                                >
                                    <FiX size={14} />
                                </button>
                            )}
                        </div>

                        {/* Email Suggestions Dropdown */}
                        {showEmailSuggestions && (
                            <div className="emails-suggestion-dropdown">
                                {usersLoading ? (
                                    <div className="suggestion-item text-muted small py-2 text-center">
                                        Loading users...
                                    </div>
                                ) : filteredByEmail.length === 0 ? (
                                    <div className="suggestion-item text-muted small py-2 px-3">
                                        No matching user (custom email)
                                    </div>
                                ) : (
                                    filteredByEmail.slice(0, 8).map((user) => (
                                        <div
                                            key={user.id}
                                            className="suggestion-item"
                                            onMouseDown={() => handleSelectUser(user)}
                                        >
                                            <div className="suggestion-user-info">
                                                <span className="suggestion-name">{user.name}</span>
                                                <span className="suggestion-email">{user.email}</span>
                                            </div>
                                            {user.filenumber && (
                                                <span className="suggestion-badge">#{user.filenumber}</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Action Button */}
                <div className="emails-submit-row">
                    <button
                        type="submit"
                        className="btn btn-emails-submit"
                        disabled={submitting}
                    >
                        {submitting ? "Sending..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminEmails;
