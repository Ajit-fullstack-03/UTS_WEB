import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";

import WebsiteRoutes from "../web/routes/WebsiteRoutes";
import CustomerRoutes from "../customer/routes/CustomerRoutes";
import AdminRoutes from "../admin/routes/AdminRoutes";

const AppRoutes = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="/analyst/*" element={<AdminRoutes />} />
                <Route path="/analysist/*" element={<AdminRoutes />} />
                <Route path="/customer/*" element={<CustomerRoutes />} />
                <Route path="/*" element={<WebsiteRoutes />} />
            </Routes>
        </>
    );
};

export default AppRoutes;