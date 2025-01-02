function sendSheetAsXLSX() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();
  const fileName = ss.getName() + '.xlsx';
  const email = Session.getActiveUser().getEmail();
  
  // Get the export URL
  const url = `https://docs.google.com/spreadsheets/d/${ss.getId()}/export?format=xlsx`;
  
  // Fetch the XLSX file as a blob
  const token = ScriptApp.getOAuthToken();
  const blob = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }).getBlob().setName(fileName);
  
  // Send email with the XLSX attachment
  GmailApp.sendEmail(email, 'Backup attached', 'Info', {
    attachments: [blob],
    name: 'Backup Bot'
  });
  
  SpreadsheetApp.getActive().toast('XLSX file sent to your email.', 'Success', 3);
}
