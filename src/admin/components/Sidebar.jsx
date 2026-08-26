import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import "./sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [counts, setCounts] = useState({
        all: 0,
        to_be_assigned: 0,
        basic_info_pending: 0,
        interview_pending: 0,
        docs_upload_pending: 0,
        other_docs_pending: 0,
        prep_pending: 0,
        pre_synopsys_pending: 0,
        synopsys_pending: 0,
        payment_pending: 0,
        review_upload_pending: 0
    });

    const fetchCounts = useCallback(async () => {
        try {
            const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
            let userId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";
            let taxYear = String(new Date().getFullYear());

            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
                    if (parsed.taxyear || parsed.taxYear || parsed.current_year) taxYear = String(parsed.taxyear || parsed.taxYear || parsed.current_year);
                } catch {
                    // Ignore parsing error
                }
            }

            const payload = {
                user_id: userId,
                taxYear: String(taxYear)
            };

            const res = await adminServices.commonprocessingcount(payload);
            if (res && res.data && (res.data.recordsTotal || Array.isArray(res.data.data))) {
                const list = res.data.recordsTotal || res.data.data;
                const countMap = {};
                let totalSum = 0;

                list.forEach(item => {
                    const c = Number(item.fcount || item.count || 0);
                    totalSum += c;
                    if (item.filestate !== undefined) {
                        countMap[String(item.filestate)] = c;
                    }
                    if (item.filestatename) {
                        const normalized = item.filestatename.toLowerCase().replace(/\s+/g, "_");
                        countMap[normalized] = c;
                    }
                });

                setCounts(prev => ({
                    ...prev,
                    all: totalSum,
                    to_be_assigned: countMap["0"] !== undefined ? countMap["0"] : (countMap["to_be_assigned"] || 0),
                    basic_info_pending: countMap["1"] !== undefined ? countMap["1"] : (countMap["basic_info_pending"] || 0),
                    interview_pending: countMap["2"] !== undefined ? countMap["2"] : (countMap["3"] !== undefined ? countMap["3"] : (countMap["interview_pending"] || countMap["scheduling_pending"] || 0)),
                    docs_upload_pending: countMap["4"] !== undefined ? countMap["4"] : (countMap["docs_upload_pending"] || countMap["documents_upload_pending"] || 0),
                    other_docs_pending: countMap["5"] !== undefined ? countMap["5"] : (countMap["other_docs_upload_pending"] || countMap["other_docs_pending"] || 0),
                    prep_pending: countMap["6"] !== undefined ? countMap["6"] : (countMap["preparation_pending"] || countMap["prep_pending"] || 0),
                    synopsys_pending: countMap["7"] !== undefined ? countMap["7"] : (countMap["synopsys_pending"] || 0),
                    payment_pending: countMap["8"] !== undefined ? countMap["8"] : (countMap["payment_pending"] || 0),
                    review_upload_pending: countMap["9"] !== undefined ? countMap["9"] : (countMap["review_pending"] || countMap["review_upload_pending"] || 0),
                    pre_synopsys_pending: countMap["16"] !== undefined ? countMap["16"] : (countMap["pre_synopsys_pending"] || countMap["pre-synopsys_pending"] || 0)
                }));
            }
        } catch (err) {
            console.warn("Failed to fetch sidebar counts:", err);
        }
    }, []);

    useEffect(() => {
        fetchCounts();
        window.addEventListener("adminCountsUpdated", fetchCounts);
        return () => {
            window.removeEventListener("adminCountsUpdated", fetchCounts);
        };
    }, [fetchCounts, location.pathname]);

    const sidebarItems = [
        { id: "all", path: "/admin/all-records", label: "All Records", count: counts.all },
        { id: "assigned_file_number", path: "/admin/assigned-file-number", label: "Assigned File Number", count: null },
        { id: "to_be_assigned", path: "/admin/to-be-assigned", label: "To Be Assigned", count: counts.to_be_assigned },
        { id: "basic_info_pending", path: "/admin/basic-info-pending", label: "Basic Info Pending", count: counts.basic_info_pending },
        { id: "interview_pending", path: "/admin/interview-pending", label: "Interview Pending", count: counts.interview_pending },
        { id: "docs_upload_pending", path: "/admin/docs-upload-pending", label: "Documents Upload Pending", count: counts.docs_upload_pending },
        { id: "other_docs_pending", path: "/admin/other-docs-pending", label: "Other Docs Pending", count: counts.other_docs_pending },
        { id: "prep_pending", path: "/admin/prep-pending", label: "Preparation Pending", count: counts.prep_pending },
        { id: "pre_synopsys_pending", path: "/admin/pre-synopsys-pending", label: "Pre-Synopsys Pending", count: counts.pre_synopsys_pending },
        { id: "synopsys_pending", path: "/admin/synopsys-pending", label: "Synopsys Pending", count: counts.synopsys_pending },
        { id: "payment_pending", path: "/admin/payment-pending", label: "Payment Pending", count: counts.payment_pending },
        { id: "review_upload_pending", path: "/admin/review-upload-pending", label: "Review Upload Pending", count: counts.review_upload_pending }
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to log out of the admin panel?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#cbd5e1",
            confirmButtonText: "Yes, logout",
            cancelButtonText: "No, stay",
            customClass: {
                confirmButton: "btn btn-danger px-4 py-2",
                cancelButton: "btn btn-light px-4 py-2 ms-2"
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("currentUser");
                navigate("/login");
            }
        });
    };

    return (
        <aside className="admin-sidebar d-flex flex-column text-white">
            {/* Nav Menu Options */}
            <nav className="sidebar-nav flex-grow-1">
                <ul className="list-unstyled sidebar-menu-list">
                    {sidebarItems.map((item) => {
                        const isActive =
                            location.pathname === item.path ||
                            (item.path === "/admin/all-records" &&
                                (location.pathname === "/admin" ||
                                    location.pathname === "/admin/" ||
                                    location.pathname === "/admin/dashboard"));
                        return (
                            <li key={item.id}>
                                <div
                                    onClick={() => handleNavigation(item.path)}
                                    className={`sidebar-menu-item d-flex align-items-center ${
                                        isActive ? "active" : ""
                                    }`}
                                >
                                    <span className="sidebar-item-label">
                                        {item.label} {item.count !== null ? `(${item.count})` : ""}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                    <li className="mt-3 pt-2 border-top border-white border-opacity-10">
                        <div
                            onClick={handleLogout}
                            className="sidebar-menu-item sidebar-logout-item d-flex align-items-center text-danger-hover"
                        >
                            <span className="sidebar-item-label">Logout</span>
                        </div>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
