const crypto = require('crypto');

function extractSheetInfo(input) {
  const raw = String(input || '').trim();
  if (!raw) {
    return { sheetId: '', gid: '' };
  }

  const idMatch = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = raw.match(/[?&#]gid=(\d+)/);

  if (idMatch) {
    return {
      sheetId: idMatch[1],
      gid: gidMatch ? gidMatch[1] : '',
    };
  }

  if (/^[a-zA-Z0-9-_]{20,}$/.test(raw)) {
    return { sheetId: raw, gid: '' };
  }

  return { sheetId: '', gid: '' };
}

function buildCsvExportUrl(sheetUrlOrId) {
  const { sheetId, gid } = extractSheetInfo(sheetUrlOrId);
  if (!sheetId) {
    throw new Error('Invalid Google Sheet URL or ID.');
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${
    gid ? `&gid=${gid}` : ''
  }`;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const input = String(text || '').replace(/^\uFEFF/, '');

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\r' && next === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
}

function mapSheetRows(csvText) {
  const matrix = parseCSV(csvText);
  if (matrix.length < 2) {
    return [];
  }

  const headers = matrix[0].map((h) => String(h).trim().toLowerCase());
  const findCol = (candidates) =>
    headers.findIndex((h) => candidates.some((c) => h === c || h.includes(c)));

  const idx = {
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

  const entries = [];
  for (let i = 1; i < matrix.length; i++) {
    const r = matrix[i];
    const get = (colIdx) => (colIdx >= 0 && colIdx < r.length ? String(r[colIdx] || '').trim() : '');

    const timestamp = get(idx.timestamp);
    const studentName = get(idx.studentName);
    const yearForm = get(idx.yearForm);
    const topic = get(idx.topic);
    const skillFocus = get(idx.skillFocus);
    const strengthsGaps = get(idx.strengthsGaps);
    const homework = get(idx.homework);
    const reportLanguage = get(idx.reportLanguage) || 'Bilingual';
    const tp = get(idx.tp) || 'TP3';

    if (!studentName && !topic && !strengthsGaps) {
      continue;
    }

    const fingerprint = `${timestamp}|${studentName}|${yearForm}|${topic}|${i}`;
    const id = 'sheet_' + crypto.createHash('sha1').update(fingerprint).digest('hex').slice(0, 12);

    entries.push({
      id,
      rowNumber: i + 1,
      source: 'sheet',
      timestamp,
      studentName,
      yearForm,
      topic,
      skillFocus,
      strengthsGaps,
      homework,
      reportLanguage,
      tp,
    });
  }

  // Newest rows first
  return entries.reverse();
}

module.exports = {
  extractSheetInfo,
  buildCsvExportUrl,
  parseCSV,
  mapSheetRows,
};
