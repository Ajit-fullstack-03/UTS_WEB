import { Routes, Route } from "react-router-dom";

import WebsiteLayout from "../../layouts/WebsiteLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Career from "../pages/Career";
import Contact from "../pages/Contact";
import Testimonials from "../pages/Testimonials";
import Services from "../pages/Services";
import TaxPlanning from "../pages/TaxPlanning";
import TaxAudit from "../pages/TaxAudit";
import Bookkeeping from "../pages/Bookkeeping";
import IndianService from "../pages/IndianService";

const WebsiteRoutes = () => {
    return (
        <Routes>
            <Route element={<WebsiteLayout />}>
                <Route index element={<Home />} />
                <Route path="careers" element={<Career />} />
                <Route path="contact" element={<Contact />} />
                <Route path="testimonials" element={<Testimonials />} />
                <Route path="services" element={<Services />} />
                <Route path="services/us-tax-filing" element={<Services />} />
                <Route path="services/tax-planning" element={<TaxPlanning />} />
                <Route path="services/tax-audit" element={<TaxAudit />} />
                <Route path="services/bookkeeping" element={<Bookkeeping />} />
                <Route path="services/indian-service" element={<IndianService />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
        </Routes>
    );
};

export default WebsiteRoutes;