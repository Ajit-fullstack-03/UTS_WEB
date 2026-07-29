import React from "react";
import "./home.css";

import heroImage from "../../assets/image/page_track.png";
import personImage from "../../assets/image/trust.png";
import onePlatformImg1 from "../../assets/image/frame1.png";
import weFileImg1 from "../../assets/image/frame2.png";
import taxEstimateImg2 from "../../assets/image/frame3.png";

import medicalExpensesImage from "../../assets/image/m1.png";
import studentLoanImage from "../../assets/image/m2.png";
import iraImage from "../../assets/image/m3.png";


const services = [
    { id: 1, image: onePlatformImg1, label: "Free Tax Estimate" },
    { id: 2, image: onePlatformImg1, label: "One Platform. Every Tax Need." },
    { id: 3, image: weFileImg1, label: "We File. You Relax." },

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



const Home = () => {
    return (
        <>
            <section className="hero-wrapper">
                {/* Top contact bar */}
                <div className="hero-topbar">
                    <div className="hero-topbar-inner">
                        <div className="hero-topbar-item">
                            <span className="hero-topbar-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z" fill="currentColor" />
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
                            <button className="hero-btn hero-btn-primary">Get Started</button>
                            <button className="hero-btn hero-btn-secondary">
                                <span className="hero-btn-icon" role="img" aria-label="gift">🎁</span>
                                Refer &amp; Earn
                            </button>
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
                            <span className="hero-stat-value">1000+</span>
                            <span className="hero-stat-label">Happy clients</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">10K+</span>
                            <span className="hero-stat-label">Returns filed</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-value">10 yrs</span>
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
        </>
    )
}

export default Home; 