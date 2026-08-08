import React from "react";
import { NavLink } from "react-router-dom";
import {
    FiLayout,
    FiUser,
    FiFileText,
    FiGift,
    FiLogOut
} from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.png";

import "./sidebar.css";

const Sidebar = () => {
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
                        <NavLink
                            to="/login"
                            className="sidebar-menu-item d-flex align-items-center gap-3 text-decoration-none text-danger-hover"
                        >
                            <FiLogOut className="menu-icon text-muted" />
                            <span>Logout</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
