import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft, FiHelpCircle, FiSearch, FiFileText } from "react-icons/fi";
import { IoCompassOutline } from "react-icons/io5";
import logoImg from "../../assets/image/umpire_tax_logo.svg";
import ellipseImg from "../../assets/image/Object.png";
import { getUserTypeId, isAuthenticated, getDefaultDashboardPath } from "../../utils/userRole";
import "./notFound.css";

const NotFound = () => {
    const navigate = useNavigate();
    const isAuthed = isAuthenticated();
    const userTypeId = getUserTypeId();
    const dashboardPath = isAuthed && userTypeId ? getDefaultDashboardPath(userTypeId) : "/";

    const getPrimaryBtnLabel = () => {
        if (!isAuthed || !userTypeId) return "Back to Home";
        if (userTypeId === 1) return "Admin Dashboard";
        if (userTypeId === 2) return "Customer Dashboard";
        if (userTypeId === 3) return "Analyst Dashboard";
        return "Back to Home";
    };

    return (
        <div className="notfound-page-container">
            {/* Background Pattern */}
            <img
                src={ellipseImg}
                alt="Background decorative pattern"
                className="notfound-ellipse-bg"
            />

            {/* Glowing blur effects */}
            <div className="notfound-glow-1"></div>
            <div className="notfound-glow-2"></div>

            <div className="notfound-card-wrapper">
                <div className="notfound-card">
                    {/* Brand Logo */}
                    <div className="notfound-logo-wrapper">
                        <Link to="/" className="notfound-logo-card">
                            <img
                                src={logoImg}
                                alt="Umpire Tax Solutions Logo"
                                className="notfound-logo"
                            />
                        </Link>
                    </div>

                    {/* 404 Visual Indicator */}
                    <div className="notfound-number-container">
                        <span className="notfound-number">4</span>
                        <div className="notfound-icon-circle">
                            <IoCompassOutline className="notfound-compass-icon" />
                        </div>
                        <span className="notfound-number">4</span>
                    </div>

                    {/* Tag badge */}
                    <div className="notfound-badge">
                        <span>PAGE NOT FOUND</span>
                    </div>

                    {/* Headings */}
                    <h1 className="notfound-title">Lost in Tax Calculations?</h1>
                    <p className="notfound-subtitle">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    {/* Action Buttons */}
                    <div className="notfound-actions">
                        <button
                            type="button"
                            onClick={() => navigate(dashboardPath)}
                            className="btn notfound-btn-primary"
                        >
                            <FiHome size={18} />
                            <span>{getPrimaryBtnLabel()}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn notfound-btn-secondary"
                        >
                            <FiArrowLeft size={18} />
                            <span>Go Back</span>
                        </button>
                    </div>

                    {/* Quick navigation links */}
                    <div className="notfound-quick-links">
                        <span className="notfound-links-label">Helpful Links:</span>
                        <div className="notfound-links-group">
                            <Link to="/services" className="notfound-link-item">
                                <FiFileText size={14} /> Services
                            </Link>
                            <span className="notfound-dot">•</span>
                            <Link to="/contact" className="notfound-link-item">
                                <FiHelpCircle size={14} /> Contact Support
                            </Link>
                            {!isAuthed && (
                                <>
                                    <span className="notfound-dot">•</span>
                                    <Link to="/login" className="notfound-link-item">
                                        <FiSearch size={14} /> Log In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="notfound-footer text-center">
                    <p className="notfound-footer-text">
                        {new Date().getFullYear()} Copyright, All rights reserved by Umpire Tax Solutions
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
