import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./admin_layout.css";

const AdminLayout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen((prev) => !prev);
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    return (
        <div className="admin-layout-wrapper min-vh-100 d-flex flex-column">
            {/* Mobile Sidebar Overlay Backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="admin-sidebar-backdrop d-lg-none"
                    onClick={closeMobileSidebar}
                    aria-label="Close navigation menu"
                />
            )}

            {/* Header Navbar spanning full width */}
            <Header onToggleSidebar={toggleMobileSidebar} />

            {/* Main Body Area: Sidebar & Page Content */}
            <div className="admin-body-area d-flex flex-grow-1 p-4 gap-4 overflow-hidden">
                {/* Sidebar Component */}
                <Sidebar
                    isOpen={isMobileSidebarOpen}
                    onClose={closeMobileSidebar}
                />

                {/* Main page render content */}
                <main className="admin-page-content flex-grow-1 overflow-auto">
                    <div className="container-fluid p-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

