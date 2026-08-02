import { Routes, Route } from "react-router-dom";

import WebsiteRoutes from "../web/routes/WebsiteRoutes";
import CustomerRoutes from "../customer/routes/CustomerRoutes";
// import AdminRoutes from "../admin/routes/AdminRoutes";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/customer/*" element={<CustomerRoutes />} />
            <Route path="/*" element={<WebsiteRoutes />} />
            {/* Later */}
            {/* <Route path="/admin/*" element={<AdminRoutes />} /> */}
        </Routes>
    );
};

export default AppRoutes;