import React, { useState } from "react";
import { FiUser, FiUsers, FiPlus, FiTrash2, FiSave, FiCheckCircle } from "react-icons/fi";
import "./profile_details.css";

const ProfileDetails = () => {
    // Active Tab State
    const [activeTab, setActiveTab] = useState("taxpayer");

    // Success notification state
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Form States
    const [taxpayer, setTaxpayer] = useState({
        firstName: "Somya",
        lastName: "Sahoo",
        ssnItin: "XXX-XX-1234",
        occupation: "Software Engineer",
        dob: "1995-08-15",
        email: "somya.sahoo@example.com",
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
        mobilePhone: ""
    });

    const [dependents, setDependents] = useState([
        { id: 1, name: "Aryan Sahoo", relationship: "Son", ssnItin: "XXX-XX-9876", dob: "2018-05-12" }
    ]);

    // Handle Input Changes
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

    // Add / Remove Dependents
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

    // Submit Handler
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuccessToast(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            setShowSuccessToast(false);
        }, 5000);
    };

    return (
        <div className="profile-details-wrapper pb-5">
            {/* Title Block */}
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <span className="text-muted small fw-bold tracking-wider">PROFILE SETUP</span>
                    <h2 className="profile-page-title fw-bold text-navy mt-1">Profile Details</h2>
                </div>
            </div>

            {/* Success Banner */}
            {showSuccessToast && (
                <div className="alert alert-success d-flex align-items-center gap-3 p-3 rounded-4 shadow-sm border-0 mb-4 fade show" role="alert">
                    <FiCheckCircle className="text-success fs-4 flex-shrink-0" />
                    <div>
                        <strong className="d-block text-success">Profile Updated!</strong>
                        <span className="small text-muted">Your tax profile details have been saved successfully.</span>
                    </div>
                </div>
            )}

            {/* Main Tabs Selection Card */}
            <div className="card border-0 rounded-4 shadow-sm mb-4">
                <div className="card-body p-2 d-flex gap-2 flex-wrap bg-light-gray rounded-4">
                    <button
                        type="button"
                        className={`btn tab-btn flex-grow-1 py-2.5 px-4 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold ${
                            activeTab === "taxpayer" ? "active-tab shadow-sm" : "text-muted"
                        }`}
                        onClick={() => setActiveTab("taxpayer")}
                    >
                        <FiUser size={18} />
                        <span>Tax Payer Info</span>
                    </button>
                    <button
                        type="button"
                        className={`btn tab-btn flex-grow-1 py-2.5 px-4 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold ${
                            activeTab === "spouse" ? "active-tab shadow-sm" : "text-muted"
                        }`}
                        onClick={() => setActiveTab("spouse")}
                    >
                        <FiUsers size={18} />
                        <span>Spouse Info</span>
                    </button>
                    <button
                        type="button"
                        className={`btn tab-btn flex-grow-1 py-2.5 px-4 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold ${
                            activeTab === "dependents" ? "active-tab shadow-sm" : "text-muted"
                        }`}
                        onClick={() => setActiveTab("dependents")}
                    >
                        <FiUsers size={18} />
                        <span>Dependents (If any)</span>
                    </button>
                </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit}>
                <div className="card border-0 rounded-4 shadow-sm p-4 bg-white">
                    {/* Taxpayer Information Form */}
                    {activeTab === "taxpayer" && (
                        <div className="form-section">
                            <h4 className="section-title fw-bold text-navy mb-4">Tax Payer Information</h4>
                            
                            <div className="row g-4">
                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">First Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={taxpayer.firstName}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter First Name"
                                        required
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Last Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={taxpayer.lastName}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter Last Name"
                                        required
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">SSN/ITIN</label>
                                    <input
                                        type="text"
                                        name="ssnItin"
                                        value={taxpayer.ssnItin}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter SSN/ITIN"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Designation/Occupation</label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={taxpayer.occupation}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter Designation/Occupation"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Date Of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={taxpayer.dob}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Email <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={taxpayer.email}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Example@gmail.com"
                                        required
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Mobile Phone <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="mobilePhone"
                                        value={taxpayer.mobilePhone}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter Mobile Phone"
                                        required
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Work Phone</label>
                                    <input
                                        type="text"
                                        name="workPhone"
                                        value={taxpayer.workPhone}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter Work Phone"
                                    />
                                </div>

                                <div className="col-md-12 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Referral Name (If Any)</label>
                                    <input
                                        type="text"
                                        name="referralName"
                                        value={taxpayer.referralName}
                                        onChange={handleTaxpayerChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Referral Name"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Spouse Information Form */}
                    {activeTab === "spouse" && (
                        <div className="form-section">
                            <h4 className="section-title fw-bold text-navy mb-4">Spouse Information</h4>
                            
                            <div className="row g-4">
                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={spouse.firstName}
                                        onChange={handleSpouseChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter First Name"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={spouse.lastName}
                                        onChange={handleSpouseChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter Last Name"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">SSN/ITIN</label>
                                    <input
                                        type="text"
                                        name="ssnItin"
                                        value={spouse.ssnItin}
                                        onChange={handleSpouseChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter SSN/ITIN"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Designation/Occupation</label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={spouse.occupation}
                                        onChange={handleSpouseChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter Designation/Occupation"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Date Of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={spouse.dob}
                                        onChange={handleSpouseChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={spouse.email}
                                        onChange={handleSpouseChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Example@gmail.com"
                                    />
                                </div>

                                <div className="col-md-6 text-start">
                                    <label className="form-input-label text-navy fw-semibold mb-2">Mobile Phone</label>
                                    <input
                                        type="text"
                                        name="mobilePhone"
                                        value={spouse.mobilePhone}
                                        onChange={handleSpouseChange}
                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                        placeholder="Enter Mobile Phone"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dependents Information Form */}
                    {activeTab === "dependents" && (
                        <div className="form-section">
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                                <h4 className="section-title fw-bold text-navy mb-0">Dependents Information</h4>
                                <button
                                    type="button"
                                    onClick={handleAddDependent}
                                    className="btn btn-add-dep d-flex align-items-center gap-2 fw-semibold px-3 py-2 rounded-3"
                                >
                                    <FiPlus />
                                    <span>Add Dependent</span>
                                </button>
                            </div>

                            {dependents.length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                    <p className="text-muted mb-0">No dependents added yet. Click "Add Dependent" to add one.</p>
                                </div>
                            ) : (
                                <div className="dependents-list d-flex flex-column gap-4">
                                    {dependents.map((dep, index) => (
                                        <div key={dep.id} className="dependent-card p-4 rounded-4 border border-light position-relative bg-light-gray-subtle text-start">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="badge bg-navy text-white rounded-pill px-3 py-1.5 fw-semibold">
                                                    Dependent #{index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-danger p-0 border-0 d-flex align-items-center gap-1.5 text-decoration-none hover-trash"
                                                    onClick={() => handleRemoveDependent(dep.id)}
                                                >
                                                    <FiTrash2 size={16} />
                                                    <span className="small fw-semibold">Remove</span>
                                                </button>
                                            </div>

                                            <div className="row g-4">
                                                <div className="col-md-4">
                                                    <label className="form-input-label text-navy fw-semibold mb-2">Name</label>
                                                    <input
                                                        type="text"
                                                        value={dep.name}
                                                        onChange={(e) => handleDependentChange(dep.id, "name", e.target.value)}
                                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                                        placeholder="Enter Dependent Name"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-input-label text-navy fw-semibold mb-2">Relationship</label>
                                                    <select
                                                        value={dep.relationship}
                                                        onChange={(e) => handleDependentChange(dep.id, "relationship", e.target.value)}
                                                        className="form-input form-select w-100 px-3 py-2.5 rounded-3"
                                                    >
                                                        <option value="Son">Son</option>
                                                        <option value="Daughter">Daughter</option>
                                                        <option value="Parent">Parent</option>
                                                        <option value="Spouse">Spouse</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-input-label text-navy fw-semibold mb-2">SSN/ITIN</label>
                                                    <input
                                                        type="text"
                                                        value={dep.ssnItin}
                                                        onChange={(e) => handleDependentChange(dep.id, "ssnItin", e.target.value)}
                                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                                        placeholder="Enter SSN/ITIN"
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-input-label text-navy fw-semibold mb-2">Date Of Birth</label>
                                                    <input
                                                        type="date"
                                                        value={dep.dob}
                                                        onChange={(e) => handleDependentChange(dep.id, "dob", e.target.value)}
                                                        className="form-input w-100 px-3 py-2.5 rounded-3"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Action Section */}
                    <div className="mt-5 border-top pt-4 d-flex justify-content-end gap-3 flex-wrap">
                        <button
                            type="submit"
                            className="btn btn-save-profile d-flex align-items-center gap-2 fw-semibold px-4 py-2.5 rounded-3 text-white"
                        >
                            <FiSave size={18} />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfileDetails;
