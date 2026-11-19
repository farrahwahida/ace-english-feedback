const fs = require('fs');
const path = require('path');

const DEFAULT_SHEET_URL =
  process.env.GOOGLE_SHEET_URL ||
  'https://docs.google.com/spreadsheets/d/1yGA39MI21udHHl4hEfN7_i7O5XNfA2hutUyUICntnoQ/edit?usp=sharing';

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const REPORTS_PATH = path.join(DATA_DIR, 'reports.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getConfig() {
  const saved = readJson(CONFIG_PATH, {});
  return {
    sheetUrl: saved.sheetUrl || DEFAULT_SHEET_URL,
    brandName: saved.brandName || 'Ace English',
    tutorName: saved.tutorName || '',
    aiProvider: saved.aiProvider || (process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'none'),
    geminiApiKey: saved.geminiApiKey !== undefined ? saved.geminiApiKey : process.env.GEMINI_API_KEY || '',
    geminiModel: saved.geminiModel || 'gemini-2.5-flash',
    openaiApiKey: saved.openaiApiKey !== undefined ? saved.openaiApiKey : process.env.OPENAI_API_KEY || '',
    openaiBaseUrl: saved.openaiBaseUrl || 'https://api.openai.com/v1',
    openaiModel: saved.openaiModel || 'gpt-4o-mini',
    autoGenerateOnSync: Boolean(saved.autoGenerateOnSync),
  };
}

function getPublicConfig() {
  const cfg = getConfig();
  return {
    sheetUrl: cfg.sheetUrl,
    brandName: cfg.brandName,
    tutorName: cfg.tutorName,
    aiProvider: cfg.aiProvider,
    hasGeminiKey: Boolean(cfg.geminiApiKey),
    geminiApiKeyMasked: cfg.geminiApiKey ? maskKey(cfg.geminiApiKey) : '',
    geminiModel: cfg.geminiModel,
    hasOpenaiKey: Boolean(cfg.openaiApiKey),
    openaiApiKeyMasked: cfg.openaiApiKey ? maskKey(cfg.openaiApiKey) : '',
    openaiBaseUrl: cfg.openaiBaseUrl,
    openaiModel: cfg.openaiModel,
    autoGenerateOnSync: cfg.autoGenerateOnSync,
  };
}

function maskKey(key) {
  if (!key || key.length < 8) return '••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

function saveConfig(patch) {
  const current = readJson(CONFIG_PATH, {});
  const next = { ...current };

  const allowed = [
    'sheetUrl',
    'brandName',
    'tutorName',
    'aiProvider',
    'geminiModel',
    'openaiBaseUrl',
    'openaiModel',
    'autoGenerateOnSync',
  ];

  for (const field of allowed) {
    if (patch[field] !== undefined) {
      next[field] = patch[field];
    }
  }

  if (patch.geminiApiKey !== undefined && !String(patch.geminiApiKey).includes('••••')) {
    next.geminiApiKey = String(patch.geminiApiKey).trim();
  }
  if (patch.openaiApiKey !== undefined && !String(patch.openaiApiKey).includes('••••')) {
    next.openaiApiKey = String(patch.openaiApiKey).trim();
  }

  writeJson(CONFIG_PATH, next);
  return getPublicConfig();
}

function getReportsMap() {
  return readJson(REPORTS_PATH, {});
}

function getReport(id) {
  const map = getReportsMap();
  return map[id] || null;
}

function saveReport(id, record) {
  const map = getReportsMap();
  const existing = map[id] || {};
  map[id] = {
    ...existing,
    ...record,
    id,
    updatedAt: new Date().toISOString(),
  };
  writeJson(REPORTS_PATH, map);
  return map[id];
}

function deleteReport(id) {
  const map = getReportsMap();
  if (map[id]) {
    delete map[id];
    writeJson(REPORTS_PATH, map);
    return true;
  }
  return false;
}

module.exports = {
  getConfig,
  getPublicConfig,
  saveConfig,
  getReportsMap,
  getReport,
  saveReport,
  deleteReport,
};
