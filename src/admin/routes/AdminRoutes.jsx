import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AllRecords from "../pages/AllRecords";
import AssignedFileNumber from "../pages/AssignedFileNumber";
import ToBeAssigned from "../pages/ToBeAssigned";
import BasicInfoPending from "../pages/BasicInfoPending";
import InterviewPending from "../pages/InterviewPending";
import DocsUploadPending from "../pages/DocsUploadPending";
import OtherDocsPending from "../pages/OtherDocsPending";
import PrepPending from "../pages/PrepPending";
import PreSynopsysPending from "../pages/PreSynopsysPending";
import SynopsysPending from "../pages/SynopsysPending";
import PaymentPending from "../pages/PaymentPending";
import ReviewUploadPending from "../pages/ReviewUploadPending";
import LoginHistory from "../pages/LoginHistory";
import Payments from "../pages/Payments";
import AdminReferrals from "../pages/AdminReferrals";
import CallUs from "../pages/CallUs";
import AdminComments from "../pages/AdminComments";
import AdminEmails from "../pages/AdminEmails";
import AdminCareers from "../pages/AdminCareers";
import AdminSettings from "../pages/AdminSettings";

import { isAnalystUser } from "../../utils/userRole";

const AdminRoutes = () => {
    const isAnalyst = isAnalystUser();
    const defaultLanding = isAnalyst ? "assigned-file-number" : "all-records";

    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to={defaultLanding} replace />} />
                <Route path="dashboard" element={<Navigate to={`../${defaultLanding}`} replace />} />
                <Route path="login-history" element={<LoginHistory />} />
                <Route path="payments" element={isAnalyst ? <Navigate to="../assigned-file-number" replace /> : <Payments />} />
                <Route path="referrals" element={<AdminReferrals />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="emails" element={<AdminEmails />} />
                <Route path="call-us" element={<CallUs />} />
                <Route path="careers" element={<AdminCareers />} />
                <Route path="settings" element={isAnalyst ? <Navigate to="../assigned-file-number" replace /> : <AdminSettings />} />
                <Route path="all-records" element={isAnalyst ? <Navigate to="../assigned-file-number" replace /> : <AllRecords />} />
                <Route path="assigned-file-number" element={<AssignedFileNumber />} />
                <Route path="to-be-assigned" element={<ToBeAssigned />} />
                <Route path="basic-info-pending" element={<BasicInfoPending />} />
                <Route path="interview-pending" element={<InterviewPending />} />
                <Route path="docs-upload-pending" element={<DocsUploadPending />} />
                <Route path="other-docs-pending" element={<OtherDocsPending />} />
                <Route path="prep-pending" element={<PrepPending />} />
                <Route path="pre-synopsys-pending" element={<PreSynopsysPending />} />
                <Route path="synopsys-pending" element={<SynopsysPending />} />
                <Route path="payment-pending" element={<PaymentPending />} />
                <Route path="review-upload-pending" element={<ReviewUploadPending />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
