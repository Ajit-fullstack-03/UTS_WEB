import React, { useState, useEffect } from "react";
import "./career.css";
import careerHeroImage from "../../assets/image/hero_track.png";
import heroBg from "../../assets/image/BACKGROUD.jpeg";

const faqs = [
    { id: 1, question: "What is Umpire Tax Solution?", answer: "Umpire Tax Solution is a modern tax service platform offering accurate preparation, filing support, and practical tax guidance for individuals, freelancers, and growing businesses." },
    { id: 2, question: "Who can use Umpire Tax Solution?", answer: "Individuals, freelancers, and growing businesses looking for accurate, reliable, and hassle-free tax preparation and filing support can use Umpire Tax Solution." },
    { id: 3, question: "How easy is it to get started?", answer: "Getting started takes just a few minutes — create your account, upload your documents securely, and our team takes care of the rest." },
    { id: 4, question: "Are there any hidden fees?", answer: "No. Our pricing is transparent and shown upfront before you file, with no hidden charges added later." },
    { id: 5, question: "How does customer support work?", answer: "Our support team is available via phone and chat to answer questions and guide you through every step of the filing process." },
];

const values = [
    { id: "01", title: "Real ownership, story", description: "You won't be a cog in the machine. From day one, you own your work, make real decisions, and see your contributions shape our products and client outcomes directly." },
    { id: "02", title: "Cross-function exposure", description: "Collaborate with tax experts, engineers, designers, and client success teams. We believe the best work happens when different minds solve the same problem together." },
    { id: "03", title: "Ambitious and experienced", description: "Join a team that's both driven and seasoned. We set bold goals, move fast, and have the experience to know when to slow down and get it right." },
];

const skills = ["Tax Filing", "CPA Certified", "IRS Compliance", "Accounting", "Payroll", "Bookkeeping"];
const ChevronIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`cr-faq-chevron ${open ? "cr-faq-chevron--open" : ""}`}>
        <path d="M6 9l6 6 6-6" stroke="#1B2E6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

const Career = () => {
    const [openId, setOpenId] = useState(1);
    const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", resume: null, website: "" });
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    };
    const handleSubmit = (e) => { e.preventDefault(); alert("Application submitted! We'll be in touch."); };

    return (
        <>
            {/* ── Top Contact Bar ──────────────────────────────────────── */}
            <div className="cr-topbar">
                <div className="cr-topbar-inner">
                    <div className="cr-topbar-item">
                        <span className="cr-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" /></svg></span>
                        <span className="cr-topbar-flag"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="7410" height="3900" fill="#B22234" /><rect y="300" width="7410" height="300" fill="white" /><rect y="900" width="7410" height="300" fill="white" /><rect y="1500" width="7410" height="300" fill="white" /><rect y="2100" width="7410" height="300" fill="white" /><rect y="2700" width="7410" height="300" fill="white" /><rect y="3300" width="7410" height="300" fill="white" /><rect width="2964" height="2100" fill="#3C3B6E" /></svg></span>
                        <span>+1 (515) 686-4275</span>
                    </div>
                    <div className="cr-topbar-item">
                        <span className="cr-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" /></svg></span>
                        <span className="cr-topbar-flag"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="900" height="200" fill="#FF9933" /><rect y="200" width="900" height="200" fill="#FFFFFF" /><rect y="400" width="900" height="200" fill="#138808" /><circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" /><circle cx="450" cy="300" r="8" fill="#000080" /></svg></span>
                        <span>+91 81860-51040</span>
                    </div>
                    <div className="cr-topbar-item">
                        <span className="cr-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg></span>
                        <span>hello@umpirtaxsolutions.com</span>
                    </div>
                </div>
            </div>

            {/* ── Hero ────────────────────────────────────────────────────── */}
            <section className="cr-hero">
                <div className="cr-hero-inner">
                    {/* Left — image with floating elements */}
                    <div className="cr-hero-visual">
                        <div className="cr-hero-img-frame">
                            {/* Background lavender slab */}
                            <div className="cr-hero-bg-slab" />

                            {/* Main image */}
                            <img src={careerHeroImage} alt="Join our team at Umpire Tax Solutions" className="cr-hero-img" />

                            {/* Floating rocket icon — top right, bobs up/down */}
                            <div className="cr-hero-float cr-hero-float--rocket">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C12 2 19 4 19 12C19 16.4 16.4 19 12 21C7.6 19 5 16.4 5 12C5 4 12 2 12 2Z" stroke="#1B2E6B" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
                                    <circle cx="12" cy="12" r="2.5" fill="#1B2E6B" />
                                    <path d="M5 19L3 21M19 19L21 21" stroke="#1B2E6B" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            </div>

                            {/* Floating "100% Client First" pill — bottom left, bobs up/down (delayed) */}
                            <div className="cr-hero-float cr-hero-float--pill">
                                <span className="cr-hero-pill-avatar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="8" r="4" fill="#1B2E6B" />
                                        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#1B2E6B" />
                                    </svg>
                                </span>
                                <span className="cr-hero-pill-text">100% Client First</span>
                            </div>
                        </div>
                    </div>

                    {/* Right — content */}
                    <div className="cr-hero-content">
                        <h1 className="cr-hero-heading">
                            Find Your Future, Elevate
                            <br />
                            Your{" "}
                            <span className="cr-hero-heading-accent">Career Today!</span>
                        </h1>

                        <p className="cr-hero-desc">
                            We're a tax advisory and compliance practice. These are the roles we're currently hiring for, grouped by practice area."
                        </p>

                        <a href="#cr-form" className="cr-hero-btn">
                            Apply Now
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M7 17L17 7M17 7H9M17 7V15" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>


            {/* ── Culture ─────────────────────────────────────────────────── */}
            <section className="cr-culture">
                <div className="cr-culture-inner">
                    <div className="cr-culture-left">
                        <p className="cr-culture-eyebrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1B2E6B" strokeWidth="1.8" fill="none" /><path d="M12 8v4l3 3" stroke="#1B2E6B" strokeWidth="1.8" strokeLinecap="round" fill="none" /></svg>
                            A few words from us
                        </p>
                        <h2 className="cr-culture-heading">Diversity isn't a policy here. <span className="cr-culture-heading-light">It's how the work gets done.</span></h2>
                        <p className="cr-culture-desc">Every one of us is personally accountable for holding a high-performance environment — because the best output of any organization is what its clients can experience, if they can't get solutions.</p>
                        <div className="cr-skill-tags">
                            {skills.map((s) => (<span className="cr-skill-tag" key={s}>{s}</span>))}
                        </div>
                    </div>
                    <div className="cr-culture-right">
                        {values.map((v) => (
                            <div className="cr-value-item" key={v.id}>
                                <div className="cr-value-num">{v.id}</div>
                                <div className="cr-value-body">
                                    <h3 className="cr-value-title">{v.title}</h3>
                                    <p className="cr-value-desc">{v.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Application Form ─────────────────────────────────────────── */}
            <section className="cr-form-section" id="cr-form" >
                <div className="cr-form-inner">
                    <div className="cr-form-header">
                        <div className="cr-form-eyebrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12h6M9 8h6M9 16h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="#1B2E6B" strokeWidth="1.8" strokeLinecap="round" fill="none" /></svg>
                            Apply
                        </div>
                        <h2 className="cr-form-title">Forward your CV. We read every one.</h2>
                        <p className="cr-form-subtitle">Tell us a little about yourself. Submit your details below — we review every application carefully and get back to each candidate.</p>
                    </div>
                    <div className="cr-form-card">
                        <p className="cr-form-card-title">Tell us about yourself</p>
                        <form className="cr-form" onSubmit={handleSubmit}>
                            <div className="cr-form-row">
                                <div className="cr-form-group"><label className="cr-form-label" htmlFor="cr-firstName">First name</label><input id="cr-firstName" className="cr-form-input" type="text" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required /></div>
                                <div className="cr-form-group"><label className="cr-form-label" htmlFor="cr-lastName">Last name</label><input id="cr-lastName" className="cr-form-input" type="text" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required /></div>
                            </div>
                            <div className="cr-form-row">
                                <div className="cr-form-group"><label className="cr-form-label" htmlFor="cr-email">Email</label><input id="cr-email" className="cr-form-input" type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required /></div>
                                <div className="cr-form-group">
                                    <label className="cr-form-label" htmlFor="cr-phone">Phone</label>
                                    <div className="cr-phone-wrap">
                                        <span className="cr-phone-prefix"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="20" height="11" style={{ borderRadius: "2px", display: "block" }}><rect width="7410" height="3900" fill="#B22234" /><rect y="300" width="7410" height="300" fill="white" /><rect y="900" width="7410" height="300" fill="white" /><rect y="1500" width="7410" height="300" fill="white" /><rect y="2100" width="7410" height="300" fill="white" /><rect y="2700" width="7410" height="300" fill="white" /><rect y="3300" width="7410" height="300" fill="white" /><rect width="2964" height="2100" fill="#3C3B6E" /></svg><span>+1</span></span>
                                        <input id="cr-phone" className="cr-form-input cr-phone-input" type="tel" name="phone" placeholder="(555) 000-0000" value={form.phone} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="cr-form-group cr-form-group--full">
                                <label className="cr-form-label" htmlFor="cr-resume">Resume</label>
                                <label className="cr-file-upload" htmlFor="cr-resume">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="#1B2E6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 16.5A4.5 4.5 0 0015.5 12H14a6 6 0 10-11.9 1.2" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" fill="none" /></svg>
                                    <span>{form.resume ? form.resume.name : "Upload your resume here"}</span>
                                    <input id="cr-resume" type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} style={{ display: "none" }} />
                                </label>
                            </div>
                            <div className="cr-form-group cr-form-group--full">
                                <label className="cr-form-label" htmlFor="cr-website">Website / Portfolio</label>
                                <textarea id="cr-website" className="cr-form-input cr-form-textarea" name="website" placeholder="Tell us a bit about yourself or share a portfolio / LinkedIn URL..." value={form.website} onChange={handleChange} rows={3} />
                            </div>
                            <button type="submit" className="cr-submit-btn" id="cr-submit-btn">Submit application →</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <section className="cr-faq-wrapper">
                <div className="cr-faq-inner">
                    <div className="cr-faq-top">
                        <div className="cr-faq-content">
                            <div className="cr-faq-badge">FAQ</div>
                            <h2 className="cr-faq-heading">Frequently Asked Questions</h2>
                            <p className="cr-faq-description">Umpire Tax Solution helps individuals and businesses prepare accurate returns, stay compliant, and navigate tax season with confidence through reliable guidance and responsive support.</p>
                            <button className="cr-faq-check-more" type="button">Check More <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg></button>
                        </div>
                        <div className="cr-faq-accordion">
                            {faqs.map((faq) => {
                                const isOpen = openId === faq.id;
                                return (
                                    <div className={`cr-faq-item ${isOpen ? "cr-faq-item--open" : ""}`} key={faq.id}>
                                        <button className="cr-faq-item-header" type="button" onClick={() => toggle(faq.id)} aria-expanded={isOpen}>
                                            <span className="cr-faq-item-question">{faq.question}</span>
                                            <ChevronIcon open={isOpen} />
                                        </button>
                                        <div className="cr-faq-item-body" style={{ maxHeight: isOpen ? "240px" : "0px" }}>
                                            <p className="cr-faq-item-answer">{faq.answer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="cr-faq-contact-bar">
                        <div className="cr-faq-contact-left">
                            <span className="cr-faq-contact-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 13a8 8 0 0116 0v5a2 2 0 01-2 2h-1a1 1 0 01-1-1v-5a1 1 0 011-1h2M4 13v5a1 1 0 001 1h1a1 1 0 001-1v-5a1 1 0 00-1-1H4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg></span>
                            <span className="cr-faq-contact-text">Need help with your Financial &amp; Tax services?</span>
                        </div>
                        <a href="tel:+15156864275" className="cr-faq-contact-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="#1B2E6B" /></svg>
                            +1 (515) 686-4275
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Scroll to Top ────────────────────────────────────────────── */}
            <button className={`scroll-to-top-btn ${showScrollTop ? "scroll-to-top-btn--visible" : ""}`} onClick={scrollToTop} aria-label="Scroll to top" title="Back to top">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
        </>
    );
};

export default Career;
