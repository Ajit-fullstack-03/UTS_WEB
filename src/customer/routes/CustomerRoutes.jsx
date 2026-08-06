import React from "react";
import { Routes, Route } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout";
import CustomerDashboard from "../pages/CustomerDashboard";
import ProfileDetails from "../pages/ProfileDetails";

const CustomerRoutes = () => {
    return (
        <Routes>
            <Route element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="profile" element={<ProfileDetails />} />
                {/* Future routes like documents etc can go here */}
            </Route>
        </Routes>
    );
};

export default CustomerRoutes;
