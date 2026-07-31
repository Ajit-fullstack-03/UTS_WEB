import React from "react";
import { Outlet } from "react-router-dom";

// import Footer from "../components/Footer/Footer";
// import Navbar from "../components/nav/Navbar";
import Navbar from "../web/components/nav/Navbar";
import Footer from "../web/components/footer/Footer";

const WebsiteLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default WebsiteLayout;