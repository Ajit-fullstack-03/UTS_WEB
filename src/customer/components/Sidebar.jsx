import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FiLayout,
    FiUser,
    FiFileText,
    FiCreditCard,
    FiGift,
    FiLogOut
} from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.png";

import "./sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();
    return (
        <aside className="customer-sidebar d-flex flex-column text-white">
            {/* Logo Header */}
            <div className="sidebar-logo-wrapper text-center">
                <img
                    src={logoImg}
                    alt="Umpire Tax Solutions Logo"
                    className="sidebar-logo img-fluid"
                />
            </div>

            {/* Nav Menu Options */}
            <nav className="sidebar-nav flex-grow-1">
                <ul className="list-unstyled sidebar-menu-list">
                    <li>
                        <NavLink
                            to="/customer"
                            end
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
