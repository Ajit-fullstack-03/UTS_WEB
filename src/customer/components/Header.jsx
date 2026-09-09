import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiGift, FiChevronDown, FiLogOut, FiCheckCircle, FiInfo, FiCheck } from "react-icons/fi";
import Swal from "sweetalert2";
import { webservices } from "../servics/CustomerServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import { getUserInfo } from "../../utils/userRole";
import "./header.css";

const Header = () => {
    const navigate = useNavigate();
    const profileDropdownRef = useRef(null);
    const notifDropdownRef = useRef(null);

    const [statusName, setStatusName] = useState("Basic Info Pending");
    const [fileNumber, setFileNumber] = useState("");
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);

    // Get current logged-in user details
    const userInfo = getUserInfo();
    const userName = userInfo.user_name || userInfo.name || "Customer";
    const userEmail = userInfo.email || "";
    const displayFileNumber = fileNumber || userInfo.filenumber || "";

    const getInitials = (name) => {
        if (!name) return "C";
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Fetch customer notifications
    const fetchNotifications = useCallback(async () => {
        const uinfo = getUserInfo();
        const clientId = uinfo.client_id || uinfo.user_id || uinfo.id || uinfo.userId;
        if (!clientId) return;

        try {
            setNotifLoading(true);
            const res = await webservices.getUserNotifications({
                client_id: Number(clientId) || clientId,
                userId: Number(clientId) || clientId,
                user_id: Number(clientId) || clientId
            });
            if (res?.data && (res.data.status === true || res.data.http_code === 200)) {
                const list = res.data.notifications || [];
                setNotifications(list);
                const count = res.data.unreadCount !== undefined
                    ? Number(res.data.unreadCount)
                    : list.filter(n => String(n.readStatus) === "0" || n.readStatus === 0 || n.readStatus === false).length;
                setUnreadCount(count);
            }
        } catch (err) {
            console.warn("Failed to load header notifications:", err);
        } finally {
            setNotifLoading(false);
        }
    }, []);

    // Mark single notification as read
    const handleMarkSingleRead = async (notificationId, e) => {
        if (e) e.stopPropagation();
        try {
            await webservices.markNotificationAsRead({ notificationId });
            setNotifications(prev => prev.map(n => n.notificationId === notificationId ? { ...n, readStatus: "1" } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }
    };

    // Mark all notifications as read
    const handleMarkAllRead = async () => {
        const uinfo = getUserInfo();
        const clientId = uinfo.client_id || uinfo.user_id || uinfo.id || uinfo.userId;
        try {
            await webservices.markNotificationAsRead({
                client_id: Number(clientId) || clientId,
                userId: Number(clientId) || clientId,
                user_id: Number(clientId) || clientId,
                mark_all: true
            });
            setNotifications(prev => prev.map(n => ({ ...n, readStatus: "1" })));
            setUnreadCount(0);
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch (err) {
            console.error("Failed to mark all notifications read:", err);
        }
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setIsNotifDropdownOpen(false);
            }
        };

        if (isProfileDropdownOpen || isNotifDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isProfileDropdownOpen, isNotifDropdownOpen]);

    const handleLogout = () => {
        setIsProfileDropdownOpen(false);
        Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to log out of your customer account?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#cbd5e1",
            confirmButtonText: "Yes, logout",
            cancelButtonText: "No, stay",
            customClass: {
                confirmButton: "btn btn-danger px-4 py-2",
                cancelButton: "btn btn-light px-4 py-2 ms-2"
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("currentUser");
                localStorage.removeItem("userInfo");
                localStorage.removeItem("currentFileStatus");
                localStorage.removeItem("taxYear");
                navigate("/login");
            }
        });
    };

    useEffect(() => {
        const fetchStatus = async () => {
            const userInfoStr = localStorage.getItem("userInfo");
            if (!userInfoStr) return;

            try {
                const uinfo = JSON.parse(userInfoStr);
                const client_id = uinfo.client_id;
                const taxYear = getStoredTaxYear();
                const payload = {
                    client_id: String(client_id),
                    taxyear: String(taxYear),
                    taxYear: String(taxYear)
                };

                const res = await webservices.currentfileststus(payload);
                if (res.data && res.data.http_code === 200) {
                    const statusId = res.data.presentfilestatus;

                    const statusNames = {
                        0: "To Be Assigned",
                        1: "Basic Info Pending",
                        3: "Interview Pending",
                        4: "Docs Upload Pending",
                        5: "Other Docs Upload Pending",
                        6: "Preparation Pending",
                        16: "Pre-Synopsys Pending",
                        7: "Synopsys Pending",
                        8: "Payment Pending",
                        9: "Review Pending",
                        10: "Confirmation Pending",
                        17: "Pre E-Filing Pending",
                        11: "E-Filing Pending",
                        12: "Paper-Filing Pending",
                        13: "E-Filing Complete",
                        14: "Filing Docs Sent",
                        15: "Cancel Filing"
                    };

                    const name = statusNames[statusId] || res.data.pfilename || "To Be Assigned";
                    setStatusName(name);
                    setFileNumber(res.data.filenumber || "");

                    const isTaxFiled = res.data.tax_filing_status !== undefined
                        ? Boolean(res.data.tax_filing_status)
                        : (res.data.taxFilingStatus !== undefined
                            ? Boolean(res.data.taxFilingStatus)
                            : (Number(statusId) === 13 || Number(statusId) === 14));

                    const docCount = res.data.document_count !== undefined
                        ? Number(res.data.document_count)
                        : 0;

                    const pendingAmt = res.data.pendingAmount !== undefined
                        ? Number(res.data.pendingAmount)
                        : 0;

                    localStorage.setItem("currentFileStatus", JSON.stringify({
                        presentfilestatus: statusId,
                        pfilename: name,
                        filenumber: res.data.filenumber || "",
                        document_count: docCount,
                        pendingAmount: pendingAmt,
                        tax_filing_status: isTaxFiled
                    }));

                    window.dispatchEvent(new Event("fileStatusUpdated"));
                }
            } catch (error) {
                console.error("Failed to fetch file status:", error);
            }
        };

        // Load cached status on mount
        try {
            const stored = localStorage.getItem("currentFileStatus");
            if (stored) {
                const parsed = JSON.parse(stored);
                setStatusName(parsed.pfilename || "Basic Info Pending");
                setFileNumber(parsed.filenumber || "");
            }
        } catch (e) {
            console.error(e);
        }

        fetchStatus();
        fetchNotifications();

        // Listen for updates from other components
        const handleStatusUpdate = () => {
            try {
                const stored = localStorage.getItem("currentFileStatus");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setStatusName(parsed.pfilename || "Basic Info Pending");
                    setFileNumber(parsed.filenumber || "");
                }
            } catch (e) {
                console.error(e);
            }
        };

        const handleNotifUpdate = () => {
            fetchNotifications();
        };

        window.addEventListener("fileStatusUpdated", handleStatusUpdate);
        window.addEventListener("notificationsUpdated", handleNotifUpdate);
        return () => {
            window.removeEventListener("fileStatusUpdated", handleStatusUpdate);
            window.removeEventListener("notificationsUpdated", handleNotifUpdate);
        };
    }, [fetchNotifications]);

    return (
        <header className="customer-header py-3 px-4 d-flex align-items-center justify-content-between bg-white">
            {/* Status Badges on Left */}
            <div className="header-status-group d-flex align-items-center gap-2 flex-wrap">
                <div className="header-status-badge d-flex align-items-center gap-2 px-3 py-2 rounded-pill">
                    <span className="status-dot"></span>
                    <span className="status-text fw-semibold small">
                        File status: {statusName.toLowerCase()}
                    </span>
                </div>
                {displayFileNumber && (
                    <div className="header-filenumber-badge d-flex align-items-center gap-2 px-3 py-2 rounded-pill">
                        <span className="file-dot"></span>
                        <span className="status-text fw-semibold small">
                            File Number: ({displayFileNumber})
                        </span>
                    </div>
                )}
            </div>

            {/* Actions on Right */}
            <div className="header-actions d-flex align-items-center gap-2 ms-auto">
                {/* Make Payment button */}
                <Link to="/customer/payments" className="btn btn-make-payment fw-semibold text-decoration-none">
                    Make Payment
                </Link>

                {/* Refer and Earn button */}
                <Link to="/customer/referrals" className="btn btn-refer-earn fw-semibold d-flex align-items-center gap-2 text-decoration-none">
                    <FiGift className="refer-icon" />
                    <span>Refer & Earn</span>
                </Link>

                {/* Notification Bell with Dropdown */}
                <div className="notification-bell-wrapper position-relative" ref={notifDropdownRef}>
                    <button
                        type="button"
                        className="btn btn-bell p-2 border-0 bg-transparent text-muted position-relative"
                        title="Notifications"
                        onClick={() => setIsNotifDropdownOpen(prev => !prev)}
                    >
                        <FiBell size={20} className="bell-icon" />
                        {unreadCount > 0 && (
                            <span className="notification-badge position-absolute translate-middle badge rounded-pill bg-danger">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifDropdownOpen && (
                        <div className="customer-notif-dropdown-menu shadow-lg rounded-3 animate-fade-in" style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: 0,
                            width: "320px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "14px",
                            zIndex: 1060,
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                            overflow: "hidden"
                        }}>
                            <div className="d-flex align-items-center justify-content-between px-3 py-2.5 border-bottom bg-light">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fw-bold text-dark small">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="badge bg-danger rounded-pill" style={{ fontSize: "0.68rem" }}>
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {notifications.length > 0 && unreadCount > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold"
                                        style={{ fontSize: "0.76rem" }}
                                        onClick={handleMarkAllRead}
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="customer-notif-scroll-body" style={{ maxHeight: "320px", overflowY: "auto" }}>
                                {notifLoading ? (
                                    <div className="text-center py-4 text-muted small">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                        Loading notifications...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="text-center py-4 px-3 text-muted small">
                                        <FiBell size={24} className="text-muted mb-2 opacity-50" />
                                        <p className="mb-0">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((n, idx) => {
                                        const isUnread = String(n.readStatus) === "0" || n.readStatus === 0 || n.readStatus === false;
                                        return (
                                            <div
                                                key={n.notificationId || idx}
                                                className={`p-3 border-bottom d-flex align-items-start gap-2.5 transition-all ${isUnread ? "bg-white fw-medium" : "bg-light text-muted"}`}
                                                style={{ cursor: "pointer", transition: "background 0.15s" }}
                                                onClick={() => {
                                                    if (isUnread && n.notificationId) {
                                                        handleMarkSingleRead(n.notificationId);
                                                    }
                                                }}
                                            >
                                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5" style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    background: isUnread ? "rgba(27, 46, 107, 0.1)" : "#e2e8f0",
                                                    color: isUnread ? "#1b2e6b" : "#64748b"
                                                }}>
                                                    <FiInfo size={14} />
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <p className={`mb-1 small ${isUnread ? "text-dark" : "text-secondary"}`} style={{ fontSize: "0.82rem", lineHeight: "1.35" }}>
                                                        {n.message}
                                                    </p>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                                                            {n.analystName ? `${n.analystName} • ` : ""}{n.createdOn ? new Date(n.createdOn).toLocaleDateString() : ""}
                                                        </span>
                                                        {isUnread && (
                                                            <span className="badge rounded-pill bg-primary" style={{ width: "6px", height: "6px", padding: 0 }}></span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Customer Profile Trigger with Dropdown */}
                <div className="customer-profile-dropdown-wrapper position-relative ms-1" ref={profileDropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                        className={`btn btn-customer-profile-trigger d-flex align-items-center gap-2 py-1 px-2 rounded-pill ${isProfileDropdownOpen ? "active" : ""}`}
                        title="User Account"
                    >
                        <div className="customer-avatar-circle d-flex align-items-center justify-content-center">
                            {getInitials(userName)}
                        </div>
                        <div className="customer-user-info d-none d-md-flex flex-column text-start">
                            <span className="customer-user-name fw-semibold text-truncate">{userName}</span>
                            <span className="customer-user-role text-muted">Customer</span>
                        </div>
                        <FiChevronDown
                            className={`dropdown-chevron-icon transition-transform ms-1 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                            size={15}
                        />
                    </button>

                    {isProfileDropdownOpen && (
                        <div className="customer-profile-dropdown-menu shadow-lg rounded-3 py-2 animate-fade-in">
                            {/* Profile Header */}
                            <div className="profile-menu-header px-3 py-2 border-bottom">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <div className="customer-avatar-circle-lg d-flex align-items-center justify-content-center">
                                        {getInitials(userName)}
                                    </div>
                                    <div className="d-flex flex-column overflow-hidden">
                                        <span className="fw-bold text-dark text-truncate" title={userName}>
                                            {userName}
                                        </span>
                                        {userEmail && (
                                            <span className="small text-muted text-truncate" title={userEmail}>
                                                {userEmail}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {displayFileNumber && (
                                    <div className="mt-1 d-flex align-items-center justify-content-between bg-light px-2 py-1 rounded">
                                        <span className="badge-filenumber-sub">File No:</span>
                                        <span className="fw-bold text-primary small">#{displayFileNumber}</span>
                                    </div>
                                )}
                            </div>

                            {/* Menu Options */}
                            <div className="profile-menu-items py-1">
                                <Link
                                    to="/customer/profile"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className="customer-menu-item d-flex align-items-center px-3 py-2 text-dark"
                                >
                                    <span>Profile Details</span>
                                </Link>
                                <Link
                                    to="/customer/documents"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className="customer-menu-item d-flex align-items-center px-3 py-2 text-dark"
                                >
                                    <span>Uploaded Documents</span>
                                </Link>
                                <Link
                                    to="/customer/payments"
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                    className="customer-menu-item d-flex align-items-center px-3 py-2 text-dark"
                                >
                                    <span>Payments</span>
                                </Link>
                            </div>

                            {/* Logout Action */}
                            <div className="profile-menu-footer border-top pt-1 mt-1">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="customer-menu-item customer-logout-item d-flex align-items-center gap-2 px-3 py-2 text-danger w-100 border-0 bg-transparent text-start"
                                >
                                    <FiLogOut size={16} />
                                    <span className="fw-semibold">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
