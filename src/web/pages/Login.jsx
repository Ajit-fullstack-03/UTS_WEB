import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import loginCollabImg from "../../assets/image/login_collab.png";
import "./login.css";

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        alert(`Logged in with: ${email}`);
        navigate("/");
    };

    return (
        <div className="auth-page-container container-fluid p-0">
            <div className="auth-row row g-0">
                {/* Left Panel - Hero Graphic */}
                <div className="col-lg-6 p-0 d-none d-lg-block">
                    <div className="auth-left-panel">
                        <div className="auth-left-text">
                            <h2>
                                Secure Tax Filing.
                                <br />
                                Expert Guidance.
                                <br />
                                Better Outcomes.
                            </h2>
                        </div>
                        <div className="auth-left-image-wrapper">
                            <img
                                src={loginCollabImg}
                                alt="Tax Professionals Collaborating"
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
                                <span className="auth-tab active">
                                    Login
                                </span>
                                <Link
                                    to="/register"
                                    className="auth-tab inactive text-decoration-none"
                                >
                                    Register
                                </Link>
                            </div>

                            {/* Title */}
                            <div className="auth-title-container">
                                <h3 className="auth-title">Welcome Back</h3>
                                <p className="auth-subtitle">
                                    Enter your email and password to access your account.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleLogin}>
                                <div className="auth-input-group">
                                    <label className="auth-input-label">
                                        Email
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

                                <div className="auth-input-group position-relative">
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

                                {/* Remember Me and Forgot Password */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="form-check d-flex align-items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input auth-checkbox m-0"
                                            id="rememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label
                                            className="form-check-label text-muted small fw-semibold cursor-pointer"
                                            htmlFor="rememberMe"
                                        >
                                            Remember Me
                                        </label>
                                    </div>
                                    <a
                                        href="#forgot-password"
                                        className="auth-link text-decoration-none"
                                    >
                                        Forget Password?
                                    </a>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 auth-submit-btn mb-4"
                                >
                                    Log In
                                </button>

                                {/* Redirect Option */}
                                <div className="text-center">
                                    <p className="text-muted small mb-0">
                                        Don't Have An Account?{" "}
                                        <Link
                                            to="/register"
                                            className="auth-link text-decoration-none"
                                        >
                                            Register Now.
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

export default Login;
