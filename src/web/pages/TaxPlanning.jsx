import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./services.css";
import backusa from "../../assets/image/USA_service_BG.png";
import img1 from "../../assets/image/Tax_planning_1.png";
import img2 from "../../assets/image/Tax_planning_2.png";
import img3 from "../../assets/image/Tax_planning_3.png";

/* ─── FAQ data ─── */
const faqs = [
    { id: 1, question: "What is tax planning?", answer: "Tax planning is the process of analyzing your financial situation to ensure maximum tax efficiency. It includes strategies to reduce your tax liability through legal deductions, credits, and investment decisions." },
    { id: 2, question: "When should I start tax planning?", answer: "Tax planning should be a year-round activity, not just a last-minute exercise before the filing deadline. Starting early allows you to take full advantage of deductions, contributions, and credits." },
    { id: 3, question: "Can tax planning reduce my tax bill legally?", answer: "Yes. Through legitimate deductions, retirement contributions, capital gains planning, and income deferral strategies, we help reduce your tax burden within the boundaries of the law." },
    { id: 4, question: "Do you offer business tax planning?", answer: "Absolutely. We work with businesses of all sizes to develop strategic tax plans including depreciation schedules, entity structure decisions, and cash flow optimization." },
    { id: 5, question: "How does customer support work?", answer: "Our support team is available via phone and chat to answer questions and guide you through every step of the planning process." },
];

/* ─── Service cards data ─── */
const services = [
    {
        id: 1,
        title: "Individual Tax Planning",
        description: "Smart tax planning for individuals goes beyond just filing returns. We analyze your income, investments, and deductions to design a personalized strategy that minimizes your tax burden throughout the year.",
        bullets: [
            "Deduction optimization for W-2, freelance, and NRI individuals",
            "Retirement contribution planning (IRA, 401k, HSA)",
            "Capital gains timing and harvesting strategies",
            "Advance guidance on quarterly estimated tax payments",
        ],
        image: img1,
        imageAlt: "Individual tax planning — financial advisor with client",
        flip: false,
    },
    {
        id: 2,
        title: "Business Tax Planning",
        description: "Managing corporate tax requirements demands precision to avoid penalties and protect your bottom line. We provide strategic planning for companies of all sizes, aligning your tax position with long-term business goals.",
        bullets: [
            "Entity structure analysis (LLC, S-Corp, C-Corp, Partnership)",
            "Tax-efficient compensation and benefit planning",
            "Loss carry-forwards and accelerated depreciation strategies",
            "Cash flow forecasting aligned with tax obligations",
        ],
        image: img2,
        imageAlt: "Business tax planning — team reviewing financial documents",
        flip: true,
    },
    {
        id: 3,
        title: "Tax Saving Strategies",
        description: "Beyond basic filing, we implement proactive strategies that create measurable long-term savings. Our advisors identify opportunities in your financial landscape that most taxpayers miss.",
        bullets: [
            "Investment tax planning and portfolio structuring",
            "Real estate and rental income tax optimization",
            "State and local tax (SALT) deduction strategies",
            "Advanced techniques for high-net-worth individuals",
        ],
        image: img3,
        imageAlt: "Tax saving strategies — calculator and financial planning",
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
const TaxPlanning = () => {
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
                            <span>TAX Planning</span>
                        </div>
                        <h1 className="srv-hero-heading">
                            Strategic Tax &amp; <br />
                            <span className="srv-hero-heading-accent">Planning Solutions</span>
                        </h1>
                        <p className="srv-hero-desc">
                            Year-round proactive tax planning for individuals and businesses — reducing your liability, maximizing savings, and keeping you fully compliant.
                        </p>
                        <a href="/contact" className="srv-hero-btn">Get Started</a>
                    </div>
                </div>
            </section>

            {/* ══════════════════════ STICKY CARDS ══════════════════════ */}
            <section className="srv-steps-wrapper">
                <div className="srv-steps-header">
                    <h2 className="srv-steps-title">Tax Planning</h2>
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
                                Everything you need to know about our tax planning services and how we help you save more every year.
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

export default TaxPlanning;
