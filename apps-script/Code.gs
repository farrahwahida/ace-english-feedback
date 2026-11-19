/**
 * Ace English — Parent Feedback Studio
 * Google Apps Script Web App backend for the GitHub Pages static dashboard.
 *
 * Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
 *         Execute as: Me · Who has access: Anyone
 */

const SHEET_ID = '1yGA39MI21udHHl4hEfN7_i7O5XNfA2hutUyUICntnoQ';
const REPORT_SHEET = 'FeedbackReports';
// Only the live dashboard knows this key. Keep it out of the public repo.
const ACCESS_KEY = 'ace-fb-ee1dd37f112100a291ab67e1';
const REPORT_HEADERS = [
  'ID',
  'Student',
  'Report Text',
  'Status',
  'Engine',
  'Language',
  'Updated At',
  'Entry JSON',
];

function respond_(obj, callback) {
  const json = JSON.stringify(obj);
  const text = callback ? callback + '(' + json + ');' : json;
  return ContentService.createTextOutput(text).setMimeType(
    ContentService.MimeType.JAVASCRIPT
  );
}

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  const callback = /^[A-Za-z0-9_$.]+$/.test(p.callback || '') ? p.callback : '';
  if (String(p.key || '') !== ACCESS_KEY) {
    return respond_({ error: 'Invalid access key' }, callback);
  }
  try {
    let data;
    switch (p.action) {
      case 'ping':
        data = { ok: true, service: 'Ace English Feedback Web App' };
        break;
      case 'getData':
        data = getData_();
        break;
      case 'saveReport':
        data = saveReport_(p);
        break;
      case 'deleteReport':
        data = deleteReport_(p);
        break;
      default:
        data = { error: 'Unknown action: ' + (p.action || '') };
    }
    return respond_(data, callback);
  } catch (err) {
    return respond_({ error: err.message || String(err) }, callback);
  }
}

function getReportSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(REPORT_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(REPORT_SHEET);
    sheet.getRange(1, 1, 1, REPORT_HEADERS.length).setValues([REPORT_HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getReportMap_() {
  const sheet = getReportSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return {};
  const rows = sheet.getRange(2, 1, last - 1, REPORT_HEADERS.length).getValues();
  const map = {};
  rows.forEach(function (r) {
    const id = String(r[0] || '').trim();
    if (!id) return;
    let entry = null;
    try {
      entry = r[7] ? JSON.parse(r[7]) : null;
    } catch (err) {
      entry = null;
    }
    map[id] = {
      id: id,
      text: String(r[2] || ''),
      status: String(r[3] || 'ready'),
      engine: String(r[4] || ''),
      language: String(r[5] || ''),
      updatedAt: String(r[6] || ''),
      entry: entry,
    };
  });
  return map;
}

function getData_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheets()[0];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return { entries: [], syncedAt: new Date().toISOString() };

  const headers = values[0].map(function (h) {
    return String(h).trim().toLowerCase();
  });
  function findCol(names) {
    return headers.findIndex(function (h) {
      return names.some(function (n) {
        return h === n || h.indexOf(n) !== -1;
      });
    });
  }
  const cols = {
    timestamp: findCol(['timestamp', 'date', 'tarikh']),
    studentName: findCol(['student name', 'student', 'nama']),
    yearForm: findCol(['year/form', 'year', 'form', 'darjah', 'tingkatan']),
    topic: findCol(['topic', 'topik']),
    skillFocus: findCol(['skill focus', 'skills', 'kemahiran']),
    strengthsGaps: findCol(['strengths & gaps', 'strengths', 'notes', 'points', 'catatan']),
    homework: findCol(['homework', 'kerja rumah']),
    reportLanguage: findCol(['report language', 'language', 'bahasa']),
    tp: findCol(['tp', 'tahap penguasaan', 'level']),
  };
  function get(r, i) {
    return i >= 0 && i < r.length ? String(r[i] || '').trim() : '';
  }

  const reports = getReportMap_();
  const entries = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const studentName = get(row, cols.studentName);
    const topic = get(row, cols.topic);
    const strengthsGaps = get(row, cols.strengthsGaps);
    if (!studentName && !topic && !strengthsGaps) continue;

    const fingerprint = [
      get(row, cols.timestamp),
      studentName,
      get(row, cols.yearForm),
      topic,
      i + 1,
    ].join('|');
    // Deterministic 12-char id so saved reports survive re-ordering
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, fingerprint);
    const hex = bytes
      .map(function (b) {
        return ('0' + (b & 0xff).toString(16)).slice(-2);
      })
      .join('');
    const stableId = 'sheet_' + hex.slice(0, 12);

    const entry = {
      id: stableId,
      rowNumber: i + 1,
      source: 'sheet',
      timestamp: get(row, cols.timestamp),
      studentName: studentName,
      yearForm: get(row, cols.yearForm),
      topic: topic,
      skillFocus: get(row, cols.skillFocus),
      strengthsGaps: strengthsGaps,
      homework: get(row, cols.homework),
      reportLanguage: get(row, cols.reportLanguage) || 'Bilingual',
      tp: get(row, cols.tp) || 'TP3',
    };
    if (reports[stableId]) {
      entry.report = {
        text: reports[stableId].text,
        status: reports[stableId].status,
        engine: reports[stableId].engine,
        language: reports[stableId].language,
        updatedAt: reports[stableId].updatedAt,
      };
    }
    entries.push(entry);
  }

  const manual = [];
  Object.keys(reports).forEach(function (rid) {
    const rep = reports[rid];
    if (rep.entry && rep.entry.source === 'manual') {
      manual.push(
        Object.assign({}, rep.entry, {
          id: rid,
          report: {
            text: rep.text,
            status: rep.status,
            engine: rep.engine,
            language: rep.language,
            updatedAt: rep.updatedAt,
          },
        })
      );
    }
  });

  return {
    entries: entries.reverse(),
    manual: manual,
    syncedAt: new Date().toISOString(),
  };
}

function saveReport_(p) {
  const id = String(p.id || '').trim();
  if (!id) return { error: 'Missing report id' };

  const sheet = getReportSheet_();
  const last = sheet.getLastRow();
  let row = 0;
  if (last >= 2) {
    const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0] || '').trim() === id) {
        row = i + 2;
        break;
      }
    }
  }
  const existing = row ? sheet.getRange(row, 1, 1, 8).getValues()[0] : [];
  const now = new Date().toISOString();
  const values = [
    [id, String(p.studentName || existing[1] || ''), String(p.text || ''), String(p.status || 'ready'),
     String(p.engine || ''), String(p.language || existing[5] || ''), now,
     String(p.entryJson || existing[7] || '')]
  ];
  if (row) {
    sheet.getRange(row, 1, 1, 8).setValues(values);
  } else {
    sheet.appendRow(values[0]);
  }
  return {
    report: {
      id: id,
      text: values[0][2],
      status: values[0][3],
      engine: values[0][4],
      language: values[0][5],
      updatedAt: now,
    },
  };
}

function deleteReport_(p) {
  const id = String(p.id || '').trim();
  const sheet = getReportSheet_();
  const last = sheet.getLastRow();
  if (last >= 2) {
    const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) {
      if (String(ids[i][0] || '').trim() === id) {
        sheet.deleteRow(i + 2);
        break;
      }
    }
  }
  return { deleted: true };
}
