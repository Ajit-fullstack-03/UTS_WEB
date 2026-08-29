import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import loginCollabImg from "../../assets/image/frame1l.png";
import ellipseImg from "../../assets/image/Object.png";
import "./login.css";
import { webservices } from "../services/webServices";
import Swal from "sweetalert2";
import { setStoredTaxYear } from "../../utils/taxYear";

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        const payload = {
            email: email,
            password: password
        }
        try {
            const response = await webservices.login(payload);
            if (response.data.http_code === 200) {
                localStorage.setItem("currentUser", JSON.stringify(response.data.uinfo.user_id));
                // Store the full user info for future use if needed
                localStorage.setItem("userInfo", JSON.stringify(response.data.uinfo));
                const activeTaxYear = response.data.uinfo.taxYear || response.data.uinfo.taxyear || response.data.uinfo.current_year || new Date().getFullYear();
                setStoredTaxYear(activeTaxYear);
                // alert(response.data.status_smessage);
                if (response.data.uinfo.user_type_id == 1) {
                    navigate("/admin");
                } else if (response.data.uinfo.user_type_id == 2) {
                    navigate("/customer");
                } else if (response.data.uinfo.user_type_id == 3) {
                    // navigate("/customer");
                    alert("Analysist Not design.")
                }
            } else {
                Swal.fire({
                    title: "Login Failed",
                    text: response.data.status_smessage || "Incorrect email or password.",
                    icon: "error",
                    confirmButtonColor: "#1b3178"
                });
            }
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: "Error!",
                text: "An error occurred during login. Please try again.",
                icon: "error",
                confirmButtonColor: "#1b3178"
            });
        }
    };

    return (
        <div className="auth-page-container">
            <img
                src={ellipseImg}
                alt="Background decorative pattern"
                className="auth-ellipse-bg"
            />

            <div className="auth-row row g-0">
                {/* Left Panel - Hero Graphic (50% Width) */}
                <div className="col-lg-6 p-0 d-none d-lg-block h-100">
                    <div className="auth-left-panel">
                        <div className="auth-image-wrapper">
                            <img
                                src={loginCollabImg}
                                alt="Tax Professionals Collaborating"
                                className="auth-hero-image"
                            />
                            <h2 className="auth-left-heading">
                                <span>  Secure Tax Filing. Expert</span> <br />
                                <span> Guidance. Better Outcomes. </span>
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form (50% Width) */}
                <div className="col-lg-6 p-0 h-100">
                    <div className="auth-right-panel">
                        <div className="auth-form-container">
                            {/* Header Logo Card */}
                            <div className="auth-logo-wrapper">
                                <Link to="/" className="auth-logo-card">
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
                                            className="password-toggle-btn position-absolute end-0 top-50 translate-middle-y"
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
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="form-check d-flex align-items-center gap-2 ps-0">
                                        <input
                                            type="checkbox"
                                            className="form-check-input auth-checkbox m-0 ms-0"
                                            id="rememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label
                                            className="form-check-label auth-link mb-0 cursor-pointer"
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
                                    className="btn auth-submit-btn w-100 mb-3"
                                >
                                    Log In
                                </button>

                                {/* Redirect Option */}
                                <div className="text-center">
                                    <p className="auth-subtitle mb-0">
                                        Don't Have An Account?{" "}
                                        <Link
                                            to="/register"
                                            className="auth-link fw-bold text-decoration-none"
                                        >
                                            Register Now.
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer Copy */}
                        <div className="auth-footer text-center">
                            <p className="auth-footer-text">
                                2026 Copyright, All rights reserved by Umpire Tax Solutions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
