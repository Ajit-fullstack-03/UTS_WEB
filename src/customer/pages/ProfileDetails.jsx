import React, { useState, useEffect } from "react";
import { FiUser, FiUsers, FiPlus, FiTrash2, FiSave, FiCheckCircle, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { webservices } from "../servics/CustomerServices";
import "./profile_details.css";

const ProfileDetails = () => {
    const [activeTab, setActiveTab] = useState("taxpayer");
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [sectionOpen, setSectionOpen] = useState(true);
    const [isEditable, setIsEditable] = useState(false);

    const [taxpayer, setTaxpayer] = useState({
        firstName: "",
        lastName: "",
        ssnItin: "",
        occupation: "",
        dob: "",
        email: "",
        mobileCode: "",
        mobilePhone: "",
        workPhone: "",
        referralName: ""
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
        { id: 1, firstName: "", lastName: "", relationship: "", ssnItin: "", dob: "", visaType: "" }
    ]);

    // Date Format Helpers (M/D/Y <-> ISO YYYY-MM-DD)
    const formatToMDY = (dateStr) => {
        if (!dateStr) return "";
        const clean = String(dateStr).split("T")[0].trim();
        if (clean.includes("-")) {
            const parts = clean.split("-");
            if (parts.length === 3) {
                const [year, month, day] = parts;
                if (year.length === 4) {
                    return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
                }
            }
        }
        return clean;
    };

    const formatToAPIDate = (dateStr) => {
        if (!dateStr) return "";
        const clean = String(dateStr).trim();
        if (clean.includes("/")) {
            const parts = clean.split("/");
            if (parts.length === 3) {
                const [month, day, year] = parts;
                if (year.length === 4) {
                    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                }
            }
        }
        return clean;
    };

    const handleDateMaskInput = (value) => {
        const digits = value.replace(/\D/g, "").slice(0, 8);
        if (digits.length <= 2) {
            return digits;
        } else if (digits.length <= 4) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else {
            return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            const userInfoStr = localStorage.getItem("userInfo");
            if (!userInfoStr) return;

            // Auto-enable editing if current file status is <= 3 (setup stage)
            try {
                const storedStatus = localStorage.getItem("currentFileStatus");
                if (storedStatus) {
                    const parsed = JSON.parse(storedStatus);
                    const statusId = Number(parsed.presentfilestatus);
                    if (statusId <= 3) {
                        setIsEditable(true);
                    } else {
                        setIsEditable(false);
                    }
                } else {
                    // Default to editable if status isn't loaded yet to avoid lockouts
                    setIsEditable(true);
                }
            } catch (e) {
                console.error("Error checking file status:", e);
            }

            try {
                const userInfo = JSON.parse(userInfoStr);
                const client_id = userInfo.client_id;
                const user_id = userInfo.user_id;

                // 1. Fetch Taxpayer Info
                const resTaxpayer = await webservices.taxpayerinfo({ client_id, user_id });
                if (resTaxpayer.data && resTaxpayer.data.http_code === 200 && resTaxpayer.data.tinfo) {
                    const t = resTaxpayer.data.tinfo;
                    setTaxpayer({
                        firstName: t.first_name || "",
                        lastName: t.last_name || "",
                        ssnItin: t.ssnitin || t.itin || "",
                        occupation: t.occupation || "",
                        dob: formatToMDY(t.dob),
                        email: t.email || "",
                        mobileCode: t.phoneext || "+91",
                        mobilePhone: t.phone || "",
                        workPhone: t.alterphone || "",
                        referralName: t.referral_name || ""
                    });
                }

                // 2. Fetch Spouse Info
                const resSpouse = await webservices.spouseinfo({ client_id, user_id });
                if (resSpouse.data && resSpouse.data.http_code === 200) {
                    const s = resSpouse.data.tinfo || resSpouse.data.sinfo || resSpouse.data.spouseinfo;
                    if (s) {
                        setSpouse({
                            firstName: s.first_name || "",
                            lastName: s.last_name || "",
                            ssnItin: s.ssnitin || s.itin || "",
                            occupation: s.occupation || "",
                            dob: formatToMDY(s.dob),
                            email: s.email || "",
                            mobileCode: s.phoneext || "+1",
                            mobilePhone: s.phone || ""
                        });
                    }
                }

                // 3. Fetch Dependents Info
                const resDeps = await webservices.dependentinfo({ client_id, user_id });
                if (resDeps.data && resDeps.data.http_code === 200) {
                    const dList = resDeps.data.tinfo || resDeps.data.dinfo || resDeps.data.dependents;
                    if (Array.isArray(dList)) {
                        setDependents(dList.map((d, index) => ({
                            id: d.user_details_id || index + 1,
                            firstName: d.first_name || "",
                            lastName: d.last_name || "",
                            relationship: d.relation_ship || "Son",
                            ssnItin: d.ssnitin || d.itin || "",
                            dob: formatToMDY(d.dob),
                            visaType: d.visa_type || ""
                        })));
                    }
                }

            } catch (error) {
                console.error("Error fetching profile details:", error);
            }
        };

        fetchProfileData();
    }, []);

    const handleTaxpayerChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = name === "dob" ? handleDateMaskInput(value) : value;
        setTaxpayer(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSpouseChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = name === "dob" ? handleDateMaskInput(value) : value;
        setSpouse(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleDependentChange = (id, field, value) => {
        const formattedValue = field === "dob" ? handleDateMaskInput(value) : value;
        setDependents(prev =>
            prev.map(dep => dep.id === id ? { ...dep, [field]: formattedValue } : dep)
        );
    };

    const handleAddDependent = () => {
        const newId = dependents.length > 0 ? Math.max(...dependents.map(d => d.id)) + 1 : 1;
        setDependents(prev => [
            ...prev,
            { id: newId, firstName: "", lastName: "", relationship: "Son", ssnItin: "", dob: "", visaType: "" }
        ]);
    };

    const handleRemoveDependent = (id) => {
        setDependents(prev => prev.filter(dep => dep.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userInfoStr = localStorage.getItem("userInfo");
        if (!userInfoStr) return;

        try {
            const userInfo = JSON.parse(userInfoStr);
            const client_id = userInfo.client_id;
            const user_id = userInfo.user_id;

            let response;
            if (activeTab === "taxpayer") {
                const payload = {
                    client_id,
                    user_id,
                    first_name: taxpayer.firstName,
                    last_name: taxpayer.lastName,
                    ssnitin: taxpayer.ssnItin,
                    occupation: taxpayer.occupation,
                    dob: formatToAPIDate(taxpayer.dob),
                    email: taxpayer.email,
                    phoneext: taxpayer.mobileCode,
                    phone: taxpayer.mobilePhone,
                    alterphone: taxpayer.workPhone,
                    referral_name: taxpayer.referralName
                };
                response = await webservices.saveTaxpayerInfo(payload);
            } else if (activeTab === "spouse") {
                const payload = {
                    client_id,
                    user_id,
                    first_name: spouse.firstName,
                    last_name: spouse.lastName,
                    dob: formatToAPIDate(spouse.dob),
                    occupation: spouse.occupation,
                    ssn: spouse.ssnItin,
                    visa_type: spouse.visaType || ""
                };
                response = await webservices.saveSpouseInfo(payload);
            } else if (activeTab === "dependents") {
                const dependentsList = dependents.map(dep => ({
                    d_user_id: client_id,
                    first_name: dep.firstName,
                    last_name: dep.lastName,
                    dob: formatToAPIDate(dep.dob),
                    occupation: dep.occupation || "",
                    ssn: dep.ssnItin,
                    itin: dep.ssnItin,
                    visa_type: dep.visaType || "",
                    relation_ship: dep.relationship
                }));
                const payload = {
                    client_id,
                    user_id,
                    dependentinfo: dependentsList
                };
                response = await webservices.saveDependentsInfo(payload);
            }

            if (response && response.data && response.data.http_code === 200) {
                setIsEditable(false);
                setShowSuccessToast(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => setShowSuccessToast(false), 5000);
            } else {
                alert(response?.data?.status_smessage || "Failed to save details");
            }
        } catch (error) {
            console.error("Error saving profile details:", error);
            alert("An error occurred while saving profile details. Please try again.");
        }
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

            {/* Tab Navigation and Edit Action */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div className="profile-tab-bar" style={{ margin: 0, borderBottom: "none" }}>
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

                <button
                    type="button"
                    className={`btn-edit-toggle ${isEditable ? "editing" : ""}`}
                    onClick={() => setIsEditable(prev => !prev)}
                >
                    {isEditable ? "Cancel Edit" : "Edit Profile"}
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

                            {/* ─── Taxpayer Tab ─── */}
                            {activeTab === "taxpayer" && (
                                <fieldset disabled={!isEditable} style={{ border: "none", padding: 0, margin: 0, width: "100%" }}>
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
                                            <label className="profile-label">Date Of Birth (MM/DD/YYYY)</label>
                                            <input
                                                type="text"
                                                name="dob"
                                                value={taxpayer.dob}
                                                onChange={handleTaxpayerChange}
                                                className="profile-input"
                                                placeholder="MM/DD/YYYY"
                                                maxLength={10}
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
                                </fieldset>
                            )}

                            {/* ─── Spouse Tab ─── */}
                            {activeTab === "spouse" && (
                                <fieldset disabled={!isEditable} style={{ border: "none", padding: 0, margin: 0, width: "100%" }}>
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
                                            <label className="profile-label">Date Of Birth (MM/DD/YYYY)</label>
                                            <input type="text" name="dob" value={spouse.dob} onChange={handleSpouseChange} className="profile-input" placeholder="MM/DD/YYYY" maxLength={10} />
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
                                </fieldset>
                            )}

                            {/* ─── Dependents Tab ─── */}
                            {activeTab === "dependents" && (
                                <fieldset disabled={!isEditable} style={{ border: "none", padding: 0, margin: 0, width: "100%" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                        <span style={{ fontWeight: 600, color: "#111827", fontSize: "0.95rem" }}>Dependents List</span>
                                        {isEditable && (
                                            <button type="button" onClick={handleAddDependent} className="btn-add-dep">
                                                <FiPlus size={15} />
                                                <span>Add Dependent</span>
                                            </button>
                                        )}
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
                                                        {isEditable && (
                                                            <button type="button" className="btn-remove-dep" onClick={() => handleRemoveDependent(dep.id)}>
                                                                <FiTrash2 size={14} />
                                                                <span>Remove</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="profile-form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                                                        <div className="profile-field">
                                                            <label className="profile-label">First Name <span className="req">*</span></label>
                                                            <input type="text" value={dep.firstName || ""} onChange={(e) => handleDependentChange(dep.id, "firstName", e.target.value)} className="profile-input" placeholder="Enter First Name" required />
                                                        </div>
                                                        <div className="profile-field">
                                                            <label className="profile-label">Last Name <span className="req">*</span></label>
                                                            <input type="text" value={dep.lastName || ""} onChange={(e) => handleDependentChange(dep.id, "lastName", e.target.value)} className="profile-input" placeholder="Enter Last Name" required />
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
                                                    </div>
                                                    <div className="profile-form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginTop: "16px" }}>
                                                        <div className="profile-field">
                                                            <label className="profile-label">SSN/ITIN</label>
                                                            <input type="text" value={dep.ssnItin || ""} onChange={(e) => handleDependentChange(dep.id, "ssnItin", e.target.value)} className="profile-input" placeholder="Enter SSN/ITIN" />
                                                        </div>
                                                        <div className="profile-field">
                                                            <label className="profile-label">Date Of Birth (MM/DD/YYYY)</label>
                                                            <input type="text" value={dep.dob || ""} onChange={(e) => handleDependentChange(dep.id, "dob", e.target.value)} className="profile-input" placeholder="MM/DD/YYYY" maxLength={10} />
                                                        </div>
                                                        <div className="profile-field">
                                                            <label className="profile-label">Visa Type</label>
                                                            <input type="text" value={dep.visaType || ""} onChange={(e) => handleDependentChange(dep.id, "visaType", e.target.value)} className="profile-input" placeholder="Enter Visa Type" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </fieldset>
                            )}

                        </div>
                    )}

                    {/* Action Bar */}
                    {isEditable && (
                        <div className="profile-action-bar">
                            <button type="submit" className="btn-save-profile">
                                <FiSave size={16} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    )}

                </div>
            </form>
        </div>
    );
};

export default ProfileDetails;
