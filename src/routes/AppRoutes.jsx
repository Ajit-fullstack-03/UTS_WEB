import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";

import WebsiteRoutes from "../web/routes/WebsiteRoutes";
import CustomerRoutes from "../customer/routes/CustomerRoutes";
import AdminRoutes from "../admin/routes/AdminRoutes";
import RoleRouteGuard from "./RoleRouteGuard";

const AppRoutes = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Admin Routes - only accessible by user_type_id = 1 */}
                <Route element={<RoleRouteGuard allowedRoles={[1]} />}>
                    <Route path="/admin/*" element={<AdminRoutes />} />
                </Route>

                {/* Analyst Routes - only accessible by user_type_id = 3 */}
                <Route element={<RoleRouteGuard allowedRoles={[3]} />}>
                    <Route path="/analyst/*" element={<AdminRoutes />} />
                    <Route path="/analysist/*" element={<AdminRoutes />} />
                </Route>

                {/* Customer Routes - only accessible by user_type_id = 2 */}
                <Route element={<RoleRouteGuard allowedRoles={[2]} />}>
                    <Route path="/customer/*" element={<CustomerRoutes />} />
                </Route>

                {/* Public Website Routes - No Auth Required */}
                <Route path="/*" element={<WebsiteRoutes />} />
            </Routes>
        </>
    );
};

export default AppRoutes;