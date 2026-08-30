import React from "react";
import { Routes, Route } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout";
import CustomerDashboard from "../pages/CustomerDashboard";
import ProfileDetails from "../pages/ProfileDetails";
import Documents from "../pages/Documents";
import Referrals from "../pages/Referrals";
import CustomerPayments from "../pages/CustomerPayments";
import AuthGuard from "../guards/AuthGuard";

const CustomerRoutes = () => {
    return (
        <Routes>
            {/* Wrap all customer routes with AuthGuard to secure them */}
            <Route element={<AuthGuard />}>
                <Route element={<CustomerLayout />}>
                    <Route index element={<CustomerDashboard />} />
                    <Route path="profile" element={<ProfileDetails />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="referrals" element={<Referrals />} />
                    <Route path="payments" element={<CustomerPayments />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default CustomerRoutes;
