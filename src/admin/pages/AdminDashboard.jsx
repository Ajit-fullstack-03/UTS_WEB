import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
    FiSearch,
    FiFilter,
    FiDownload,
    FiTrash2,
    FiEye,
    FiUpload,
    FiUploadCloud,
    FiX,
    FiArrowLeft,
    FiMail,
    FiPhone,
    FiChevronLeft,
    FiChevronRight,
    FiFileText
} from "react-icons/fi";
import "./admin_dashboard.css";

const AdminDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeFilter = searchParams.get("filter") || "all";
    const selectedClientId = searchParams.get("clientId");

    // Mock Database
    const initialClients = [
        { id: "UTS0540", name: "SRINIVAS PALLIKARNA THIRUMALA", email: "ptsrinu2792@gmail.com", phone: "(510) 935-6510", status: "Interview Pending", statusId: "interview_pending", assigned: true, ssn: "XXX-XX-1234", dob: "1988-05-12", dependents: "No", address: "123 Fremont St, Fremont CA", country: "US", zip: "94538", city: "Fremont", referral: "Amit Kumar", registered: "2026-01-10", healthInsurance: "Yes", employer: "Tech Corp", timeZone: "PST", altPhone: "(510) 935-6519" },
        { id: "UTS8209", name: "USHAKAR REDDY", email: "reddy.ushakar05@gmail.com", phone: "(510) 935-6511", status: "Basic Info Pending", statusId: "basic_info_pending", assigned: false, ssn: "XXX-XX-5678", dob: "1992-09-24", dependents: "Yes (1)", address: "456 Mission Blvd, San Jose CA", country: "US", zip: "95112", city: "San Jose", referral: "Direct", registered: "2026-02-14", healthInsurance: "No", employer: "Biohealth", timeZone: "PST", altPhone: "" },
        { id: "UTS1203", name: "SOMYA MOHANTY", email: "somyamohanty@gmail.com", phone: "(630) 313-0054", status: "Cancel Filing", statusId: "cancel_filing", assigned: true, ssn: "XXX-XX-9012", dob: "1995-11-03", dependents: "No", address: "789 Aurora Rd, Naperville IL", country: "US", zip: "60540", city: "Naperville", referral: "Khatabook", registered: "2026-03-01", healthInsurance: "Yes", employer: "Khatabook", timeZone: "CST", altPhone: "(630) 313-0055" },
        { id: "UTS4402", name: "JOHN DOE", email: "johndoe@gmail.com", phone: "(408) 555-0192", status: "To Be Assigned", statusId: "to_be_assigned", assigned: false, ssn: "XXX-XX-3456", dob: "1985-04-18", dependents: "Yes (2)", address: "101 Broadway, New York NY", country: "US", zip: "10001", city: "New York", referral: "Direct", registered: "2026-01-20", healthInsurance: "Yes", employer: "Retail Inc", timeZone: "EST", altPhone: "" },
        { id: "UTS9911", name: "JANE SMITH", email: "janesmith@gmail.com", phone: "(206) 555-0143", status: "Docs Upload Pending", statusId: "docs_upload_pending", assigned: true, ssn: "XXX-XX-7890", dob: "1990-07-30", dependents: "No", address: "555 Pine St, Seattle WA", country: "US", zip: "98101", city: "Seattle", referral: "Google", registered: "2026-02-18", healthInsurance: "Yes", employer: "Software LLC", timeZone: "PST", altPhone: "" },
        { id: "UTS5623", name: "AMIT PATEL", email: "amit.patel@gmail.com", phone: "(732) 555-0188", status: "Preparation Pending", statusId: "prep_pending", assigned: true, ssn: "XXX-XX-4321", dob: "1987-12-05", dependents: "Yes (3)", address: "88 Oak Ave, Edison NJ", country: "US", zip: "08817", city: "Edison", referral: "Ramesh Patel", registered: "2026-02-28", healthInsurance: "No", employer: "Consulting Co", timeZone: "EST", altPhone: "(732) 555-0189" },
        { id: "UTS7741", name: "PRIYA SHARMA", email: "priya.sharma@gmail.com", phone: "(650) 555-0167", status: "Synopsys Pending", statusId: "synopsys_pending", assigned: false, ssn: "XXX-XX-6543", dob: "1994-03-15", dependents: "No", address: "202 Menlo Park CA", country: "US", zip: "94025", city: "Menlo Park", referral: "Direct", registered: "2026-03-05", healthInsurance: "Yes", employer: "Design Studio", timeZone: "PST", altPhone: "" },
        { id: "UTS3391", name: "RAMESH KUMAR", email: "ramesh.kumar@gmail.com", phone: "(312) 555-0121", status: "Payment Pending", statusId: "payment_pending", assigned: true, ssn: "XXX-XX-8765", dob: "1983-08-22", dependents: "Yes (1)", address: "303 Michigan Ave, Chicago IL", country: "US", zip: "60601", city: "Chicago", referral: "Amit Patel", registered: "2026-03-10", healthInsurance: "Yes", employer: "Finance Group", timeZone: "CST", altPhone: "" },
        { id: "UTS8842", name: "SNEHA REDDY", email: "sneha.reddy@gmail.com", phone: "(404) 555-0155", status: "Other Docs Pending", statusId: "other_docs_pending", assigned: false, ssn: "XXX-XX-2109", dob: "1991-02-28", dependents: "No", address: "404 Peachtree St, Atlanta GA", country: "US", zip: "30308", city: "Atlanta", referral: "Direct", registered: "2026-03-12", healthInsurance: "Yes", employer: "Marketing Corp", timeZone: "EST", altPhone: "" },
        { id: "UTS1102", name: "VIJAY SINGH", email: "vijay.singh@gmail.com", phone: "(214) 555-0177", status: "Pre-Synopsys Pending", statusId: "pre_synopsys_pending", assigned: true, ssn: "XXX-XX-1098", dob: "1989-06-14", dependents: "Yes (2)", address: "505 Dallas Pkwy, Dallas TX", country: "US", zip: "75201", city: "Dallas", referral: "Vijay Kumar", registered: "2026-03-15", healthInsurance: "No", employer: "Logistics Inc", timeZone: "CST", altPhone: "" }
    ];

    const [clients, setClients] = useState(initialClients);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage] = useState(6); // Figma page index is 6
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activeInnerTab, setActiveInnerTab] = useState("basic_info");
    const [selectedDocCategory, setSelectedDocCategory] = useState("All");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadCountry, setUploadCountry] = useState("IN");

    // Modal Dropzone state
    const [uploadedFiles, setUploadedFiles] = useState([
        { name: "image (11).png", type: "CHARITABLE DONATIONS", country: "INDIA", year: "2026", uploaded: "Jul 24, 2026" },
        { name: "UTS_W2_2025.pdf", type: "W2 Form", country: "US", year: "2025", uploaded: "Jul 20, 2026" },
        { name: "PAN_Card.png", type: "PAN Card", country: "INDIA", year: "2026", uploaded: "Jul 15, 2026" }
    ]);

    // Assigned File Number fields state
    const [assignedUser, setAssignedUser] = useState("");
    const [assignedFileNum, setAssignedFileNum] = useState("");
    const [editUser, setEditUser] = useState("");
    const [editFileNum, setEditFileNum] = useState("");
    const [emailUser, setEmailUser] = useState("");
    const [emailAddr, setEmailAddr] = useState("");
    const [phoneUser, setPhoneUser] = useState("");
    const [phoneNum, setPhoneNum] = useState("");

    // Form editing states for Client Details
    const [clientDetailFields, setClientDetailFields] = useState(null);

    // Initial setup of fields when a client is selected
    React.useEffect(() => {
        if (selectedClientId) {
            const found = clients.find(c => c.id === selectedClientId);
            if (found) {
                setClientDetailFields({ ...found });
            }
        } else {
            setClientDetailFields(null);
        }
    }, [selectedClientId, clients]);

    // Filtering logic
    const getFilteredClients = () => {
        let list = clients;

        // Apply sidebar filter
        if (activeFilter !== "all" && activeFilter !== "assigned_file_number") {
            list = list.filter(c => c.statusId === activeFilter);
        }

        // Apply text search
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            list = list.filter(
                c =>
                    c.id.toLowerCase().includes(term) ||
                    c.name.toLowerCase().includes(term) ||
                    c.email.toLowerCase().includes(term) ||
                    c.phone.includes(term) ||
                    c.status.toLowerCase().includes(term)
            );
        }

        return list;
    };

    const filteredClients = getFilteredClients();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClientClick = (clientId) => {
        setSearchParams({ filter: activeFilter, clientId });
    };

    const handleBackToDashboard = () => {
        setSearchParams({ filter: activeFilter });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setClientDetailFields(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateClientDetails = (e) => {
        e.preventDefault();
        setClients(prev =>
            prev.map(c => (c.id === clientDetailFields.id ? { ...clientDetailFields } : c))
        );
        Swal.fire({
            title: "Success",
            text: "Client details updated successfully!",
            icon: "success",
            confirmButtonColor: "#1b2e6b"
        });
    };

    // Card Updates Verification
    const triggerUpdateAlert = (title, text) => {
        Swal.fire({
            title: title,
            text: text,
            icon: "success",
            confirmButtonColor: "#1b2e6b"
        });
    };

    // File Action triggers
    const handleDeleteFile = (fileName) => {
        Swal.fire({
            title: "Delete document?",
            text: `Are you sure you want to delete ${fileName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Yes, delete",
            cancelButtonColor: "#cbd5e1"
        }).then((result) => {
            if (result.isConfirmed) {
                setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
                Swal.fire("Deleted!", "File has been deleted.", "success");
            }
        });
    };

    const handleDownloadFile = (fileName) => {
        triggerUpdateAlert("Downloading File", `File "${fileName}" download started successfully!`);
    };

    const handlePreviewFile = (fileName) => {
        Swal.fire({
            title: `Preview: ${fileName}`,
            html: `<div class="p-4 border rounded bg-light text-muted">File content preview simulation for <b>${fileName}</b></div>`,
            icon: "info",
            confirmButtonColor: "#1b2e6b"
        });
    };

    // Add upload document action
    const handleFileUploadSubmit = (e) => {
        e.preventDefault();
        const newFile = {
            name: `uploaded_tax_doc_${Date.now().toString().slice(-4)}.pdf`,
            type: uploadCountry === "US" ? "W2 Form" : "Aadhaar Card",
            country: uploadCountry === "US" ? "UNITED STATES" : "INDIA",
            year: "2026",
            uploaded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        };
        setUploadedFiles(prev => [newFile, ...prev]);
        setIsUploadModalOpen(false);
        Swal.fire({
            title: "Uploaded!",
            text: "Your tax document has been successfully uploaded.",
            icon: "success",
            confirmButtonColor: "#1b2e6b"
        });
    };

    // Views
    const renderTableRecordsView = () => {
        return (
            <div className="card shadow-sm border-0 rounded-3 p-4">
                {/* Search and Filters Banner */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <button className="btn btn-filter-adjust d-flex align-items-center gap-2">
                        <FiFilter />
                        <span>Filter By</span>
                    </button>
                    <div className="search-bar-wrapper position-relative">
                        <FiSearch className="search-bar-icon" />
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="table-responsive">
                    <table className="table admin-records-table align-middle">
                        <thead>
                            <tr>
                                <th>File Number</th>
                                <th>Client Name</th>
                                <th>Email ID</th>
                                <th>Phone</th>
                                <th>File Status</th>
                                <th>Assigned</th>
                                <th>Referral</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="fw-semibold text-dark">{client.id}</td>
                                        <td>
                                            <button
                                                onClick={() => handleClientClick(client.id)}
                                                className="btn btn-link client-name-link p-0 text-decoration-none text-start text-primary fw-medium"
                                            >
                                                {client.name}
                                            </button>
                                        </td>
                                        <td className="text-secondary">{client.email}</td>
                                        <td className="text-secondary">{client.phone}</td>
                                        <td>
                                            <span className={`badge status-pill-badge ${client.statusId}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`assigned-status-dot-label d-flex align-items-center gap-2 ${client.assigned ? "assigned" : "unassigned"}`}>
                                                <span className="dot"></span>
                                                <span className="text">{client.assigned ? "Assigned" : "Not Assigned"}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-link referral-link p-0 text-decoration-none text-primary"
                                                onClick={() => triggerUpdateAlert("Referral Details", `Showing referral status details for client ${client.name}.`)}
                                            >
                                                Referral To
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        No records found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
                    <div className="rows-per-page-selector d-flex align-items-center gap-2 text-secondary">
                        <select
                            className="form-select select-rows"
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        >
                            <option value={10}>10 / page</option>
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                        </select>
                    </div>

                    <nav className="pagination-navigation">
                        <ul className="pagination mb-0 gap-1 align-items-center">
                            <li className="page-item disabled">
                                <span className="page-link border-0"><FiChevronLeft /></span>
                            </li>
                            <li className="page-item"><button className="page-link border-0 rounded">1</button></li>
                            <li className="page-item disabled"><span className="page-link border-0">...</span></li>
                            <li className="page-item"><button className="page-link border-0 rounded">4</button></li>
                            <li className="page-item"><button className="page-link border-0 rounded">5</button></li>
                            <li className="page-item active"><button className="page-link border-0 rounded">{currentPage}</button></li>
                            <li className="page-item"><button className="page-link border-0 rounded">7</button></li>
                            <li className="page-item"><button className="page-link border-0 rounded">8</button></li>
                            <li className="page-item disabled"><span className="page-link border-0">...</span></li>
                            <li className="page-item"><button className="page-link border-0 rounded">50</button></li>
                            <li className="page-item">
                                <button className="page-link border-0 rounded"><FiChevronRight /></button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        );
    };

    const renderAssignedFileNumberView = () => {
        return (
            <div className="row g-4">
                {/* 1. Assigned File Number Card */}
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 rounded-3 p-4 card-config h-100 d-flex flex-column justify-content-between">
                        <div>
                            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Assigned File Number</h5>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Users:</label>
                                <select className="form-select config-select" value={assignedUser} onChange={e => setAssignedUser(e.target.value)}>
                                    <option value="">Select User</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Update File Number:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="File Number Ex: UTS0001"
                                    value={assignedFileNum}
                                    onChange={e => setAssignedFileNum(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-config-update w-100 py-2 mt-2 fw-semibold"
                            onClick={() => {
                                if (!assignedUser || !assignedFileNum) {
                                    Swal.fire("Error", "Please select a user and enter file number.", "error");
                                    return;
                                }
                                triggerUpdateAlert("File Number Assigned", `Assigned file number ${assignedFileNum} to user ${assignedUser}.`);
                            }}
                        >
                            Update
                        </button>
                    </div>
                </div>

                {/* 2. Edit File Number Card */}
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 rounded-3 p-4 card-config h-100 d-flex flex-column justify-content-between">
                        <div>
                            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Edit File Number</h5>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Users:</label>
                                <select className="form-select config-select" value={editUser} onChange={e => setEditUser(e.target.value)}>
                                    <option value="">Select User</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Update File Number:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="File Number Ex: UTS0001"
                                    value={editFileNum}
                                    onChange={e => setEditFileNum(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-config-update w-100 py-2 mt-2 fw-semibold"
                            onClick={() => {
                                if (!editUser || !editFileNum) {
                                    Swal.fire("Error", "Please select a user and enter updated file number.", "error");
                                    return;
                                }
                                triggerUpdateAlert("File Number Edited", `Updated file number to ${editFileNum} for user ${editUser}.`);
                            }}
                        >
                            Update
                        </button>
                    </div>
                </div>

                {/* 3. Set Email Address Card */}
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 rounded-3 p-4 card-config h-100 d-flex flex-column justify-content-between">
                        <div>
                            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Set Email Address</h5>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Users:</label>
                                <select className="form-select config-select" value={emailUser} onChange={e => setEmailUser(e.target.value)}>
                                    <option value="">Select User</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Update Email Address:</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light text-muted border-end-0"><FiMail /></span>
                                    <input
                                        type="email"
                                        className="form-control border-start-0"
                                        placeholder="example@gmail.com"
                                        value={emailAddr}
                                        onChange={e => setEmailAddr(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            className="btn btn-config-update w-100 py-2 mt-2 fw-semibold"
                            onClick={() => {
                                if (!emailUser || !emailAddr) {
                                    Swal.fire("Error", "Please select a user and enter email address.", "error");
                                    return;
                                }
                                triggerUpdateAlert("Email Updated", `Set email to ${emailAddr} for user ${emailUser}.`);
                            }}
                        >
                            Update
                        </button>
                    </div>
                </div>

                {/* 4. Set Mobile Number Card */}
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 rounded-3 p-4 card-config h-100 d-flex flex-column justify-content-between">
                        <div>
                            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">Set Mobile Number</h5>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Users:</label>
                                <select className="form-select config-select" value={phoneUser} onChange={e => setPhoneUser(e.target.value)}>
                                    <option value="">Select User</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Update Mobile Number:</label>
                                <div className="row g-2">
                                    <div className="col-4">
                                        <select className="form-select">
                                            <option value="+1">+1 (US)</option>
                                            <option value="+91">+91 (IN)</option>
                                        </select>
                                    </div>
                                    <div className="col-8">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-muted border-end-0"><FiPhone /></span>
                                            <input
                                                type="text"
                                                className="form-control border-start-0"
                                                placeholder="(912)-458-3320"
                                                value={phoneNum}
                                                onChange={e => setPhoneNum(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            className="btn btn-config-update w-100 py-2 mt-2 fw-semibold"
                            onClick={() => {
                                if (!phoneUser || !phoneNum) {
                                    Swal.fire("Error", "Please select a user and enter phone number.", "error");
                                    return;
                                }
                                triggerUpdateAlert("Mobile Updated", `Updated phone number to ${phoneNum} for user ${phoneUser}.`);
                            }}
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderClientDetailsView = () => {
        if (!clientDetailFields) return null;

        const subTabs = [
            { id: "basic_info", label: "Basic Info" },
            { id: "other_info", label: "Other Info" },
            { id: "download_docs", label: "Download Documents" },
            { id: "upload_docs", label: "Upload Documents" },
            { id: "file_status", label: "File Status" },
            { id: "payment", label: "Payment" },
            { id: "referral", label: "Referral" }
        ];

        return (
            <div className="client-details-workspace d-flex flex-column gap-4">
                {/* Back button and status banner */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <button onClick={handleBackToDashboard} className="btn btn-back-dashboard d-flex align-items-center gap-2">
                        <FiArrowLeft />
                        <span>Back to Dashboard</span>
                    </button>
                    <div className="status-indicator-badge px-3 py-2 rounded">
                        Status: <span className="text-danger fw-bold">{clientDetailFields.status}</span>
                    </div>
                </div>

                {/* Main details container card */}
                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                    {/* Horizontal Inner Tab Bar */}
                    <div className="border-bottom bg-light px-4 py-2">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <ul className="nav nav-pills inner-tabs-nav gap-2">
                                {subTabs.map(tab => (
                                    <li key={tab.id} className="nav-item">
                                        <button
                                            onClick={() => setActiveInnerTab(tab.id)}
                                            className={`nav-link rounded-pill px-3 py-1.5 fw-semibold ${
                                                activeInnerTab === tab.id ? "active" : ""
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            
                            {/* Action button on top-right of tab area */}
                            {(activeInnerTab === "basic_info" || activeInnerTab === "other_info") && (
                                <button className="btn btn-action-top-right d-flex align-items-center gap-2" onClick={() => triggerUpdateAlert("Exporting Data", "Initiated data sheet export.")}>
                                    <FiDownload />
                                    <span>Export</span>
                                </button>
                            )}
                            {activeInnerTab === "download_docs" && (
                                <button className="btn btn-action-top-right d-flex align-items-center gap-2" onClick={() => triggerUpdateAlert("Downloading All", "Initiated bulk download for all documents.")}>
                                    <FiDownload />
                                    <span>Download</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Body Contents */}
                    <div className="p-4 bg-white">
                        {activeInnerTab === "basic_info" && (
                            <form onSubmit={handleUpdateClientDetails}>
                                <div className="row g-4">
                                    {/* Left Column */}
                                    <div className="col-12 col-md-6 d-flex flex-column gap-3">
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">First Name</label>
                                            <input type="text" className="form-control" name="name" value={clientDetailFields.name.split(" ")[0]} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">SSN</label>
                                            <input type="text" className="form-control" name="ssn" value={clientDetailFields.ssn} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Date Of Birth</label>
                                            <input type="date" className="form-control" name="dob" value={clientDetailFields.dob} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Dependents</label>
                                            <input type="text" className="form-control" name="dependents" value={clientDetailFields.dependents} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Mobile</label>
                                            <input type="text" className="form-control" name="phone" value={clientDetailFields.phone} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Address</label>
                                            <input type="text" className="form-control" name="address" value={clientDetailFields.address} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Country</label>
                                            <input type="text" className="form-control" name="country" value={clientDetailFields.country} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Health Insurance</label>
                                            <input type="text" className="form-control" name="healthInsurance" value={clientDetailFields.healthInsurance} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Current Employer</label>
                                            <input type="text" className="form-control" name="employer" value={clientDetailFields.employer} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Time Zone</label>
                                            <input type="text" className="form-control" name="timeZone" value={clientDetailFields.timeZone} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Registered On</label>
                                            <input type="text" className="form-control" name="registered" value={clientDetailFields.registered} readOnly />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="col-12 col-md-6 d-flex flex-column gap-3">
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Last Name</label>
                                            <input type="text" className="form-control" value={clientDetailFields.name.split(" ").slice(1).join(" ")} readOnly />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Occupation</label>
                                            <input type="text" className="form-control" placeholder="Occupation details" />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Filing Status</label>
                                            <input type="text" className="form-control" placeholder="Single / Married Filing" />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Email</label>
                                            <input type="email" className="form-control" name="email" value={clientDetailFields.email} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Alternate Number</label>
                                            <input type="text" className="form-control" name="altPhone" value={clientDetailFields.altPhone} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">City</label>
                                            <input type="text" className="form-control" name="city" value={clientDetailFields.city} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Status</label>
                                            <input type="text" className="form-control" value={clientDetailFields.status} readOnly />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">ZIP</label>
                                            <input type="text" className="form-control" name="zip" value={clientDetailFields.zip} onChange={handleFormChange} />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Client Location</label>
                                            <input type="text" className="form-control" placeholder="GPS location details" />
                                        </div>
                                        <div>
                                            <label className="form-label fw-semibold text-secondary small">Referral Name</label>
                                            <input type="text" className="form-control" name="referral" value={clientDetailFields.referral} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 border-top pt-3 d-flex justify-content-end">
                                    <button type="submit" className="btn btn-save-details px-4 py-2 fw-semibold">Save Changes</button>
                                </div>
                            </form>
                        )}

                        {activeInnerTab === "other_info" && (
                            <div className="py-5 text-center text-muted">
                                <div className="fs-5 fw-bold mb-2">No Data Available</div>
                                <p className="small">Additional custom information records are currently empty.</p>
                            </div>
                        )}

                        {activeInnerTab === "download_docs" && (
                            <div className="download-documents-workspace">
                                {/* Categories Filter Sub Menu */}
                                <div className="d-flex align-items-center gap-2 overflow-auto py-2 border-bottom mb-4">
                                    {["All", "W2", "1099-NEC/B/G/DIV/INT/MISC", "5498/HSA 1099R/IRA", "1098/1098-T", "Other Docs"].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedDocCategory(cat)}
                                            className={`btn btn-sm btn-category-pill rounded-pill text-nowrap px-3 ${
                                                selectedDocCategory === cat ? "active" : ""
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Documents List */}
                                <div className="table-responsive">
                                    <table className="table align-middle doc-files-table">
                                        <thead>
                                            <tr>
                                                <th>NAME</th>
                                                <th>TYPE</th>
                                                <th>COUNTRY</th>
                                                <th>YEAR</th>
                                                <th>UPLOADED</th>
                                                <th className="text-center">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uploadedFiles.map((file, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-semibold text-dark">
                                                        <span className="d-flex align-items-center gap-2">
                                                            <FiFileText className="text-primary" />
                                                            {file.name}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted">{file.type}</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark px-2.5 py-1.5">{file.country}</span>
                                                    </td>
                                                    <td className="text-secondary">{file.year}</td>
                                                    <td className="text-secondary">{file.uploaded}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                                            <button className="btn btn-icon-action" title="Delete" onClick={() => handleDeleteFile(file.name)}>
                                                                <FiTrash2 />
                                                            </button>
                                                            <button className="btn btn-icon-action" title="Download" onClick={() => handleDownloadFile(file.name)}>
                                                                <FiDownload />
                                                            </button>
                                                            <button className="btn btn-icon-action" title="Preview" onClick={() => handlePreviewFile(file.name)}>
                                                                <FiEye />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeInnerTab === "upload_docs" && (
                            <div className="upload-documents-wrapper py-5 text-center d-flex flex-column align-items-center">
                                <div className="upload-empty-illustration mb-3 p-4 rounded-circle bg-light">
                                    <FiUpload size={48} className="text-primary" />
                                </div>
                                <h5 className="fw-bold text-dark">Upload your Tax Documents</h5>
                                <p className="text-muted small mb-4">No documents found. Add forms and supporting files for this client.</p>
                                <button className="btn btn-upload-trigger px-4 py-2 fw-semibold d-flex align-items-center gap-2" onClick={() => setIsUploadModalOpen(true)}>
                                    <FiUpload />
                                    <span>Upload Documents</span>
                                </button>
                            </div>
                        )}

                        {activeInnerTab === "file_status" && (
                            <div className="file-status-timeline py-3 px-4">
                                <div className="card shadow-sm border-light p-4 rounded bg-light">
                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Update File Status</h6>
                                    <div className="row g-3 align-items-center">
                                        <div className="col-12 col-md-8">
                                            <select className="form-select" defaultValue={clientDetailFields.status}>
                                                <option>Basic Info Pending</option>
                                                <option>Interview Pending</option>
                                                <option>Docs Upload Pending</option>
                                                <option>Preparation Pending</option>
                                                <option>Synopsys Pending</option>
                                                <option>Payment Pending</option>
                                                <option>Cancel Filing</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <button className="btn btn-primary w-100 fw-semibold" onClick={() => triggerUpdateAlert("Status Changed", "File status has been updated in database.")}>
                                                Apply Status
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(activeInnerTab === "payment" || activeInnerTab === "referral") && (
                            <div className="py-5 text-center text-muted">
                                <div className="fs-6 fw-bold mb-2">Details Panel Simulation</div>
                                <p className="small">Information parameters for {activeInnerTab.toUpperCase()} records are configured in database sync.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Modal Overlay */}
                {isUploadModalOpen && (
                    <div className="custom-modal-overlay d-flex align-items-center justify-content-center">
                        <div className="card custom-modal-card shadow border-0 p-4 rounded-3 position-relative">
                            {/* Close button */}
                            <button className="btn modal-close-btn p-1 border-0 bg-transparent text-muted position-absolute" onClick={() => setIsUploadModalOpen(false)}>
                                <FiX size={20} />
                            </button>

                            <h5 className="fw-bold text-dark mb-1">Upload documents</h5>
                            <p className="text-secondary small mb-4">Add tax forms and supporting files for your file.</p>

                            <form onSubmit={handleFileUploadSubmit} className="d-flex flex-column gap-3">
                                {/* Country selection pills */}
                                <div>
                                    <label className="form-label fw-bold text-dark small mb-2 d-block">COUNTRY</label>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className={`btn modal-country-pill rounded-pill px-3 py-1.5 fw-semibold ${
                                                uploadCountry === "US" ? "active" : ""
                                            }`}
                                            onClick={() => setUploadCountry("US")}
                                        >
                                            US United States
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn modal-country-pill rounded-pill px-3 py-1.5 fw-semibold ${
                                                uploadCountry === "IN" ? "active" : ""
                                            }`}
                                            onClick={() => setUploadCountry("IN")}
                                        >
                                            IN India
                                        </button>
                                    </div>
                                </div>

                                {/* Drag zone box */}
                                <div className="dropzone-box border-dashed border rounded p-4 text-center d-flex flex-column align-items-center justify-content-center gap-2">
                                    <FiUploadCloud size={36} className="text-secondary" />
                                    <div>
                                        <span className="text-primary fw-semibold cursor-pointer">Click to upload</span>
                                        <span className="text-secondary"> or drag and drop</span>
                                    </div>
                                    <span className="text-muted small">PDF, PNG, JPG up to 10MB</span>
                                </div>

                                {/* Submit button */}
                                <button type="submit" className="btn btn-modal-upload w-100 py-2.5 mt-2 fw-semibold d-flex align-items-center justify-content-center gap-2">
                                    <FiUpload />
                                    <span>Upload documents</span>
                                </button>

                                {/* Bottom limit warning */}
                                <p className="text-muted small text-start mt-3 mb-0" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                                    <b>Note:</b> If the Upload size document is more than 06MB, Kindly mail the documents to <a href="mailto:Hello@umpiretaxsolutions.com" className="text-decoration-none">Hello@umpiretaxsolutions.com</a>
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderMainBody = () => {
        if (selectedClientId) {
            return renderClientDetailsView();
        }

        switch (activeFilter) {
            case "assigned_file_number":
                return renderAssignedFileNumberView();
            default:
                return renderTableRecordsView();
        }
    };

    const getViewTitle = () => {
        if (selectedClientId) {
            return `Client details: ${selectedClientId}`;
        }
        
        switch (activeFilter) {
            case "assigned_file_number":
                return "Assigned File Number Settings";
            case "to_be_assigned":
                return "To Be Assigned Records";
            case "basic_info_pending":
                return "Basic Info Pending Records";
            case "interview_pending":
                return "Interview Pending Records";
            case "docs_upload_pending":
                return "Documents Upload Pending Records";
            case "other_docs_pending":
                return "Other Docs Pending Records";
            case "prep_pending":
                return "Preparation Pending Records";
            case "pre_synopsys_pending":
                return "Pre-Synopsys Pending Records";
            case "synopsys_pending":
                return "Synopsys Pending Records";
            case "payment_pending":
                return "Payment Pending Records";
            case "review_upload_pending":
                return "Review Upload Pending Records";
            default:
                return "All Client Records";
        }
    };

    return (
        <div className="admin-dashboard-container py-3">
            {/* View Page Title Banner */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark dashboard-main-title">{getViewTitle()}</h4>
            </div>

            {/* Dynamic Content */}
            {renderMainBody()}
        </div>
    );
};

export default AdminDashboard;
