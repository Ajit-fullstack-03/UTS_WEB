import React, { useEffect, useState } from "react";
import "./testimonials.css";
import heroBg from "../../assets/image/BACKGROUD.jpeg";
import heroImage from "../../assets/image/track.png";
import { QuoteDown, People, DocumentText, ShieldTick } from "iconsax-reactjs";


const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5B400" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 17.6 5.8 20.9l1.6-6.8-5.2-4.6 6.9-.7L12 2.5z" />
    </svg>
);


const PersonAvatar = () => (
    <div className="tpg-avatar tpg-avatar--person">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="#FFFFFF" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#FFFFFF" />
        </svg>
    </div>
);

const BrandAvatar = () => (
    <div className="tpg-avatar tpg-avatar--brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="7" width="18" height="12" rx="1.5" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
            <path d="M3 10h18" stroke="#1B2E6B" strokeWidth="1.6" />
        </svg>
    </div>
);

const allTestimonials = [
    { id: 1, text: "My tax filing experience was so smooth and professional. The team responded in a timely manner with loads of information about deductions, allowances and maintenance guidance.", rating: 5, name: "Catherine", time: "10 days ago", avatarType: "brand" },
    { id: 2, text: "My buying experience is so nice, and received me very politely. Filing experience is also very good. Very good performance. I never experienced such a kind of performance. Very good service.", rating: 5, name: "Karan", time: "1 week ago", avatarType: "person" },
    { id: 3, text: "I have my e-bike and the customer service is excellent. They responded in a timely manner with loads of information about e-bikes, accessories and maintenance information.", rating: 4, name: "Catherine", time: "12 days ago", avatarType: "brand" },
    { id: 4, text: "My buying experience is so nice, and received me very politely. Riding experience is also very good. Very good performance. I never experienced such a kind of performance. Very good service.", rating: 5, name: "Karan", time: "1 month ago", avatarType: "person" },
    { id: 5, text: "The whole process was smooth from start to finish. The team explained every deduction clearly and made sure I understood exactly where my refund was coming from.", rating: 5, name: "Amira", time: "3 weeks ago", avatarType: "person" },
    { id: 6, text: "Excellent support throughout tax season. Quick responses, accurate filing, and a genuinely friendly team that made a stressful process feel simple.", rating: 5, name: "Liam", time: "1 month ago", avatarType: "person" },
    { id: 7, text: "Visited EO store. Product quality was particularly well, looked great, and the staff helped me test it in the parking lot area. Bought with customization after they went over all options.", rating: 5, name: "Peter", time: "2 weeks ago", avatarType: "brand" },
    { id: 8, text: "My filing experience is so nice and politely handled. Filing experience is also very good. Very good performance. Very good service overall - I am very satisfied.", rating: 4, name: "Catherine", time: "5 days ago", avatarType: "brand" },
    { id: 9, text: "I love my e-bike and the customer service is excellent. They respond in a timely manner with loads of information about e-bikes, accessories and maintenance information.", rating: 5, name: "Karan", time: "1 week ago", avatarType: "person" },
    { id: 10, text: "My buying experience is so nice, and received me very politely. Riding experience is also very good. Very good performance. Very good service.", rating: 5, name: "Catherine", time: "10 days ago", avatarType: "brand" },
    { id: 11, text: "Reliable tax expertise and personalized support to keep me compliant and financially confident. These guys truly know their craft.", rating: 5, name: "Marcus", time: "2 weeks ago", avatarType: "person" },
    { id: 12, text: "Outstanding service! Filed my taxes in no time and maximized every deduction. The team is incredibly knowledgeable and responsive.", rating: 5, name: "Priya", time: "3 days ago", avatarType: "brand" },
];

     const TestimonialCard = ({ t }) => (
     <div className="tpg-card">
        <p className="tpg-card-text">{t.text}</p>
        <div className="tpg-card-stars">
            {Array.from({ length: t.rating }).map((_, i) => (
                <StarIcon key={i} />
            ))}
        </div>
        <div className="tpg-card-author">
            {t.avatarType === "person" ? <PersonAvatar /> : <BrandAvatar />}
            <div className="tpg-card-author-text">
                <span className="tpg-card-name">{t.name}</span>
                <span className="tpg-card-time">{t.time}</span>
            </div>
        </div>
    </div>
);

const CARD_WIDTH = 328; // 310px card + 18px margin-right
const MIN_FILL_PX = 2600; // must be > widest viewport to avoid gap

const MarqueeRow = ({ items, direction = "left", speed = 40 }) => {
    const [paused, setPaused] = useState(false);

    // Repeat items until one "base" set is wider than any viewport
    const repeatCount = Math.ceil(MIN_FILL_PX / (items.length * CARD_WIDTH));
    const base = Array.from({ length: repeatCount }, () => items).flat();
    // Double the base so we can animate -50% seamlessly back to start
    const seamless = [...base, ...base];

    return (
            <div
            className="tpg-marquee-viewport"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}>
             <div
                className={`tpg-marquee-track tpg-marquee-track--${direction}`}
                style={{
                    animationDuration: `${speed}s`,
                    animationPlayState: paused ? "paused" : "running",
                }}>
                {seamless.map((t, idx) => (
                <TestimonialCard key={`${t.id}-${idx}`} t={t} />
                ))}
            </div>
        </div>
    );
      };

    const Testimonials = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const row1 = allTestimonials.slice(0, 4);
    const row2 = allTestimonials.slice(4, 8);
    const row3 = allTestimonials.slice(8, 12);
    return (
        <>
        <section className="tpg-hero-wrapper">
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
                <div className="tpg-hero-main">
                    <div className="tpg-hero-content">
                        <div className="tpg-hero-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l7 3v6c0 5-3.4 8.6-7 11-3.6-2.4-7-6-7-11V5l7-3z" stroke="#1B2E6B" strokeWidth="1.6" strokeLinejoin="round" fill="none" /><path d="M9 12l2 2 4-4" stroke="#1B2E6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            <span>Client Testimonials</span>
                        </div>
                        <h1 className="tpg-hero-heading">
                            <span className="tpg-hero-heading-accent">What Our Clients </span>
                            <span className="tpg-hero-heading-dark">Have To Say</span>
                        </h1>
                        <p className="tpg-hero-desc">Hear from clients who rely on our expertise to simplify taxes, maximize savings and stay compliant.</p>
                        <div className="tpg-hero-stats">
                            <div className="tpg-hero-stat">
                                <div className="tpg-hero-stat-icon-circle">
                                    <People size="20" color="#1B2E6B" variant="Outline" />
                                </div>
                                <div>
                                    <span className="tpg-hero-stat-value">500+</span>
                                    <span className="tpg-hero-stat-label">Happy Clients</span>
                                </div>
                            </div>
                            <div className="tpg-hero-stat-divider" />
                            <div className="tpg-hero-stat">
                                <div className="tpg-hero-stat-icon-circle">
                                    <DocumentText size="20" color="#1B2E6B" variant="Outline" />
                                </div>
                                <div>
                                    <span className="tpg-hero-stat-value">10,000+</span>
                                    <span className="tpg-hero-stat-label">Tax Returns Filed</span>
                                </div>
                            </div>
                            <div className="tpg-hero-stat-divider" />
                            <div className="tpg-hero-stat">
                                <div className="tpg-hero-stat-icon-circle">
                                    <ShieldTick size="20" color="#1B2E6B" variant="Outline" />
                                </div>
                                <div>
                                    <span className="tpg-hero-stat-value">100%</span>
                                    <span className="tpg-hero-stat-label">Confidential &amp; Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tpg-hero-visual">
                        <div className="tpg-hero-image-frame">
                            <div className="tpg-hero-circle-bg" />
                            <img src={heroImage} alt="Tax professionals reviewing client testimonials" className="tpg-hero-image" />
                            <div className="tpg-hero-trust-badge">
                                <div className="tpg-trust-badge-logo">
                                    <QuoteDown size="22" color="#ffffffff" variant="Outline" />
                                </div>
                                <div className="tpg-trust-badge-text">
                                    <span className="tpg-trust-badge-title">Trusted by individuals</span>
                                    <span className="tpg-trust-badge-sub">and businesses across the USA &amp; India.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="tpg-reviews-section">
                <MarqueeRow items={row1} direction="left" speed={38} />
                <MarqueeRow items={row3} direction="right" speed={40} />
            </section>

            <section className="tpg-helpbar-section">
                <div className="tpg-helpbar">
                    <div className="tpg-helpbar-left">
                        <span className="tpg-helpbar-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 13a8 8 0 0116 0v5a2 2 0 01-2 2h-1a1 1 0 01-1-1v-5a1 1 0 011-1h2M4 13v5a1 1 0 001 1h1a1 1 0 001-1v-5a1 1 0 00-1-1H4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        </span>
                        <span className="tpg-helpbar-text">Need help with your Financial &amp; Tax services?</span>
                    </div>
                    <a href="tel:+15156864275" className="tpg-helpbar-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="#1B2E6B" /></svg>
                        +1 (515) 686-4275
                    </a>
                </div>
            </section>

            <button className={`scroll-to-top-btn ${showScrollTop ? "scroll-to-top-btn--visible" : ""}`} onClick={scrollToTop} aria-label="Scroll to top" title="Back to top">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

        </>
    );
};

export default Testimonials;
