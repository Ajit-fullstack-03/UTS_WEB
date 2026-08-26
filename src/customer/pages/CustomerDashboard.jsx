import React, { useState, useEffect } from "react";
import {
    FiFileText,
    FiCreditCard,
    FiRefreshCw,
    FiGift,
    FiAlertTriangle,
    FiCheckCircle,
    FiChevronRight
} from "react-icons/fi";
import { webservices } from "../servics/CustomerServices";
import "./dashboard.css";

const CustomerDashboard = () => {
    const [greeting, setGreeting] = useState("Good Morning");
    const [userName, setUserName] = useState("Somya");
    const [fileStatus, setFileStatus] = useState({
        presentfilestatus: 1,
        pfilename: "Basic Info Pending",
        filenumber: ""
    });

    const getStatusDetails = (statusId) => {
        const statusMap = {
            0: { name: "To Be Assigned", percentage: 0, activeStepIndex: -1, isPending: true, stepText: "Step 1 of 5 - Awaiting Assignment" },
            1: { name: "Basic Info Pending", percentage: 10, activeStepIndex: 0, isPending: true, stepText: "Step 1 of 5 - Personal Info Pending" },
            3: { name: "Interview Pending", percentage: 20, activeStepIndex: 1, isPending: true, stepText: "Step 1 of 5 - Interview Pending" },
            4: { name: "Docs Upload Pending", percentage: 40, activeStepIndex: 1, isPending: true, stepText: "Step 2 of 5 - Document Upload" },
            5: { name: "Other Docs Upload Pending", percentage: 50, activeStepIndex: 1, isPending: true, stepText: "Step 2 of 5 - Other Docs Upload Pending" },
            6: { name: "Preparation Pending", percentage: 55, activeStepIndex: 2, isPending: true, stepText: "Step 2 of 5 - Tax Preparation in Progress" },
            16: { name: "Pre-Synopsys Pending", percentage: 58, activeStepIndex: 2, isPending: true, stepText: "Step 2 of 5 - Pre-Synopsys Preparation" },
            7: { name: "Synopsys Pending", percentage: 70, activeStepIndex: 3, isPending: true, stepText: "Step 3 of 5 - Tax Summary Ready for Review" },
            8: { name: "Payment Pending", percentage: 80, activeStepIndex: 3, isPending: true, stepText: "Step 4 of 5 - Payment Pending" },
            9: { name: "Review Pending", percentage: 85, activeStepIndex: 4, isPending: true, stepText: "Step 4 of 5 - Awaiting Payment" },
            10: { name: "Confirmation Pending", percentage: 92, activeStepIndex: 5, isPending: true, stepText: "Step 5 of 5 - Confirmation Pending" },
            17: { name: "Pre E-Filing Pending", percentage: 95, activeStepIndex: 5, isPending: true, stepText: "Step 5 of 5 - Pre E-Filing Pending" },
            11: { name: "E-Filing Pending", percentage: 97, activeStepIndex: 5, isPending: true, stepText: "Step 5 of 5 - E-Filing Pending" },
            12: { name: "Paper-Filing Pending", percentage: 97, activeStepIndex: 5, isPending: true, stepText: "Step 5 of 5 - Paper-Filing Pending" },
            13: { name: "E-Filing Complete", percentage: 100, activeStepIndex: 5, isPending: false, stepText: "Filed - E-Filing Complete" },
            14: { name: "Filing Docs Sent", percentage: 100, activeStepIndex: 5, isPending: false, stepText: "Filed - Filing Docs Sent" },
            15: { name: "Cancel Filing", percentage: 0, activeStepIndex: -1, isPending: false, stepText: "Filing Cancelled" }
        };
        return statusMap[statusId] || { name: "To Be Assigned", percentage: 0, activeStepIndex: -1, isPending: true, stepText: "Step 1 of 5 - Awaiting Assignment" };
    };

    const statusDetails = getStatusDetails(fileStatus.presentfilestatus);

    useEffect(() => {
        const updateGreeting = () => {
            let name = "Somya";
            try {
                const userInfoStr = localStorage.getItem("userInfo");
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr);
                    if (userInfo.user_name) {
                        name = userInfo.user_name.split(" ")[0];
                    }
                }
            } catch (e) {
                console.error("Failed to parse userInfo from localStorage", e);
            }

            const hour = new Date().getHours();
            let greet = "Good Morning";
            if (hour >= 12 && hour < 17) {
                greet = "Good Afternoon";
            } else if (hour >= 17 && hour < 22) {
                greet = "Good Evening";
            } else if (hour >= 22 || hour < 5) {
                greet = "Good Night";
            }

            setGreeting(greet);
            setUserName(name);
        };

        const fetchFileStatus = async () => {
            const userInfoStr = localStorage.getItem("userInfo");
            if (!userInfoStr) return;
            try {
                const userInfo = JSON.parse(userInfoStr);
                const client_id = userInfo.client_id;
                const taxYear = userInfo.taxyear || userInfo.taxYear || userInfo.current_year || String(new Date().getFullYear());
                const payload = {
                    client_id: String(client_id),
                    taxyear: String(taxYear)
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
                    const statusInfo = {
                        presentfilestatus: statusId,
                        pfilename: name,
                        filenumber: res.data.filenumber || ""
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
        window.addEventListener("fileStatusUpdated", handleStatusUpdate);
        return () => {
            window.removeEventListener("fileStatusUpdated", handleStatusUpdate);
        };
    }, []);

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
            subtext: statusId >= 6 ? "Completed" : "Required from taxpayer",
            completed: statusId >= 6,
            urgent: statusId === 4 || statusId === 5
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
            subtext: statusId >= 10 ? "Completed" : (statusId === 8 || statusId === 9 ? "Payment required" : "Awaiting tax summary"),
            completed: statusId >= 10,
            urgent: statusId === 8 || statusId === 9
        },
        {
            id: 5,
            text: "Sign Tax Authorization (Form 8879)",
            subtext: statusId >= 11 ? "Completed" : (statusId === 10 || statusId === 17 ? "Awaiting signature" : "Awaiting payment"),
            completed: statusId >= 11,
            urgent: statusId === 10 || statusId === 17
        }
    ];

    const [notifications, setNotifications] = useState([
        { id: 1, type: "warning", message: "Form 16 missing", details: " - upload before 25 Jul to avoid delay", time: "2 hours ago", unread: true },
        { id: 2, type: "success", message: "Document verification", details: " completed for PAN & Aadhaar", time: "Yesterday", unread: true }
    ]);

    const handleMarkAllRead = () => {
        setNotifications(prevNotifs =>
            prevNotifs.map(n => ({ ...n, unread: false }))
        );
    };

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
                    {["Personal Info", "Documents", "Tax Summary", "Payment", "Review", "Filed"].map((stepName, index) => {
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
                <div className="db-stat-card">
                    <div className="db-stat-top">
                        <div className="db-icon-box success"><FiFileText /></div>
                        <span className="db-tag-action">Action Needed</span>
                    </div>
                    <h3 className="db-stat-num">7/10</h3>
                    <p className="db-stat-label">Document Uploaded</p>
                </div>

                <div className="db-stat-card">
                    <div className="db-stat-top">
                        <div className="db-icon-box warning"><FiCreditCard /></div>
                        <span className="db-tag-due">Due Now</span>
                    </div>
                    <h3 className="db-stat-num">$0</h3>
                    <p className="db-stat-label">Payment Status - Unpaid</p>
                </div>

                <div className="db-stat-card">
                    <div className="db-stat-top">
                        <div className="db-icon-box primary"><FiRefreshCw /></div>
                        <span className="db-tag-track">On Track</span>
                    </div>
                    <h3 className="db-stat-num">Drafting</h3>
                    <p className="db-stat-label">Tax Filing Status</p>
                </div>

                <div className="db-stat-card invite">
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
                        <button onClick={handleMarkAllRead}>Mark all read</button>
                    </div>
                    <div className="db-notif-list">
                        {notifications.map((n) => (
                            <div key={n.id} className="db-notif-item">
                                <div className={`db-notif-icon ${n.type}`}>{n.type === "warning" ? <FiAlertTriangle /> : <FiCheckCircle />}</div>
                                <div className="db-notif-body">
                                    <p><strong>{n.message}</strong>{n.details}</p>
                                    <span>{n.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="db-panel">
                    <div className="db-panel-header">
                        <h2>Pending Tasks</h2>
                        <span>{completedCount} of {tasks.length} completed</span>
                    </div>
                    <div className="db-task-list">
                        {tasks.map((task) => (
                            <div key={task.id} className={`db-task-item ${task.completed ? "done" : ""} disabled-task`}>
                                <input type="checkbox" checked={task.completed} disabled />
                                <div className="db-task-body">
                                    <p>{task.text}</p>
                                    <span>{task.subtext}</span>
                                </div>
                                {task.urgent && !task.completed && <span className="db-task-urgent">Urgent</span>}
                                <FiChevronRight />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomerDashboard;
