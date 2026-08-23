import React from "react";
import { FiBell } from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import "./header.css";

const Header = () => {
    const navItems = [
        "Login History",
        "Current TY",
        "Payments",
        "Referrals",
        "Comments",
        "Emails",
        "Call Us",
        "Careers"
    ];

    return (
        <header className="admin-header py-3 px-4 d-flex align-items-center justify-content-between bg-white">
            {/* Logo on Left */}
            <div className="header-logo-container d-flex align-items-center gap-2">
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
                {navItems.map((item, idx) => (
                    <button
                        key={idx}
                        className={`btn btn-nav-pill px-3 py-2 rounded-pill fw-semibold text-nowrap ${
                            item === "Current TY" ? "active" : ""
                        }`}
                    >
                        {item}
                    </button>
                ))}
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
