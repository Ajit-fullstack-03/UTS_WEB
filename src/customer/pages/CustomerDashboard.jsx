import React, { useState } from "react";
import {
    FiFileText,
    FiCreditCard,
    FiRefreshCw,
    FiGift,
    FiAlertTriangle,
    FiCheckCircle,
    FiChevronRight
} from "react-icons/fi";
import "./dashboard.css";

const CustomerDashboard = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Complete Personal Details", subtext: "Completed on 18 Jul 2026", completed: true, urgent: false },
        { id: 2, text: "Upload Form 16", subtext: "Required from your employer", completed: false, urgent: true },
        { id: 3, text: "Verify Bank Account Details", subtext: "Completed on 15 Jul 2026", completed: true, urgent: false },
        { id: 4, text: "Sign Tax Authorization (Form 8879)", subtext: "Awaiting preparation", completed: false, urgent: false }
    ]);

    const [notifications, setNotifications] = useState([
        { id: 1, type: "warning", message: "Form 16 missing", details: " - upload before 25 Jul to avoid delay", time: "2 hours ago", unread: true },
        { id: 2, type: "success", message: "Document verification", details: " completed for PAN & Aadhaar", time: "Yesterday", unread: true }
    ]);

    const handleToggleTask = (id) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

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
                <h1 className="db-greeting">Good Morning, Somya</h1>
            </header>

            <section className="db-progress-card">
                <div className="db-progress-header">
                    <div>
                        <h2 className="db-progress-val">40% <span className="track_com"> Complete </span></h2>
                        <p className="db-progress-step">Step 2 of 5 - Document Upload</p>
                    </div>
                    <div className="db-status-badge">
                        <span className="db-status-dot"></span>
                        <span className="db-status-text">In Progress - Documents Pending</span>
                    </div>
                </div>

                <div className="db-timeline">
                    <div className="db-step active"><div className="db-bar"></div><span>Personal Info</span></div>
                    <div className="db-step active-pending"><div className="db-bar"></div><span>Documents</span></div>
                    <div className="db-step"><div className="db-bar"></div><span>Tax Summary</span></div>
                    <div className="db-step"><div className="db-bar"></div><span>Payment</span></div>
                    <div className="db-step"><div className="db-bar"></div><span>Review</span></div>
                    <div className="db-step"><div className="db-bar"></div><span>Filed</span></div>
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
                            <div key={task.id} className={`db-task-item ${task.completed ? "done" : ""}`} onClick={() => handleToggleTask(task.id)}>
                                <input type="checkbox" checked={task.completed} readOnly />
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
