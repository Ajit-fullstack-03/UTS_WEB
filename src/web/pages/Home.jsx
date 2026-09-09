import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import heroImage from "../../assets/image/page_track.png";
import personImage from "../../assets/image/trust.png";
import onePlatformImg1 from "../../assets/image/frame1.png";
import weFileImg1 from "../../assets/image/frame2.png";
import taxEstimateImg2 from "../../assets/image/frame3.png";
import medicalExpensesImage from "../../assets/image/m1.png";
import studentLoanImage from "../../assets/image/m2.png";
import iraImage from "../../assets/image/m3.png";
import personImage2 from "../../assets/image/grouptag.png";
import step1Image from "../../assets/image/mid_frame.png";
import step2Image from "../../assets/image/mid_frame2.png";
import step3Image from "../../assets/image/mid_frame3.png";
import heroBg from "../../assets/image/BACKGROUD.jpeg";
import gist from "../../assets/image/gift.gif";
import srf1 from "../../assets/image/srf1.png";
import Tax_planning_2 from "../../assets/image/Tax_planning_2.png";
import Book_keeping_4 from "../../assets/image/Book_keeping_4.png";
import { ArrowLeft, ArrowRight } from "iconsax-reactjs";


const services = [
    { id: 1, image: onePlatformImg1, label: "Free Tax Estimate" },
    { id: 2, image: weFileImg1, label: "One Platform. Every Tax Need." },
    { id: 3, image: taxEstimateImg2, label: "We File. You Relax." },
    { id: 4, image: srf1, label: "Individual & Corporate Tax Filing" },
    { id: 5, image: Tax_planning_2, label: "Business Tax Returns." },
    { id: 6, image: Book_keeping_4, label: "Accounts Payable/Receivable." },
];

const testimonials = [
    {
        id: 1,
        text: "I highly recommend Umpire Tax Solutions! They were incredibly helpful, not only during the tax filing process but also with any questions or support I needed afterward. Their team guided me through every step, making sure I understood my options. Even after my taxes were filed, they stayed responsive, answering follow-up questions and providing valuable advice. Their commitment to excellent service and ongoing support makes them stand out.",
        rating: 5,
        name: "yasaswi sykam",
        time: "1 week ago",
        avatarType: "person",
    },
    {
        id: 2,
        text: "I have been using Umpire Tax Solutions for the past three years. They have a fantastic team with extensive knowledge, providing excellent service. They help me understand the filing process and ensure all paperwork is filed correctly. I highly recommend them.",
        rating: 5,
        name: "Gangadhar kondati",
        time: "10 days ago",
        avatarType: "brand",
    },
    {
        id: 3,
        text: "I have been doing my taxes with Umpire tax from quite some time now, They have been really helpful in assessing the documents and filing them correctly. Vinay, especially had helped me from past two years by being available on phone and answering the emails promptly.",
        rating: 5,
        name: "kalasamudram kavya",
        time: "2 weeks ago",
        avatarType: "brand",
    },
    {
        id: 4,
        text: "I have been using umpire tax solutions services from last 4 years. they do tremendous job in playing their role and in process of explaining things and providing services to customers. i satisfied with their prompt response through calls and emails..thanks team for all you done for me. i definitely recommend this consultant to anyone there looking for TAX FILINGS.",
        rating: 5,
        name: "Motupalli Chaitanya",
        time: "3 weeks ago",
        avatarType: "person",
    },
    {
        id: 5,
        text: "The level of service provided is exceptional! The team's responsiveness to my phone calls and inquiries is nearly instantaneous. Additionally, they possess a wealth of knowledge when it comes to taxes and the intricacies of the rules involved. It's evident that the team is well-versed in these areas and can provide valuable insights and guidance. Their expertise in navigating tax regulations and rules is truly commendable. I appreciate the team's prompt assistance and their ability to offer comprehensive information. Thank you.",
        rating: 5,
        name: "Nanda Pai",
        time: "1 month ago",
        avatarType: "person",
    },
];


const IconArrow = ({ color = "#1B2E6B" }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 17L17 7M17 7H9M17 7V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconChart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="12" width="4" height="8" rx="1" fill="#FFFFFF" />
        <rect x="10" y="7" width="4" height="13" rx="1" fill="#FFFFFF" />
        <rect x="17" y="3" width="4" height="17" rx="1" fill="#FFFFFF" />
    </svg>
);

const IconDoc = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const IconHouse = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 11l9-7 9 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

const steps = [
    {
        id: 1,
        label: "Step 01",
        title: "Sign up & Upload Documents",
        description: "Create your account in seconds and upload your required documents securely.",
        image: step1Image,
        imageAlt: "Create your account and upload documents",
    },
    {
        id: 2,
        label: "Step 02",
        title: "We Review & Analyze",
        description: "Our tax experts review your documents, analyze your data and ensure maximum savings with 100% compliance.",
        image: step2Image,
        imageAlt: "We review your documents and analyze data",
    },
    {
        id: 3,
        label: "Step 03",
        title: "Get Tax Report on Email",
        description: "Once completed, our analyst will send your Tax Report (PDF) directly to your email.",
        image: step3Image,
        imageAlt: "Receive your tax report on email",
    },
];

const StarIcon = () => (

    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5B400" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 17.6 5.8 20.9l1.6-6.8-5.2-4.6 6.9-.7L12 2.5z" />
    </svg>
);

const PersonAvatar = () => (
    <div className="tm-avatar tm-avatar--person">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" fill="#FFFFFF" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#FFFFFF" />
        </svg>
    </div>
);

const BrandAvatar = () => (
    <div className="tm-avatar tm-avatar--brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="7" width="18" height="12" rx="1.5" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
            <path d="M3 10h18" stroke="#1B2E6B" strokeWidth="1.6" />
        </svg>
    </div>
);

const AnimatedCounter = ({ target, suffix = "", prefix = "", duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const counterRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const el = counterRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let startTime = null;

                    const animate = (currentTime) => {
                        if (!startTime) startTime = currentTime;
                        const progress = Math.min((currentTime - startTime) / duration, 1);
                        const easeProgress = 1 - Math.pow(1 - progress, 4);
                        setCount(Math.floor(easeProgress * target));

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setCount(target);
                        }
                    };

                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration, hasAnimated]);

    return (
        <span ref={counterRef}>
            {prefix}{count}{suffix}
        </span>
    );
};
const faqs = [
    {
        id: 1,
        question: "What is Umpire Tax Solution?",
        answer:
            "Umpire Tax Solution is a modern tax service platform offering accurate preparation, filing support, and practical tax guidance for individuals, freelancers, and growing businesses.",
    },
    {
        id: 2,
        question: "Who can use Umpire Tax Solution?",
        answer:
            "Individuals, freelancers, and growing businesses looking for accurate, reliable, and hassle-free tax preparation and filing support can use Umpire Tax Solution.",
    },
    {
        id: 3,
        question: "How easy is it to get started?",
        answer:
            "Getting started takes just a few minutes — create your account, upload your documents securely, and our team takes care of the rest.",
    },
    {
        id: 4,
        question: "Are there any hidden fees?",
        answer:
            "No. Our pricing is transparent and shown upfront before you file, with no hidden charges added later.",
    },
    {
        id: 5,
        question: "How does customer support work?",
        answer:
            "Our support team is available via phone and chat to answer questions and guide you through every step of the filing process.",
    },
];

const ChevronIcon = ({ open }) => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`faq-chevron ${open ? "faq-chevron--open" : ""}`}>
        <path d="M6 9l6 6 6-6" stroke="#1B2E6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);


const Home = () => {
    const trackRef = useRef(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(true);
    const updateScrollState = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        setCanScrollPrev(track.scrollLeft > 4);
        setCanScrollNext(track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
    }, []);

    useEffect(() => {
        updateScrollState();
        const track = trackRef.current;
        if (!track) return;
        track.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);
        return () => {
            track.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [updateScrollState]);

    const slide = (direction) => {
        const track = trackRef.current;
        if (!track) return;
        const firstCard = track.querySelector(".tm-card");
        if (!firstCard) return;

        const cardStyle = window.getComputedStyle(track);
        const gap = parseFloat(cardStyle.columnGap || cardStyle.gap || "0");
        const distance = firstCard.getBoundingClientRect().width + gap;

        track.scrollBy({ left: direction * distance, behavior: "smooth" });
    };
    const [openId, setOpenId] = useState(1);
    const toggle = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    // Scroll to top
    const [showScrollTop, setShowScrollTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <>
            <section className="hero-wrapper"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                {/* Top contact bar */}
                <div className="hero-topbar">
                    <div className="hero-topbar-inner">
                        <div className="hero-topbar-item">
                            <span className="hero-topbar-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" />
                                </svg>
                            </span>
                            {/* USA Flag SVG */}
                            <span className="hero-topbar-flag">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}>
                                    <rect width="7410" height="3900" fill="#B22234" />
                                    <rect y="300" width="7410" height="300" fill="white" />
                                    <rect y="900" width="7410" height="300" fill="white" />
                                    <rect y="1500" width="7410" height="300" fill="white" />
                                    <rect y="2100" width="7410" height="300" fill="white" />
                                    <rect y="2700" width="7410" height="300" fill="white" />
                                    <rect y="3300" width="7410" height="300" fill="white" />
                                    <rect width="2964" height="2100" fill="#3C3B6E" />
                                </svg>
                            </span>
                            <span>+1 (515)686-4275</span>
                        </div>

                        <div className="hero-topbar-item">
                            <span className="hero-topbar-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" />
                                </svg>
                            </span>
                            {/* India Flag SVG */}
                            <span className="hero-topbar-flag">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="22" height="12" style={{ borderRadius: "2px", display: "block" }}>
                                    <rect width="900" height="200" fill="#FF9933" />
                                    <rect y="200" width="900" height="200" fill="#FFFFFF" />
                                    <rect y="400" width="900" height="200" fill="#138808" />
                                    <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="6" />
                                    <circle cx="450" cy="300" r="8" fill="#000080" />
                                </svg>
                            </span>
                            <span>+91 81860-51040</span>
                        </div>

                        <div className="hero-topbar-item">
                            <span className="hero-topbar-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                            </span>
                            <span>hello@umpirtaxsolutions.com</span>
                        </div>
                    </div>
                </div>

                {/* Main hero content */}
                <div className="hero-main">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2l7 3v6c0 5-3.4 8.6-7 11-3.6-2.4-7-6-7-11V5l7-3z" stroke="#1B2E6B" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
                                <path d="M9 12l2 2 4-4" stroke="#1B2E6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                            <span>Trusted Tax Experts | 10+ Years Experience</span>
                        </div>

                        <h1 className="hero-heading">
                            <span className="hero-heading-accent">Tax Filing, </span>
                            <span className="hero-heading-dark">Done right. Every Time.</span>
                        </h1>

                        <p className="hero-description">
                            Reliable tax expertise and personalized support to keep you compliant and financially confident.
                        </p>

                        <div className="hero-cta-group">
                            <Link to="/register" className="hero-btn hero-btn-primary">Get Started</Link>
                            <Link to="/login" className="hero-btn hero-btn-secondary">
                                <img src={gist} alt="" className="image-icon" />
                                Refer &amp; Earn
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-image-frame">
                            <img src={heroImage} alt="Tax experts reviewing returns" className="hero-image" />

                            {/* Floating stat card - top left */}
                            <div className="hero-float-card hero-float-card--stats">
                                <div className="hero-float-card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="12" width="4" height="8" rx="1" fill="#1B2E6B" />
                                        <rect x="10" y="7" width="4" height="13" rx="1" fill="#1B2E6B" />
                                        <rect x="17" y="3" width="4" height="17" rx="1" fill="#1B2E6B" />
                                    </svg>
                                </div>
                                <div className="hero-float-card-text">
                                    <span className="hero-float-card-label">This Season</span>
                                    <span className="hero-float-card-value">1,200+</span>
                                    <span className="hero-float-card-sub">Returns Filed</span>
                                </div>
                                <div className="hero-float-card-progress">
                                    <div className="hero-float-card-progress-track">
                                        <div className="hero-float-card-progress-fill" style={{ width: "80%" }} />
                                    </div>
                                    <div className="hero-float-card-progress-labels">
                                        <span>Target: 1,500</span>
                                        <span>80%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating refund pill - bottom right */}
                            <div className="hero-float-card hero-float-card--refund">
                                <span className="hero-float-card-refund-icon" role="img" aria-label="money bag">💰</span>
                                <span>Estimated Refund</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom stats bar */}
                <div className="hero-statsbar">
                    <div className="hero-statsbar-inner">
                        <div className="hero-stat">
                            <span className="hero-stat-value">
                                <AnimatedCounter target={1000} suffix="+" />
                            </span>
                            <span className="hero-stat-label">Happy clients</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">
                                <AnimatedCounter target={10} suffix="K+" />
                            </span>
                            <span className="hero-stat-label">Returns filed</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">
                                <AnimatedCounter target={10} suffix=" yrs" />
                            </span>
                            <span className="hero-stat-label">Experience</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="wcu-wrapper">
                <div className="wcu-bg-circles" aria-hidden="true"></div>

                <div className="wcu-inner">
                    {/* Left visual */}
                    <div className="wcu-visual">
                        <div className="wcu-image-card">
                            <div className="wcu-image-blob">
                                <img src={personImage} alt="Tax professional reviewing documents" className="wcu-image" />
                            </div>

                            {/* Floating badge - top right */}
                            <div className="wcu-chip wcu-chip--cpa">
                                <span className="wcu-chip-icon wcu-chip-icon--blue">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2l7 3v6c0 5-3.4 8.6-7 11-3.6-2.4-7-6-7-11V5l7-3z" stroke="#1B2E6B" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
                                        <path d="M9 12l2 2 4-4" stroke="#1B2E6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </span>
                                <span>CPA certified experts</span>
                            </div>

                            {/* Floating badge - middle left */}
                            <div className="wcu-chip wcu-chip--turnaround">
                                <span className="wcu-chip-icon wcu-chip-icon--yellow">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22a2.2 2.2 0 002.2-2.2h-4.4A2.2 2.2 0 0012 22z" fill="#8A6D1F" />
                                        <path d="M18.4 16.4V11a6.4 6.4 0 10-12.8 0v5.4L4 18.2v.9h16v-.9l-1.6-1.8z" fill="#8A6D1F" />
                                    </svg>
                                </span>
                                <span>2-3 day turnaround</span>
                            </div>

                            {/* Floating badge - bottom */}
                            <div className="wcu-chip wcu-chip--refund">
                                <span className="wcu-chip-icon wcu-chip-icon--yellow">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="9" stroke="#8A6D1F" strokeWidth="1.8" fill="none" />
                                        <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#8A6D1F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </span>
                                <span>Max refund guarantee</span>
                            </div>
                        </div>
                    </div>

                    {/* Right content */}
                    <div className="wcu-content">
                        <div className="wcu-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                                <path d="M8 12.3l2.4 2.4L16 9" stroke="#1B2E6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                            <span>Why choose us</span>
                        </div>

                        <h2 className="wcu-heading">
                            Your taxes. Done
                            <br />
                            right. Every time.
                        </h2>

                        <p className="wcu-description">
                            Trusted tax professionals using smart technology for accurate, hassle-free tax filing
                        </p>
                    </div>
                </div>
            </section>

            <section className="os-wrapper">
                <div className="os-inner">
                    <div className="os-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
                            <rect x="14" y="3" width="7" height="7" rx="1.2" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
                            <rect x="3" y="14" width="7" height="7" rx="1.2" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
                            <rect x="14" y="14" width="7" height="7" rx="1.2" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
                        </svg>
                        <span>Our Services</span>
                    </div>

                    <h2 className="os-heading">Everything You Need for Stress-Free Tax Filing</h2>

                    <div className="os-grid">
                        {services.map((service) => (
                            <div className="os-card" key={service.id}>
                                <div className="os-card-image-wrap">
                                    <img src={service.image} alt={service.label} className="os-card-image" />
                                </div>
                                <p className="os-card-label">{service.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="tso-wrapper">
                <div className="tso-bg-circles" aria-hidden="true"></div>
                <div className="tso-inner">
                    <div className="tso-header">
                        <div className="tso-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                                <rect x="14" y="3" width="7" height="7" rx="1.2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                                <rect x="3" y="14" width="7" height="7" rx="1.2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                                <rect x="14" y="14" width="7" height="7" rx="1.2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                            </svg>
                            <span>Tax-Saving Opportunities</span>
                        </div>

                        <h2 className="tso-heading">Maximize Your Tax Savings with Every Return</h2>
                        <p className="tso-subheading">Maximize your refund by claiming every eligible deduction and tax credit.</p>
                    </div>

                    <div className="tso-grid">
                        {/* Column 1 */}
                        <div className="tso-col">
                            <div className="tso-card tso-card--light tso-card--with-image">
                                <div className="tso-card-top">
                                    <h3 className="tso-card-title">Retire Smarter with an IRA</h3>
                                    <span className="tso-card-arrow tso-card-arrow--light">
                                        <IconArrow color="#1B2E6B" />
                                    </span>
                                </div>
                                <p className="tso-card-desc">Build your retirement with tax-advantaged savings and long-term growth.</p>
                                <div className="tso-card-image-wrap">
                                    <img src={iraImage} alt="Retire smarter with an IRA" className="tso-card-image" />
                                </div>
                            </div>

                            <div className="tso-card tso-card--dark">
                                <div className="tso-card-top">
                                    <span className="tso-card-icon tso-card-icon--dark">
                                        <IconDoc />
                                    </span>
                                    <span className="tso-card-arrow tso-card-arrow--dark">
                                        <IconArrow color="#1B2E6B" />
                                    </span>
                                </div>
                                <h3 className="tso-card-title tso-card-title--onDark">Tax Credits</h3>
                                <p className="tso-card-desc tso-card-desc--onDark">
                                    Reduce your tax bill with eligible tax credits, including the Child Tax Credit and Child &amp; Dependent Care Credit.
                                </p>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="tso-col">
                            <div className="tso-card tso-card--light">
                                <div className="tso-card-top">
                                    <span className="tso-card-icon tso-card-icon--light">
                                        <IconChart />
                                    </span>
                                    <span className="tso-card-arrow tso-card-arrow--light">
                                        <IconArrow color="#1B2E6B" />
                                    </span>
                                </div>
                                <h3 className="tso-card-title">Save Smarter with an HSA</h3>
                                <p className="tso-card-desc">Build your retirement with tax-advantaged savings and long-term growth.</p>
                            </div>

                            <div className="tso-card tso-card--light tso-card--with-image">
                                <div className="tso-card-top">
                                    <h3 className="tso-card-title">Save on Student Loan Interest</h3>
                                    <span className="tso-card-arrow tso-card-arrow--light">
                                        <IconArrow color="#1B2E6B" />
                                    </span>
                                </div>
                                <p className="tso-card-desc">Reduce your taxable income by claiming eligible student loan interest deductions.</p>
                                <div className="tso-card-image-wrap">
                                    <img src={studentLoanImage} alt="Save on student loan interest" className="tso-card-image" />
                                </div>
                            </div>
                        </div>

                        {/* Column 3 */}
                        <div className="tso-col">
                            <div className="tso-card tso-card--dark tso-card--with-image">
                                <div className="tso-card-top">
                                    <h3 className="tso-card-title tso-card-title--onDark">Claim Your Medical Expenses</h3>
                                    <span className="tso-card-arrow tso-card-arrow--dark">
                                        <IconArrow color="#1B2E6B" />
                                    </span>
                                </div>
                                <p className="tso-card-desc tso-card-desc--onDark">
                                    We'll help you identify deductible medical and dental expenses to maximize your tax benefits.
                                </p>
                                <div className="tso-card-image-wrap">
                                    <img src={medicalExpensesImage} alt="Claim your medical expenses" className="tso-card-image" />
                                </div>
                            </div>

                            <div className="tso-card tso-card--light">
                                <div className="tso-card-top">
                                    <span className="tso-card-icon tso-card-icon--light">
                                        <IconHouse />
                                    </span>
                                    <span className="tso-card-arrow tso-card-arrow--light">
                                        <IconArrow color="#1B2E6B" />
                                    </span>
                                </div>
                                <h3 className="tso-card-title">Claim Your Mortgage Deduction</h3>
                                <p className="tso-card-desc">Deduct eligible home mortgage interest and maximize your tax savings.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="fs-wrapper">
                <div className="fs-card">

                    <div className="fs-top">
                        {/* Left content */}
                        <div className="fs-content">
                            <div className="fs-badge">Max Refund. Zero Stress.</div>

                            <h2 className="fs-heading">
                                <span className="fs-heading-dark">File Smart.</span>

                                <span className="fs-heading-accent">Get More Back.</span>
                            </h2>

                            <p className="fs-description">
                                Accurate filling. Maximum refund.
                                <br />
                                100% hassle-free.
                            </p>
                        </div>

                        {/* Right visual */}
                        <div className="fs-visual">
                            <div className="fs-image-wrap">
                                <img src={personImage2} alt="Happy client giving a thumbs up" className="fs-image" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom feature bar */}
                    <div className="fs-features">
                        <div className="fs-feature">
                            <span className="fs-feature-icon fs-feature-icon--purple">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="8" stroke="#6C63C7" strokeWidth="1.6" fill="none" />
                                    <circle cx="12" cy="12" r="4.5" stroke="#6C63C7" strokeWidth="1.6" fill="none" />
                                    <circle cx="12" cy="12" r="1.2" fill="#6C63C7" />
                                </svg>
                            </span>
                            <div className="fs-feature-text">
                                <span className="fs-feature-title">Accurate Filling</span>
                                <span className="fs-feature-sub">Zero Error</span>
                            </div>
                        </div>

                        <div className="fs-feature-divider" />

                        <div className="fs-feature">
                            <span className="fs-feature-icon fs-feature-icon--teal">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="9" r="5" stroke="#1E9E8C" strokeWidth="1.6" fill="none" />
                                    <path d="M8.5 13.2L7 21l5-2.5 5 2.5-1.5-7.8" stroke="#1E9E8C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                            </span>
                            <div className="fs-feature-text">
                                <span className="fs-feature-title">Maximum Refund</span>
                                <span className="fs-feature-sub">Get What you Deserve</span>
                            </div>
                        </div>

                        <div className="fs-feature-divider" />

                        <div className="fs-feature">
                            <span className="fs-feature-icon fs-feature-icon--green">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="#3FA84A" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
                                </svg>
                            </span>
                            <div className="fs-feature-text">
                                <span className="fs-feature-title">Hassle-Free Process</span>
                                <span className="fs-feature-sub">Simple, Smooth &amp; Stress-free</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rs-wrapper">
                <div className="rs-header">
                    <div className="rs-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                            <rect x="14" y="3" width="7" height="7" rx="1.2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                            <rect x="3" y="14" width="7" height="7" rx="1.2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                            <rect x="14" y="14" width="7" height="7" rx="1.2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                        </svg>
                        <span>Step by step</span>
                    </div>
                    <h2 className="rs-heading">Your refund, in three steps</h2>
                </div>

                <div className="rs-steps">
                    {steps.map((step, index) => (
                        <div
                            className="rs-card"
                            key={step.id}
                            style={{
                                '--card-index': index + 1,
                                zIndex: index + 1,
                            }}
                        >
                            <div className="rs-card-content">
                                <span className="rs-step-label">{step.label}</span>
                                <h3 className="rs-step-title">{step.title}</h3>
                                <p className="rs-step-description">{step.description}</p>
                            </div>

                            <div className="rs-card-visual">
                                <div className="rs-visual-frame">
                                    <img src={step.image} alt={step.imageAlt} className="rs-visual-image" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </section>

            <section className="tm-wrapper">
                <div className="tm-inner">
                    <div className="tm-header">
                        <Link to="/testimonials" className="tm-badge">
                            Read reviews
                        </Link>

                        <h2 className="tm-heading">Quoted with clarity. Tax solutions,</h2>

                        <div className="tm-rating">
                            <span>4.8/5</span>
                            <StarIcon />
                            <span>Based on 123 reviews</span>
                        </div>
                    </div>

                    <div className="tm-body">
                        {/* Left static column */}
                        <div className="tm-side">
                            <svg className="tm-quote-icon" width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0 36V21.6C0 9.6 7.2 1.2 18 0v7.2c-5.4 1.2-8.4 4.8-8.4 9.6H18V36H0zM27.6 36V21.6c0-12 7.2-20.4 18-21.6v7.2c-5.4 1.2-8.4 4.8-8.4 9.6h8.4V36H27.6z"
                                    fill="rgba(255,255,255,0.25)"
                                />
                            </svg>

                            <h3 className="tm-side-heading">
                                What our
                                <br />
                                Clients
                                <br />
                                are saying
                            </h3>

                            <div className="tm-nav">
                                <button
                                    className="tm-nav-btn"
                                    type="button"
                                    onClick={() => slide(-1)}
                                    disabled={!canScrollPrev}
                                    aria-label="Previous testimonial"
                                >
                                    <ArrowLeft
                                        size="22"
                                        color="#ffffffff"
                                    />
                                </button>

                                <span className="tm-nav-line" />

                                <button
                                    className="tm-nav-btn"
                                    type="button"
                                    onClick={() => slide(1)}
                                    disabled={!canScrollNext}
                                    aria-label="Next testimonial"
                                >
                                    <ArrowRight
                                        size="22"
                                        color="#ffffffff"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Right sliding carousel */}
                        <div className="tm-carousel">
                            <div className="tm-track" ref={trackRef}>
                                {testimonials.map((t) => (
                                    <div className="tm-card" key={t.id}>
                                        {/* <p className="tm-card-text">{t.text}</p> */}
                                        <p className="tm-card-text">
                                            {(() => {
                                                const words = t.text.trim().split(/\s+/);
                                                return words.length > 41
                                                    ? words.slice(0, 41).join(' ') + '...'
                                                    : t.text;
                                            })()}
                                        </p>

                                        <div className="tm-card-stars">
                                            {Array.from({ length: t.rating }).map((_, i) => (
                                                <StarIcon key={i} />
                                            ))}
                                        </div>

                                        <div className="tm-card-author">
                                            {t.avatarType === "person" ? <PersonAvatar /> : <BrandAvatar />}
                                            <div className="tm-card-author-text">
                                                <span className="tm-card-name">{t.name}</span>
                                                <span className="tm-card-time">{t.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="faq-wrapper">
                <div className="faq-inner">
                    <div className="faq-top">
                        {/* Left content */}
                        <div className="faq-content">
                            <div className="faq-badge">FAQ</div>

                            <h2 className="faq-heading">Frequently Asked Questions</h2>

                            <p className="faq-description">
                                We help individuals and businesses to prepare accurate returns, stay compliant, and navigate tax season with confidence through reliable guidance and responsive support.
                            </p>

                            <Link to="/contact" className="faq-check-more">
                                Check More
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                            </Link>
                        </div>

                        {/* Right accordion */}
                        <div className="faq-accordion">
                            {faqs.map((faq) => {
                                const isOpen = openId === faq.id;
                                return (
                                    <div className={`faq-item ${isOpen ? "faq-item--open" : ""}`} key={faq.id}>
                                        <button
                                            className="faq-item-header"
                                            type="button"
                                            onClick={() => toggle(faq.id)}
                                            aria-expanded={isOpen}
                                        >
                                            <span className="faq-item-question">{faq.question}</span>
                                            <ChevronIcon open={isOpen} />
                                        </button>

                                        <div
                                            className="faq-item-body"
                                            style={{
                                                maxHeight: isOpen ? "240px" : "0px",
                                            }}
                                        >
                                            <p className="faq-item-answer">{faq.answer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom contact bar */}
                    <div className="faq-contact-bar">
                        <div className="faq-contact-left">
                            <span className="faq-contact-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4 13a8 8 0 0116 0v5a2 2 0 01-2 2h-1a1 1 0 01-1-1v-5a1 1 0 011-1h2M4 13v5a1 1 0 001 1h1a1 1 0 001-1v-5a1 1 0 00-1-1H4"
                                        stroke="#FFFFFF"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                </svg>
                            </span>
                            <span className="faq-contact-text">Need help with your Financial &amp; Tax services?</span>
                        </div>

                        <Link to="/contact" className="faq-contact-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z"
                                    fill="#1B2E6B"
                                />
                            </svg>
                            +1 (515) 686-4275
                        </Link>
                    </div>
                </div>
            </section>

            {/* Scroll to Top Button */}
            <button
                className={`scroll-to-top-btn ${showScrollTop ? "scroll-to-top-btn--visible" : ""}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
                title="Back to top"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V5M5 12l7-7 7 7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </>
    )
}

export default Home;
