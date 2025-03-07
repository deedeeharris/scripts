(function() {
    function logAllTables() {
        const allDivs = document.querySelectorAll('div');
        console.log("Total divs found:", allDivs.length);

        const potentialTables = [];
        allDivs.forEach((div, index) => {
            if (div.className && div.className.includes('ant-table-container')) {
                potentialTables.push(div);
            }
        });

        console.log("Found potential table containers:", potentialTables);

        return potentialTables;
    }


    function extractDataFromTable(tableContainer) {
      if (!tableContainer) {
        console.error("❌ Invalid table container provided to extractDataFromTable.");
        return "";
      }

      let csv = [];
      const rowSet = new Set(); // Use a Set to track unique rows

      // --- Extract Headers ---
      const headerRows = tableContainer.querySelectorAll('.ant-table-thead > tr');
      if (headerRows.length > 0) {
          const headerRow = headerRows[0]; // Usually, headers are in the first row
          const headers = headerRow.querySelectorAll('th');
          const headerText = Array.from(headers).map(header => {
              // Look for .ant-table-column-title first, fallback to th content
              const titleSpan = header.querySelector('.ant-table-column-title');
              return titleSpan ? titleSpan.textContent.trim() : header.textContent.trim();
          });
          csv.push(headerText.join(','));
      } else {
          console.warn("No header rows found in the table.");
      }


      // --- Extract Data Rows ---
      const bodyRows = tableContainer.querySelectorAll('.ant-table-tbody > .ant-table-row');
      console.log(`Found ${bodyRows.length} data rows.`);

      bodyRows.forEach(row => {
          const rowData = [];
          const cells = row.querySelectorAll('td');
          cells.forEach(cell => rowData.push(cell.textContent.trim()));

          const rowString = rowData.join(',');
          if (!rowSet.has(rowString)) {
              rowSet.add(rowString);
              csv.push(rowString);
          }
      });

      return csv.join('\n');
    }


    function scrollToBottomAndExtract(tableContainer, callback) {
        if (!tableContainer) {
            console.error("scrollToBottomAndExtract: No table container found");
            callback(""); // Call the callback with empty string if no container
            return;
        }

        const scrollableBody = tableContainer.querySelector('.ant-table-body');

        if (!scrollableBody) {
            console.error("scrollToBottomAndExtract: No scrollable body found");
            // If no scrollable body, extract what's visible.
            const csvData = extractDataFromTable(tableContainer);
            callback(csvData);
            return;
        }


        let previousScrollHeight = -1;
        const scrollInterval = setInterval(() => {
            const currentScrollHeight = scrollableBody.scrollHeight;

            if (currentScrollHeight > previousScrollHeight) {
                // More content loaded, scroll to bottom
                scrollableBody.scrollTop = currentScrollHeight;
                previousScrollHeight = currentScrollHeight;
                console.log("Scrolling... Current Scroll Height:", currentScrollHeight);
            } else {
                // No more content, stop scrolling and extract data
                clearInterval(scrollInterval);
                console.log("Scrolling finished. Extracting data...");
                const csvData = extractDataFromTable(tableContainer);
                callback(csvData); // Pass the extracted data to the callback
            }
        }, 500); // Check every 500ms if more content has loaded
    }


    setTimeout(() => {
        const potentialTables = logAllTables();

        if (potentialTables.length > 0) {
            // We'll only process the first table container found.  You can modify
            // this to loop through all if needed.
            scrollToBottomAndExtract(potentialTables[0], (csvContent) => {
                console.log("Final CSV Content:", csvContent);

                // UTF-8 BOM (Byte Order Mark)
                const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
                const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });

                // Create a download link and trigger
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "table_data.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        } else {
            console.error("❌ No potential tables found!");
        }
    }, 2000);
})();
