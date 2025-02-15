function convertTableToCSV(tableSelector) {
    const table = document.querySelector(tableSelector);

    if (!table) {
        console.error("Table not found with selector:", tableSelector);
        return null;
    }

    const rows = table.querySelectorAll(".ant-table-row");
    if (rows.length === 0) {
        console.error("No data rows found in the table.");
        return null;
    }

    let csv = [];

    // Get headers
    const headerRow = table.querySelector(".ant-table-thead tr");
    if (headerRow) {
        const headers = headerRow.querySelectorAll("th");
        const headerValues = [];
        headers.forEach(header => {
            let headerText = '';
            const titleSpan = header.querySelector('.ant-table-column-title');
            if (titleSpan) {
                headerText = titleSpan.textContent.trim();
            } else {
                headerText = header.textContent.trim();
            }
            headerValues.push(cleanCSVValue(headerText));
        });
        csv.push(headerValues.join(','));
    }

    // Process data rows
    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll("td");

        cells.forEach(cell => {
            rowData.push(cleanCSVValue(cell.textContent.trim()));
        });

        csv.push(rowData.join(','));
    });

    return csv.join('\n');
}

function cleanCSVValue(value) {
    let escapedValue = value.replace(/"/g, '""');
    if (escapedValue.includes(',') || escapedValue.includes('\n') || escapedValue.includes('"')) {
        escapedValue = `"${escapedValue}"`;
    }
    return escapedValue;
}

function downloadCSV(csvContent, filename) {
    if (!csvContent) return;

    // BOM (Byte Order Mark) Strategy
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
    let url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- Main execution ---
const csvData = convertTableToCSV(".ant-table");
downloadCSV(csvData, "table_data.csv");
