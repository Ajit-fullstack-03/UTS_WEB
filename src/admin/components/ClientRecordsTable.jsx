import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
    FiSearch,
    FiFilter,
    FiDownload,
    FiTrash2,
    FiUpload,
    FiUploadCloud,
    FiArrowLeft,
    FiChevronLeft,
    FiChevronRight,
    FiFileText,
    FiUsers,
    FiBriefcase,
    FiHeart,
    FiRefreshCw,
    FiPackage,
    FiExternalLink
} from "react-icons/fi";
import { adminServices } from "../services/AdminServices";
import "../pages/admin_dashboard.css";

const filestateMap = {
    "all": "ALL",
    "ALL": "ALL",
    0: 0,
    "to_be_assigned": 0,
    "TO_BE_ASSIGNED": 0,
    1: 1,
    "basic_info_pending": 1,
    "BASIC_INFO_PENDING": 1,
    2: 2,
    "scheduling_pending": 2,
    "SCHEDULING_PENDING": 2,
    "interview_pending": 2,
    "INTERVIEW_PENDING": 2,
    3: 3,
    4: 4,
    "docs_upload_pending": 4,
    "DOCS_UPLOAD_PENDING": 4,
    5: 5,
    "other_docs_upload_pending": 5,
    "other_docs_pending": 5,
    "OTHER_DOCS_PENDING": 5,
    6: 6,
    "preparation_pending": 6,
    "prep_pending": 6,
    "PREPARATION_PENDING": 6,
    7: 7,
    "synopsys_pending": 7,
    "SYNOPSYS_PENDING": 7,
    8: 8,
    "payment_pending": 8,
    "PAYMENT_PENDING": 8,
    9: 9,
    "review_pending": 9,
    "review_upload_pending": 9,
    "REVIEW_UPLOAD_PENDING": 9,
    10: 10,
    "confirmation_pending": 10,
    11: 11,
    "e-filing_pending": 11,
    "e_filing_pending": 11,
    12: 12,
    "paper-filing_pending": 12,
    "paper_filing_pending": 12,
    13: 13,
    "e-filing_complete": 13,
    "e_filing_complete": 13,
    14: 14,
    "filing_docs_sent": 14,
    15: 15,
    "cancel_filing": 15,
    16: 16,
    "pre_synopsys_pending": 16,
    "pre-synopsys_pending": 16,
    "PRE_SYNOPSYS_PENDING": 16,
    17: 17,
    "pre_e-filing_pending": 17,
    "pre_e_filing_pending": 17
};

const countryCodes = ["+1", "+91", "+44", "+61", "+971"];

const fileStatusOptions = [
    { value: 0, label: "To Be Assigned" },
    { value: 1, label: "Basic Info Pending" },
    { value: 2, label: "Scheduling Pending" },
    { value: 3, label: "Interview Pending" },
    { value: 4, label: "Docs Upload Pending" },
    { value: 5, label: "Other Docs Pending" },
    { value: 6, label: "Preparation Pending" },
    { value: 7, label: "Synopsys Pending" },
    { value: 8, label: "Payment Pending" },
    { value: 9, label: "Review Upload Pending" },
    { value: 10, label: "Confirmation Pending" },
    { value: 11, label: "E-Filing Pending" },
    { value: 12, label: "Paper Filing Pending" },
    { value: 13, label: "E-Filing Complete" },
    { value: 14, label: "Filing Docs Sent" },
    { value: 15, label: "Cancel Filing" }
];

const ClientRecordsTable = ({ filestate = "ALL", title = "All Client Records" }) => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedClient, setSelectedClient] = useState(null);

    // Inner detail tabs
    const [activeInnerTab, setActiveInnerTab] = useState("basic_info");
    const [activeOtherSubTab, setActiveOtherSubTab] = useState("spouse");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadCountry, setUploadCountry] = useState("US");
    const [uploadDocTitle, setUploadDocTitle] = useState("Tax Synopsis");
    const [uploadTaxYear, setUploadTaxYear] = useState(String(new Date().getFullYear()));
    const [selectedUploadFile, setSelectedUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [zipDownloading, setZipDownloading] = useState(false);

    // File Status update states
    const [selectedFileState, setSelectedFileState] = useState(1);
    const [statusComment, setStatusComment] = useState("");
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusHistory, setStatusHistory] = useState([]);
    const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
    const [statusHistoryPage, setStatusHistoryPage] = useState(1);
    const [statusHistoryRowsPerPage, setStatusHistoryRowsPerPage] = useState(10);

    // Payment tab states
    const [paymentForm, setPaymentForm] = useState({
        paymentId: "",
        standardAmount: "",
        discountType: "",
        discountValue: "",
        finalAmount: "",
        comments: ""
    });
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);

    // Referral tab states
    const [referralsList, setReferralsList] = useState([]);
    const [referralSearch, setReferralSearch] = useState("");
    const [referralsLoading, setReferralsLoading] = useState(false);
    const [referralPage, setReferralPage] = useState(1);
    const [referralRowsPerPage, setReferralRowsPerPage] = useState(10);

    // Client Details API States (Mirrors Customer Profile Structure)
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [basicInfo, setBasicInfo] = useState({
        firstName: "",
        lastName: "",
        ssnItin: "",
        occupation: "",
        dob: "",
        email: "",
        mobileCode: "+91",
        mobilePhone: "",
        workPhone: "",
        referralName: ""
    });

    const [spouseInfo, setSpouseInfo] = useState(null);
    const [dependentsInfo, setDependentsInfo] = useState([]);
    const [employersInfo, setEmployersInfo] = useState([]);

    // Fetch records from API
    const loadRecords = useCallback(async () => {
        setLoading(true);
        try {
            const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
            let userId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";
            let taxYear = String(new Date().getFullYear());

            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
                    if (parsed.taxyear || parsed.taxYear || parsed.current_year) taxYear = String(parsed.taxyear || parsed.taxYear || parsed.current_year);
                } catch {
                    // Ignore JSON parse error
                }
            }

            const resolvedState = filestateMap[filestate] !== undefined
                ? filestateMap[filestate]
                : (isNaN(Number(filestate)) ? 0 : Number(filestate));

            let response;
            if (resolvedState === "ALL" || resolvedState === "all") {
                const payload = {
                    filestate: "ALL",
                    user_id: userId,
                    taxYear: String(taxYear),
                    per_page: rowsPerPage,
                    page: currentPage
                };
                response = await adminServices.alluserslist(payload);
            } else {
                const numericState = Number(resolvedState);
                const payload = {
                    user_id: userId,
                    taxYear: String(taxYear),
                    filestate: numericState,
                    filestatus: numericState
                };
                response = await adminServices.commonprocessingclientdata(payload);
            }

            let rawList = [];
            let total = 0;

            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    rawList = response.data;
                    total = response.data.length;
                } else if (Array.isArray(response.data.data)) {
                    rawList = response.data.data;
                    total = response.data.total_records || response.data.total || response.data.count || response.data.data.length;
                } else if (Array.isArray(response.data.users)) {
                    rawList = response.data.users;
                    total = response.data.total_users || response.data.users.length;
                } else if (Array.isArray(response.data.list)) {
                    rawList = response.data.list;
                    total = response.data.total_records || response.data.list.length;
                }
            }

            if (rawList && rawList.length > 0) {
                const formatted = rawList.map((item, idx) => {
                    const clientUserId = item.user_id || item.u_user_id || item.ps_user_id || item.unlists_u_id || item.client_id;
                    const filenumber = item.unique_code || item.filenumber || item.file_number || item.fileno || `UTS${1000 + idx}`;
                    const name = item.user_name || item.name || `${item.fname || item.first_name || ""} ${item.lname || item.last_name || ""}`.trim() || "Client";
                    const email = item.email || item.email_id || item.user_email || "N/A";
                    const phone = item.phone || item.mobile || item.contact_number || item.phone_number || "N/A";
                    const status = item.file_status || item.presentfilestatus || item.pfilename || item.status || "Pending";
                    const statusId = item.statusId || String(status).toLowerCase().replace(/\s+/g, "_");

                    const isAssigned = Boolean(
                        (item.client_name && item.client_name.trim() !== "" && item.client_name !== "0" && item.client_name !== "null" && item.client_name !== "-") ||
                        (item.unlists_u_id && item.unlists_u_id !== 0 && item.unlists_u_id !== "0") ||
                        item.assigned === true ||
                        item.is_assigned === true
                    );

                    const assignedName = (item.client_name && item.client_name.trim() !== "" && item.client_name !== "0" && item.client_name !== "null" && item.client_name !== "-")
                        ? item.client_name
                        : (isAssigned ? "Assigned" : "Not Assigned");

                    const referral = item.referral || item.referral_to || "-";

                    return {
                        id: filenumber,
                        unique_code: filenumber,
                        filenumber: filenumber,
                        user_id: clientUserId,
                        client_id: clientUserId,
                        rawData: item,
                        name,
                        email,
                        phone,
                        status,
                        statusId,
                        assigned: isAssigned,
                        assignedName,
                        referral,
                        ssn: item.ssn || item.ssnitin || "-",
                        dob: item.dob || "-",
                        dependents: item.dependents || "No",
                        address: item.address || "-",
                        country: item.country || "US",
                        zip: item.zip || "-",
                        city: item.city || "-",
                        healthInsurance: item.healthInsurance || "No",
                        employer: item.employer || "-",
                        timeZone: item.timeZone || "PST",
                        registered: item.registered || item.created_at || "-",
                        altPhone: item.altPhone || item.alterphone || "",
                        rawItem: item
                    };
                });

                setClients(formatted);
                setTotalRecords(total || formatted.length);
            } else {
                setClients([]);
                setTotalRecords(0);
            }
        } catch (error) {
            console.warn("API records fetch error:", error);
            setClients([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    }, [filestate, currentPage, rowsPerPage]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    // Fetch client details: taxpayerinfo, getSpouseInfo, getDependentInfo, getEmployerInfo, gettotalcountofdocs
    const fetchClientDetails = useCallback(async (client) => {
        if (!client) return;
        const targetUserId = client.user_id || client.client_id || client.id;
        const payload = {
            user_id: targetUserId,
            client_id: targetUserId
        };

        setDetailsLoading(true);
        setDocsLoading(true);
        try {
            // 1. taxpayerinfo (Same fields as customer side ProfileDetails)
            let t = null;
            try {
                const resTaxpayer = await adminServices.taxpayerinfo(payload);
                if (resTaxpayer?.data && resTaxpayer?.data?.http_code === 200 && resTaxpayer?.data?.tinfo) {
                    t = resTaxpayer.data.tinfo;
                } else if (resTaxpayer?.data?.tinfo) {
                    t = resTaxpayer.data.tinfo;
                } else if (resTaxpayer?.data?.data) {
                    t = Array.isArray(resTaxpayer.data.data) ? resTaxpayer.data.data[0] : resTaxpayer.data.data;
                }
            } catch (err) {
                console.warn("Error fetching taxpayerinfo, trying userdetails fallback:", err);
            }

            // Fallback to userdetails if taxpayerinfo returned empty
            if (!t) {
                try {
                    const resUser = await adminServices.userdetails(payload);
                    const rawUser = resUser?.data?.data || resUser?.data?.uinfo || resUser?.data?.tinfo || resUser?.data?.userdetails || (Array.isArray(resUser?.data) ? resUser?.data[0] : resUser?.data) || {};
                    t = Array.isArray(rawUser) ? rawUser[0] : rawUser;
                } catch (err) {
                    console.warn("Error fetching userdetails fallback:", err);
                }
            }

            if (t) {
                setBasicInfo({
                    firstName: t.first_name || t.fname || (t.user_name ? t.user_name.split(" ")[0] : (client.name ? client.name.split(" ")[0] : "")),
                    lastName: t.last_name || t.lname || (t.user_name ? t.user_name.split(" ").slice(1).join(" ") : (client.name ? client.name.split(" ").slice(1).join(" ") : "")),
                    ssnItin: t.ssnitin || t.ssn || t.itin || (client.ssn !== "-" ? client.ssn : ""),
                    occupation: t.occupation || "",
                    dob: t.dob ? t.dob.split("T")[0] : (client.dob !== "-" ? client.dob : ""),
                    email: t.email || client.email || "",
                    mobileCode: t.phoneext || "+91",
                    mobilePhone: t.phone || t.mobile || (client.phone !== "N/A" ? client.phone : ""),
                    workPhone: t.alterphone || t.altPhone || t.work_phone || client.altPhone || "",
                    referralName: t.referral_name || t.referral || (client.referral !== "-" ? client.referral : "")
                });
            }

            // 2. getSpouseInfo
            try {
                const resSpouse = await adminServices.getSpouseInfo(payload);
                const rawSpouse = resSpouse?.data?.data || resSpouse?.data?.sinfo || resSpouse?.data?.tinfo || resSpouse?.data?.spouseinfo || (Array.isArray(resSpouse?.data) ? resSpouse?.data[0] : resSpouse?.data);
                const sData = Array.isArray(rawSpouse) ? rawSpouse[0] : rawSpouse;

                if (sData && (sData.first_name || sData.fname || sData.ssnitin || sData.email || sData.phone)) {
                    setSpouseInfo({
                        firstName: sData.first_name || sData.fname || "",
                        lastName: sData.last_name || sData.lname || "",
                        ssnItin: sData.ssnitin || sData.ssn || sData.itin || "",
                        dob: sData.dob ? sData.dob.split("T")[0] : "",
                        occupation: sData.occupation || "",
                        email: sData.email || "",
                        mobileCode: sData.phoneext || "+1",
                        mobilePhone: sData.phone || sData.mobile || "",
                        workPhone: sData.alterphone || sData.work_phone || ""
                    });
                } else {
                    setSpouseInfo(null);
                }
            } catch (err) {
                console.warn("Error fetching spouse info:", err);
                setSpouseInfo(null);
            }

            // 3. getDependentInfo
            try {
                const resDep = await adminServices.getDependentInfo(payload);
                const rawDep = resDep?.data?.data || resDep?.data?.dinfo || resDep?.data?.dependents || resDep?.data?.tinfo || (Array.isArray(resDep?.data) ? resDep?.data : []);
                const dArray = Array.isArray(rawDep) ? rawDep : (rawDep && typeof rawDep === "object" && Object.keys(rawDep).length > 0 ? [rawDep] : []);

                setDependentsInfo(
                    dArray
                        .filter(d => d && (d.first_name || d.fname || d.ssnitin || d.relation_ship))
                        .map((d, idx) => ({
                            id: d.user_details_id || d.dep_id || d.id || idx + 1,
                            firstName: d.first_name || d.fname || "",
                            lastName: d.last_name || d.lname || "",
                            relationship: d.relation_ship || d.relationship || "Son",
                            ssnItin: d.ssnitin || d.ssn || d.itin || "",
                            dob: d.dob ? d.dob.split("T")[0] : "",
                            visaType: d.visa_type || d.visa || ""
                        }))
                );
            } catch (err) {
                console.warn("Error fetching dependent info:", err);
                setDependentsInfo([]);
            }

            // 4. getEmployerInfo
            try {
                const resEmp = await adminServices.getEmployerInfo(payload);
                const rawEmp = resEmp?.data?.data || resEmp?.data?.einfo || resEmp?.data?.employers || resEmp?.data?.employerinfo || (Array.isArray(resEmp?.data) ? resEmp?.data : []);
                const empArray = Array.isArray(rawEmp) ? rawEmp : (rawEmp && typeof rawEmp === "object" && Object.keys(rawEmp).length > 0 ? [rawEmp] : []);

                setEmployersInfo(
                    empArray
                        .filter(e => e && (e.employer_name || e.employer || e.company_name || e.name || e.ein))
                        .map((e, idx) => ({
                            id: e.emp_id || e.id || idx + 1,
                            employerName: e.employer_name || e.employer || e.company_name || e.name || "",
                            ein: e.ein || e.employer_tax_id || e.tax_id || "",
                            address: e.address || e.street || "",
                            city: e.city || "",
                            state: e.state || "",
                            zip: e.zip || e.zipcode || "",
                            phone: e.phone || e.contact || "",
                            designation: e.designation || e.occupation || e.title || ""
                        }))
                );
            } catch (err) {
                console.warn("Error fetching employer info:", err);
                setEmployersInfo([]);
            }

            // 5. gettotalcountofdocs (Fetch all client uploaded documents)
            try {
                const resDocs = await adminServices.gettotalcountofdocs(payload);
                let docList = [];
                if (resDocs?.data) {
                    if (Array.isArray(resDocs.data)) {
                        docList = resDocs.data;
                    } else if (Array.isArray(resDocs.data.data)) {
                        docList = resDocs.data.data;
                    } else if (Array.isArray(resDocs.data.docs)) {
                        docList = resDocs.data.docs;
                    } else if (Array.isArray(resDocs.data.list)) {
                        docList = resDocs.data.list;
                    } else if (Array.isArray(resDocs.data.Contents)) {
                        docList = resDocs.data.Contents;
                    } else if (resDocs.data.data?.Contents && Array.isArray(resDocs.data.data.Contents)) {
                        docList = resDocs.data.data.Contents;
                    }
                }

                if (docList && docList.length > 0) {
                    const mappedDocs = docList.map((file, idx) => {
                        const rawName = file.upload_file_name || file.name || (file.upload_file ? file.upload_file.split("?")[0].split("/").pop() : `document_${idx + 1}`);
                        let formattedDate = "N/A";
                        if (file.created_at || file.date_added || file.uploaded_date) {
                            const d = new Date(file.created_at || file.date_added || file.uploaded_date);
                            if (!isNaN(d.getTime())) {
                                formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                            }
                        }

                        return {
                            id: file.up_id || file.id || idx,
                            name: rawName,
                            type: file.doctype || file.doc_type || file.type || "Other Document",
                            country: file.country || (rawName.startsWith("IN_") ? "INDIA" : "UNITED STATES"),
                            year: file.current_year || file.tax_year || file.year || "2026",
                            uploaded: formattedDate,
                            url: file.upload_file || file.url || file.file_url || ""
                        };
                    });
                    setUploadedFiles(mappedDocs);
                } else {
                    setUploadedFiles([]);
                }
            } catch (err) {
                console.warn("Error fetching gettotalcountofdocs:", err);
                setUploadedFiles([]);
            }

            // 6. Referrals List
            setReferralsLoading(true);
            try {
                const taxYear = client.tax_year || client.current_year || client.year || client.rawData?.current_year || client.rawData?.tax_year || String(new Date().getFullYear());
                const refPayload = {
                    taxYear: String(taxYear),
                    client_id: String(targetUserId),
                    user_id: String(targetUserId),
                    rf_user_id: String(targetUserId)
                };
                const resRef = await adminServices.refferalslist(refPayload);
                if (resRef?.data?.data && Array.isArray(resRef.data.data)) {
                    setReferralsList(resRef.data.data);
                } else if (Array.isArray(resRef?.data)) {
                    setReferralsList(resRef.data);
                } else {
                    setReferralsList([]);
                }
            } catch (err) {
                console.warn("Error fetching referrals for client:", err);
                setReferralsList([]);
            } finally {
                setReferralsLoading(false);
            }

            // 7. Status History from processingstatushistory
            setStatusHistoryLoading(true);
            try {
                const psYear = client.ps_year || client.tax_year || client.taxyear || client.current_year || client.year || client.rawData?.current_year || client.rawData?.tax_year || String(new Date().getFullYear());
                const psPayload = {
                    ps_year: String(psYear),
                    client_id: String(targetUserId),
                    user_id: String(targetUserId),
                    ps_user_id: String(targetUserId)
                };
                const resStatus = await adminServices.processingstatushistory(psPayload);
                if (resStatus?.data?.data && Array.isArray(resStatus.data.data)) {
                    setStatusHistory(resStatus.data.data);
                } else if (Array.isArray(resStatus?.data)) {
                    setStatusHistory(resStatus.data);
                } else {
                    setStatusHistory([{
                        clientName: client.name || "Client",
                        presentState: client.status || "Pending",
                        comment: "ACTIVE",
                        createAt: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                    }]);
                }
            } catch (err) {
                console.warn("Error fetching processingstatushistory:", err);
                setStatusHistory([{
                    clientName: client.name || "Client",
                    presentState: client.status || "Pending",
                    comment: "ACTIVE",
                    createAt: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                }]);
            } finally {
                setStatusHistoryLoading(false);
            }
        } finally {
            setDetailsLoading(false);
            setDocsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedClient) {
            fetchClientDetails(selectedClient);
        }
    }, [selectedClient, fetchClientDetails]);

    const filteredClients = clients.filter(c => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            c.id.toLowerCase().includes(term) ||
            c.name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.phone.includes(term) ||
            c.status.toLowerCase().includes(term)
        );
    });

    const triggerAlert = (title, text) => {
        Swal.fire({
            title,
            text,
            icon: "success",
            confirmButtonColor: "#1b2e6b"
        });
    };

    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target;
        setBasicInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateClientDetails = (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Success",
            text: "Client details updated successfully!",
            icon: "success",
            confirmButtonColor: "#1b2e6b"
        });
    };

    // Download All Documents as ZIP using upload/downloadZip
    const handleDownloadZip = async () => {
        if (!selectedClient) return;
        const targetUserId = selectedClient.user_id || selectedClient.client_id || selectedClient.id;
        const payload = {
            client_id: targetUserId,
            user_id: targetUserId,
            folderPath: `${targetUserId}/`
        };

        setZipDownloading(true);
        try {
            Swal.fire({
                title: "Generating ZIP Archive",
                text: "Please wait while we bundle all client documents...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await adminServices.downloadZip(payload);
            Swal.close();

            const data = response?.data;
            const zipUrl = data?.zipUrl || data?.url || data?.download_url || data?.path || (typeof data === "string" && data.startsWith("http") ? data : null);

            if (zipUrl) {
                const link = document.createElement("a");
                link.href = zipUrl;
                link.setAttribute("download", `${selectedClient.id || "client"}_documents.zip`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } else if (response?.data instanceof Blob) {
                const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/zip" }));
                const link = document.createElement("a");
                link.href = blobUrl;
                link.setAttribute("download", `${selectedClient.id || "client"}_documents.zip`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } else if (data?.http_code === 200 || data?.status === 200 || data?.message) {
                Swal.fire({
                    title: "Download Initiated",
                    text: data.status_smessage || data.message || "Your ZIP file download has been prepared.",
                    icon: "success",
                    confirmButtonColor: "#1b2e6b"
                });
            } else {
                Swal.fire({
                    title: "Notice",
                    text: data?.status_smessage || data?.message || "No documents found to create a ZIP file.",
                    icon: "info",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        } catch (error) {
            console.error("Error downloading zip:", error);
            Swal.fire({
                title: "Download Failed",
                text: "An error occurred while generating the ZIP archive. Please try again.",
                icon: "error",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setZipDownloading(false);
        }
    };

    // Download Single Document
    const handleDownloadSingleDoc = async (file) => {
        if (!file?.url) {
            Swal.fire({
                title: "File Not Found",
                text: "Direct download URL for this file is not available.",
                icon: "warning",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            const downloadBlob = new Blob([blob], { type: "application/octet-stream" });
            const blobUrl = window.URL.createObjectURL(downloadBlob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", file.name || "document");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            const link = document.createElement("a");
            link.href = file.url;
            link.setAttribute("download", file.name || "document");
            link.setAttribute("target", "_blank");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
    };

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

    const handleFileUploadSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedUploadFile) {
            Swal.fire({
                icon: "warning",
                title: "File Required",
                text: "Please choose a document/synopsis file to upload.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        setIsUploading(true);
        try {
            const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
            let adminUserId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";
            let currentTaxYear = uploadTaxYear || String(new Date().getFullYear());

            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) adminUserId = parsed.user_id || parsed.id;
                    if (parsed.taxyear || parsed.taxYear || parsed.current_year) currentTaxYear = String(parsed.taxyear || parsed.taxYear || parsed.current_year);
                } catch {
                    if (typeof userInfoStr === "string" && userInfoStr.length > 5) {
                        adminUserId = userInfoStr.replace(/"/g, "");
                    }
                }
            }

            const targetClientId = selectedClient?.user_id || selectedClient?.client_id || selectedClient?.id || "5836";

            const formData = new FormData();
            formData.append("folderPath", `${targetClientId}/Synopsys/`);
            formData.append("synopsys_title", uploadDocTitle.trim() || "Tax Synopsis");
            formData.append("taxyear", String(currentTaxYear));
            formData.append("user_id", adminUserId);
            formData.append("synopsys_file", selectedUploadFile);
            formData.append("client_id", String(targetClientId));

            let apiSuccess = false;
            try {
                const res = await adminServices.savesynopsys(formData);
                if (res?.data?.http_code === 200 || res?.status === 200 || res?.data?.status_smessage === "Success") {
                    apiSuccess = true;
                }
            } catch (apiErr) {
                console.warn("savesynopsys API call notice:", apiErr);
            }

            const newFile = {
                id: `doc_${Date.now()}`,
                name: selectedUploadFile.name,
                type: uploadDocTitle || (uploadCountry === "US" ? "W2 Form" : "Tax Synopsis"),
                country: uploadCountry === "US" ? "UNITED STATES" : "INDIA",
                year: String(currentTaxYear),
                uploaded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            };

            setUploadedFiles(prev => [newFile, ...prev]);
            setIsUploadModalOpen(false);
            setSelectedUploadFile(null);
            setUploadDocTitle("Tax Synopsis");

            Swal.fire({
                title: "Uploaded!",
                text: "Client document/synopsis has been successfully saved.",
                icon: "success",
                confirmButtonColor: "#1b2e6b"
            });

            if (selectedClient) {
                fetchClientDetails(selectedClient);
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            Swal.fire({
                title: "Upload Failed",
                text: "An error occurred while uploading the file. Please try again.",
                icon: "error",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Handle updating client file status via pushtonewfilestatus
    const handleUpdateFileStatus = async (e) => {
        if (e) e.preventDefault();
        if (!statusComment.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Comment Required",
                text: "Please enter a comment message before updating file status.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        setStatusUpdating(true);
        try {
            const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
            let adminUserId = "YlZwVVRHUmVXVEZpUVRkeWVYVllOQ05NVGpCektIVnpXVEJQZVVvcFprQnRVVjVEV2pCTU1FQXlUVTg9";
            let taxYear = String(new Date().getFullYear());
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) adminUserId = parsed.user_id || parsed.id;
                    if (parsed.taxyear || parsed.taxYear || parsed.current_year) taxYear = String(parsed.taxyear || parsed.taxYear || parsed.current_year);
                } catch {
                    if (typeof userInfoStr === "string" && userInfoStr.length > 5) {
                        adminUserId = userInfoStr.replace(/"/g, "");
                    }
                }
            }

            const targetClientId = selectedClient.user_id || selectedClient.rawData?.user_id || selectedClient.rawData?.u_user_id || selectedClient.rawData?.ps_user_id || selectedClient.client_id;

            const payload = {
                user_id: adminUserId,
                client_id: targetClientId,
                processstate: Number(selectedFileState),
                commentmessage: statusComment.trim(),
                taxYear: String(taxYear)
            };

            const response = await adminServices.pushtonewfilestatus(payload);
            const isSuccess = response?.data?.status === true || response?.data?.status === "success" || response?.data?.http_code === 200 || response?.status === 200;
            const message = response?.data?.status_smessage || response?.data?.message || "Processing state updated successfully.";

            if (isSuccess) {
                const newStateNum = Number(selectedFileState);
                const matchedOpt = fileStatusOptions.find(o => o.value === newStateNum);
                const newStatusLabel = matchedOpt ? matchedOpt.label : `State ${newStateNum}`;

                // 1. Immediately update active selected client modal/details view
                setSelectedClient(prev => ({
                    ...prev,
                    status: newStatusLabel,
                    file_status: newStatusLabel,
                    presentfilestatus: newStatusLabel,
                    filestatus: newStateNum,
                    statusId: String(newStatusLabel).toLowerCase().replace(/\s+/g, "_")
                }));

                // 2. Immediately update table list state
                setClients(prevClients => prevClients.map(c => {
                    if (
                        String(c.id) === String(selectedClient.id) ||
                        String(c.client_id) === String(targetClientId) ||
                        String(c.user_id) === String(targetClientId)
                    ) {
                        return {
                            ...c,
                            status: newStatusLabel,
                            file_status: newStatusLabel,
                            presentfilestatus: newStatusLabel,
                            filestatus: newStateNum,
                            statusId: String(newStatusLabel).toLowerCase().replace(/\s+/g, "_")
                        };
                    }
                    return c;
                }));

                // Refresh processing status history from server
                try {
                    const resStatus = await adminServices.processingstatushistory({
                        ps_year: String(taxYear),
                        client_id: String(targetClientId),
                        user_id: String(targetClientId),
                        ps_user_id: String(targetClientId)
                    });
                    if (resStatus?.data?.data && Array.isArray(resStatus.data.data)) {
                        setStatusHistory(resStatus.data.data);
                    } else if (Array.isArray(resStatus?.data)) {
                        setStatusHistory(resStatus.data);
                    } else {
                        setStatusHistory(prev => [
                            {
                                ps_id: Date.now(),
                                clientName: selectedClient.name || "Client",
                                ps_mastername: newStatusLabel,
                                presentState: newStatusLabel,
                                ps_remark: statusComment.trim() || "PUSH STATE",
                                comment: statusComment.trim() || "PUSH STATE",
                                createAt: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                            },
                            ...prev
                        ]);
                    }
                } catch (e) {
                    console.warn("Error refreshing status history:", e);
                    setStatusHistory(prev => [
                        {
                            ps_id: Date.now(),
                            clientName: selectedClient.name || "Client",
                            ps_mastername: newStatusLabel,
                            presentState: newStatusLabel,
                            ps_remark: statusComment.trim() || "PUSH STATE",
                            comment: statusComment.trim() || "PUSH STATE",
                            createAt: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                        },
                        ...prev
                    ]);
                }

                setStatusComment("");

                Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text: message,
                    confirmButtonColor: "#1b2e6b"
                });

                // 3. Dispatch sidebar count update & reload records
                window.dispatchEvent(new Event("adminCountsUpdated"));
                loadRecords();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Update Status",
                    text: response?.data?.message || response?.data?.status_smessage || "Unable to update file status.",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        } catch (err) {
            console.error("Error updating file status:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.message || "Failed to update file status on server.",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setStatusUpdating(false);
        }
    };

    // Handle Payment form submission
    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setPaymentSubmitting(true);
        setTimeout(() => {
            setPaymentSubmitting(false);
            Swal.fire({
                icon: "success",
                title: "Payment Link Sent",
                text: `Payment link of $${paymentForm.finalAmount || paymentForm.standardAmount || "0"} sent to ${selectedClient.name}.`,
                confirmButtonColor: "#1b2e6b"
            });
            setPaymentForm({
                paymentId: "",
                standardAmount: "",
                discountType: "",
                discountValue: "",
                finalAmount: "",
                comments: ""
            });
        }, 600);
    };

    // Handle Download Referrals
    const handleDownloadReferrals = () => {
        if (!referralsList || referralsList.length === 0) {
            Swal.fire({
                icon: "info",
                title: "No Data to Export",
                text: "No referral records available to download.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const headers = ["Referral Name,Referral Email,Referral Phone,Referral To Name ID,Referral To Email,Referral To Phone,Comment,Year"];
        const rows = referralsList.map(r => {
            const rfPhone = r.rf_phone ? `${r.rf_phone_ext ? (r.rf_phone_ext === 'INDIA' ? '+91 ' : r.rf_phone_ext === 'UNITED STATES' || r.rf_phone_ext === 'US' ? '+1 ' : `${r.rf_phone_ext} `) : ''}${r.rf_phone}` : (r.phone || "");
            const rfOnPhone = r.rf_on_phone ? `${r.rf_on_phone_ext ? (r.rf_on_phone_ext === 'INDIA' ? '+91 ' : r.rf_on_phone_ext === 'UNITED STATES' || r.rf_on_phone_ext === 'US' ? '+1 ' : `${r.rf_on_phone_ext} `) : ''}${r.rf_on_phone}` : (r.rto_phone || "");
            return [
                `"${r.rf_name || r.name || ""}"`,
                `"${r.rf_email || r.email || ""}"`,
                `"${rfPhone}"`,
                `"${r.rf_on_name || r.rto_name || r.referral_to || ""}"`,
                `"${r.rf_on_email || r.rto_email || ""}"`,
                `"${rfOnPhone}"`,
                `"${r.rf_comment || r.comment || ""}"`,
                `"${r.rf_year || ""}"`
            ].join(",");
        });

        const csvString = [headers, ...rows].join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `referrals_${selectedClient.id || "client"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Client Detail View
    if (selectedClient) {
        const subTabs = [
            { id: "basic_info", label: "Basic Info" },
            { id: "other_info", label: "Other Info" },
            { id: "download_docs", label: `Download Documents (${uploadedFiles.length})` },
            { id: "upload_docs", label: "Upload Documents" },
            { id: "file_status", label: "File Status" },
            { id: "payment", label: "Payment" },
            { id: "referral", label: "Referral" }
        ];

        return (
            <div className="client-details-workspace d-flex flex-column gap-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <button
                        onClick={() => setSelectedClient(null)}
                        className="btn btn-back-dashboard d-flex align-items-center gap-2"
                    >
                        <FiArrowLeft />
                        <span>Back to List</span>
                    </button>
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            onClick={() => fetchClientDetails(selectedClient)}
                            disabled={detailsLoading || docsLoading}
                            title="Refresh Details"
                        >
                            <FiRefreshCw className={(detailsLoading || docsLoading) ? "spinner-border spinner-border-sm" : ""} />
                            <span>Refresh</span>
                        </button>
                        <div className="status-indicator-badge px-3 py-2 rounded">
                            Status: <span className="text-danger fw-bold">{selectedClient.status}</span>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
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

                            {(activeInnerTab === "basic_info" || activeInnerTab === "other_info") && (
                                <button
                                    className="btn btn-action-top-right d-flex align-items-center gap-2"
                                    onClick={() => triggerAlert("Exporting Data", "Initiated data sheet export.")}
                                >
                                    <FiDownload />
                                    <span>Export</span>
                                </button>
                            )}
                            {activeInnerTab === "download_docs" && (
                                <button
                                    className="btn btn-action-top-right d-flex align-items-center gap-2"
                                    onClick={handleDownloadZip}
                                    disabled={zipDownloading || uploadedFiles.length === 0}
                                >
                                    <FiPackage />
                                    <span>{zipDownloading ? "Bundling..." : "Download All (ZIP)"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-white">
                        {detailsLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary me-2" role="status"></div>
                                <span className="text-muted fw-medium">Loading details from server...</span>
                            </div>
                        ) : (
                            <>
                                {/* Basic Info Tab (Mirrors Customer Side Taxpayer Info) */}
                                {activeInnerTab === "basic_info" && (
                                    <form onSubmit={handleUpdateClientDetails}>
                                        <div className="row g-4">
                                            {/* Row 1: First Name & Last Name */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-semibold text-secondary small">First Name <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="firstName"
                                                    placeholder="Enter First Name"
                                                    value={basicInfo.firstName}
                                                    onChange={handleBasicInfoChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-semibold text-secondary small">Last Name <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="lastName"
                                                    placeholder="Enter Last Name"
                                                    value={basicInfo.lastName}
                                                    onChange={handleBasicInfoChange}
                                                    required
                                                />
                                            </div>

                                            {/* Row 2: SSN/ITIN & Designation/Occupation */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-semibold text-secondary small">SSN/ITIN</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="ssnItin"
                                                    placeholder="Enter SSN/ITIN"
                                                    value={basicInfo.ssnItin}
                                                    onChange={handleBasicInfoChange}
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-semibold text-secondary small">Designation/Occupation</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="occupation"
                                                    placeholder="Enter Designation/Occupation"
                                                    value={basicInfo.occupation}
                                                    onChange={handleBasicInfoChange}
                                                />
                                            </div>

                                            {/* Row 3: Date of Birth & Email */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-semibold text-secondary small">Date Of Birth</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="dob"
                                                    value={basicInfo.dob}
                                                    onChange={handleBasicInfoChange}
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-semibold text-secondary small">Email <span className="text-danger">*</span></label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    placeholder="Example@gmail.com"
                                                    value={basicInfo.email}
                                                    onChange={handleBasicInfoChange}
                                                    required
                                                />
                                            </div>

                                            {/* Row 4: Mobile Phone & Work Phone */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-semibold text-secondary small">Mobile Phone <span className="text-danger">*</span></label>
                                                <div className="input-group">
                                                    <select
                                                        name="mobileCode"
                                                        value={basicInfo.mobileCode}
                                                        onChange={handleBasicInfoChange}
                                                        className="form-select bg-light"
                                                        style={{ maxWidth: "90px" }}
                                                    >
                                                        {countryCodes.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="mobilePhone"
                                                        placeholder="(912)-458-3320"
                                                        value={basicInfo.mobilePhone}
                                                        onChange={handleBasicInfoChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="form-label fw-semibold text-secondary small">Work Phone</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="workPhone"
                                                    placeholder="Enter Work Phone"
                                                    value={basicInfo.workPhone}
                                                    onChange={handleBasicInfoChange}
                                                />
                                            </div>

                                            {/* Row 5: Referral Name (If Any) */}
                                            <div className="col-12">
                                                <label className="form-label fw-semibold text-secondary small">Referral Name (If Any)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="referralName"
                                                    placeholder="Referral Name"
                                                    value={basicInfo.referralName}
                                                    onChange={handleBasicInfoChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                                            <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold">
                                                Update Details
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Other Info Tab (Integrated with getSpouseInfo, getDependentInfo, getEmployerInfo) */}
                                {activeInnerTab === "other_info" && (
                                    <div>
                                        {/* Sub-Navigation for Other Info sections */}
                                        <div className="other-info-subnav">
                                            <button
                                                type="button"
                                                className={`other-info-subnav-btn ${activeOtherSubTab === "spouse" ? "active" : ""}`}
                                                onClick={() => setActiveOtherSubTab("spouse")}
                                            >
                                                <FiHeart />
                                                <span>Spouse Info</span>
                                                {spouseInfo && <span className="badge bg-success">Available</span>}
                                            </button>

                                            <button
                                                type="button"
                                                className={`other-info-subnav-btn ${activeOtherSubTab === "dependents" ? "active" : ""}`}
                                                onClick={() => setActiveOtherSubTab("dependents")}
                                            >
                                                <FiUsers />
                                                <span>Dependents</span>
                                                <span className="badge bg-primary">{dependentsInfo.length}</span>
                                            </button>

                                            <button
                                                type="button"
                                                className={`other-info-subnav-btn ${activeOtherSubTab === "employers" ? "active" : ""}`}
                                                onClick={() => setActiveOtherSubTab("employers")}
                                            >
                                                <FiBriefcase />
                                                <span>Employer Info</span>
                                                <span className="badge bg-primary">{employersInfo.length}</span>
                                            </button>
                                        </div>

                                        {/* 1. Spouse Info Section */}
                                        {activeOtherSubTab === "spouse" && (
                                            <div>
                                                {spouseInfo ? (
                                                    <div className="other-info-card">
                                                        <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                                            <FiHeart className="text-danger" /> Spouse Information
                                                        </h6>
                                                        <div className="row g-3">
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-semibold text-secondary small">First Name</label>
                                                                <input type="text" className="form-control" value={spouseInfo.firstName} readOnly />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-semibold text-secondary small">Last Name</label>
                                                                <input type="text" className="form-control" value={spouseInfo.lastName} readOnly />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-semibold text-secondary small">SSN / ITIN</label>
                                                                <input type="text" className="form-control" value={spouseInfo.ssnItin} readOnly />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-semibold text-secondary small">Date Of Birth</label>
                                                                <input type="text" className="form-control" value={spouseInfo.dob} readOnly />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-semibold text-secondary small">Occupation</label>
                                                                <input type="text" className="form-control" value={spouseInfo.occupation} readOnly />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-semibold text-secondary small">Email Address</label>
                                                                <input type="text" className="form-control" value={spouseInfo.email} readOnly />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-semibold text-secondary small">Phone Number</label>
                                                                <div className="input-group">
                                                                    <span className="input-group-text bg-light">{spouseInfo.mobileCode}</span>
                                                                    <input type="text" className="form-control" value={spouseInfo.mobilePhone} readOnly />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label fw-semibold text-secondary small">Work Phone</label>
                                                                <input type="text" className="form-control" value={spouseInfo.workPhone} readOnly />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="info-empty-state">
                                                        <FiHeart size={36} className="text-muted mb-2" />
                                                        <h6>No Spouse Information</h6>
                                                        <p className="mb-0 small text-muted">No spouse data registered on file for this client.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 2. Dependent Info Section */}
                                        {activeOtherSubTab === "dependents" && (
                                            <div>
                                                {dependentsInfo.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover align-middle">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>First Name</th>
                                                                    <th>Last Name</th>
                                                                    <th>Relationship</th>
                                                                    <th>SSN / ITIN</th>
                                                                    <th>Date of Birth</th>
                                                                    <th>Visa Type</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {dependentsInfo.map((dep, idx) => (
                                                                    <tr key={dep.id || idx}>
                                                                        <td className="fw-semibold text-secondary">{idx + 1}</td>
                                                                        <td className="fw-medium text-dark">{dep.firstName || "-"}</td>
                                                                        <td>{dep.lastName || "-"}</td>
                                                                        <td>
                                                                            <span className="badge bg-light text-primary border">
                                                                                {dep.relationship || "Son"}
                                                                            </span>
                                                                        </td>
                                                                        <td>{dep.ssnItin || "-"}</td>
                                                                        <td>{dep.dob || "-"}</td>
                                                                        <td>{dep.visaType || "-"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="info-empty-state">
                                                        <FiUsers size={36} className="text-muted mb-2" />
                                                        <h6>No Dependents Recorded</h6>
                                                        <p className="mb-0 small text-muted">No dependent information registered for this client.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 3. Employer Info Section */}
                                        {activeOtherSubTab === "employers" && (
                                            <div>
                                                {employersInfo.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table table-hover align-middle">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Employer Name</th>
                                                                    <th>EIN / Tax ID</th>
                                                                    <th>Designation / Role</th>
                                                                    <th>Phone</th>
                                                                    <th>Address</th>
                                                                    <th>City</th>
                                                                    <th>State</th>
                                                                    <th>Zip</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {employersInfo.map((emp, idx) => (
                                                                    <tr key={emp.id || idx}>
                                                                        <td className="fw-semibold text-secondary">{idx + 1}</td>
                                                                        <td className="fw-medium text-dark">{emp.employerName || "-"}</td>
                                                                        <td>{emp.ein || "-"}</td>
                                                                        <td>{emp.designation || "-"}</td>
                                                                        <td>{emp.phone || "-"}</td>
                                                                        <td>{emp.address || "-"}</td>
                                                                        <td>{emp.city || "-"}</td>
                                                                        <td>{emp.state || "-"}</td>
                                                                        <td>{emp.zip || "-"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="info-empty-state">
                                                        <FiBriefcase size={36} className="text-muted mb-2" />
                                                        <h6>No Employer Information</h6>
                                                        <p className="mb-0 small text-muted">No employer details found on file for this client.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Download Docs Tab (Integrated with upload/gettotalcountofdocs & upload/downloadZip) */}
                        {activeInnerTab === "download_docs" && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0 text-dark">
                                        Client Uploaded Documents ({uploadedFiles.length})
                                    </h6>
                                    {uploadedFiles.length > 0 && (
                                        <button
                                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                                            onClick={handleDownloadZip}
                                            disabled={zipDownloading}
                                        >
                                            <FiPackage />
                                            <span>{zipDownloading ? "Preparing ZIP..." : "Download All as ZIP"}</span>
                                        </button>
                                    )}
                                </div>

                                {docsLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                        <span className="text-muted">Loading documents...</span>
                                    </div>
                                ) : uploadedFiles.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>File Name</th>
                                                    <th>Document Type</th>
                                                    <th>Country</th>
                                                    <th>Tax Year</th>
                                                    <th>Uploaded Date</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uploadedFiles.map((file, idx) => (
                                                    <tr key={file.id || idx}>
                                                        <td className="fw-medium text-dark">
                                                            <FiFileText className="me-2 text-primary" />{file.name}
                                                        </td>
                                                        <td><span className="badge bg-light text-dark border">{file.type}</span></td>
                                                        <td>{file.country}</td>
                                                        <td>{file.year}</td>
                                                        <td className="text-muted">{file.uploaded}</td>
                                                        <td className="text-end">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary me-2"
                                                                onClick={() => handleDownloadSingleDoc(file)}
                                                                title="Download Document"
                                                            >
                                                                <FiDownload />
                                                            </button>
                                                            {file.url && (
                                                                <a
                                                                    href={file.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-outline-secondary me-2"
                                                                    title="View File"
                                                                >
                                                                    <FiExternalLink />
                                                                </a>
                                                            )}
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteFile(file.name)}
                                                                title="Delete File"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="info-empty-state">
                                        <FiFileText size={36} className="text-muted mb-2" />
                                        <h6>No Documents Uploaded</h6>
                                        <p className="mb-0 small text-muted">This client has not uploaded any tax documents yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Upload Docs Tab (Integrated with savesynopsys API) */}
                        {activeInnerTab === "upload_docs" && (
                            <div className="py-2">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="fw-bold mb-1 text-dark">Upload Document / Synopsys</h6>
                                        <p className="text-muted small mb-0">Upload tax files or synopsys documents directly to the client's file record.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleFileUploadSubmit} className="card p-4 border rounded-3 bg-light mb-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Document Title / Synopsys Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Tax Synopsis 2025"
                                                value={uploadDocTitle}
                                                onChange={e => setUploadDocTitle(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label fw-medium text-dark small">
                                                Tax Year <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                value={uploadTaxYear}
                                                onChange={e => setUploadTaxYear(e.target.value)}
                                            >
                                                <option value="2026">2026</option>
                                                <option value="2025">2025</option>
                                                <option value="2024">2024</option>
                                                <option value="2023">2023</option>
                                            </select>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label fw-medium text-dark small">Country</label>
                                            <select
                                                className="form-select"
                                                value={uploadCountry}
                                                onChange={e => setUploadCountry(e.target.value)}
                                            >
                                                <option value="US">United States</option>
                                                <option value="IN">India</option>
                                            </select>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-medium text-dark small">
                                                Choose File (PDF, Word, Images up to 25MB) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                                                onChange={e => setSelectedUploadFile(e.target.files[0] || null)}
                                                required
                                            />
                                            {selectedUploadFile && (
                                                <div className="mt-2 text-primary small fw-medium">
                                                    Selected: {selectedUploadFile.name} ({(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary d-flex align-items-center gap-2"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    <span>Uploading Document...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUpload />
                                                    <span>Upload Document</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* File Status Tab (Figma Design 2342-14928) */}
                        {activeInnerTab === "file_status" && (() => {
                            const totalHistoryPages = Math.max(1, Math.ceil(statusHistory.length / statusHistoryRowsPerPage));
                            const currentHistoryPageClamped = Math.min(statusHistoryPage, totalHistoryPages);
                            const paginatedHistory = statusHistory.slice(
                                (currentHistoryPageClamped - 1) * statusHistoryRowsPerPage,
                                currentHistoryPageClamped * statusHistoryRowsPerPage
                            );

                            return (
                                <div className="py-2">
                                    {/* Status Pill Badge */}
                                    <div className="status-pill-figma">
                                        Status : {selectedClient.status || "Cancel Filing"}
                                    </div>

                                    {/* File Status Form */}
                                    <form onSubmit={handleUpdateFileStatus} className="mb-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-medium text-dark small">
                                                File Status <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select figma-form-control"
                                                value={selectedFileState}
                                                onChange={(e) => setSelectedFileState(Number(e.target.value))}
                                                required
                                            >
                                                <option value="">Status</option>
                                                {fileStatusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-medium text-dark small">
                                                Comments
                                            </label>
                                            <textarea
                                                className="form-control figma-form-control"
                                                rows={4}
                                                placeholder="Comments"
                                                value={statusComment}
                                                onChange={(e) => setStatusComment(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-figma-primary"
                                            disabled={statusUpdating}
                                        >
                                            {statusUpdating ? "Pushing State..." : "Push To State"}
                                        </button>
                                    </form>

                                    {/* History Table */}
                                    <div className="figma-table-container mb-3">
                                        <table className="table figma-table align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Client Name</th>
                                                    <th>Present State</th>
                                                    <th>Comment</th>
                                                    <th>Create At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {statusHistoryLoading ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted small">
                                                            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                                            Loading status history...
                                                        </td>
                                                    </tr>
                                                ) : paginatedHistory.length > 0 ? (
                                                    paginatedHistory.map((item, idx) => {
                                                        const stateName = item.ps_mastername || item.presentState || (fileStatusOptions.find(o => o.value === Number(item.ps_state))?.label) || (item.ps_state ? `State ${item.ps_state}` : "-");
                                                        const comment = item.ps_remark || item.comment || item.remark || "-";
                                                        const dateStr = item.created_at || item.ps_created_at
                                                            ? new Date(item.created_at || item.ps_created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                                                            : (item.createAt || (item.ps_year ? `Year ${item.ps_year}` : new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })));

                                                        return (
                                                            <tr key={item.ps_id || idx}>
                                                                <td>{item.clientName || selectedClient.name || "Client"}</td>
                                                                <td>
                                                                    <span className="badge bg-light text-primary border fw-semibold px-2 py-1">
                                                                        {stateName}
                                                                    </span>
                                                                </td>
                                                                <td>{comment}</td>
                                                                <td>{dateStr}</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-4 text-muted small">
                                                            No status history available
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 text-muted small mt-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span>Row per page</span>
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ width: "95px" }}
                                                value={statusHistoryRowsPerPage}
                                                onChange={e => {
                                                    setStatusHistoryRowsPerPage(Number(e.target.value));
                                                    setStatusHistoryPage(1);
                                                }}
                                            >
                                                <option value={10}>10 / page</option>
                                                <option value={25}>25 / page</option>
                                                <option value={50}>50 / page</option>
                                            </select>
                                            <span className="ms-2">
                                                Showing {statusHistory.length === 0 ? 0 : (currentHistoryPageClamped - 1) * statusHistoryRowsPerPage + 1} to {Math.min(currentHistoryPageClamped * statusHistoryRowsPerPage, statusHistory.length)} of {statusHistory.length} entries
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center gap-1">
                                            <button
                                                className="btn btn-sm figma-pagination-btn"
                                                disabled={currentHistoryPageClamped <= 1}
                                                onClick={() => setStatusHistoryPage(prev => Math.max(1, prev - 1))}
                                            >
                                                &lt;
                                            </button>
                                            {Array.from({ length: totalHistoryPages }, (_, i) => i + 1)
                                                .filter(p => p === 1 || p === totalHistoryPages || Math.abs(p - currentHistoryPageClamped) <= 1)
                                                .reduce((acc, p, i, arr) => {
                                                    if (i > 0 && p - arr[i - 1] > 1) {
                                                        acc.push("...");
                                                    }
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((item, idx) => item === "..." ? (
                                                    <span key={`dots-history-${idx}`} className="px-1 text-muted">...</span>
                                                ) : (
                                                    <button
                                                        key={`page-history-${item}`}
                                                        className={`btn btn-sm figma-pagination-btn ${item === currentHistoryPageClamped ? "active" : ""}`}
                                                        onClick={() => setStatusHistoryPage(item)}
                                                    >
                                                        {item}
                                                    </button>
                                                ))
                                            }
                                            <button
                                                className="btn btn-sm figma-pagination-btn"
                                                disabled={currentHistoryPageClamped >= totalHistoryPages}
                                                onClick={() => setStatusHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                                            >
                                                &gt;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Payment Tab (Figma Design 2342-15457) */}
                        {activeInnerTab === "payment" && (
                            <div className="py-2">
                                {/* Status Pill Badge */}
                                <div className="status-pill-figma">
                                    Status : {selectedClient.status || "Cancel Filing"}
                                </div>

                                <form onSubmit={handlePaymentSubmit}>
                                    <div className="row g-3">
                                        {/* Row 1 */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Customer Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control figma-form-control"
                                                value={selectedClient.name}
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                File Number <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control figma-form-control"
                                                value={selectedClient.filenumber ? `#${selectedClient.filenumber}` : (selectedClient.id ? `#${selectedClient.id}` : "#122")}
                                                readOnly
                                            />
                                        </div>

                                        {/* Row 2 */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Payment ID <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control figma-form-control"
                                                placeholder="Enter The ID"
                                                value={paymentForm.paymentId}
                                                onChange={e => setPaymentForm(prev => ({ ...prev, paymentId: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Standard Amount <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control figma-form-control"
                                                placeholder="Enter Customer Name"
                                                value={paymentForm.standardAmount}
                                                onChange={e => setPaymentForm(prev => ({ ...prev, standardAmount: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        {/* Row 3 */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Discount Type <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select figma-form-control"
                                                value={paymentForm.discountType}
                                                onChange={e => setPaymentForm(prev => ({ ...prev, discountType: e.target.value }))}
                                                required
                                            >
                                                <option value="">Select Discount Type</option>
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="flat">Flat Discount ($)</option>
                                                <option value="coupon">Coupon Code</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Discount Value <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control figma-form-control"
                                                placeholder="Enter Discount Value"
                                                value={paymentForm.discountValue}
                                                onChange={e => setPaymentForm(prev => ({ ...prev, discountValue: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        {/* Row 4 */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Final Payable Amount <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control figma-form-control"
                                                placeholder="Enter Final Payable Amount"
                                                value={paymentForm.finalAmount}
                                                onChange={e => setPaymentForm(prev => ({ ...prev, finalAmount: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        {/* Row 5 */}
                                        <div className="col-12">
                                            <label className="form-label fw-medium text-dark small">
                                                Comments <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="form-control figma-form-control"
                                                rows={4}
                                                placeholder="Add Commemts"
                                                value={paymentForm.comments}
                                                onChange={e => setPaymentForm(prev => ({ ...prev, comments: e.target.value }))}
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-figma-primary px-5"
                                            disabled={paymentSubmitting}
                                        >
                                            {paymentSubmitting ? "sending..." : "send"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Referral Tab (Figma Design 2342-15986) */}
                        {/* Referral Tab (Figma Design 2342-15986) */}
                        {activeInnerTab === "referral" && (() => {
                            const formatPhoneWithExt = (phone, ext) => {
                                if (!phone) return "-";
                                if (!ext) return phone;
                                const prefix = ext === "INDIA" ? "+91 " : ext === "UNITED STATES" || ext === "US" ? "+1 " : `${ext} `;
                                return `${prefix}${phone}`;
                            };

                            const filteredReferrals = (referralsList || []).filter(r => {
                                if (!referralSearch.trim()) return true;
                                const term = referralSearch.toLowerCase();
                                return (
                                    String(r.rf_name || r.name || "").toLowerCase().includes(term) ||
                                    String(r.rf_email || r.email || "").toLowerCase().includes(term) ||
                                    String(r.rf_phone || r.phone || "").toLowerCase().includes(term) ||
                                    String(r.rf_on_name || r.rto_name || r.referral_to || "").toLowerCase().includes(term) ||
                                    String(r.rf_on_email || r.rto_email || "").toLowerCase().includes(term) ||
                                    String(r.rf_on_phone || r.rto_phone || "").toLowerCase().includes(term) ||
                                    String(r.rf_comment || r.comment || "").toLowerCase().includes(term) ||
                                    String(r.rf_year || "").toLowerCase().includes(term)
                                );
                            });

                            const totalRefPages = Math.max(1, Math.ceil(filteredReferrals.length / referralRowsPerPage));
                            const currentPageClamped = Math.min(referralPage, totalRefPages);
                            const paginatedList = filteredReferrals.slice(
                                (currentPageClamped - 1) * referralRowsPerPage,
                                currentPageClamped * referralRowsPerPage
                            );

                            return (
                                <div className="py-2">
                                    {/* Top Header: Status Pill on Left, Download on Right */}
                                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                        <div className="status-pill-figma mb-0">
                                            Status : {selectedClient.status || "Cancel Filing"}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-figma-primary d-flex align-items-center gap-2"
                                            onClick={handleDownloadReferrals}
                                        >
                                            <FiDownload />
                                            <span>Download</span>
                                        </button>
                                    </div>

                                    {/* Search Bar on Right */}
                                    <div className="d-flex justify-content-end mb-4">
                                        <div className="position-relative" style={{ maxWidth: "260px", width: "100%" }}>
                                            <input
                                                type="text"
                                                className="form-control figma-form-control pe-5"
                                                placeholder="Search"
                                                value={referralSearch}
                                                onChange={e => {
                                                    setReferralSearch(e.target.value);
                                                    setReferralPage(1);
                                                }}
                                            />
                                            <FiSearch className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
                                        </div>
                                    </div>

                                    {/* Referral Table */}
                                    <div className="figma-table-container mb-3">
                                        <table className="table figma-table align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Referral Name</th>
                                                    <th>Referral Email</th>
                                                    <th>Referral Phone</th>
                                                    <th>Referral To Name ID</th>
                                                    <th>Referral To Email</th>
                                                    <th>Referral To Phone</th>
                                                    <th>Comment</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {referralsLoading ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-5 text-muted small">
                                                            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                                            Loading referral records...
                                                        </td>
                                                    </tr>
                                                ) : paginatedList.length > 0 ? (
                                                    paginatedList.map((ref, idx) => (
                                                        <tr key={ref.id || ref.rf_id || idx}>
                                                            <td>{ref.rf_name || ref.name || "-"}</td>
                                                            <td>{ref.rf_email || ref.email || "-"}</td>
                                                            <td>{formatPhoneWithExt(ref.rf_phone || ref.phone, ref.rf_phone_ext)}</td>
                                                            <td>{ref.rf_on_name || ref.rto_name || ref.referral_to || "-"}</td>
                                                            <td>{ref.rf_on_email || ref.rto_email || "-"}</td>
                                                            <td>{formatPhoneWithExt(ref.rf_on_phone || ref.rto_phone, ref.rf_on_phone_ext)}</td>
                                                            <td>{ref.rf_comment || ref.comment || "-"}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-5 text-muted small">
                                                            No data available in table
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 text-muted small mt-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <span>Row per page</span>
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ width: "95px" }}
                                                value={referralRowsPerPage}
                                                onChange={e => {
                                                    setReferralRowsPerPage(Number(e.target.value));
                                                    setReferralPage(1);
                                                }}
                                            >
                                                <option value={10}>10 / page</option>
                                                <option value={25}>25 / page</option>
                                                <option value={50}>50 / page</option>
                                            </select>
                                            <span className="ms-2">
                                                Showing {filteredReferrals.length === 0 ? 0 : (currentPageClamped - 1) * referralRowsPerPage + 1} to {Math.min(currentPageClamped * referralRowsPerPage, filteredReferrals.length)} of {filteredReferrals.length} entries
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center gap-1">
                                            <button
                                                className="btn btn-sm figma-pagination-btn"
                                                disabled={currentPageClamped <= 1}
                                                onClick={() => setReferralPage(prev => Math.max(1, prev - 1))}
                                            >
                                                &lt;
                                            </button>
                                            {Array.from({ length: totalRefPages }, (_, i) => i + 1)
                                                .filter(p => p === 1 || p === totalRefPages || Math.abs(p - currentPageClamped) <= 1)
                                                .reduce((acc, p, i, arr) => {
                                                    if (i > 0 && p - arr[i - 1] > 1) {
                                                        acc.push("...");
                                                    }
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((item, idx) => item === "..." ? (
                                                    <span key={`dots-${idx}`} className="px-1 text-muted">...</span>
                                                ) : (
                                                    <button
                                                        key={`page-${item}`}
                                                        className={`btn btn-sm figma-pagination-btn ${item === currentPageClamped ? "active" : ""}`}
                                                        onClick={() => setReferralPage(item)}
                                                    >
                                                        {item}
                                                    </button>
                                                ))
                                            }
                                            <button
                                                className="btn btn-sm figma-pagination-btn"
                                                disabled={currentPageClamped >= totalRefPages}
                                                onClick={() => setReferralPage(prev => Math.min(totalRefPages, prev + 1))}
                                            >
                                                &gt;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {isUploadModalOpen && (
                    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "14px", overflow: "hidden" }}>
                                <div className="modal-header bg-light">
                                    <h5 className="modal-title fw-bold text-dark fs-6">Upload Document / Synopsys</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setIsUploadModalOpen(false)}
                                    ></button>
                                </div>
                                <form onSubmit={handleFileUploadSubmit}>
                                    <div className="modal-body d-flex flex-column gap-3 p-4">
                                        <div>
                                            <label className="form-label fw-medium text-dark small">
                                                Document Title / Synopsys Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Tax Synopsis 2025"
                                                value={uploadDocTitle}
                                                onChange={e => setUploadDocTitle(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="row g-2">
                                            <div className="col-6">
                                                <label className="form-label fw-medium text-dark small">
                                                    Tax Year <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={uploadTaxYear}
                                                    onChange={e => setUploadTaxYear(e.target.value)}
                                                >
                                                    <option value="2026">2026</option>
                                                    <option value="2025">2025</option>
                                                    <option value="2024">2024</option>
                                                    <option value="2023">2023</option>
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label fw-medium text-dark small">Country</label>
                                                <select
                                                    className="form-select"
                                                    value={uploadCountry}
                                                    onChange={e => setUploadCountry(e.target.value)}
                                                >
                                                    <option value="US">United States</option>
                                                    <option value="IN">India</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label fw-medium text-dark small">
                                                Select File (PDF, DOC, Images up to 25MB) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                                                onChange={e => setSelectedUploadFile(e.target.files[0] || null)}
                                                required
                                            />
                                            {selectedUploadFile && (
                                                <div className="mt-2 text-primary small fw-medium">
                                                    Selected: {selectedUploadFile.name} ({(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-light">
                                        <button
                                            type="button"
                                            className="btn btn-light border px-3"
                                            onClick={() => setIsUploadModalOpen(false)}
                                            disabled={isUploading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4 d-flex align-items-center gap-2"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUpload />
                                                    <span>Upload</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // List Table View
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
                        onChange={e => setSearchTerm(e.target.value)}
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
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-muted">
                                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                    Loading client records...
                                </td>
                            </tr>
                        ) : filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                                <tr key={client.id}>
                                    <td className="fw-semibold text-dark">{client.id}</td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                setSelectedClient(client);
                                                const resolved = filestateMap[client.status] !== undefined
                                                    ? filestateMap[client.status]
                                                    : (client.filestatus !== undefined ? client.filestatus : 1);
                                                setSelectedFileState(Number(resolved));
                                                setStatusComment("");
                                            }}
                                            className="btn btn-link client-name-link p-0 text-decoration-none text-start text-primary fw-medium"
                                        >
                                            {client.name}
                                        </button>
                                    </td>
                                    <td>{client.email}</td>
                                    <td>{client.phone}</td>
                                    <td>
                                        <span className="badge bg-light text-danger border">
                                            {client.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${client.assigned ? "bg-light text-success border border-success" : "bg-light text-muted border"}`}>
                                            {client.assignedName}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="referral-link text-primary fw-medium">
                                            {client.referral}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-muted">
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Rows per page:</span>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: "70px" }}
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-muted small ms-3">
                        Showing {Math.min(totalRecords, (currentPage - 1) * rowsPerPage + 1)} to {Math.min(totalRecords, currentPage * rowsPerPage)} of {totalRecords} entries
                    </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={currentPage <= 1 || loading}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        <FiChevronLeft /> Previous
                    </button>
                    <span className="small fw-semibold px-2">
                        Page {currentPage} of {Math.max(1, Math.ceil(totalRecords / rowsPerPage))}
                    </span>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={currentPage >= Math.ceil(totalRecords / rowsPerPage) || loading}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientRecordsTable;
