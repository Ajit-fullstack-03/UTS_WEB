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
    FiCheckCircle,
    FiDownload
} from "react-icons/fi";
import noDataImg from "../../assets/image/no_data.png";
import "./documents.css";
import { webservices } from "../servics/CustomerServices";
import Swal from "sweetalert2";

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
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [isDoneUploaded, setIsDoneUploaded] = useState(false);

    useEffect(() => {
        const checkUploadStatus = () => {
            try {
                const storedStatus = localStorage.getItem("currentFileStatus");
                if (storedStatus) {
                    const parsed = JSON.parse(storedStatus);
                    const statusId = Number(parsed.presentfilestatus);
                    if (statusId >= 6 && statusId !== 15) {
                        setIsDoneUploaded(true);
                    } else {
                        setIsDoneUploaded(false);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        checkUploadStatus();
        window.addEventListener("fileStatusUpdated", checkUploadStatus);
        return () => {
            window.removeEventListener("fileStatusUpdated", checkUploadStatus);
        };
    }, []);

    const handleDoneUploadsChange = async (e) => {
        const checked = e.target.checked;
        if (checked) {
            Swal.fire({
                title: "Are you sure?",
                text: "Confirm that you have completed uploading all required tax documents.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#1b3178",
                cancelButtonColor: "#cbd5e1",
                confirmButtonText: "Yes, I'm done!",
                cancelButtonText: "No, cancel",
                customClass: {
                    confirmButton: "btn btn-primary px-4 py-2",
                    cancelButton: "btn btn-light px-4 py-2 ms-2"
                },
                buttonsStyling: false
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const userInfoStr = localStorage.getItem("userInfo");
                    if (!userInfoStr) {
                        Swal.fire({
                            title: "Error!",
                            text: "User session not found.",
                            icon: "error",
                            confirmButtonColor: "#1b3178"
                        });
                        return;
                    }
                    try {
                        setLoading(true);
                        const userInfo = JSON.parse(userInfoStr);
                        const client_id = userInfo.client_id;
                        const payload = {
                            user_id: Number(client_id)
                        };
                        const response = await webservices.confirmdocupload(payload);
                        if (response.data && (response.status === 200 || response.data.http_code === 200)) {
                            Swal.fire({
                                title: "Success!",
                                text: response.data.status_smessage || "Document upload confirmation sent successfully.",
                                icon: "success",
                                confirmButtonColor: "#1b3178"
                            });
                            setIsDoneUploaded(true);
                            
                            // Update cached status to 6 (Preparation Pending)
                            try {
                                const storedStatus = localStorage.getItem("currentFileStatus");
                                let updatedStatus = { presentfilestatus: 6, pfilename: "Preparation Pending" };
                                if (storedStatus) {
                                    const parsed = JSON.parse(storedStatus);
                                    updatedStatus = { ...parsed, presentfilestatus: 6, pfilename: "Preparation Pending" };
                                }
                                localStorage.setItem("currentFileStatus", JSON.stringify(updatedStatus));
                            } catch (e) {
                                console.error(e);
                            }
                            
                            window.dispatchEvent(new Event("fileStatusUpdated"));
                        } else {
                            Swal.fire({
                                title: "Failed!",
                                text: response.data.status_smessage || "Failed to confirm upload. Please try again.",
                                icon: "error",
                                confirmButtonColor: "#1b3178"
                            });
                        }
                    } catch (error) {
                        console.error("Error confirming uploads:", error);
                        Swal.fire({
                            title: "Error!",
                            text: "An error occurred while confirming document upload.",
                            icon: "error",
                            confirmButtonColor: "#1b3178"
                        });
                    } finally {
                        setLoading(false);
                    }
                }
            });
        }
    };

    const getOriginalNameAndCountry = (fileName) => {
        let name = "Unknown Document";
        let country = "INDIA";
        if (!fileName) return { name, country };

        // Remove query parameters if present (e.g. from S3 presigned URL)
        let cleanName = fileName.split("?")[0];
        // Extract the filename portion if it contains folder paths or URL segments
        cleanName = cleanName.substring(cleanName.lastIndexOf("/") + 1);

        const parts = cleanName.split("_utshash_");
        if (parts.length > 1) {
            const rawName = parts[1];
            if (rawName.startsWith("US_")) {
                country = "UNITED STATES";
                name = rawName.substring(3);
            } else if (rawName.startsWith("IN_")) {
                country = "INDIA";
                name = rawName.substring(3);
            } else {
                name = rawName;
            }
        } else {
            name = cleanName;
        }
        return { name, country };
    };

    const fetchAllDocs = async () => {
        const userInfoStr = localStorage.getItem("userInfo");
        if (!userInfoStr) return;

        try {
            setLoading(true);
            const userInfo = JSON.parse(userInfoStr);
            const client_id = userInfo.client_id;
            const user_id = userInfo.user_id;

            const docTypes = [
                { key: "w2", apiType: "W2", label: "W2" },
                { key: "1099", apiType: "P1099B", label: "1099-NEC/B/G/DIV/INT/MISC" },
                { key: "5498", apiType: "HSA", label: "5498/HSA 1099R/IRA" },
                { key: "1098", apiType: "IRA", label: "1098/1098-T" },
                { key: "other", apiType: "other", label: "Other documents" }
            ];

            const promises = docTypes.map(async (docType) => {
                const payload = {
                    folderPath: `${client_id}/${docType.apiType}/`,
                    doctype: docType.apiType,
                    user_id: user_id
                };
                const response = await webservices.getuploaddocs(payload);
                let files = [];
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        files = response.data;
                    } else if (response.data.data) {
                        if (Array.isArray(response.data.data.Contents)) {
                            files = response.data.data.Contents;
                        } else if (Array.isArray(response.data.data)) {
                            files = response.data.data;
                        }
                    } else if (Array.isArray(response.data.Contents)) {
                        files = response.data.Contents;
                    }
                }

                return files.map(file => {
                    let formattedDate = "N/A";
                    if (file.created_at) {
                        const d = new Date(file.created_at);
                        formattedDate = d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        });
                    }

                    const fileNameSource = file.upload_file_name || (file.upload_file ? file.upload_file.split("?")[0].split("/").pop() : "");
                    const parsed = getOriginalNameAndCountry(fileNameSource);

                    return {
                        id: file.up_id || fileNameSource || Math.random().toString(),
                        up_id: file.up_id,
                        name: parsed.name,
                        url: file.upload_file,
                        rawFileName: fileNameSource,
                        type: docType.label,
                        categoryKey: docType.key,
                        country: parsed.country,
                        year: file.current_year || "2026",
                        uploadedDate: formattedDate
                    };
                });
            });

            const results = await Promise.all(promises);
            const flatDocs = results.flat();
            setUploadedDocs(flatDocs);
        } catch (error) {
            console.error("Error fetching docs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllDocs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    const handleUploadSubmit = async () => {
        if (pendingFiles.length === 0) return;

        const userInfoStr = localStorage.getItem("userInfo");
        if (!userInfoStr) {
            alert("User session not found. Please log in again.");
            return;
        }

        try {
            setLoading(true);
            const userInfo = JSON.parse(userInfoStr);
            const client_id = userInfo.client_id;
            const upt_id = userInfo.upt_id || null;

            const formData = new FormData();
            const metadata = [];

            pendingFiles.forEach((fileObj, index) => {
                let apiType = "other";
                if (fileObj.selectedType === "W2") apiType = "W2";
                else if (fileObj.selectedType.startsWith("1099")) apiType = "P1099B";
                else if (fileObj.selectedType.startsWith("5498")) apiType = "HSA";
                else if (fileObj.selectedType.startsWith("1098")) apiType = "IRA";

                const fileExtension = fileObj.rawFile.name.substring(fileObj.rawFile.name.lastIndexOf("."));
                const filePrefix = selectedCountry === "US" ? "US_" : "IN_";
                // const renamedFileName = `${filePrefix}file${index + 1}${fileExtension}`;
                const timestamp = Date.now();
                const renamedFileName = `${filePrefix}file${timestamp}${fileExtension}`;

                const renamedFile = new File([fileObj.rawFile], renamedFileName, {
                    type: fileObj.rawFile.type
                });

                formData.append("uploadedImages" + index, renamedFile);
                formData.append("doctype", apiType);

                metadata.push({
                    name: renamedFileName,
                    doctype: apiType
                });
            });

            formData.append("client_id", client_id);
            formData.append("fileMetadata", JSON.stringify(metadata));
            // Add a default folderPath for backend fallback compatibility
            formData.append("folderPath", `${client_id}/`);
            if (upt_id !== null) {
                formData.append("upt_id", upt_id);
            }
            const response = await webservices.uploaddocs(formData);
            if (response.data && (response.status === 200 || response.data.message)) {
                alert(`${pendingFiles.length} file(s) uploaded successfully!`);
            } else {
                alert("Failed to upload files.");
            }
        } catch (error) {
            console.error("General error during upload process:", error);
            alert("An error occurred during file upload.");
        } finally {
            setLoading(false);
            setPendingFiles([]);
            setShowModal(false);
            fetchAllDocs();
        }
    };

    // View document in a new tab by fetching as blob to bypass attachment headers
    const handleViewDoc = async (doc) => {
        if (!doc.url) {
            alert("Document URL not found.");
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(doc.url);
            const blob = await response.blob();
            
            // Get correct file type from extension if S3 returned generic octet-stream
            const extension = doc.name ? doc.name.split(".").pop().toLowerCase() : "";
            let fileType = blob.type;
            if (!fileType || fileType === "application/octet-stream" || fileType === "binary/octet-stream") {
                if (extension === "pdf") fileType = "application/pdf";
                else if (extension === "png") fileType = "image/png";
                else if (extension === "jpg" || extension === "jpeg") fileType = "image/jpeg";
                else if (extension === "gif") fileType = "image/gif";
                else if (extension === "txt") fileType = "text/plain";
            }
            
            const viewBlob = new Blob([blob], { type: fileType });
            const blobUrl = window.URL.createObjectURL(viewBlob);
            window.open(blobUrl, "_blank");
        } catch (error) {
            console.error("Failed to view file, fallback to direct open:", error);
            window.open(doc.url, "_blank");
        } finally {
            setLoading(false);
        }
    };

    // Download document by fetching as blob and triggering download
    const handleDownloadDoc = async (doc) => {
        if (!doc.url) {
            alert("Document URL not found.");
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(doc.url);
            const blob = await response.blob();
            
            // Force content-type to application/octet-stream to trigger direct browser download
            const downloadBlob = new Blob([blob], { type: "application/octet-stream" });
            const blobUrl = window.URL.createObjectURL(downloadBlob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", doc.name || "document");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Failed to download file, fallback to direct download:", error);
            const link = document.createElement("a");
            link.href = doc.url;
            link.setAttribute("download", doc.name || "document");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } finally {
            setLoading(false);
        }
    };

    // Delete an uploaded document
    const handleDeleteDoc = async (doc) => {
        if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

        const userInfoStr = localStorage.getItem("userInfo");
        if (!userInfoStr) {
            alert("User session not found.");
            return;
        }

        try {
            setLoading(true);
            const userInfo = JSON.parse(userInfoStr);
            const client_id = userInfo.client_id;

            const payload = {
                filename: doc.rawFileName || doc.id,
                uid: client_id,
                up_id: doc.up_id
            };

            const response = await webservices.deleteuploaddoc(payload);
            if (response.data && (response.status === 200 || response.data.http_code === 200)) {
                alert(response.data.msg || "File deleted successfully.");
            } else {
                alert(response.data.status_smessage || "Failed to delete file.");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("An error occurred during file deletion.");
        } finally {
            setLoading(false);
            fetchAllDocs();
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

            {/* Confirmation Box (Only on All tab) */}
            {activeTab === "all" && (
                <div className="docs-done-checkbox-card p-3 mb-4 bg-white rounded border d-flex align-items-center gap-3">
                    <input
                        type="checkbox"
                        id="doneWithUploads"
                        className="done-uploads-checkbox"
                        checked={isDoneUploaded}
                        disabled={isDoneUploaded}
                        onChange={handleDoneUploadsChange}
                    />
                    <label htmlFor="doneWithUploads" className="done-uploads-label fw-semibold mb-0 cursor-pointer">
                        {isDoneUploaded 
                            ? "You have confirmed that your document upload is complete."
                            : "Are you done with your document upload?"}
                    </label>
                </div>
            )}

            {/* Main Area: Empty State OR Table View */}
            {loading && filteredDocs.length === 0 ? (
                <div className="docs-empty-state-box text-center d-flex flex-column align-items-center justify-content-center py-5 rounded bg-white border" style={{ minHeight: "350px" }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3 fw-semibold">Loading your documents...</p>
                </div>
            ) : filteredDocs.length === 0 ? (
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
                                                    onClick={() => handleViewDoc(doc)}
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                                <button
                                                    className="btn btn-icon text-muted"
                                                    title="Download Document"
                                                    onClick={() => handleDownloadDoc(doc)}
                                                >
                                                    <FiDownload size={18} />
                                                </button>
                                                <button
                                                    className="btn btn-icon text-danger"
                                                    title="Delete Document"
                                                    onClick={() => handleDeleteDoc(doc)}
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
                                                        {/* <FiChevronDown className="select-arrow-icon position-absolute text-muted" size={14} /> */}
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
                                                        {/* <FiChevronDown className="select-arrow-icon position-absolute text-muted" size={14} /> */}
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
                                disabled={pendingFiles.length === 0 || loading}
                                onClick={handleUploadSubmit}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm text-white" role="status">
                                            <span className="visually-hidden">Uploading...</span>
                                        </div>
                                        <span>Uploading documents...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiUploadCloud size={20} />
                                        <span>Upload documents</span>
                                    </>
                                )}
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
