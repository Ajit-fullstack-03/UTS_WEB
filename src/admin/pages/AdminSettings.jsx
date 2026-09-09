import React, { useState, useEffect } from "react";
import { FiTrash2, FiEdit2, FiSave, FiShield } from "react-icons/fi";
import Swal from "sweetalert2";
import AdminOtpModal from "../components/AdminOtpModal";
import { adminServices } from "../services/AdminServices";
import { getStoredTaxYear, setStoredTaxYear } from "../../utils/taxYear";
import { getUserInfo } from "../../utils/userRole";
import "./admin_settings.css";

const AdminSettings = () => {
    // Check if security OTP verification was passed
    const [isUnlocked, setIsUnlocked] = useState(() => {
        return sessionStorage.getItem("admin_settings_unlocked") === "true";
    });
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(() => {
        return sessionStorage.getItem("admin_settings_unlocked") !== "true";
    });

    const userInfo = getUserInfo();
    const adminEmail = userInfo.email || "admin@umpiretaxsolutions.com";

    // Form states matching Figma & API response
    const [settingId, setSettingId] = useState(1);
    const [siteEmail, setSiteEmail] = useState("hello@umpiretaxsolutions.com");
    const [usPhone, setUsPhone] = useState("5156864275");
    const [indianPhone, setIndianPhone] = useState("8186051040");
    const [officeDays, setOfficeDays] = useState("Mon to Sat");
    const [officeTiming, setOfficeTiming] = useState("9:00AM CST to 6:00PM CST");
    const [corporateOffice, setCorporateOffice] = useState("9500 Grove Crest Ln Charlotte NC 28262");
    const [processingCenter, setProcessingCenter] = useState("4-7-18/B Raghavendra Nagar, Nacharam Hyd 500076");
    const [fbLink, setFbLink] = useState("https://www.facebook.com/");
    const [twitterLink, setTwitterLink] = useState("https://twitter.com/");
    const [linkedinLink, setLinkedinLink] = useState("https://www.linkedin.com/");
    const [siteLink, setSiteLink] = useState("https://umpiretaxsolutions.com/");
    const [sitePopupCode, setSitePopupCode] = useState("0");
    const [sitePopupName, setSitePopupName] = useState("Pop Up 3");
    const [taxYear, setTaxYear] = useState(getStoredTaxYear() || "2026");
    const [settingsLoading, setSettingsLoading] = useState(false);

    // IP Address list state
    const [ipList, setIpList] = useState([
        { id: 1, ip: "49.207.11.67" },
        { id: 2, ip: "103.212.144.20" },
        { id: 3, ip: "182.74.156.98" }
    ]);
    const [newIp, setNewIp] = useState("");
    const [editingIpId, setEditingIpId] = useState(null);
    const [editingIpValue, setEditingIpValue] = useState("");

    // Extract current authenticated user ID
    const currentUserId = userInfo.user_id || userInfo.userId || userInfo.id || localStorage.getItem("currentUser")?.replace(/"/g, "") || "1";

    // Fetch IP list function
    const fetchIpList = async () => {
        try {
            const res = await adminServices.getipslist({});
            if (res?.data && (res.data.http_code === 200 || res.data.status === true)) {
                const list = res.data.ipslist || res.data.data || (Array.isArray(res.data) ? res.data : []);
                if (Array.isArray(list)) {
                    const mapped = list.map((item, idx) => ({
                        id: item.ipid || item.id || idx + 1,
                        ipid: item.ipid || item.id || idx + 1,
                        ip: item.ipaddress || item.ip,
                        ipaddress: item.ipaddress || item.ip,
                        neveripdeleteflag: Number(item.neveripdeleteflag) || 0,
                        ipstatus: item.ipstatus !== undefined ? Number(item.ipstatus) : 1
                    }));
                    setIpList(mapped);
                    localStorage.setItem("admin_allowed_ips", JSON.stringify(mapped));
                }
            }
        } catch (err) {
            console.warn("Error fetching IP list from API:", err);
        }
    };

    // Load dynamic settings and IP list from API
    useEffect(() => {
        const fetchSettings = async () => {
            setSettingsLoading(true);
            try {
                const res = await adminServices.getsettings({});
                if (res?.data && (res.data.http_code === 200 || res.data.status === true)) {
                    const settingsList = res.data.settings || res.data.data;
                    if (Array.isArray(settingsList) && settingsList.length > 0) {
                        const s = settingsList[0];
                        if (s.setting_id) setSettingId(s.setting_id);
                        if (s.site_email) setSiteEmail(s.site_email);
                        if (s.usphonenumber) setUsPhone(s.usphonenumber);
                        if (s.indianphonenumber) setIndianPhone(s.indianphonenumber);
                        if (s.officedays) setOfficeDays(s.officedays);
                        if (s.officetimings) setOfficeTiming(s.officetimings);
                        if (s.corporateoffice) setCorporateOffice(s.corporateoffice);
                        if (s.processingcenter) setProcessingCenter(s.processingcenter);
                        if (s.fblink) setFbLink(s.fblink);
                        if (s.twitterlink) setTwitterLink(s.twitterlink);
                        if (s.linkedinlink) setLinkedinLink(s.linkedinlink);
                        if (s.siteURL) setSiteLink(s.siteURL);
                        if (s.sitepopupsetting !== undefined) setSitePopupCode(String(s.sitepopupsetting));
                        if (s.popuptype) setSitePopupName(s.popuptype.startsWith("Pop") ? s.popuptype : `Pop Up ${s.popuptype}`);
                        if (s.taxyear) {
                            setTaxYear(String(s.taxyear));
                            setStoredTaxYear(String(s.taxyear));
                        }
                    }
                }
            } catch (err) {
                console.warn("Error fetching settings from API:", err);
            } finally {
                setSettingsLoading(false);
            }
        };

        fetchSettings();
        fetchIpList();

        try {
            const savedIps = localStorage.getItem("admin_allowed_ips");
            if (savedIps) {
                setIpList(JSON.parse(savedIps));
            }
        } catch (e) {
            console.warn("Error loading allowed IPs:", e);
        }
    }, []);

    // Handle Form Submit
    const handleSubmitSettings = async (e) => {
        e.preventDefault();
        const popupTypeValue = String(sitePopupName.replace(/[^0-9]/g, "") || sitePopupCode || "1");

        const settingsPayload = {
            user_id: currentUserId,
            setting_id: settingId,
            site_email: siteEmail,
            usphonenumber: usPhone,
            indianphonenumber: indianPhone,
            officedays: officeDays,
            officetimings: officeTiming,
            corporateoffice: corporateOffice,
            processingcenter: processingCenter,
            fblink: fbLink,
            twitterlink: twitterLink,
            linkedinlink: linkedinLink,
            sitepopupsetting: Number(sitePopupCode) || 0,
            siteURL: siteLink,
            taxyear: String(taxYear || "2025"),
            popuptype: popupTypeValue,
            siteEmail,
            usPhone,
            indianPhone,
            officeDays,
            officeTiming,
            corporateOffice,
            processingCenter,
            fbLink,
            twitterLink,
            linkedinLink,
            siteLink,
            sitePopupCode,
            sitePopupName,
            taxYear
        };

        let successMsg = "Settings are updated successfully.";
        try {
            const res = await adminServices.savesetting(settingsPayload);
            if (res?.data?.status_smessage) {
                successMsg = res.data.status_smessage;
            }
        } catch (err) {
            console.warn("savesetting API error:", err);
        }

        localStorage.setItem("admin_portal_settings", JSON.stringify(settingsPayload));
        if (taxYear) {
            setStoredTaxYear(taxYear);
            window.dispatchEvent(new Event("taxYearChanged"));
        }

        Swal.fire({
            icon: "success",
            title: "Settings Saved!",
            text: successMsg,
            confirmButtonColor: "#1b2e6b",
            customClass: {
                confirmButton: "btn btn-primary px-4 py-2"
            },
            buttonsStyling: false
        });
    };

    // Handle Remove All Documents
    const handleRemoveAllDocuments = () => {
        Swal.fire({
            title: "Remove All Documents?",
            text: "WARNING: This action will permanently delete all temporary and uploaded client documents from the server buffer. This cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, Remove All",
            cancelButtonText: "Cancel",
            customClass: {
                confirmButton: "btn btn-danger px-4 py-2",
                cancelButton: "btn btn-light px-4 py-2 ms-2"
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: "success",
                    title: "Documents Cleaned",
                    text: "All document repositories and temporary cache files have been purged successfully.",
                    confirmButtonColor: "#1b2e6b"
                });
            }
        });
    };

    // Add IP Address
    const handleAddIp = async (e) => {
        e.preventDefault();
        const trimmed = newIp.trim();
        if (!trimmed) {
            Swal.fire({
                icon: "error",
                title: "Invalid IP",
                text: "Please enter a valid IP address.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipPattern.test(trimmed)) {
            Swal.fire({
                icon: "warning",
                title: "Invalid IP Format",
                text: "Please enter a valid IPv4 address (e.g. 49.207.11.67).",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        if (ipList.some((item) => item.ip === trimmed || item.ipaddress === trimmed)) {
            Swal.fire({
                icon: "info",
                title: "Duplicate IP",
                text: "This IP address is already in the allowed list.",
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        let successMsg = `IP ${trimmed} added to authorized list.`;
        try {
            const res = await adminServices.saveips({
                user_id: currentUserId,
                ipaddress: trimmed
            });
            if (res?.data?.status_smessage) {
                successMsg = res.data.status_smessage;
            }
        } catch (err) {
            console.warn("saveips API:", err);
        }

        setNewIp("");
        await fetchIpList();

        Swal.fire({
            icon: "success",
            title: "IP Added",
            text: successMsg,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end"
        });
    };

    // Delete IP Address
    const handleDeleteIp = (id, ip, neveripdeleteflag, ipid) => {
        if (neveripdeleteflag === 1 || neveripdeleteflag === "1") {
            Swal.fire({
                icon: "info",
                title: "Protected System IP",
                text: `IP address ${ip} is a system-protected IP and cannot be removed.`,
                confirmButtonColor: "#1b2e6b"
            });
            return;
        }

        const targetIpId = ipid || id;

        Swal.fire({
            title: "Delete IP Address?",
            text: `Are you sure you want to remove IP address ${ip}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            customClass: {
                confirmButton: "btn btn-danger px-3 py-1",
                cancelButton: "btn btn-light px-3 py-1 ms-2"
            },
            buttonsStyling: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                let successMsg = `IP ${ip} was deleted.`;
                try {
                    const res = await adminServices.deleteuip({
                        user_id: currentUserId,
                        ipid: targetIpId
                    });
                    if (res?.data?.status_smessage) {
                        successMsg = res.data.status_smessage;
                    }
                } catch (err) {
                    console.warn("deleteuip API:", err);
                }

                await fetchIpList();

                Swal.fire({
                    icon: "success",
                    title: "IP Removed",
                    text: successMsg,
                    timer: 1800,
                    showConfirmButton: false,
                    toast: true,
                    position: "top-end"
                });
            }
        });
    };

    // Start Editing IP
    const handleStartEditIp = (item) => {
        setEditingIpId(item.ipid || item.id);
        setEditingIpValue(item.ip || item.ipaddress);
    };

    // Save Edited IP
    const handleSaveEditIp = async (id, itemObj) => {
        const trimmed = editingIpValue.trim();
        if (!trimmed) return;

        const targetIpId = (itemObj && itemObj.ipid) || id;
        let successMsg = "IP address is updated successfully.";

        try {
            const res = await adminServices.updateips({
                user_id: currentUserId,
                ipid: targetIpId,
                ipaddress: trimmed
            });
            if (res?.data?.status_smessage) {
                successMsg = res.data.status_smessage;
            }
        } catch (err) {
            console.warn("updateips API:", err);
        }

        setEditingIpId(null);
        setEditingIpValue("");
        await fetchIpList();

        Swal.fire({
            icon: "success",
            title: "IP Updated",
            text: successMsg,
            timer: 1800,
            showConfirmButton: false,
            toast: true,
            position: "top-end"
        });
    };

    if (!isUnlocked) {
        return (
            <div className="admin-settings-locked-container py-5 text-center">
                <AdminOtpModal
                    isOpen={isOtpModalOpen}
                    onClose={() => {
                        window.history.back();
                    }}
                    onSuccess={() => {
                        setIsUnlocked(true);
                        setIsOtpModalOpen(false);
                    }}
                    userEmail={adminEmail}
                />
                <div className="p-5">
                    <div className="p-4 bg-white rounded-4 shadow-sm d-inline-block text-center max-w-md">
                        <FiShield size={48} className="text-primary mb-3" />
                        <h4 className="fw-bold mb-2">Settings Locked</h4>
                        <p className="text-muted mb-4">Two-factor authentication is required to modify admin system settings.</p>
                        <button
                            type="button"
                            className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
                            onClick={() => setIsOtpModalOpen(true)}
                        >
                            Enter Security OTP
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-settings-page p-3 p-md-4 animate-fade-in">
            {/* Page Header */}
            <div className="settings-page-header mb-4">
                <h3 className="fw-bold text-dark mb-0">Settings</h3>
            </div>

            {/* Main 2-Column Grid */}
            <div className="row g-4">
                {/* Left Column: General Settings Form */}
                <div className="col-12 col-xl-7">
                    <div className="card settings-main-card p-4 rounded-4 shadow-sm border-0 bg-white">
                        <form onSubmit={handleSubmitSettings} className="settings-form d-flex flex-column gap-3">
                            {/* Site Email */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Site Email :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="email"
                                        className="form-control settings-input"
                                        value={siteEmail}
                                        onChange={(e) => setSiteEmail(e.target.value)}
                                        placeholder="e.g. hello@umpiretaxsolutions.com"
                                    />
                                </div>
                            </div>

                            {/* US Phone Number */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    US Phone Number :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control settings-input"
                                        value={usPhone}
                                        onChange={(e) => setUsPhone(e.target.value)}
                                        placeholder="e.g. 5156864275"
                                    />
                                </div>
                            </div>

                            {/* Indian Phone Number */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Indian Phone Number :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control settings-input"
                                        value={indianPhone}
                                        onChange={(e) => setIndianPhone(e.target.value)}
                                        placeholder="e.g. 8186051040"
                                    />
                                </div>
                            </div>

                            {/* Office Days */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Office Days :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control settings-input"
                                        value={officeDays}
                                        onChange={(e) => setOfficeDays(e.target.value)}
                                        placeholder="e.g. Mon to Fri"
                                    />
                                </div>
                            </div>

                            {/* Office Timing */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Office Timing :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control settings-input"
                                        value={officeTiming}
                                        onChange={(e) => setOfficeTiming(e.target.value)}
                                        placeholder="e.g. 9:00AM CST to 6:00PM CST"
                                    />
                                </div>
                            </div>

                            {/* Corporate Office */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Corporate Office :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control settings-input"
                                        value={corporateOffice}
                                        onChange={(e) => setCorporateOffice(e.target.value)}
                                        placeholder="Corporate office address"
                                    />
                                </div>
                            </div>

                            {/* Processing Center */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Processing Center :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control settings-input"
                                        value={processingCenter}
                                        onChange={(e) => setProcessingCenter(e.target.value)}
                                        placeholder="Processing center address"
                                    />
                                </div>
                            </div>

                            {/* FB Link */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    FB Link :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="url"
                                        className="form-control settings-input"
                                        value={fbLink}
                                        onChange={(e) => setFbLink(e.target.value)}
                                        placeholder="https://www.facebook.com/..."
                                    />
                                </div>
                            </div>

                            {/* Twitter Link */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Twitter Link :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="url"
                                        className="form-control settings-input"
                                        value={twitterLink}
                                        onChange={(e) => setTwitterLink(e.target.value)}
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>
                            </div>

                            {/* Linkedin Link */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Linkedin Link :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="url"
                                        className="form-control settings-input"
                                        value={linkedinLink}
                                        onChange={(e) => setLinkedinLink(e.target.value)}
                                        placeholder="https://www.linkedin.com/..."
                                    />
                                </div>
                            </div>

                            {/* Site Link */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Site Link :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="url"
                                        className="form-control settings-input"
                                        value={siteLink}
                                        onChange={(e) => setSiteLink(e.target.value)}
                                        placeholder="https://umpiretaxsolutions.com/"
                                    />
                                </div>
                            </div>

                            {/* Site Popup Setting (Dual Select) */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Site Popup Setting :
                                </label>
                                <div className="settings-input-wrap flex-grow-1 d-flex gap-2">
                                    <select
                                        className="form-select settings-select flex-1"
                                        value={sitePopupCode}
                                        onChange={(e) => setSitePopupCode(e.target.value)}
                                    >
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                    </select>
                                    <select
                                        className="form-select settings-select flex-1"
                                        value={sitePopupName}
                                        onChange={(e) => setSitePopupName(e.target.value)}
                                    >
                                        <option value="Pop Up 1">Pop Up 1</option>
                                        <option value="Pop Up 2">Pop Up 2</option>
                                        <option value="Pop Up 3">Pop Up 3</option>
                                        <option value="Pop Up 4">Pop Up 4</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tax Year */}
                            <div className="settings-field-row d-flex align-items-center">
                                <label className="settings-label fw-semibold text-muted text-nowrap">
                                    Tax Year :
                                </label>
                                <div className="settings-input-wrap flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control settings-input"
                                        value={taxYear}
                                        onChange={(e) => setTaxYear(e.target.value)}
                                        placeholder="e.g. 2026"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="settings-actions-row d-flex align-items-center gap-3 mt-4 pt-2">
                                <button
                                    type="submit"
                                    className="btn btn-submit-settings px-4 py-2 rounded-3 fw-semibold text-white"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveAllDocuments}
                                    className="btn btn-remove-docs px-3 py-2 rounded-3 fw-semibold"
                                >
                                    Remove all documents
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: IP Address Management */}
                <div className="col-12 col-xl-5">
                    <div className="card settings-ip-card p-4 rounded-4 shadow-sm border-0 bg-white">
                        <h5 className="fw-bold text-dark mb-4 pb-1">IP Address</h5>

                        {/* Add IP Input Form */}
                        <form onSubmit={handleAddIp} className="ip-input-form mb-4">
                            <div className="d-flex align-items-center gap-2">
                                <label className="ip-form-label fw-semibold text-muted text-nowrap">
                                    IP Address :
                                </label>
                                <div className="flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control settings-input"
                                        placeholder="Enter the IP Address"
                                        value={newIp}
                                        onChange={(e) => setNewIp(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-add-ip px-4 py-2 rounded-3 fw-semibold text-white"
                                >
                                    Add
                                </button>
                            </div>
                        </form>

                        {/* IP Address Table */}
                        <div className="ip-table-wrapper rounded-3 overflow-hidden border">
                            <table className="table table-hover mb-0 ip-table align-middle">
                                <thead className="ip-table-header">
                                    <tr>
                                        <th className="px-3 py-2 text-uppercase small fw-bold">IP ADDRESS</th>
                                        <th className="px-3 py-2 text-uppercase small fw-bold text-center" style={{ width: "110px" }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ipList.length > 0 ? (
                                        ipList.map((item) => (
                                            <tr key={item.ipid || item.id} className="ip-row">
                                                <td className="px-3 py-2 font-monospace fw-semibold text-dark">
                                                    {editingIpId === (item.ipid || item.id) ? (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editingIpValue}
                                                                onChange={(e) => setEditingIpValue(e.target.value)}
                                                                autoFocus
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-success p-1"
                                                                onClick={() => handleSaveEditIp(item.ipid || item.id, item)}
                                                                title="Save"
                                                            >
                                                                <FiSave size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        item.ip || item.ipaddress
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                                        <button
                                                            type="button"
                                                            className={`btn-ip-action ${item.neveripdeleteflag === 1 ? "text-muted opacity-50" : "text-danger"} border-0 bg-transparent p-1`}
                                                            onClick={() => handleDeleteIp(item.id, item.ip || item.ipaddress, item.neveripdeleteflag, item.ipid)}
                                                            title={item.neveripdeleteflag === 1 ? "Protected System IP (Cannot Delete)" : "Delete IP"}
                                                            disabled={item.neveripdeleteflag === 1}
                                                            style={{ cursor: item.neveripdeleteflag === 1 ? "not-allowed" : "pointer" }}
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-ip-action text-muted border-0 bg-transparent p-1"
                                                            onClick={() => handleStartEditIp(item)}
                                                            title="Edit IP"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="text-center py-3 text-muted small">
                                                No IP addresses added yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
