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
      "id", "title", "category", "slideUrl", "description", "estimatedHours", "status", "updatedAt"
    ]);
    sheetCourses.getRange(1, 1, 1, 8).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
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

    if (action === "getGoogleCalendar") {
      const calId = (e && e.parameter && e.parameter.calendarId) || "primary";
      const result = fetchGoogleCalendarEvents(calId);
      return responseJSON(result);
    }

    if (action === "autoClassifyGdrive" || action === "scanDriveFolder") {
      const folderId = (e && e.parameter && e.parameter.folderId) || "1N_zsTNDywwqscmYMXmgwuR3SFHTHsbxx";
      const result = autoClassifyDriveFolder(folderId);
      return responseJSON(result);
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

    // 2. Upload File, Photo, or Any Asset to Google Drive
    if (action === "uploadFile") {
      const fileName = payload.fileName || ("Asset_" + Date.now() + ".dat");
      const base64Data = payload.fileBase64;
      let mimeType = payload.mimeType || "application/octet-stream";
      const folderId = payload.folderId || "";

      if (!base64Data) {
        return responseJSON({ success: false, error: "fileBase64 wajib diisi" });
      }

      // Deteksi otomatis tipe MIME dari ekstensi file jika belum terdefinisi spesifik
      const ext = (fileName.split('.').pop() || '').toLowerCase();
      const mimeTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'webp': 'image/webp',
        'ico': 'image/x-icon',
        'bmp': 'image/bmp',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'tar': 'application/x-tar',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'json': 'application/json'
      };
      if (mimeTypes[ext]) {
        mimeType = mimeTypes[ext];
      }

      // Bersihkan prefix base64 data URI (misal: data:image/png;base64,....)
      const cleanBase64 = base64Data.replace(/^data:.*?;base64,/, "");
      const decodedBytes = Utilities.base64Decode(cleanBase64);
      const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      // Tentukan folder penyimpanan: Folder custom ID atau folder otomatis "FMCU_Enterprise_Storage"
      let targetFolder;
      if (folderId && folderId.trim() !== "") {
        try {
          targetFolder = DriveApp.getFolderById(folderId.trim());
        } catch (e) {
          targetFolder = null;
        }
      }
      if (!targetFolder) {
        const defaultFolderName = "FMCU_Enterprise_Storage";
        const folders = DriveApp.getFoldersByName(defaultFolderName);
        if (folders.hasNext()) {
          targetFolder = folders.next();
        } else {
          targetFolder = DriveApp.createFolder(defaultFolderName);
          targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
      }

      const file = targetFolder.createFile(blob);
      // Hak akses publik (View): Seluruh karyawan di berbagai perangkat dapat mengunduh / melihat gambar
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const fileId = file.getId();
      // Link unduhan langsung (direct download untuk PDF/DOCX/ZIP/dll)
      const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
      // Link preview interaktif Google Drive viewer
      const viewUrl = "https://drive.google.com/file/d/" + fileId + "/view";
      // Direct CDN image URL (Bisa langsung dipasang di <img src="..." /> tanpa terblokir CORS/redirect)
      const directImageUrl = "https://lh3.googleusercontent.com/d/" + fileId;
      // Thumbnail ukuran kecil
      const thumbnailUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w400";

      return responseJSON({
        success: true,
        message: "File/Foto berhasil disimpan ke Google Drive!",
        fileId: fileId,
        fileName: fileName,
        mimeType: mimeType,
        fileSize: file.getSize(),
        downloadUrl: downloadUrl,
        viewUrl: viewUrl,
        directImageUrl: directImageUrl,
        thumbnailUrl: thumbnailUrl
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
    if (action === "syncGoogleCalendar") {
      const calId = payload.calendarId || "primary";
      const calRes = fetchGoogleCalendarEvents(calId);
      if (calRes.success && calRes.events && calRes.events.length > 0) {
        saveTableData(SHEET_NAMES.EVENTS, calRes.events);
      }
      return responseJSON(calRes);
    }
    if (action === "autoClassifyGdrive" || action === "scanDriveFolder") {
      const folderId = payload.folderId || "1N_zsTNDywwqscmYMXmgwuR3SFHTHsbxx";
      const classifyRes = autoClassifyDriveFolder(folderId);
      return responseJSON(classifyRes);
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
 * Helper untuk membaca sheet menjadi array of object berdasarkan nama tabel
 */
function getTableData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(sheetName);
  }
  return readSheetAsJSON(sheet);
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

  let headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  if (sheetName === SHEET_NAMES.COURSES) {
    if (headers.indexOf("slideUrl") === -1) {
      sheet.getRange(1, headers.length + 1).setValue("slideUrl");
      sheet.getRange(1, headers.length + 1).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
      headers.push("slideUrl");
    }
    if (headers.indexOf("description") === -1) {
      sheet.getRange(1, headers.length + 1).setValue("description");
      sheet.getRange(1, headers.length + 1).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
      headers.push("description");
    }
  }
  if (sheetName === SHEET_NAMES.DOCS) {
    if (headers.indexOf("viewUrl") === -1) {
      sheet.getRange(1, headers.length + 1).setValue("viewUrl");
      sheet.getRange(1, headers.length + 1).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
      headers.push("viewUrl");
    }
  }
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

/**
 * Ambil jadwal event langsung dari Google Calendar (Native CalendarApp)
 */
function fetchGoogleCalendarEvents(calendarId) {
  try {
    const id = calendarId || "primary";
    let cal;
    if (id === "primary") {
      cal = CalendarApp.getDefaultCalendar();
    } else {
      cal = CalendarApp.getCalendarById(id);
    }

    if (!cal) {
      return { 
        success: false, 
        error: "Google Calendar dengan ID '" + id + "' tidak ditemukan. Pastikan Calendar ID benar atau akun Google memiliki izin akses kalender tersebut." 
      };
    }

    const now = new Date();
    // Ambil event dari 7 hari lalu hingga 90 hari mendatang
    const startTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const endTime = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
    
    const events = cal.getEvents(startTime, endTime);
    const parsedEvents = [];
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const start = ev.getStartTime();
      const end = ev.getEndTime();
      
      const day = start.getDate();
      const month = MONTHS[start.getMonth()];
      const year = start.getFullYear();
      const dateStr = day + " " + month + " " + year;

      const pad = function(n) { return n < 10 ? '0' + n : n; };
      const timeStr = pad(start.getHours()) + ":" + pad(start.getMinutes()) + " - " + 
                      pad(end.getHours()) + ":" + pad(end.getMinutes()) + " WIB";

      const loc = ev.getLocation() || "Google Meet";
      const desc = ev.getDescription() || "";

      let meetingUrl = "";
      const urlMatch = (loc + " " + desc).match(/https:\/\/(meet\.google\.com|teams\.microsoft\.com|zoom\.us\/j)\/[^\s"']+/i);
      if (urlMatch) {
        meetingUrl = urlMatch[0];
      }

      const isOnline = /meet|zoom|teams|online|webinar/i.test(loc + " " + desc);

      let type = "Webinar";
      const combined = (ev.getTitle() + " " + desc).toLowerCase();
      if (combined.indexOf("workshop") !== -1) type = "Workshop Offline";
      else if (combined.indexOf("sertifikasi") !== -1 || combined.indexOf("exam") !== -1 || combined.indexOf("ujian") !== -1) type = "Certification Exam";
      else if (combined.indexOf("sharing") !== -1 || combined.indexOf("talk") !== -1) type = "Sharing Session";

      parsedEvents.push({
        id: "gcal-" + ev.getId(),
        title: ev.getTitle(),
        type: type,
        trainer: ev.getCreators().join(", ") || "Trainer FMCU",
        date: dateStr,
        time: timeStr,
        location: loc,
        isOnline: isOnline,
        meetingUrl: meetingUrl || (isOnline ? "https://meet.google.com" : ""),
        registeredCount: 0,
        maxCapacity: 100,
        description: desc,
        googleEventId: ev.getId(),
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString()
      });
    }

    return {
      success: true,
      calendarName: cal.getName(),
      calendarId: id,
      count: parsedEvents.length,
      events: parsedEvents
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * ==========================================================================
 * OTOMASI KLASIFIKASI GOOGLE DRIVE KE PORTAL FMCU
 * - PPTX / Google Slides  -> Section Modul Pelatihan (tb_courses), Kategori = Nama Folder
 * - PDF dan EXCEL         -> Section SOP & Dokumen (tb_documents), Kategori = Nama Folder
 * ==========================================================================
 */
function autoClassifyDriveFolder(targetFolderId) {
  const folderId = (targetFolderId && targetFolderId.trim()) || "1N_zsTNDywwqscmYMXmgwuR3SFHTHsbxx";
  
  try {
    const rootFolder = DriveApp.getFolderById(folderId);
    if (!rootFolder) {
      return { success: false, error: "Folder Google Drive tidak ditemukan dengan ID: " + folderId };
    }

    const courses = [];
    const docs = [];

    // Helper rekursif untuk memindai berkas dalam folder dan subfoldernya
    function processFolder(folder, currentCategory) {
      const folderName = folder.getName();
      // Gunakan nama subfolder sebagai kategori, jika root folder gunakan "Umum"
      const categoryName = currentCategory || folderName;

      // 1. Proses semua berkas di dalam folder ini
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        const fileName = file.getName();
        const mimeType = file.getMimeType();
        const fileId = file.getId();
        const sizeBytes = file.getSize();
        const updatedAt = Utilities.formatDate(file.getLastUpdated(), "Asia/Jakarta", "dd MMM yyyy");

        // Format ukuran file (KB / MB)
        let sizeStr = "1.0 MB";
        if (sizeBytes > 1024 * 1024) {
          sizeStr = (sizeBytes / (1024 * 1024)).toFixed(1) + " MB";
        } else if (sizeBytes > 1024) {
          sizeStr = Math.round(sizeBytes / 1024) + " KB";
        }

        // ==========================================
        // ATURAN 1: PPTX atau Google Slides
        // -> Masuk ke Section Modul Pelatihan
        // ==========================================
        const isSlide = (
          mimeType === MimeType.GOOGLE_SLIDES ||
          mimeType === "application/vnd.google-apps.presentation" ||
          mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
          mimeType === "application/vnd.ms-powerpoint" ||
          /\.(pptx|ppt)$/i.test(fileName)
        );

        if (isSlide) {
          const cleanTitle = fileName.replace(/\.(pptx|ppt)$/i, "");
          let slideUrl = "";
          if (mimeType === MimeType.GOOGLE_SLIDES || mimeType === "application/vnd.google-apps.presentation") {
            slideUrl = "https://docs.google.com/presentation/d/" + fileId + "/preview";
          } else {
            slideUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
          }

          courses.push({
            id: "gdrive-crs-" + fileId,
            title: cleanTitle,
            category: categoryName,
            slideUrl: slideUrl,
            description: "Modul presentasi materi dari Google Drive folder " + categoryName + ".",
            estimatedHours: "45 Menit",
            status: "in-progress",
            updatedAt: updatedAt
          });
          continue;
        }

        // ==========================================
        // ATURAN 2: PDF dan EXCEL
        // -> Masuk ke Section SOP & Dokumen
        // ==========================================
        const isPdf = (
          mimeType === MimeType.PDF ||
          mimeType === "application/pdf" ||
          /\.pdf$/i.test(fileName)
        );

        const isExcel = (
          mimeType === MimeType.GOOGLE_SHEETS ||
          mimeType === "application/vnd.google-apps.spreadsheet" ||
          mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          mimeType === "application/vnd.ms-excel" ||
          /\.(xlsx|xls|csv)$/i.test(fileName)
        );

        if (isPdf || isExcel) {
          const cleanTitle = fileName.replace(/\.(pdf|xlsx|xls|csv)$/i, "");
          const format = isPdf ? "PDF" : (/\.csv$/i.test(fileName) ? "CSV" : "XLSX");

          let downloadUrl = "";
          let viewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";

          if (mimeType === MimeType.GOOGLE_SHEETS || mimeType === "application/vnd.google-apps.spreadsheet") {
            downloadUrl = "https://docs.google.com/spreadsheets/d/" + fileId + "/export?format=xlsx";
            viewUrl = "https://docs.google.com/spreadsheets/d/" + fileId + "/preview";
          } else {
            downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
          }

          docs.push({
            id: "gdrive-doc-" + fileId,
            title: cleanTitle,
            category: categoryName,
            format: format,
            size: sizeStr,
            updatedAt: updatedAt,
            downloadUrl: downloadUrl,
            viewUrl: viewUrl,
            gdriveFileId: fileId
          });
        }
      }

      // 2. Rekursif ke seluruh subfolder di dalam folder ini
      const subfolders = folder.getFolders();
      while (subfolders.hasNext()) {
        const sub = subfolders.next();
        processFolder(sub, sub.getName());
      }
    }

    // Mulai proses dari root folder
    processFolder(rootFolder, null);

    // Ambil data yang sudah ada di tabel Sheets
    const existingCourses = getTableData(SHEET_NAMES.COURSES) || [];
    const existingDocs = getTableData(SHEET_NAMES.DOCS) || [];

    // Gabungkan (Merge): update jika ada ID yang sama, atau tambahkan jika baru
    const courseMap = {};
    existingCourses.forEach(function(c) { if (c.id) courseMap[c.id] = c; });
    courses.forEach(function(c) { if (c.id) courseMap[c.id] = c; });
    const mergedCourses = Object.keys(courseMap).map(function(k) { return courseMap[k]; });

    const docMap = {};
    existingDocs.forEach(function(d) { if (d.id) docMap[d.id] = d; });
    docs.forEach(function(d) { if (d.id) docMap[d.id] = d; });
    const mergedDocs = Object.keys(docMap).map(function(k) { return docMap[k]; });

    // Simpan otomatis ke Google Sheets
    saveTableData(SHEET_NAMES.COURSES, mergedCourses);
    saveTableData(SHEET_NAMES.DOCS, mergedDocs);

    return {
      success: true,
      folderId: folderId,
      folderName: rootFolder.getName(),
      scannedCoursesCount: courses.length,
      scannedDocsCount: docs.length,
      totalCoursesCount: mergedCourses.length,
      totalDocsCount: mergedDocs.length,
      courses: courses,
      docs: docs,
      allCourses: mergedCourses,
      allDocs: mergedDocs,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Trigger otomatis periodik (misal jalan setiap 1 jam)
 */
function runAutoClassifyTrigger() {
  const result = autoClassifyDriveFolder("1N_zsTNDywwqscmYMXmgwuR3SFHTHsbxx");
  Logger.log("Hasil Auto-Classify: " + JSON.stringify(result));
}

/**
 * Jalankan fungsi ini 1x di editor Google Apps Script untuk menjadwalkan otomasi tiap 1 jam
 */
function installAutoClassifyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "runAutoClassifyTrigger") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger("runAutoClassifyTrigger")
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log("✓ Trigger otomatis Google Drive FMCU setiap 1 jam berhasil diaktifkan!");
}

/**
 * Jalankan fungsi ini di editor untuk menguji pemindaian & klasifikasi folder secara langsung
 */
function testAutoClassify() {
  const result = autoClassifyDriveFolder("1N_zsTNDywwqscmYMXmgwuR3SFHTHsbxx");
  Logger.log("Hasil Pemindaian Google Drive:");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

