import { Routes, Route } from "react-router-dom";

import WebsiteLayout from "../../layouts/WebsiteLayout";

import Home from "../pages/Home";
// import Services from "../pages/Services";
// ...

const WebsiteRoutes = () => {
    return (
        <Routes>
            <Route element={<WebsiteLayout />}>
                <Route index element={<Home />} />
                {/* <Route path="services" element={<Services />} /> */}
            </Route>
        </Routes>
    );
};

export default WebsiteRoutes;