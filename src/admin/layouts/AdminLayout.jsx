import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./admin_layout.css";

const AdminLayout = () => {
    return (
        <div className="admin-layout-wrapper min-vh-100 d-flex flex-column">
            {/* Header Navbar spanning full width */}
            <Header />

            {/* Main Body Area: Sidebar & Page Content */}
            <div className="admin-body-area d-flex flex-grow-1 p-4 gap-4 overflow-hidden">
                {/* Sidebar Component */}
                <Sidebar />

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
