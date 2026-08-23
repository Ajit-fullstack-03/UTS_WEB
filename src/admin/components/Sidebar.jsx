import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FiList,
    FiHash,
    FiUserPlus,
    FiUserCheck,
    FiMessageSquare,
    FiUploadCloud,
    FiFolderPlus,
    FiCpu,
    FiActivity,
    FiCheckSquare,
    FiDollarSign,
    FiCheckCircle,
    FiLogOut
} from "react-icons/fi";
import logoImg from "../../assets/image/umpire_tax_logo.png";
import "./sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeFilter = searchParams.get("filter") || "all";

    const sidebarItems = [
        { id: "all", label: "All Records", count: 1781, icon: FiList },
        { id: "assigned_file_number", label: "Assigned File Number", count: null, icon: FiHash },
        { id: "to_be_assigned", label: "To Be Assigned", count: 0, icon: FiUserPlus },
        { id: "basic_info_pending", label: "Basic Info Pending", count: 2, icon: FiUserCheck },
        { id: "interview_pending", label: "Interview Pending", count: 30, icon: FiMessageSquare },
        { id: "docs_upload_pending", label: "Documents Upload Pending", count: 20, icon: FiUploadCloud },
        { id: "other_docs_pending", label: "Other Docs Pending", count: 194, icon: FiFolderPlus },
        { id: "prep_pending", label: "Preparation Pending", count: 9, icon: FiCpu },
        { id: "pre_synopsys_pending", label: "Pre-Synopsys Pending", count: 3, icon: FiActivity },
        { id: "synopsys_pending", label: "Synopsys Pending", count: 0, icon: FiCheckSquare },
        { id: "payment_pending", label: "Payment Pending", count: 398, icon: FiDollarSign },
        { id: "review_upload_pending", label: "Review Upload Pending", count: 0, icon: FiCheckCircle }
    ];

    const handleSelectFilter = (id) => {
        // Clear clientDetails selection if any when switching filters
        setSearchParams({ filter: id });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to log out of the admin panel?",
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
                localStorage.removeItem("adminToken");
                localStorage.removeItem("currentUser");
                navigate("/login");
            }
        });
    };

    return (
        <aside className="admin-sidebar d-flex flex-column text-white">
            {/* Logo Wrapper */}
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
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeFilter === item.id;
                        return (
                            <li key={item.id}>
                                <div
                                    onClick={() => handleSelectFilter(item.id)}
                                    className={`sidebar-menu-item d-flex align-items-center justify-content-between gap-3 text-decoration-none ${
                                        isActive ? "active" : ""
                                    }`}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <Icon className="menu-icon" />
                                        <span className="sidebar-item-label">{item.label}</span>
                                    </div>
                                    {item.count !== null && (
                                        <span className={`badge rounded-pill count-badge ${isActive ? "bg-white text-navy" : "bg-light-blue"}`}>
                                            {item.count}
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                    <li className="mt-4 border-top border-secondary pt-3">
                        <div
                            onClick={handleLogout}
                            style={{ cursor: "pointer" }}
                            className="sidebar-menu-item d-flex align-items-center gap-3 text-decoration-none text-danger-hover"
                        >
                            <FiLogOut className="menu-icon text-muted" />
                            <span className="sidebar-item-label">Logout</span>
                        </div>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
