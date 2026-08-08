import React, { useState } from "react";
import { FiUser, FiUsers, FiPlus, FiTrash2, FiSave, FiCheckCircle, FiChevronUp, FiChevronDown } from "react-icons/fi";
import "./profile_details.css";

const ProfileDetails = () => {
    const [activeTab, setActiveTab] = useState("taxpayer");
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [sectionOpen, setSectionOpen] = useState(true);

    const [taxpayer, setTaxpayer] = useState({
        firstName: "Somya",
        lastName: "Sahoo",
        ssnItin: "XXX-XX-1234",
        occupation: "Software Engineer",
        dob: "1995-08-15",
        email: "somya.sahoo@example.com",
        mobileCode: "+91",
        mobilePhone: "(912)-458-3320",
        workPhone: "(912)-458-9988",
        referralName: "Rajesh Kumar"
    });

    const [spouse, setSpouse] = useState({
        firstName: "",
        lastName: "",
        ssnItin: "",
        occupation: "",
        dob: "",
        email: "",
        mobileCode: "+1",
        mobilePhone: ""
    });

    const [dependents, setDependents] = useState([
        { id: 1, name: "Aryan Sahoo", relationship: "Son", ssnItin: "XXX-XX-9876", dob: "2018-05-12" }
    ]);

    const handleTaxpayerChange = (e) => {
        const { name, value } = e.target;
        setTaxpayer(prev => ({ ...prev, [name]: value }));
    };

    const handleSpouseChange = (e) => {
        const { name, value } = e.target;
        setSpouse(prev => ({ ...prev, [name]: value }));
    };

    const handleDependentChange = (id, field, value) => {
        setDependents(prev =>
            prev.map(dep => dep.id === id ? { ...dep, [field]: value } : dep)
        );
    };

    const handleAddDependent = () => {
        const newId = dependents.length > 0 ? Math.max(...dependents.map(d => d.id)) + 1 : 1;
        setDependents(prev => [
            ...prev,
            { id: newId, name: "", relationship: "Son", ssnItin: "", dob: "" }
        ]);
    };

    const handleRemoveDependent = (id) => {
        setDependents(prev => prev.filter(dep => dep.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuccessToast(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setShowSuccessToast(false), 5000);
    };

    const countryCodes = ["+1", "+91", "+44", "+61", "+971"];

    return (
        <div className="profile-details-wrapper pb-5">

            {/* Page Title */}
            <div style={{ marginBottom: "24px" }}>
                <span className="profile-pre-heading">PROFILE SETUP</span>
                <h2 className="profile-page-title">Profile Details</h2>
            </div>

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="profile-success-toast">
                    <FiCheckCircle className="toast-icon" />
                    <div>
                        <strong>Profile Updated!</strong>
                        <span>Your tax profile details have been saved successfully.</span>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="profile-tab-bar">
                <button
                    type="button"
                    className={`profile-tab-btn ${activeTab === "taxpayer" ? "active" : ""}`}
                    onClick={() => setActiveTab("taxpayer")}
                >
                    Tax Payer Info
                </button>
                <button
                    type="button"
                    className={`profile-tab-btn ${activeTab === "spouse" ? "active" : ""}`}
                    onClick={() => setActiveTab("spouse")}
                >
                    Spouse Info
                </button>
                <button
                    type="button"
                    className={`profile-tab-btn ${activeTab === "dependents" ? "active" : ""}`}
                    onClick={() => setActiveTab("dependents")}
                >
                    Dependents (If any)
                </button>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit}>
                <div className="profile-form-card">

                    {/* Section Header */}
                    <div className="profile-section-header">
                        <span className="profile-section-title">
                            {activeTab === "taxpayer" && "Profile Details"}
                            {activeTab === "spouse" && "Spouse Information"}
                            {activeTab === "dependents" && "Dependents Information"}
                        </span>
                        <button
                            type="button"
                            className="profile-section-toggle"
                            onClick={() => setSectionOpen(o => !o)}
                            aria-label="Toggle section"
                        >
                            {sectionOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {/* Form Body */}
                    {sectionOpen && (
                        <div className="profile-form-body">

                            {/* â”€â”€ Taxpayer Tab â”€â”€ */}
                            {activeTab === "taxpayer" && (
                                <>
                                    <div className="profile-form-row">
                                        <div className="profile-field">
                                            <label className="profile-label">First Name <span className="req">*</span></label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={taxpayer.firstName}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                                placeholder="Enter First Name"
                                                required
                                            />
                                        </div>
                                        <div className="profile-field">
                                            <label className="profile-label">Last Name <span className="req">*</span></label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={taxpayer.lastName}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                                placeholder="Enter Last Name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-form-row">
                                        <div className="profile-field">
                                            <label className="profile-label">SSN/ITIN</label>
                                            <input
                                                type="text"
                                                name="ssnItin"
                                                value={taxpayer.ssnItin}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                                placeholder="Enter SSN/ITIN"
                                            />
                                        </div>
                                        <div className="profile-field">
                                            <label className="profile-label">Designation/Occupation:</label>
                                            <input
                                                type="text"
                                                name="occupation"
                                                value={taxpayer.occupation}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                                placeholder="Enter Designation/Occupation"
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-form-row">
                                        <div className="profile-field">
                                            <label className="profile-label">Date Of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={taxpayer.dob}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                            />
                                        </div>
                                        <div className="profile-field">
                                            <label className="profile-label">Email <span className="req">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={taxpayer.email}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                                placeholder="Example@gmail.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-form-row">
                                        <div className="profile-field">
                                            <label className="profile-label">Mobile Phone <span className="req">*</span></label>
                                            <div className="profile-phone-group">
                                                <select
                                                    name="mobileCode"
                                                    value={taxpayer.mobileCode}
                                                    onChange={handleTaxpayerChange}
                                                    className="profile-phone-prefix"
                                                >
                                                    {countryCodes.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    name="mobilePhone"
                                                    value={taxpayer.mobilePhone}
                                                    onChange={handleTaxpayerChange}
                                                    className="profile-input profile-phone-main"
                                                    placeholder="(912)-458-3320"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field">
                                            <label className="profile-label">Work Phone</label>
                                            <input
                                                type="text"
                                                name="workPhone"
                                                value={taxpayer.workPhone}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                                placeholder="Enter Work Phone"
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-form-row full-width">
                                        <div className="profile-field">
                                            <label className="profile-label">Referral Name (If Any)</label>
                                            <input
                                                type="text"
                                                name="referralName"
                                                value={taxpayer.referralName}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                                placeholder="Referral Name"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* â”€â”€ Spouse Tab â”€â”€ */}
                            {activeTab === "spouse" && (
                                <>
                                    <div className="profile-form-row">
                                        <div className="profile-field">
                                            <label className="profile-label">First Name</label>
                                            <input type="text" name="firstName" value={spouse.firstName} onChange={handleSpouseChange} className="profile-input" placeholder="Enter First Name" />
                                        </div>
                                        <div className="profile-field">
                                            <label className="profile-label">Last Name</label>
                                            <input type="text" name="lastName" value={spouse.lastName} onChange={handleSpouseChange} className="profile-input" placeholder="Enter Last Name" />
                                        </div>
                                    </div>
                                    <div className="profile-form-row">
                                        <div className="profile-field">
                                            <label className="profile-label">SSN/ITIN</label>
                                            <input type="text" name="ssnItin" value={spouse.ssnItin} onChange={handleSpouseChange} className="profile-input" placeholder="Enter SSN/ITIN" />
                                        </div>
                                        <div className="profile-field">
                                            <label className="profile-label">Designation/Occupation:</label>
                                            <input type="text" name="occupation" value={spouse.occupation} onChange={handleSpouseChange} className="profile-input" placeholder="Enter Designation/Occupation" />
                                        </div>
                                    </div>
                                    <div className="profile-form-row">
                                        <div className="profile-field">
                                            <label className="profile-label">Date Of Birth</label>
                                            <input type="date" name="dob" value={spouse.dob} onChange={handleSpouseChange} className="profile-input" />
                                        </div>
                                        <div className="profile-field">
                                            <label className="profile-label">Email</label>
                                            <input type="email" name="email" value={spouse.email} onChange={handleSpouseChange} className="profile-input" placeholder="Example@gmail.com" />
                                        </div>
                                    </div>
                                    <div className="profile-form-row full-width">
                                        <div className="profile-field">
                                            <label className="profile-label">Mobile Phone</label>
                                            <div className="profile-phone-group">
                                                <select name="mobileCode" value={spouse.mobileCode} onChange={handleSpouseChange} className="profile-phone-prefix">
                                                    {countryCodes.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <input type="text" name="mobilePhone" value={spouse.mobilePhone} onChange={handleSpouseChange} className="profile-input profile-phone-main" placeholder="Enter Mobile Phone" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* â”€â”€ Dependents Tab â”€â”€ */}
                            {activeTab === "dependents" && (
                                <>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                        <span style={{ fontWeight: 600, color: "#111827", fontSize: "0.95rem" }}>Dependents List</span>
                                        <button type="button" onClick={handleAddDependent} className="btn-add-dep">
                                            <FiPlus size={15} />
                                            <span>Add Dependent</span>
                                        </button>
                                    </div>

                                    {dependents.length === 0 ? (
                                        <div className="dep-empty-state">
                                            No dependents added yet. Click "Add Dependent" to add one.
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                            {dependents.map((dep, index) => (
                                                <div key={dep.id} className="dependent-card">
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                                        <span className="dep-badge">Dependent #{index + 1}</span>
                                                        <button type="button" className="btn-remove-dep" onClick={() => handleRemoveDependent(dep.id)}>
                                                            <FiTrash2 size={14} />
                                                            <span>Remove</span>
                                                        </button>
                                                    </div>
                                                    <div className="profile-form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                                                        <div className="profile-field">
                                                            <label className="profile-label">Name</label>
                                                            <input type="text" value={dep.name} onChange={(e) => handleDependentChange(dep.id, "name", e.target.value)} className="profile-input" placeholder="Enter Dependent Name" required />
                                                        </div>
                                                        <div className="profile-field">
                                                            <label className="profile-label">Relationship</label>
                                                            <select value={dep.relationship} onChange={(e) => handleDependentChange(dep.id, "relationship", e.target.value)} className="profile-input">
                                                                <option value="Son">Son</option>
                                                                <option value="Daughter">Daughter</option>
                                                                <option value="Parent">Parent</option>
                                                                <option value="Spouse">Spouse</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>
                                                        <div className="profile-field">
                                                            <label className="profile-label">SSN/ITIN</label>
                                                            <input type="text" value={dep.ssnItin} onChange={(e) => handleDependentChange(dep.id, "ssnItin", e.target.value)} className="profile-input" placeholder="Enter SSN/ITIN" />
                                                        </div>
                                                        <div className="profile-field">
                                                            <label className="profile-label">Date Of Birth</label>
                                                            <input type="date" value={dep.dob} onChange={(e) => handleDependentChange(dep.id, "dob", e.target.value)} className="profile-input" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="profile-action-bar">
                        <button type="submit" className="btn-save-profile">
                            <FiSave size={16} />
                            <span>Save Changes</span>
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default ProfileDetails;
