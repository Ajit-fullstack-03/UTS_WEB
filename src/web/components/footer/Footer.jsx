import React from "react";
import "./Footer.css";
import logoImage from "../../../assets/image/umpire_tax_logo.png";
const Footer = () => {
    return (
        <footer className="ftr-wrapper">
            <div className="ftr-inner">
                <div className="ftr-top">
                    {/* Brand column */}
                    <div className="ftr-col ftr-brand">
                        <img src={logoImage} alt="Umpire Tax Solutions" className="ftr-logo" />

                        <p className="ftr-brand-desc">
                            Umpire Tax Solutions, is a Accounting and Taxation Company Providing various Financial Services in
                            International Taxation, Accounting, Incorporations and Payroll Services.
                        </p>

                        <div className="ftr-socials">
                            <a href="#" className="ftr-social-btn" aria-label="Facebook">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 8.5h2V5h-2c-2.2 0-4 1.8-4 4v2H9v3.5h2V21h3.5v-6.5H17l.5-3.5h-3V9c0-.6.4-1 1-1z" fill="#FFFFFF" />
                                </svg>
                            </a>

                            <a href="#" className="ftr-social-btn" aria-label="Twitter">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 00-7 3.7A11.6 11.6 0 013 4.9a4.1 4.1 0 001.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 01-1.9.1c.5 1.7 2.1 2.9 4 2.9A8.2 8.2 0 012 18.6a11.6 11.6 0 006.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z"
                                        fill="#FFFFFF"
                                    />
                                </svg>
                            </a>

                            <a href="#" className="ftr-social-btn" aria-label="Telegram">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 4L2.5 11.2c-.9.4-.9 1.6.1 1.9l4.6 1.5 1.8 5.6c.3.9 1.4 1.1 2 .4l2.6-2.9 4.7 3.5c.8.6 2 .2 2.2-.8L23 5.1c.2-1-.9-1.8-2-1.1z" fill="#FFFFFF" />
                                </svg>
                            </a>

                            <a href="#" className="ftr-social-btn" aria-label="Instagram">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
                                    <circle cx="12" cy="12" r="4" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
                                    <circle cx="17.2" cy="6.8" r="1" fill="#FFFFFF" />
                                </svg>
                            </a>

                            <a href="#" className="ftr-social-btn" aria-label="LinkedIn">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
                                    <path d="M7.5 10v6.5M7.5 7.5v.01M11.5 16.5V13c0-1.1.9-2 2-2s2 .9 2 2v3.5M11.5 10v6.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Services column */}
                    <div className="ftr-col">
                        <h3 className="ftr-col-title">Services</h3>
                        <ul className="ftr-link-list">
                            <li><a href="#">US Tax Services</a></li>
                            <li><a href="#">Individual Services</a></li>
                            <li><a href="#">Business Services</a></li>
                            <li><a href="#">Indian Tax Services</a></li>
                            <li><a href="#">Advisory on Taxation</a></li>
                        </ul>
                    </div>

                    {/* Quick Links column */}
                    <div className="ftr-col">
                        <h3 className="ftr-col-title">Quick Links</h3>
                        <ul className="ftr-link-list">
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">FAQs</a></li>
                            <li><a href="#">Teams</a></li>
                            <li><a href="#">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Contact Us column */}
                    <div className="ftr-col">
                        <h3 className="ftr-col-title">Contact Us</h3>
                        <ul className="ftr-contact-list">
                            <li>
                                <span className="ftr-contact-icon">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                                        <path d="M3 7l9 6 9-6" stroke="#1B2E6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </span>
                                <a href="mailto:support@figma.com">support@figma.com</a>
                            </li>

                            <li>
                                <span className="ftr-contact-icon">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z"
                                            fill="#1B2E6B"
                                        />
                                    </svg>
                                </span>
                                <a href="tel:+18008543680">+1 800 854-36-80</a>
                            </li>

                            <li>
                                <span className="ftr-contact-icon">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z"
                                            fill="#1B2E6B"
                                        />
                                    </svg>
                                </span>
                                <a href="tel:+18008543680">+1 800 854-36-80</a>
                            </li>

                            <li>
                                <span className="ftr-contact-icon">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                                        <circle cx="12" cy="9.5" r="2.3" stroke="#1B2E6B" strokeWidth="1.6" fill="none" />
                                    </svg>
                                </span>
                                <span className="ftr-contact-address">9500 Grove Crest Ln Charlotte NC 28262</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="ftr-divider" />
                <div className="ftr-bottom">
                    <p className="ftr-copyright">2026 Copyright, All rights reserved by Umpire Tax Solutions</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
