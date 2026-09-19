import React, { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline, IoShieldCheckmarkOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";
import { FiArrowLeft, FiAlertTriangle } from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.svg";
import loginCollabImg from "../../assets/image/frame1l.png";
import ellipseImg from "../../assets/image/Object.png";
import { webservices } from "../services/webServices";
import Swal from "sweetalert2";
import "./resetPassword.css";

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [searchParams] = useSearchParams();

    // Support both route param /resetpasswordlink/:token and query param ?token=...
    const resolvedToken = token || searchParams.get("token") || searchParams.get("tokenId") || searchParams.get("token_id");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Real-time password validation criteria
    const hasMinLength = newPassword.length >= 6;
    const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!resolvedToken) {
            Swal.fire({
                title: "Invalid Reset Link",
                text: "The reset link appears to be invalid or missing a security token. Please request a new reset link from the login page.",
                icon: "warning",
                confirmButtonColor: "#1b3178"
            });
            return;
        }

        if (!newPassword) {
            setErrorMessage("Please enter a new password.");
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match. Please ensure both passwords match.");
            return;
        }

        const payload = {
            token_id: resolvedToken,
            newpassword: newPassword,
            cpassword: confirmPassword
        };

        try {
            setLoading(true);
            Swal.fire({
                title: "Resetting Password...",
                text: "Please wait while we update your password.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await webservices.changeresetpassword(payload);
            const data = response?.data;

            if (data?.http_code === 200 || data?.status === 200 || response?.status === 200) {
                Swal.fire({
                    title: "Password Reset Successful!",
                    text: data?.status_smessage || data?.message || "Your password has been successfully reset. You can now log in with your new password.",
                    icon: "success",
                    confirmButtonColor: "#1b3178"
                }).then(() => {
                    navigate("/login");
                });
            } else {
                const failMsg = data?.status_smessage || data?.message || "Failed to reset password. The link may have expired or is invalid.";
                setErrorMessage(failMsg);
                Swal.fire({
                    title: "Reset Failed",
                    text: failMsg,
                    icon: "error",
                    confirmButtonColor: "#1b3178"
                });
            }
        } catch (error) {
            console.error("Reset password error:", error);
            const errorText = error?.response?.data?.status_smessage || error?.response?.data?.message || "An unexpected error occurred. Please try again or request a new reset link.";
            setErrorMessage(errorText);
            Swal.fire({
                title: "Error!",
                text: errorText,
                icon: "error",
                confirmButtonColor: "#1b3178"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            {/* Back to Login Button */}
            <Link to="/login" className="auth-back-home-btn text-decoration-none">
                <FiArrowLeft size={16} />
                <span>Back to Login</span>
            </Link>

            <img
                src={ellipseImg}
                alt="Background decorative pattern"
                className="auth-ellipse-bg"
            />

            <div className="auth-row row g-0">
                {/* Left Panel - Hero Graphic (50% Width on desktop) */}
                <div className="col-lg-6 p-0 d-none d-lg-block h-100">
                    <div className="auth-left-panel">
                        <div className="auth-image-wrapper">
                            <img
                                src={loginCollabImg}
                                alt="Secure Tax Account"
                                className="auth-hero-image"
                            />
                            <h2 className="auth-left-heading">
                                <span>Account Security.</span> <br />
                                <span>Fast & Easy Password Reset.</span>
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Reset Form (50% Width) */}
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

                            {/* Title */}
                            <div className="auth-title-container">
                                <div className="reset-badge-icon mb-2 d-inline-flex align-items-center justify-content-center">
                                    <IoShieldCheckmarkOutline size={30} className="text-white" />
                                </div>
                                <h3 className="auth-title">Reset Your Password</h3>
                                <p className="auth-subtitle">
                                    Create a new strong password to regain access to your UTS account.
                                </p>
                            </div>

                            {/* Token Missing Warning Banner */}
                            {!resolvedToken && (
                                <div className="reset-token-warning mb-3 p-3 rounded d-flex align-items-start gap-2">
                                    <FiAlertTriangle className="text-warning flex-shrink-0 mt-1" size={18} />
                                    <div>
                                        <div className="fw-semibold text-warning">Missing Security Token</div>
                                        <div className="small text-white-50">
                                            No reset token was found in the URL. Please use the exact link sent to your email or request a new one.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Alert */}
                            {errorMessage && (
                                <div className="reset-error-banner mb-3 p-2 px-3 rounded d-flex align-items-center gap-2">
                                    <IoCloseCircleOutline size={18} className="text-danger flex-shrink-0" />
                                    <span className="small text-white">{errorMessage}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                {/* New Password Field */}
                                <div className="auth-input-group position-relative">
                                    <label className="auth-input-label" htmlFor="reset-new-password">
                                        New Password <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group-auth">
                                        <input
                                            id="reset-new-password"
                                            type={showNewPassword ? "text" : "password"}
                                            className={`auth-input pe-5 ${newPassword && hasMinLength ? "auth-input-valid" : ""}`}
                                            placeholder="Enter new password (min. 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn position-absolute end-0 top-50 translate-middle-y"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            tabIndex={-1}
                                        >
                                            {showNewPassword ? (
                                                <IoEyeOffOutline size={20} />
                                            ) : (
                                                <IoEyeOutline size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="auth-input-group position-relative">
                                    <label className="auth-input-label" htmlFor="reset-confirm-password">
                                        Confirm New Password <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group-auth">
                                        <input
                                            id="reset-confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            className={`auth-input pe-5 ${confirmPassword && passwordsMatch ? "auth-input-valid" : confirmPassword && !passwordsMatch ? "auth-input-invalid" : ""}`}
                                            placeholder="Re-enter new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn position-absolute end-0 top-50 translate-middle-y"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? (
                                                <IoEyeOffOutline size={20} />
                                            ) : (
                                                <IoEyeOutline size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Requirements Indicators */}
                                <div className="reset-requirements-box mb-3 p-2 rounded">
                                    <div className={`reset-req-item d-flex align-items-center gap-2 small ${hasMinLength ? "req-met" : "req-unmet"}`}>
                                        {hasMinLength ? <IoCheckmarkCircleOutline className="text-success" size={15} /> : <span className="req-bullet">•</span>}
                                        <span>At least 6 characters</span>
                                    </div>
                                    <div className={`reset-req-item d-flex align-items-center gap-2 small ${hasNumberOrSpecial ? "req-met" : "req-unmet"}`}>
                                        {hasNumberOrSpecial ? <IoCheckmarkCircleOutline className="text-success" size={15} /> : <span className="req-bullet">•</span>}
                                        <span>Contains number or special character</span>
                                    </div>
                                    <div className={`reset-req-item d-flex align-items-center gap-2 small ${passwordsMatch ? "req-met" : "req-unmet"}`}>
                                        {passwordsMatch ? <IoCheckmarkCircleOutline className="text-success" size={15} /> : <span className="req-bullet">•</span>}
                                        <span>Passwords match</span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn auth-submit-btn w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="d-flex align-items-center justify-content-center gap-2">
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Updating Password...
                                        </span>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </button>

                                {/* Back to Login Link */}
                                <div className="text-center mt-2">
                                    <Link
                                        to="/login"
                                        className="auth-link text-decoration-none small d-inline-flex align-items-center gap-1"
                                    >
                                        <FiArrowLeft size={13} /> Back to Login
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Footer Copy */}
                        <div className="auth-footer text-center">
                            <p className="auth-footer-text">
                                {new Date().getFullYear()} Copyright, All rights reserved by Umpire Tax Solutions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
