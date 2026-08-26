import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import "./header.css";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { label: "Login History", path: "/admin/login-history" },
        { label: "Current TY", path: "/admin/all-records" },
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
        if (item.label === "Current TY") {
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

    return (
        <header className="admin-header py-3 px-4 d-flex align-items-center justify-content-between bg-white">
            {/* Logo on Left */}
            <div
                className="header-logo-container d-flex align-items-center gap-2"
                onClick={() => navigate("/admin/all-records")}
            >
                <img
                    src={logoImg}
                    alt="Umpire Tax Solutions Logo"
                    className="header-logo img-fluid"
                />
                <div className="header-logo-text d-flex flex-column lh-1">
                    <span className="logo-text-top fw-bold">UMPIRE TAX</span>
                    <span className="logo-text-bottom fw-bold text-warning">SOLUTIONS</span>
                </div>
            </div>

            {/* Navigation Tabs in Center-Right */}
            <div className="header-nav-pills d-flex align-items-center gap-2 overflow-auto py-1">
                {navItems.map((item, idx) => {
                    const active = isTabActive(item);
                    return (
                        <button
                            key={idx}
                            onClick={() => handleNavClick(item)}
                            className={`btn btn-nav-pill px-3 py-2 rounded-pill fw-semibold text-nowrap ${
                                active ? "active" : ""
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
