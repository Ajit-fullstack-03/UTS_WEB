import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiCheck, FiLogOut, FiSettings, FiMenu } from "react-icons/fi";
import Swal from "sweetalert2";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear, setStoredTaxYear, getStoredTaxYearsList, setStoredTaxYearsList } from "../../utils/taxYear";
import { getUserInfo, isAnalystUser, getRolePrefix } from "../../utils/userRole";
import AdminOtpModal from "./AdminOtpModal";
import "./header.css";

const Header = ({ onToggleSidebar }) => {
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

    // Fetch dynamic tax years master data from API (POST /member/utstaxyears)
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
                if (res && res.data) {
                    let years = [];
                    if (Array.isArray(res.data.taxyears)) {
                        years = res.data.taxyears;
                    } else if (Array.isArray(res.data.data)) {
                        years = res.data.data;
                    } else if (Array.isArray(res.data.tax_years)) {
                        years = res.data.tax_years;
                    } else if (Array.isArray(res.data.taxYears)) {
                        years = res.data.taxYears;
                    } else if (Array.isArray(res.data.years)) {
                        years = res.data.years;
                    } else if (Array.isArray(res.data)) {
                        years = res.data;
                    }

                    if (years.length > 0) {
                        const normalizedYears = years.map((y) => {
                            if (typeof y === "object" && y !== null) {
                                const utstaxyear = String(y.utstaxyear || y.taxyear || y.year || y.value || "").trim();
                                const dutstaxyear = y.dutstaxyear || y.label || (utstaxyear ? `TY ${utstaxyear}` : "");
                                return { ...y, utstaxyear, dutstaxyear };
                            }
                            const val = String(y).trim();
                            return { utstaxyear: val, dutstaxyear: `TY ${val}` };
                        }).filter((y) => y.utstaxyear && y.utstaxyear !== "undefined" && y.utstaxyear !== "null");

                        if (normalizedYears.length > 0) {
                            setTaxYearsList(normalizedYears);
                            setStoredTaxYearsList(normalizedYears);
                        }
                    }
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

    // Close dropdowns on outside click safely using event target closest check
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".tax-year-dropdown-wrapper")) {
                setIsDropdownOpen(false);
            }
            if (!event.target.closest(".profile-dropdown-wrapper")) {
                setIsProfileDropdownOpen(false);
            }
        };

        if (isDropdownOpen || isProfileDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
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
        const yearVal = typeof yearItem === "object" && yearItem !== null
            ? String(yearItem.utstaxyear || yearItem.taxyear || yearItem.year || yearItem.value || "")
            : String(yearItem || "");

        if (!yearVal || yearVal === "undefined" || yearVal === "null") return;

        setStoredTaxYear(yearVal);
        setSelectedTaxYear(yearVal);
        setIsDropdownOpen(false);

        // Notify entire app of tax year change to internally re-fetch API data
        window.dispatchEvent(new Event("taxYearChanged"));
    };

    // Find display label for the currently selected tax year from dynamic API list
    const matchedTaxYear = taxYearsList.find(
        (t) => String(t.utstaxyear || t.taxyear || t.year) === String(selectedTaxYear)
    );
    const selectedDisplayLabel = matchedTaxYear
        ? (matchedTaxYear.dutstaxyear || matchedTaxYear.label || `TY ${matchedTaxYear.utstaxyear || matchedTaxYear.taxyear}`)
        : (selectedTaxYear ? `TY ${selectedTaxYear}` : "Select TY");

    return (
        <>
            <header className="admin-header bg-white">
                {/* Main Header Bar */}
                <div className="admin-header-main d-flex align-items-center justify-content-between px-3 px-lg-4">
                    {/* Left: Hamburger & Logo */}
                    <div className="header-left-group d-flex align-items-center gap-2 gap-md-3">
                        {/* Mobile Drawer Hamburger Button */}
                        <button
                            type="button"
                            className="btn-admin-hamburger d-lg-none"
                            onClick={onToggleSidebar}
                            aria-label="Toggle navigation menu"
                        >
                            <FiMenu size={22} />
                        </button>

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
                    </div>

                    {/* Navigation Tabs in Center (Desktop only) */}
                    <div className="header-nav-pills d-none d-lg-flex align-items-center justify-content-center gap-2 mx-auto overflow-visible py-1">
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
                                                        taxYearsList.map((tYear, i) => {
                                                            const yearVal = String(tYear.utstaxyear || tYear.taxyear || tYear.year || tYear);
                                                            const isSelected = yearVal === String(selectedTaxYear);
                                                            const displayYear = tYear.dutstaxyear || tYear.label || (tYear.utstaxyear ? `TY ${tYear.utstaxyear}` : yearVal);
                                                            return (
                                                                <button
                                                                    key={tYear.utstaxyear || tYear.taxyear || i}
                                                                    type="button"
                                                                    onClick={() => handleSelectTaxYear(tYear)}
                                                                    className={`dropdown-item-year d-flex align-items-center justify-content-between px-3 py-2 w-100 border-0 bg-transparent text-start ${isSelected ? "selected fw-bold" : ""
                                                                        }`}
                                                                >
                                                                    <span className="year-label">
                                                                        {displayYear}
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
                    <div className="header-right-actions d-flex align-items-center gap-2">
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
                                    className={`dropdown-chevron-icon transition-transform ms-1 d-none d-md-block ${isProfileDropdownOpen ? "rotate-180" : ""}`}
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
                </div>

                {/* Mobile Sub-Nav Pills Scrollable Strip (Mobile & Tablet only) */}
                <div className="admin-header-nav-strip d-lg-none d-flex align-items-center gap-2 px-3 py-2 border-top">
                    {navItems.map((item, idx) => {
                        const active = isTabActive(item);

                        if (item.isDropdown) {
                            return (
                                <div
                                    key={idx}
                                    className="tax-year-dropdown-wrapper position-relative flex-shrink-0"
                                    ref={dropdownRef}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDropdownOpen((prev) => !prev);
                                            setIsProfileDropdownOpen(false);
                                        }}
                                        className={`btn btn-nav-pill tax-year-dropdown-btn px-3 py-1.5 rounded-pill fw-semibold text-nowrap d-flex align-items-center gap-1.5 ${active || isDropdownOpen ? "active" : ""
                                            }`}
                                    >
                                        <span>{selectedDisplayLabel}</span>
                                        <FiChevronDown
                                            className={`dropdown-chevron-icon transition-transform ${isDropdownOpen ? "rotate-180" : ""
                                                }`}
                                            size={14}
                                        />
                                    </button>

                                    {isDropdownOpen && (
                                        <>
                                            <div
                                                className="tax-year-dropdown-backdrop d-lg-none"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsDropdownOpen(false);
                                                }}
                                            />
                                            <div className="tax-year-dropdown-menu shadow-lg rounded-3 py-2 animate-fade-in">
                                                <div className="dropdown-menu-header px-3 py-1 mb-1 border-bottom text-muted small fw-bold">
                                                    SELECT TAX YEAR
                                                </div>
                                                <div className="tax-year-list-scroll">
                                                    {taxYearsList.length > 0 ? (
                                                        taxYearsList.map((tYear, i) => {
                                                            const yearVal = String(tYear.utstaxyear || tYear.taxyear || tYear.year || tYear);
                                                            const isSelected = yearVal === String(selectedTaxYear);
                                                            const displayYear = tYear.dutstaxyear || tYear.label || (tYear.utstaxyear ? `TY ${tYear.utstaxyear}` : yearVal);
                                                            return (
                                                                <button
                                                                    key={tYear.utstaxyear || tYear.taxyear || i}
                                                                    type="button"
                                                                    onClick={() => handleSelectTaxYear(tYear)}
                                                                    className={`dropdown-item-year d-flex align-items-center justify-content-between px-3 py-2 w-100 border-0 bg-transparent text-start ${isSelected ? "selected fw-bold" : ""
                                                                        }`}
                                                                >
                                                                    <span className="year-label">
                                                                        {displayYear}
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
                                        </>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleNavClick(item)}
                                className={`btn btn-nav-pill px-3 py-1.5 rounded-pill fw-semibold text-nowrap flex-shrink-0 ${active ? "active" : ""
                                    }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
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

