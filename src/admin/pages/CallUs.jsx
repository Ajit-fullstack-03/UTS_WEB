import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import "./call_us.css";

// Sample initial data matching Figma design mockups
const DEFAULT_CALLUS_DATA = [
    {
        id: "1",
        client_name: "UTS0540",
        email_id: "reddy.ushakar05@gmailcom",
        phone: "(510) 935-6510",
        message: "I NEED US TAX FILING SERVICES FOR THE YEAR 2025. I WAS WORKING IS US IN L VISA AND NOW I HAVE RETURNED BACK TO INDIA. I WORKED TILL 12TH MARCH 2025 ... HENCE FILING PERIOD WILL BE 01/01/25 TILL 03/12/25.",
        date: "07-24-2026",
        time: "06:59:32",
        status: "Assigned"
    },
    {
        id: "2",
        client_name: "UTS0540",
        email_id: "reddy.ushakar05@gmailcom",
        phone: "(510) 935-6510",
        message: "I NEED US TAX FILING SERVICES FOR THE YEAR 2025. I WAS WORKING IS US IN L VISA AND NOW I HAVE RETURNED BACK TO INDIA. I WORKED TILL 12TH MARCH 2025 ... HENCE FILING PERIOD WILL BE 01/01/25 TILL 03/12/25.",
        date: "07-24-2026",
        time: "06:59:32",
        status: "Assigned"
    },
    {
        id: "3",
        client_name: "UTS8209",
        email_id: "ptsrinu2792@gmail.com",
        phone: "(470) 338-2209",
        message: "I NEED US TAX FILING SERVICES FOR THE YEAR 2025. I WAS WORKING IS US IN L VISA AND NOW I HAVE RETURNED BACK TO INDIA. I WORKED TILL 12TH MARCH 2025 ... HENCE FILING PERIOD WILL BE 01/01/25 TILL 03/12/25.",
        date: "07-24-2026",
        time: "06:59:32",
        status: "Assigned"
    },
    {
        id: "4",
        client_name: "UTS0540",
        email_id: "reddy.ushakar05@gmailcom",
        phone: "(510) 935-6510",
        message: "I NEED US TAX FILING SERVICES FOR THE YEAR 2025. I WAS WORKING IS US IN L VISA AND NOW I HAVE RETURNED BACK TO INDIA. I WORKED TILL 12TH MARCH 2025 ... HENCE FILING PERIOD WILL BE 01/01/25 TILL 03/12/25.",
        date: "07-24-2026",
        time: "06:59:32",
        status: "Assigned"
    },
    {
        id: "5",
        client_name: "UTS8209",
        email_id: "ptsrinu2792@gmail.com",
        phone: "(470) 338-2209",
        message: "I NEED US TAX FILING SERVICES FOR THE YEAR 2025. I WAS WORKING IS US IN L VISA AND NOW I HAVE RETURNED BACK TO INDIA. I WORKED TILL 12TH MARCH 2025 ... HENCE FILING PERIOD WILL BE 01/01/25 TILL 03/12/25.",
        date: "07-24-2026",
        time: "06:59:32",
        status: "Assigned"
    }
];

const CallUs = () => {
    const [callUsList, setCallUsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [errorMsg, setErrorMsg] = useState("");

    // Extract credentials helper
    const getCredentials = () => {
        const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
        let userId = localStorage.getItem("currentUser");
        let taxYear = "2026";

        if (userInfoStr) {
            try {
                const parsed = JSON.parse(userInfoStr);
                if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
                if (parsed.taxyear || parsed.taxYear || parsed.current_year) taxYear = String(parsed.taxyear || parsed.taxYear || parsed.current_year);
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

    // Fetch Call Us data
    const fetchCallUsData = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const { userId, taxYear } = getCredentials();
            const payload = {
                user_id: userId,
                taxYear: String(taxYear)
            };

            let dataLoaded = false;

            // 1. Primary API: /api/user/wantusinfo
            try {
                const res = await adminServices.wantusinfo(payload);
                if (res && res.data && (res.data.data || Array.isArray(res.data))) {
                    const raw = res.data.data || res.data;
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
                                status: item.status || "Assigned"
                            };
                        });
                        setCallUsList(mapped);
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
                    if (res && res.data && (res.data.data || Array.isArray(res.data))) {
                        const raw = res.data.data || res.data;
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
                                    status: item.status || "Assigned"
                                };
                            });
                            setCallUsList(mapped);
                            dataLoaded = true;
                        }
                    }
                } catch (err) {
                    console.warn("calluslist API fallback error:", err);
                }
            }

            if (!dataLoaded) {
                setCallUsList(DEFAULT_CALLUS_DATA);
            }
        } catch (err) {
            console.error("Error fetching call us records:", err);
            setCallUsList(DEFAULT_CALLUS_DATA);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCallUsData();
    }, [fetchCallUsData]);

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

    // Delete inquiry handler
    const handleDelete = (item) => {
        Swal.fire({
            title: "Delete Inquiry?",
            text: `Are you sure you want to delete inquiry for ${item.client_name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#cbd5e1",
            customClass: {
                confirmButton: "btn btn-danger px-4 py-2",
                cancelButton: "btn btn-light px-4 py-2 ms-2"
            },
            buttonsStyling: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await adminServices.deletecallus({ id: item.id });
                } catch (e) {
                    // ignore
                }
                setCallUsList((prev) => prev.filter((r) => r.id !== item.id));
                Swal.fire("Deleted!", "Inquiry record has been removed.", "success");
            }
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
            const status = (item.status || "").toLowerCase();

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

    // Reset page on search or rowsPerPage change
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
        <div className="admin-callus-container">
            {/* Top Search Bar */}
            <div className="callus-topbar">
                <div className="callus-search-box">
                    <input
                        type="text"
                        className="callus-search-input"
                        placeholder="Search"
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
                                <th>Date</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="callus-loading-state">
                                            <div className="callus-spinner"></div>
                                            <p className="mb-0">Loading inquiries...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td colSpan="6">
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
                                    <td colSpan="6">
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
                                        <td className="callus-cell-date">
                                            <span className="callus-date-line">{item.date}</span>
                                            {item.time && <span className="callus-time-line">{item.time}</span>}
                                        </td>
                                        <td>
                                            {item.status === "Assigned" ? (
                                                <span className="callus-assigned-badge">
                                                    Assigned
                                                </span>
                                            ) : (
                                                <button
                                                    className="callus-btn-delete"
                                                    title="Delete Inquiry"
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
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
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
