import * as XLSX from "xlsx";

/**
 * Export formatted JSON data to an Excel (.xlsx) spreadsheet and trigger download
 * @param {Array<Object>} data - Array of row objects to export
 * @param {string} fileName - Name of exported file (without .xlsx extension)
 * @param {string} sheetName - Title of the worksheet inside workbook
 */
export const exportToExcel = (data, fileName = "Export", sheetName = "Sheet1") => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("No data available to export.");
    }

    // 1. Create workbook & worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // 2. Compute dynamic column widths
    const colKeys = Object.keys(data[0] || {});
    const colWidths = colKeys.map((key) => {
        let maxLen = String(key).length;
        data.forEach((row) => {
            const val = row[key];
            if (val !== undefined && val !== null) {
                const str = String(val);
                if (str.length > maxLen) {
                    maxLen = str.length;
                }
            }
        });
        return { wch: Math.min(Math.max(maxLen + 4, 14), 50) };
    });
    ws["!cols"] = colWidths;

    // 3. Attach sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 4. Trigger download
    const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(wb, finalFileName);
};

export default exportToExcel;
