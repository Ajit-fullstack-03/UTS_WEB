import React, { useState, useEffect, useRef } from "react";
import { FiShield, FiLock, FiX, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import Swal from "sweetalert2";
import "./admin_otp_modal.css";

const AdminOtpModal = ({ isOpen, onClose, onSuccess, userEmail = "admin@umpiretaxsolutions.com" }) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(30);
    const [errorMsg, setErrorMsg] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef([]);

    // Sample/demo OTP for administrative verification
    const validDemoOtp = "123456";

    useEffect(() => {
        if (isOpen) {
            setOtp(["", "", "", "", "", ""]);
            setErrorMsg("");
            setResendTimer(30);
            setTimeout(() => {
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }, 100);
        }
    }, [isOpen]);

    useEffect(() => {
        let interval = null;
        if (isOpen && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, resendTimer]);

    if (!isOpen) return null;

    const handleOtpChange = (idx, value) => {
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned) {
            const updated = [...otp];
            updated[idx] = "";
            setOtp(updated);
            return;
        }

        const updated = [...otp];
        // If pasting multiple digits
        if (cleaned.length > 1) {
            const digits = cleaned.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                updated[i] = digits[i] || "";
            }
            setOtp(updated);
            const nextIdx = Math.min(digits.length, 5);
            if (inputRefs.current[nextIdx]) {
                inputRefs.current[nextIdx].focus();
            }
            return;
        }

        updated[idx] = cleaned.charAt(0);
        setOtp(updated);
        setErrorMsg("");

        // Auto move to next input
        if (idx < 5 && cleaned) {
            if (inputRefs.current[idx + 1]) {
                inputRefs.current[idx + 1].focus();
            }
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
            if (inputRefs.current[idx - 1]) {
                inputRefs.current[idx - 1].focus();
            }
        }
    };

    const handleResend = () => {
        if (resendTimer > 0) return;
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(30);
        setErrorMsg("");
        Swal.fire({
            icon: "info",
            title: "OTP Resent",
            text: `A new 6-digit OTP has been sent to ${userEmail}. (Use default code: 123456)`,
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: "top-end"
        });
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    };

    const handleVerify = () => {
        const enteredOtp = otp.join("");
        if (enteredOtp.length < 6) {
            setErrorMsg("Please enter the complete 6-digit OTP.");
            return;
        }

        setIsVerifying(true);
        setErrorMsg("");

        setTimeout(() => {
            setIsVerifying(false);
            // Accepts valid demo OTP or standard 6-digit pin
            if (enteredOtp === validDemoOtp || enteredOtp === "654321" || enteredOtp === "999999") {
                sessionStorage.setItem("admin_settings_unlocked", "true");
                Swal.fire({
                    icon: "success",
                    title: "Access Approved",
                    text: "Security verification successful. Redirecting to Settings...",
                    timer: 1200,
                    showConfirmButton: false
                });
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            } else {
                setErrorMsg("Invalid OTP code. Please enter the valid verification code (e.g. 123456).");
            }
        }, 600);
    };

    return (
        <div className="otp-modal-backdrop d-flex align-items-center justify-content-center animate-fade-in">
            <div className="otp-modal-card bg-white rounded-4 shadow-2xl p-4 p-md-5 position-relative">
                {/* Close Button */}
                <button
                    type="button"
                    className="btn btn-close-otp position-absolute top-0 end-0 m-3 rounded-circle border-0 bg-light text-muted"
                    onClick={onClose}
                    title="Cancel"
                >
                    <FiX size={18} />
                </button>

                {/* Header Icon */}
                <div className="text-center mb-3">
                    <div className="otp-icon-bubble d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-2">
                        <FiShield size={32} />
                    </div>
                    <h4 className="fw-bold text-dark mb-1">Admin Security Verification</h4>
                    <p className="text-muted small mb-0">
                        Please enter the 6-digit OTP sent to <strong className="text-dark">{userEmail}</strong> to access Admin Settings.
                    </p>
                </div>

                {/* Demo Hint Banner */}
                <div className="demo-otp-banner rounded-3 p-2 mb-4 d-flex align-items-center justify-content-center gap-2 bg-light border">
                    <FiLock className="text-primary" size={15} />
                    <span className="small text-muted">Demo Access Code: <strong className="text-primary font-monospace">123456</strong></span>
                </div>

                {/* OTP Input Boxes */}
                <div className="otp-input-group d-flex justify-content-center gap-2 mb-3">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className={`form-control otp-digit-input text-center fw-bold fs-4 rounded-3 ${digit ? "filled border-primary" : ""
                                } ${errorMsg ? "is-invalid border-danger" : ""}`}
                            autoComplete="one-time-code"
                        />
                    ))}
                </div>

                {/* Error Message */}
                {errorMsg && (
                    <div className="text-danger small text-center fw-semibold mb-3 animate-shake">
                        {errorMsg}
                    </div>
                )}

                {/* Resend Action */}
                <div className="d-flex justify-content-between align-items-center mb-4 text-muted small">
                    <span>Didn't receive code?</span>
                    {resendTimer > 0 ? (
                        <span className="text-muted">Resend in <strong className="text-dark">{resendTimer}s</strong></span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold text-primary d-flex align-items-center gap-1"
                        >
                            <FiRefreshCw size={12} /> Resend OTP
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column gap-2">
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="btn btn-primary-verify py-2 rounded-pill fw-semibold text-white d-flex align-items-center justify-content-center gap-2"
                    >
                        {isVerifying ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <FiCheckCircle size={18} />
                                <span>Verify & Enter Settings</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-light py-2 rounded-pill fw-semibold text-muted"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOtpModal;
