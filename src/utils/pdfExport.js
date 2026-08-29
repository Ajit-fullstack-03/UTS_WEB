import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate and download a comprehensive PDF report of Client Profile Details
 * (Basic Info, Spouse Info, and Dependents).
 */
export const exportClientDetailsPDF = ({
    client = {},
    basicInfo = {},
    spouseInfo = null,
    dependentsInfo = [],
    taxYear = ""
}) => {
    try {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        });

        const primaryColor = [27, 46, 107]; // #1b2e6b Deep Navy
        const secondaryColor = [201, 139, 39]; // #c98b27 Gold
        const darkTextColor = [30, 41, 59]; // #1e293b Slate
        const lightBgColor = [248, 250, 252]; // #f8fafc

        const fileNumber = client.file_number || client.filenumber || client.unique_code || "UTS-CLIENT";
        const clientFullName = `${basicInfo.firstName || client.name || "Client"} ${basicInfo.lastName || ""}`.trim();
        const activeTaxYear = taxYear || client.tax_year || "2026";
        const generatedDate = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        // 1. Header Banner & Branding
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 595.28, 70, "F");

        // Top Accent Stripe
        doc.setFillColor(...secondaryColor);
        doc.rect(0, 70, 595.28, 4, "F");

        // Company Title
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("UMPIRE TAX SOLUTIONS", 36, 32);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(220, 230, 255);
        doc.text("CONFIDENTIAL CLIENT INFORMATION DOSSIER", 36, 48);

        // Right side info in header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(`TAX YEAR: ${activeTaxYear}`, 559, 32, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(220, 230, 255);
        doc.text(`Generated: ${generatedDate}`, 559, 48, { align: "right" });

        let currentY = 92;

        // 2. Client Overview Summary Card
        autoTable(doc, {
            startY: currentY,
            margin: { left: 36, right: 36 },
            theme: "grid",
            head: [
                [
                    {
                        content: `CLIENT FILE SUMMARY - [${fileNumber}]`,
                        colSpan: 4,
                        styles: {
                            fillColor: primaryColor,
                            textColor: [255, 255, 255],
                            fontStyle: "bold",
                            fontSize: 10,
                            halign: "left"
                        }
                    }
                ]
            ],
            body: [
                [
                    { content: "Client Name:", styles: { fontStyle: "bold", textColor: primaryColor, cellWidth: 100 } },
                    { content: clientFullName || "-", styles: { textColor: darkTextColor } },
                    { content: "File Number:", styles: { fontStyle: "bold", textColor: primaryColor, cellWidth: 100 } },
                    { content: fileNumber, styles: { textColor: darkTextColor, fontStyle: "bold" } }
                ],
                [
                    { content: "Email Address:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: basicInfo.email || client.email || "-", styles: { textColor: darkTextColor } },
                    { content: "File Status:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: client.status || client.filestatus || "Active", styles: { textColor: [220, 38, 38], fontStyle: "bold" } }
                ]
            ],
            styles: {
                fontSize: 8.5,
                cellPadding: 5,
                lineColor: [226, 232, 240],
                lineWidth: 0.5
            },
            alternateRowStyles: {
                fillColor: lightBgColor
            }
        });

        currentY = doc.lastAutoTable.finalY + 14;

        // 3. Section: Basic Taxpayer Information
        const mobileFormatted = basicInfo.mobilePhone
            ? `${basicInfo.mobileCode || "+1"} ${basicInfo.mobilePhone}`
            : "-";

        autoTable(doc, {
            startY: currentY,
            margin: { left: 36, right: 36 },
            theme: "grid",
            head: [
                [
                    {
                        content: "1. PRIMARY TAXPAYER INFORMATION",
                        colSpan: 4,
                        styles: {
                            fillColor: [40, 60, 120],
                            textColor: [255, 255, 255],
                            fontStyle: "bold",
                            fontSize: 9.5
                        }
                    }
                ]
            ],
            body: [
                [
                    { content: "First Name:", styles: { fontStyle: "bold", cellWidth: 100, textColor: primaryColor } },
                    { content: basicInfo.firstName || "-", styles: { textColor: darkTextColor } },
                    { content: "Last Name:", styles: { fontStyle: "bold", cellWidth: 100, textColor: primaryColor } },
                    { content: basicInfo.lastName || "-", styles: { textColor: darkTextColor } }
                ],
                [
                    { content: "SSN / ITIN:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: basicInfo.ssnItin || "-", styles: { textColor: darkTextColor } },
                    { content: "Occupation:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: basicInfo.occupation || "-", styles: { textColor: darkTextColor } }
                ],
                [
                    { content: "Date of Birth:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: basicInfo.dob || "-", styles: { textColor: darkTextColor } },
                    { content: "Email:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: basicInfo.email || "-", styles: { textColor: darkTextColor } }
                ],
                [
                    { content: "Mobile Phone:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: mobileFormatted, styles: { textColor: darkTextColor } },
                    { content: "Work Phone:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: basicInfo.workPhone || "-", styles: { textColor: darkTextColor } }
                ],
                [
                    { content: "Referral Name:", styles: { fontStyle: "bold", textColor: primaryColor } },
                    { content: basicInfo.referralName || "None", colSpan: 3, styles: { textColor: darkTextColor } }
                ]
            ],
            styles: {
                fontSize: 8.5,
                cellPadding: 4.5,
                lineColor: [226, 232, 240],
                lineWidth: 0.5
            },
            alternateRowStyles: {
                fillColor: lightBgColor
            }
        });

        currentY = doc.lastAutoTable.finalY + 14;

        // 4. Section: Spouse Information
        if (spouseInfo && (spouseInfo.firstName || spouseInfo.lastName || spouseInfo.email || spouseInfo.mobilePhone)) {
            const spouseMobile = spouseInfo.mobilePhone
                ? `${spouseInfo.mobileCode || "+1"} ${spouseInfo.mobilePhone}`
                : "-";

            autoTable(doc, {
                startY: currentY,
                margin: { left: 36, right: 36 },
                theme: "grid",
                head: [
                    [
                        {
                            content: "2. SPOUSE INFORMATION",
                            colSpan: 4,
                            styles: {
                                fillColor: [40, 60, 120],
                                textColor: [255, 255, 255],
                                fontStyle: "bold",
                                fontSize: 9.5
                            }
                        }
                    ]
                ],
                body: [
                    [
                        { content: "First Name:", styles: { fontStyle: "bold", cellWidth: 100, textColor: primaryColor } },
                        { content: spouseInfo.firstName || "-", styles: { textColor: darkTextColor } },
                        { content: "Last Name:", styles: { fontStyle: "bold", cellWidth: 100, textColor: primaryColor } },
                        { content: spouseInfo.lastName || "-", styles: { textColor: darkTextColor } }
                    ],
                    [
                        { content: "SSN / ITIN:", styles: { fontStyle: "bold", textColor: primaryColor } },
                        { content: spouseInfo.ssnItin || "-", styles: { textColor: darkTextColor } },
                        { content: "Occupation:", styles: { fontStyle: "bold", textColor: primaryColor } },
                        { content: spouseInfo.occupation || "-", styles: { textColor: darkTextColor } }
                    ],
                    [
                        { content: "Date of Birth:", styles: { fontStyle: "bold", textColor: primaryColor } },
                        { content: spouseInfo.dob || "-", styles: { textColor: darkTextColor } },
                        { content: "Email:", styles: { fontStyle: "bold", textColor: primaryColor } },
                        { content: spouseInfo.email || "-", styles: { textColor: darkTextColor } }
                    ],
                    [
                        { content: "Mobile Phone:", styles: { fontStyle: "bold", textColor: primaryColor } },
                        { content: spouseMobile, styles: { textColor: darkTextColor } },
                        { content: "Work Phone:", styles: { fontStyle: "bold", textColor: primaryColor } },
                        { content: spouseInfo.workPhone || "-", styles: { textColor: darkTextColor } }
                    ]
                ],
                styles: {
                    fontSize: 8.5,
                    cellPadding: 4.5,
                    lineColor: [226, 232, 240],
                    lineWidth: 0.5
                },
                alternateRowStyles: {
                    fillColor: lightBgColor
                }
            });
        } else {
            autoTable(doc, {
                startY: currentY,
                margin: { left: 36, right: 36 },
                theme: "grid",
                head: [
                    [
                        {
                            content: "2. SPOUSE INFORMATION",
                            styles: {
                                fillColor: [40, 60, 120],
                                textColor: [255, 255, 255],
                                fontStyle: "bold",
                                fontSize: 9.5
                            }
                        }
                    ]
                ],
                body: [
                    [{ content: "No spouse information recorded on file for this client.", styles: { fontStyle: "italic", textColor: [100, 116, 139] } }]
                ],
                styles: {
                    fontSize: 8.5,
                    cellPadding: 5,
                    lineColor: [226, 232, 240],
                    lineWidth: 0.5
                }
            });
        }

        currentY = doc.lastAutoTable.finalY + 14;

        if (currentY > 620) {
            doc.addPage();
            currentY = 40;
        }

        // 5. Section: Dependents Information
        const depRows = dependentsInfo && dependentsInfo.length > 0
            ? dependentsInfo.map((dep, idx) => [
                idx + 1,
                dep.firstName || "-",
                dep.lastName || "-",
                dep.relationship || "-",
                dep.ssnItin || "-",
                dep.dob || "-",
                dep.visaType || "-"
            ])
            : [
                [{ content: "No dependent information registered for this client.", colSpan: 7, styles: { fontStyle: "italic", halign: "center", textColor: [100, 116, 139] } }]
            ];

        autoTable(doc, {
            startY: currentY,
            margin: { left: 36, right: 36 },
            theme: "grid",
            head: [
                [
                    {
                        content: `3. DEPENDENTS INFORMATION (${dependentsInfo ? dependentsInfo.length : 0})`,
                        colSpan: 7,
                        styles: {
                            fillColor: [40, 60, 120],
                            textColor: [255, 255, 255],
                            fontStyle: "bold",
                            fontSize: 9.5
                        }
                    }
                ],
                [
                    "#",
                    "First Name",
                    "Last Name",
                    "Relationship",
                    "SSN / ITIN",
                    "Date of Birth",
                    "Visa Type"
                ].map(header => ({
                    content: header,
                    styles: {
                        fillColor: [238, 242, 255],
                        textColor: primaryColor,
                        fontStyle: "bold",
                        fontSize: 8
                    }
                }))
            ],
            body: depRows,
            styles: {
                fontSize: 8,
                cellPadding: 4.5,
                lineColor: [226, 232, 240],
                lineWidth: 0.5
            },
            alternateRowStyles: {
                fillColor: lightBgColor
            }
        });

        // 6. Page Numbers and Footer on all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            // Footer separator line
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.75);
            doc.line(36, 800, 559.28, 800);

            // Confidentiality Note
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(148, 163, 184);
            doc.text("CONFIDENTIAL - Umpire Tax Solutions Official Document. Strictly for authorized tax processing only.", 36, 815);

            // Page count on right
            doc.text(`Page ${i} of ${totalPages}`, 559.28, 815, { align: "right" });
        }

        // Save the PDF file
        const cleanFileName = `${fileNumber}_${clientFullName.replace(/[^a-zA-Z0-9]/g, "_")}_Profile_${activeTaxYear}.pdf`;
        doc.save(cleanFileName);
        return true;
    } catch (error) {
        console.error("PDF generation failed:", error);
        throw error;
    }
};
