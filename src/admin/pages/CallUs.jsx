import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiRefreshCw, FiDownload } from "react-icons/fi";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import { exportToExcel } from "../../utils/excelExport";
import "./call_us.css";

const CallUs = () => {
    const [callUsList, setCallUsList] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [errorMsg, setErrorMsg] = useState("");

    // Extract credentials helper
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

    // Format phone helper with country extension support
    const formatPhoneNumber = (phone, ext) => {
        if (!phone) return "-";
        const cleaned = ("" + phone).replace(/\D/g, "");
        let formatted = phone;
        if (cleaned.length === 10) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        if (ext) {
            const cleanExt = ("" + ext).replace(/\D/g, "");
            if (cleanExt) {
                return `+${cleanExt} ${formatted}`;
            }
        } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        return formatted;
    };

    // Format datetime into Date and Time parts
    const formatDateTime = (dateStr) => {
        if (!dateStr) return { date: "-", time: "" };
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) {
                const parts = dateStr.trim().split(" ");
                return {
                    date: parts[0] || dateStr,
                    time: parts[1] || ""
                };
            }
            const dateFormatted = d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            const timeFormatted = d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });

            return {
                date: dateFormatted,
                time: timeFormatted
            };
        } catch {
            return { date: dateStr, time: "" };
        }
    };

    // Status badge styling helper
    const getStatusBadgeClass = (statusStr) => {
        const s = String(statusStr || "").toLowerCase().replace(/[\s_-]+/g, "");
        if (s.includes("getregistered") || s.includes("registered")) {
            return "callus-status-badge callus-status-get-registered";
        }
        if (s.includes("followup")) {
            return "callus-status-badge callus-status-follow-up";
        }
        if (s.includes("noresponse") || s.includes("noresponses")) {
            return "callus-status-badge callus-status-no-responses";
        }
        return "callus-status-badge callus-status-pending";
    };

    // Fetch Call Us data
    const fetchCallUsData = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const { userId, taxYear } = getCredentials();
            const payload = {
                user_id: userId,
                taxYear: String(taxYear),
                page: currentPage,
                per_page: rowsPerPage,
                perpage: rowsPerPage,
                start: (currentPage - 1) * rowsPerPage,
                length: rowsPerPage,
                limit: rowsPerPage,
                offset: (currentPage - 1) * rowsPerPage,
                search: searchTerm ? searchTerm.trim() : ""
            };

            let dataLoaded = false;
            let countTotal = 0;

            // 1. Primary API: /api/user/wantusinfo
            try {
                const res = await adminServices.wantusinfo(payload);
                if (res && res.data) {
                    const raw = res.data.data || (Array.isArray(res.data) ? res.data : []);
                    countTotal = res.data.recordsTotal || res.data.recordsFiltered || res.data.total_records || res.data.total || (Array.isArray(raw) ? raw.length : 0);

                    if (Array.isArray(raw) && raw.length > 0) {
                        const mapped = raw.map((item, idx) => {
                            const dt = formatDateTime(item.c_created_at || item.created_at || item.createdat || item.date);
                            return {
                                id: item.contact_id || item.id || `call_${idx}`,
                                client_name: item.c_name || item.client_name || item.name || item.userfilename || item.filenumber || `UTS${1000 + idx}`,
                                email_id: item.c_email || item.email_id || item.email || item.useremail || "-",
                                phone: formatPhoneNumber(item.c_phone || item.phone || item.mobile || item.userphone, item.c_phone_ext || item.phone_ext || item.ext),
                                message: item.c_message || item.message || item.comments || item.description || "-",
                                date: dt.date,
                                time: dt.time,
                                current_status: item.current_status || item.status || "Pending"
                            };
                        });
                        setCallUsList(mapped);
                        setTotalRecords(countTotal);
                        dataLoaded = true;
                    }
                }
            } catch (err) {
                console.warn("wantusinfo API error/fallback:", err);
            }

            // 2. Fallback API: /api/member/calluslist
            if (!dataLoaded) {
                try {
                    const res = await adminServices.calluslist(payload);
                    if (res && res.data) {
                        const raw = res.data.data || (Array.isArray(res.data) ? res.data : []);
                        countTotal = res.data.recordsTotal || res.data.recordsFiltered || res.data.total_records || res.data.total || (Array.isArray(raw) ? raw.length : 0);

                        if (Array.isArray(raw) && raw.length > 0) {
                            const mapped = raw.map((item, idx) => {
                                const dt = formatDateTime(item.c_created_at || item.created_at || item.createdat || item.date);
                                return {
                                    id: item.contact_id || item.id || `call_${idx}`,
                                    client_name: item.c_name || item.client_name || item.name || item.userfilename || item.filenumber || `UTS${1000 + idx}`,
                                    email_id: item.c_email || item.email_id || item.email || item.useremail || "-",
                                    phone: formatPhoneNumber(item.c_phone || item.phone || item.mobile || item.userphone, item.c_phone_ext || item.phone_ext || item.ext),
                                    message: item.c_message || item.message || item.comments || item.description || "-",
                                    date: dt.date,
                                    time: dt.time,
                                    current_status: item.current_status || item.status || "Pending"
                                };
                            });
                            setCallUsList(mapped);
                            setTotalRecords(countTotal);
                            dataLoaded = true;
                        }
                    }
                } catch (err) {
                    console.warn("calluslist API fallback error:", err);
                }
            }

            if (!dataLoaded) {
                setCallUsList([]);
                setTotalRecords(0);
            }
        } catch (err) {
            console.error("Error fetching call us records:", err);
            setCallUsList([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, searchTerm]);

    useEffect(() => {
        fetchCallUsData();
    }, [fetchCallUsData]);

    useEffect(() => {
        const handleTaxYearChange = () => {
            setCurrentPage(1);
            fetchCallUsData();
        };
        window.addEventListener("taxYearChanged", handleTaxYearChange);
        return () => {
            window.removeEventListener("taxYearChanged", handleTaxYearChange);
        };
    }, [fetchCallUsData]);

    // Handle status change via Action dropdown
    const handleStatusChange = async (item, newStatus) => {
        if (!newStatus) return;
        try {
            const payload = {
                contact_id: item.id,
                current_status: newStatus
            };

            // Optimistic update
            setCallUsList((prev) =>
                prev.map((r) => (r.id === item.id ? { ...r, current_status: newStatus } : r))
            );

            const res = await adminServices.updatecontactstatus(payload);
            if (res && res.data && (res.data.http_code === 200 || res.data.status === true)) {
                Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text: `Status updated to "${newStatus}" for ${item.client_name}`,
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end"
                });
            } else {
                fetchCallUsData();
            }
        } catch (err) {
            console.error("Error updating contact status:", err);
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: "Failed to update contact status. Please try again.",
                timer: 2500,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            });
            fetchCallUsData();
        }
    };

    // View complete message in modal
    const handleViewMessage = (item) => {
        Swal.fire({
            title: `<span style="font-family:'Outfit',sans-serif;font-size:1.2rem;font-weight:700;color:#1e293b;">Client Inquiry</span>`,
            html: `
                <div style="text-align:left;font-family:'Outfit',sans-serif;font-size:0.9rem;color:#334155;line-height:1.7;">
                    <div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e2e8f0;">
                        <b>Client:</b> ${item.client_name}<br/>
                        <b>Email:</b> ${item.email_id}<br/>
                        <b>Phone:</b> ${item.phone}<br/>
                        <b>Status:</b> ${item.current_status}<br/>
                        <b>Date:</b> ${item.date} ${item.time}
                    </div>
                    <div>
                        <strong style="color:#1b2e6b;">Message:</strong>
                        <p style="margin-top:6px;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:0.88rem;white-space:pre-wrap;">
                            ${item.message}
                        </p>
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

    // Search filter
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return callUsList;
        const term = searchTerm.toLowerCase().trim();
        return callUsList.filter((item) => {
            const client = (item.client_name || "").toLowerCase();
            const email = (item.email_id || "").toLowerCase();
            const phone = (item.phone || "").toLowerCase();
            const message = (item.message || "").toLowerCase();
            const dateStr = (item.date + " " + item.time).toLowerCase();
            const status = (item.current_status || "").toLowerCase();

            return (
                client.includes(term) ||
                email.includes(term) ||
                phone.includes(term) ||
                message.includes(term) ||
                dateStr.includes(term) ||
                status.includes(term)
            );
        });
    }, [callUsList, searchTerm]);

    // Total records count: uses server's recordsTotal if available
    const effectiveTotalCount = totalRecords > 0 ? totalRecords : filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / rowsPerPage));

    const paginatedRecords = useMemo(() => {
        if (totalRecords > callUsList.length && callUsList.length <= rowsPerPage) {
            return filteredRecords;
        }
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRecords.slice(start, start + rowsPerPage);
    }, [filteredRecords, totalRecords, callUsList.length, rowsPerPage, currentPage]);

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

    // Export all Call Us inquiries to Excel with export: true
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
                const res = await adminServices.wantusinfo(payload);
                if (res && res.data) {
                    rawList = res.data.data || (Array.isArray(res.data) ? res.data : []);
                }
            } catch (err) {
                console.warn("wantusinfo export fallback:", err);
                try {
                    const fallbackRes = await adminServices.calluslist(payload);
                    if (fallbackRes && fallbackRes.data) {
                        rawList = fallbackRes.data.data || (Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
                    }
                } catch (e) {
                    console.warn("calluslist export fallback error:", e);
                }
            }

            if (!rawList || rawList.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "No Records",
                    text: "There are no inquiry records to export."
                });
                return;
            }

            // Map and format rows for Excel spreadsheet
            const excelData = rawList.map((item, idx) => {
                const dt = formatDateTime(item.c_created_at || item.created_at || item.createdat || item.date);
                return {
                    "Sl No": idx + 1,
                    "Client Name": item.c_name || item.client_name || item.name || item.userfilename || item.filenumber || "-",
                    "Email ID": item.c_email || item.email_id || item.email || item.useremail || "-",
                    "Phone": formatPhoneNumber(item.c_phone || item.phone || item.mobile || item.userphone, item.c_phone_ext || item.phone_ext || item.ext),
                    "Message": item.c_message || item.message || item.comments || item.description || "-",
                    "Current Status": item.current_status || item.status || "Pending",
                    "Date": dt.date || "-",
                    "Time": dt.time || "-",
                    "Tax Year": item.c_year || taxYear
                };
            });

            exportToExcel(excelData, `UTS_CallUs_Inquiries_${taxYear}_${new Date().toISOString().slice(0, 10)}`, "Inquiries");

            Swal.fire({
                icon: "success",
                title: "Export Complete",
                text: `Exported ${excelData.length} inquiry records to Excel.`,
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
                text: "Could not export inquiries data. Please try again."
            });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="admin-callus-container">
            {/* Top Search & Actions Bar */}
            <div className="callus-topbar">
                <button
                    type="button"
                    className="callus-export-btn"
                    onClick={handleExportExcel}
                    disabled={exporting || loading}
                    title="Export all inquiries to Excel"
                >
                    <FiDownload />
                    {exporting ? "Exporting..." : "Export Excel"}
                </button>

                <div className="callus-search-box">
                    <input
                        type="text"
                        className="callus-search-input"
                        placeholder="Search inquiries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="callus-search-icon" />
                </div>
            </div>

            {/* Main Table Card */}
            <div className="callus-table-card">
                <div className="callus-table-responsive">
                    <table className="callus-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Email ID</th>
                                <th>Phone</th>
                                <th>Message</th>
                                <th>Current Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="callus-loading-state">
                                            <div className="callus-spinner"></div>
                                            <p className="mb-0">Loading inquiries...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="callus-empty-state text-danger">
                                            <p className="mb-2">{errorMsg}</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={fetchCallUsData}
                                            >
                                                <FiRefreshCw className="me-1" /> Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="callus-empty-state">
                                            <p className="mb-0">No call requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td className="callus-cell-name">{item.client_name}</td>
                                        <td className="callus-cell-email">{item.email_id}</td>
                                        <td className="callus-cell-phone">{item.phone}</td>
                                        <td
                                            className="callus-cell-message cursor-pointer"
                                            title="Click to view full message"
                                            onClick={() => handleViewMessage(item)}
                                        >
                                            {item.message}
                                        </td>
                                        <td>
                                            <span className={getStatusBadgeClass(item.current_status)}>
                                                {item.current_status}
                                            </span>
                                        </td>
                                        <td className="callus-cell-date">
                                            <span className="callus-date-line">{item.date}</span>
                                            {item.time && <span className="callus-time-line">{item.time}</span>}
                                        </td>
                                        <td>
                                            <div className="callus-action-select-wrapper">
                                                <select
                                                    className="callus-action-select"
                                                    value={["Get Registered", "Follow Up", "No Responses"].includes(item.current_status) ? item.current_status : ""}
                                                    onChange={(e) => handleStatusChange(item, e.target.value)}
                                                >
                                                    <option value="" disabled hidden>
                                                        {item.current_status && !["Get Registered", "Follow Up", "No Responses"].includes(item.current_status)
                                                            ? item.current_status
                                                            : "Select Action"}
                                                    </option>
                                                    <option value="Get Registered">Get Registered</option>
                                                    <option value="Follow Up">Follow Up</option>
                                                    <option value="No Responses">No Responses</option>
                                                </select>
                                                <FiChevronDown className="callus-action-select-icon" />
                                            </div>
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
                <div className="callus-pagination-footer">
                    <div className="callus-rows-per-page">
                        <span className="callus-rows-label">Row per page</span>
                        <div className="callus-select-wrapper">
                            <select
                                className="callus-select"
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
                            <FiChevronDown className="callus-select-icon" />
                        </div>
                    </div>

                    <div className="callus-pagination-controls">
                        <button
                            className="callus-page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            title="Previous Page"
                        >
                            <FiChevronLeft />
                        </button>

                        {getPageNumbers().map((page, index) => {
                            if (page === "...") {
                                return (
                                    <span key={`ellipsis-${index}`} className="callus-page-ellipsis">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={`page-${page}`}
                                    className={`callus-page-btn ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="callus-page-btn"
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

export default CallUs;
