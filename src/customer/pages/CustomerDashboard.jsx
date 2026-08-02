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
    // Interactive state for tasks
    const [tasks, setTasks] = useState([
        { id: 1, text: "Complete Personal Details", subtext: "Completed on 18 Jul 2026", completed: true, urgent: false },
        { id: 2, text: "Upload Form 16", subtext: "Required from your employer", completed: false, urgent: true },
        { id: 3, text: "Verify Bank Account Details", subtext: "Completed on 15 Jul 2026", completed: true, urgent: false },
        { id: 4, text: "Sign Tax Authorization (Form 8879)", subtext: "Awaiting preparation", completed: false, urgent: false }
    ]);

    // Notification states
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
        <div className="dashboard-content-wrapper">
            {/* Greetings Panel */}
            <div className="mb-4">
                <span className="text-muted small fw-bold tracking-wider">WELCOME</span>
                <h2 className="dashboard-greeting fw-bold text-navy mt-1">Good Morning, Somya</h2>
            </div>

            {/* Blue Progress Card */}
            <div className="progress-banner-card text-white p-4 mb-4 rounded-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                    <div>
                        <h3 className="progress-percentage fw-bold mb-0">40% Complete</h3>
                        <span className="progress-step-indicator small opacity-75">Step 2 of 5 - Document Upload</span>
                    </div>
                    <div className="progress-status-badge d-flex align-items-center gap-2 px-3 py-2 rounded-pill">
                        <span className="status-dot"></span>
                        <span className="small fw-semibold">In Progress - Documents Pending</span>
                    </div>
                </div>

                {/* Horizontal steps timeline bar */}
                <div className="progress-timeline-row row g-3 text-center mt-3">
                    <div className="col-4 col-md-2">
                        <div className="timeline-bar active"></div>
                        <span className="timeline-label small fw-medium">Personal Info</span>
                    </div>
                    <div className="col-4 col-md-2">
                        <div className="timeline-bar active-pending"></div>
                        <span className="timeline-label small fw-medium opacity-75">Documents</span>
                    </div>
                    <div className="col-4 col-md-2">
                        <div className="timeline-bar"></div>
                        <span className="timeline-label small fw-medium opacity-50">Tax Summary</span>
                    </div>
                    <div className="col-4 col-md-2">
                        <div className="timeline-bar"></div>
                        <span className="timeline-label small fw-medium opacity-50">Payment</span>
                    </div>
                    <div className="col-4 col-md-2">
                        <div className="timeline-bar"></div>
                        <span className="timeline-label small fw-medium opacity-50">Review</span>
                    </div>
                    <div className="col-4 col-md-2">
                        <div className="timeline-bar"></div>
                        <span className="timeline-label small fw-medium opacity-50">Filed</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="row g-4 mb-4">
                {/* Stats 1 */}
                <div className="col-md-6 col-lg-3">
                    <div className="stat-card p-4 rounded-4 shadow-sm bg-white border-0 h-100 d-flex flex-column justify-content-between">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="stat-icon-wrapper bg-success-light text-success rounded-3 p-3 d-flex align-items-center justify-content-center">
                                <FiFileText size={22} />
                            </div>
                            <span className="badge badge-action-needed text-success fw-semibold rounded-pill">Action Needed</span>
                        </div>
                        <div className="mt-4">
                            <h2 className="stat-value fw-bold mb-1">7/10</h2>
                            <p className="text-muted small mb-0 fw-medium">Document Uploaded</p>
                        </div>
                    </div>
                </div>

                {/* Stats 2 */}
                <div className="col-md-6 col-lg-3">
                    <div className="stat-card p-4 rounded-4 shadow-sm bg-white border-0 h-100 d-flex flex-column justify-content-between">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="stat-icon-wrapper bg-warning-light text-warning rounded-3 p-3 d-flex align-items-center justify-content-center">
                                <FiCreditCard size={22} />
                            </div>
                            <span className="badge badge-due-now text-warning fw-semibold rounded-pill">Due Now</span>
                        </div>
                        <div className="mt-4">
                            <h2 className="stat-value fw-bold mb-1">$0</h2>
                            <p className="text-muted small mb-0 fw-medium">Payment Status - Unpaid</p>
                        </div>
                    </div>
                </div>

                {/* Stats 3 */}
                <div className="col-md-6 col-lg-3">
                    <div className="stat-card p-4 rounded-4 shadow-sm bg-white border-0 h-100 d-flex flex-column justify-content-between">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="stat-icon-wrapper bg-primary-light text-primary rounded-3 p-3 d-flex align-items-center justify-content-center">
                                <FiRefreshCw size={20} />
                            </div>
                            <span className="badge badge-on-track text-primary fw-semibold rounded-pill">On Track</span>
                        </div>
                        <div className="mt-4">
                            <h2 className="stat-value fw-bold mb-1">Drafting</h2>
                            <p className="text-muted small mb-0 fw-medium">Tax Filing Status</p>
                        </div>
                    </div>
                </div>

                {/* Stats 4 - Invite Friends (Dark Blue) */}
                <div className="col-md-6 col-lg-3">
                    <div className="stat-card invite-card text-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="stat-icon-wrapper bg-white-light rounded-3 p-3 d-flex align-items-center justify-content-center">
                                <FiGift size={22} />
                            </div>
                            <span className="badge badge-earn fw-bold rounded-pill">Earn Upto $100</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="stat-title-invite fw-bold mb-1">Invite Friends</h3>
                            <p className="small mb-0 opacity-75 fw-medium">Referral program</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Notifications & Pending Tasks */}
            <div className="row g-4">
                {/* Notifications Column */}
                <div className="col-lg-6">
                    <div className="content-box p-4 bg-white rounded-4 shadow-sm h-100 border-0">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="box-title fw-bold text-navy mb-0">Notifications</h4>
                            <button 
                                className="btn btn-link text-decoration-none text-navy p-0 small fw-semibold"
                                onClick={handleMarkAllRead}
                            >
                                Mark all read
                            </button>
                        </div>

                        <div className="notifications-list d-flex flex-column gap-3">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="notification-item d-flex align-items-start gap-3 p-3 rounded-3 position-relative">
                                    <div className={`notif-icon-circle rounded-circle p-2 d-flex align-items-center justify-content-center ${
                                        notif.type === "warning" ? "bg-danger-light text-danger" : "bg-success-light text-success"
                                    }`}>
                                        {notif.type === "warning" ? (
                                            <FiAlertTriangle size={18} />
                                        ) : (
                                            <FiCheckCircle size={18} />
                                        )}
                                    </div>
                                    <div className="notif-text flex-grow-1">
                                        <p className="mb-1 small text-dark">
                                            <span className="fw-semibold">{notif.message}</span>
                                            {notif.details}
                                        </p>
                                        <span className="notif-time text-muted small">{notif.time}</span>
                                    </div>
                                    {notif.unread && (
                                        <span className="unread-dot position-absolute top-50 translate-middle-y end-0 me-3"></span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pending Tasks Column */}
                <div className="col-lg-6">
                    <div className="content-box p-4 bg-white rounded-4 shadow-sm h-100 border-0">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="box-title fw-bold text-navy mb-0">Pending Tasks</h4>
                            <span className="text-muted small fw-medium">{completedCount} of {tasks.length} completed</span>
                        </div>

                        <div className="tasks-list d-flex flex-column gap-3">
                            {tasks.map((task) => (
                                <div 
                                    key={task.id} 
                                    className={`task-item d-flex align-items-center justify-content-between p-3 rounded-3 cursor-pointer ${
                                        task.completed ? "task-completed-bg" : ""
                                    }`}
                                    onClick={() => handleToggleTask(task.id)}
                                >
                                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                                        <div className="task-checkbox-container position-relative">
                                            <input 
                                                type="checkbox" 
                                                checked={task.completed} 
                                                onChange={() => {}} /* Handled by parent div click */
                                                className="task-custom-checkbox cursor-pointer" 
                                            />
                                        </div>
                                        <div className="task-details">
                                            <p className={`mb-0 small fw-semibold text-dark ${
                                                task.completed ? "text-decoration-line-through text-muted" : ""
                                            }`}>
                                                {task.text}
                                            </p>
                                            <span className="task-subtext text-muted small">{task.subtext}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        {task.urgent && !task.completed && (
                                            <span className="badge bg-danger-light text-danger rounded-pill px-2 py-1 small fw-semibold">Urgent</span>
                                        )}
                                        <FiChevronRight className="text-muted" size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
