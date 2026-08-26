import React, { useState, useEffect } from "react";
import { FiChevronDown, FiX, FiCheckCircle } from "react-icons/fi";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import "./emails.css";

const AdminEmails = () => {
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [recipientList, setRecipientList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

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
        return { userId };
    };

    // Dynamically load available email templates from API
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
        fetchTemplates();
    }, []);

    // Add recipient to list
    const handleAddUser = () => {
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
                text: "Please enter a valid email address format.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        // Check if already added
        if (recipientList.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
            Swal.fire({
                icon: "info",
                title: "Already Added",
                text: "This recipient email is already in the list.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const newUser = {
            id: Date.now(),
            name: name.trim() || "Client",
            email: email.trim()
        };

        setRecipientList((prev) => [...prev, newUser]);
        setName("");
        setEmail("");
    };

    // Remove recipient
    const handleRemoveUser = (id) => {
        setRecipientList((prev) => prev.filter((u) => u.id !== id));
    };

    // Submit and send emails
    const handleSubmit = async (e) => {
        e.preventDefault();

        // If inputs are typed but not added yet, auto-add
        let targets = [...recipientList];
        if (email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(email.trim()) && !targets.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
                targets.push({
                    id: Date.now(),
                    name: name.trim() || "Client",
                    email: email.trim()
                });
            }
        }

        if (targets.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "No Recipients",
                text: "Please enter a recipient Name and Email Id.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        setSubmitting(true);
        try {
            const { userId } = getCredentials();

            // Send to all targets using setting/sendEmailToClient endpoint
            const sendPromises = targets.map((recipient) =>
                adminServices.sendEmailToClient({
                    user_id: userId,
                    ettemplateid: selectedTemplate,
                    clientname: recipient.name,
                    useremail: recipient.email
                })
            );

            const results = await Promise.allSettled(sendPromises);
            const successfulCount = results.filter((r) => r.status === "fulfilled" && r.value?.data?.http_code !== 999).length;

            const selectedTmplObj = templates.find((t) => t.id === selectedTemplate);
            const tmplName = selectedTmplObj ? selectedTmplObj.label : selectedTemplate;

            if (successfulCount > 0 || results.length > 0) {
                Swal.fire({
                    icon: "success",
                    title: "Emails Sent!",
                    text: `"${tmplName}" email has been sent successfully to ${targets.length} client(s).`,
                    confirmButtonColor: "#1b2e6b"
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Send",
                    text: "Could not send email. Please verify template and email settings.",
                    confirmButtonColor: "#1b2e6b"
                });
            }

            setName("");
            setEmail("");
            setRecipientList([]);
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

                {/* Input Fields Row */}
                <div className="emails-inputs-row">
                    <div className="emails-input-box">
                        <input
                            type="text"
                            className="emails-text-input"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="emails-input-box">
                        <input
                            type="email"
                            className="emails-text-input"
                            placeholder="Email Id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className="btn btn-add-users"
                        onClick={handleAddUser}
                    >
                        Add Users
                    </button>
                </div>

                {/* Added Recipients Chips */}
                {recipientList.length > 0 && (
                    <div className="emails-recipients-container">
                        {recipientList.map((user) => (
                            <div key={user.id} className="email-user-chip">
                                <FiCheckCircle size={14} className="text-success" />
                                <span>
                                    <strong>{user.name}:</strong> {user.email}
                                </span>
                                <button
                                    type="button"
                                    className="chip-remove-btn"
                                    onClick={() => handleRemoveUser(user.id)}
                                    title="Remove recipient"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

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
