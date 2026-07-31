import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import "./Navbar.css";
import logo from "../../../assets/image/umpire_tax_logo.png";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);
    return (
        <header className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="logo">
                    {/* <h2> LOGO</h2> */}
                    <img src={logo} alt="Umpire Tax" />
                </Link>
                {/* Desktop Menu */}
                <nav className="desktop-menu">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/services">Services</NavLink>
                    <NavLink to="/testimonials">Testimonials</NavLink>
                    <NavLink to="/careers">Careers</NavLink>
                    <NavLink to="/contact">Contact Us</NavLink>
                </nav>

                {/* Desktop Buttons */}
                <div className="desktop-buttons">
                    <Link to="/login" className="btn btn-outline">
                        Login
                    </Link>
                    <Link to="/register" className="btn btn-primary">
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

                <NavLink to="/services" onClick={closeMenu}>
                    Services
                </NavLink>

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