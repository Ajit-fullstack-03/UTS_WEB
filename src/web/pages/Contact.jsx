import React, { useState, useEffect } from "react";
import "./contact.css";

/* ── FAQ data ─────────────────────────────────────────────────── */
const faqs = [
    { id: 1, question: "What is Umpire Tax Solution?", answer: "Umpire Tax Solution is a modern tax service platform offering accurate preparation, filing support, and practical tax guidance for individuals, freelancers, and growing businesses." },
    { id: 2, question: "Who can use Umpire Tax Solution?", answer: "Individuals, freelancers, and growing businesses looking for accurate, reliable, and hassle-free tax preparation and filing support can use Umpire Tax Solution." },
    { id: 3, question: "How easy is it to get started?", answer: "Getting started takes just a few minutes — create your account, upload your documents securely, and our team takes care of the rest." },
    { id: 4, question: "Are there any hidden fees?", answer: "No. Our pricing is transparent and shown upfront before you file, with no hidden charges added later." },
    { id: 5, question: "How does customer support work?", answer: "Our support team is available via phone and chat to answer questions and guide you through every step of the filing process." },
];

/* ── Contact info rows ────────────────────────────────────────── */
const contactInfo = [
    {
        id: "email",
        label: "EMAIL SUPPORT",
        lines: ["hello@umpiretaxsolutions.com"],
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="#1B2E6B" strokeWidth="1.7" fill="none" />
                <path d="M2 7l10 7 10-7" stroke="#1B2E6B" strokeWidth="1.7" strokeLinecap="round" fill="none" />
            </svg>
        ),
    },
    {
        id: "phone",
        label: "CALL US",
        lines: ["+1 (555) 686-4275", "+91 81860-51040"],
        flags: [
            <svg key="us" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="20" height="11" style={{ borderRadius: "2px", display: "inline-block", verticalAlign: "middle", marginRight: "5px" }}><rect width="7410" height="3900" fill="#B22234" /><rect y="300" width="7410" height="300" fill="white" /><rect y="900" width="7410" height="300" fill="white" /><rect y="1500" width="7410" height="300" fill="white" /><rect y="2100" width="7410" height="300" fill="white" /><rect y="2700" width="7410" height="300" fill="white" /><rect y="3300" width="7410" height="300" fill="white" /><rect width="2964" height="2100" fill="#3C3B6E" /></svg>,
            <svg key="in" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="20" height="11" style={{ borderRadius: "2px", display: "inline-block", verticalAlign: "middle", marginRight: "5px" }}><rect width="900" height="200" fill="#FF9933" /><rect y="200" width="900" height="200" fill="#FFFFFF" /><rect y="400" width="900" height="200" fill="#138808" /><circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" /><circle cx="450" cy="300" r="8" fill="#000080" /></svg>,
        ],
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="#1B2E6B" />
            </svg>
        ),
    },
    {
        id: "office",
        label: "OUR CORPORATE OFFICE",
        lines: ["9500 Grove Crest Ln Charlotte NC 28262", "United States"],
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" stroke="#1B2E6B" strokeWidth="1.7" fill="none" />
                <circle cx="12" cy="9.5" r="2.5" stroke="#1B2E6B" strokeWidth="1.7" fill="none" />
            </svg>
        ),
    },
    {
        id: "processing",
        label: "PROCESSING CENTER",
        lines: ["4-7 10/8 Raghavendra Nagar,", "Nacharam Hyd 500076"],
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="#1B2E6B" strokeWidth="1.7" fill="none" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#1B2E6B" strokeWidth="1.7" fill="none" />
                <path d="M12 12v4M10 14h4" stroke="#1B2E6B" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
        ),
    },
];

/* ── Chevron ──────────────────────────────────────────────────── */
const ChevronIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`ct-faq-chevron ${open ? "ct-faq-chevron--open" : ""}`}>
        <path d="M6 9l6 6 6-6" stroke="#1B2E6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

/* ── Contact Page ─────────────────────────────────────────────── */
const Contact = () => {
    /* scroll to top */
    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    /* faq accordion */
    const [openId, setOpenId] = useState(null);
    const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

    /* contact form */
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); alert("Message sent! We will get back to you soon."); };

    return (
        <>
            {/* ── Top Contact Bar ─────────────────────────────────── */}
            <div className="ct-topbar">
                <div className="ct-topbar-inner">
                    <div className="ct-topbar-item">
                        <span className="ct-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" /></svg></span>
                        <span className="ct-topbar-flag"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="7410" height="3900" fill="#B22234" /><rect y="300" width="7410" height="300" fill="white" /><rect y="900" width="7410" height="300" fill="white" /><rect y="1500" width="7410" height="300" fill="white" /><rect y="2100" width="7410" height="300" fill="white" /><rect y="2700" width="7410" height="300" fill="white" /><rect y="3300" width="7410" height="300" fill="white" /><rect width="2964" height="2100" fill="#3C3B6E" /></svg></span>
                        <span>+1 (515) 686-4275</span>
                    </div>
                    <div className="ct-topbar-item">
                        <span className="ct-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" /></svg></span>
                        <span className="ct-topbar-flag"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="900" height="200" fill="#FF9933" /><rect y="200" width="900" height="200" fill="#FFFFFF" /><rect y="400" width="900" height="200" fill="#138808" /><circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" /><circle cx="450" cy="300" r="8" fill="#000080" /></svg></span>
                        <span>+91 81860-51040</span>
                    </div>
                    <div className="ct-topbar-item">
                        <span className="ct-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg></span>
                        <span>hello@umpirtaxsolutions.com</span>
                    </div>
                </div>
            </div>

            {/* ── Hero + Contact Form ──────────────────────────────── */}
            <section className="ct-hero">
                <div className="ct-hero-inner">
                    {/* Left — info */}
                    <div className="ct-info">
                        <h1 className="ct-info-heading">How can we help<br />today?</h1>
                        <p className="ct-info-desc">Our customer support team is just a click away. Reach out with any questions, feedback, or custom implementation needs.</p>

                        <div className="ct-contact-list">
                            {contactInfo.map((item) => (
                                <div className="ct-contact-item" key={item.id}>
                                    <span className="ct-contact-icon">{item.icon}</span>
                                    <div className="ct-contact-body">
                                        <span className="ct-contact-label">{item.label}</span>
                                        {item.lines.map((line, i) => (
                                            <span className="ct-contact-value" key={i} style={{ display: "flex", alignItems: "center" }}>
                                                {item.flags ? item.flags[i] : null}
                                                {line}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — dark form card */}
                    <div className="ct-form-card">
                        <form className="ct-form" onSubmit={handleSubmit}>
                            <div className="ct-form-group">
                                <label className="ct-form-label" htmlFor="ct-name">Full name*</label>
                                <input id="ct-name" className="ct-form-input" type="text" name="name" placeholder="Billy Jane" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="ct-form-group">
                                <label className="ct-form-label" htmlFor="ct-email">Email*</label>
                                <input id="ct-email" className="ct-form-input" type="email" name="email" placeholder="Enter email" value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="ct-form-group">
                                <label className="ct-form-label" htmlFor="ct-phone">Phone number*</label>
                                <div className="ct-phone-wrap">
                                    <span className="ct-phone-prefix">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="7410" height="3900" fill="#B22234" /><rect y="300" width="7410" height="300" fill="white" /><rect y="900" width="7410" height="300" fill="white" /><rect y="1500" width="7410" height="300" fill="white" /><rect y="2100" width="7410" height="300" fill="white" /><rect y="2700" width="7410" height="300" fill="white" /><rect y="3300" width="7410" height="300" fill="white" /><rect width="2964" height="2100" fill="#3C3B6E" /></svg>
                                        <span>+1</span>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" /></svg>
                                    </span>
                                    <input id="ct-phone" className="ct-form-input ct-phone-input" type="tel" name="phone" placeholder="Enter phone number" value={form.phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="ct-form-group">
                                <label className="ct-form-label" htmlFor="ct-message">Message*</label>
                                <textarea id="ct-message" className="ct-form-input ct-form-textarea" name="message" placeholder="Enter a question, feedback, or suggestions..." value={form.message} onChange={handleChange} rows={4} required />
                            </div>
                            <button type="submit" className="ct-submit-btn" id="ct-submit-btn">Submit</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ── FAQ ─────────────────────────────────────────────── */}
            <section className="ct-faq-wrapper">
                <div className="ct-faq-inner">
                    <div className="ct-faq-top">
                        <div className="ct-faq-content">
                            <div className="ct-faq-badge">FAQ</div>
                            <h2 className="ct-faq-heading">Frequently Asked Questions</h2>
                            <p className="ct-faq-description">Umpire Tax Solution helps individuals and businesses prepare accurate returns, stay compliant, and navigate tax season with confidence through reliable guidance and responsive support.</p>
                            <button className="ct-faq-check-more" type="button">
                                Check More
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </button>
                        </div>
                        <div className="ct-faq-accordion">
                            {faqs.map((faq) => {
                                const isOpen = openId === faq.id;
                                return (
                                    <div className={`ct-faq-item ${isOpen ? "ct-faq-item--open" : ""}`} key={faq.id}>
                                        <button className="ct-faq-item-header" type="button" onClick={() => toggle(faq.id)} aria-expanded={isOpen}>
                                            <span className="ct-faq-item-question">{faq.question}</span>
                                            <ChevronIcon open={isOpen} />
                                        </button>
                                        <div className="ct-faq-item-body" style={{ maxHeight: isOpen ? "240px" : "0px" }}>
                                            <p className="ct-faq-item-answer">{faq.answer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CTA bar */}
                    <div className="ct-cta-bar">
                        <div className="ct-cta-left">
                            <span className="ct-cta-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 13a8 8 0 0116 0v5a2 2 0 01-2 2h-1a1 1 0 01-1-1v-5a1 1 0 011-1h2M4 13v5a1 1 0 001 1h1a1 1 0 001-1v-5a1 1 0 00-1-1H4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </span>
                            <span className="ct-cta-text">Need help with your Financial &amp; Tax services?</span>
                        </div>
                        <a href="tel:+15156864275" className="ct-cta-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="#1B2E6B" /></svg>
                            +1 (515) 686-4275
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Scroll to Top ────────────────────────────────────── */}
            <button className={`scroll-to-top-btn ${showScrollTop ? "scroll-to-top-btn--visible" : ""}`} onClick={scrollToTop} aria-label="Scroll to top" title="Back to top">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
        </>
    );
};

export default Contact;
