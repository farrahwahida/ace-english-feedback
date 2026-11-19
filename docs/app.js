const state = {
  config: null,
  rubric: null,
  sheetEntries: [],
  manualEntries: [],
  selectedId: null,
  selectedEntry: null,
  activeLeftTab: 'sheet',
  activePreviewTab: 'wa',
  selectedSkills: new Set(),
  selectedTp: 'TP3',
};

const els = {
  headerBrandName: document.getElementById('headerBrandName'),
  syncStatusBadge: document.getElementById('syncStatusBadge'),
  btnSyncSheet: document.getElementById('btnSyncSheet'),
  btnGeneratePending: document.getElementById('btnGeneratePending'),
  btnRubric: document.getElementById('btnRubric'),
  btnSettings: document.getElementById('btnSettings'),

  sheetCountPill: document.getElementById('sheetCountPill'),
  searchInput: document.getElementById('searchInput'),
  tpFilter: document.getElementById('tpFilter'),
  statusFilter: document.getElementById('statusFilter'),
  sheetErrorBanner: document.getElementById('sheetErrorBanner'),
  entriesList: document.getElementById('entriesList'),
  manualEntriesList: document.getElementById('manualEntriesList'),

  quickEntryForm: document.getElementById('quickEntryForm'),
  qStudentName: document.getElementById('qStudentName'),
  qYearForm: document.getElementById('qYearForm'),
  qTopic: document.getElementById('qTopic'),
  qLanguage: document.getElementById('qLanguage'),
  skillChips: document.getElementById('skillChips'),
  qSkillCustom: document.getElementById('qSkillCustom'),
  tpSelector: document.getElementById('tpSelector'),
  qStrengthsGaps: document.getElementById('qStrengthsGaps'),
  qHomework: document.getElementById('qHomework'),
  btnNoHomework: document.getElementById('btnNoHomework'),
  btnQuickGenerate: document.getElementById('btnQuickGenerate'),

  previewEmpty: document.getElementById('previewEmpty'),
  previewActive: document.getElementById('previewActive'),
  pStudentTitle: document.getElementById('pStudentTitle'),
  pTpBadge: document.getElementById('pTpBadge'),
  pStatusBadge: document.getElementById('pStatusBadge'),
  pMetaSubtitle: document.getElementById('pMetaSubtitle'),
  pLanguageSelect: document.getElementById('pLanguageSelect'),
  pModeSelect: document.getElementById('pModeSelect'),
  btnGenerateOne: document.getElementById('btnGenerateOne'),
  pEngineBar: document.getElementById('pEngineBar'),
  pEngineText: document.getElementById('pEngineText'),
  pFallbackNote: document.getElementById('pFallbackNote'),

  tabBtnWa: document.getElementById('tabBtnWa'),
  tabBtnEdit: document.getElementById('tabBtnEdit'),
  waPreviewPane: document.getElementById('waPreviewPane'),
  waRenderedText: document.getElementById('waRenderedText'),
  editPane: document.getElementById('editPane'),
  reportEditor: document.getElementById('reportEditor'),
  btnSaveEdit: document.getElementById('btnSaveEdit'),

  parentPhoneInput: document.getElementById('parentPhoneInput'),
  btnCopyWa: document.getElementById('btnCopyWa'),
  btnOpenWa: document.getElementById('btnOpenWa'),
  btnMarkSent: document.getElementById('btnMarkSent'),

  settingsModal: document.getElementById('settingsModal'),
  settingsForm: document.getElementById('settingsForm'),
  cfgSheetUrl: document.getElementById('cfgSheetUrl'),
  cfgBrandName: document.getElementById('cfgBrandName'),
  cfgTutorName: document.getElementById('cfgTutorName'),
  cfgAccessKey: document.getElementById('cfgAccessKey'),
  cfgAiProvider: document.getElementById('cfgAiProvider'),
  geminiFields: document.getElementById('geminiFields'),
  cfgGeminiKey: document.getElementById('cfgGeminiKey'),
  cfgGeminiModel: document.getElementById('cfgGeminiModel'),
  openaiFields: document.getElementById('openaiFields'),
  cfgOpenaiKey: document.getElementById('cfgOpenaiKey'),
  cfgOpenaiModel: document.getElementById('cfgOpenaiModel'),
  cfgOpenaiBaseUrl: document.getElementById('cfgOpenaiBaseUrl'),
  cfgAutoGen: document.getElementById('cfgAutoGen'),

  rubricModal: document.getElementById('rubricModal'),
  rubricBody: document.getElementById('rubricBody'),
  toast: document.getElementById('toast'),
};

/* GitHub Pages static mode: Google Sheet access goes through the Apps Script Web App via JSONP */
const IS_STATIC =
  /(^|\.)github\.io$/i.test(location.hostname) || /[?&]static=1/.test(location.search);
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwLTA-bzKVPFFof5X-mwMcX9Txt1HkpKW01Da3Dcveh6KTFqlTPblOl5Hl1wnpciAI0/exec';
const LOCAL_CONFIG_KEY = 'aceEnglishFeedbackConfig';
const ACCESS_KEY_STORAGE = 'aceEnglishAccessKey';

function staticConfig() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(LOCAL_CONFIG_KEY) || '{}') || {};
  } catch {
    saved = {};
  }
  return {
    sheetUrl: saved.sheetUrl || '',
    brandName: saved.brandName || 'Ace English',
    tutorName: saved.tutorName || '',
    accessKey: localStorage.getItem(ACCESS_KEY_STORAGE) || '',
    aiProvider: 'none',
    hasGeminiKey: false,
    geminiApiKeyMasked: '',
    geminiModel: 'gemini-2.5-flash',
    hasOpenaiKey: false,
    openaiApiKeyMasked: '',
    openaiBaseUrl: 'https://api.openai.com/v1',
    openaiModel: 'gpt-4o-mini',
    autoGenerateOnSync: false,
  };
}

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    const cbName = 'aceCb_' + Math.random().toString(36).slice(2);
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('callback', cbName);
    url.searchParams.set('key', localStorage.getItem(ACCESS_KEY_STORAGE) || '');
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.set(key, params[key]);
      }
    });
    const script = document.createElement('script');
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Google Sheet backend timed out. Please try again.'));
    }, 25000);
    function cleanup() {
      clearTimeout(timer);
      delete window[cbName];
      script.remove();
    }
    window[cbName] = (data) => {
      cleanup();
      if (data && data.error) reject(new Error(data.error));
      else resolve(data || {});
    };
    script.onerror = () => {
      cleanup();
      reject(new Error('Cannot reach the Google Sheet backend.'));
    };
    script.src = url.toString();
    document.head.appendChild(script);
  });
}

function staticSaveReport(entry, text, engine, language, status) {
  return jsonp('saveReport', {
    id: entry.id,
    studentName: capitalizeName(entry.studentName),
    text,
    engine,
    language,
    status: status || 'ready',
    entryJson: JSON.stringify(entry),
  });
}

async function staticApi(url, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  if (url === '/api/config') {
    if (method === 'POST') {
      const next = staticConfig();
      ['brandName', 'tutorName', 'sheetUrl'].forEach((k) => {
        if (body[k] !== undefined) next[k] = body[k];
      });
      if (body.accessKey !== undefined) {
        localStorage.setItem(ACCESS_KEY_STORAGE, String(body.accessKey).trim());
        next.accessKey = String(body.accessKey).trim();
      }
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(next));
      return { config: next };
    }
    return { config: staticConfig() };
  }

  if (url === '/api/rubric') {
    return { rubric: window.TPEngine.TP_RUBRIC };
  }

  if (url === '/api/sheet') {
    const data = await jsonp('getData');
    if (data.error) throw new Error(data.error);
    return { entries: data.entries || [], syncedAt: data.syncedAt, autoGeneratedCount: 0 };
  }

  if (url === '/api/reports' && method === 'GET') {
    const data = await jsonp('getData');
    return { entries: data.manual || [] };
  }

  if (url === '/api/generate') {
    const entry = body.entry;
    const result = window.TPEngine.generateTemplateReport(entry, staticConfig());
    await staticSaveReport(entry, result.text, result.engine, result.language, 'ready');
    return {
      entry: {
        ...entry,
        report: {
          text: result.text,
          engine: result.engine,
          status: 'ready',
          language: result.language,
          fallbackReason: null,
          updatedAt: new Date().toISOString(),
        },
      },
    };
  }

  if (url === '/api/generate-pending') {
    const generated = [];
    for (const entry of body.entries || []) {
      const result = window.TPEngine.generateTemplateReport(entry, staticConfig());
      await staticSaveReport(entry, result.text, result.engine, result.language, 'ready');
      generated.push({
        ...entry,
        report: {
          text: result.text,
          engine: result.engine,
          status: 'ready',
          language: result.language,
          fallbackReason: null,
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return { count: generated.length, generated };
  }

  if (url.startsWith('/api/reports/')) {
    const id = decodeURIComponent(url.slice('/api/reports/'.length));
    if (method === 'DELETE') {
      await jsonp('deleteReport', { id });
      return { deleted: true };
    }
    if (method === 'POST') {
      const entry = body.entry || { id };
      await staticSaveReport(entry, body.text || '', body.engine || 'edited', body.language || 'Bilingual', body.status || 'ready');
      return {
        report: {
          id,
          text: body.text || '',
          engine: body.engine || 'edited',
          status: body.status || 'ready',
          updatedAt: new Date().toISOString(),
        },
      };
    }
  }

  throw new Error('Unknown action: ' + url);
}

async function api(url, options = {}) {
  if (IS_STATIC) {
    return staticApi(url, options);
  }
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    els.toast.classList.add('hidden');
  }, 2800);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatWhatsAppHtml(text) {
  let html = escapeHtml(text);
  // WhatsApp *bold* and _italic_
  html = html.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|\s)_([^_\n]+)_/g, '$1<em>$2</em>');
  return html;
}

function normalizeTpNum(tp) {
  const match = String(tp || '').match(/([1-6])/);
  return match ? match[1] : '3';
}

function capitalizeName(name) {
  return String(name || 'Student')
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function getAllEntries() {
  return [...state.sheetEntries, ...state.manualEntries];
}

function findEntryById(id) {
  return getAllEntries().find((e) => e.id === id) || null;
}

function upsertEntry(updated) {
  if (updated.source === 'sheet') {
    const idx = state.sheetEntries.findIndex((e) => e.id === updated.id);
    if (idx >= 0) state.sheetEntries[idx] = updated;
    else state.sheetEntries.unshift(updated);
  } else {
    const idx = state.manualEntries.findIndex((e) => e.id === updated.id);
    if (idx >= 0) state.manualEntries[idx] = updated;
    else state.manualEntries.unshift(updated);
  }
}

function renderEntryCard(entry) {
  const tpNum = normalizeTpNum(entry.tp);
  const status = entry.report ? entry.report.status || 'ready' : 'pending';
  const statusLabel =
    status === 'sent' ? 'Sent ✓' : status === 'ready' ? 'Ready' : 'Needs Report';
  const skills = String(entry.skillFocus || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const selectedClass = state.selectedId === entry.id ? 'selected' : '';
  return `
    <div class="entry-card ${selectedClass}" data-entry-id="${escapeHtml(entry.id)}">
      <div class="entry-top">
        <span class="entry-name">${escapeHtml(capitalizeName(entry.studentName))}</span>
        <div class="entry-badges">
          <span class="tp-badge tp-${tpNum}">TP${tpNum}</span>
          <span class="status-badge ${status}">${statusLabel}</span>
        </div>
      </div>
      <div class="entry-sub">
        ${escapeHtml(entry.yearForm || 'Class')} · ${escapeHtml(entry.topic || 'General')} · ${escapeHtml(
          (entry.timestamp || '').split(' ')[0] || 'Today'
        )}
      </div>
      <div class="entry-notes">${escapeHtml(entry.strengthsGaps || 'No notes provided')}</div>
      <div class="entry-skills">
        ${skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>
  `;
}

function renderSheetList() {
  const q = els.searchInput.value.trim().toLowerCase();
  const tpFilter = els.tpFilter.value;
  const statusFilter = els.statusFilter.value;

  const filtered = state.sheetEntries.filter((entry) => {
    const status = entry.report ? entry.report.status || 'ready' : 'pending';
    if (tpFilter !== 'ALL' && `TP${normalizeTpNum(entry.tp)}` !== tpFilter) return false;
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;
    if (q) {
      const hay = `${entry.studentName} ${entry.topic} ${entry.yearForm} ${entry.strengthsGaps} ${entry.skillFocus}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  els.sheetCountPill.textContent = String(state.sheetEntries.length);

  if (filtered.length === 0) {
    els.entriesList.innerHTML = `<div class="empty-state"><p>No matching class entries found.</p></div>`;
  } else {
    els.entriesList.innerHTML = filtered.map(renderEntryCard).join('');
  }

  const pendingCount = state.sheetEntries.filter((e) => !e.report).length;
  els.btnGeneratePending.textContent =
    pendingCount > 0 ? `Auto-Generate Pending (${pendingCount})` : 'All Reports Ready ✓';
  els.btnGeneratePending.disabled = pendingCount === 0;
}

function renderManualList() {
  if (state.manualEntries.length === 0) {
    els.manualEntriesList.innerHTML = `<div class="empty-state"><p>No quick entries yet.</p></div>`;
    return;
  }
  els.manualEntriesList.innerHTML = state.manualEntries.map(renderEntryCard).join('');
}

function renderPreview() {
  const entry = state.selectedId ? findEntryById(state.selectedId) : null;
  state.selectedEntry = entry;

  if (!entry) {
    els.previewEmpty.classList.remove('hidden');
    els.previewActive.classList.add('hidden');
    return;
  }

  els.previewEmpty.classList.add('hidden');
  els.previewActive.classList.remove('hidden');

  const tpNum = normalizeTpNum(entry.tp);
  const status = entry.report ? entry.report.status || 'ready' : 'pending';

  els.pStudentTitle.textContent = capitalizeName(entry.studentName);
  els.pTpBadge.textContent = `TP${tpNum}`;
  els.pTpBadge.className = `tp-badge tp-${tpNum}`;

  els.pStatusBadge.textContent =
    status === 'sent' ? 'Sent ✓' : status === 'ready' ? 'Ready' : 'Not Generated';
  els.pStatusBadge.className = `status-badge ${status}`;

  els.pMetaSubtitle.textContent = [
    entry.yearForm || 'Student',
    entry.topic || 'English Lesson',
    entry.skillFocus || null,
    entry.homework ? `HW: ${entry.homework}` : 'No homework',
  ]
    .filter(Boolean)
    .join(' · ');

  const lang = (entry.report && entry.report.language) || entry.reportLanguage || 'Bilingual';
  els.pLanguageSelect.value = ['English', 'Bahasa Melayu', 'Bilingual'].includes(lang)
    ? lang
    : 'Bilingual';

  if (entry.report && entry.report.text) {
    els.pEngineBar.classList.remove('hidden');
    els.pEngineText.textContent = entry.report.engine.startsWith('ai:')
      ? `Generated with ${entry.report.engine}`
      : entry.report.engine === 'edited'
      ? 'Custom edited report'
      : 'Generated with Built-in TP1–TP6 Template Engine';

    if (entry.report.fallbackReason) {
      els.pFallbackNote.textContent = `AI fallback: ${entry.report.fallbackReason}`;
      els.pFallbackNote.classList.remove('hidden');
    } else {
      els.pFallbackNote.classList.add('hidden');
    }

    els.waRenderedText.innerHTML = formatWhatsAppHtml(entry.report.text);
    els.reportEditor.value = entry.report.text;
    els.btnGenerateOne.textContent = 'Regenerate';
    els.btnCopyWa.disabled = false;
    els.btnOpenWa.disabled = false;
    els.btnMarkSent.disabled = false;
    els.btnMarkSent.textContent = status === 'sent' ? 'Sent ✓ (Undo)' : 'Mark as Sent';
  } else {
    els.pEngineBar.classList.add('hidden');
    els.waRenderedText.innerHTML =
      '<em>No report generated yet for this class entry. Click <strong>Generate</strong> above!</em>';
    els.reportEditor.value = '';
    els.btnGenerateOne.textContent = 'Generate Report';
    els.btnCopyWa.disabled = true;
    els.btnOpenWa.disabled = true;
    els.btnMarkSent.disabled = true;
  }
}

async function selectEntry(id, autoGenerateIfMissing = true) {
  state.selectedId = id;
  renderSheetList();
  renderManualList();
  renderPreview();

  const entry = findEntryById(id);
  if (entry && !entry.report && autoGenerateIfMissing) {
    await generateForSelected();
  }
}

async function generateForSelected() {
  const entry = state.selectedEntry;
  if (!entry) return;

  els.btnGenerateOne.disabled = true;
  els.btnGenerateOne.textContent = 'Generating...';

  try {
    const data = await api('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        entry,
        mode: els.pModeSelect.value,
        languageOverride: els.pLanguageSelect.value,
      }),
    });
    upsertEntry(data.entry);
    renderSheetList();
    renderManualList();
    renderPreview();
    showToast('Parent feedback report generated!');
  } catch (err) {
    showToast(`Error: ${err.message}`);
  } finally {
    els.btnGenerateOne.disabled = false;
  }
}

async function syncSheet() {
  els.btnSyncSheet.disabled = true;
  els.btnSyncSheet.textContent = 'Syncing...';
  els.sheetErrorBanner.classList.add('hidden');

  try {
    const data = await api('/api/sheet');
    state.sheetEntries = data.entries || [];
    const timeStr = new Date(data.syncedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    els.syncStatusBadge.textContent = `Synced at ${timeStr} (${state.sheetEntries.length} rows)`;

    if (!state.selectedId && state.sheetEntries.length > 0) {
      state.selectedId = state.sheetEntries[0].id;
    }

    renderSheetList();
    renderPreview();

    if (data.autoGeneratedCount > 0) {
      showToast(`Synced & auto-generated ${data.autoGeneratedCount} new report(s)!`);
    }
  } catch (err) {
    els.sheetErrorBanner.textContent = err.message;
    els.sheetErrorBanner.classList.remove('hidden');
    els.syncStatusBadge.textContent = 'Sync failed';
  } finally {
    els.btnSyncSheet.disabled = false;
    els.btnSyncSheet.textContent = 'Sync Sheet';
  }
}

async function generatePending() {
  const pending = state.sheetEntries.filter((e) => !e.report);
  if (pending.length === 0) return;

  els.btnGeneratePending.disabled = true;
  els.btnGeneratePending.textContent = `Generating ${pending.length}...`;

  try {
    const data = await api('/api/generate-pending', {
      method: 'POST',
      body: JSON.stringify({ entries: pending, mode: 'auto' }),
    });
    for (const item of data.generated || []) {
      upsertEntry(item);
    }
    renderSheetList();
    renderPreview();
    showToast(`Generated ${data.count} report(s)!`);
  } catch (err) {
    showToast(`Error: ${err.message}`);
  } finally {
    renderSheetList();
  }
}

async function loadManualReports() {
  try {
    const data = await api('/api/reports');
    state.manualEntries = data.entries || [];
    renderManualList();
  } catch {
    // ignore
  }
}

async function loadConfigAndRubric() {
  const [cfgRes, rubRes] = await Promise.all([api('/api/config'), api('/api/rubric')]);
  state.config = cfgRes.config;
  state.rubric = rubRes.rubric;

  els.headerBrandName.textContent = state.config.brandName || 'Ace English';
  populateSettingsModal(state.config);
  renderRubricModal(state.rubric);
}

function populateSettingsModal(cfg) {
  els.cfgSheetUrl.value = cfg.sheetUrl || '';
  els.cfgBrandName.value = cfg.brandName || 'Ace English';
  els.cfgTutorName.value = cfg.tutorName || '';
  if (els.cfgAccessKey) els.cfgAccessKey.value = cfg.accessKey || '';
  els.cfgAiProvider.value = cfg.aiProvider || 'none';
  els.cfgGeminiKey.value = cfg.geminiApiKeyMasked || '';
  els.cfgGeminiModel.value = cfg.geminiModel || 'gemini-2.5-flash';
  els.cfgOpenaiKey.value = cfg.openaiApiKeyMasked || '';
  els.cfgOpenaiModel.value = cfg.openaiModel || 'gpt-4o-mini';
  els.cfgOpenaiBaseUrl.value = cfg.openaiBaseUrl || 'https://api.openai.com/v1';
  els.cfgAutoGen.checked = Boolean(cfg.autoGenerateOnSync);
  toggleProviderFields();
}

function toggleProviderFields() {
  const provider = els.cfgAiProvider.value;
  els.geminiFields.classList.toggle('hidden', provider !== 'gemini');
  els.openaiFields.classList.toggle('hidden', provider !== 'openai');
}

function renderRubricModal(rubric) {
  const items = Object.values(rubric || {});
  els.rubricBody.innerHTML = items
    .map(
      (tp) => `
      <div class="rubric-item">
        <div class="rubric-item-head">
          <span class="tp-badge tp-${tp.level}">${tp.code}</span>
          <strong>${escapeHtml(tp.labelEn)} / ${escapeHtml(tp.labelBm)}</strong>
        </div>
        <p><strong>EN:</strong> Student ${escapeHtml(tp.descriptorEn)} ${escapeHtml(tp.nextStepEn)}</p>
        <p><strong>BM:</strong> Pelajar ${escapeHtml(tp.descriptorBm)} ${escapeHtml(tp.nextStepBm)}</p>
        <p><strong>Home Tip:</strong> ${escapeHtml(tp.homeTipEn)}</p>
      </div>
    `
    )
    .join('');
}

function setupEventListeners() {
  // Left tabs
  document.querySelectorAll('[data-left-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-left-tab');
      state.activeLeftTab = target;
      document.querySelectorAll('[data-left-tab]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tabSheet').classList.toggle('active', target === 'sheet');
      document.getElementById('tabQuick').classList.toggle('active', target === 'quick');
    });
  });

  // Preview tabs
  els.tabBtnWa.addEventListener('click', () => {
    els.tabBtnWa.classList.add('active');
    els.tabBtnEdit.classList.remove('active');
    els.waPreviewPane.classList.remove('hidden');
    els.editPane.classList.add('hidden');
  });

  els.tabBtnEdit.addEventListener('click', () => {
    els.tabBtnEdit.classList.add('active');
    els.tabBtnWa.classList.remove('active');
    els.editPane.classList.remove('hidden');
    els.waPreviewPane.classList.add('hidden');
  });

  // Entry list clicks (delegated)
  [els.entriesList, els.manualEntriesList].forEach((container) => {
    container.addEventListener('click', (e) => {
      const card = e.target.closest('[data-entry-id]');
      if (!card) return;
      selectEntry(card.getAttribute('data-entry-id'), true);
    });
  });

  // Filters
  els.searchInput.addEventListener('input', renderSheetList);
  els.tpFilter.addEventListener('change', renderSheetList);
  els.statusFilter.addEventListener('change', renderSheetList);

  // Topbar actions
  els.btnSyncSheet.addEventListener('click', syncSheet);
  els.btnGeneratePending.addEventListener('click', generatePending);
  els.btnRubric.addEventListener('click', () => els.rubricModal.classList.remove('hidden'));
  els.btnSettings.addEventListener('click', () => els.settingsModal.classList.remove('hidden'));

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      document.getElementById(el.getAttribute('data-close-modal')).classList.add('hidden');
    });
  });

  // Quick form skill chips & TP selector
  els.skillChips.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-skill]');
    if (!chip) return;
    const skill = chip.getAttribute('data-skill');
    if (state.selectedSkills.has(skill)) {
      state.selectedSkills.delete(skill);
      chip.classList.remove('active');
    } else {
      state.selectedSkills.add(skill);
      chip.classList.add('active');
    }
  });

  els.tpSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tp]');
    if (!btn) return;
    state.selectedTp = btn.getAttribute('data-tp');
    els.tpSelector.querySelectorAll('.tp-choice').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });

  els.btnNoHomework.addEventListener('click', () => {
    els.qHomework.value = 'No homework';
  });

  els.quickEntryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const customSkills = els.qSkillCustom.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allSkills = [...state.selectedSkills, ...customSkills];

    els.btnQuickGenerate.disabled = true;
    els.btnQuickGenerate.textContent = 'Generating...';

    try {
      const payload = {
        entry: {
          source: 'manual',
          timestamp: new Date().toLocaleString('en-US'),
          studentName: els.qStudentName.value.trim(),
          yearForm: els.qYearForm.value.trim(),
          topic: els.qTopic.value.trim(),
          skillFocus: allSkills.join(', '),
          strengthsGaps: els.qStrengthsGaps.value.trim(),
          homework: els.qHomework.value.trim(),
          reportLanguage: els.qLanguage.value,
          tp: state.selectedTp,
        },
        mode: 'auto',
      };

      const data = await api('/api/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      upsertEntry(data.entry);
      state.selectedId = data.entry.id;
      renderManualList();
      renderPreview();
      showToast('Report generated from quick entry!');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      els.btnQuickGenerate.disabled = false;
      els.btnQuickGenerate.textContent = 'Generate Parent Feedback Report';
    }
  });

  // Preview actions
  els.btnGenerateOne.addEventListener('click', generateForSelected);
  els.pLanguageSelect.addEventListener('change', () => {
    if (state.selectedEntry) generateForSelected();
  });

  els.btnSaveEdit.addEventListener('click', async () => {
    const entry = state.selectedEntry;
    if (!entry) return;
    const text = els.reportEditor.value.trim();
    if (!text) return;

    try {
      const data = await api(`/api/reports/${encodeURIComponent(entry.id)}`, {
        method: 'POST',
        body: JSON.stringify({ text, entry, status: entry.report?.status || 'ready' }),
      });
      entry.report = {
        ...(entry.report || {}),
        text: data.report.text,
        engine: 'edited',
        status: data.report.status,
        updatedAt: data.report.updatedAt,
      };
      upsertEntry(entry);
      renderSheetList();
      renderManualList();
      renderPreview();
      els.tabBtnWa.click();
      showToast('Saved manual edits!');
    } catch (err) {
      showToast(`Save failed: ${err.message}`);
    }
  });

  els.btnCopyWa.addEventListener('click', async () => {
    const text = state.selectedEntry?.report?.text;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied WhatsApp report to clipboard!');
    } catch {
      els.tabBtnEdit.click();
      els.reportEditor.select();
      document.execCommand('copy');
      showToast('Copied WhatsApp report!');
    }
  });

  els.btnOpenWa.addEventListener('click', () => {
    const text = state.selectedEntry?.report?.text;
    if (!text) return;
    const digits = els.parentPhoneInput.value.replace(/\D/g, '');
    const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
    window.open(`${base}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  els.btnMarkSent.addEventListener('click', async () => {
    const entry = state.selectedEntry;
    if (!entry || !entry.report) return;
    const nextStatus = entry.report.status === 'sent' ? 'ready' : 'sent';
    try {
      await api(`/api/reports/${encodeURIComponent(entry.id)}`, {
        method: 'POST',
        body: JSON.stringify({ status: nextStatus }),
      });
      entry.report.status = nextStatus;
      upsertEntry(entry);
      renderSheetList();
      renderManualList();
      renderPreview();
      showToast(nextStatus === 'sent' ? 'Marked as Sent ✓' : 'Marked as Ready');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  });

  // Settings modal
  els.cfgAiProvider.addEventListener('change', toggleProviderFields);
  els.settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/config', {
        method: 'POST',
        body: JSON.stringify({
          sheetUrl: els.cfgSheetUrl.value.trim(),
          brandName: els.cfgBrandName.value.trim() || 'Ace English',
          tutorName: els.cfgTutorName.value.trim(),
          accessKey: els.cfgAccessKey ? els.cfgAccessKey.value.trim() : '',
          aiProvider: els.cfgAiProvider.value,
          geminiApiKey: els.cfgGeminiKey.value.trim(),
          geminiModel: els.cfgGeminiModel.value.trim() || 'gemini-2.5-flash',
          openaiApiKey: els.cfgOpenaiKey.value.trim(),
          openaiModel: els.cfgOpenaiModel.value.trim() || 'gpt-4o-mini',
          openaiBaseUrl: els.cfgOpenaiBaseUrl.value.trim() || 'https://api.openai.com/v1',
          autoGenerateOnSync: els.cfgAutoGen.checked,
        }),
      });
      state.config = data.config;
      els.headerBrandName.textContent = state.config.brandName || 'Ace English';
      els.settingsModal.classList.add('hidden');
      showToast('Settings saved! Re-syncing Google Sheet...');
      await syncSheet();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  });
}

async function init() {
  setupEventListeners();
  if (IS_STATIC && !localStorage.getItem(ACCESS_KEY_STORAGE)) {
    const entered = prompt('Ace English Feedback Studio — Dashboard Access Key', '');
    if (entered && entered.trim()) {
      localStorage.setItem(ACCESS_KEY_STORAGE, entered.trim());
    } else {
      els.syncStatusBadge.textContent = 'Access key required';
      els.sheetErrorBanner.textContent = 'Please enter the dashboard access key to load your Google Sheet.';
      els.sheetErrorBanner.classList.remove('hidden');
      return;
    }
  }
  await loadConfigAndRubric();
  await Promise.all([syncSheet(), loadManualReports()]);
}

init();
