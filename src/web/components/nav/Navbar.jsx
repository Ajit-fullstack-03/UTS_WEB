import React, { useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { IoClose, IoChevronDownOutline } from "react-icons/io5";
import "./Navbar.css";
import logo from "../../../assets/image/umpire_tax_logo.png";

/* ── Flag SVGs ── */
const USFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="24" height="14" style={{ borderRadius: "3px", display: "block", flexShrink: 0 }}>
        <rect width="7410" height="3900" fill="#B22234" />
        <rect y="300" width="7410" height="300" fill="white" />
        <rect y="900" width="7410" height="300" fill="white" />
        <rect y="1500" width="7410" height="300" fill="white" />
        <rect y="2100" width="7410" height="300" fill="white" />
        <rect y="2700" width="7410" height="300" fill="white" />
        <rect y="3300" width="7410" height="300" fill="white" />
        <rect width="2964" height="2100" fill="#3C3B6E" />
    </svg>
);

const IndiaFlag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="24" height="14" style={{ borderRadius: "3px", display: "block", flexShrink: 0 }}>
        <rect width="900" height="200" fill="#FF9933" />
        <rect y="200" width="900" height="200" fill="#FFFFFF" />
        <rect y="400" width="900" height="200" fill="#138808" />
        <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" />
        <circle cx="450" cy="300" r="8" fill="#000080" />
    </svg>
);

/* ── Service data ── */
const US_SERVICES = [
    {
        id: "us-1",
        label: "US TAX Filling",
        route: "/services/us-tax-filing",
    },
    {
        id: "us-2",
        label: "TAX Planning",
        route: "/services/tax-planning",
    },
    {
        id: "us-3",
        label: "TAX Audit & Representation",
        route: "/services/tax-audit",
    },
    {
        id: "us-4",
        label: "Bookkeeping Services",
        route: "/services/bookkeeping",
    },
];

const Navbar = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [activeRegion, setActiveRegion] = useState(null); // null | "us"
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);
    const leaveTimer = useRef(null);

    const isUSActive = US_SERVICES.some((svc) => svc.route === location.pathname);
    const isIndiaActive = location.pathname === "/services/indian-service";

    const handleServicesEnter = () => {
        clearTimeout(leaveTimer.current);
        setServicesOpen(true);
    };

    const handleServicesLeave = () => {
        leaveTimer.current = setTimeout(() => setServicesOpen(false), 400);
    };

    return (
        <header className="custom-navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="logo">
                    <img src={logo} alt="Umpire Tax" />
                </Link>

                {/* Desktop Menu */}
                <nav className="desktop-menu">
                    <NavLink to="/">Home</NavLink>

                    {/* Services with dropdown */}
                    <div
                        className={`nav-services-wrapper ${servicesOpen ? "nav-services-wrapper--open" : ""}`}
                        onMouseEnter={handleServicesEnter}
                        onMouseLeave={() => { handleServicesLeave(); setActiveRegion(null); }}
                    >
                        <NavLink to="/services" className="nav-services-trigger" onClick={() => setServicesOpen(false)}>
                            Services
                            <IoChevronDownOutline className="nav-services-chevron" />
                        </NavLink>

                        {/* Mega dropdown */}
                        <div className={`nav-services-dropdown ${servicesOpen ? "nav-services-dropdown--open" : ""} ${activeRegion === "us" ? "nav-services-dropdown--expanded" : ""}`}>
                            {/* Left panel — region selector */}
                            <div className="nav-sd-left">
                                {/* US Service — hover reveals right panel */}
                                <button
                                    className={`nav-sd-region ${activeRegion === "us" || (activeRegion === null && isUSActive) ? "nav-sd-region--active" : ""}`}
                                    onMouseEnter={() => setActiveRegion("us")}
                                >
                                    <span className="nav-sd-flag"><USFlag /></span>
                                    <span className="nav-sd-region-label">US Service</span>
                                </button>

                                {/* Indian Service — direct navigation link, no sub-items */}
                                <Link
                                    to="/services/indian-service"
                                    className={`nav-sd-region nav-sd-region-link ${isIndiaActive ? "nav-sd-region--active" : ""}`}
                                    onMouseEnter={() => setActiveRegion(null)}
                                    onClick={() => setServicesOpen(false)}
                                >
                                    <span className="nav-sd-flag"><IndiaFlag /></span>
                                    <span className="nav-sd-region-label">Indian Service</span>
                                </Link>
                            </div>

                            {/* Right panel — only shown when US Service is hovered */}
                            <div className={`nav-sd-right ${activeRegion === "us" ? "nav-sd-right--open" : ""}`}>
                                {US_SERVICES.map((svc) => {
                                    const isActive = location.pathname === svc.route;
                                    return (
                                        <Link
                                            key={svc.id}
                                            to={svc.route}
                                            className={`nav-sd-item ${isActive ? "nav-sd-item--active" : ""}`}
                                            onClick={() => setServicesOpen(false)}
                                        >
                                            <span className="nav-sd-item-label">{svc.label}</span>
                                            <svg className="nav-sd-item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <NavLink to="/testimonials">Testimonials</NavLink>
                    <NavLink to="/careers">Careers</NavLink>
                    <NavLink to="/contact">Contact Us</NavLink>
                </nav>

                {/* Desktop Buttons */}
                <div className="desktop-buttons">
                    <Link to="/login" className="nav-btn nav-btn-outline">
                        Login
                    </Link>
                    <Link to="/register" className="nav-btn nav-btn-primary">
                        Register
                    </Link>
                </div>

                {/* Mobile Menu Icon */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <IoClose /> : <HiOutlineMenuAlt3 />}
                </button>

            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
                <NavLink to="/" onClick={closeMenu}>
                    Home
                </NavLink>

                {/* Mobile Services Accordion */}
                <div className="mobile-services-group">
                    <button
                        className="mobile-services-trigger"
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    >
                        <span>Services</span>
                        <IoChevronDownOutline className={`mobile-chevron ${mobileServicesOpen ? "mobile-chevron--open" : ""}`} />
                    </button>
                    <div className={`mobile-services-panel ${mobileServicesOpen ? "mobile-services-panel--open" : ""}`}>
                        <div className="mobile-services-section-label">
                            <USFlag /> US Service
                        </div>
                        {US_SERVICES.map(svc => (
                            <Link
                                key={svc.id}
                                to={svc.route}
                                className={`mobile-service-item ${location.pathname === svc.route ? "mobile-service-item--active" : ""}`}
                                onClick={closeMenu}
                            >
                                {svc.label}
                            </Link>
                        ))}
                        
                        {/* Indian Service — single direct link, exactly like desktop */}
                        <Link
                            to="/services/indian-service"
                            className="mobile-service-direct-link"
                            onClick={closeMenu}
                        >
                            <span className="mobile-service-direct-left">
                                <IndiaFlag />
                                <span>Indian Service</span>
                            </span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                </div>

                <NavLink to="/testimonials" onClick={closeMenu}>
                    Testimonials
                </NavLink>

                <NavLink to="/careers" onClick={closeMenu}>
                    Careers
                </NavLink>

                <NavLink to="/contact" onClick={closeMenu}>
                    Contact Us
                </NavLink>

                <Link to="/login" className="mobile-login" onClick={closeMenu}>
                    Login
                </Link>

                <Link to="/register" className="mobile-register" onClick={closeMenu}>
                    Register
                </Link>
            </div>
        </header>
    );
};
export default Navbar;
