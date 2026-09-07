import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiGift, FiChevronDown, FiLogOut } from "react-icons/fi";
import Swal from "sweetalert2";
import { webservices } from "../servics/CustomerServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import { getUserInfo } from "../../utils/userRole";
import "./header.css";

const Header = () => {
    const navigate = useNavigate();
    const profileDropdownRef = useRef(null);

    const [statusName, setStatusName] = useState("Basic Info Pending");
    const [fileNumber, setFileNumber] = useState("");
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

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

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        if (isProfileDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

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

                    localStorage.setItem("currentFileStatus", JSON.stringify({
                        presentfilestatus: statusId,
                        pfilename: name,
                        filenumber: res.data.filenumber || ""
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
        window.addEventListener("fileStatusUpdated", handleStatusUpdate);
        return () => {
            window.removeEventListener("fileStatusUpdated", handleStatusUpdate);
        };
    }, []);

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

                {/* Notification Bell */}
                <div className="notification-bell-wrapper position-relative">
                    <button className="btn btn-bell p-2 border-0 bg-transparent text-muted position-relative" title="Notifications">
                        <FiBell size={20} className="bell-icon" />
                        <span className="notification-badge position-absolute translate-middle badge rounded-pill bg-danger">
                            9
                        </span>
                    </button>
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
                                        {displayFileNumber && (
                                            <span className="badge-filenumber-sub text-muted mt-1">
                                                FN: {displayFileNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1 rounded">
                                        CUSTOMER
                                    </span>
                                </div>
                            </div>

                            {/* Menu Items (Logout only for customer) */}
                            <div className="profile-menu-body py-1">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="customer-menu-item customer-logout-item d-flex align-items-center gap-2 px-3 py-2 w-100 border-0 bg-transparent text-start text-danger"
                                >
                                    <FiLogOut className="menu-item-icon text-danger" size={17} />
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
