import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiFileText,
    FiCreditCard,
    FiRefreshCw,
    FiGift,
    FiAlertTriangle,
    FiCheckCircle,
    FiChevronRight,
    FiBell,
    FiInfo
} from "react-icons/fi";
import { webservices } from "../servics/CustomerServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import { getUserInfo } from "../../utils/userRole";
import "./dashboard.css";

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState("Good Morning");
    const [userName, setUserName] = useState("Somya");
    const [fileStatus, setFileStatus] = useState({
        presentfilestatus: 1,
        pfilename: "Basic Info Pending",
        filenumber: "",
        document_count: 0,
        pendingAmount: 0,
        tax_filing_status: false
    });
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);

    const getStatusDetails = (statusId) => {
        const statusMap = {
            0: { name: "To Be Assigned", percentage: 0, activeStepIndex: -1, isPending: true, stepText: "Step 1 of 5 - Awaiting Assignment" },
            1: { name: "Basic Info Pending", percentage: 0, activeStepIndex: 0, isPending: true, stepText: "Step 1 of 5 - Personal Info Pending" },
            3: { name: "Interview Pending", percentage: 0, activeStepIndex: 0, isPending: true, stepText: "Step 1 of 5 - Interview Pending" },
            4: { name: "Docs Upload Pending", percentage: 10, activeStepIndex: 1, isPending: true, stepText: "Step 2 of 5 - Document Upload" },
            5: { name: "Other Docs Upload Pending", percentage: 10, activeStepIndex: 1, isPending: true, stepText: "Step 2 of 5 - Other Docs Upload Pending" },
            6: { name: "Preparation Pending", percentage: 30, activeStepIndex: 2, isPending: true, stepText: "Step 3 of 5 - Tax Preparation" },
            16: { name: "Pre-Synopsys Pending", percentage: 30, activeStepIndex: 2, isPending: true, stepText: "Step 3 of 5 - Pre-Synopsys Pending" },
            7: { name: "Synopsys Pending", percentage: 30, activeStepIndex: 2, isPending: true, stepText: "Step 3 of 5 - Synopsis Review" },
            8: { name: "Payment Pending", percentage: 30, activeStepIndex: 2, isPending: true, stepText: "Step 3 of 5 - Payment Pending" },
            9: { name: "Review Pending", percentage: 50, activeStepIndex: 3, isPending: true, stepText: "Step 4 of 5 - Tax Review" },
            10: { name: "Confirmation Pending", percentage: 70, activeStepIndex: 4, isPending: true, stepText: "Step 5 of 5 - Client Confirmation" },
            17: { name: "Pre E-Filing Pending", percentage: 70, activeStepIndex: 4, isPending: true, stepText: "Step 5 of 5 - Pre E-Filing" },
            11: { name: "E-Filing Pending", percentage: 85, activeStepIndex: 4, isPending: true, stepText: "Step 5 of 5 - Ready to File" },
            12: { name: "Paper-Filing Pending", percentage: 85, activeStepIndex: 4, isPending: true, stepText: "Step 5 of 5 - Paper-Filing Pending" },
            13: { name: "E-Filing Complete", percentage: 100, activeStepIndex: 5, isPending: false, stepText: "Completed - Filed Successfully" },
            14: { name: "Filing Docs Sent", percentage: 100, activeStepIndex: 5, isPending: false, stepText: "Completed - Filing Docs Sent" },
            15: { name: "Cancel Filing", percentage: 0, activeStepIndex: -1, isPending: true, stepText: "Cancelled" }
        };

        const current = statusMap[statusId] || { name: fileStatus.pfilename || "In Progress", percentage: 0, activeStepIndex: 0, isPending: true, stepText: "Tax Filing in progress" };

        if (fileStatus.tax_filing_status) {
            return {
                name: "E-Filing Complete",
                percentage: 100,
                activeStepIndex: 5,
                isPending: false,
                stepText: "Completed - Filed Successfully"
            };
        }

        return current;
    };

    const statusDetails = getStatusDetails(Number(fileStatus.presentfilestatus));

    const fetchNotifications = useCallback(async () => {
        const uinfo = getUserInfo();
        const clientId = uinfo.client_id || uinfo.user_id || uinfo.id || uinfo.userId;
        if (!clientId) return;

        try {
            setNotifLoading(true);
            const res = await webservices.getUserNotifications({
                client_id: Number(clientId) || clientId,
                userId: Number(clientId) || clientId,
                user_id: Number(clientId) || clientId
            });
            if (res?.data && (res.data.status === true || res.data.http_code === 200)) {
                setNotifications(res.data.notifications || []);
            }
        } catch (err) {
            console.warn("Failed to fetch dashboard notifications:", err);
        } finally {
            setNotifLoading(false);
        }
    }, []);

    const handleMarkSingleRead = async (notificationId) => {
        try {
            await webservices.markNotificationAsRead({ notificationId });
            setNotifications(prev => prev.map(n => n.notificationId === notificationId ? { ...n, readStatus: "1" } : n));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }
    };

    const handleMarkAllRead = async () => {
        const uinfo = getUserInfo();
        const clientId = uinfo.client_id || uinfo.user_id || uinfo.id || uinfo.userId;
        try {
            await webservices.markNotificationAsRead({
                client_id: Number(clientId) || clientId,
                userId: Number(clientId) || clientId,
                user_id: Number(clientId) || clientId,
                mark_all: true
            });
            setNotifications(prev => prev.map(n => ({ ...n, readStatus: "1" })));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch (err) {
            console.error("Failed to mark all notifications read:", err);
        }
    };

    useEffect(() => {
        const updateGreeting = () => {
            const hours = new Date().getHours();
            if (hours < 12) setGreeting("Good Morning");
            else if (hours < 17) setGreeting("Good Afternoon");
            else setGreeting("Good Evening");

            const userInfoStr = localStorage.getItem("userInfo");
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    if (parsed.user_name) setUserName(parsed.user_name);
                    else if (parsed.name) setUserName(parsed.name);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        const fetchFileStatus = async () => {
            const userInfoStr = localStorage.getItem("userInfo");
            if (!userInfoStr) return;
            try {
                const userInfo = JSON.parse(userInfoStr);
                const client_id = userInfo.client_id;
                const taxYear = getStoredTaxYear();
                const payload = {
                    client_id: String(client_id),
                    taxyear: String(taxYear),
                    taxYear: String(taxYear)
                };
                const res = await webservices.currentfileststus(payload);
                if (res.data && res.data.http_code === 200) {
                    const statusId = res.data.presentfilestatus;
                    const statusNames = {
                        0: "To Be Assigned",
                        1: "Basic Info Pending",
                        3: "Interview Pending",
                        4: "Docs Upload Pending",
                        5: "Other Docs Upload Pending",
                        6: "Preparation Pending",
                        16: "Pre-Synopsys Pending",
                        7: "Synopsys Pending",
                        8: "Payment Pending",
                        9: "Review Pending",
                        10: "Confirmation Pending",
                        17: "Pre E-Filing Pending",
                        11: "E-Filing Pending",
                        12: "Paper-Filing Pending",
                        13: "E-Filing Complete",
                        14: "Filing Docs Sent",
                        15: "Cancel Filing"
                    };
                    const name = statusNames[statusId] || res.data.pfilename || "To Be Assigned";

                    const isTaxFiled = res.data.tax_filing_status !== undefined
                        ? Boolean(res.data.tax_filing_status)
                        : (res.data.taxFilingStatus !== undefined
                            ? Boolean(res.data.taxFilingStatus)
                            : (Number(statusId) === 13 || Number(statusId) === 14));

                    const docCount = res.data.document_count !== undefined
                        ? Number(res.data.document_count)
                        : 0;

                    const pendingAmt = res.data.pendingAmount !== undefined
                        ? Number(res.data.pendingAmount)
                        : 0;

                    const statusInfo = {
                        presentfilestatus: statusId,
                        pfilename: name,
                        filenumber: res.data.filenumber || "",
                        document_count: docCount,
                        pendingAmount: pendingAmt,
                        tax_filing_status: isTaxFiled
                    };
                    setFileStatus(statusInfo);
                    localStorage.setItem("currentFileStatus", JSON.stringify(statusInfo));
                    window.dispatchEvent(new Event("fileStatusUpdated"));
                }
            } catch (error) {
                console.error("Failed to fetch file status:", error);
            }
        };

        updateGreeting();
        try {
            const stored = localStorage.getItem("currentFileStatus");
            if (stored) {
                const parsed = JSON.parse(stored);
                setFileStatus(parsed);
            }
        } catch (e) {
            console.error(e);
        }
        fetchFileStatus();
        fetchNotifications();

        const handleStatusUpdate = () => {
            try {
                const stored = localStorage.getItem("currentFileStatus");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setFileStatus(parsed);
                }
            } catch (e) {
                console.error(e);
            }
        };

        const handleNotifUpdate = () => {
            fetchNotifications();
        };

        window.addEventListener("fileStatusUpdated", handleStatusUpdate);
        window.addEventListener("notificationsUpdated", handleNotifUpdate);
        return () => {
            window.removeEventListener("fileStatusUpdated", handleStatusUpdate);
            window.removeEventListener("notificationsUpdated", handleNotifUpdate);
        };
    }, [fetchNotifications]);

    const statusId = Number(fileStatus.presentfilestatus);

    const tasks = [
        {
            id: 1,
            text: "Complete Personal Details",
            subtext: statusId >= 4 ? "Completed" : "Awaiting submission",
            completed: statusId >= 4,
            urgent: statusId < 4
        },
        {
            id: 2,
            text: "Upload Tax Documents",
            subtext: (fileStatus.document_count || 0) > 0 ? `${fileStatus.document_count} Document(s) Uploaded` : (statusId >= 6 ? "Completed" : "Required from taxpayer"),
            completed: (fileStatus.document_count || 0) > 0 || statusId >= 6,
            urgent: (fileStatus.document_count || 0) === 0 && (statusId === 4 || statusId === 5)
        },
        {
            id: 3,
            text: "Review Tax Summary",
            subtext: statusId >= 8 ? "Completed" : (statusId === 7 ? "Awaiting your review" : "Awaiting preparation"),
            completed: statusId >= 8,
            urgent: statusId === 7
        },
        {
            id: 4,
            text: "Make Payment",
            subtext: (fileStatus.pendingAmount || 0) === 0 && statusId >= 8 ? "Paid" : (statusId >= 10 ? "Completed" : (statusId === 8 || statusId === 9 ? `$${fileStatus.pendingAmount || 0} Due Now` : "Awaiting tax summary")),
            completed: (fileStatus.pendingAmount || 0) === 0 && statusId >= 8,
            urgent: (fileStatus.pendingAmount || 0) > 0 && (statusId === 8 || statusId === 9)
        },
        {
            id: 5,
            text: "Sign Tax Authorization (Form 8879)",
            subtext: statusId >= 11 ? "Completed" : (statusId === 10 || statusId === 17 ? "Awaiting signature" : "Awaiting payment"),
            completed: statusId >= 11,
            urgent: statusId === 10 || statusId === 17
        }
    ];

    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <div className="db-container">
            <header className="db-header">
                <span className="db-pre-heading">WELCOME</span>
                <h1 className="db-greeting">{greeting}, {userName}</h1>
            </header>

            <section className="db-progress-card">
                <div className="db-progress-header">
                    <div>
                        <h2 className="db-progress-val">{statusDetails.percentage}% <span className="track_com"> Complete </span></h2>
                        <p className="db-progress-step">{statusDetails.stepText}</p>
                    </div>
                    <div className="db-status-badge">
                        <span className="db-status-dot"></span>
                        <span className="db-status-text">{statusDetails.name}</span>
                    </div>
                </div>

                <div className="db-timeline">
                    {["Personal Info", "Documents", "Payment", "Tax Summary", "Review", "Filed"].map((stepName, index) => {
                        let stepClass = "db-step";
                        if (index < statusDetails.activeStepIndex) {
                            stepClass = "db-step active";
                        } else if (index === statusDetails.activeStepIndex) {
                            if (statusDetails.percentage === 100) {
                                stepClass = "db-step active";
                            } else {
                                stepClass = "db-step active-pending";
                            }
                        }
                        return (
                            <div key={index} className={stepClass}>
                                <div className="db-bar"></div>
                                <span>{stepName}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="db-stats-grid">
                {/* 1. Document Uploaded Card */}
                <div className="db-stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/customer/documents")}>
                    <div className="db-stat-top">
                        <div className={`db-icon-box ${(fileStatus.document_count || 0) > 0 ? "success" : "warning"}`}>
                            <FiFileText />
                        </div>
                        <span className={(fileStatus.document_count || 0) > 0 ? "db-tag-action" : "db-tag-due"}>
                            {(fileStatus.document_count || 0) > 0 ? "Uploaded" : "Action Needed"}
                        </span>
                    </div>
                    <h3 className="db-stat-num">{fileStatus.document_count !== undefined ? fileStatus.document_count : 0}</h3>
                    <p className="db-stat-label">Document Uploaded</p>
                </div>

                {/* 2. Payment Status Card */}
                <div className="db-stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/customer/payments")}>
                    <div className="db-stat-top">
                        <div className={`db-icon-box ${(fileStatus.pendingAmount || 0) > 0 ? "warning" : "success"}`}>
                            <FiCreditCard />
                        </div>
                        <span className={(fileStatus.pendingAmount || 0) > 0 ? "db-tag-due" : "db-tag-action"}>
                            {(fileStatus.pendingAmount || 0) > 0 ? "Due Now" : "Paid"}
                        </span>
                    </div>
                    <h3 className="db-stat-num">${Number(fileStatus.pendingAmount || 0).toLocaleString()}</h3>
                    <p className="db-stat-label">
                        {(fileStatus.pendingAmount || 0) > 0 ? "Payment Status - Unpaid" : "Payment Status - Paid"}
                    </p>
                </div>

                {/* 3. Tax Filing Status Card */}
                <div className="db-stat-card">
                    <div className="db-stat-top">
                        <div className={`db-icon-box ${fileStatus.tax_filing_status ? "success" : "primary"}`}>
                            <FiRefreshCw />
                        </div>
                        <span className={fileStatus.tax_filing_status ? "db-tag-action" : "db-tag-track"}>
                            {fileStatus.tax_filing_status ? "Completed" : "On Track"}
                        </span>
                    </div>
                    <h3 className="db-stat-num" style={{ fontSize: "1.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {fileStatus.tax_filing_status ? "Filed" : (fileStatus.pfilename || "In Progress")}
                    </h3>
                    <p className="db-stat-label">Tax Filing Status</p>
                </div>

                {/* 4. Referral Card */}
                <div className="db-stat-card invite" style={{ cursor: "pointer" }} onClick={() => navigate("/customer/referrals")}>
                    <div className="db-stat-top">
                        <div className="db-icon-box white"><FiGift /></div>
                        <span className="db-tag-earn">Earn Upto $100</span>
                    </div>
                    <h3 className="db-stat-title">Invite Friends</h3>
                    <p className="db-stat-label">Referral program</p>
                </div>
            </section>

            <section className="db-bottom-grid">
                <div className="db-panel">
                    <div className="db-panel-header">
                        <h2>Notifications</h2>
                        {notifications.some(n => String(n.readStatus) === "0" || n.readStatus === 0 || n.readStatus === false) && (
                            <button onClick={handleMarkAllRead}>Mark all read</button>
                        )}
                    </div>
                    <div className="db-notif-list">
                        {notifLoading ? (
                            <div className="text-center py-4 text-muted small">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-4 text-muted small">No notifications yet</div>
                        ) : (
                            notifications.map((n, idx) => {
                                const isUnread = String(n.readStatus) === "0" || n.readStatus === 0 || n.readStatus === false;
                                return (
                                    <div
                                        key={n.notificationId || idx}
                                        className={`db-notif-item ${isUnread ? "unread" : ""}`}
                                        style={{ cursor: isUnread ? "pointer" : "default" }}
                                        onClick={() => isUnread && n.notificationId && handleMarkSingleRead(n.notificationId)}
                                    >
                                        <div className={`db-notif-icon ${isUnread ? "primary" : "read"}`}>
                                            <FiInfo />
                                        </div>
                                        <div className="db-notif-body">
                                            <p className={isUnread ? "fw-bold text-dark" : "text-secondary"}>
                                                {n.message}
                                            </p>
                                            <span>
                                                {n.analystName ? `${n.analystName} • ` : ""}
                                                {n.createdOn ? new Date(n.createdOn).toLocaleString() : ""}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="db-panel">
                    <div className="db-panel-header">
                        <h2>Pending Tasks</h2>
                        <span>{completedCount} of {tasks.length} completed</span>
                    </div>
                    <div className="db-task-list">
                        {tasks.map((task) => {
                            const getTaskRoute = (id) => {
                                if (id === 1) return "/customer/profile";
                                if (id === 2) return "/customer/documents";
                                if (id === 4) return "/customer/payments";
                                return "/customer";
                            };

                            return (
                                <div
                                    key={task.id}
                                    className={`db-task-item ${task.completed ? "done" : ""}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate(getTaskRoute(task.id))}
                                >
                                    <input type="checkbox" checked={task.completed} readOnly />
                                    <div className="db-task-body">
                                        <p>{task.text}</p>
                                        <span>{task.subtext}</span>
                                    </div>
                                    {task.urgent && !task.completed && <span className="db-task-urgent">Urgent</span>}
                                    <FiChevronRight />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomerDashboard;
