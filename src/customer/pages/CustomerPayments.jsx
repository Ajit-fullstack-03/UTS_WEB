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
    FiChevronRight,
    FiGift,
    FiCheck
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

// Currency Conversion Rates (base USD: 1 USD = 85 INR)
const EXCHANGE_RATES = {
    USD: 1,
    INR: 85,
    EUR: 0.92,
    GBP: 0.79
};

const normalizeCurrency = (currency) => {
    if (!currency) return "USD";
    const c = String(currency).toUpperCase().trim();
    if (c === "INR" || c === "INDIA" || c === "₹") return "INR";
    if (c === "EUR" || c === "€") return "EUR";
    if (c === "GBP" || c === "£") return "GBP";
    if (c === "USD" || c === "USA" || c === "$") return "USD";
    return c;
};

const getCurrencySymbol = (currency) => {
    const c = normalizeCurrency(currency);
    if (c === "INR") return "₹";
    if (c === "EUR") return "€";
    if (c === "GBP") return "£";
    return "$";
};

const convertCurrency = (amount, fromCurr, toCurr) => {
    const num = parseFloat(amount || 0);
    if (!num || isNaN(num)) return 0;
    const from = normalizeCurrency(fromCurr);
    const to = normalizeCurrency(toCurr);
    if (from === to) return num;

    const rateFrom = EXCHANGE_RATES[from] || 1;
    const rateTo = EXCHANGE_RATES[to] || 1;
    const inUSD = num / rateFrom;
    const converted = inUSD * rateTo;
    return Number(converted.toFixed(2));
};

const CustomerPayments = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });
    const [availableBonus, setAvailableBonus] = useState(0);
    const [bonusCurrency, setBonusCurrency] = useState("INR");
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all"); // "all", "unpaid", "paid"
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Bonus usage in payment modal
    const [useBonus, setUseBonus] = useState(false);
    const [bonusAmountToUse, setBonusAmountToUse] = useState(0);

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

            // Extract available bonus & currency from response
            const bonus =
                resData?.available_bonus_amount !== undefined
                    ? Number(resData.available_bonus_amount)
                    : (resData?.bonusData?.available_bonus_amount !== undefined
                        ? Number(resData.bonusData.available_bonus_amount)
                        : (resData?.referral_bonus !== undefined
                            ? Number(resData.referral_bonus)
                            : (resData?.referralBonus !== undefined
                                ? Number(resData.referralBonus)
                                : (resData?.total_bonus_amount !== undefined
                                    ? Number(resData.total_bonus_amount)
                                    : 0))));

            const bCurrency =
                resData?.bonus_currency ||
                resData?.referral_bonus_currency ||
                resData?.bonusData?.bonus_currency ||
                resData?.bonusData?.referral_bonus_currency ||
                resData?.bonusData?.currency ||
                (orderList.length > 0 ? (orderList[0].bonus_currency || orderList[0].referral_bonus_currency) : null) ||
                "INR";

            setAvailableBonus(bonus);
            setBonusCurrency(bCurrency);

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
            setAvailableBonus(0);
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

        const orderBonus = Number(
            order.available_bonus_amount ??
            order.referral_bonus ??
            availableBonus ??
            0
        );

        const orderBonusCurr = normalizeCurrency(
            order.bonus_currency ??
            order.referral_bonus_currency ??
            bonusCurrency ??
            "INR"
        );

        const orderCurr = normalizeCurrency(order.currency);

        const stdAmt = parseFloat(order.p_standardAmount || 0);
        const discAmt = calculateDiscountAmount(order);
        const payableBeforeBonus = parseFloat(order.p_amount || (stdAmt - discAmt));

        // Convert bonus to order currency
        const bonusInOrderCurr = convertCurrency(orderBonus, orderBonusCurr, orderCurr);

        // Max bonus allowed is below / up to 50% of payable amount
        const maxAllowedBonus = Math.max(0, Math.min(bonusInOrderCurr, Number((payableBeforeBonus * 0.5).toFixed(2))));

        // Set bonus usage defaults (enabled by default if user has eligible bonus, or user can toggle)
        if (maxAllowedBonus > 0) {
            setUseBonus(true);
            setBonusAmountToUse(maxAllowedBonus);
        } else {
            setUseBonus(false);
            setBonusAmountToUse(0);
        }

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
            const orderBonus = Number(
                selectedOrder.available_bonus_amount ??
                selectedOrder.referral_bonus ??
                availableBonus ??
                0
            );

            const orderBonusCurr = normalizeCurrency(
                selectedOrder.bonus_currency ??
                selectedOrder.referral_bonus_currency ??
                bonusCurrency ??
                "INR"
            );

            const orderCurr = normalizeCurrency(selectedOrder.currency);
            const stdAmt = parseFloat(selectedOrder.p_standardAmount || 0);
            const discAmt = calculateDiscountAmount(selectedOrder);
            const payableBeforeBonus = parseFloat(selectedOrder.p_amount || (stdAmt - discAmt));
            const bonusInOrderCurr = convertCurrency(orderBonus, orderBonusCurr, orderCurr);
            const maxAllowedBonus = Math.max(0, Math.min(bonusInOrderCurr, Number((payableBeforeBonus * 0.5).toFixed(2))));

            const finalBonusToApply = useBonus
                ? Math.min(maxAllowedBonus, Math.max(0, parseFloat(bonusAmountToUse || 0)))
                : 0;

            // Step 1: Call /payment/initiateOrder with bonus_amount in order currency
            const initPayload = {
                order_id: Number(orderId),
                bonus_amount: finalBonusToApply,
                bonus_currency: orderBonusCurr,
                order_currency: orderCurr
            };
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
                (orderCurr === "INR" ? "INR" : "USD");

            const amountInSmallestUnit =
                initData?.amount ||
                initData?.razorpay_order?.amount ||
                initData?.data?.amount ||
                Math.round(Math.max(0, payableBeforeBonus - finalBonusToApply) * 100);

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
                    <div className="cp-stat-icon bonus">
                        <FiGift />
                    </div>
                    <div>
                        <div className="cp-stat-value">
                            {getCurrencySymbol(bonusCurrency)}{availableBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="cp-stat-label">Available Referral Bonus ({normalizeCurrency(bonusCurrency)})</p>
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
                                                    Currency: {normalizeCurrency(order.currency)}
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
                ORDER SUMMARY MODAL SCREEN (With Multi-Currency Bonus Support)
               ========================================================= */}
            {isPaymentModalOpen && selectedOrder && (() => {
                const orderCurr = normalizeCurrency(selectedOrder.currency);
                const symbol = getCurrencySymbol(orderCurr);
                const stdAmt = parseFloat(selectedOrder.p_standardAmount || 0);
                const discAmt = calculateDiscountAmount(selectedOrder);
                const payableBeforeBonus = parseFloat(selectedOrder.p_amount || (stdAmt - discAmt));
                const fileNum = selectedOrder.filenumber || `UTS-${selectedOrder.order_id}`;
                const isPaid =
                    selectedOrder.order_status === 1 ||
                    selectedOrder.order_status === "1" ||
                    String(selectedOrder.order_status_text).toLowerCase() === "paid";

                const orderBonus = Number(
                    selectedOrder.available_bonus_amount ??
                    selectedOrder.referral_bonus ??
                    availableBonus ??
                    0
                );

                const orderBonusCurr = normalizeCurrency(
                    selectedOrder.bonus_currency ??
                    selectedOrder.referral_bonus_currency ??
                    bonusCurrency ??
                    "INR"
                );

                const bonusSymbol = getCurrencySymbol(orderBonusCurr);
                const bonusInOrderCurr = convertCurrency(orderBonus, orderBonusCurr, orderCurr);
                const isCrossCurrency = orderBonusCurr !== orderCurr;

                // Max bonus usable in order currency (capped at 50% of payable amount)
                const maxAllowedBonus = Math.max(0, Math.min(bonusInOrderCurr, Number((payableBeforeBonus * 0.5).toFixed(2))));
                const currentAppliedBonus = useBonus
                    ? Math.min(maxAllowedBonus, Math.max(0, parseFloat(bonusAmountToUse || 0)))
                    : 0;

                const finalPayable = Math.max(0, payableBeforeBonus - currentAppliedBonus);

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

                            {/* Standard Discount applied if any */}
                            {discAmt > 0 && (
                                <div className="summary-line-item">
                                    <span className="summary-item-discount">
                                        {selectedOrder.p_discountType === "Percentage"
                                            ? `Discount applied (${selectedOrder.p_discountValue}%)`
                                            : "Discount applied"}
                                    </span>
                                    <span className="summary-item-discount-amt">
                                        -{symbol}{discAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            {/* Optional Bonus Application Section (For unpaid orders with available bonus) */}
                            {!isPaid && orderBonus > 0 && (
                                <div className="bonus-application-box">
                                    <div className="bonus-box-header">
                                        <div className="d-flex align-items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="useBonusCheckbox"
                                                className="bonus-custom-checkbox"
                                                checked={useBonus}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setUseBonus(checked);
                                                    if (checked && (!bonusAmountToUse || bonusAmountToUse <= 0)) {
                                                        setBonusAmountToUse(maxAllowedBonus);
                                                    }
                                                }}
                                            />
                                            <label htmlFor="useBonusCheckbox" className="bonus-box-title">
                                                Use Referral Bonus
                                            </label>
                                        </div>
                                        <span className="bonus-avail-pill">
                                            Avail: {bonusSymbol}{orderBonus.toFixed(2)} {orderBonusCurr}
                                        </span>
                                    </div>

                                    <div className="bonus-box-subtitle">
                                        {isCrossCurrency && (
                                            <div className="mb-1 text-muted small">
                                                Converted Value: <strong>{symbol}{bonusInOrderCurr.toFixed(2)} {orderCurr}</strong> (1 {orderBonusCurr === "USD" ? "USD ≈ ₹85 INR" : "INR ≈ $0.012 USD"})
                                            </div>
                                        )}
                                        Max 50% of bill eligible: <strong>{symbol}{maxAllowedBonus.toFixed(2)} {orderCurr}</strong>
                                    </div>

                                    {useBonus && (
                                        <div className="bonus-input-controls mt-2">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white">{symbol}</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0"
                                                    max={maxAllowedBonus}
                                                    step="0.01"
                                                    value={bonusAmountToUse}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        if (isNaN(val)) {
                                                            setBonusAmountToUse("");
                                                        } else if (val > maxAllowedBonus) {
                                                            setBonusAmountToUse(maxAllowedBonus);
                                                        } else if (val < 0) {
                                                            setBonusAmountToUse(0);
                                                        } else {
                                                            setBonusAmountToUse(val);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm px-2"
                                                    onClick={() => setBonusAmountToUse(maxAllowedBonus)}
                                                >
                                                    Max
                                                </button>
                                            </div>
                                            {currentAppliedBonus > 0 && (
                                                <small className="text-success d-flex align-items-center gap-1 mt-1 font-weight-500">
                                                    <FiCheck size={12} />
                                                    Applying {symbol}{currentAppliedBonus.toFixed(2)} discount
                                                    {isCrossCurrency && ` (≈ ${bonusSymbol}${convertCurrency(currentAppliedBonus, orderCurr, orderBonusCurr).toFixed(2)} ${orderBonusCurr})`}
                                                </small>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Referral bonus applied line */}
                            {useBonus && currentAppliedBonus > 0 && (
                                <div className="summary-line-item bonus-deduct-line">
                                    <span className="summary-item-discount d-flex align-items-center gap-1">
                                        <FiGift size={13} /> Referral Bonus Applied
                                    </span>
                                    <span className="summary-item-discount-amt">
                                        -{symbol}{currentAppliedBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            {/* Separator */}
                            <div className="summary-divider"></div>

                            {/* Total Due Section */}
                            <div className="total-due-row">
                                <span className="total-due-text">Total due</span>
                                <span className="total-due-val">
                                    {symbol}{finalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                            <span>
                                                Pay {symbol}{finalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
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
