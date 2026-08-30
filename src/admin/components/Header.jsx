import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiCheck } from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear, setStoredTaxYear, getStoredTaxYearsList, setStoredTaxYearsList } from "../../utils/taxYear";
import "./header.css";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [taxYearsList, setTaxYearsList] = useState(getStoredTaxYearsList());
    const [selectedTaxYear, setSelectedTaxYear] = useState(getStoredTaxYear());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    const navItems = [
        { label: "Login History", path: "/admin/login-history" },
        { label: "Tax Year", isDropdown: true, path: "/admin/all-records" },
        { label: "Payments", path: "/admin/payments" },
        { label: "Referrals", path: "/admin/referrals" },
        { label: "Comments", path: "/admin/comments" },
        { label: "Emails", path: "/admin/emails" },
        { label: "Call Us", path: "/admin/call-us" },
        { label: "Careers", path: "/admin/careers" }
    ];

    const isTabActive = (item) => {
        if (item.label === "Login History") {
            return location.pathname === "/admin/login-history";
        }
        if (item.label === "Payments") {
            return location.pathname === "/admin/payments";
        }
        if (item.label === "Referrals") {
            return location.pathname === "/admin/referrals";
        }
        if (item.label === "Comments") {
            return location.pathname === "/admin/comments";
        }
        if (item.label === "Emails") {
            return location.pathname === "/admin/emails";
        }
        if (item.label === "Call Us") {
            return location.pathname === "/admin/call-us";
        }
        if (item.label === "Careers") {
            return location.pathname === "/admin/careers";
        }
        if (item.isDropdown) {
            return (
                location.pathname !== "/admin/login-history" &&
                location.pathname !== "/admin/payments" &&
                location.pathname !== "/admin/referrals" &&
                location.pathname !== "/admin/comments" &&
                location.pathname !== "/admin/emails" &&
                location.pathname !== "/admin/call-us" &&
                location.pathname !== "/admin/careers" &&
                (location.pathname.startsWith("/admin") || location.pathname === "/")
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

        // If on another tab or records, ensure records route
        if (
            location.pathname !== "/admin/all-records" &&
            !location.pathname.startsWith("/admin/login-history") &&
            !location.pathname.startsWith("/admin/payments") &&
            !location.pathname.startsWith("/admin/referrals") &&
            !location.pathname.startsWith("/admin/comments") &&
            !location.pathname.startsWith("/admin/emails") &&
            !location.pathname.startsWith("/admin/call-us") &&
            !location.pathname.startsWith("/admin/careers")
        ) {
            navigate("/admin/all-records");
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
        <header className="admin-header px-4 d-flex align-items-center justify-content-between bg-white">
            {/* Logo on Left */}
            <div
                className="header-logo-container d-flex align-items-center"
                onClick={() => navigate("/admin/all-records")}
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
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
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

            {/* Notification Bell on Right */}
            <div className="header-right-actions d-flex align-items-center ms-3">
                <div className="notification-bell-wrapper position-relative">
                    <button className="btn btn-bell p-2 border-0 bg-transparent text-muted position-relative">
                        <FiBell size={22} className="bell-icon" />
                        <span className="notification-badge position-absolute translate-middle badge rounded-pill">
                            9
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
