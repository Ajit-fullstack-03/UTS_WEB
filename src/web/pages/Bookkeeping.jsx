import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./services.css";
import backusa from "../../assets/image/USA_service_BG.png";
import img1 from "../../assets/image/Book_keeping_1.png";
import img2 from "../../assets/image/Book_keeping_2.png";
import img3 from "../../assets/image/Book_keeping_3.png";
import img4 from "../../assets/image/Book_keeping_4.png";
import img5 from "../../assets/image/Book_keeping_5.png";
import img6 from "../../assets/image/Book_keeping_6.png";
import img7 from "../../assets/image/Book_keeping_7.png";

/* ─── FAQ data ─── */
const faqs = [
    { id: 1, question: "What bookkeeping services do you offer?", answer: "We offer a full range of bookkeeping services including monthly bookkeeping, bank reconciliation, accounts payable and receivable management, payroll processing, and QuickBooks setup and maintenance." },
    { id: 2, question: "Do you work with QuickBooks?", answer: "Yes. We are experienced QuickBooks Pro Advisors and can set up, clean up, and maintain your QuickBooks Online or Desktop account, as well as provide ongoing training for your team." },
    { id: 3, question: "How often will my books be updated?", answer: "We offer weekly, bi-weekly, or monthly bookkeeping cycles depending on your transaction volume and business needs. Real-time dashboards are available for premium plans." },
    { id: 4, question: "Can you handle payroll bookkeeping?", answer: "Yes. We process payroll, record payroll journal entries, and reconcile payroll accounts to ensure your books remain accurate and compliant with payroll tax requirements." },
    { id: 5, question: "How does customer support work?", answer: "Our support team is available via phone and chat to answer questions and guide you through every step of the bookkeeping process." },
];

/* ─── Service cards data ─── */
const services = [
    {
        id: 1,
        title: "Monthly Bookkeeping",
        description: "Consistent, accurate monthly bookkeeping is the foundation of a healthy business. We categorize transactions, maintain your general ledger, and deliver clean financial statements every month.",
        bullets: [
            "Transaction categorization and general ledger maintenance",
            "Monthly profit & loss and balance sheet preparation",
            "Expense tracking and vendor management",
            "Custom financial reporting tailored to your business",
        ],
        image: img1,
        imageAlt: "Monthly bookkeeping — professional reviewing financial records",
        flip: false,
    },
    {
        id: 2,
        title: "Transaction Streamlining",
        description: "Disorganized transactions slow your business down. We streamline your financial workflows, import and categorize bank feeds, and create consistent, repeatable processes that save time and reduce errors.",
        bullets: [
            "Bank feed import and automated transaction matching",
            "Custom chart of accounts aligned to your industry",
            "Workflow documentation and process optimization",
            "Integration with major accounting and POS platforms",
        ],
        image: img2,
        imageAlt: "Transaction streamlining — digital financial workflow",
        flip: true,
    },
    {
        id: 3,
        title: "Bank & Credit Card Reconciliation",
        description: "Unreconciled accounts create hidden risks. We reconcile all your bank and credit card accounts monthly, identifying discrepancies, duplicate charges, and unauthorized transactions before they become problems.",
        bullets: [
            "Full monthly reconciliation of all bank accounts",
            "Credit card statement matching and variance analysis",
            "Identification of duplicate or fraudulent charges",
            "Reconciliation reports for audit readiness",
        ],
        image: img3,
        imageAlt: "Bank reconciliation — reviewing bank statements",
        flip: false,
    },
    {
        id: 4,
        title: "Accounts Payable/Receivable",
        description: "Managing cash flow requires tight control over what you owe and what you're owed. We track vendor invoices, customer billing cycles, and aging reports to keep your business cash-flow positive.",
        bullets: [
            "Vendor invoice tracking and payment scheduling",
            "Customer invoicing and follow-up for collections",
            "Aging reports for payables and receivables",
            "Cash flow forecasting based on AP/AR data",
        ],
        image: img4,
        imageAlt: "Accounts payable and receivable management",
        flip: true,
    },
    {
        id: 5,
        title: "Financial Services",
        description: "Beyond bookkeeping, we offer comprehensive financial services including budgeting, forecasting, and advisory support to help you make confident data-driven decisions for your business.",
        bullets: [
            "Annual budget preparation and variance analysis",
            "Cash flow forecasting and scenario modeling",
            "KPI dashboards and management reporting",
            "CFO advisory support for growing businesses",
        ],
        image: img5,
        imageAlt: "Financial services — business advisory and planning",
        flip: false,
    },
    {
        id: 6,
        title: "QuickBooks Bookkeeping",
        description: "As certified QuickBooks Pro Advisors, we set up, maintain, and optimize your QuickBooks environment — ensuring your accounting software works hard for your business.",
        bullets: [
            "QuickBooks Online and Desktop setup and migration",
            "Chart of accounts customization and cleanup",
            "Bank feed connection and automation rules",
            "Staff training and ongoing QuickBooks support",
        ],
        image: img6,
        imageAlt: "QuickBooks bookkeeping — accounting software management",
        flip: true,
    },
    {
        id: 7,
        title: "Payroll Bookkeeping",
        description: "Payroll errors lead to unhappy employees and IRS penalties. We process payroll accurately, record all payroll entries, and keep your payroll accounts reconciled and compliant.",
        bullets: [
            "Payroll processing and direct deposit management",
            "Payroll journal entry recording and ledger posting",
            "Payroll tax liability tracking and remittance",
            "W-2 and 1099 preparation support at year-end",
        ],
        image: img7,
        imageAlt: "Payroll bookkeeping — salary and payroll management",
        flip: false,
    },
];

/* ─── Chevron ─── */
const ChevronIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        className={`srv-faq-chevron ${open ? "srv-faq-chevron--open" : ""}`}>
        <path d="M6 9l6 6 6-6" stroke="#1B2E6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

/* ─── Page ─── */
const Bookkeeping = () => {
    const [openId, setOpenId] = useState(1);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <>
            {/* ══════════════════════ HERO ══════════════════════ */}
            <section className="srv-hero-wrapper" style={{ backgroundImage: `url(${backusa})` }}>
                <div className="hero-topbar">
                    <div className="hero-topbar-inner">
                        <div className="hero-topbar-item">
                            <span className="hero-topbar-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" /></svg>
                            </span>
                            <span className="hero-topbar-flag">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="7410" height="3900" fill="#B22234" /><rect y="300" width="7410" height="300" fill="white" /><rect y="900" width="7410" height="300" fill="white" /><rect y="1500" width="7410" height="300" fill="white" /><rect y="2100" width="7410" height="300" fill="white" /><rect y="2700" width="7410" height="300" fill="white" /><rect y="3300" width="7410" height="300" fill="white" /><rect width="2964" height="2100" fill="#3C3B6E" /></svg>
                            </span>
                            <span>+1 (515)686-4275</span>
                        </div>
                        <div className="hero-topbar-item">
                            <span className="hero-topbar-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" /></svg>
                            </span>
                            <span className="hero-topbar-flag">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="900" height="200" fill="#FF9933" /><rect y="200" width="900" height="200" fill="#FFFFFF" /><rect y="400" width="900" height="200" fill="#138808" /><circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" /><circle cx="450" cy="300" r="8" fill="#000080" /></svg>
                            </span>
                            <span>+91 81860-51040</span>
                        </div>
                        <div className="hero-topbar-item">
                            <span className="hero-topbar-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </span>
                            <span>hello@umpirtaxsolutions.com</span>
                        </div>
                    </div>
                </div>

                <div className="srv-hero-main">
                    <div className="srv-hero-content">
                        <div className="srv-hero-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l7 3v6c0 5-3.4 8.6-7 11-3.6-2.4-7-6-7-11V5l7-3z" stroke="#1B2E6B" strokeWidth="1.6" strokeLinejoin="round" fill="none" /><path d="M9 12l2 2 4-4" stroke="#1B2E6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            <span>Bookkeeping Services</span>
                        </div>
                        <h1 className="srv-hero-heading">
                            Complete &amp; Accurate <br />
                            <span className="srv-hero-heading-accent">Bookkeeping Solutions</span>
                        </h1>
                        <p className="srv-hero-desc">
                            From monthly ledger maintenance to payroll and QuickBooks management — we keep your books clean, current, and audit-ready all year long.
                        </p>
                        <Link to="/register" className="srv-hero-btn">Get Started</Link>
                    </div>

                </div>
            </section>

            {/* ══════════════════════ STICKY CARDS ══════════════════════ */}
            <section className="srv-steps-wrapper">
                <div className="srv-steps-header">
                    <h2 className="srv-steps-title">Bookkeeping Services</h2>
                </div>
                <div className="srv-steps-stack">
                    {services.map((svc, index) => (
                        <div
                            key={svc.id}
                            className={`srv-card ${svc.flip ? "srv-card--flip" : ""}`}
                            style={{ "--card-index": index + 1, zIndex: index + 1 }}
                        >
                            <div className="srv-card-content">
                                <h3 className="srv-card-title">{svc.title}</h3>
                                <p className="srv-card-desc">{svc.description}</p>
                                <p className="srv-card-support-label">Our support includes:</p>
                                <ul className="srv-card-bullets">
                                    {svc.bullets.map((b, i) => (
                                        <li key={i} className="srv-card-bullet">
                                            <span className="srv-card-bullet-dot" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="srv-card-visual">
                                <div className="srv-card-img-frame">
                                    <img src={svc.image} alt={svc.imageAlt} className="srv-card-img" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════ FAQ ══════════════════════ */}
            <section className="srv-faq-wrapper">
                <div className="srv-faq-inner">
                    <div className="srv-faq-top">
                        <div className="srv-faq-content">
                            <div className="srv-faq-badge">FAQ</div>
                            <h2 className="srv-faq-heading">Frequently Asked Questions</h2>
                            <p className="srv-faq-desc">
                                We help individuals and businesses to prepare accurate returns, stay compliant, and navigate tax season with confidence through reliable guidance and responsive support.
                            </p>
                            <Link to="/contact" className="srv-faq-more">
                                Check More
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </Link>
                        </div>
                        <div className="srv-faq-accordion">
                            {faqs.map(faq => {
                                const isOpen = openId === faq.id;
                                return (
                                    <div key={faq.id} className={`srv-faq-item ${isOpen ? "srv-faq-item--open" : ""}`}>
                                        <button className="srv-faq-item-header" type="button" onClick={() => setOpenId(prev => prev === faq.id ? null : faq.id)} aria-expanded={isOpen}>
                                            <span className="srv-faq-question">{faq.question}</span>
                                            <ChevronIcon open={isOpen} />
                                        </button>
                                        <div className="srv-faq-body" style={{ maxHeight: isOpen ? "240px" : "0px" }}>
                                            <p className="srv-faq-answer">{faq.answer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="srv-faq-bar">
                        <div className="srv-faq-bar-left">
                            <span className="srv-faq-bar-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 13a8 8 0 0116 0v5a2 2 0 01-2 2h-1a1 1 0 01-1-1v-5a1 1 0 011-1h2M4 13v5a1 1 0 001 1h1a1 1 0 001-1v-5a1 1 0 00-1-1H4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </span>
                            <span className="srv-faq-bar-text">Need help with your Financial &amp; Tax services?</span>
                        </div>
                        <a href="tel:+15156864275" className="srv-faq-bar-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="#1B2E6B" /></svg>
                            +1 (515) 686-4275
                        </a>
                    </div>
                </div>
            </section>

            <button className={`scroll-to-top-btn ${showScrollTop ? "scroll-to-top-btn--visible" : ""}`} onClick={scrollToTop} aria-label="Scroll to top">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
        </>
    );
};

export default Bookkeeping;
