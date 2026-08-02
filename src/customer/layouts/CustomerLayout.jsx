import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./customer_layout.css";

const CustomerLayout = () => {
    return (
        <div className="customer-layout-wrapper d-flex min-vh-100">
            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="customer-main-area d-flex flex-column flex-grow-1">
                {/* Header Navbar */}
                <Header />

                {/* Main page render content */}
                <main className="customer-page-content p-4 flex-grow-1">
                    <div className="container-fluid p-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerLayout;
