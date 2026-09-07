import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline, IoAlertCircleOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { FiArrowLeft } from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import registerCallImg from "../../assets/image/frame1l2.png";
import ellipseImg from "../../assets/image/Object.png";
import "./login.css";
import { webservices } from "../services/webServices";
import Swal from "sweetalert2";

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // Country Code: Default "+1" (USA), options: +1, +91, other
    const [phoneCodeSelect, setPhoneCodeSelect] = useState("+1");
    const [customPhoneCode, setCustomPhoneCode] = useState("+");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Track touched fields for instant validation display
    const [touched, setTouched] = useState({
        phone: false,
        email: false,
        confirmEmail: false,
    });

    const effectivePhoneCode = phoneCodeSelect === "other" ? customPhoneCode.trim() : phoneCodeSelect;

    const getMobileCountry = (code) => {
        const clean = code.replace("+", "").trim();
        if (clean === "1") return "USA";
        if (clean === "91") return "INDIA";
        if (clean === "44") return "UNITED KINGDOM";
        return "USA"; // Default fallback
    };

    const handlePreventPaste = (e, fieldName = "Email") => {
        e.preventDefault();
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: `Pasting is disabled for ${fieldName}. Please type manually.`,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
        });
    };

    // Validation helpers
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanPhoneDigits = phoneNumber.replace(/\D/g, "");

    // Real-time error messages
    const getEmailError = () => {
        if (!email) return "";
        if (!emailRegex.test(email.trim())) {
            return "Please enter a valid email address (e.g. name@example.com).";
        }
        return "";
    };

    const getConfirmEmailStatus = () => {
        if (!confirmEmail) return { error: "", isMatch: false };
        if (!emailRegex.test(confirmEmail.trim())) {
            return { error: "Please enter a valid email format.", isMatch: false };
        }
        if (confirmEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
            return { error: "Email Id and Confirm Email Id do not match.", isMatch: false };
        }
        return { error: "", isMatch: true };
    };

    const getPhoneError = () => {
        if (!phoneNumber) return "";
        if (effectivePhoneCode === "+1") {
            if (cleanPhoneDigits.length !== 10) {
                return "US phone number must be exactly 10 digits.";
            }
        } else if (effectivePhoneCode === "+91") {
            if (cleanPhoneDigits.length !== 10) {
                return "Indian phone number must be exactly 10 digits.";
            }
        } else {
            if (cleanPhoneDigits.length < 7 || cleanPhoneDigits.length > 15) {
                return "Phone number must be between 7 and 15 digits.";
            }
            if (!effectivePhoneCode || effectivePhoneCode === "+") {
                return "Please enter a valid country code (e.g. +44).";
            }
        }
        return "";
    };

    const emailError = getEmailError();
    const { error: confirmEmailError, isMatch: isConfirmEmailMatch } = getConfirmEmailStatus();
    const phoneError = getPhoneError();

    const handleRegister = async (e) => {
        e.preventDefault();

        // 1. Phone validation
        const phoneValidationErr = getPhoneError();
        if (phoneValidationErr || !phoneNumber.trim()) {
            Swal.fire({
                title: "Invalid Phone Number",
                text: phoneValidationErr || "Please enter a valid phone number.",
                icon: "warning",
                confirmButtonColor: "#1b3178"
            });
            return;
        }

        // 2. Email format validation
        const cleanEmail = email.trim();
        const cleanConfirmEmail = confirmEmail.trim();

        if (!emailRegex.test(cleanEmail)) {
            Swal.fire({
                title: "Invalid Email",
                text: "Please enter a valid email address.",
                icon: "warning",
                confirmButtonColor: "#1b3178"
            });
            return;
        }

        // 3. Email matching validation
        if (cleanEmail.toLowerCase() !== cleanConfirmEmail.toLowerCase()) {
            Swal.fire({
                title: "Emails Do Not Match",
                text: "Email Id and Confirm Email Id must match exactly.",
                icon: "warning",
                confirmButtonColor: "#1b3178"
            });
            return;
        }

        // 4. Password validation
        if (!password || password.length < 6) {
            Swal.fire({
                title: "Weak Password",
                text: "Password must be at least 6 characters long.",
                icon: "warning",
                confirmButtonColor: "#1b3178"
            });
            return;
        }

        setLoading(true);

        const payload = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: cleanPhoneDigits || phoneNumber.trim(),
            email: cleanEmail,
            password: password,
            confirmpassword: password,
            confirmemail: cleanConfirmEmail,
            mobileCountry: getMobileCountry(effectivePhoneCode),
            user_id: null
        };

        try {
            const response = await webservices.register(payload);
            if (response.data.http_code === 200) {
                Swal.fire({
                    title: "Success!",
                    text: response.data.status_smessage || "Registration successful!",
                    icon: "success",
                    confirmButtonColor: "#1b3178"
                }).then(() => {
                    navigate("/login");
                });
            } else {
                Swal.fire({
                    title: "Registration Failed",
                    text: response.data.status_smessage || "Failed to register. Please try again.",
                    icon: "error",
                    confirmButtonColor: "#1b3178"
                });
            }
        } catch (error) {
            console.error("Register Error:", error);
            Swal.fire({
                title: "Error!",
                text: "An error occurred during registration. Please try again.",
                icon: "error",
                confirmButtonColor: "#1b3178"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            {/* Back to Home Button */}
            <Link to="/" className="auth-back-home-btn text-decoration-none">
                <FiArrowLeft size={16} />
                <span>Back to Home</span>
            </Link>

            {/* Top Right Circle Pattern Graphic */}
            <img
                src={ellipseImg}
                alt="Background decorative pattern"
                className="auth-ellipse-bg"
            />

            <div className="auth-row row g-0">
                {/* Left Panel - Hero Graphic (50% Width) */}
                <div className="col-lg-6 p-0 d-none d-lg-block h-100">
                    <div className="auth-left-panel">
                        <img
                            src={registerCallImg}
                            alt="Customer Talking to Tax Advisor"
                            className="auth-hero-image"
                        />
                        <h2 className="auth-left-heading">
                            <span>Join Thousands Who</span> <br />
                            <span> Trust Us with Their Taxes </span>
                        </h2>
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
                                <div className="row g-2 mb-2">
                                    <div className="col-md-12 text-start">
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
                                    <div className="col-md-12 text-start">
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
                                <div className="auth-input-group mb-2">
                                    <label className="auth-input-label">
                                        Phone Number
                                    </label>
                                    <div className="row g-2">
                                        <div className="col-4 col-sm-4 col-md-4">
                                            {phoneCodeSelect === "other" ? (
                                                <div>
                                                    <input
                                                        type="text"
                                                        className={`auth-input text-center px-1 ${effectivePhoneCode && !effectivePhoneCode.startsWith("+") ? "auth-input-invalid" : ""}`}
                                                        value={customPhoneCode}
                                                        onChange={(e) => {
                                                            let val = e.target.value;
                                                            if (val && !val.startsWith("+")) {
                                                                val = "+" + val.replace(/\+/g, "");
                                                            }
                                                            setCustomPhoneCode(val);
                                                        }}
                                                        placeholder="+XX"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="auth-code-back-btn"
                                                        onClick={() => {
                                                            setPhoneCodeSelect("+1");
                                                        }}
                                                    >
                                                        Back to List
                                                    </button>
                                                </div>
                                            ) : (
                                                <select
                                                    className="auth-select text-center"
                                                    value={phoneCodeSelect}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setPhoneCodeSelect(val);
                                                        if (val === "other") {
                                                            setCustomPhoneCode("+");
                                                        }
                                                    }}
                                                >
                                                    <option value="+1">+1</option>
                                                    <option value="+91">+91</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            )}
                                        </div>
                                        <div className="col-8 col-sm-8 col-md-8">
                                            <input
                                                type="tel"
                                                className={`auth-input ${touched.phone && phoneError ? "auth-input-invalid" : ""}`}
                                                placeholder={effectivePhoneCode === "+1" ? "10-digit US number" : effectivePhoneCode === "+91" ? "10-digit Indian number" : "Phone number"}
                                                value={phoneNumber}
                                                onChange={(e) => {
                                                    setPhoneNumber(e.target.value);
                                                    setTouched((prev) => ({ ...prev, phone: true }));
                                                }}
                                                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {touched.phone && phoneError && (
                                        <p className="auth-error-text">
                                            <IoAlertCircleOutline size={14} /> {phoneError}
                                        </p>
                                    )}
                                </div>

                                {/* Masked Email ID (Password format / *** format) */}
                                <div className="auth-input-group mb-2 position-relative">
                                    <label className="auth-input-label">
                                        Email Id
                                    </label>
                                    <div className="input-group-auth position-relative">
                                        <input
                                            type={showEmail ? "text" : "password"}
                                            className={`auth-input pe-5 ${touched.email && emailError ? "auth-input-invalid" : ""}`}
                                            placeholder="example@gmail.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setTouched((prev) => ({ ...prev, email: true }));
                                            }}
                                            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                                            onPaste={(e) => handlePreventPaste(e, "Email Id")}
                                            onCopy={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}
                                            onDrop={(e) => e.preventDefault()}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn position-absolute end-0 top-50 translate-middle-y"
                                            onClick={() => setShowEmail(!showEmail)}
                                            title={showEmail ? "Hide Email" : "Show Email"}
                                        >
                                            {showEmail ? (
                                                <IoEyeOffOutline size={20} />
                                            ) : (
                                                <IoEyeOutline size={20} />
                                            )}
                                        </button>
                                    </div>
                                    {touched.email && emailError && (
                                        <p className="auth-error-text">
                                            <IoAlertCircleOutline size={14} /> {emailError}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Email ID */}
                                <div className="auth-input-group mb-2">
                                    <label className="auth-input-label">
                                        Confirm Email Id
                                    </label>
                                    <input
                                        type="email"
                                        className={`auth-input ${confirmEmail && confirmEmailError ? "auth-input-invalid" : isConfirmEmailMatch ? "auth-input-valid" : ""}`}
                                        placeholder="Confirm example@gmail.com"
                                        value={confirmEmail}
                                        onChange={(e) => {
                                            setConfirmEmail(e.target.value);
                                            setTouched((prev) => ({ ...prev, confirmEmail: true }));
                                        }}
                                        onBlur={() => setTouched((prev) => ({ ...prev, confirmEmail: true }))}
                                        onPaste={(e) => handlePreventPaste(e, "Confirm Email Id")}
                                        onDrop={(e) => e.preventDefault()}
                                        autoComplete="off"
                                        required
                                    />
                                    {/* Instant red error message below confirm email */}
                                    {confirmEmail && confirmEmailError && (
                                        <p className="auth-error-text">
                                            <IoAlertCircleOutline size={14} /> {confirmEmailError}
                                        </p>
                                    )}
                                    {/* Instant green match message below confirm email */}
                                    {confirmEmail && isConfirmEmailMatch && (
                                        <p className="auth-success-text">
                                            <IoCheckmarkCircleOutline size={14} /> Email Id and Confirm Email Id match!
                                        </p>
                                    )}
                                </div>

                                <div className="auth-input-group mb-3 position-relative">
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn auth-submit-btn w-100 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? "Registering..." : "Register"}
                                </button>

                                {/* Redirect Option */}
                                <div className="text-center">
                                    <p className="auth-subtitle mb-0">
                                        Already Have An Account?{" "}
                                        <Link
                                            to="/login"
                                            className="auth-link fw-bold text-decoration-none"
                                        >
                                            Login Now.
                                        </Link>
                                    </p>
                                </div>

                                {/* Back to Home inline option */}
                                <div className="text-center mt-3">
                                    <Link
                                        to="/"
                                        className="auth-link text-decoration-none small d-inline-flex align-items-center gap-1"
                                    >
                                        <FiArrowLeft size={13} /> Back to Home
                                    </Link>
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

export default Register;

