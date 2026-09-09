import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiCheck, FiLogOut, FiSettings } from "react-icons/fi";
import Swal from "sweetalert2";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear, setStoredTaxYear, getStoredTaxYearsList, setStoredTaxYearsList } from "../../utils/taxYear";
import { getUserInfo, isAnalystUser, getRolePrefix } from "../../utils/userRole";
import AdminOtpModal from "./AdminOtpModal";
import "./header.css";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);

    const isAnalyst = isAnalystUser();
    const prefix = getRolePrefix();

    const [taxYearsList, setTaxYearsList] = useState(getStoredTaxYearsList());
    const [selectedTaxYear, setSelectedTaxYear] = useState(getStoredTaxYear());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

    // Get current logged-in user info
    const userInfo = getUserInfo();
    const userName = userInfo.user_name || userInfo.name || (isAnalyst ? "Analyst" : "Admin");
    const userEmail = userInfo.email || "admin@umpiretaxsolutions.com";

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Fetch dynamic tax years master data from API
    useEffect(() => {
        const fetchTaxYears = async () => {
            try {
                const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
                let userId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";
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

                const res = await adminServices.utstaxyears({ user_id: userId });
                if (res && res.data && Array.isArray(res.data.taxyears) && res.data.taxyears.length > 0) {
                    setTaxYearsList(res.data.taxyears);
                    setStoredTaxYearsList(res.data.taxyears);
                }
            } catch (err) {
                console.warn("utstaxyears API call error:", err);
            }
        };

        fetchTaxYears();
        setSelectedTaxYear(getStoredTaxYear());

        const handleTaxYearSync = () => {
            setSelectedTaxYear(getStoredTaxYear());
            setTaxYearsList(getStoredTaxYearsList());
        };

        window.addEventListener("taxYearChanged", handleTaxYearSync);
        return () => {
            window.removeEventListener("taxYearChanged", handleTaxYearSync);
        };
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        if (isDropdownOpen || isProfileDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen, isProfileDropdownOpen]);

    const handleLogout = () => {
        setIsProfileDropdownOpen(false);
        const roleLabel = isAnalyst ? "analyst" : "admin";
        Swal.fire({
            title: "Logout?",
            text: `Are you sure you want to log out of the ${roleLabel} panel?`,
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
                localStorage.removeItem("adminToken");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("userInfo");
                localStorage.removeItem("taxYear");
                sessionStorage.removeItem("admin_settings_unlocked");
                navigate("/login");
            }
        });
    };

    const handleOpenSettings = () => {
        setIsProfileDropdownOpen(false);
        const isUnlocked = sessionStorage.getItem("admin_settings_unlocked") === "true";
        if (isUnlocked) {
            navigate(`${prefix}/settings`);
        } else {
            setIsOtpModalOpen(true);
        }
    };

    const allNavItems = [
        { label: "Login History", path: `${prefix}/login-history` },
        { label: "Tax Year", isDropdown: true, path: `${prefix}/${isAnalyst ? "assigned-file-number" : "all-records"}` },
        { label: "Payments", path: `${prefix}/payments` },
        { label: "Referrals", path: `${prefix}/referrals` },
        { label: "Comments", path: `${prefix}/comments` },
        { label: "Emails", path: `${prefix}/emails` },
        { label: "Call Us", path: `${prefix}/call-us` },
        { label: "Careers", path: `${prefix}/careers` },
        { label: "Registration", path: `${prefix}/registration` }
    ];

    const navItems = isAnalyst
        ? allNavItems.filter((item) => item.label !== "Payments")
        : allNavItems;

    const isTabActive = (item) => {
        if (item.label === "Login History") {
            return location.pathname === `${prefix}/login-history`;
        }
        if (item.label === "Payments") {
            return location.pathname === `${prefix}/payments`;
        }
        if (item.label === "Referrals") {
            return location.pathname === `${prefix}/referrals`;
        }
        if (item.label === "Comments") {
            return location.pathname === `${prefix}/comments`;
        }
        if (item.label === "Emails") {
            return location.pathname === `${prefix}/emails`;
        }
        if (item.label === "Call Us") {
            return location.pathname === `${prefix}/call-us`;
        }
        if (item.label === "Careers") {
            return location.pathname === `${prefix}/careers`;
        }
        if (item.label === "Registration") {
            return location.pathname === `${prefix}/registration`;
        }
        if (item.isDropdown) {
            return (
                location.pathname !== `${prefix}/login-history` &&
                location.pathname !== `${prefix}/payments` &&
                location.pathname !== `${prefix}/referrals` &&
                location.pathname !== `${prefix}/comments` &&
                location.pathname !== `${prefix}/emails` &&
                location.pathname !== `${prefix}/call-us` &&
                location.pathname !== `${prefix}/careers` &&
                location.pathname !== `${prefix}/registration` &&
                location.pathname !== `${prefix}/settings` &&
                (location.pathname.startsWith(prefix) || location.pathname === "/")
            );
        }
        return location.pathname === item.path;
    };

    const handleNavClick = (item) => {
        if (item.path) {
            navigate(item.path);
        }
    };

    const handleSelectTaxYear = (yearItem) => {
        const yearVal = String(yearItem.utstaxyear);
        setStoredTaxYear(yearVal);
        setSelectedTaxYear(yearVal);
        setIsDropdownOpen(false);

        // Notify entire app of tax year change
        window.dispatchEvent(new Event("taxYearChanged"));

        const defaultLandingPage = isAnalyst ? `${prefix}/assigned-file-number` : `${prefix}/all-records`;

        // If on another tab or records, ensure records route
        if (
            location.pathname !== `${prefix}/all-records` &&
            location.pathname !== `${prefix}/assigned-file-number` &&
            !location.pathname.startsWith(`${prefix}/login-history`) &&
            !location.pathname.startsWith(`${prefix}/payments`) &&
            !location.pathname.startsWith(`${prefix}/referrals`) &&
            !location.pathname.startsWith(`${prefix}/comments`) &&
            !location.pathname.startsWith(`${prefix}/emails`) &&
            !location.pathname.startsWith(`${prefix}/call-us`) &&
            !location.pathname.startsWith(`${prefix}/careers`) &&
            !location.pathname.startsWith(`${prefix}/registration`) &&
            !location.pathname.startsWith(`${prefix}/settings`)
        ) {
            navigate(defaultLandingPage);
        }
    };

    // Find display label for the currently selected tax year from dynamic API list
    const matchedTaxYear = taxYearsList.find(
        (t) => String(t.utstaxyear) === String(selectedTaxYear)
    );
    const selectedDisplayLabel = matchedTaxYear
        ? matchedTaxYear.dutstaxyear
        : (selectedTaxYear ? `TY ${selectedTaxYear}` : "Select TY");

    return (
        <>
            <header className="admin-header px-4 d-flex align-items-center justify-content-between bg-white">
                {/* Logo on Left */}
                <div
                    className="header-logo-container d-flex align-items-center"
                    onClick={() => navigate(isAnalyst ? `${prefix}/assigned-file-number` : `${prefix}/all-records`)}
                >
                    <img
                        src={logoImg}
                        alt="Umpire Tax Solutions Logo"
                        className="header-logo img-fluid"
                    />
                </div>

                {/* Navigation Tabs in Center-Right */}
                <div className="header-nav-pills d-flex align-items-center gap-2 overflow-visible py-1">
                    {navItems.map((item, idx) => {
                        const active = isTabActive(item);

                        if (item.isDropdown) {
                            return (
                                <div
                                    key={idx}
                                    className="tax-year-dropdown-wrapper position-relative"
                                    ref={dropdownRef}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDropdownOpen((prev) => !prev);
                                            setIsProfileDropdownOpen(false);
                                        }}
                                        className={`btn btn-nav-pill tax-year-dropdown-btn px-3 py-2 rounded-pill fw-semibold text-nowrap d-flex align-items-center gap-2 ${active || isDropdownOpen ? "active" : ""
                                            }`}
                                    >
                                        <span>{selectedDisplayLabel}</span>
                                        <FiChevronDown
                                            className={`dropdown-chevron-icon transition-transform ${isDropdownOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="tax-year-dropdown-menu shadow-lg rounded-3 py-2 animate-fade-in">
                                            <div className="dropdown-menu-header px-3 py-1 mb-1 border-bottom text-muted small fw-bold">
                                                SELECT TAX YEAR
                                            </div>
                                            <div className="tax-year-list-scroll">
                                                {taxYearsList.length > 0 ? (
                                                    taxYearsList.map((tYear) => {
                                                        const isSelected =
                                                            String(tYear.utstaxyear) === String(selectedTaxYear);
                                                        return (
                                                            <button
                                                                key={tYear.utstaxyear}
                                                                type="button"
                                                                onClick={() => handleSelectTaxYear(tYear)}
                                                                className={`dropdown-item-year d-flex align-items-center justify-content-between px-3 py-2 w-100 border-0 bg-transparent text-start ${isSelected ? "selected fw-bold" : ""
                                                                    }`}
                                                            >
                                                                <span className="year-label">
                                                                    {tYear.dutstaxyear || tYear.utstaxyear}
                                                                </span>
                                                                {isSelected && (
                                                                    <FiCheck className="text-primary ms-2 check-icon" />
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="px-3 py-2 text-muted small">
                                                        Loading tax years...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleNavClick(item)}
                                className={`btn btn-nav-pill px-3 py-2 rounded-pill fw-semibold text-nowrap ${active ? "active" : ""
                                    }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* Right Actions: Profile Dropdown */}
                <div className="header-right-actions d-flex align-items-center gap-2 ms-3">

                    {/* Profile Dropdown */}
                    <div className="profile-dropdown-wrapper position-relative" ref={profileDropdownRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsProfileDropdownOpen((prev) => !prev);
                                setIsDropdownOpen(false);
                            }}
                            className={`btn btn-profile-trigger d-flex align-items-center gap-2 py-1 px-2 rounded-pill ${isProfileDropdownOpen ? "active" : ""}`}
                            title="User Profile & Menu"
                        >
                            <div className="profile-avatar-circle d-flex align-items-center justify-content-center">
                                {getInitials(userName)}
                            </div>
                            <div className="profile-user-info d-none d-md-flex flex-column text-start">
                                <span className="profile-user-name fw-semibold text-truncate">{userName}</span>
                                <span className="profile-user-role text-muted">{isAnalyst ? "Analyst" : "Admin"}</span>
                            </div>
                            <FiChevronDown
                                className={`dropdown-chevron-icon transition-transform ms-1 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                                size={15}
                            />
                        </button>

                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown-menu shadow-lg rounded-3 py-2 animate-fade-in">
                                {/* Profile Header */}
                                <div className="profile-menu-header px-3 py-2 border-bottom">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <div className="profile-avatar-circle-lg d-flex align-items-center justify-content-center">
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
                                    <div className="mt-2">
                                        <span className={`badge ${isAnalyst ? "bg-info text-dark" : "badge-admin-role"}`}>
                                            {isAnalyst ? "ANALYST" : "ADMINISTRATOR"}
                                        </span>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="profile-menu-body py-1">
                                    {/* Setting button - ONLY in admin section */}
                                    {!isAnalyst && (
                                        <button
                                            type="button"
                                            onClick={handleOpenSettings}
                                            className="profile-menu-item d-flex align-items-center gap-2 px-3 py-2 w-100 border-0 bg-transparent text-start"
                                        >
                                            <FiSettings className="menu-item-icon text-primary" size={17} />
                                            <div className="d-flex flex-column">
                                                <span className="fw-semibold text-dark">Settings</span>
                                                <span className="profile-item-hint text-muted">System & portal settings</span>
                                            </div>
                                        </button>
                                    )}

                                    {/* Logout option - in all (admin & analyst) */}
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="profile-menu-item profile-logout-item d-flex align-items-center gap-2 px-3 py-2 w-100 border-0 bg-transparent text-start text-danger"
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

            {/* OTP Verification Modal before entering Settings */}
            <AdminOtpModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                onSuccess={() => {
                    setIsOtpModalOpen(false);
                    navigate(`${prefix}/settings`);
                }}
                userEmail={userEmail}
            />
        </>
    );
};

export default Header;
