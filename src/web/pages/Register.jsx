import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import registerCallImg from "../../assets/image/register_call.png";
import "./login.css"; // Reuse auth styles from login.css

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneCode, setPhoneCode] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = (e) => {
        e.preventDefault();
        alert(`Registered: ${firstName} ${lastName} (${email})`);
        navigate("/login");
    };

    return (
        <div className="auth-page-container container-fluid p-0">
            <div className="auth-row row g-0">
                {/* Left Panel - Hero Graphic */}
                <div className="col-lg-6 p-0 d-none d-lg-block">
                    <div className="auth-left-panel">
                        <div className="auth-left-text">
                            <h2>
                                Join Thousands Who
                                <br />
                                Trust Us with Their Taxes
                            </h2>
                        </div>
                        <div className="auth-left-image-wrapper">
                            <img
                                src={registerCallImg}
                                alt="Customer Talking to Tax Advisor"
                                className="img-fluid auth-hero-image"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="col-lg-6 p-0">
                    <div className="auth-right-panel">
                        <div className="auth-form-container">
                            {/* Header Logo */}
                            <div className="auth-logo-wrapper">
                                <Link to="/">
                                    <img
                                        src={logoImg}
                                        alt="Umpire Tax Solutions Logo"
                                        className="auth-logo img-fluid"
                                    />
                                </Link>
                            </div>

                            {/* Tabs */}
                            <div className="auth-tabs">
                                <Link
                                    to="/login"
                                    className="auth-tab inactive text-decoration-none"
                                >
                                    Login
                                </Link>
                                <span className="auth-tab active">
                                    Register
                                </span>
                            </div>

                            {/* Title */}
                            <div className="auth-title-container">
                                <h3 className="auth-title">Start Filing Smarter</h3>
                                <p className="auth-subtitle">
                                    Enter your email and password to access your account.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleRegister}>
                                <div className="row">
                                    <div className="col-md-12 mb-3 text-start">
                                        <label className="auth-input-label">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="auth-input"
                                            placeholder="First Name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-12 mb-3 text-start">
                                        <label className="auth-input-label">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="auth-input"
                                            placeholder="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone Number Field */}
                                <div className="auth-input-group mb-3">
                                    <label className="auth-input-label">
                                        Phone Number
                                    </label>
                                    <div className="row g-2">
                                        <div className="col-3 col-sm-2 col-md-3">
                                            <input
                                                type="text"
                                                className="auth-input text-center px-1"
                                                value={phoneCode}
                                                onChange={(e) => setPhoneCode(e.target.value)}
                                                placeholder="+91"
                                                required
                                            />
                                        </div>
                                        <div className="col-9 col-sm-10 col-md-9">
                                            <input
                                                type="tel"
                                                className="auth-input"
                                                placeholder="000-000-000"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="auth-input-group mb-3">
                                    <label className="auth-input-label">
                                        Email Id
                                    </label>
                                    <input
                                        type="email"
                                        className="auth-input"
                                        placeholder="example@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="auth-input-group mb-4 position-relative">
                                    <label className="auth-input-label">
                                        Password
                                    </label>
                                    <div className="input-group-auth">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="auth-input pe-5"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn btn position-absolute end-0 top-50 translate-middle-y"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <IoEyeOffOutline size={20} />
                                            ) : (
                                                <IoEyeOutline size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 auth-submit-btn mb-4"
                                >
                                    Register
                                </button>

                                {/* Redirect Option */}
                                <div className="text-center">
                                    <p className="text-muted small mb-0">
                                        Already Have An Account?{" "}
                                        <Link
                                            to="/login"
                                            className="auth-link text-decoration-none"
                                        >
                                            Login Now.
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer Copy */}
                        <div className="auth-footer text-center">
                            <p className="text-muted small mb-0">
                                Copyright, All rights reserved by Umpire Tax Solutions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
