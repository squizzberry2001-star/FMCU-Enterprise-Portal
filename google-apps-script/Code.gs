/**
 * ==========================================================================
 * FMCU ENTERPRISE PORTAL - GOOGLE APPS SCRIPT DATABASE & DRIVE BACKEND
 * ==========================================================================
 * Skrip ini berfungsi sebagai REST API backend untuk menyimpan seluruh data
 * portal FMCU ke dalam Google Spreadsheet dan file upload ke Google Drive.
 * 
 * CARA SETUP:
 * 1. Buka Google Spreadsheet baru di browser (misal: "Database FMCU Enterprise Portal").
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus semua kode yang ada di editor, lalu paste seluruh isi file ini.
 * 4. Jalankan fungsi `setupDatabase()` sekali untuk membuat seluruh sheet tabel otomatis.
 * 5. Klik tombol "Deploy" (Terapkan) -> "New deployment" (Deployment baru).
 * 6. Pilih tipe: "Web app" (Aplikasi web).
 *    - Execute as: "Me" (Saya / akun Google Anda)
 *    - Who has access: "Anyone" (Siapa saja, bahkan anonim)
 * 7. Salin URL Web App yang dihasilkan (format: https://script.google.com/macros/s/.../exec).
 * 8. Tempelkan URL tersebut ke Menu Settings di Konsol Admin FMCU!
 * ==========================================================================
 */

const SHEET_NAMES = {
  APPS: "tb_apps",
  COURSES: "tb_courses",
  EVENTS: "tb_events",
  DOCS: "tb_documents",
  SETTINGS: "tb_settings"
};

/**
 * Jalankan fungsi ini 1x di editor Apps Script untuk inisialisasi tabel otomatis
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Table Apps
  let sheetApps = ss.getSheetByName(SHEET_NAMES.APPS) || ss.insertSheet(SHEET_NAMES.APPS);
  if (sheetApps.getLastRow() === 0) {
    sheetApps.appendRow([
      "id", "name", "shortDesc", "category", "categoryLabel", 
      "url", "iconName", "customIconUrl", "ssoSupported", "status", "tags", "updatedAt"
    ]);
    sheetApps.getRange(1, 1, 1, 12).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 2. Table Courses
  let sheetCourses = ss.getSheetByName(SHEET_NAMES.COURSES) || ss.insertSheet(SHEET_NAMES.COURSES);
  if (sheetCourses.getLastRow() === 0) {
    sheetCourses.appendRow([
      "id", "title", "category", "progress", "dueDate", 
      "isMandatory", "totalModules", "completedModules", "estimatedHours", "status", "updatedAt"
    ]);
    sheetCourses.getRange(1, 1, 1, 11).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 3. Table Events
  let sheetEvents = ss.getSheetByName(SHEET_NAMES.EVENTS) || ss.insertSheet(SHEET_NAMES.EVENTS);
  if (sheetEvents.getLastRow() === 0) {
    sheetEvents.appendRow([
      "id", "title", "type", "trainer", "date", 
      "time", "location", "isOnline", "meetingUrl", "registeredCount", "maxCapacity", "updatedAt"
    ]);
    sheetEvents.getRange(1, 1, 1, 12).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 4. Table Documents
  let sheetDocs = ss.getSheetByName(SHEET_NAMES.DOCS) || ss.insertSheet(SHEET_NAMES.DOCS);
  if (sheetDocs.getLastRow() === 0) {
    sheetDocs.appendRow([
      "id", "title", "category", "format", "size", "updatedAt", "downloadUrl", "gdriveFileId"
    ]);
    sheetDocs.getRange(1, 1, 1, 8).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 5. Table Settings
  let sheetSettings = ss.getSheetByName(SHEET_NAMES.SETTINGS) || ss.insertSheet(SHEET_NAMES.SETTINGS);
  if (sheetSettings.getLastRow() === 0) {
    sheetSettings.appendRow(["key", "value", "updatedAt"]);
    sheetSettings.getRange(1, 1, 1, 3).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    sheetSettings.appendRow([
      "banner_alert", 
      JSON.stringify({ enabled: true, title: "Pelatihan wajib: HSE Compliance 2026", dueDate: "28 Okt 2026", linkText: "Buka Modul" }), 
      new Date().toISOString()
    ]);
  }

  Logger.log("Database FMCU berhasil diinisialisasi!");
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "getAll";
  
  try {
    if (action === "ping") {
      return responseJSON({ success: true, message: "Koneksi Google Apps Script FMCU Aktif!", timestamp: new Date().toISOString() });
    }
    
    if (action === "getAll") {
      const data = getAllPortalData();
      return responseJSON({ success: true, data: data });
    }

    return responseJSON({ success: false, message: "Action tidak dikenal: " + action });
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;

    // 1. Sync All Data at Once
    if (action === "syncAll") {
      if (payload.apps) saveTableData(SHEET_NAMES.APPS, payload.apps);
      if (payload.courses) saveTableData(SHEET_NAMES.COURSES, payload.courses);
      if (payload.events) saveTableData(SHEET_NAMES.EVENTS, payload.events);
      if (payload.docs) saveTableData(SHEET_NAMES.DOCS, payload.docs);
      if (payload.bannerAlert) {
        saveSettingValue("banner_alert", JSON.stringify(payload.bannerAlert));
      }
      return responseJSON({ success: true, message: "Seluruh data berhasil disinkronkan ke Google Sheets!" });
    }

    // 2. Upload File to Google Drive
    if (action === "uploadFile") {
      const fileName = payload.fileName || ("Document_" + Date.now() + ".pdf");
      const base64Data = payload.fileBase64; // data:application/pdf;base64,.... or raw base64
      const mimeType = payload.mimeType || "application/pdf";
      const folderId = payload.folderId || ""; // Optional target folder

      if (!base64Data) {
        return responseJSON({ success: false, error: "fileBase64 wajib diisi" });
      }

      // Strip header data URI if present
      const cleanBase64 = base64Data.replace(/^data:.*,/, "");
      const decodedBytes = Utilities.base64Decode(cleanBase64);
      const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      let file;
      if (folderId && folderId.trim() !== "") {
        const folder = DriveApp.getFolderById(folderId.trim());
        file = folder.createFile(blob);
      } else {
        file = DriveApp.createFile(blob);
      }

      // Set permission so employees can download/view
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const fileId = file.getId();
      const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
      const viewUrl = file.getUrl();

      return responseJSON({
        success: true,
        message: "File berhasil diunggah ke Google Drive!",
        fileId: fileId,
        fileName: fileName,
        downloadUrl: downloadUrl,
        viewUrl: viewUrl
      });
    }

    // 3. Save Specific Tables
    if (action === "saveApps") {
      saveTableData(SHEET_NAMES.APPS, payload.data || []);
      return responseJSON({ success: true, message: "Master Apps tersimpan!" });
    }
    if (action === "saveCourses") {
      saveTableData(SHEET_NAMES.COURSES, payload.data || []);
      return responseJSON({ success: true, message: "Courses tersimpan!" });
    }
    if (action === "saveEvents") {
      saveTableData(SHEET_NAMES.EVENTS, payload.data || []);
      return responseJSON({ success: true, message: "Events tersimpan!" });
    }
    if (action === "saveDocs") {
      saveTableData(SHEET_NAMES.DOCS, payload.data || []);
      return responseJSON({ success: true, message: "Documents tersimpan!" });
    }
    if (action === "saveBanner") {
      saveSettingValue("banner_alert", JSON.stringify(payload.data));
      return responseJSON({ success: true, message: "Banner tersimpan!" });
    }

    return responseJSON({ success: false, message: "Action tidak dikenal: " + action });
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
}

/**
 * Ambil seluruh data portal dari sheet
 */
function getAllPortalData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const apps = readSheetAsJSON(ss.getSheetByName(SHEET_NAMES.APPS));
  const courses = readSheetAsJSON(ss.getSheetByName(SHEET_NAMES.COURSES));
  const events = readSheetAsJSON(ss.getSheetByName(SHEET_NAMES.EVENTS));
  const docs = readSheetAsJSON(ss.getSheetByName(SHEET_NAMES.DOCS));
  
  // Banner Alert from settings
  let bannerAlert = { enabled: true, title: "Pelatihan wajib: HSE Compliance 2026", dueDate: "28 Okt 2026", linkText: "Buka Modul" };
  const rawBanner = getSettingValue("banner_alert");
  if (rawBanner) {
    try { bannerAlert = JSON.parse(rawBanner); } catch(e) {}
  }

  return {
    apps: apps,
    courses: courses,
    events: events,
    docs: docs,
    bannerAlert: bannerAlert
  };
}

/**
 * Helper untuk membaca sheet menjadi array of object
 */
function readSheetAsJSON(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const results = [];
  for (let i = 0; i < rows.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = rows[i][j];
      const header = headers[j];
      
      // Parse boolean & JSON if needed
      if (val === "TRUE" || val === true) val = true;
      if (val === "FALSE" || val === false) val = false;
      if (header === "tags" && typeof val === "string") {
        try { val = JSON.parse(val); } catch(e) { val = [val]; }
      }
      if (header === "progress" || header === "totalModules" || header === "completedModules" || header === "maxCapacity" || header === "registeredCount") {
        val = Number(val) || 0;
      }
      obj[header] = val;
    }
    results.push(obj);
  }
  return results;
}

/**
 * Helper untuk menimpa seluruh isi tabel dengan data baru
 */
function saveTableData(sheetName, dataList) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(sheetName);
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  // Clear data lama (kecuali header)
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }

  if (!dataList || dataList.length === 0) return;

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rowsToWrite = [];

  for (let i = 0; i < dataList.length; i++) {
    const item = dataList[i];
    const row = [];
    for (let j = 0; j < headers.length; j++) {
      const h = headers[j];
      let val = item[h];
      if (h === "updatedAt") {
        val = new Date().toISOString();
      } else if (Array.isArray(val)) {
        val = JSON.stringify(val);
      } else if (typeof val === "boolean") {
        val = val ? "TRUE" : "FALSE";
      } else if (val === undefined || val === null) {
        val = "";
      }
      row.push(val);
    }
    rowsToWrite.push(row);
  }

  if (rowsToWrite.length > 0) {
    sheet.getRange(2, 1, rowsToWrite.length, headers.length).setValues(rowsToWrite);
  }
}

/**
 * Settings helpers
 */
function getSettingValue(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

function saveSettingValue(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  }
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      return;
    }
  }
  sheet.appendRow([key, value, new Date().toISOString()]);
}

/**
 * Output format JSON
 */
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
