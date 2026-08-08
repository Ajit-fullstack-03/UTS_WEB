import React, { useState, useEffect, useRef } from "react";
import {
    FiUploadCloud,
    FiTrash2,
    FiEdit3,
    FiEye,
    FiAlertTriangle,
    FiX,
    FiChevronDown,
    FiFileText,
    FiPlus,
    FiCheckCircle
} from "react-icons/fi";
import noDataImg from "../../assets/image/no_data.png";
import "./documents.css";

const Documents = () => {
    // Categories tabs definition
    const categories = [
        { id: "all", label: "All" },
        { id: "w2", label: "W2" },
        { id: "1099", label: "1099-NEC/B/G/DIV/INT/MISC" },
        { id: "5498", label: "5498/HSA 1099R/IRA" },
        { id: "1098", label: "1098/1098-T" },
        { id: "other", label: "Other Docs" }
    ];

    const [activeTab, setActiveTab] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("IN"); // 'US' or 'IN'
    const [pendingFiles, setPendingFiles] = useState([]);
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const fileInputRef = useRef(null);

    // Load initial documents from localStorage or set defaults
    useEffect(() => {
        const storedDocs = localStorage.getItem("uploaded_tax_documents");
        if (storedDocs) {
            setUploadedDocs(JSON.parse(storedDocs));
        } else {
            // Add some mock documents to match state D (Document List View) initially
            const mockDocs = [
                {
                    id: 1,
                    name: "image (11).png",
                    type: "Other documents",
                    categoryKey: "other",
                    country: "INDIA",
                    year: "2026",
                    uploadedDate: "Jul 24, 2026"
                },
                {
                    id: 2,
                    name: "Form 16 - Company.pdf",
                    type: "W2",
                    categoryKey: "w2",
                    country: "INDIA",
                    year: "2026",
                    uploadedDate: "Jul 24, 2026"
                },
                {
                    id: 3,
                    name: "Annual Information Statement.pdf",
                    type: "1099-NEC/B/G/DIV/INT/MISC",
                    categoryKey: "1099",
                    country: "INDIA",
                    year: "2026",
                    uploadedDate: "Jul 24, 2026"
                }
            ];
            setUploadedDocs(mockDocs);
            localStorage.setItem("uploaded_tax_documents", JSON.stringify(mockDocs));
        }
    }, []);

    // Save to localStorage whenever uploadedDocs changes
    const saveDocs = (docs) => {
        setUploadedDocs(docs);
        localStorage.setItem("uploaded_tax_documents", JSON.stringify(docs));
    };

    // Filter documents based on active tab
    const filteredDocs = uploadedDocs.filter(doc => {
        if (activeTab === "all") return true;
        
        // Map activeTab to category names
        if (activeTab === "w2") return doc.type === "W2";
        if (activeTab === "1099") return doc.type === "1099-NEC/B/G/DIV/INT/MISC";
        if (activeTab === "5498") return doc.type === "5498/HSA 1099R/IRA";
        if (activeTab === "1098") return doc.type === "1098/1098-T";
        if (activeTab === "other") return doc.type === "Other documents";
        return true;
    });

    // Handle drag and drop zone click
    const handleDragZoneClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle file selection in modal
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newPending = files.map((file, index) => {
            // format size to human-readable
            const sizeInKb = Math.round(file.size / 1024);
            const sizeStr = sizeInKb > 1000 
                ? `${(sizeInKb / 1024).toFixed(1)} MB` 
                : `${sizeInKb} KB`;

            return {
                id: Date.now() + index,
                name: file.name,
                size: sizeStr,
                rawFile: file,
                selectedType: activeTab === "all" ? "Other documents" : getCategoryLabel(activeTab),
                selectedYear: "2026"
            };
        });

        setPendingFiles(prev => [...prev, ...newPending]);
    };

    const getCategoryLabel = (tabKey) => {
        const cat = categories.find(c => c.id === tabKey);
        return cat && cat.id !== "all" ? cat.label : "Other documents";
    };

    // Remove pending file from upload modal list
    const handleRemovePending = (id) => {
        setPendingFiles(prev => prev.filter(f => f.id !== id));
    };

    // Change category for a pending file
    const handlePendingCategoryChange = (id, type) => {
        setPendingFiles(prev => prev.map(f => f.id === id ? { ...f, selectedType: type } : f));
    };

    // Change year for a pending file
    const handlePendingYearChange = (id, year) => {
        setPendingFiles(prev => prev.map(f => f.id === id ? { ...f, selectedYear: year } : f));
    };

    // Submit pending files and add to uploaded list
    const handleUploadSubmit = () => {
        if (pendingFiles.length === 0) return;

        const dateStr = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        const newDocs = pendingFiles.map(pf => {
            // Find key from selected type label
            let key = "other";
            if (pf.selectedType === "W2") key = "w2";
            else if (pf.selectedType.startsWith("1099")) key = "1099";
            else if (pf.selectedType.startsWith("5498")) key = "5498";
            else if (pf.selectedType.startsWith("1098")) key = "1098";

            return {
                id: Date.now() + Math.random(),
                name: pf.name,
                type: pf.selectedType,
                categoryKey: key,
                country: selectedCountry === "US" ? "UNITED STATES" : "INDIA",
                year: pf.selectedYear,
                uploadedDate: dateStr
            };
        });

        const updated = [...newDocs, ...uploadedDocs];
        saveDocs(updated);
        setPendingFiles([]);
        setShowModal(false);
    };

    // Delete an uploaded document
    const handleDeleteDoc = (id) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            const updated = uploadedDocs.filter(doc => doc.id !== id);
            saveDocs(updated);
        }
    };

    return (
        <div className="documents-container">
            {/* Header Area */}
            <div className="docs-header-wrapper d-flex align-items-center justify-content-between mb-4">
                <h1 className="docs-title">Upload Tax Documents</h1>
                <button 
                    className="btn btn-primary btn-upload-top d-flex align-items-center gap-2 px-4 py-2"
                    onClick={() => {
                        setPendingFiles([]);
                        setShowModal(true);
                    }}
                >
                    <FiPlus size={18} />
                    <span>Upload</span>
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="docs-tabs-container mb-4">
                <ul className="nav docs-tabs-list border-bottom">
                    {categories.map(tab => (
                        <li key={tab.id} className="nav-item">
                            <button
                                className={`nav-link docs-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Area: Empty State OR Table View */}
            {filteredDocs.length === 0 ? (
                /* State A: Empty State View */
                <div className="docs-empty-state-box text-center d-flex flex-column align-items-center justify-content-center py-5 rounded bg-white border">
                    <img 
                        src={noDataImg} 
                        alt="No Documents Uploaded" 
                        className="empty-state-img img-fluid mb-4"
                        style={{ maxWidth: "280px" }}
                    />
                    <h3 className="empty-state-title mb-2">No data found</h3>
                    <p className="empty-state-subtitle text-muted mb-4">Upload your Tax Documents</p>
                    <button 
                        className="btn btn-primary btn-upload-empty px-4 py-2 fw-semibold"
                        onClick={() => {
                            setPendingFiles([]);
                            setShowModal(true);
                        }}
                    >
                        Upload Documents
                    </button>
                </div>
            ) : (
                /* State D: List View Table */
                <div className="docs-list-view bg-white rounded border">
                    <div className="table-responsive">
                        <table className="table docs-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Country</th>
                                    <th scope="col">Year</th>
                                    <th scope="col">Uploaded</th>
                                    <th scope="col" className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id} className="align-middle">
                                        <td className="doc-name-cell">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="doc-icon-container">
                                                    <FiFileText size={20} className="doc-icon" />
                                                </div>
                                                <span className="doc-name fw-semibold">{doc.name}</span>
                                            </div>
                                        </td>
                                        <td className="doc-type-cell">
                                            <span className="doc-type-badge">{doc.type}</span>
                                        </td>
                                        <td className="doc-country-cell text-uppercase small text-muted font-monospace">{doc.country}</td>
                                        <td className="doc-year-cell">{doc.year}</td>
                                        <td className="doc-date-cell text-muted">{doc.uploadedDate}</td>
                                        <td className="doc-action-cell text-end">
                                            <div className="d-flex justify-content-end align-items-center gap-2">
                                                <button 
                                                    className="btn btn-icon text-muted" 
                                                    title="View Document"
                                                    onClick={() => alert(`Viewing file: ${doc.name}`)}
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                                <button 
                                                    className="btn btn-icon text-muted" 
                                                    title="Edit Details"
                                                    onClick={() => alert(`Edit feature for: ${doc.name}`)}
                                                >
                                                    <FiEdit3 size={17} />
                                                </button>
                                                <button 
                                                    className="btn btn-icon text-danger" 
                                                    title="Delete Document"
                                                    onClick={() => handleDeleteDoc(doc.id)}
                                                >
                                                    <FiTrash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Warning Footer below table */}
                    <div className="docs-footer-warning p-3 bg-light border-top d-flex align-items-start gap-3">
                        <FiAlertTriangle className="warning-icon text-warning mt-1" size={20} />
                        <p className="warning-text mb-0 small text-muted">
                            <strong>Note:</strong> If the Upload size document is more than 06MB, Kindly mail the documents to <a href="mailto:Hello@umpiretaxsolutions.com" className="text-decoration-none">Hello@umpiretaxsolutions.com</a>
                        </p>
                    </div>
                </div>
            )}

            {/* State B & C: Upload Documents Modal */}
            {showModal && (
                <div className="modal-overlay d-flex align-items-center justify-content-center">
                    <div className="modal-backdrop-blur" onClick={() => setShowModal(false)}></div>
                    <div className="upload-modal-container bg-white rounded border shadow-lg position-relative">
                        {/* Close button */}
                        <button 
                            className="btn btn-close-modal p-2 border-0 bg-transparent text-muted position-absolute"
                            onClick={() => setShowModal(false)}
                        >
                            <FiX size={22} />
                        </button>

                        <div className="modal-content-wrapper p-4">
                            <h2 className="modal-title mb-1">Upload documents</h2>
                            <p className="modal-subtitle text-muted mb-4">Add tax forms and supporting files for your file</p>

                            {/* Country Selector */}
                            <div className="modal-field-group mb-4">
                                <label className="modal-field-label d-block text-uppercase small text-muted fw-bold mb-2">Country</label>
                                <div className="d-flex align-items-center gap-2">
                                    <button 
                                        className={`btn btn-country-pill d-flex align-items-center gap-2 ${selectedCountry === "US" ? "active" : ""}`}
                                        onClick={() => setSelectedCountry("US")}
                                    >
                                        <span className="flag-icon">🇺🇸</span>
                                        <span>United States</span>
                                    </button>
                                    <button 
                                        className={`btn btn-country-pill d-flex align-items-center gap-2 ${selectedCountry === "IN" ? "active" : ""}`}
                                        onClick={() => setSelectedCountry("IN")}
                                    >
                                        <span className="flag-icon">🇮🇳</span>
                                        <span>India</span>
                                    </button>
                                </div>
                            </div>

                            {/* Drag & Drop Zone */}
                            <div className="modal-field-group mb-4">
                                <div 
                                    className="upload-drag-zone d-flex flex-column align-items-center justify-content-center p-4 border-dashed rounded text-center"
                                    onClick={handleDragZoneClick}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="d-none" 
                                        multiple 
                                        onChange={handleFileChange}
                                    />
                                    <div className="upload-cloud-icon-container mb-3">
                                        <FiUploadCloud size={30} className="cloud-icon" />
                                    </div>
                                    <p className="drag-text mb-1">
                                        Click to upload <span className="drag-link-text">or drag and drop</span>
                                    </p>
                                    <p className="drag-subtext text-muted small mb-0">PDF, PNG, JPG up to 10MB</p>
                                </div>
                            </div>

                            {/* Selected Files Section (State C) */}
                            {pendingFiles.length > 0 && (
                                <div className="modal-field-group mb-4">
                                    <label className="modal-field-label d-block text-uppercase small text-muted fw-bold mb-2">
                                        {pendingFiles.length} {pendingFiles.length === 1 ? "FILE" : "FILES"} SELECTED
                                    </label>
                                    <div className="pending-files-list d-flex flex-column gap-2">
                                        {pendingFiles.map(file => (
                                            <div key={file.id} className="pending-file-row p-3 rounded d-flex align-items-center justify-content-between border">
                                                <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                                                    <div className="pending-file-icon-box">
                                                        <FiFileText size={20} className="file-icon" />
                                                    </div>
                                                    <div className="file-details text-start text-truncate">
                                                        <p className="file-name fw-semibold mb-0 text-truncate">{file.name}</p>
                                                        <p className="file-size text-muted small mb-0">{file.size}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="pending-file-selectors d-flex align-items-center gap-2 ms-3">
                                                    {/* Category Select Dropdown */}
                                                    <div className="custom-dropdown-container position-relative">
                                                        <select
                                                            className="form-select custom-select py-1 px-3 pe-4 text-muted border rounded"
                                                            value={file.selectedType}
                                                            onChange={(e) => handlePendingCategoryChange(file.id, e.target.value)}
                                                        >
                                                            <option value="W2">W2</option>
                                                            <option value="1099-NEC/B/G/DIV/INT/MISC">1099-NEC/B/G/DIV/INT/MISC</option>
                                                            <option value="5498/HSA 1099R/IRA">5498/HSA 1099R/IRA</option>
                                                            <option value="1098/1098-T">1098/1098-T</option>
                                                            <option value="Other documents">Other documents</option>
                                                        </select>
                                                        <FiChevronDown className="select-arrow-icon position-absolute text-muted" size={14} />
                                                    </div>

                                                    {/* Year Select Dropdown */}
                                                    <div className="custom-dropdown-container position-relative">
                                                        <select
                                                            className="form-select custom-select py-1 px-3 pe-4 text-muted border rounded"
                                                            value={file.selectedYear}
                                                            onChange={(e) => handlePendingYearChange(file.id, e.target.value)}
                                                        >
                                                            <option value="2026">2026</option>
                                                            <option value="2025">2025</option>
                                                            <option value="2024">2024</option>
                                                            <option value="2023">2023</option>
                                                        </select>
                                                        <FiChevronDown className="select-arrow-icon position-absolute text-muted" size={14} />
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button 
                                                        className="btn btn-icon text-danger p-2 border-0 bg-transparent"
                                                        onClick={() => handleRemovePending(file.id)}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Upload button */}
                            <button 
                                className="btn btn-primary btn-submit-upload w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-4"
                                disabled={pendingFiles.length === 0}
                                onClick={handleUploadSubmit}
                            >
                                <FiUploadCloud size={20} />
                                <span>Upload documents</span>
                            </button>

                            {/* Warning Footer in Modal */}
                            <div className="modal-warning-footer p-3 bg-light border-top rounded d-flex align-items-start gap-3 text-start">
                                <FiAlertTriangle className="warning-icon text-warning mt-1 flex-shrink-0" size={20} />
                                <p className="warning-text mb-0 small text-muted leading-sm">
                                    Note: If the Upload size document is more than 06MB, Kindly mail the documents to <a href="mailto:Hello@umpiretaxsolutions.com" className="text-decoration-none">Hello@umpiretaxsolutions.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
