// ============================================================
//  WASSERENTNAHME – Google Apps Script
//  Anleitung:
//  1. Öffne dein Google Sheet (neu erstellen unter sheets.google.com)
//  2. Klicke auf: Erweiterungen → Apps Script
//  3. Lösche den vorhandenen Code und füge diesen hier ein
//  4. Klicke auf „Speichern" (Disketten-Symbol)
//  5. Klicke auf „Bereitstellen" → „Neue Bereitstellung"
//     - Typ: Web-App
//     - Ausführen als: Ich (deine Google-Konto)
//     - Zugriff: Jeder
//  6. Klicke „Bereitstellen" → Berechtigungen erlauben
//  7. Kopiere die „Web-App-URL" und füge sie in der Webseite
//     unter „Einstellungen" ein
// ============================================================

const SHEET_NAME = 'Wasserentnahme';
const HEADER_ROW = ['Timestamp', 'Name', 'Standort', 'Wasser_m3', 'Datum', 'QR_Code', 'Jahr', 'Monat'];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER_ROW);
    const header = sheet.getRange(1, 1, 1, HEADER_ROW.length);
    header.setFontWeight('bold');
    header.setBackground('#1A6A99');
    header.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(5, 160);
  }
  return sheet;
}

function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : e.parameter.data;
    const data = JSON.parse(raw);

    const sheet = getOrCreateSheet();
    const now = new Date();
    const datumStr = data.datum || now.toISOString();
    const d = new Date(datumStr);

    sheet.appendRow([
      now.toISOString(),
      data.name    || '',
      data.standort|| '',
      parseFloat(data.wasser) || 0,
      Utilities.formatDate(d, 'Europe/Vienna', 'dd.MM.yyyy HH:mm'),
      data.qr      || '',
      d.getFullYear(),
      d.getMonth() + 1
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data  = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const keys = ['timestamp','name','standort','wasser','datum','qr','jahr','monat'];
    const rows = data.slice(1).map(row => {
      const obj = {};
      keys.forEach((k, i) => { obj[k] = row[i]; });
      return obj;
    });

    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
