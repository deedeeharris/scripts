(function() {
    let scrollInterval;
    let lastScrollTop = -1;
    let noChangeCount = 0;
    const MAX_NO_CHANGE = 5;
    const SCROLL_INTERVAL = 150;
    const DELAY_BEFORE_SAVE = 2000; // 2 seconds delay before saving

    function getScrollContainer() {
        return new Promise(resolve => {
            const checkExist = setInterval(() => {
                const tableBody = document.querySelector('.ant-table-body, .ReportGenerator_custom-scrollbar__2petG');
                if (tableBody && tableBody.scrollHeight > tableBody.clientHeight) {
                    console.log("✅ Found scroll container:", tableBody);
                    clearInterval(checkExist);
                    resolve(tableBody);
                }
            }, 500);
        });
    }

    function scrollToBottom(scrollContainer) {
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const scrollTop = scrollContainer.scrollTop;

        if (scrollTop + clientHeight < scrollHeight) {
            scrollContainer.scrollTop = scrollHeight;

            if (scrollContainer.scrollTop === lastScrollTop) {
                noChangeCount++;
                if (noChangeCount >= MAX_NO_CHANGE) {
                    console.log("✅ Scroll position hasn't changed. Stopping.");
                    stopScrolling();
                    setTimeout(window.convertAndDownload, DELAY_BEFORE_SAVE);
                }
            } else {
                noChangeCount = 0;
            }
            lastScrollTop = scrollContainer.scrollTop;
        } else {
            stopScrolling();
            setTimeout(window.convertAndDownload, DELAY_BEFORE_SAVE);
        }
    }

    function startScrolling(scrollContainer) {
        if (!scrollInterval) {
            scrollInterval = setInterval(() => scrollToBottom(scrollContainer), SCROLL_INTERVAL);
        }
    }

    function stopScrolling() {
        clearInterval(scrollInterval);
        scrollInterval = null;
        console.log("🛑 Scrolling stopped.");
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

    function convertTableToCSV(tableSelector) {
        const table = document.querySelector(tableSelector);
        if (!table) {
            console.error("❌ Table not found:", tableSelector);
            return null;
        }

        const rows = table.querySelectorAll(".ant-table-row");
        if (rows.length === 0) {
            console.error("❌ No data rows found in the table.");
            return null;
        }

        let csv = [];
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

    function convertAndDownload() {
        const csvData = convertTableToCSV(".ant-table");
        downloadCSV(csvData, "table_data.csv");
    }

    // 🔥 Attach to `window` so you can call them from the console
    window.convertAndDownload = convertAndDownload;
    window.startScrolling = startScrolling;

    getScrollContainer().then(scrollContainer => {
        if (!scrollContainer) {
            console.error("❌ No scrollable container found. Exiting.");
            return;
        }
        startScrolling(scrollContainer);
        addButton();
    });

})();
