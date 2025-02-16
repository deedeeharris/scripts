(function() {
    let scrollInterval;
    let lastScrollTop = -1;
    let noChangeCount = 0;
    const MAX_NO_CHANGE = 5;
    const SCROLL_INTERVAL = 150;
    const DELAY_BEFORE_SAVE = 2000; // 2 seconds delay before saving

    function getScrollContainer() {
        const tableBody = document.querySelector('.ant-table-body');

        if (tableBody && tableBody.scrollHeight > tableBody.clientHeight) {
            console.log("Found scroll container:", tableBody);
            return tableBody;
        }

        console.warn("Could not find the ant-table-body element.  Check the selector.");
        return null;
    }

    const scrollContainer = getScrollContainer();

    if (!scrollContainer) {
        console.error("No scrollable container found. Exiting.");
        return;
    }

    function scrollToBottom() {
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const scrollTop = scrollContainer.scrollTop;

        if (scrollTop + clientHeight < scrollHeight) {
            scrollContainer.scrollTop = scrollHeight;

            if (scrollContainer.scrollTop === lastScrollTop) {
                noChangeCount++;
                if (noChangeCount >= MAX_NO_CHANGE) {
                    console.log("Scroll position hasn't changed. Stopping.");
                    stopScrolling();
                    // Delay before saving
                    setTimeout(convertAndDownload, DELAY_BEFORE_SAVE);
                }
            } else {
                noChangeCount = 0;
            }

            lastScrollTop = scrollContainer.scrollTop;

        } else {
            stopScrolling();
            // Delay before saving
            setTimeout(convertAndDownload, DELAY_BEFORE_SAVE);
        }
    }

    function startScrolling() {
        if (!scrollInterval) {
            scrollInterval = setInterval(scrollToBottom, SCROLL_INTERVAL);
        }
    }

    function stopScrolling() {
        clearInterval(scrollInterval);
        scrollInterval = null;
        console.log("Scrolling stopped.");
    }

    function addButton() {
        if (document.getElementById("stopScrollButton")) return;

        const button = document.createElement("button");
        button.id = "stopScrollButton";
        button.textContent = "Stop Scrolling";
        button.style.position = "fixed";
        button.style.bottom = "20px";
        button.style.right = "20px";
        button.style.zIndex = "10000";
        button.style.padding = "10px";
        button.style.backgroundColor = "red";
        button.style.color = "white";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        button.onclick = stopScrolling;
        document.body.appendChild(button);
    }

    // --- CSV Conversion and Download Functions ---

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

    // --- Function to orchestrate scrolling, conversion, and download ---
    function convertAndDownload() {
        const csvData = convertTableToCSV(".ant-table");
        downloadCSV(csvData, "table_data.csv");
    }

    // --- Start the process ---
    startScrolling();
    addButton(); // Optional: Add the stop button

})();
