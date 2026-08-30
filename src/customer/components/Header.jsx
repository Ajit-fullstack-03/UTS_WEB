import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiGift } from "react-icons/fi";
import { webservices } from "../servics/CustomerServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import "./header.css";

const Header = () => {
    const [statusName, setStatusName] = useState("Basic Info Pending");
    const [fileNumber, setFileNumber] = useState("");

    useEffect(() => {
        const fetchStatus = async () => {
            const userInfoStr = localStorage.getItem("userInfo");
            if (!userInfoStr) return;

            try {
                const userInfo = JSON.parse(userInfoStr);
                const client_id = userInfo.client_id;
                const taxYear = getStoredTaxYear();
                const payload = {
                    client_id: String(client_id),
                    taxyear: String(taxYear),
                    taxYear: String(taxYear)
                };

                const res = await webservices.currentfileststus(payload);
                if (res.data && res.data.http_code === 200) {
                    const statusId = res.data.presentfilestatus;

                    const statusNames = {
                        0: "To Be Assigned",
                        1: "Basic Info Pending",
                        3: "Interview Pending",
                        4: "Docs Upload Pending",
                        5: "Other Docs Upload Pending",
                        6: "Preparation Pending",
                        16: "Pre-Synopsys Pending",
                        7: "Synopsys Pending",
                        8: "Payment Pending",
                        9: "Review Pending",
                        10: "Confirmation Pending",
                        17: "Pre E-Filing Pending",
                        11: "E-Filing Pending",
                        12: "Paper-Filing Pending",
                        13: "E-Filing Complete",
                        14: "Filing Docs Sent",
                        15: "Cancel Filing"
                    };

                    const name = statusNames[statusId] || res.data.pfilename || "To Be Assigned";
                    setStatusName(name);
                    setFileNumber(res.data.filenumber || "");

                    localStorage.setItem("currentFileStatus", JSON.stringify({
                        presentfilestatus: statusId,
                        pfilename: name,
                        filenumber: res.data.filenumber || ""
                    }));

                    window.dispatchEvent(new Event("fileStatusUpdated"));
                }
            } catch (error) {
                console.error("Failed to fetch file status:", error);
            }
        };

        // Load cached status on mount
        try {
            const stored = localStorage.getItem("currentFileStatus");
            if (stored) {
                const parsed = JSON.parse(stored);
                setStatusName(parsed.pfilename || "Basic Info Pending");
                setFileNumber(parsed.filenumber || "");
            }
        } catch (e) {
            console.error(e);
        }

        fetchStatus();

        // Listen for updates from other components
        const handleStatusUpdate = () => {
            try {
                const stored = localStorage.getItem("currentFileStatus");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setStatusName(parsed.pfilename || "Basic Info Pending");
                    setFileNumber(parsed.filenumber || "");
                }
            } catch (e) {
                console.error(e);
            }
        };
        window.addEventListener("fileStatusUpdated", handleStatusUpdate);
        return () => {
            window.removeEventListener("fileStatusUpdated", handleStatusUpdate);
        };
    }, []);

    return (
        <header className="customer-header py-3 px-4 d-flex align-items-center justify-content-between bg-white">
            {/* File Status Badge */}
            <div className="header-status-badge d-flex align-items-center gap-2 px-3 py-2 rounded-pill">
                <span className="status-dot"></span>
                <span className="status-text fw-semibold small">
                    File status: {statusName.toLowerCase()}
                </span>
            </div>
            <div className="header-status-badge d-flex align-items-center gap-2 px-3 py-2 rounded-pill">
                <span className="status-dot"></span>
                <span className="status-text fw-semibold small">
                    File Number: {fileNumber ? `(${fileNumber})` : ""}
                </span>
            </div>

            <div className="header-actions d-flex align-items-center gap-3">
                {/* Make Payment button */}
                <Link to="/customer/payments" className="btn btn-make-payment fw-semibold text-decoration-none">
                    Make Payment
                </Link>

                {/* Refer and Earn button */}
                <Link to="/customer/referrals" className="btn btn-refer-earn fw-semibold d-flex align-items-center gap-2 text-decoration-none">
                    <FiGift className="refer-icon" />
                    <span>Refer & Earn</span>
                </Link>

                {/* Notification Bell */}
                <div className="notification-bell-wrapper position-relative ms-2">
                    <button className="btn btn-bell p-2 border-0 bg-transparent text-muted position-relative">
                        <FiBell size={22} className="bell-icon" />
                        <span className="notification-badge position-absolute translate-middle badge rounded-pill bg-danger">
                            9
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
