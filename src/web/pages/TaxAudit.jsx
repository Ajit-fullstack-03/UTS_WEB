import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./services.css";
import backusa from "../../assets/image/USA_service_BG.png";
import img1 from "../../assets/image/Tax_audit_1.png";
import img2 from "../../assets/image/Tax_audit_2.png";
import img3 from "../../assets/image/Tax_audit_3.png";

/* ─── FAQ data ─── */
const faqs = [
    { id: 1, question: "What is a tax audit?", answer: "A tax audit is a review of your tax return by the IRS or state tax authority to verify that income, expenses, and deductions are reported accurately. Audits can be conducted by mail, in person at an IRS office, or at your place of business." },
    { id: 2, question: "How can you help if I receive an IRS notice?", answer: "We analyze the notice, determine the appropriate response, prepare documentation, and communicate directly with the IRS on your behalf to resolve the issue quickly and correctly." },
    { id: 3, question: "What does tax representation mean?", answer: "Tax representation means we act as your Enrolled Agent or authorized representative before the IRS. We attend hearings, respond to inquiries, and negotiate settlements so you don't have to face the IRS alone." },
    { id: 4, question: "Can you resolve back taxes and tax debt?", answer: "Yes. We offer solutions including installment agreements, Offer in Compromise, penalty abatement, and Currently Not Collectible status to help you manage and resolve outstanding tax debt." },
    { id: 5, question: "How does customer support work?", answer: "Our support team is available via phone and chat to answer questions and guide you through every step of the audit and representation process." },
];

/* ─── Service cards data ─── */
const services = [
    {
        id: 1,
        title: "IRS Audit Support",
        description: "Facing an IRS audit can be overwhelming, but with our experienced team by your side, you'll have expert guidance every step of the way. We prepare your documentation, manage correspondence, and defend your return.",
        bullets: [
            "Correspondence, office, and field audit defense",
            "Full review of tax returns and financial records",
            "Preparation of supporting evidence and documentation",
            "Direct communication and negotiation with the IRS",
        ],
        image: img1,
        imageAlt: "IRS audit support — professional reviewing documents",
        flip: false,
    },
    {
        id: 2,
        title: "IRS Notices",
        description: "Receiving an IRS notice doesn't always mean you owe more taxes — but it always demands a timely, accurate response. We decode the notice, identify the best course of action, and handle the reply professionally.",
        bullets: [
            "Identification and analysis of all IRS notice types",
            "Penalty assessment and dispute preparation",
            "Priority response within regulatory deadlines",
            "Balance due verification and discrepancy adjustment",
        ],
        image: img2,
        imageAlt: "IRS notices — reviewing official correspondence",
        flip: true,
    },
    {
        id: 3,
        title: "Tax Representation",
        description: "When dealing with the IRS, having a qualified representative makes all the difference. Our enrolled agents and tax professionals stand in your corner, managing all IRS interactions and protecting your rights as a taxpayer.",
        bullets: [
            "Enrolled Agent representation before the IRS",
            "Offer in Compromise and installment agreement negotiation",
            "Penalty abatement requests and appeals",
            "Tax lien and levy release assistance",
        ],
        image: img3,
        imageAlt: "Tax representation — professional in a legal meeting",
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
const TaxAudit = () => {
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
                            <span>TAX Audit &amp; Representation</span>
                        </div>
                        <h1 className="srv-hero-heading">
                            Expert Audit &amp; <br />
                            <span className="srv-hero-heading-accent">IRS Representation</span>
                        </h1>
                        <p className="srv-hero-desc">
                            From IRS audit defense to notice resolution and full tax representation — we stand between you and the IRS so you never face them alone.
                        </p>
                        <Link to="/register" className="srv-hero-btn">Get Started</Link>
                    </div>

                </div>
            </section>

            {/* ══════════════════════ STICKY CARDS ══════════════════════ */}
            <section className="srv-steps-wrapper">
                <div className="srv-steps-header">
                    <h2 className="srv-steps-title">Tax Audit &amp; Representation</h2>
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

export default TaxAudit;
