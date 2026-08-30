import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import "./payments.css";

const Payments = () => {
    const [paymentsList, setPaymentsList] = useState([]);
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

    // Format date & time helper
    const formatOrderPlaced = (dateVal, timeVal) => {
        if (!dateVal && !timeVal) return { date: "-", time: "" };
        if (dateVal === "Assigned" || (typeof dateVal === "string" && isNaN(Date.parse(dateVal)) && dateVal.length < 15 && !dateVal.includes("-") && !dateVal.includes("/"))) {
            return { date: dateVal, time: "" };
        }
        try {
            const d = new Date(dateVal);
            if (!isNaN(d.getTime())) {
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                const year = d.getFullYear();
                const hours = String(d.getHours()).padStart(2, "0");
                const minutes = String(d.getMinutes()).padStart(2, "0");
                const seconds = String(d.getSeconds()).padStart(2, "0");

                return {
                    date: `${month}-${day}-${year}`,
                    time: `${hours}:${minutes}:${seconds}`
                };
            }
        } catch {
            // fallback
        }
        return {
            date: dateVal || "-",
            time: timeVal || ""
        };
    };

    // Fetch payments data from backend with fallback
    const fetchPayments = useCallback(async () => {
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

            // Attempt 1: paymenthistory endpoint
            try {
                const res = await adminServices.paymenthistory(payload);
                if (res && res.data) {
                    const raw = res.data.data || (Array.isArray(res.data) ? res.data : []);
                    countTotal = res.data.recordsTotal || res.data.recordsFiltered || res.data.total_records || res.data.total || (Array.isArray(raw) ? raw.length : 0);

                    if (Array.isArray(raw) && raw.length > 0) {
                        setPaymentsList(raw);
                        setTotalRecords(countTotal);
                        dataLoaded = true;
                    }
                }
            } catch (e) {
                // Ignore and try next
            }

            // Attempt 2: paymentshistory endpoint
            if (!dataLoaded) {
                try {
                    const res = await adminServices.paymentshistory(payload);
                    if (res && res.data) {
                        const raw = res.data.data || (Array.isArray(res.data) ? res.data : []);
                        countTotal = res.data.recordsTotal || res.data.recordsFiltered || res.data.total_records || res.data.total || (Array.isArray(raw) ? raw.length : 0);

                        if (Array.isArray(raw) && raw.length > 0) {
                            setPaymentsList(raw);
                            setTotalRecords(countTotal);
                            dataLoaded = true;
                        }
                    }
                } catch (e) {
                    // Ignore and try next
                }
            }

            // Attempt 3: paymentslist endpoint
            if (!dataLoaded) {
                try {
                    const res = await adminServices.paymentslist(payload);
                    if (res && res.data) {
                        const raw = res.data.data || (Array.isArray(res.data) ? res.data : []);
                        countTotal = res.data.recordsTotal || res.data.recordsFiltered || res.data.total_records || res.data.total || (Array.isArray(raw) ? raw.length : 0);

                        if (Array.isArray(raw) && raw.length > 0) {
                            setPaymentsList(raw);
                            setTotalRecords(countTotal);
                            dataLoaded = true;
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }

            if (!dataLoaded) {
                setPaymentsList([]);
                setTotalRecords(0);
            }
        } catch (err) {
            console.error("Error loading payments:", err);
            setPaymentsList([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, searchTerm]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    useEffect(() => {
        const handleTaxYearChange = () => {
            setCurrentPage(1);
            fetchPayments();
        };
        window.addEventListener("taxYearChanged", handleTaxYearChange);
        return () => {
            window.removeEventListener("taxYearChanged", handleTaxYearChange);
        };
    }, [fetchPayments]);

    // Format status css class helper
    const getStatusClass = (statusStr) => {
        const s = String(statusStr || "").toLowerCase();
        if (s.includes("success") || s.includes("paid") || s.includes("completed")) {
            return "pm-status-success";
        }
        if (s.includes("pending") || s.includes("created")) {
            return "pm-status-pending";
        }
        if (s.includes("failed") || s.includes("cancel") || s.includes("rejected")) {
            return "pm-status-failed";
        }
        return "pm-status-default";
    };

    // Normalized search filtering
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return paymentsList;
        const term = searchTerm.toLowerCase().trim();
        return paymentsList.filter((item) => {
            const userName = (item.user_name || item.username || item.name || item.client_name || "").toLowerCase();
            const email = (item.email_id || item.email || item.useremail || "").toLowerCase();
            const fileNo = (item.file_number || item.filenumber || item.userfilename || "").toLowerCase();
            const amount = String(item.amount || item.paid_amount || item.order_amount || "").toLowerCase();
            const txnId = (item.order_transaction_id || item.transaction_id || item.order_id || "").toLowerCase();
            const status = (item.order_status || item.status || item.payment_status || "").toLowerCase();
            const dateStr = (item.order_placed_date || item.createdat || item.created_at || "").toLowerCase();

            return (
                userName.includes(term) ||
                email.includes(term) ||
                fileNo.includes(term) ||
                amount.includes(term) ||
                txnId.includes(term) ||
                status.includes(term) ||
                dateStr.includes(term)
            );
        });
    }, [paymentsList, searchTerm]);

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage]);

    // Total records count: uses server's recordsTotal if available
    const effectiveTotalCount = totalRecords > 0 ? totalRecords : filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / rowsPerPage));

    const paginatedRecords = useMemo(() => {
        if (totalRecords > paymentsList.length && paymentsList.length <= rowsPerPage) {
            return filteredRecords;
        }
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRecords.slice(start, start + rowsPerPage);
    }, [filteredRecords, totalRecords, paymentsList.length, rowsPerPage, currentPage]);

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

    return (
        <div className="payments-page-container">
            {/* Top Search Bar */}
            <div className="pm-topbar">
                <div className="pm-search-box">
                    <input
                        type="text"
                        className="pm-search-input"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="pm-search-icon" />
                </div>
            </div>

            {/* Main Table Card */}
            <div className="pm-table-card">
                <div className="pm-table-responsive">
                    <table className="pm-table">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Email ID</th>
                                <th>File Number</th>
                                <th>Amount</th>
                                <th>Order Transaction Id</th>
                                <th>Order Status</th>
                                <th>Order Placed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="pm-loading-state">
                                            <div className="pm-spinner"></div>
                                            <p className="mb-0">Loading payments...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="pm-empty-state text-danger">
                                            <p className="mb-2">{errorMsg}</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={fetchPayments}
                                            >
                                                <FiRefreshCw className="me-1" /> Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="pm-empty-state">
                                            <p className="mb-0">No payment records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((item, idx) => {
                                    const userName = item.user_name || item.username || item.name || item.client_name || "-";
                                    const email = item.email_id || item.email || item.useremail || "-";
                                    const fileNumber = item.file_number || item.filenumber || item.userfilename || "-";
                                    const amount = item.amount || item.paid_amount || item.order_amount || "-";
                                    const txnId = item.order_transaction_id || item.transaction_id || item.order_id || "-";
                                    const orderStatus = item.order_status || item.status || item.payment_status || "Payment Pending";
                                    const placed = formatOrderPlaced(
                                        item.order_placed_date || item.createdat || item.created_at,
                                        item.order_placed_time
                                    );

                                    return (
                                        <tr key={item.id || item.order_transaction_id || idx}>
                                            <td>
                                                <span className="pm-user-link">
                                                    {userName}
                                                </span>
                                            </td>
                                            <td className="pm-cell-email">{email}</td>
                                            <td className="pm-cell-fileno">{fileNumber}</td>
                                            <td className="pm-cell-amount">{amount}</td>
                                            <td className="pm-cell-txnid">{txnId}</td>
                                            <td>
                                                <span className={getStatusClass(orderStatus)}>
                                                    {orderStatus}
                                                </span>
                                            </td>
                                            <td className="pm-cell-placed">
                                                <span className="pm-date-line">{placed.date}</span>
                                                {placed.time && <span className="pm-time-line">{placed.time}</span>}
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
                <div className="pm-pagination-footer">
                    <div className="pm-rows-per-page">
                        <span className="pm-rows-label">Row per page</span>
                        <div className="pm-select-wrapper">
                            <select
                                className="pm-select"
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
                            <FiChevronDown className="pm-select-icon" />
                        </div>
                    </div>

                    <div className="pm-pagination-controls">
                        <button
                            className="pm-page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            title="Previous Page"
                        >
                            <FiChevronLeft />
                        </button>

                        {getPageNumbers().map((page, index) => {
                            if (page === "...") {
                                return (
                                    <span key={`ellipsis-${index}`} className="pm-page-ellipsis">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={`page-${page}`}
                                    className={`pm-page-btn ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="pm-page-btn"
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

export default Payments;
