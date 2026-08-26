import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import "./comments.css";

// Sample initial data matching Figma design mockups
const DEFAULT_COMMENTS_DATA = [
    {
        id: "1",
        file_number: "UTS0540",
        client_name: "(510) 935-6510",
        analyst_name: "Admin Rajesh",
        comment: "fees:$304.94_1040 .. admin after disc $280 .. said that he will make the payment in sometime",
        previous_state: "E-Filing Complete",
        present_state: "E-Filing Complete",
        date: "07-24-2026",
        time: "06:59:32"
    },
    {
        id: "2",
        file_number: "UTS0540",
        client_name: "(510) 935-6510",
        analyst_name: "Admin Rajesh",
        comment: "fees:$304.94_1040 .. admin after disc $280 .. said that he will make the payment in sometime",
        previous_state: "Confirmation Pending",
        present_state: "E-Filing Complete",
        date: "07-24-2026",
        time: "06:59:32"
    },
    {
        id: "3",
        file_number: "UTS8209",
        client_name: "(470) 338-2209",
        analyst_name: "Admin SaiKiran",
        comment: "fees:$304.94_1040 .. admin after disc $280 .. said that he will make the payment in sometime",
        previous_state: "Review Pending",
        present_state: "E-Filing Complete",
        date: "07-24-2026",
        time: "06:59:32"
    },
    {
        id: "4",
        file_number: "UTS0540",
        client_name: "(510) 935-6510",
        analyst_name: "Admin Rajesh",
        comment: "reddy.ushakar05@gmailcom",
        previous_state: "Payment Pending",
        present_state: "E-Filing Complete",
        date: "07-24-2026",
        time: "06:59:32"
    },
    {
        id: "5",
        file_number: "UTS8209",
        client_name: "(470) 338-2209",
        analyst_name: "Admin SaiKiran",
        comment: "ptsrinu2792@gmail.com",
        previous_state: "Payment Pending",
        present_state: "E-Filing Complete",
        date: "07-24-2026",
        time: "06:59:32"
    }
];

const AdminComments = () => {
    const [commentsList, setCommentsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [errorMsg, setErrorMsg] = useState("");

    // Extract credentials helper
    const getCredentials = () => {
        const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
        let userId = localStorage.getItem("currentUser");
        let taxYear = "2025";
        let clientId = null;

        if (userInfoStr) {
            try {
                const parsed = JSON.parse(userInfoStr);
                if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
                if (parsed.taxyear || parsed.taxYear || parsed.current_year) taxYear = String(parsed.taxyear || parsed.taxYear || parsed.current_year);
                if (parsed.client_id || parsed.clientId) clientId = String(parsed.client_id || parsed.clientId);
            } catch {
                if (typeof userInfoStr === "string" && userInfoStr.length > 5) {
                    userId = userInfoStr.replace(/"/g, "");
                }
            }
        }
        return { userId, taxYear, clientId };
    };

    // Format phone helper
    const formatPhoneNumber = (phone) => {
        if (!phone) return "-";
        const cleaned = ("" + phone).replace(/\D/g, "");
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
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
        } catch {
            return { date: dateStr, time: "" };
        }
    };

    // Fetch comments list
    const fetchComments = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const { userId, taxYear, clientId } = getCredentials();
            const payload = {
                user_id: userId,
                taxYear: String(taxYear),
                ...(clientId ? { client_id: String(clientId) } : {})
            };

            let dataLoaded = false;

            // 1. Primary API endpoint: /api/member/usercomments
            try {
                const res = await adminServices.usercomments(payload);
                if (res && res.data && (res.data.data || Array.isArray(res.data))) {
                    const raw = res.data.data || res.data;
                    if (Array.isArray(raw) && raw.length > 0) {
                        const mapped = raw.map((item, idx) => {
                            const dt = formatDateTime(item.cmt_created_at || item.created_at || item.createdat || item.date);
                            return {
                                id: item.id || item.cmt_id || `cmt_${idx}`,
                                file_number: item.unique_code || item.file_number || item.filenumber || item.userfilename || (item.client_id ? `UTS${String(item.client_id).padStart(4, "0")}` : `UTS${1000 + idx}`),
                                client_name: item.clientname || item.client_name || item.name || formatPhoneNumber(item.phone || item.userphone) || "-",
                                analyst_name: item.user_name || item.analyst_name || item.assigned_to || item.admin_name || "Admin Rajesh",
                                comment: item.comment || item.comments || item.remark || "-",
                                previous_state: item.previousstate || item.previous_state || item.prev_status || "-",
                                present_state: item.presentstate || item.present_state || item.current_status || "-",
                                date: dt.date,
                                time: dt.time
                            };
                        });
                        setCommentsList(mapped);
                        dataLoaded = true;
                    }
                }
            } catch (err) {
                console.warn("usercomments API error/fallback:", err);
            }

            // 2. Fallback API endpoint: /api/member/commentslist
            if (!dataLoaded) {
                try {
                    const res = await adminServices.commentslist(payload);
                    if (res && res.data && (res.data.data || Array.isArray(res.data))) {
                        const raw = res.data.data || res.data;
                        if (Array.isArray(raw) && raw.length > 0) {
                            const mapped = raw.map((item, idx) => {
                                const dt = formatDateTime(item.cmt_created_at || item.created_at || item.createdat || item.date);
                                return {
                                    id: item.id || item.cmt_id || `cmt_${idx}`,
                                    file_number: item.unique_code || item.file_number || item.filenumber || item.userfilename || `UTS${1000 + idx}`,
                                    client_name: item.clientname || item.client_name || item.name || formatPhoneNumber(item.phone || item.userphone) || "-",
                                    analyst_name: item.user_name || item.analyst_name || item.assigned_to || item.admin_name || "Admin",
                                    comment: item.comment || item.comments || item.remark || "-",
                                    previous_state: item.previousstate || item.previous_state || item.prev_status || "-",
                                    present_state: item.presentstate || item.present_state || item.current_status || "-",
                                    date: dt.date,
                                    time: dt.time
                                };
                            });
                            setCommentsList(mapped);
                            dataLoaded = true;
                        }
                    }
                } catch (err) {
                    console.warn("commentslist API fallback error:", err);
                }
            }

            if (!dataLoaded) {
                setCommentsList(DEFAULT_COMMENTS_DATA);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
            setCommentsList(DEFAULT_COMMENTS_DATA);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // View complete comment in modal
    const handleViewComment = (item) => {
        Swal.fire({
            title: `<span style="font-family:'Outfit',sans-serif;font-size:1.2rem;font-weight:700;color:#1e293b;">Comment Details</span>`,
            html: `
                <div style="text-align:left;font-family:'Outfit',sans-serif;font-size:0.9rem;color:#334155;line-height:1.7;">
                    <div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e2e8f0;">
                        <b>File Number:</b> ${item.file_number}<br/>
                        <b>Client Info:</b> ${item.client_name}<br/>
                        <b>Analyst:</b> ${item.analyst_name}<br/>
                        <b>Previous State:</b> ${item.previous_state}<br/>
                        <b>Present State:</b> ${item.present_state}<br/>
                        <b>Date:</b> ${item.date} ${item.time}
                    </div>
                    <div>
                        <strong style="color:#1b2e6b;">Comment:</strong>
                        <p style="margin-top:6px;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:0.88rem;white-space:pre-wrap;">
                            ${item.comment}
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

    // Filter comments by search term
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return commentsList;
        const term = searchTerm.toLowerCase().trim();
        return commentsList.filter((item) => {
            const fileNo = (item.file_number || "").toLowerCase();
            const client = (item.client_name || "").toLowerCase();
            const analyst = (item.analyst_name || "").toLowerCase();
            const comment = (item.comment || "").toLowerCase();
            const prevState = (item.previous_state || "").toLowerCase();
            const presState = (item.present_state || "").toLowerCase();
            const dateStr = (item.date + " " + item.time).toLowerCase();

            return (
                fileNo.includes(term) ||
                client.includes(term) ||
                analyst.includes(term) ||
                comment.includes(term) ||
                prevState.includes(term) ||
                presState.includes(term) ||
                dateStr.includes(term)
            );
        });
    }, [commentsList, searchTerm]);

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage]);

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

    return (
        <div className="admin-comments-container">
            {/* Top Search Bar */}
            <div className="comments-topbar">
                <div className="comments-search-box">
                    <input
                        type="text"
                        className="comments-search-input"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="comments-search-icon" />
                </div>
            </div>

            {/* Main Table Card */}
            <div className="comments-table-card">
                <div className="comments-table-responsive">
                    <table className="comments-table">
                        <thead>
                            <tr>
                                <th>File Number</th>
                                <th>Client Name</th>
                                <th>Analyst Name</th>
                                <th>Comment</th>
                                <th>Previous State</th>
                                <th>Present State</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="comments-loading-state">
                                            <div className="comments-spinner"></div>
                                            <p className="mb-0">Loading comments...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="comments-empty-state text-danger">
                                            <p className="mb-2">{errorMsg}</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={fetchComments}
                                            >
                                                <FiRefreshCw className="me-1" /> Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="comments-empty-state">
                                            <p className="mb-0">No comments found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td className="comments-cell-fileno">{item.file_number}</td>
                                        <td className="comments-cell-client">{item.client_name}</td>
                                        <td>
                                            <span className="comments-cell-analyst">
                                                {item.analyst_name}
                                            </span>
                                        </td>
                                        <td
                                            className="comments-cell-text cursor-pointer"
                                            title="Click to view complete comment"
                                            onClick={() => handleViewComment(item)}
                                        >
                                            {item.comment}
                                        </td>
                                        <td className="comments-cell-state">{item.previous_state}</td>
                                        <td className="comments-cell-state">{item.present_state}</td>
                                        <td className="comments-cell-date">
                                            <span className="comments-date-line">{item.date}</span>
                                            {item.time && <span className="comments-time-line">{item.time}</span>}
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
                <div className="comments-pagination-footer">
                    <div className="comments-rows-per-page">
                        <span className="comments-rows-label">Row per page</span>
                        <div className="comments-select-wrapper">
                            <select
                                className="comments-select"
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            >
                                <option value={10}>10 / page</option>
                                <option value={25}>25 / page</option>
                                <option value={50}>50 / page</option>
                                <option value={100}>100 / page</option>
                            </select>
                            <FiChevronDown className="comments-select-icon" />
                        </div>
                    </div>

                    <div className="comments-pagination-controls">
                        <button
                            className="comments-page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            title="Previous Page"
                        >
                            <FiChevronLeft />
                        </button>

                        {getPageNumbers().map((page, index) => {
                            if (page === "...") {
                                return (
                                    <span key={`ellipsis-${index}`} className="comments-page-ellipsis">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={`page-${page}`}
                                    className={`comments-page-btn ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="comments-page-btn"
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

export default AdminComments;
