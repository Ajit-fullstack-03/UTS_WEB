import React, { useState, useEffect, useCallback } from "react";
import {
    FiCreditCard,
    FiFileText,
    FiCheckCircle,
    FiClock,
    FiLock,
    FiShield,
    FiX,
    FiRefreshCw,
    FiAlertCircle,
    FiChevronRight
} from "react-icons/fi";
import Swal from "sweetalert2";
import { webservices } from "../servics/CustomerServices";
import { getStoredTaxYear } from "../../utils/taxYear";
import "./payments.css";

// Helper to dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const CustomerPayments = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all"); // "all", "unpaid", "paid"
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Helper to get currency symbol
    const getCurrencySymbol = (currency) => {
        if (!currency) return "$";
        const c = String(currency).toUpperCase().trim();
        if (c === "INR" || c === "INDIA") return "₹";
        if (c === "EUR") return "€";
        if (c === "GBP") return "£";
        return "$";
    };

    // Helper to calculate exact discount amount
    const calculateDiscountAmount = (order) => {
        if (!order) return 0;
        const std = parseFloat(order.p_standardAmount || 0);
        const discVal = parseFloat(order.p_discountValue || 0);
        const finalAmt = parseFloat(order.p_amount || 0);

        if (order.p_discountType === "Percentage" && discVal > 0) {
            return (std * discVal) / 100;
        } else if (order.p_discountType === "Flat" && discVal > 0) {
            return discVal;
        } else if (std > finalAmt) {
            return std - finalAmt;
        }
        return discVal;
    };

    // Fetch orders from API (/payment/viewOrders)
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const userInfoStr = localStorage.getItem("userInfo");
            let clientId = "";
            if (userInfoStr) {
                try {
                    const parsed = JSON.parse(userInfoStr);
                    clientId = parsed.client_id || parsed.user_id || parsed.id || "";
                } catch {
                    clientId = userInfoStr.replace(/"/g, "");
                }
            }

            const taxYear = getStoredTaxYear();
            const payload = {
                client_id: isNaN(Number(clientId)) ? clientId : Number(clientId),
                order_status: "all",
                taxyear: String(taxYear || "")
            };

            const res = await webservices.viewOrders(payload);
            const resData = res?.data;

            let orderList = [];
            if (resData) {
                if (Array.isArray(resData.data)) {
                    orderList = resData.data;
                } else if (Array.isArray(resData)) {
                    orderList = resData;
                } else if (Array.isArray(resData.orders)) {
                    orderList = resData.orders;
                } else if (Array.isArray(resData.list)) {
                    orderList = resData.list;
                } else if (typeof resData.data === "object" && resData.data !== null) {
                    orderList = [resData.data];
                }
            }

            setOrders(orderList);

            // Update stats from response or compute from array
            const paid = resData?.paid_count !== undefined
                ? resData.paid_count
                : orderList.filter(o => o.order_status === 1 || o.order_status === "1" || String(o.order_status_text).toLowerCase() === "paid").length;

            const unpaid = resData?.unpaid_count !== undefined
                ? resData.unpaid_count
                : orderList.filter(o => o.order_status === 0 || o.order_status === "0" || String(o.order_status_text).toLowerCase() !== "paid").length;

            setStats({
                total: resData?.total_records !== undefined ? resData.total_records : orderList.length,
                paid,
                unpaid
            });
        } catch (error) {
            console.error("Error fetching orders from viewOrders:", error);
            setOrders([]);
            setStats({ total: 0, paid: 0, unpaid: 0 });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const handleTaxYearChange = () => {
            fetchOrders();
        };
        window.addEventListener("taxYearChanged", handleTaxYearChange);
        return () => {
            window.removeEventListener("taxYearChanged", handleTaxYearChange);
        };
    }, [fetchOrders]);

    // Filtered orders list
    const filteredOrders = orders.filter((order) => {
        const isPaid =
            order.order_status === 1 ||
            order.order_status === "1" ||
            String(order.order_status_text).toLowerCase() === "paid";

        if (activeFilter === "unpaid") return !isPaid;
        if (activeFilter === "paid") return isPaid;
        return true;
    });

    // Handle Open Payment Summary Screen
    const handleOpenPaymentModal = (order) => {
        setSelectedOrder(order);
        setIsPaymentModalOpen(true);
    };

    // Handle Payment Checkout Flow (/payment/initiateOrder -> Razorpay -> /payment/verifyOrder)
    const handleMakePaymentSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedOrder) return;

        const orderId = selectedOrder.order_id || selectedOrder.id;
        if (!orderId) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Order ID",
                text: "Could not find a valid order ID for checkout.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        setIsProcessingPayment(true);

        try {
            // Step 1: Call /payment/initiateOrder
            const initPayload = { order_id: Number(orderId) };
            const initRes = await webservices.initiateOrder(initPayload);
            const initData = initRes?.data;

            if (initRes?.status !== 200 && initData?.http_code !== 200 && !initData?.success && !initData?.order_id && !initData?.data) {
                throw new Error(initData?.message || "Failed to initiate payment order on server.");
            }

            // Extract Razorpay order details (ensure we get the actual razorpay order_xxx string)
            const rzpOrderId =
                initData?.razorpay_order_id ||
                initData?.razorpay_order?.id ||
                initData?.data?.razorpay_order_id ||
                initData?.data?.razorpay_order?.id ||
                initData?.data?.t_order_id ||
                initData?.t_order_id ||
                (typeof initData?.order_id === "string" && initData.order_id.startsWith("order_") ? initData.order_id : null) ||
                (typeof initData?.data?.order_id === "string" && initData.data.order_id.startsWith("order_") ? initData.data.order_id : null);

            const rzpKey =
                initData?.key_id ||
                initData?.data?.key_id ||
                initData?.key ||
                initData?.data?.key ||
                process.env.REACT_APP_RAZORPAY_KEY ||
                process.env.REACT_APP_RAZORPAY_KEY_ID ||
                "rzp_test_TVZj69f7KiGNTq";

            const currencyCode =
                initData?.currency ||
                initData?.razorpay_order?.currency ||
                initData?.data?.currency ||
                (selectedOrder.currency === "INDIA" || selectedOrder.currency === "INR" ? "INR" : "USD");

            const amountInSmallestUnit =
                initData?.amount ||
                initData?.razorpay_order?.amount ||
                initData?.data?.amount ||
                Math.round(parseFloat(selectedOrder.p_amount || 0) * 100);

            // Step 2: Load Razorpay Checkout Script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded || !window.Razorpay) {
                setIsProcessingPayment(false);
                Swal.fire({
                    icon: "error",
                    title: "Gateway Unavailable",
                    text: "Razorpay payment SDK failed to load. Please check your internet connection and try again.",
                    confirmButtonColor: "#1b2e6b"
                });
                return;
            }

            // Step 3: Open Razorpay Payment Window
            const options = {
                key: rzpKey,
                amount: amountInSmallestUnit,
                currency: currencyCode,
                name: "Umpire Tax Solutions",
                description: selectedOrder.comment || `Tax preparation payment - File #${selectedOrder.filenumber || selectedOrder.order_id}`,
                order_id: rzpOrderId,
                handler: async function (response) {
                    // Step 4: Call /payment/verifyOrder with razorpay callback payload
                    try {
                        const verifyPayload = {
                            order_id: response.razorpay_order_id || rzpOrderId,
                            payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        };

                        const verifyRes = await webservices.verifyOrder(verifyPayload);
                        const verifyData = verifyRes?.data;

                        if (
                            verifyRes?.status === 200 ||
                            verifyData?.http_code === 200 ||
                            verifyData?.success ||
                            verifyData?.status === "success"
                        ) {
                            setIsPaymentModalOpen(false);
                            await fetchOrders();

                            Swal.fire({
                                icon: "success",
                                title: "Payment Verified!",
                                text: verifyData?.message || `Your payment for File #${selectedOrder.filenumber || selectedOrder.order_id} has been verified and completed successfully.`,
                                confirmButtonColor: "#1b2e6b"
                            });
                        } else {
                            Swal.fire({
                                icon: "warning",
                                title: "Verification Alert",
                                text: verifyData?.message || "Payment completed but verification returned a notice. Please refresh your orders.",
                                confirmButtonColor: "#1b2e6b"
                            });
                            await fetchOrders();
                        }
                    } catch (verifyErr) {
                        console.error("Error verifying payment order:", verifyErr);
                        Swal.fire({
                            icon: "error",
                            title: "Verification Failed",
                            text: verifyErr?.response?.data?.message || "Payment was captured but failed verification on server.",
                            confirmButtonColor: "#1b2e6b"
                        });
                    } finally {
                        setIsProcessingPayment(false);
                    }
                },
                prefill: {
                    name: selectedOrder.user_name || "",
                    email: selectedOrder.email || "",
                    contact: selectedOrder.phone || selectedOrder.mobile || ""
                },
                theme: {
                    color: "#1b2e6b"
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessingPayment(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                console.error("Razorpay payment failed:", response.error);
                setIsProcessingPayment(false);
                Swal.fire({
                    icon: "error",
                    title: "Payment Failed",
                    text: response.error?.description || "Transaction was declined or failed.",
                    confirmButtonColor: "#1b2e6b"
                });
            });

            rzp.open();
        } catch (initErr) {
            console.error("Error initiating payment order:", initErr);
            setIsProcessingPayment(false);
            Swal.fire({
                icon: "error",
                title: "Initiation Failed",
                text: initErr?.response?.data?.message || initErr.message || "Failed to initiate payment order.",
                confirmButtonColor: "#1b2e6b"
            });
        }
    };

    return (
        <div className="customer-payments-container">
            {/* Header */}
            <div className="cp-header d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <h1 className="cp-title">Tax Preparation & Payments</h1>
                    <p className="cp-subtitle">
                        View invoices, fee breakdowns, and securely complete your filing payments.
                    </p>
                </div>
                <button
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                    onClick={fetchOrders}
                    disabled={loading}
                >
                    <FiRefreshCw className={loading ? "spinner-border spinner-border-sm" : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="cp-stats-grid">
                <div className="cp-stat-card">
                    <div className="cp-stat-icon warning">
                        <FiCreditCard />
                    </div>
                    <div>
                        <div className="cp-stat-value">{stats.unpaid}</div>
                        <p className="cp-stat-label">Pending Invoices</p>
                    </div>
                </div>

                <div className="cp-stat-card">
                    <div className="cp-stat-icon success">
                        <FiCheckCircle />
                    </div>
                    <div>
                        <div className="cp-stat-value">{stats.paid}</div>
                        <p className="cp-stat-label">Paid Invoices</p>
                    </div>
                </div>

                <div className="cp-stat-card">
                    <div className="cp-stat-icon primary">
                        <FiClock />
                    </div>
                    <div>
                        <div className="cp-stat-value">{getStoredTaxYear()}</div>
                        <p className="cp-stat-label">Active Tax Year</p>
                    </div>
                </div>
            </div>

            {/* Main Orders Card */}
            <div className="cp-main-card">
                <div className="cp-card-header">
                    <div className="cp-filter-tabs">
                        <button
                            className={`cp-tab-btn ${activeFilter === "all" ? "active" : ""}`}
                            onClick={() => setActiveFilter("all")}
                        >
                            All ({orders.length})
                        </button>
                        <button
                            className={`cp-tab-btn ${activeFilter === "unpaid" ? "active" : ""}`}
                            onClick={() => setActiveFilter("unpaid")}
                        >
                            Unpaid ({stats.unpaid})
                        </button>
                        <button
                            className={`cp-tab-btn ${activeFilter === "paid" ? "active" : ""}`}
                            onClick={() => setActiveFilter("paid")}
                        >
                            Paid ({stats.paid})
                        </button>
                    </div>

                    <div className="text-muted small">
                        Showing {filteredOrders.length} records
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary me-2" role="status"></div>
                        <span className="text-muted">Loading payment requests...</span>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="cp-table-responsive">
                        <table className="cp-table">
                            <thead>
                                <tr>
                                    <th>File Number</th>
                                    <th>Description / Comment</th>
                                    <th>Tax Year</th>
                                    <th>Standard Fee</th>
                                    <th>Discount</th>
                                    <th>Total Payable</th>
                                    <th>Status</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, idx) => {
                                    const isPaid =
                                        order.order_status === 1 ||
                                        order.order_status === "1" ||
                                        String(order.order_status_text).toLowerCase() === "paid";
                                    const symbol = getCurrencySymbol(order.currency);
                                    const stdAmt = parseFloat(order.p_standardAmount || 0);
                                    const discAmt = calculateDiscountAmount(order);
                                    const totalAmt = parseFloat(order.p_amount || (stdAmt - discAmt));
                                    const fileNum = order.filenumber || `UTS-${order.order_id}`;

                                    return (
                                        <tr key={order.order_id || order.id || idx}>
                                            <td className="fw-semibold text-dark">
                                                <div className="d-flex align-items-center gap-2">
                                                    <FiFileText className="text-primary" />
                                                    <span>#{fileNum}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-dark fw-medium small">
                                                    {order.comment || "Tax Return Preparation"}
                                                </div>
                                                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                    Currency: {order.currency || "USA"}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {order.taxyear || getStoredTaxYear()}
                                                </span>
                                            </td>
                                            <td>
                                                {symbol}{stdAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                {discAmt > 0 ? (
                                                    <span className="text-success fw-semibold">
                                                        -{symbol}{discAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        {order.p_discountType === "Percentage" && ` (${order.p_discountValue}%)`}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td className="fw-bold text-dark fs-6">
                                                {symbol}{totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                {isPaid ? (
                                                    <span className="cp-badge-paid">
                                                        <FiCheckCircle size={13} /> {order.order_status_text || "Paid"}
                                                    </span>
                                                ) : (
                                                    <span className="cp-badge-unpaid">
                                                        <FiAlertCircle size={13} /> {order.order_status_text || "Unpaid"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                {isPaid ? (
                                                    <button
                                                        className="btn-view-receipt"
                                                        onClick={() => handleOpenPaymentModal(order)}
                                                    >
                                                        <span>View Receipt</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-pay-action"
                                                        onClick={() => handleOpenPaymentModal(order)}
                                                    >
                                                        <span>Make Payment</span>
                                                        <FiChevronRight size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="cp-empty-state">
                        <FiCreditCard className="cp-empty-icon" />
                        <h5 className="fw-bold text-dark mb-1">No Invoices Found</h5>
                        <p className="text-muted small">
                            There are currently no payment requests recorded for tax year {getStoredTaxYear()}.
                        </p>
                    </div>
                )}
            </div>

            {/* =========================================================
                ORDER SUMMARY MODAL SCREEN (Exact Screenshot Match)
               ========================================================= */}
            {isPaymentModalOpen && selectedOrder && (() => {
                const symbol = getCurrencySymbol(selectedOrder.currency);
                const stdAmt = parseFloat(selectedOrder.p_standardAmount || 0);
                const discAmt = calculateDiscountAmount(selectedOrder);
                const finalAmt = parseFloat(selectedOrder.p_amount || (stdAmt - discAmt));
                const fileNum = selectedOrder.filenumber || `UTS-${selectedOrder.order_id}`;
                const isPaid =
                    selectedOrder.order_status === 1 ||
                    selectedOrder.order_status === "1" ||
                    String(selectedOrder.order_status_text).toLowerCase() === "paid";

                return (
                    <div className="order-summary-modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
                        <div className="order-summary-card" onClick={(e) => e.stopPropagation()}>
                            {/* Close Icon Button */}
                            <button
                                className="order-summary-close-btn"
                                onClick={() => setIsPaymentModalOpen(false)}
                                title="Close"
                            >
                                <FiX />
                            </button>

                            {/* File Badge Banner */}
                            <div className="file-badge-pill">
                                <FiFileText />
                                <span>File #{fileNum}</span>
                            </div>

                            {/* Separator */}
                            <div className="summary-divider"></div>

                            {/* ORDER SUMMARY */}
                            <div className="order-summary-header-label">
                                ORDER SUMMARY
                            </div>

                            {/* Line Items */}
                            <div className="summary-line-item">
                                <span className="summary-item-label">
                                    {selectedOrder.comment || "Federal tax return preparation"}
                                </span>
                                <span className="summary-item-amount">
                                    {symbol}{stdAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Referral credit / discount applied */}
                            <div className="summary-line-item">
                                <span className="summary-item-discount">
                                    {discAmt > 0 && selectedOrder.p_discountType === "Percentage"
                                        ? `Referral / Discount applied (${selectedOrder.p_discountValue}%)`
                                        : "Referral credit applied"}
                                </span>
                                <span className="summary-item-discount-amt">
                                    -{symbol}{discAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Separator */}
                            <div className="summary-divider"></div>

                            {/* Total Due Section */}
                            <div className="total-due-row">
                                <span className="total-due-text">Total due</span>
                                <span className="total-due-val">
                                    {symbol}{finalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Separator */}
                            <div className="summary-divider"></div>

                            {/* Trust Badges */}
                            <div className="trust-badges-row">
                                <div className="trust-badge-item">
                                    <FiLock />
                                    <span>Secure checkout</span>
                                </div>
                                <div className="trust-badge-item">
                                    <FiClock />
                                    <span>Instant receipt</span>
                                </div>
                                <div className="trust-badge-item">
                                    <FiShield />
                                    <span>No hidden fees</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {!isPaid ? (
                                <button
                                    className="btn-order-make-payment"
                                    onClick={handleMakePaymentSubmit}
                                    disabled={isProcessingPayment}
                                >
                                    {isProcessingPayment ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            <span>Processing Checkout...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCreditCard />
                                            <span>Make Payment</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="text-center py-2">
                                    <span className="badge bg-success py-2 px-3 fs-6 d-inline-flex align-items-center gap-2">
                                        <FiCheckCircle /> Payment Completed
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default CustomerPayments;
