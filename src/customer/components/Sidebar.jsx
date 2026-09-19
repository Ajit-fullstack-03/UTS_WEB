import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FiLayout,
    FiUser,
    FiFileText,
    FiCreditCard,
    FiGift,
    FiLogOut,
    FiX
} from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.svg";

import "./sidebar.css";

const Sidebar = ({ isOpen = false, onClose }) => {
    const navigate = useNavigate();

    const handleItemClick = () => {
        if (typeof onClose === "function" && window.innerWidth <= 991.98) {
            onClose();
        }
    };

    return (
        <aside className={`customer-sidebar d-flex flex-column text-white ${isOpen ? "mobile-open" : ""}`}>
            {/* Logo Header & Mobile Close */}
            <div className="sidebar-logo-wrapper d-flex align-items-center justify-content-between">
                <img
                    src={logoImg}
                    alt="Umpire Tax Solutions Logo"
                    className="sidebar-logo img-fluid"
                />
                {/* Close button for mobile drawer */}
                <button
                    type="button"
                    className="btn-sidebar-close d-lg-none"
                    onClick={onClose}
                    aria-label="Close Sidebar"
                >
                    <FiX size={20} />
                </button>
            </div>


            {/* Nav Menu Options */}
            <nav className="sidebar-nav flex-grow-1">
                <ul className="list-unstyled sidebar-menu-list">
                    <li>
                        <NavLink
                            to="/customer"
                            end
                            onClick={handleItemClick}
                            className={({ isActive }) =>
                                `sidebar-menu-item d-flex align-items-center gap-3 text-decoration-none ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <FiLayout className="menu-icon" />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/customer/profile"
                            onClick={handleItemClick}
                            className={({ isActive }) =>
                                `sidebar-menu-item d-flex align-items-center gap-3 text-decoration-none ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <FiUser className="menu-icon" />
                            <span>Profile Details</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/customer/documents"
                            onClick={handleItemClick}
                            className={({ isActive }) =>
                                `sidebar-menu-item d-flex align-items-center gap-3 text-decoration-none ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <FiFileText className="menu-icon" />
                            <span>Documents</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/customer/payments"
                            onClick={handleItemClick}
                            className={({ isActive }) =>
                                `sidebar-menu-item d-flex align-items-center gap-3 text-decoration-none ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <FiCreditCard className="menu-icon" />
                            <span>Payments</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/customer/referrals"
                            onClick={handleItemClick}
                            className={({ isActive }) =>
                                `sidebar-menu-item d-flex align-items-center gap-3 text-decoration-none ${isActive ? "active" : ""
                                }`
                            }
                        >
                            <FiGift className="menu-icon" />
                            <span>Referrals</span>
                        </NavLink>
                    </li>
                    <li className="mt-4 border-top border-secondary pt-3">
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                Swal.fire({
                                    title: "Logout?",
                                    text: "Are you sure you want to log out of your session?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#dc3545",
                                    cancelButtonColor: "#cbd5e1",
                                    confirmButtonText: "Yes, logout",
                                    cancelButtonText: "No, stay",
                                    customClass: {
                                        confirmButton: "btn btn-danger px-4 py-2",
                                        cancelButton: "btn btn-light px-4 py-2 ms-2"
                                    },
                                    buttonsStyling: false
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        localStorage.removeItem("currentUser");
                                        localStorage.removeItem("userInfo");
                                        localStorage.removeItem("currentFileStatus");
                                        localStorage.removeItem("taxYear");
                                        navigate("/login");
                                    }
                                });
                            }}
                            style={{ cursor: "pointer" }}
                            className="sidebar-menu-item d-flex align-items-center gap-3 text-decoration-none text-danger-hover"
                        >
                            <FiLogOut className="menu-icon text-muted" />
                            <span>Logout</span>
                        </div>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
