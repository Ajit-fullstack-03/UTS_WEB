import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiRefreshCw, FiDownload } from "react-icons/fi";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import { exportToExcel } from "../../utils/excelExport";
import "./referrals.css";

const AdminReferrals = () => {
    const [referralsList, setReferralsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "NOT_REGISTERED" | "REGISTERED"
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [errorMsg, setErrorMsg] = useState("");

    // Helper to extract credentials
    const getCredentials = () => {
        const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
        let userId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";
        let taxYear = getStoredTaxYear();

        if (userInfoStr) {
            try {
                const parsed = JSON.parse(userInfoStr);
                if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
            } catch {
                if (typeof userInfoStr === "string" && userInfoStr.length > 5) {
                    userId = userInfoStr.replace(/"/g, "");
                }
            }
        }
        return { userId, taxYear };
    };

    // Format phone helper
    const formatPhoneNumber = (phone) => {
        if (!phone) return "-";
        const cleaned = ("" + phone).replace(/\D/g, "");
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        if (cleaned.length === 11 && cleaned.startsWith("1")) {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        return phone;
    };

    // Fetch referrals from API
    const fetchReferrals = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const { userId, taxYear } = getCredentials();
            const payload = {
                user_id: userId,
                taxYear: String(taxYear)
            };

            let rawList = [];
            try {
                const res = await adminServices.allrefferalslist(payload);
                if (res && res.data) {
                    rawList = Array.isArray(res.data)
                        ? res.data
                        : (Array.isArray(res.data.data)
                            ? res.data.data
                            : (Array.isArray(res.data.list) ? res.data.list : []));
                }
            } catch (err) {
                console.warn("allrefferalslist endpoint failed, attempting fallback:", err);
                try {
                    const fallbackRes = await adminServices.refferalslist(payload);
                    if (fallbackRes && fallbackRes.data) {
                        rawList = Array.isArray(fallbackRes.data)
                            ? fallbackRes.data
                            : (Array.isArray(fallbackRes.data.data)
                                ? fallbackRes.data.data
                                : (Array.isArray(fallbackRes.data.list) ? fallbackRes.data.list : []));
                    }
                } catch (fallbackErr) {
                    console.warn("refferalslist fallback failed:", fallbackErr);
                }
            }

            if (rawList && rawList.length > 0) {
                const mapped = rawList.map((item, idx) => {
                    const rawStatus = item.registration_status !== undefined
                        ? item.registration_status
                        : (item.rf_status !== undefined ? item.rf_status : item.status);

                    let regStatus = "Not Registered";
                    if (rawStatus === 1 || rawStatus === "1" || String(rawStatus).toLowerCase() === "registered" || rawStatus === true || rawStatus === "true") {
                        regStatus = "Registered";
                    } else if (typeof rawStatus === "string" && rawStatus.trim() !== "") {
                        regStatus = rawStatus.trim();
                    }

                    return {
                        id: item.rf_id || item.id || `ref_${idx}`,
                        referral_name: item.rf_on_fileno || item.userfilename || item.rf_on_name || item.referral_name || `UTS${1000 + idx}`,
                        referral_email: item.rf_on_email || item.referral_email || item.email || "-",
                        referral_phone: formatPhoneNumber(item.rf_on_phone || item.referral_phone || item.phone),
                        referral_to_name: (item.rf_name || item.referral_to_name || item.friend_name || item.name || "CLIENT").toUpperCase(),
                        referral_to_email: item.rf_email || item.referral_to_email || item.friend_email || "-",
                        referral_to_phone: formatPhoneNumber(item.rf_phone || item.referral_to_phone || item.friend_phone),
                        registered_status: regStatus,
                        created_at: item.rf_created_at || item.created_at || ""
                    };
                });
                setReferralsList(mapped);
            } else {
                setReferralsList([]);
            }
        } catch (err) {
            console.error("Error fetching referrals:", err);
            setReferralsList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferrals();
        window.addEventListener("taxYearChanged", fetchReferrals);
        return () => {
            window.removeEventListener("taxYearChanged", fetchReferrals);
        };
    }, [fetchReferrals]);

    // View referral details modal
    const handleViewReferral = (item) => {
        Swal.fire({
            title: `<span style="font-family:'Outfit',sans-serif;font-size:1.25rem;font-weight:700;color:#1e293b;">Referral Details</span>`,
            html: `
                <div style="text-align:left;font-family:'Outfit',sans-serif;font-size:0.9rem;color:#334155;line-height:1.8;">
                    <div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
                        <strong style="color:#1b2e6b;">Referrer Info:</strong><br/>
                        <b>File / Name:</b> ${item.referral_name}<br/>
                        <b>Email:</b> ${item.referral_email}<br/>
                        <b>Phone:</b> ${item.referral_phone}
                    </div>
                    <div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
                        <strong style="color:#1b2e6b;">Referred Person:</strong><br/>
                        <b>Name:</b> ${item.referral_to_name}<br/>
                        <b>Email:</b> ${item.referral_to_email}<br/>
                        <b>Phone:</b> ${item.referral_to_phone}
                    </div>
                    <div>
                        <b>Registration Status:</b> 
                        <span style="font-weight:600;color:${item.registered_status === "Registered" ? "#16a34a" : "#94a3b8"};">
                            ${item.registered_status}
                        </span>
                    </div>
                </div>
            `,
            confirmButtonText: "Close",
            confirmButtonColor: "#1b2e6b",
            customClass: {
                confirmButton: "btn btn-primary px-4 py-2"
            },
            buttonsStyling: false
        });
    };

    // Calculate category counts
    const counts = useMemo(() => {
        let total = referralsList.length;
        let notRegistered = 0;
        let registered = 0;

        referralsList.forEach((item) => {
            if (String(item.registered_status).toLowerCase() === "registered") {
                registered += 1;
            } else {
                notRegistered += 1;
            }
        });

        return { total, notRegistered, registered };
    }, [referralsList]);

    // Filter referrals by status and search term, with default sort: 1st Not Registered, then Registered
    const filteredRecords = useMemo(() => {
        let list = referralsList;

        // 1. Filter by registration status
        if (statusFilter === "REGISTERED") {
            list = list.filter((item) => String(item.registered_status).toLowerCase() === "registered");
        } else if (statusFilter === "NOT_REGISTERED") {
            list = list.filter((item) => String(item.registered_status).toLowerCase() !== "registered");
        }

        // 2. Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            list = list.filter((item) => {
                const refName = (item.referral_name || "").toLowerCase();
                const refEmail = (item.referral_email || "").toLowerCase();
                const refPhone = (item.referral_phone || "").toLowerCase();
                const toName = (item.referral_to_name || "").toLowerCase();
                const toEmail = (item.referral_to_email || "").toLowerCase();
                const toPhone = (item.referral_to_phone || "").toLowerCase();
                const status = (item.registered_status || "").toLowerCase();

                return (
                    refName.includes(term) ||
                    refEmail.includes(term) ||
                    refPhone.includes(term) ||
                    toName.includes(term) ||
                    toEmail.includes(term) ||
                    toPhone.includes(term) ||
                    status.includes(term)
                );
            });
        }

        // 3. Sort order: 1st Not Registered, then Registered
        return [...list].sort((a, b) => {
            const aReg = String(a.registered_status).toLowerCase() === "registered";
            const bReg = String(b.registered_status).toLowerCase() === "registered";
            if (aReg === bReg) return 0;
            return aReg ? 1 : -1; // false (Not registered) comes first, true (Registered) comes second
        });
    }, [referralsList, statusFilter, searchTerm]);

    // Reset pagination when search or status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, rowsPerPage]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRecords.slice(start, start + rowsPerPage);
    }, [filteredRecords, currentPage, rowsPerPage]);

    // Pagination numbers list with ellipses
    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 4) {
                pages.push("...");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 3) {
                pages.push("...");
            }
            pages.push(totalPages);
        }
        return pages;
    };

    // Export all referrals to Excel with export: true
    const handleExportExcel = async () => {
        try {
            setExporting(true);
            const { userId, taxYear } = getCredentials();
            const payload = {
                user_id: userId,
                taxYear: String(taxYear),
                export: true
            };

            let rawList = [];
            try {
                const res = await adminServices.allrefferalslist(payload);
                if (res && res.data) {
                    rawList = Array.isArray(res.data)
                        ? res.data
                        : (Array.isArray(res.data.data)
                            ? res.data.data
                            : (Array.isArray(res.data.list) ? res.data.list : []));
                }
            } catch (err) {
                console.warn("allrefferalslist export fallback:", err);
                try {
                    const fallbackRes = await adminServices.refferalslist(payload);
                    if (fallbackRes && fallbackRes.data) {
                        rawList = Array.isArray(fallbackRes.data)
                            ? fallbackRes.data
                            : (Array.isArray(fallbackRes.data.data)
                                ? fallbackRes.data.data
                                : (Array.isArray(fallbackRes.data.list) ? fallbackRes.data.list : []));
                    }
                } catch (fallbackErr) {
                    console.warn("refferalslist fallback failed:", fallbackErr);
                }
            }

            if (!rawList || rawList.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "No Records",
                    text: "There are no referral records to export."
                });
                return;
            }

            // Map and format rows for Excel spreadsheet
            const excelData = rawList.map((item, idx) => {
                const rawStatus = item.registration_status !== undefined
                    ? item.registration_status
                    : (item.rf_status !== undefined ? item.rf_status : item.status);

                let regStatus = "Not Registered";
                if (rawStatus === 1 || rawStatus === "1" || String(rawStatus).toLowerCase() === "registered" || rawStatus === true || rawStatus === "true") {
                    regStatus = "Registered";
                } else if (typeof rawStatus === "string" && rawStatus.trim() !== "") {
                    regStatus = rawStatus.trim();
                }

                return {
                    "Sl No": idx + 1,
                    "Referrer Name / Code": item.rf_on_fileno || item.userfilename || item.rf_on_name || item.referral_name || "-",
                    "Referrer Email": item.rf_on_email || item.referral_email || item.email || "-",
                    "Referrer Phone": formatPhoneNumber(item.rf_on_phone || item.referral_phone || item.phone),
                    "Referred Name": (item.rf_name || item.referral_to_name || item.friend_name || item.name || "-").toUpperCase(),
                    "Referred Email": item.rf_email || item.referral_to_email || item.friend_email || "-",
                    "Referred Phone": formatPhoneNumber(item.rf_phone || item.referral_to_phone || item.friend_phone),
                    "Registration Status": regStatus,
                    "Comment": item.rf_comment || "-",
                    "Tax Year": item.rf_year || taxYear,
                    "Date": item.rf_created_at || item.created_at || item.added_at || "-"
                };
            });

            // Sort with Not Registered first, Registered second
            excelData.sort((a, b) => {
                const aReg = String(a["Registration Status"]).toLowerCase() === "registered";
                const bReg = String(b["Registration Status"]).toLowerCase() === "registered";
                if (aReg === bReg) return 0;
                return aReg ? 1 : -1;
            });

            exportToExcel(excelData, `UTS_Referrals_${taxYear}_${new Date().toISOString().slice(0, 10)}`, "Referrals");

            Swal.fire({
                icon: "success",
                title: "Export Complete",
                text: `Exported ${excelData.length} referral records to Excel.`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            });
        } catch (error) {
            console.error("Export error:", error);
            Swal.fire({
                icon: "error",
                title: "Export Failed",
                text: "Could not export referral data. Please try again."
            });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="admin-referrals-container">
            {/* Top Search & Filter Bar */}
            <div className="ref-topbar">
                <div className="ref-filters">
                    <button
                        type="button"
                        className={`ref-filter-btn ${statusFilter === "ALL" ? "active" : ""}`}
                        onClick={() => setStatusFilter("ALL")}
                    >
                        All
                        <span className="ref-filter-badge">{counts.total}</span>
                    </button>
                    <button
                        type="button"
                        className={`ref-filter-btn ${statusFilter === "NOT_REGISTERED" ? "active" : ""}`}
                        onClick={() => setStatusFilter("NOT_REGISTERED")}
                    >
                        Not Registered
                        <span className="ref-filter-badge">{counts.notRegistered}</span>
                    </button>
                    <button
                        type="button"
                        className={`ref-filter-btn ${statusFilter === "REGISTERED" ? "active" : ""}`}
                        onClick={() => setStatusFilter("REGISTERED")}
                    >
                        Registered
                        <span className="ref-filter-badge">{counts.registered}</span>
                    </button>
                </div>

                <div className="ref-actions">
                    <button
                        type="button"
                        className="ref-export-btn"
                        onClick={handleExportExcel}
                        disabled={exporting || loading}
                        title="Export all referrals to Excel"
                    >
                        <FiDownload />
                        {exporting ? "Exporting..." : "Export Excel"}
                    </button>

                    <div className="ref-search-box">
                        <input
                            type="text"
                            className="ref-search-input"
                            placeholder="Search referrals..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FiSearch className="ref-search-icon" />
                    </div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="ref-table-card">
                <div className="ref-table-responsive">
                    <table className="ref-table">
                        <thead>
                            <tr>
                                <th>Referral Name</th>
                                <th>Referral Email</th>
                                <th>Referral Phone</th>
                                <th>Referral To Name ID</th>
                                <th>Referral To Email</th>
                                <th>Referral To Phone</th>
                                <th>Action</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="ref-loading-state">
                                            <div className="ref-spinner"></div>
                                            <p className="mb-0">Loading referrals...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="ref-empty-state text-danger">
                                            <p className="mb-2">{errorMsg}</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={fetchReferrals}
                                            >
                                                <FiRefreshCw className="me-1" /> Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="ref-empty-state">
                                            <p className="mb-0">No referral records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td className="ref-cell-code">{item.referral_name}</td>
                                        <td className="ref-cell-email">{item.referral_email}</td>
                                        <td className="ref-cell-phone">{item.referral_phone}</td>
                                        <td className="ref-cell-toname">{item.referral_to_name}</td>
                                        <td className="ref-cell-email">{item.referral_to_email}</td>
                                        <td className="ref-cell-phone">{item.referral_to_phone}</td>
                                        <td>
                                            <button
                                                className="ref-view-link"
                                                onClick={() => handleViewReferral(item)}
                                            >
                                                View
                                            </button>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    item.registered_status === "Registered"
                                                        ? "ref-status-registered"
                                                        : "ref-status-not-registered"
                                                }
                                            >
                                                {item.registered_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Pagination Bar */}
            {!loading && filteredRecords.length > 0 && (
                <div className="ref-pagination-footer">
                    <div className="ref-rows-per-page">
                        <span className="ref-rows-label">Row per page</span>
                        <div className="ref-select-wrapper">
                            <select
                                className="ref-select"
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10 / page</option>
                                <option value={25}>25 / page</option>
                                <option value={50}>50 / page</option>
                                <option value={100}>100 / page</option>
                            </select>
                            <FiChevronDown className="ref-select-icon" />
                        </div>
                    </div>

                    <div className="ref-pagination-controls">
                        <button
                            className="lh-page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            title="Previous Page"
                        >
                            <FiChevronLeft />
                        </button>

                        {getPageNumbers().map((page, index) => {
                            if (page === "...") {
                                return (
                                    <span key={`ellipsis-${index}`} className="ref-page-ellipsis">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={`page-${page}`}
                                    className={`ref-page-btn ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="ref-page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            title="Next Page"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReferrals;
