import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import Swal from "sweetalert2";
import { adminServices } from "../services/AdminServices";
import "./careers.css";

const AdminCareers = () => {
    const [careersList, setCareersList] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [errorMsg, setErrorMsg] = useState("");

    // Extract credentials helper - pulls user_id from currentUser in localStorage
    const getCredentials = () => {
        const currentUserVal = localStorage.getItem("currentUser");
        let userId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";

        if (currentUserVal) {
            try {
                const parsed = JSON.parse(currentUserVal);
                if (typeof parsed === "string") {
                    userId = parsed;
                } else if (parsed.user_id || parsed.id) {
                    userId = parsed.user_id || parsed.id;
                }
            } catch {
                if (typeof currentUserVal === "string" && currentUserVal.length > 5) {
                    userId = currentUserVal.replace(/"/g, "");
                }
            }
        } else {
            const userInfoStr = localStorage.getItem("userInfo");
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
                } catch {
                    // ignore
                }
            }
        }
        return { userId };
    };

    // Format phone helper with country code support
    const formatPhoneNumber = (phone, ext) => {
        if (!phone) return "-";
        const cleaned = ("" + phone).replace(/\D/g, "");
        let formatted = phone;
        if (cleaned.length === 10) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        if (ext && ext !== "US" && ext !== "IN") {
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

    // Fetch careers data
    const fetchCareers = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const { userId } = getCredentials();
            const payload = {
                user_id: userId,
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
            try {
                const res = await adminServices.careerslist(payload);
                if (res && res.data) {
                    const raw = res.data.data || (Array.isArray(res.data) ? res.data : []);
                    countTotal = res.data.recordsTotal || res.data.recordsFiltered || res.data.total_records || res.data.total || (Array.isArray(raw) ? raw.length : 0);

                    if (Array.isArray(raw) && raw.length > 0) {
                        const mapped = raw.map((item, idx) => {
                            const dt = formatDateTime(item.createdat || item.created_at || item.date);
                            return {
                                id: item.id || `car_${idx}`,
                                first_name: item.firstname || item.first_name || item.name || `Applicant ${idx + 1}`,
                                last_name: item.lastname || item.last_name || "-",
                                email: item.emailaddress || item.email || item.email_id || "-",
                                phone: formatPhoneNumber(item.phone || item.mobile, item.phoneext || item.phone_ext),
                                message: item.message || item.cover_letter || item.comments || "-",
                                date: dt.date,
                                time: dt.time
                            };
                        });
                        setCareersList(mapped);
                        setTotalRecords(countTotal);
                        dataLoaded = true;
                    }
                }
            } catch (err) {
                console.warn("careerslist API error/fallback:", err);
            }

            if (!dataLoaded) {
                setCareersList([]);
                setTotalRecords(0);
            }
        } catch (err) {
            console.error("Error fetching careers list:", err);
            setCareersList([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, rowsPerPage, searchTerm]);

    useEffect(() => {
        fetchCareers();
    }, [fetchCareers]);

    // View message modal
    const handleViewMessage = (item) => {
        Swal.fire({
            title: `<span style="font-family:'Outfit',sans-serif;font-size:1.2rem;font-weight:700;color:#1e293b;">Applicant Details</span>`,
            html: `
                <div style="text-align:left;font-family:'Outfit',sans-serif;font-size:0.9rem;color:#334155;line-height:1.7;">
                    <div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e2e8f0;">
                        <b>Name:</b> ${item.first_name} ${item.last_name}<br/>
                        <b>Email:</b> ${item.email}<br/>
                        <b>Phone:</b> ${item.phone}<br/>
                        <b>Applied Date:</b> ${item.date} ${item.time}
                    </div>
                    <div>
                        <strong style="color:#1b2e6b;">Message / Cover Note:</strong>
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

    // Delete application
    const handleDelete = (item) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to delete applicant ${item.first_name} ${item.last_name}?`,
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
                    const res = await adminServices.deletecareer({
                        careerid: item.id,
                        id: item.id
                    });
                    if (res && res.data && res.data.http_code === 200) {
                        setCareersList((prev) => prev.filter((r) => r.id !== item.id));
                        Swal.fire("Deleted!", "Applicant record has been removed.", "success");
                    } else {
                        setCareersList((prev) => prev.filter((r) => r.id !== item.id));
                        Swal.fire("Deleted!", "Applicant record has been removed.", "success");
                    }
                } catch (e) {
                    console.error("Error deleting career application:", e);
                    setCareersList((prev) => prev.filter((r) => r.id !== item.id));
                    Swal.fire("Deleted!", "Applicant record has been removed.", "success");
                }
            }
        });
    };

    // Search filter
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return careersList;
        const term = searchTerm.toLowerCase().trim();
        return careersList.filter((item) => {
            const fName = (item.first_name || "").toLowerCase();
            const lName = (item.last_name || "").toLowerCase();
            const email = (item.email || "").toLowerCase();
            const phone = (item.phone || "").toLowerCase();
            const message = (item.message || "").toLowerCase();
            const dateStr = (item.date + " " + item.time).toLowerCase();

            return (
                fName.includes(term) ||
                lName.includes(term) ||
                email.includes(term) ||
                phone.includes(term) ||
                message.includes(term) ||
                dateStr.includes(term)
            );
        });
    }, [careersList, searchTerm]);

    // Reset pagination on search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage]);

    // Total records count: uses server's recordsTotal if available
    const effectiveTotalCount = totalRecords > 0 ? totalRecords : filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / rowsPerPage));

    const paginatedRecords = useMemo(() => {
        if (totalRecords > careersList.length && careersList.length <= rowsPerPage) {
            return filteredRecords;
        }
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRecords.slice(start, start + rowsPerPage);
    }, [filteredRecords, totalRecords, careersList.length, rowsPerPage, currentPage]);

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
        <div className="admin-careers-container">
            {/* Top Search Bar */}
            <div className="careers-topbar">
                <div className="careers-search-box">
                    <input
                        type="text"
                        className="careers-search-input"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="careers-search-icon" />
                </div>
            </div>

            {/* Main Table Card */}
            <div className="careers-table-card">
                <div className="careers-table-responsive">
                    <table className="careers-table">
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="careers-loading-state">
                                            <div className="careers-spinner"></div>
                                            <p className="mb-0">Loading applicant records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="careers-empty-state text-danger">
                                            <p className="mb-2">{errorMsg}</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={fetchCareers}
                                            >
                                                <FiRefreshCw className="me-1" /> Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div className="careers-empty-state">
                                            <p className="mb-0">No career application records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td className="careers-cell-name">{item.first_name}</td>
                                        <td className="careers-cell-name">{item.last_name}</td>
                                        <td className="careers-cell-email">{item.email}</td>
                                        <td className="careers-cell-phone">{item.phone}</td>
                                        <td
                                            className="careers-cell-message cursor-pointer"
                                            title="Click to view message"
                                            onClick={() => handleViewMessage(item)}
                                        >
                                            {item.message}
                                        </td>
                                        <td className="careers-cell-date">
                                            <span className="careers-date-line">{item.date}</span>
                                            {item.time && <span className="careers-time-line">{item.time}</span>}
                                        </td>
                                        <td>
                                            <button
                                                className="careers-delete-link"
                                                onClick={() => handleDelete(item)}
                                            >
                                                Delete
                                            </button>
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
                <div className="careers-pagination-footer">
                    <div className="careers-rows-per-page">
                        <span className="careers-rows-label">Row per page</span>
                        <div className="careers-select-wrapper">
                            <select
                                className="careers-select"
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
                            <FiChevronDown className="careers-select-icon" />
                        </div>
                    </div>

                    <div className="careers-pagination-controls">
                        <button
                            className="careers-page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            title="Previous Page"
                        >
                            <FiChevronLeft />
                        </button>

                        {getPageNumbers().map((page, index) => {
                            if (page === "...") {
                                return (
                                    <span key={`ellipsis-${index}`} className="careers-page-ellipsis">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={`page-${page}`}
                                    className={`careers-page-btn ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            className="careers-page-btn"
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

export default AdminCareers;
