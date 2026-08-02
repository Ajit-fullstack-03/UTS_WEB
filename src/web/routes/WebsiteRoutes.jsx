import { Routes, Route } from "react-router-dom";

import WebsiteLayout from "../../layouts/WebsiteLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
// import Services from "../pages/Services";
// ...

const WebsiteRoutes = () => {
    return (
        <Routes>
            <Route element={<WebsiteLayout />}>
                <Route index element={<Home />} />
                {/* <Route path="services" element={<Services />} /> */}
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
        </Routes>
    );
};

export default WebsiteRoutes;