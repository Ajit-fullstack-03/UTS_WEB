import React from "react";
import { Routes, Route } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout";
import CustomerDashboard from "../pages/CustomerDashboard";

const CustomerRoutes = () => {
    return (
        <Routes>
            <Route element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
                {/* Future routes like profile, documents etc can go here */}
            </Route>
        </Routes>
    );
};

export default CustomerRoutes;
