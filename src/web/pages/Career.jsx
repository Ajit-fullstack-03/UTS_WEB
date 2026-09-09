import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { webservices } from "../services/webServices";
import "./career.css";
import careerHeroImage from "../../assets/image/hero_track.png";
import rocket from "../../assets/image/boxicons_rocket.png";
import apply from "../../assets/image/apply.png";

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

    // Phone country code state
    const [phoneCodeSelect, setPhoneCodeSelect] = useState("+1");
    const [customPhoneCode, setCustomPhoneCode] = useState("+");
    const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
    const phoneDropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) {
                setIsPhoneDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Form state & validations
    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        emailaddress: "",
        phone: "",
        message: "",
        uploadresume: null,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedExtensions = [".pdf", ".doc", ".docx"];
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            setErrors((prev) => ({
                ...prev,
                uploadresume: "Only PDF (.pdf) and Word documents (.doc, .docx) are allowed.",
            }));
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const maxSize = 4 * 1024 * 1024; // 4 MB
        if (file.size > maxSize) {
            setErrors((prev) => ({
                ...prev,
                uploadresume: "Resume file size must not exceed 4 MB.",
            }));
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setForm((prev) => ({ ...prev, uploadresume: file }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next.uploadresume;
            return next;
        });
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setForm((prev) => ({ ...prev, uploadresume: null }));
        if (fileInputRef.current) fileInputRef.current.value = "";
        setErrors((prev) => {
            const next = { ...prev };
            delete next.uploadresume;
            return next;
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const validate = () => {
        const newErrors = {};

        // First Name
        if (!form.firstname || !form.firstname.trim()) {
            newErrors.firstname = "First name is required.";
        } else if (form.firstname.trim().length < 2) {
            newErrors.firstname = "First name must be at least 2 characters.";
        } else if (!/^[a-zA-Z\s'-]+$/.test(form.firstname.trim())) {
            newErrors.firstname = "First name can only contain letters, spaces, and hyphens.";
        }

        // Last Name
        if (!form.lastname || !form.lastname.trim()) {
            newErrors.lastname = "Last name is required.";
        } else if (!/^[a-zA-Z\s'-]+$/.test(form.lastname.trim())) {
            newErrors.lastname = "Last name can only contain letters, spaces, and hyphens.";
        }

        // Email
        if (!form.emailaddress || !form.emailaddress.trim()) {
            newErrors.emailaddress = "Email address is required.";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.emailaddress.trim())) {
            newErrors.emailaddress = "Please enter a valid email address.";
        }

        // Phone Extension
        const effectivePhoneExt = phoneCodeSelect === "other" ? customPhoneCode.trim() : phoneCodeSelect;
        if (!effectivePhoneExt || effectivePhoneExt === "+" || !/^\+[0-9]{1,4}$/.test(effectivePhoneExt)) {
            newErrors.phoneext = "Please enter a valid country code (e.g. +44).";
        }

        // Phone Number
        if (!form.phone || !form.phone.trim()) {
            newErrors.phone = "Phone number is required.";
        } else {
            const digits = form.phone.replace(/\D/g, "");
            if (digits.length < 7 || digits.length > 15) {
                newErrors.phone = "Phone number must be between 7 and 15 digits.";
            }
        }

        // Message
        if (!form.message || !form.message.trim()) {
            newErrors.message = "Message / Cover note is required.";
        } else if (form.message.trim().length < 5) {
            newErrors.message = "Message must be at least 5 characters.";
        }

        // Resume
        if (!form.uploadresume) {
            newErrors.uploadresume = "Please upload your resume (PDF or Word, max 4MB).";
        } else {
            const allowedExtensions = [".pdf", ".doc", ".docx"];
            const fileExtension = "." + form.uploadresume.name.split(".").pop().toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                newErrors.uploadresume = "Only PDF (.pdf) and Word documents (.doc, .docx) are allowed.";
            } else if (form.uploadresume.size > 4 * 1024 * 1024) {
                newErrors.uploadresume = "Resume file size must not exceed 4 MB.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        const effectivePhoneExt = phoneCodeSelect === "other" ? customPhoneCode.trim() : phoneCodeSelect;

        try {
            const formData = new FormData();
            formData.append("firstname", form.firstname.trim());
            formData.append("lastname", form.lastname.trim());
            formData.append("emailaddress", form.emailaddress.trim());
            formData.append("phoneext", effectivePhoneExt);
            formData.append("phone", form.phone.trim());
            formData.append("message", form.message.trim());
            formData.append("uploadresume", form.uploadresume);

            const response = await webservices.careerssubmit(formData);

            if (response.data && (response.data.http_code === 200 || response.data.status_smessage?.toLowerCase().includes("success"))) {
                Swal.fire({
                    icon: "success",
                    title: "Application Submitted!",
                    text: response.data.status_smessage || "Career has been added successfully.",
                    confirmButtonColor: "#1B2E6B",
                });

                // Reset form
                setForm({
                    firstname: "",
                    lastname: "",
                    emailaddress: "",
                    phone: "",
                    message: "",
                    uploadresume: null,
                });
                setPhoneCodeSelect("+1");
                setCustomPhoneCode("+");
                setErrors({});
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Submission Failed",
                    text: response.data?.status_smessage || "Unable to submit application. Please try again.",
                    confirmButtonColor: "#1B2E6B",
                });
            }
        } catch (error) {
            console.error("Career submission error:", error);
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: error?.response?.data?.status_smessage || error?.message || "Something went wrong while submitting your application. Please try again.",
                confirmButtonColor: "#1B2E6B",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* ── Top Contact Bar ──────────────────────────────────────── */}
            <div className="ct-topbar cr-topbar">
                <div className="ct-topbar-inner cr-topbar-inner">
                    <div className="ct-topbar-item cr-topbar-item">
                        <span className="ct-topbar-icon cr-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" /></svg></span>
                        <span className="ct-topbar-flag cr-topbar-flag"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="7410" height="3900" fill="#B22234" /><rect y="300" width="7410" height="300" fill="white" /><rect y="900" width="7410" height="300" fill="white" /><rect y="1500" width="7410" height="300" fill="white" /><rect y="2100" width="7410" height="300" fill="white" /><rect y="2700" width="7410" height="300" fill="white" /><rect y="3300" width="7410" height="300" fill="white" /><rect width="2964" height="2100" fill="#3C3B6E" /></svg></span>
                        <span>+1 (515) 686-4275</span>
                    </div>
                    <div className="ct-topbar-item cr-topbar-item">
                        <span className="ct-topbar-icon cr-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" /></svg></span>
                        <span className="ct-topbar-flag cr-topbar-flag"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}><rect width="900" height="200" fill="#FF9933" /><rect y="200" width="900" height="200" fill="#FFFFFF" /><rect y="400" width="900" height="200" fill="#138808" /><circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" /><circle cx="450" cy="300" r="8" fill="#000080" /></svg></span>
                        <span>+91 81860-51040</span>
                    </div>
                    <div className="ct-topbar-item cr-topbar-item">
                        <span className="ct-topbar-icon cr-topbar-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg></span>
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
                                <img src={rocket} alt="Rocket icon" height={20} width={20} />
                            </div>

                            {/* Floating "100% Client First" pill — bottom left, bobs up/down (delayed) */}
                            <div className="cr-hero-float cr-hero-float--pill">
                                <span className="cr-hero-pill-avatar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="8" r="4" fill="#305EFF" />
                                        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#305EFF" />
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
                            We're a tax advisory and compliance practice. These are the roles we're currently hiring for, grouped by practice area.
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
            <section className="cr-form-section" id="cr-form">
                <div className="cr-form-inner">
                    <div className="cr-form-header">
                        <div className="cr-form-eyebrow">
                            <img src={apply} alt="Apply icon" height={13} width={13} />
                            Apply
                        </div>
                        <h2 className="cr-form-title">Forward your CV. We read every one.</h2>
                        <p className="cr-form-subtitle">Tell us a little about yourself. Submit your details below — we review every application carefully and get back to each candidate.</p>
                    </div>
                    <div className="cr-form-card">
                        <p className="cr-form-card-title">Tell us about yourself</p>
                        <form className="cr-form" onSubmit={handleSubmit} noValidate>
                            <div className="cr-form-row">
                                <div className="cr-form-group">
                                    <label className="cr-form-label" htmlFor="cr-firstname">First name *</label>
                                    <input
                                        id="cr-firstname"
                                        className={`cr-form-input ${errors.firstname ? "is-invalid" : ""}`}
                                        type="text"
                                        name="firstname"
                                        placeholder="John"
                                        value={form.firstname}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.firstname && <span className="cr-field-error">{errors.firstname}</span>}
                                </div>
                                <div className="cr-form-group">
                                    <label className="cr-form-label" htmlFor="cr-lastname">Last name *</label>
                                    <input
                                        id="cr-lastname"
                                        className={`cr-form-input ${errors.lastname ? "is-invalid" : ""}`}
                                        type="text"
                                        name="lastname"
                                        placeholder="Doe"
                                        value={form.lastname}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.lastname && <span className="cr-field-error">{errors.lastname}</span>}
                                </div>
                            </div>

                            <div className="cr-form-row">
                                <div className="cr-form-group">
                                    <label className="cr-form-label" htmlFor="cr-emailaddress">Email *</label>
                                    <input
                                        id="cr-emailaddress"
                                        className={`cr-form-input ${errors.emailaddress ? "is-invalid" : ""}`}
                                        type="email"
                                        name="emailaddress"
                                        placeholder="john.doe@example.com"
                                        value={form.emailaddress}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.emailaddress && <span className="cr-field-error">{errors.emailaddress}</span>}
                                </div>
                                <div className="cr-form-group">
                                    <label className="cr-form-label" htmlFor="cr-phone">Phone *</label>
                                    <div className={`cr-phone-wrap ${errors.phone || errors.phoneext ? "is-invalid" : ""}`} ref={phoneDropdownRef}>
                                        {phoneCodeSelect === "other" ? (
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="text"
                                                    className="cr-phone-prefix text-center"
                                                    style={{ width: "65px", padding: "10px 4px", border: "none", borderRight: "1.5px solid #e5e7eb", background: "#f3f4f6" }}
                                                    value={customPhoneCode}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (val && !val.startsWith("+")) {
                                                            val = "+" + val.replace(/\+/g, "");
                                                        }
                                                        setCustomPhoneCode(val);
                                                        if (errors.phoneext) {
                                                            setErrors((prev) => {
                                                                const next = { ...prev };
                                                                delete next.phoneext;
                                                                return next;
                                                            });
                                                        }
                                                    }}
                                                    placeholder="+XX"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPhoneCodeSelect("+1");
                                                        if (errors.phoneext) {
                                                            setErrors((prev) => {
                                                                const next = { ...prev };
                                                                delete next.phoneext;
                                                                return next;
                                                            });
                                                        }
                                                    }}
                                                    style={{ background: "none", border: "none", color: "#64748b", fontSize: "11px", padding: "0 6px", cursor: "pointer", textDecoration: "underline" }}
                                                    title="Back to list"
                                                >
                                                    List
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="cr-phone-prefix-btn"
                                                    onClick={() => setIsPhoneDropdownOpen((prev) => !prev)}
                                                    title="Select country code"
                                                >
                                                    {phoneCodeSelect === "+1" && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="18" height="11" style={{ borderRadius: "2px", display: "block" }}>
                                                            <rect width="7410" height="3900" fill="#B22234" />
                                                            <rect y="300" width="7410" height="300" fill="white" />
                                                            <rect y="900" width="7410" height="300" fill="white" />
                                                            <rect y="1500" width="7410" height="300" fill="white" />
                                                            <rect y="2100" width="7410" height="300" fill="white" />
                                                            <rect y="2700" width="7410" height="300" fill="white" />
                                                            <rect y="3300" width="7410" height="300" fill="white" />
                                                            <rect width="2964" height="2100" fill="#3C3B6E" />
                                                        </svg>
                                                    )}
                                                    {phoneCodeSelect === "+91" && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="18" height="11" style={{ borderRadius: "2px", display: "block" }}>
                                                            <rect width="900" height="200" fill="#FF9933" />
                                                            <rect y="200" width="900" height="200" fill="#FFFFFF" />
                                                            <rect y="400" width="900" height="200" fill="#138808" />
                                                            <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" />
                                                            <circle cx="450" cy="300" r="8" fill="#000080" />
                                                        </svg>
                                                    )}
                                                    <span>{phoneCodeSelect}</span>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isPhoneDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </button>

                                                {isPhoneDropdownOpen && (
                                                    <div className="cr-flag-menu">
                                                        <div
                                                            className={`cr-flag-item ${phoneCodeSelect === "+1" ? "active" : ""}`}
                                                            onClick={() => {
                                                                setPhoneCodeSelect("+1");
                                                                setIsPhoneDropdownOpen(false);
                                                                if (errors.phoneext) {
                                                                    setErrors((prev) => {
                                                                        const next = { ...prev };
                                                                        delete next.phoneext;
                                                                        return next;
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="18" height="11" style={{ borderRadius: "2px", display: "block" }}>
                                                                <rect width="7410" height="3900" fill="#B22234" />
                                                                <rect y="300" width="7410" height="300" fill="white" />
                                                                <rect y="900" width="7410" height="300" fill="white" />
                                                                <rect y="1500" width="7410" height="300" fill="white" />
                                                                <rect y="2100" width="7410" height="300" fill="white" />
                                                                <rect y="2700" width="7410" height="300" fill="white" />
                                                                <rect y="3300" width="7410" height="300" fill="white" />
                                                                <rect width="2964" height="2100" fill="#3C3B6E" />
                                                            </svg>
                                                            <span>+1 (USA)</span>
                                                        </div>
                                                        <div
                                                            className={`cr-flag-item ${phoneCodeSelect === "+91" ? "active" : ""}`}
                                                            onClick={() => {
                                                                setPhoneCodeSelect("+91");
                                                                setIsPhoneDropdownOpen(false);
                                                                if (errors.phoneext) {
                                                                    setErrors((prev) => {
                                                                        const next = { ...prev };
                                                                        delete next.phoneext;
                                                                        return next;
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="18" height="11" style={{ borderRadius: "2px", display: "block" }}>
                                                                <rect width="900" height="200" fill="#FF9933" />
                                                                <rect y="200" width="900" height="200" fill="#FFFFFF" />
                                                                <rect y="400" width="900" height="200" fill="#138808" />
                                                                <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" />
                                                                <circle cx="450" cy="300" r="8" fill="#000080" />
                                                            </svg>
                                                            <span>+91 (IND)</span>
                                                        </div>
                                                        <div
                                                            className={`cr-flag-item ${phoneCodeSelect === "other" ? "active" : ""}`}
                                                            onClick={() => {
                                                                setPhoneCodeSelect("other");
                                                                setCustomPhoneCode("+");
                                                                setIsPhoneDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span style={{ fontSize: "14px", lineHeight: 1 }}>🌐</span>
                                                            <span>Other</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <input
                                            id="cr-phone"
                                            className="cr-form-input cr-phone-input"
                                            type="tel"
                                            name="phone"
                                            placeholder={phoneCodeSelect === "+1" ? "(555) 000-0000" : phoneCodeSelect === "+91" ? "98765 43210" : "Phone number"}
                                            value={form.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.phoneext && <span className="cr-field-error">{errors.phoneext}</span>}
                                    {errors.phone && <span className="cr-field-error">{errors.phone}</span>}
                                </div>
                            </div>

                            <div className="cr-form-group cr-form-group--full">
                                <label className="cr-form-label" htmlFor="cr-resume">Resume (PDF or Word, max 4MB) *</label>
                                <label className={`cr-file-upload ${errors.uploadresume ? "is-invalid" : ""}`} htmlFor="cr-resume">
                                    <div className="cr-file-info">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                            <path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="#1B2E6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M20 16.5A4.5 4.5 0 0015.5 12H14a6 6 0 10-11.9 1.2" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                                        </svg>
                                        <span style={{ fontWeight: form.uploadresume ? "600" : "normal", color: form.uploadresume ? "#1B2E6B" : "inherit" }}>
                                            {form.uploadresume ? form.uploadresume.name : "Upload your resume here (.pdf, .doc, .docx)"}
                                        </span>
                                        {form.uploadresume && (
                                            <span className="cr-file-size">{formatFileSize(form.uploadresume.size)}</span>
                                        )}
                                    </div>
                                    {form.uploadresume && (
                                        <button
                                            type="button"
                                            className="cr-file-remove-btn"
                                            onClick={handleRemoveFile}
                                            title="Remove file"
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                    <input
                                        id="cr-resume"
                                        ref={fileInputRef}
                                        type="file"
                                        name="uploadresume"
                                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                </label>
                                <span className="cr-file-hint">Supported formats: PDF, DOC, DOCX up to 4 MB</span>
                                {errors.uploadresume && <span className="cr-field-error">{errors.uploadresume}</span>}
                            </div>

                            <div className="cr-form-group cr-form-group--full">
                                <label className="cr-form-label" htmlFor="cr-message">Message / Cover Note *</label>
                                <textarea
                                    id="cr-message"
                                    className={`cr-form-input cr-form-textarea ${errors.message ? "is-invalid" : ""}`}
                                    name="message"
                                    placeholder="Tell us a bit about yourself, your background, or share your portfolio / LinkedIn URL..."
                                    value={form.message}
                                    onChange={handleChange}
                                    rows={3}
                                    required
                                />
                                {errors.message && <span className="cr-field-error">{errors.message}</span>}
                            </div>

                            <button type="submit" className="cr-submit-btn" id="cr-submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting application...
                                    </>
                                ) : (
                                    <>Submit application →</>
                                )}
                            </button>
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
                            <Link to="/contact" className="cr-faq-check-more">Check More <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg></Link>
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
