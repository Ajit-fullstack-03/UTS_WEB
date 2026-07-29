import { Routes, Route } from "react-router-dom";

import WebsiteRoutes from "../web/routes/WebsiteRoutes";
// import AdminRoutes from "../admin/routes/AdminRoutes";

const AppRoutes = () => {
    return (
        <Routes>
            {/* <Route path="/*" element={<WebsiteRoutes />} /> */}
            <Route path="/" element={<WebsiteRoutes />} />
            {/* Later */}
            {/* <Route path="/admin/*" element={<AdminRoutes />} /> */}
        </Routes>
    );
};

export default AppRoutes;