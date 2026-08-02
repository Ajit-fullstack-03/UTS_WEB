import React from "react";
import { Link } from "react-router-dom";
import { FiBell, FiGift } from "react-icons/fi";
import "./header.css";

const Header = () => {
    return (
        <header className="customer-header py-3 px-4 d-flex align-items-center justify-content-end bg-white">
            <div className="header-actions d-flex align-items-center gap-3">
                {/* Make Payment button */}
                <button className="btn btn-make-payment fw-semibold">
                    Make Payment
                </button>

                {/* Refer and Earn button */}
                <button className="btn btn-refer-earn fw-semibold d-flex align-items-center gap-2">
                    <FiGift className="refer-icon" />
                    <span>Refer & Earn</span>
                </button>

                {/* Notification Bell */}
                <div className="notification-bell-wrapper position-relative ms-2">
                    <button className="btn btn-bell p-2 border-0 bg-transparent text-muted position-relative">
                        <FiBell size={22} className="bell-icon" />
                        <span className="notification-badge position-absolute translate-middle badge rounded-pill bg-danger">
                            9
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
