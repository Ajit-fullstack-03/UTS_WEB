import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { IoCheckmarkCircle, IoAlertCircle, IoCloseCircle, IoLogInOutline, IoArrowForward } from "react-icons/io5";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import ellipseImg from "../../assets/image/Object.png";
import { webservices } from "../services/webServices";
import "./accountVerifyUser.css";

const AccountVerifyUser = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const tokenId = searchParams.get("tokenId");
    const verifytoken = searchParams.get("verifytoken");

    // Statuses: 'loading' | 'success' | 'expired' | 'error'
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Verifying your registration, please wait...");
    const [countdown, setCountdown] = useState(5);
    const hasCalledApi = useRef(false);

    useEffect(() => {
        if (hasCalledApi.current) return;
        hasCalledApi.current = true;

        const verifyUser = async () => {
            if (!tokenId || !verifytoken) {
                setStatus("error");
                setMessage("Invalid or incomplete verification link. Missing Token ID or Verification Token.");
                return;
            }

            try {
                const payload = {
                    tokenId: tokenId,
                    verifytoken: verifytoken
                };

                const response = await webservices.verifyregister(payload);
                const data = response?.data;

                if (data?.http_code === 200) {
                    const msg = data?.status_smessage || "";
                    if (msg.toLowerCase().includes("expired")) {
                        setStatus("expired");
                        setMessage(msg || "This verification link has already expired or your account is already verified.");
                    } else {
                        setStatus("success");
                        setMessage(msg || "Register verification has been successfully verified.");
                    }
                } else {
                    setStatus("error");
                    setMessage(data?.status_smessage || "Failed to verify registration. Please try again.");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setMessage("An error occurred while connecting to the server. Please try again later.");
            }
        };

        verifyUser();
    }, [tokenId, verifytoken]);

    // Automatic redirect countdown on success
    useEffect(() => {
        let timer;
        if (status === "success" && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (status === "success" && countdown === 0) {
            navigate("/login");
        }
        return () => clearInterval(timer);
    }, [status, countdown, navigate]);

    return (
        <div className="verify-page-container">
            <img
                src={ellipseImg}
                alt="Background decorative pattern"
                className="verify-ellipse-bg"
            />

            <div className="verify-card">
                {/* Brand Logo */}
                <div className="verify-logo-wrapper">
                    <Link to="/">
                        <img
                            src={logoImg}
                            alt="Umpire Tax Solutions Logo"
                            className="verify-logo"
                        />
                    </Link>
                </div>

                {/* Loading State */}
                {status === "loading" && (
                    <>
                        <div className="verify-status-icon-box loading">
                            <div className="verify-spinner"></div>
                        </div>
                        <h2 className="verify-title">Verifying Your Account</h2>
                        <p className="verify-message">{message}</p>
                    </>
                )}

                {/* Success State */}
                {status === "success" && (
                    <>
                        <div className="verify-status-icon-box success">
                            <IoCheckmarkCircle className="verify-icon" />
                        </div>
                        <h2 className="verify-title">Account Verified!</h2>
                        <p className="verify-message">{message}</p>

                        <button
                            type="button"
                            className="verify-btn-primary"
                            onClick={() => navigate("/login")}
                        >
                            <IoLogInOutline size={20} />
                            Proceed to Login
                        </button>

                        <p className="verify-redirect-notice">
                            Redirecting to login in {countdown} second{countdown !== 1 ? "s" : ""}...
                        </p>
                    </>
                )}

                {/* Expired State */}
                {status === "expired" && (
                    <>
                        <div className="verify-status-icon-box expired">
                            <IoAlertCircle className="verify-icon" />
                        </div>
                        <h2 className="verify-title">Link Expired</h2>
                        <p className="verify-message">{message}</p>

                        <button
                            type="button"
                            className="verify-btn-primary"
                            onClick={() => navigate("/login")}
                        >
                            <IoLogInOutline size={20} />
                            Go to Login
                        </button>

                        <Link to="/" className="verify-btn-secondary">
                            Back to Home
                        </Link>
                    </>
                )}

                {/* Error State */}
                {status === "error" && (
                    <>
                        <div className="verify-status-icon-box error">
                            <IoCloseCircle className="verify-icon" />
                        </div>
                        <h2 className="verify-title">Verification Failed</h2>
                        <p className="verify-message">{message}</p>

                        <button
                            type="button"
                            className="verify-btn-primary"
                            onClick={() => navigate("/login")}
                        >
                            <IoArrowForward size={18} />
                            Go to Login
                        </button>

                        <Link to="/register" className="verify-btn-secondary">
                            Create New Account
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default AccountVerifyUser;
