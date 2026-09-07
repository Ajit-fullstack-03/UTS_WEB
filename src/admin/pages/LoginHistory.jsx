import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import "./login_history.css";

const LoginHistory = () => {
    const [loginRecords, setLoginRecords] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
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

    // Fetch login history
    const fetchLoginHistory = useCallback(async () => {
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

            const response = await adminServices.loginshistory(payload);
            
            if (response && response.data) {
                const rawData = response.data.data || response.data.history || (Array.isArray(response.data) ? response.data : []);
                const countTotal = response.data.recordsTotal || response.data.recordsFiltered || response.data.total_records || response.data.total || (Array.isArray(rawData) ? rawData.length : 0);
                setLoginRecords(rawData);
                setTotalRecords(countTotal);
            } else {
                setLoginRecords([]);
                setTotalRecords(0);
            }
        } catch (err) {
            console.error("Error fetching login history:", err);
            setErrorMsg("Failed to load login history records. Please try again.");
            setLoginRecords([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, searchTerm]);

    useEffect(() => {
        fetchLoginHistory();
    }, [fetchLoginHistory]);

    useEffect(() => {
        const handleTaxYearChange = () => {
            setCurrentPage(1);
            fetchLoginHistory();
        };
        window.addEventListener("taxYearChanged", handleTaxYearChange);
        return () => {
            window.removeEventListener("taxYearChanged", handleTaxYearChange);
        };
    }, [fetchLoginHistory]);

    // Format phone helper (e.g. 7751002719 -> (775) 100-2719 or preserve if custom)
    const formatPhoneNumber = (phone, ext) => {
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

    // Filter records by search term
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return loginRecords;
        const term = searchTerm.toLowerCase().trim();
        return loginRecords.filter((item) => {
            const fileNo = (item.userfilename || item.filenumber || "").toLowerCase();
            const name = (item.username || item.name || "").toLowerCase();
            const email = (item.useremail || item.email || "").toLowerCase();
            const phone = (item.userphone || item.phone || "").toLowerCase();
            const status = (item.file_status || item.filestatus || "").toLowerCase();
            const dt = formatDateTime(item.createdat || item.created_at);
            const dateStr = (dt.date + " " + dt.time).toLowerCase();

            return (
                fileNo.includes(term) ||
                name.includes(term) ||
                email.includes(term) ||
                phone.includes(term) ||
                status.includes(term) ||
                dateStr.includes(term)
            );
        });
    }, [loginRecords, searchTerm]);

    // Total records count: uses server's recordsTotal if available
    const effectiveTotalCount = totalRecords > 0 ? totalRecords : filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / rowsPerPage));

    const paginatedRecords = useMemo(() => {
        if (totalRecords > loginRecords.length && loginRecords.length <= rowsPerPage) {
            return filteredRecords;
        }
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRecords.slice(start, start + rowsPerPage);
    }, [filteredRecords, totalRecords, loginRecords.length, rowsPerPage, currentPage]);

    // Pagination page list with ellipses
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

    return (
        <div className="login-history-container">
            {/* Top Search Bar */}
            <div className="login-history-topbar">
                <div className="lh-search-box">
                    <input
                        type="text"
                        className="lh-search-input"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="lh-search-icon" />
                </div>
            </div>

            {/* Main Table Card */}
            <div className="lh-table-card">
                <div className="lh-table-responsive">
                    <table className="lh-table">
                        <thead>
                            <tr>
                                <th>File Number</th>
                                <th>Name</th>
                                <th>Email ID</th>
                                <th>Phone</th>
                                <th>File Status</th>
                                <th>Logged Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="lh-loading-state">
                                            <div className="lh-spinner"></div>
                                            <p className="mb-0">Loading login history records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="lh-empty-state text-danger">
                                            <p className="mb-2">{errorMsg}</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={fetchLoginHistory}
                                            >
                                                <FiRefreshCw className="me-1" /> Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="lh-empty-state">
                                            <p className="mb-0">No login history records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((item, idx) => {
                                    const fileNo = item.userfilename || item.filenumber || "-";
                                    const name = item.username || item.name || "-";
                                    const email = item.useremail || item.email || "-";
                                    const phone = formatPhoneNumber(item.userphone || item.phone, item.userphoneext);
                                    const fileStatus = (item.file_status || item.filestatus || "-").toUpperCase();
                                    const dt = formatDateTime(item.createdat || item.created_at);

                                    return (
                                        <tr key={item.ps_id || item.userid || idx}>
                                            <td className="lh-cell-fileno">{fileNo}</td>
                                            <td className="lh-cell-name">{name}</td>
                                            <td className="lh-cell-email">{email}</td>
                                            <td className="lh-cell-phone">{phone}</td>
                                            <td className="lh-cell-status">{fileStatus}</td>
                                            <td className="lh-cell-date">
                                                <span className="lh-date-line">{dt.date}</span>
                                                {dt.time && <span className="lh-time-line">{dt.time}</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Pagination Bar */}
            {!loading && filteredRecords.length > 0 && (
                <div className="lh-pagination-footer">
                    <div className="lh-rows-per-page">
                        <span className="lh-rows-label">Row per page</span>
                        <div className="lh-select-wrapper">
                            <select
                                className="lh-select"
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
                            <FiChevronDown className="lh-select-icon" />
                        </div>
                    </div>

                    <div className="lh-pagination-controls">
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
                                    <span key={`ellipsis-${index}`} className="lh-page-ellipsis">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={`page-${page}`}
                                    className={`lh-page-btn ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="lh-page-btn"
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

export default LoginHistory;
