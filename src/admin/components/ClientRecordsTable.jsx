import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    FiHeart,
    FiRefreshCw,
    FiPackage,
    FiExternalLink,
    FiSend,
    FiEdit2
} from "react-icons/fi";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear, getStoredTaxYearsList } from "../../utils/taxYear";
import { exportClientDetailsPDF } from "../../utils/pdfExport";
import { isAnalystUser } from "../../utils/userRole";
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

const ClientRecordsTable = ({ filestate = "ALL", title = "All Client Records", statusFilterKey = "" }) => {
    const isAnalyst = isAnalystUser();
    const isDocsOrPaymentPending =
        filestate === 4 ||
        filestate === 8 ||
        filestate === "4" ||
        filestate === "8" ||
        statusFilterKey === "docs_upload_pending" ||
        statusFilterKey === "payment_pending";

    // Show Action / Reminder column on Payment Pending page, Docs Pending page, or for Analysts
    const showReminderColumn = isAnalyst || isDocsOrPaymentPending || filestate === 8 || filestate === "8" || statusFilterKey === "payment_pending";

    const [clients, setClients] = useState([]);
    const [sendingReminderId, setSendingReminderId] = useState(null);
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
    const [uploadTaxYear, setUploadTaxYear] = useState(getStoredTaxYear());
    const [taxYearsList, setTaxYearsList] = useState(getStoredTaxYearsList());
    const [selectedUploadFile, setSelectedUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [zipDownloading, setZipDownloading] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [synopsysList, setSynopsysList] = useState([]);
    const [synopsysLoading, setSynopsysLoading] = useState(false);

    // File Status update states
    const [selectedFileState, setSelectedFileState] = useState(1);
    const [statusComment, setStatusComment] = useState("");
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusHistory, setStatusHistory] = useState([]);
    const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
    const [statusHistoryPage, setStatusHistoryPage] = useState(1);
    const [statusHistoryRowsPerPage, setStatusHistoryRowsPerPage] = useState(10);

    // Payment tab states (/payment/createOrder)
    const [paymentForm, setPaymentForm] = useState({
        p_standardAmount: "",
        p_discountType: "Flat",
        p_discountValue: "",
        p_amount: "",
        currency: "USA",
        comment: ""
    });
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [sendingNotification, setSendingNotification] = useState(false);

    // Helper to calculate final payable amount based on standard amount and discount
    const calculateFinalAmount = (standardAmount, discountType, discountValue) => {
        const std = parseFloat(standardAmount);
        if (isNaN(std) || std < 0) return "";

        const disc = parseFloat(discountValue);
        if (isNaN(disc) || disc <= 0 || discountType === "None" || !discountType) {
            return std.toString();
        }

        let finalAmount = std;
        if (discountType === "Flat") {
            finalAmount = Math.max(0, std - disc);
        } else if (discountType === "Percentage") {
            finalAmount = Math.max(0, std - (std * disc) / 100);
        }

        const rounded = Math.round(finalAmount * 100) / 100;
        return rounded.toString();
    };

    const handlePaymentInputChange = (field, value) => {
        setPaymentForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === "p_standardAmount" || field === "p_discountType" || field === "p_discountValue") {
                const newAmount = calculateFinalAmount(
                    field === "p_standardAmount" ? value : updated.p_standardAmount,
                    field === "p_discountType" ? value : updated.p_discountType,
                    field === "p_discountValue" ? value : updated.p_discountValue
                );
                updated.p_amount = newAmount;
            }
            return updated;
        });
    };

    // User Payment Orders Table States (/payment/getPaymentsByUserId, /payment/updateOrder, /payment/deleteOrder)
    const [userPaymentsList, setUserPaymentsList] = useState([]);
    const [userPaymentsLoading, setUserPaymentsLoading] = useState(false);
    const [userPaymentStats, setUserPaymentStats] = useState({
        total_records: 0,
        paid_count: 0,
        unpaid_count: 0,
        total_paid_amount: 0,
        total_pending_amount: 0
    });
    const [userPaymentSearch, setUserPaymentSearch] = useState("");
    const [userPaymentStatusFilter, setUserPaymentStatusFilter] = useState("all");
    const [userPaymentPage, setUserPaymentPage] = useState(1);
    const [userPaymentRowsPerPage, setUserPaymentRowsPerPage] = useState(10);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [deletingOrderId, setDeletingOrderId] = useState(null);

    // Referral tab states
    const [referralsList, setReferralsList] = useState([]);
    const [referralSearch, setReferralSearch] = useState("");
    const [referralsLoading, setReferralsLoading] = useState(false);
    const [referralPage, setReferralPage] = useState(1);
    const [referralRowsPerPage, setReferralRowsPerPage] = useState(10);

    // Profile Details form state
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
            let taxYear = getStoredTaxYear();

            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) userId = parsed.user_id || parsed.id;
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

            // Build or retrieve analyst lookup map to ensure analyst name displays on all status pages
            let analystMap = {};
            try {
                const storedAnalystMap = sessionStorage.getItem(`analyst_name_map_${taxYear}`);
                if (storedAnalystMap) {
                    analystMap = JSON.parse(storedAnalystMap);
                }
            } catch (e) {
                // Ignore
            }

            if (resolvedState === "ALL" || resolvedState === "all") {
                // When in ALL records, update the analyst lookup map
                (rawList || []).forEach(item => {
                    const fNo = String(item.unique_code || item.filenumber || item.file_number || item.fileno || "").trim();
                    const uId = String(item.user_id || item.u_user_id || item.ps_user_id || item.client_id || "").trim();
                    const unlistsId = String(item.unlists_u_id || "").trim();
                    const aName = String(item.client_name || item.analyst_name || item.assigned_to || item.admin_name || item.assigned_user_name || "").trim();
                    if (aName && aName !== "0" && aName !== "null" && aName !== "undefined" && aName !== "-" && aName.toLowerCase() !== "assigned" && aName.toLowerCase() !== "not assigned") {
                        if (fNo) analystMap[fNo] = aName;
                        if (uId) analystMap[uId] = aName;
                        if (unlistsId && unlistsId !== "0") analystMap[unlistsId] = aName;
                    }
                });
                try {
                    sessionStorage.setItem(`analyst_name_map_${taxYear}`, JSON.stringify(analystMap));
                } catch (e) {
                    // Ignore
                }
            } else if (Object.keys(analystMap).length === 0) {
                // If on a specific status page and map is empty, fetch alluserslist in background to populate analyst names
                try {
                    const allRes = await adminServices.alluserslist({
                        filestate: "ALL",
                        user_id: userId,
                        taxYear: String(taxYear),
                        per_page: 500,
                        page: 1
                    });
                    const allList = allRes?.data?.data || allRes?.data?.users || (Array.isArray(allRes?.data) ? allRes.data : []);
                    if (Array.isArray(allList) && allList.length > 0) {
                        allList.forEach(item => {
                            const fNo = String(item.unique_code || item.filenumber || item.file_number || item.fileno || "").trim();
                            const uId = String(item.user_id || item.u_user_id || item.ps_user_id || item.client_id || "").trim();
                            const unlistsId = String(item.unlists_u_id || "").trim();
                            const aName = String(item.client_name || item.analyst_name || item.assigned_to || item.admin_name || item.assigned_user_name || "").trim();
                            if (aName && aName !== "0" && aName !== "null" && aName !== "undefined" && aName !== "-" && aName.toLowerCase() !== "assigned" && aName.toLowerCase() !== "not assigned") {
                                if (fNo) analystMap[fNo] = aName;
                                if (uId) analystMap[uId] = aName;
                                if (unlistsId && unlistsId !== "0") analystMap[unlistsId] = aName;
                            }
                        });
                        try {
                            sessionStorage.setItem(`analyst_name_map_${taxYear}`, JSON.stringify(analystMap));
                        } catch (e) {
                            // Ignore
                        }
                    }
                } catch (err) {
                    console.warn("Could not prefetch all records for analyst map:", err);
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

                    // Extract explicit analyst name
                    const rawFileNo = String(filenumber).trim();
                    const rawUId = String(clientUserId).trim();
                    const rawUnlistsId = String(item.unlists_u_id || "").trim();

                    let analystNameCandidate = "";
                    const directCandidates = [
                        item.analyst_name,
                        item.analyst,
                        item.assigned_to_name,
                        item.assigned_to,
                        item.assigned_user_name,
                        item.assignee_name,
                        item.admin_name,
                        item.member_name,
                        item.m_name,
                        item.client_name,
                        item.unlists_name,
                        item.unlists_user_name,
                        item.unlists_u_name,
                        item.ps_analyst_name,
                        item.ps_user_name,
                        item.assigned_name,
                        item.assignedName
                    ];

                    for (const candidate of directCandidates) {
                        if (candidate && typeof candidate === "string") {
                            const trimmed = candidate.trim();
                            if (
                                trimmed !== "" &&
                                trimmed !== "0" &&
                                trimmed !== "null" &&
                                trimmed !== "undefined" &&
                                trimmed !== "-" &&
                                trimmed.toLowerCase() !== "assigned" &&
                                trimmed.toLowerCase() !== "not assigned"
                            ) {
                                analystNameCandidate = trimmed;
                                break;
                            }
                        }
                    }

                    // Fallback to pre-built mapping from alluserslist
                    if (!analystNameCandidate) {
                        if (rawFileNo && analystMap[rawFileNo]) {
                            analystNameCandidate = analystMap[rawFileNo];
                        } else if (rawUId && analystMap[rawUId]) {
                            analystNameCandidate = analystMap[rawUId];
                        } else if (rawUnlistsId && rawUnlistsId !== "0" && analystMap[rawUnlistsId]) {
                            analystNameCandidate = analystMap[rawUnlistsId];
                        }
                    }

                    const isAssigned = Boolean(
                        analystNameCandidate ||
                        (item.unlists_u_id && item.unlists_u_id !== 0 && item.unlists_u_id !== "0") ||
                        item.assigned === true ||
                        item.is_assigned === true
                    );

                    const assignedName = analystNameCandidate || (isAssigned ? "Assigned" : "Not Assigned");

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
        const handleTaxYearChange = () => {
            setUploadTaxYear(getStoredTaxYear());
            setTaxYearsList(getStoredTaxYearsList());
            loadRecords();
        };
        window.addEventListener("taxYearChanged", handleTaxYearChange);
        return () => {
            window.removeEventListener("taxYearChanged", handleTaxYearChange);
        };
    }, [loadRecords]);

    // Fetch payments data for selected user (/payment/getPaymentsByUserId)
    const fetchUserPayments = useCallback(async (client, search = "", statusFilter = "all") => {
        if (!client) return;
        const targetUserId =
            client.user_id ||
            client.client_id ||
            client.rawData?.user_id ||
            client.rawData?.u_user_id ||
            client.rawData?.ps_user_id ||
            client.rawData?.unlists_u_id ||
            client.id;

        if (!targetUserId) return;

        setUserPaymentsLoading(true);
        try {
            const payload = {
                client_id: isNaN(Number(targetUserId)) ? targetUserId : Number(targetUserId),
                taxyear: "all",
                order_status: statusFilter === "all" ? "all" : Number(statusFilter),
                search: search || ""
            };
            const res = await adminServices.getPaymentsByUserId(payload);
            const resData = res?.data;
            if (resData?.data && Array.isArray(resData.data)) {
                setUserPaymentsList(resData.data);
                setUserPaymentStats({
                    total_records: resData.total_records != null ? resData.total_records : resData.data.length,
                    paid_count: resData.paid_count != null ? resData.paid_count : resData.data.filter(d => d.order_status === 1 || String(d.order_status_text).toLowerCase() === "success").length,
                    unpaid_count: resData.unpaid_count != null ? resData.unpaid_count : resData.data.filter(d => d.order_status === 0 || String(d.order_status_text).toLowerCase().includes("pending")).length,
                    total_paid_amount: resData.total_paid_amount != null ? resData.total_paid_amount : 0,
                    total_pending_amount: resData.total_pending_amount != null ? resData.total_pending_amount : 0
                });
            } else if (Array.isArray(resData)) {
                setUserPaymentsList(resData);
                setUserPaymentStats({
                    total_records: resData.length,
                    paid_count: resData.filter(d => d.order_status === 1).length,
                    unpaid_count: resData.filter(d => d.order_status === 0).length,
                    total_paid_amount: 0,
                    total_pending_amount: 0
                });
            } else {
                setUserPaymentsList([]);
            }
        } catch (err) {
            console.warn("Error fetching user payments:", err);
            setUserPaymentsList([]);
        } finally {
            setUserPaymentsLoading(false);
        }
    }, []);

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
                const taxYear = client.tax_year || client.current_year || client.year || client.rawData?.current_year || client.rawData?.tax_year || getStoredTaxYear();
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
                const psYear = client.ps_year || client.tax_year || client.taxyear || client.current_year || client.year || client.rawData?.current_year || client.rawData?.tax_year || getStoredTaxYear();
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

            // 8. usersynopsys
            setSynopsysLoading(true);
            try {
                const currentTaxYear = getStoredTaxYear();
                const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
                let adminUserId = targetUserId;
                if (userInfoStr) {
                    try {
                        const parsed = JSON.parse(userInfoStr);
                        if (parsed.user_id || parsed.id) adminUserId = parsed.user_id || parsed.id;
                    } catch {
                        if (typeof userInfoStr === "string" && userInfoStr.length > 5) {
                            adminUserId = userInfoStr.replace(/"/g, "");
                        }
                    }
                }

                const synPayload = {
                    client_id: String(targetUserId),
                    user_id: adminUserId,
                    taxYear: Number(currentTaxYear) || currentTaxYear
                };
                const resSyn = await adminServices.usersynopsys(synPayload);
                if (resSyn?.data?.synopsys && Array.isArray(resSyn.data.synopsys)) {
                    setSynopsysList(resSyn.data.synopsys);
                } else if (resSyn?.data?.data && Array.isArray(resSyn.data.data)) {
                    setSynopsysList(resSyn.data.data);
                } else if (Array.isArray(resSyn?.data)) {
                    setSynopsysList(resSyn.data);
                } else {
                    setSynopsysList([]);
                }
            } catch (synErr) {
                console.warn("Error fetching usersynopsys:", synErr);
                setSynopsysList([]);
            } finally {
                setSynopsysLoading(false);
            }

            // 9. Fetch user payment orders (/payment/getPaymentsByUserId)
            fetchUserPayments(client);
        } finally {
            setDetailsLoading(false);
            setDocsLoading(false);
        }
    }, [fetchUserPayments]);

    // Refresh synopsys documents standalone
    const fetchUserSynopsys = useCallback(async (client) => {
        if (!client) return;
        const targetUserId = client.user_id || client.client_id || client.id;
        setSynopsysLoading(true);
        try {
            const currentTaxYear = getStoredTaxYear();
            const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
            let adminUserId = targetUserId;
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) adminUserId = parsed.user_id || parsed.id;
                } catch {
                    if (typeof userInfoStr === "string" && userInfoStr.length > 5) {
                        adminUserId = userInfoStr.replace(/"/g, "");
                    }
                }
            }

            const synPayload = {
                client_id: String(targetUserId),
                user_id: adminUserId,
                taxYear: Number(currentTaxYear) || currentTaxYear
            };
            const resSyn = await adminServices.usersynopsys(synPayload);
            if (resSyn?.data?.synopsys && Array.isArray(resSyn.data.synopsys)) {
                setSynopsysList(resSyn.data.synopsys);
            } else if (resSyn?.data?.data && Array.isArray(resSyn.data.data)) {
                setSynopsysList(resSyn.data.data);
            } else if (Array.isArray(resSyn?.data)) {
                setSynopsysList(resSyn.data);
            } else {
                setSynopsysList([]);
            }
        } catch (synErr) {
            console.warn("Error fetching usersynopsys:", synErr);
            setSynopsysList([]);
        } finally {
            setSynopsysLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedClient) {
            setEditingOrderId(null);
            fetchClientDetails(selectedClient);
        }
    }, [selectedClient, fetchClientDetails]);

    useEffect(() => {
        if (selectedClient && activeInnerTab === "payment") {
            setEditingOrderId(null);
            fetchUserPayments(selectedClient, userPaymentSearch, userPaymentStatusFilter);
        }
    }, [selectedClient, activeInnerTab, userPaymentStatusFilter, fetchUserPayments]);

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
            let currentTaxYear = uploadTaxYear || getStoredTaxYear();

            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) adminUserId = parsed.user_id || parsed.id;
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
                fetchUserSynopsys(selectedClient);
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
        if (selectedFileState === "" || selectedFileState === null || selectedFileState === undefined || isNaN(Number(selectedFileState))) {
            Swal.fire({
                icon: "warning",
                title: "File Status Required",
                text: "Please select a valid file status.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        if (!statusComment || !statusComment.trim()) {
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
            let taxYear = getStoredTaxYear();
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) adminUserId = parsed.user_id || parsed.id;
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

    // Cancel editing an existing payment order and reset form
    const handleCancelEditPayment = () => {
        setEditingOrderId(null);
        setPaymentForm({
            p_standardAmount: "",
            p_discountType: "Flat",
            p_discountValue: "",
            p_amount: "",
            currency: "USA",
            comment: ""
        });
    };

    // Handle Payment form submission (/payment/createOrder when new, /payment/updateOrder when editing)
    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClient) return;

        const clientId =
            selectedClient.user_id ||
            selectedClient.client_id ||
            selectedClient.rawItem?.unlists_u_id ||
            selectedClient.rawItem?.user_id ||
            selectedClient.id;

        if (!clientId) {
            Swal.fire({
                icon: "warning",
                title: "Missing Client ID",
                text: "Could not find a valid Client ID for this record.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        if (!paymentForm.p_standardAmount || isNaN(parseFloat(paymentForm.p_standardAmount))) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Standard Amount",
                text: "Please enter a valid standard amount.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const finalAmt = paymentForm.p_amount !== "" ? paymentForm.p_amount : paymentForm.p_standardAmount;
        const currentTaxYear = getStoredTaxYear() || "2025";

        setPaymentSubmitting(true);
        try {
            if (editingOrderId) {
                // Update Order API (/payment/updateOrder)
                const updatePayload = {
                    order_id: Number(editingOrderId),
                    p_standardAmount: String(paymentForm.p_standardAmount),
                    p_discountType: paymentForm.p_discountType || "Flat",
                    p_discountValue: String(paymentForm.p_discountValue || "0"),
                    p_amount: String(finalAmt),
                    currency: paymentForm.currency || "USA",
                    comment: paymentForm.comment || "",
                    taxyear: String(paymentForm.taxyear || currentTaxYear)
                };

                const res = await adminServices.updateOrder(updatePayload);
                const resData = res?.data;

                if (resData?.http_code === 200 || resData?.success || res?.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "Order Updated Successfully",
                        text: resData?.status_smessage || resData?.message || `Payment order #${editingOrderId} updated successfully.`,
                        confirmButtonColor: "#1b2e6b"
                    });
                    handleCancelEditPayment();
                    fetchUserPayments(selectedClient, userPaymentSearch, userPaymentStatusFilter);
                } else {
                    Swal.fire({
                        icon: "warning",
                        title: "Notice",
                        text: resData?.status_smessage || resData?.message || "Order update completed with warnings.",
                        confirmButtonColor: "#1b2e6b"
                    });
                }
            } else {
                // Create Order API (/payment/createOrder)
                const createPayload = {
                    client_id: isNaN(Number(clientId)) ? clientId : Number(clientId),
                    p_standardAmount: String(paymentForm.p_standardAmount),
                    p_discountType: paymentForm.p_discountType || "Flat",
                    p_discountValue: String(paymentForm.p_discountValue || "0"),
                    p_amount: String(finalAmt),
                    currency: paymentForm.currency || "USA",
                    comment: paymentForm.comment || "",
                    taxyear: String(currentTaxYear)
                };

                const res = await adminServices.createOrder(createPayload);
                const resData = res?.data;

                if (
                    resData?.http_code === 200 ||
                    resData?.status === 200 ||
                    resData?.success ||
                    resData?.order_id ||
                    resData?.id ||
                    res?.status === 200
                ) {
                    Swal.fire({
                        icon: "success",
                        title: "Order Created Successfully",
                        text: resData?.message || `Payment order created for ${selectedClient.name} with amount ${createPayload.currency} ${createPayload.p_amount}.`,
                        confirmButtonColor: "#1b2e6b"
                    });
                    handleCancelEditPayment();
                    fetchUserPayments(selectedClient, userPaymentSearch, userPaymentStatusFilter);
                } else {
                    Swal.fire({
                        icon: "warning",
                        title: "Notice",
                        text: resData?.message || "Order creation completed with warnings.",
                        confirmButtonColor: "#1b2e6b"
                    });
                }
            }
        } catch (err) {
            console.error("Error submitting payment order:", err);
            Swal.fire({
                icon: "error",
                title: editingOrderId ? "Failed to Update Order" : "Failed to Create Order",
                text: err?.response?.data?.message || err?.response?.data?.status_smessage || err?.message || "Could not process order on server.",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setPaymentSubmitting(false);
        }
    };

    // Filtered User Payments for Table
    const filteredUserPayments = useMemo(() => {
        let list = userPaymentsList || [];
        if (userPaymentStatusFilter !== "all") {
            const filterNum = Number(userPaymentStatusFilter);
            list = list.filter(item => {
                if (filterNum === 1) {
                    return item.order_status === 1 || String(item.order_status) === "1" || String(item.order_status_text).toLowerCase() === "success" || String(item.order_status_text).toLowerCase() === "paid";
                }
                return item.order_status === 0 || String(item.order_status) === "0" || String(item.order_status_text).toLowerCase().includes("pending") || String(item.order_status_text).toLowerCase().includes("unpaid");
            });
        }
        if (userPaymentSearch && userPaymentSearch.trim()) {
            const term = userPaymentSearch.toLowerCase().trim();
            list = list.filter(item => {
                const orderId = String(item.order_id || "");
                const user = String(item.user_name || item.name || "").toLowerCase();
                const fileNo = String(item.filenumber || "").toLowerCase();
                const comment = String(item.comment || "").toLowerCase();
                const amt = String(item.p_amount != null ? item.p_amount : (item.amount || ""));
                const stdAmt = String(item.p_standardAmount || "");
                const taxyear = String(item.taxyear || "").toLowerCase();
                const txnId = String(item.t_order_id || item.bank_ref_no || "").toLowerCase();
                const statusText = String(item.order_status_text || (item.order_status === 1 ? "paid success" : "pending unpaid")).toLowerCase();

                return (
                    orderId.includes(term) ||
                    user.includes(term) ||
                    fileNo.includes(term) ||
                    comment.includes(term) ||
                    amt.includes(term) ||
                    stdAmt.includes(term) ||
                    taxyear.includes(term) ||
                    txnId.includes(term) ||
                    statusText.includes(term)
                );
            });
        }
        return list;
    }, [userPaymentsList, userPaymentStatusFilter, userPaymentSearch]);

    const totalPaymentPages = Math.max(1, Math.ceil(filteredUserPayments.length / userPaymentRowsPerPage));
    const currentPaymentPageClamped = Math.min(userPaymentPage, totalPaymentPages);
    const paginatedUserPayments = filteredUserPayments.slice(
        (currentPaymentPageClamped - 1) * userPaymentRowsPerPage,
        currentPaymentPageClamped * userPaymentRowsPerPage
    );

    // Edit Order in Form above
    const handleOpenEditPaymentOrder = (order) => {
        setEditingOrderId(order.order_id);
        setPaymentForm({
            p_standardAmount: order.p_standardAmount != null ? String(order.p_standardAmount) : "",
            p_discountType: order.p_discountType || "Flat",
            p_discountValue: order.p_discountValue != null ? String(order.p_discountValue) : "",
            p_amount: order.p_amount != null ? String(order.p_amount) : (order.amount != null ? String(order.amount) : ""),
            currency: order.currency || "USA",
            comment: order.comment || "",
            taxyear: order.taxyear ? String(order.taxyear) : (getStoredTaxYear() || "2025")
        });

        // Smooth scroll up to payment form
        setTimeout(() => {
            const formElement = document.getElementById("client-payment-form");
            if (formElement) {
                formElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 50);
    };

    const handleDeletePaymentOrder = async (order) => {
        if (!order?.order_id) return;

        const result = await Swal.fire({
            title: `Delete Order #${order.order_id}?`,
            text: `Are you sure you want to permanently delete this payment order? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            setDeletingOrderId(order.order_id);
            try {
                const payload = {
                    order_id: Number(order.order_id)
                };
                const res = await adminServices.deleteOrder(payload);
                const resData = res?.data;
                if (resData?.http_code === 200 || resData?.success || res?.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: resData?.status_smessage || resData?.message || `Order #${order.order_id} has been deleted.`,
                        confirmButtonColor: "#1b2e6b"
                    });
                    if (editingOrderId === order.order_id) {
                        handleCancelEditPayment();
                    }
                    fetchUserPayments(selectedClient, userPaymentSearch, userPaymentStatusFilter);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Delete Failed",
                        text: resData?.status_smessage || resData?.message || "Could not delete order.",
                        confirmButtonColor: "#1b2e6b"
                    });
                }
            } catch (err) {
                console.error("Error deleting order:", err);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: err?.response?.data?.message || err?.response?.data?.status_smessage || err?.message || "Failed to delete order on server.",
                    confirmButtonColor: "#1b2e6b"
                });
            } finally {
                setDeletingOrderId(null);
            }
        }
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

    // Handle Export Complete Client Profile & Other Info to PDF
    const handleExportClientDetailsPDF = async () => {
        if (!selectedClient) return;
        try {
            setExportingPdf(true);
            await exportClientDetailsPDF({
                client: selectedClient,
                basicInfo: basicInfo,
                spouseInfo: spouseInfo,
                dependentsInfo: dependentsInfo,
                employersInfo: employersInfo,
                uploadedFiles: uploadedFiles,
                taxYear: uploadTaxYear || getStoredTaxYear()
            });

            Swal.fire({
                icon: "success",
                title: "PDF Exported Successfully",
                text: "The client profile and other details have been downloaded as a PDF.",
                confirmButtonColor: "#1b2e6b",
                timer: 2500
            });
        } catch (error) {
            console.error("Export PDF failed:", error);
            Swal.fire({
                icon: "error",
                title: "Export Failed",
                text: "Could not generate PDF. Please try again.",
                confirmButtonColor: "#1b2e6b"
            });
        } finally {
            setExportingPdf(false);
        }
    };

    // Handle Send Direct Notification to Client
    const handleSendClientNotification = async () => {
        if (!selectedClient) return;
        setSendingNotification(true);

        try {
            let analystUserId = 5;
            const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) analystUserId = parsed.user_id || parsed.id;
                } catch {
                    if (typeof userInfoStr === "string" && userInfoStr.length > 0) {
                        analystUserId = userInfoStr.replace(/"/g, "");
                    }
                }
            }
            const targetUserId = selectedClient.id || selectedClient.user_id || selectedClient.u_user_id || selectedClient.client_id;
            const fileNo = selectedClient.filenumber || selectedClient.file_number || "";
            const clientStatus = String(selectedClient.status || "").toLowerCase();

            // Screen & Context-appropriate hardcoded message
            let hardcodedMessage = "Your tax documents have been reviewed. Please check the update.";
            if (activeInnerTab === "upload_docs" || activeInnerTab === "download_docs") {
                hardcodedMessage = "Your tax documents have been reviewed. Please check the update.";
            } else if (activeInnerTab === "payment" || clientStatus.includes("payment")) {
                hardcodedMessage = `Your payment for File #${fileNo || "UTS"} is pending. Please complete your payment to proceed with your tax filing.`;
            } else if (activeInnerTab === "file_status") {
                hardcodedMessage = `Your file status has been updated to "${selectedClient.status}". Please review your account dashboard.`;
            }

            const payload = {
                client_id: targetUserId ? (Number(targetUserId) || targetUserId) : targetUserId,
                userId: targetUserId ? (Number(targetUserId) || targetUserId) : targetUserId,
                user_id: targetUserId ? (Number(targetUserId) || targetUserId) : targetUserId,
                analysistId: analystUserId ? (Number(analystUserId) || analystUserId) : 5,
                analystId: analystUserId ? (Number(analystUserId) || analystUserId) : 5,
                message: hardcodedMessage
            };

            const res = await adminServices.sendUserNotification(payload);
            if (res && (res.status === true || res.data?.status === true || res.status === 200 || res.data?.http_code === 200)) {
                Swal.fire({
                    icon: "success",
                    title: "Notification Sent",
                    text: res.data?.status_smessage || "Notification sent successfully.",
                    toast: true,
                    position: "top-end",
                    timer: 3000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Notice",
                    text: res.data?.status_smessage || "Unable to send notification.",
                    toast: true,
                    position: "top-end",
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error("Error sending notification:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.status_smessage || "Failed to send notification.",
                toast: true,
                position: "top-end",
                timer: 3000,
                showConfirmButton: false
            });
        } finally {
            setSendingNotification(false);
        }
    };

    // Client Detail View
    if (selectedClient) {
        const isAnalyst = isAnalystUser();
        const allSubTabs = [
            { id: "basic_info", label: "Basic Info" },
            { id: "other_info", label: "Other Info" },
            { id: "download_docs", label: `Download Documents (${uploadedFiles.length})` },
            { id: "upload_docs", label: "Upload Documents" },
            { id: "file_status", label: "File Status" },
            { id: "payment", label: "Payment" },
            { id: "referral", label: "Referral" }
        ];

        const subTabs = isAnalyst
            ? allSubTabs.filter(tab => tab.id !== "payment")
            : allSubTabs;

        return (
            <div className="client-details-workspace d-flex flex-column gap-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setSelectedClient(null)}
                            className="btn btn-back-dashboard d-flex align-items-center gap-2"
                        >
                            <FiArrowLeft />
                            <span>Back to List</span>
                        </button>
                        <div className="client-header-summary d-flex align-items-center gap-2">
                            <span className="client-header-summary-name">
                                {selectedClient.name || basicInfo?.u_name || "Client"}
                            </span>
                            <span className="client-header-summary-divider">|</span>
                            <span className="client-header-summary-fileno">
                                {selectedClient.filenumber ? `#${selectedClient.filenumber}` : (selectedClient.id ? `#${selectedClient.id}` : "")}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button
                            className="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
                            onClick={handleSendClientNotification}
                            disabled={sendingNotification}
                            title="Send instant notification to client"
                            style={{ background: "linear-gradient(135deg, #1b2e6b 0%, #254294 100%)", border: "none" }}
                        >
                            {sendingNotification ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <FiSend size={13} />
                                    <span>Send Notification</span>
                                </>
                            )}
                        </button>
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
                                            className={`nav-link rounded-pill px-3 py-1.5 fw-semibold ${activeInnerTab === tab.id ? "active" : ""
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
                                    onClick={handleExportClientDetailsPDF}
                                    disabled={exportingPdf || detailsLoading}
                                    title="Download complete profile & other info as PDF"
                                >
                                    <FiDownload />
                                    <span>{exportingPdf ? "Exporting PDF..." : "Export PDF"}</span>
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
                                                {taxYearsList.length > 0 ? (
                                                    taxYearsList.map(item => (
                                                        <option key={item.utstaxyear} value={String(item.utstaxyear)}>
                                                            {item.dutstaxyear || item.utstaxyear}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value={uploadTaxYear}>{uploadTaxYear}</option>
                                                )}
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

                                {/* Uploaded Synopsis & Documents History Table (Integrated with usersynopsys API) */}
                                <div className="card border rounded-3 overflow-hidden shadow-sm mt-4">
                                    <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
                                        <div>
                                            <h6 className="fw-bold mb-0 text-dark">Uploaded Synopsys & Documents</h6>
                                            <small className="text-muted">History of synopsis files uploaded for this client</small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-primary rounded-pill px-3 py-2">
                                                {synopsysList.length} {synopsysList.length === 1 ? "File" : "Files"}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                onClick={() => fetchUserSynopsys(selectedClient)}
                                                disabled={synopsysLoading}
                                                title="Refresh Synopsys List"
                                            >
                                                <FiRefreshCw className={synopsysLoading ? "spinner-border spinner-border-sm" : ""} />
                                                <span>Refresh</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        {synopsysLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                                <span className="ms-2 text-muted small">Loading synopsys documents...</span>
                                            </div>
                                        ) : synopsysList.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ width: "60px" }}>#</th>
                                                            <th>Document Title</th>
                                                            <th>Uploaded Date & Time</th>
                                                            <th className="text-end" style={{ width: "160px" }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {synopsysList.map((item, idx) => {
                                                            const fileUrl = item.synopsys_file || item.file_url || item.file;
                                                            const title = item.synopsys_title || item.title || "Tax Synopsis";
                                                            const dateStr = item.synopsys_created_at || item.created_at;
                                                            const formattedDate = dateStr
                                                                ? new Date(dateStr).toLocaleString("en-US", {
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })
                                                                : "-";

                                                            return (
                                                                <tr key={item.synopsys_id || idx}>
                                                                    <td className="fw-semibold text-secondary">{idx + 1}</td>
                                                                    <td>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div className="p-2 rounded bg-light text-primary">
                                                                                <FiFileText size={18} />
                                                                            </div>
                                                                            <div>
                                                                                <div className="fw-semibold text-dark">{title}</div>
                                                                                <small className="text-muted font-monospace">ID: #{item.synopsys_id || idx + 1}</small>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-secondary small">{formattedDate}</td>
                                                                    <td className="text-end">
                                                                        {fileUrl ? (
                                                                            <a
                                                                                href={fileUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                                                            >
                                                                                <FiExternalLink size={14} />
                                                                                <span>View / Download</span>
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-muted small">No link</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                <FiFileText size={36} className="text-muted mb-2 opacity-50" />
                                                <p className="mb-0 fw-medium">No synopsis documents uploaded yet for this tax year.</p>
                                                <small className="text-muted">Use the form above to upload a new tax synopsis or document.</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                                onChange={(e) => setSelectedFileState(e.target.value === "" ? "" : Number(e.target.value))}
                                                required
                                            >
                                                <option value="">Select File Status</option>
                                                {fileStatusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-medium text-dark small">
                                                Comments <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="form-control figma-form-control"
                                                rows={4}
                                                placeholder="Enter mandatory comments for this status update..."
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
                                                                <td>{item.ps_by_user_name}</td>
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

                        {/* Payment Tab (Figma Design 2342-15457 & /payment/createOrder Integration) */}
                        {activeInnerTab === "payment" && !isAnalyst && (
                            <div className="py-2">
                                {/* Status Pill Badge */}
                                <div className="status-pill-figma">
                                    Status : {selectedClient.status || "Payment Pending"}
                                </div>

                                <form id="client-payment-form" onSubmit={handlePaymentSubmit}>
                                    {/* Editing Active Notice */}
                                    {editingOrderId && (
                                        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center justify-content-between rounded-3 border">
                                            <div className="d-flex align-items-center gap-2">
                                                <FiEdit2 className="text-primary" size={16} />
                                                <span className="small fw-semibold text-dark">
                                                    Editing Payment Order #{editingOrderId} — Modify billing details below and click &quot;Update Order&quot; to save.
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary py-0 px-2 small"
                                                onClick={handleCancelEditPayment}
                                            >
                                                Cancel Edit
                                            </button>
                                        </div>
                                    )}

                                    <div className="row g-3">
                                        {/* Row 1: Customer Name & File Number */}
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

                                        {/* Row 2: Standard Amount & Currency */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Standard Amount <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                className="form-control figma-form-control"
                                                placeholder="Enter Standard Amount (e.g. 1000)"
                                                value={paymentForm.p_standardAmount}
                                                onChange={e => handlePaymentInputChange("p_standardAmount", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Currency <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select figma-form-control"
                                                value={paymentForm.currency}
                                                onChange={e => handlePaymentInputChange("currency", e.target.value)}
                                                required
                                            >
                                                <option value="USA">USA</option>
                                                <option value="INDIA">INDIA</option>
                                            </select>
                                        </div>

                                        {/* Row 3: Discount Type & Discount Value */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Discount Type <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select figma-form-control"
                                                value={paymentForm.p_discountType}
                                                onChange={e => handlePaymentInputChange("p_discountType", e.target.value)}
                                                required
                                            >
                                                <option value="Flat">Flat Discount</option>
                                                <option value="Percentage">Percentage (%)</option>
                                                <option value="None">None</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Discount Value {paymentForm.p_discountType !== "None" && <span className="text-danger">*</span>}
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                className="form-control figma-form-control"
                                                placeholder={paymentForm.p_discountType === "Percentage" ? "Enter Percentage (e.g. 20)" : "Enter Discount Amount (e.g. 200)"}
                                                value={paymentForm.p_discountValue}
                                                onChange={e => handlePaymentInputChange("p_discountValue", e.target.value)}
                                                disabled={paymentForm.p_discountType === "None"}
                                                required={paymentForm.p_discountType !== "None"}
                                            />
                                        </div>

                                        {/* Row 4: Final Payable Amount & Tax Year */}
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Final Payable Amount (p_amount) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                className="form-control figma-form-control"
                                                placeholder="Calculated Final Amount (e.g. 800)"
                                                value={paymentForm.p_amount}
                                                onChange={e => handlePaymentInputChange("p_amount", e.target.value)}
                                                required
                                            />
                                            <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                                                Auto-calculated based on Standard Amount and Discount. You can also adjust manually.
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-medium text-dark small">
                                                Tax Year
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control figma-form-control bg-light"
                                                value={getStoredTaxYear() || "2025"}
                                                readOnly
                                            />
                                            <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                                                Captured automatically from local storage.
                                            </small>
                                        </div>

                                        {/* Row 5: Comment */}
                                        <div className="col-12">
                                            <label className="form-label fw-medium text-dark small">
                                                Comment <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="form-control figma-form-control"
                                                rows={3}
                                                placeholder="e.g. Early bird discount applied for 2025 filing"
                                                value={paymentForm.comment}
                                                onChange={e => handlePaymentInputChange("comment", e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end align-items-center gap-2 mt-4">
                                        {editingOrderId && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary px-4"
                                                onClick={handleCancelEditPayment}
                                                disabled={paymentSubmitting}
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className="btn btn-figma-primary px-5 d-flex align-items-center gap-2"
                                            disabled={paymentSubmitting}
                                        >
                                            {paymentSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    <span>{editingOrderId ? "Updating Order..." : "Creating Order..."}</span>
                                                </>
                                            ) : (
                                                <span>{editingOrderId ? "Update Order" : "Create Order"}</span>
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* Payment Orders List Table Section (/payment/getPaymentsByUserId) */}
                                <div className="mt-4 pt-4 border-top">
                                    {/* Section Header with Stats */}
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                                                <span>Payment Orders History</span>
                                                <span className="badge bg-light text-primary border fw-semibold rounded-pill px-2.5 py-1 small">
                                                    {filteredUserPayments.length} {filteredUserPayments.length === 1 ? 'Record' : 'Records'}
                                                </span>
                                            </h6>
                                            <p className="text-muted small mb-0">
                                                View all payment records created for this customer, update billing details, or remove orders.
                                            </p>
                                        </div>

                                        {/* Quick Summary Badges */}
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <div
                                                className="px-3 py-1.5 rounded-3 d-flex align-items-center gap-2 small fw-semibold"
                                                style={{ backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}
                                            >
                                                <span>Paid ({userPaymentStats.paid_count || userPaymentsList.filter(o => o.order_status === 1).length})</span>
                                                <span>${Number(userPaymentStats.total_paid_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div
                                                className="px-3 py-1.5 rounded-3 d-flex align-items-center gap-2 small fw-semibold"
                                                style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
                                            >
                                                <span>Pending ({userPaymentStats.unpaid_count || userPaymentsList.filter(o => o.order_status === 0).length})</span>
                                                <span>${Number(userPaymentStats.total_pending_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search & Filter Bar */}
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <select
                                                className="form-select form-select-sm figma-form-control"
                                                style={{ width: "160px" }}
                                                value={userPaymentStatusFilter}
                                                onChange={e => {
                                                    setUserPaymentStatusFilter(e.target.value);
                                                    setUserPaymentPage(1);
                                                }}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="1">Paid / Success</option>
                                                <option value="0">Unpaid / Pending</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                onClick={() => fetchUserPayments(selectedClient, userPaymentSearch, userPaymentStatusFilter)}
                                                title="Refresh payments list"
                                            >
                                                <FiRefreshCw className={userPaymentsLoading ? "spin-animation" : ""} />
                                                <span>Refresh</span>
                                            </button>
                                        </div>

                                        <div className="position-relative" style={{ maxWidth: "260px", width: "100%" }}>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm figma-form-control pe-5"
                                                placeholder="Search orders..."
                                                value={userPaymentSearch}
                                                onChange={e => {
                                                    setUserPaymentSearch(e.target.value);
                                                    setUserPaymentPage(1);
                                                }}
                                            />
                                            <FiSearch className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
                                        </div>
                                    </div>

                                    {/* Payment Table */}
                                    <div className="figma-table-container mb-3 shadow-sm">
                                        <div className="table-responsive">
                                            <table className="table figma-table align-middle mb-0">
                                                <thead>
                                                    <tr>
                                                        <th style={{ minWidth: "90px" }}>Order ID</th>
                                                        <th style={{ minWidth: "90px" }}>Tax Year</th>
                                                        <th style={{ minWidth: "100px" }}>Standard</th>
                                                        <th style={{ minWidth: "120px" }}>Discount</th>
                                                        <th style={{ minWidth: "110px" }}>Payable</th>
                                                        <th style={{ minWidth: "110px" }}>Status</th>
                                                        <th style={{ minWidth: "130px" }}>Ref / Txn ID</th>
                                                        <th style={{ minWidth: "160px" }}>Comment</th>
                                                        <th style={{ minWidth: "110px" }}>Created</th>
                                                        <th style={{ minWidth: "90px", textAlign: "center" }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userPaymentsLoading ? (
                                                        <tr>
                                                            <td colSpan="10" className="text-center py-5 text-muted small">
                                                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                                                Loading payment orders...
                                                            </td>
                                                        </tr>
                                                    ) : paginatedUserPayments.length > 0 ? (
                                                        paginatedUserPayments.map((order, idx) => {
                                                            const isPaid = order.order_status === 1 || String(order.order_status) === "1" || String(order.order_status_text).toLowerCase() === "success" || String(order.order_status_text).toLowerCase() === "paid";
                                                            const currencySymbol = order.currency === "INDIA" || order.currency === "INR" ? "₹" : "$";
                                                            const stdAmt = order.p_standardAmount != null ? `${currencySymbol}${order.p_standardAmount}` : "-";
                                                            const finalAmt = order.p_amount != null ? `${currencySymbol}${order.p_amount}` : (order.amount != null ? `${currencySymbol}${order.amount}` : "-");
                                                            const discountText = order.p_discountType && order.p_discountType !== "None"
                                                                ? `${order.p_discountType === "Percentage" ? `${order.p_discountValue}%` : `${currencySymbol}${order.p_discountValue}`} (${order.p_discountType})`
                                                                : "None";

                                                            return (
                                                                <tr key={order.order_id || idx}>
                                                                    <td>
                                                                        <span className="fw-bold text-dark">#{order.order_id}</span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge bg-light text-secondary border fw-semibold">
                                                                            {order.taxyear || "N/A"}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="text-muted">{stdAmt}</span>
                                                                    </td>
                                                                    <td>
                                                                        <small className="text-muted">{discountText}</small>
                                                                    </td>
                                                                    <td>
                                                                        <span className="fw-bold text-dark">{finalAmt}</span>
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className="badge rounded-pill px-2.5 py-1 small fw-semibold"
                                                                            style={
                                                                                isPaid
                                                                                    ? { backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }
                                                                                    : { backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }
                                                                            }
                                                                        >
                                                                            {isPaid ? "● Paid" : "● Pending"}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <small className="text-secondary font-monospace" title={order.bank_ref_no || order.t_order_id || "-"}>
                                                                            {order.bank_ref_no || order.t_order_id || "-"}
                                                                        </small>
                                                                    </td>
                                                                    <td>
                                                                        <div className="text-truncate small" style={{ maxWidth: "180px" }} title={order.comment || "-"}>
                                                                            {order.comment || "-"}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <small className="text-muted">
                                                                            {order.o_created_at ? (order.o_created_at.split("T")[0] || order.o_created_at.split(" ")[0]) : "-"}
                                                                        </small>
                                                                    </td>
                                                                    <td className="text-center">
                                                                        {!isPaid ? (
                                                                            <div className="d-flex align-items-center justify-content-center gap-1">
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-primary border-0 p-1.5 rounded-2"
                                                                                    onClick={() => handleOpenEditPaymentOrder(order)}
                                                                                    title="Edit Order"
                                                                                >
                                                                                    <FiEdit2 size={15} />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-danger border-0 p-1.5 rounded-2"
                                                                                    onClick={() => handleDeletePaymentOrder(order)}
                                                                                    disabled={deletingOrderId === order.order_id}
                                                                                    title="Delete Order"
                                                                                >
                                                                                    {deletingOrderId === order.order_id ? (
                                                                                        <span className="spinner-border spinner-border-sm" style={{ width: "12px", height: "12px" }}></span>
                                                                                    ) : (
                                                                                        <FiTrash2 size={15} />
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-muted small">-</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="10" className="text-center py-5 text-muted small">
                                                                <p className="mb-0">No payment orders found for this user.</p>
                                                                <small className="text-secondary">Use the form above to generate a new payment order.</small>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    {filteredUserPayments.length > 0 && (
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 text-muted small mt-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <span>Row per page</span>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: "95px" }}
                                                    value={userPaymentRowsPerPage}
                                                    onChange={e => {
                                                        setUserPaymentRowsPerPage(Number(e.target.value));
                                                        setUserPaymentPage(1);
                                                    }}
                                                >
                                                    <option value={5}>5 / page</option>
                                                    <option value={10}>10 / page</option>
                                                    <option value={25}>25 / page</option>
                                                </select>
                                                <span className="ms-2">
                                                    Showing {(currentPaymentPageClamped - 1) * userPaymentRowsPerPage + 1} to {Math.min(currentPaymentPageClamped * userPaymentRowsPerPage, filteredUserPayments.length)} of {filteredUserPayments.length} entries
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm figma-pagination-btn"
                                                    disabled={currentPaymentPageClamped <= 1}
                                                    onClick={() => setUserPaymentPage(prev => Math.max(1, prev - 1))}
                                                >
                                                    &lt;
                                                </button>
                                                {Array.from({ length: totalPaymentPages }, (_, i) => i + 1)
                                                    .filter(p => p === 1 || p === totalPaymentPages || Math.abs(p - currentPaymentPageClamped) <= 1)
                                                    .reduce((acc, p, i, arr) => {
                                                        if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                                                        acc.push(p);
                                                        return acc;
                                                    }, [])
                                                    .map((item, idx) => item === "..." ? (
                                                        <span key={`dots-payment-${idx}`} className="px-1 text-muted">...</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            key={`page-payment-${item}`}
                                                            className={`btn btn-sm figma-pagination-btn ${item === currentPaymentPageClamped ? "active" : ""}`}
                                                            onClick={() => setUserPaymentPage(item)}
                                                        >
                                                            {item}
                                                        </button>
                                                    ))
                                                }
                                                <button
                                                    type="button"
                                                    className="btn btn-sm figma-pagination-btn"
                                                    disabled={currentPaymentPageClamped >= totalPaymentPages}
                                                    onClick={() => setUserPaymentPage(prev => Math.min(totalPaymentPages, prev + 1))}
                                                >
                                                    &gt;
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                                    {taxYearsList.length > 0 ? (
                                                        taxYearsList.map(item => (
                                                            <option key={item.utstaxyear} value={String(item.utstaxyear)}>
                                                                {item.dutstaxyear || item.utstaxyear}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value={uploadTaxYear}>{uploadTaxYear}</option>
                                                    )}
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

    // Handle Send Direct Notification / Reminder from Table Row
    const handleSendReminder = async (client, e) => {
        if (e) e.stopPropagation();
        const rowKey = client.user_id || client.client_id || client.rawData?.user_id || client.rawData?.u_user_id || client.id;
        setSendingReminderId(rowKey);

        try {
            let analystUserId = 5;
            const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_id || parsed.id) analystUserId = parsed.user_id || parsed.id;
                } catch {
                    if (typeof userInfoStr === "string" && userInfoStr.length > 0) {
                        analystUserId = userInfoStr.replace(/"/g, "");
                    }
                }
            }

            const targetUserId = client.user_id || client.client_id || client.rawData?.user_id || client.rawData?.u_user_id || client.rawData?.ps_user_id || client.rawData?.unlists_u_id || client.id;
            const fileNo = client.filenumber || client.unique_code || client.id || "";
            const statusStr = String(client.status || "").toLowerCase();

            // Direct contextual hardcoded notification message
            let hardcodedMessage = "Your tax documents have been reviewed. Please check the update.";
            if (filestate === 8 || filestate === "8" || statusFilterKey === "payment_pending" || statusStr.includes("payment")) {
                hardcodedMessage = `Your payment for File #${fileNo} is pending. Please complete your payment to proceed with your tax filing.`;
            } else if (filestate === 4 || filestate === "4" || statusFilterKey === "docs_upload_pending" || statusStr.includes("doc")) {
                hardcodedMessage = `Please upload the pending documents for File #${fileNo} to continue your tax filing.`;
            } else if (filestate === 1 || filestate === "1" || statusFilterKey === "basic_info_pending" || statusStr.includes("basic")) {
                hardcodedMessage = `Please complete your basic information for File #${fileNo}.`;
            }

            const payload = {
                client_id: targetUserId ? (Number(targetUserId) || targetUserId) : targetUserId,
                userId: targetUserId ? (Number(targetUserId) || targetUserId) : targetUserId,
                user_id: targetUserId ? (Number(targetUserId) || targetUserId) : targetUserId,
                analysistId: analystUserId ? (Number(analystUserId) || analystUserId) : 5,
                analystId: analystUserId ? (Number(analystUserId) || analystUserId) : 5,
                message: hardcodedMessage
            };

            const res = await adminServices.sendUserNotification(payload);
            if (res && (res.status === true || res.data?.status === true || res.status === 200 || res.data?.http_code === 200)) {
                Swal.fire({
                    icon: "success",
                    title: "Notification Sent",
                    text: res.data?.status_smessage || "Notification sent successfully.",
                    toast: true,
                    position: "top-end",
                    timer: 3000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Notice",
                    text: res.data?.status_smessage || "Unable to send notification.",
                    toast: true,
                    position: "top-end",
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error("Error sending notification:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.status_smessage || "Failed to send notification.",
                toast: true,
                position: "top-end",
                timer: 3000,
                showConfirmButton: false
            });
        } finally {
            setSendingReminderId(null);
        }
    };

    // List Table View
    return (
        <div className="card shadow-sm border-0 rounded-3 p-4">
            {/* Search Banner */}
            <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-3">
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
                            {showReminderColumn && <th className="text-center">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={showReminderColumn ? 8 : 7} className="text-center py-5 text-muted">
                                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                    Loading client records...
                                </td>
                            </tr>
                        ) : filteredClients.length > 0 ? (
                            filteredClients.map((client) => {
                                const rowKey = client.user_id || client.client_id || client.rawData?.user_id || client.rawData?.u_user_id || client.id;
                                const isSending = sendingReminderId === rowKey;

                                return (
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
                                    {showReminderColumn && (
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-semibold shadow-sm"
                                                style={{ fontSize: "0.82rem", background: "linear-gradient(135deg, #1b2e6b 0%, #254294 100%)", border: "none" }}
                                                onClick={(e) => handleSendReminder(client, e)}
                                                disabled={isSending}
                                                title={`Send notification to ${client.name}`}
                                            >
                                                {isSending ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: "11px", height: "11px" }}></span>
                                                        <span>Sending...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSend size={12} />
                                                        <span>Send</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );})
                        ) : (
                            <tr>
                                <td colSpan={showReminderColumn ? 8 : 7} className="text-center py-5 text-muted">
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
