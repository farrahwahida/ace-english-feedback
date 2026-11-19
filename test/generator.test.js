const test = require('node:test');
const assert = require('node:assert/strict');

const { extractSheetInfo, buildCsvExportUrl, mapSheetRows } = require('../src/csv-parser');
const { generateTemplateReport, sanitizeWhatsAppText } = require('../src/report-generator');
const { normalizeHomework, parseTP } = require('../src/tp-rubric');

const SAMPLE_CSV = `Timestamp,Student Name,Year/Form,Topic,Skill Focus Today,Strengths & Gaps,Homework,Report Language,TP
11/20/2026 0:39:50,aidil,Standard 6,Grammar,"Reading Comprehension, Grammar & Tenses",Good understanding,Present Tense,Bilingual,TP4
11/20/2026 0:58:01,marisa,Standard 1,Daily Routine,"Guided Writing, Speaking",good in speaking however lack vocabulary,n0,Bilingual,TP3`;

test('extractSheetInfo parses Google Sheet URL and builds CSV export URL', () => {
  const url =
    'https://docs.google.com/spreadsheets/d/1yGA39MI21udHHl4hEfN7_i7O5XNfA2hutUyUICntnoQ/edit?usp=sharing';
  const info = extractSheetInfo(url);
  assert.equal(info.sheetId, '1yGA39MI21udHHl4hEfN7_i7O5XNfA2hutUyUICntnoQ');
  assert.equal(
    buildCsvExportUrl(url),
    'https://docs.google.com/spreadsheets/d/1yGA39MI21udHHl4hEfN7_i7O5XNfA2hutUyUICntnoQ/export?format=csv'
  );
});

test('mapSheetRows parses Ace English CSV rows newest-first with quoted skills', () => {
  const rows = mapSheetRows(SAMPLE_CSV);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].studentName, 'marisa');
  assert.equal(rows[0].skillFocus, 'Guided Writing, Speaking');
  assert.equal(rows[0].tp, 'TP3');
  assert.equal(rows[1].studentName, 'aidil');
  assert.equal(rows[1].skillFocus, 'Reading Comprehension, Grammar & Tenses');
  assert.equal(rows[1].tp, 'TP4');
});

test('normalizeHomework handles n0/no/nil as null', () => {
  assert.equal(normalizeHomework('n0'), null);
  assert.equal(normalizeHomework('No'), null);
  assert.equal(normalizeHomework('nil'), null);
  assert.equal(normalizeHomework('Present Tense'), 'Present Tense');
});

test('parseTP resolves TP1-TP6 and defaults safely', () => {
  assert.equal(parseTP('TP4').code, 'TP4');
  assert.equal(parseTP('6').code, 'TP6');
  assert.equal(parseTP('').code, 'TP3');
});

test('generateTemplateReport builds Bilingual WhatsApp report for TP3 with n0 homework', () => {
  const rows = mapSheetRows(SAMPLE_CSV);
  const marisa = rows[0];
  const res = generateTemplateReport(marisa, { brandName: 'Ace English' });

  assert.equal(res.tpCode, 'TP3');
  assert.equal(res.language, 'Bilingual');
  assert.match(res.text, /\*Ace English — Class Progress Report/);
  assert.match(res.text, /Marisa \(Standard 1\)/);
  assert.match(res.text, /\*TP3 — Satisfactory \(Memuaskan\)\*/);
  assert.match(res.text, /Good in speaking however lack vocabulary\./);
  assert.match(res.text, /No homework today/);
  assert.doesNotMatch(res.text, /\*\*|n0/);
});

test('generateTemplateReport builds English and Bahasa Melayu reports accurately', () => {
  const rows = mapSheetRows(SAMPLE_CSV);
  const aidil = rows[1];

  const en = generateTemplateReport({ ...aidil, reportLanguage: 'English' }, { brandName: 'Ace English', tutorName: 'Teacher Farrah' });
  assert.equal(en.language, 'English');
  assert.match(en.text, /\*TP4 \(Good\)\*/);
  assert.match(en.text, /Present Tense/);
  assert.match(en.text, /— _Teacher Farrah, Ace English_/);

  const bm = generateTemplateReport({ ...aidil, reportLanguage: 'Bahasa Melayu' }, { brandName: 'Ace English' });
  assert.equal(bm.language, 'Bahasa Melayu');
  assert.match(bm.text, /Laporan Perkembangan Kelas/);
  assert.match(bm.text, /\*TP4 \(Baik\)\*/);
  assert.match(bm.text, /Pemahaman Bacaan, Tatabahasa & Tenses/);
});

test('sanitizeWhatsAppText converts markdown bold and headings to WhatsApp format', () => {
  const input = '## Heading\n**Bold text** and normal text';
  assert.equal(sanitizeWhatsAppText(input), 'Heading\n*Bold text* and normal text');
});
