import React, { useState, useEffect } from "react";
import {
    FiFileText,
    FiCreditCard,
    FiUserPlus,
    FiInfo,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import "./referrals.css";
import { webservices } from "../servics/CustomerServices";

const Referrals = () => {
    const [view, setView] = useState("list"); // 'list' or 'form'
    const [referralHistory, setReferralHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // User details for prefilling
    const [userProfile, setUserProfile] = useState({
        name: "Somya Sahoo",
        email: "somya.sahoo@example.com"
    });

    // Form inputs
    const [friendName, setFriendName] = useState("");
    const [friendEmail, setFriendEmail] = useState("");
    const [friendPhone, setFriendPhone] = useState("");
    const [emailError, setEmailError] = useState("");
    const [nameError, setNameError] = useState("");

    const fetchReferrals = async () => {
        const userInfoStr = localStorage.getItem("userInfo");
        if (!userInfoStr) return;

        try {
            setLoading(true);
            const userInfo = JSON.parse(userInfoStr);
            const client_id = userInfo.client_id;
            const taxYear = userInfo.taxyear || userInfo.taxYear || userInfo.current_year || String(new Date().getFullYear());

            const payload = {
                taxYear: String(taxYear),
                client_id: String(client_id)
            };

            const response = await webservices.refferalslist(payload);
            let rawList = [];
            if (response.data) {
                rawList = Array.isArray(response.data)
                    ? response.data
                    : (Array.isArray(response.data.data) ? response.data.data : []);
            }

            const formattedHistory = rawList.map(ref => {
                let dateStr = "N/A";
                const createdDate = ref.created_at || ref.rf_created_at;
                if (createdDate) {
                    const d = new Date(createdDate);
                    dateStr = d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    });
                }

                let status = ref.status || ref.rf_status || "Pending";
                if (status === 1 || status === "1" || status === "Completed") status = "Completed";
                else status = "Pending";

                return {
                    id: ref.rf_id || ref.id || Math.random(),
                    name: ref.rf_name || "Unknown Friend",
                    email: ref.rf_email || "N/A",
                    phone: ref.rf_phone || "",
                    date: dateStr,
                    status: status,
                    earnings: status === "Completed" ? 100 : 0
                };
            });

            setReferralHistory(formattedHistory);
        } catch (error) {
            console.error("Error fetching referrals:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load history and user profile from localStorage/API
    useEffect(() => {
        if (view === "list") {
            fetchReferrals();
        }

        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
            try {
                const uinfo = JSON.parse(userInfoStr);
                setUserProfile({
                    name: uinfo.user_name || "Somya Sahoo",
                    email: uinfo.email || "somya.sahoo@example.com"
                });
            } catch (e) {
                console.error(e);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    // Calculate stats
    const friendsReferred = referralHistory.length;
    const creditEarned = referralHistory
        .filter(r => r.status === "Completed")
        .reduce((sum, r) => sum + r.earnings, 0);

    // Form submit handler
    const handleSubmitInvite = async (e) => {
        e.preventDefault();
        setEmailError("");
        setNameError("");

        let isValid = true;
        if (!friendName.trim()) {
            setNameError("Full name is required");
            isValid = false;
        }

        if (!friendEmail.trim()) {
            setEmailError("Email address is required");
            isValid = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(friendEmail)) {
                setEmailError("Please enter a valid email address");
                isValid = false;
            }
        }

        if (!isValid) return;

        // Check if already referred
        if (referralHistory.some(r => r.email.toLowerCase() === friendEmail.toLowerCase())) {
            setEmailError("This email has already been referred");
            return;
        }

        const userInfoStr = localStorage.getItem("userInfo");
        if (!userInfoStr) {
            alert("Session expired. Please log in again.");
            return;
        }

        try {
            setLoading(true);
            const userInfo = JSON.parse(userInfoStr);

            const payload = {
                rf_on_name: userInfo.user_name || userProfile.name,
                rf_on_email: userInfo.email || userProfile.email,
                rf_on_phone: userInfo.phone || userInfo.phone_number || "",
                rf_on_phone_ext: userInfo.mobileCountry || "INDIA",
                rf_name: friendName,
                rf_email: friendEmail,
                rf_phone: friendPhone || "",
                rf_phone_ext: "INDIA",
                rf_comment: "Referral invitation",
                rf_user_id: userInfo.user_id,
                user_id: userInfo.user_id
            };

            const response = await webservices.saveReferralContact(payload);
            if (response.data && (response.status === 200 || response.data.http_code === 200)) {
                alert("Referral invitation successfully sent!");
                setFriendName("");
                setFriendEmail("");
                setFriendPhone("");
                setView("list");
            } else {
                alert(response.data.status_smessage || "Failed to send referral invitation. Please try again.");
            }
        } catch (error) {
            console.error("Error saving referral:", error);
            alert("An error occurred during referral submission. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-details-wrapper ref-page-container">
            {view === "list" ? (
                /* ════════════════════════════════════════
                   LIST VIEW
                   ════════════════════════════════════════ */
                <>
                    {/* Header */}
                    <header className="profile-header mb-4">
                        <span className="profile-pre-heading">WELCOME</span>
                        <h1 className="profile-page-title">Your Referral</h1>
                    </header>

                    {/* KPI Cards Grid */}
                    <div className="row g-4 mb-4">
                        <div className="col-12 col-md-6">
                            <div className="ref-metric-card p-4 bg-white rounded border d-flex align-items-center gap-3">
                                <div className="ref-metric-icon-box green">
                                    <FiFileText size={20} />
                                </div>
                                <div className="text-start">
                                    <h3 className="ref-metric-val mb-0">{friendsReferred}</h3>
                                    <p className="ref-metric-label text-muted mb-0 small">Friends referred</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <div className="ref-metric-card p-4 bg-white rounded border d-flex align-items-center gap-3">
                                <div className="ref-metric-icon-box orange">
                                    <FiCreditCard size={20} />
                                </div>
                                <div className="text-start">
                                    <h3 className="ref-metric-val mb-0">${creditEarned}</h3>
                                    <p className="ref-metric-label text-muted mb-0 small">Credit earned</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main List Card Container */}
                    <div className="profile-form-card bg-white">
                        {/* Section Header */}
                        <div className="profile-section-header">
                            <h2 className="profile-section-title">Your Referral</h2>
                            <button
                                className="btn btn-primary btn-add-ref px-4 py-2 small fw-semibold"
                                onClick={() => setView("form")}
                            >
                                Add Referral
                            </button>
                        </div>

                        {/* Card Body */}
                        {loading && referralHistory.length === 0 ? (
                            <div className="ref-empty-body text-center d-flex flex-column align-items-center justify-content-center py-5 px-3" style={{ minHeight: "300px" }}>
                                <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mt-3 fw-semibold">Loading referrals...</p>
                            </div>
                        ) : referralHistory.length === 0 ? (
                            /* Empty State Match to Figma */
                            <div className="ref-empty-body text-center d-flex flex-column align-items-center justify-content-center py-5 px-3">
                                <div className="ref-empty-user-box mb-3 d-flex align-items-center justify-content-center">
                                    <FiUserPlus size={32} />
                                </div>
                                <h3 className="ref-empty-title mb-2">No referrals yet</h3>
                                <p className="ref-empty-subtitle text-muted mb-4">Invite a friend and you get upto $100 on filing.</p>
                                <button
                                    className="btn btn-primary btn-invite-first px-4 py-2.5 fw-semibold"
                                    onClick={() => setView("form")}
                                >
                                    Invite your first friend
                                </button>
                            </div>
                        ) : (
                            /* Referral History List */
                            <div className="table-responsive">
                                <table className="table ref-history-table mb-0">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="ps-4">Friend's Name</th>
                                            <th scope="col">Friend's Email</th>
                                            <th scope="col">Invited Date</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end pe-4">Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referralHistory.map(row => (
                                            <tr key={row.id} className="align-middle">
                                                <td className="ps-4 fw-semibold text-dark">{row.name}</td>
                                                <td className="text-muted">{row.email}</td>
                                                <td className="text-muted">{row.date}</td>
                                                <td>
                                                    <span className={`ref-badge ${row.status.toLowerCase()}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="text-end pe-4 fw-bold text-dark">
                                                    {row.status === "Completed" ? `+$${row.earnings}` : "$0"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Footer */}
                        <div className="ref-pagination-footer px-4 py-3 bg-light border-top d-flex align-items-center justify-content-between flex-wrap gap-2 text-muted small">
                            <div className="d-flex align-items-center gap-2">
                                <span>Row per page</span>
                                <select className="form-select select-rows-dropdown py-1 border rounded">
                                    <option value="10">10 / page</option>
                                    <option value="20">20 / page</option>
                                    <option value="50">50 / page</option>
                                </select>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <button className="btn btn-link-arrow p-1 border-0 bg-transparent text-muted" disabled>
                                    <FiChevronLeft size={16} />
                                </button>
                                <button className="btn btn-page-number active">1</button>
                                <span className="mx-1">...</span>
                                <button className="btn btn-page-number">4</button>
                                <button className="btn btn-page-number">5</button>
                                <button className="btn btn-page-number">6</button>
                                <button className="btn btn-page-number">7</button>
                                <button className="btn btn-page-number">8</button>
                                <span className="mx-1">...</span>
                                <button className="btn btn-page-number">50</button>
                                <button className="btn btn-link-arrow p-1 border-0 bg-transparent text-muted" disabled>
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* ════════════════════════════════════════
                   REFER A FRIEND FORM VIEW
                   ════════════════════════════════════════ */
                <>
                    {/* Header */}
                    <header className="profile-header mb-4 text-start">
                        <span className="profile-pre-heading">INVITE</span>
                        <h1 className="profile-page-title mb-1">Refer a friend</h1>
                        <p className="ref-form-subtitle text-muted mb-0 small">
                            Tell us who to invite. We'll email them your referral code right away, and let you know as soon as they start filling.
                        </p>
                    </header>

                    {/* Teal Alert Banner */}
                    <div className="ref-info-banner p-3 rounded mb-4 d-flex align-items-center gap-3">
                        <FiInfo className="info-icon flex-shrink-0" size={18} />
                        <span className="info-text text-start">Earn up to $100 in credit when your referral files their taxes.</span>
                    </div>

                    {/* Form Card Container */}
                    <div className="profile-form-card bg-white text-start">
                        {/* Section 1: Your Details */}
                        <div className="profile-section-header">
                            <h2 className="profile-section-title">Your Details</h2>
                        </div>
                        <div className="profile-form-body">
                            <div className="profile-form-row">
                                <div className="profile-field">
                                    <label className="profile-label">Your Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        className="profile-input"
                                        value={userProfile.name}
                                        disabled
                                    />
                                </div>
                                <div className="profile-field">
                                    <label className="profile-label">Your Email <span className="req">*</span></label>
                                    <input
                                        type="email"
                                        className="profile-input"
                                        value={userProfile.email}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Friend's Details */}
                        <div className="profile-section-header border-top">
                            <h2 className="profile-section-title">Friend’s Details</h2>
                        </div>
                        <div className="profile-form-body">
                            <div className="profile-form-row">
                                <div className="profile-field">
                                    <label className="profile-label">Full Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        className={`profile-input ${nameError ? "is-invalid border-danger" : ""}`}
                                        placeholder="Enter First Name"
                                        value={friendName}
                                        onChange={(e) => setFriendName(e.target.value)}
                                        required
                                    />
                                    {nameError && <div className="text-danger small mt-1">{nameError}</div>}
                                </div>
                                <div className="profile-field">
                                    <label className="profile-label">Email <span className="req">*</span></label>
                                    <input
                                        type="email"
                                        className={`profile-input ${emailError ? "is-invalid border-danger" : ""}`}
                                        placeholder="Enter Email Address"
                                        value={friendEmail}
                                        onChange={(e) => setFriendEmail(e.target.value)}
                                        required
                                    />
                                    {emailError && <div className="text-danger small mt-1">{emailError}</div>}
                                </div>
                            </div>
                            <div className="profile-form-row mt-4">
                                <div className="profile-field">
                                    <label className="profile-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="profile-input"
                                        placeholder="Enter Phone Number"
                                        value={friendPhone}
                                        onChange={(e) => setFriendPhone(e.target.value)}
                                    />
                                </div>
                                <div className="profile-field d-none d-md-flex">
                                    {/* Spacer/Empty grid cell */}
                                </div>
                            </div>
                        </div>

                        {/* Form Action Buttons Bar */}
                        <div className="profile-action-bar">
                            <button
                                className="btn btn-outline-secondary btn-cancel px-4 py-2 border rounded fw-semibold text-muted bg-transparent me-2"
                                type="button"
                                onClick={() => setView("list")}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary btn-save-profile px-4 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                type="submit"
                                onClick={handleSubmitInvite}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm text-white" role="status">
                                            <span className="visually-hidden">Sending...</span>
                                        </div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    "Send Invitation"
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Referrals;
