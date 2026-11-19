const {
  parseTP,
  normalizeName,
  normalizeHomework,
  normalizeLanguage,
  parseSkills,
} = require('./tp-rubric');

const SKILL_TRANSLATIONS_BM = {
  'reading comprehension': 'Pemahaman Bacaan',
  'grammar & tenses': 'Tatabahasa & Tenses',
  grammar: 'Tatabahasa',
  'guided writing': 'Penulisan Berpandu',
  writing: 'Penulisan',
  speaking: 'Kemahiran Bertutur',
  listening: 'Kemahiran Mendengar',
  vocabulary: 'Kosa Kata',
  phonics: 'Fonik',
  spelling: 'Ejaan',
  comprehension: 'Pemahaman',
};

function translateSkillsToBm(skills) {
  return skills.map((skill) => {
    const key = skill.toLowerCase();
    return SKILL_TRANSLATIONS_BM[key] || skill;
  });
}

function formatDateLabel(rawTimestamp) {
  const str = String(rawTimestamp || '').trim();
  if (!str) {
    return new Date().toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  const datePart = str.split(' ')[0];
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return datePart;
}

function formatObservationSentence(notes, studentName, lang) {
  const raw = String(notes || '').trim();
  if (!raw) {
    return lang === 'bm'
      ? `${studentName} memberi kerjasama yang baik sepanjang sesi kelas hari ini.`
      : `${studentName} participated attentively throughout today’s session.`;
  }

  // Clean up spacing and capitalization while preserving the tutor's exact points
  const cleaned = raw.replace(/\s+/g, ' ').replace(/^[,\s]+|[.\s]+$/g, '');
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return `${capitalized}.`;
}

function buildEnglishReport(ctx) {
  const {
    brandName,
    tutorName,
    studentName,
    yearForm,
    dateLabel,
    topic,
    skills,
    tp,
    notes,
    homework,
  } = ctx;

  const skillsLine = skills.length > 0 ? skills.join(', ') : 'General English';
  const obs = formatObservationSentence(notes, studentName, 'en');
  const hwLine = homework
    ? `📝 *Homework:* ${homework}`
    : `📝 *Homework:* No homework assigned today — light revision of today’s notes is encouraged.`;

  const lines = [
    `🌟 *${brandName} — Class Progress Report*`,
    `📅 *Date:* ${dateLabel}`,
    `👤 *Student:* ${studentName}${yearForm ? ` (${yearForm})` : ''}`,
    `📚 *Topic:* ${topic || 'English Lesson'}`,
    `🎯 *Skills Focus:* ${skillsLine}`,
    `📊 *Mastery Level (PBD):* *${tp.code} (${tp.labelEn})*`,
    ``,
    `*Class Feedback:*`,
    `• ${studentName} ${tp.descriptorEn}`,
    `• *Tutor Notes:* ${obs}`,
    `• *Next Step:* ${tp.nextStepEn}`,
    ``,
    hwLine,
    `💡 *Home Support Tip:* ${tp.homeTipEn}`,
    ``,
    `Thank you for your continued support! Feel free to reply if you have any questions.${
      tutorName ? `\n— _${tutorName}, ${brandName}_` : `\n— _${brandName}_`
    }`,
  ];

  return lines.join('\n');
}

function buildMalayReport(ctx) {
  const {
    brandName,
    tutorName,
    studentName,
    yearForm,
    dateLabel,
    topic,
    skills,
    tp,
    notes,
    homework,
  } = ctx;

  const skillsBm = translateSkillsToBm(skills);
  const skillsLine = skillsBm.length > 0 ? skillsBm.join(', ') : 'Bahasa Inggeris Umum';
  const obs = formatObservationSentence(notes, studentName, 'bm');
  const hwLine = homework
    ? `📝 *Kerja Rumah:* ${homework}`
    : `📝 *Kerja Rumah:* Tiada kerja rumah hari ini — digalakkan mengulang kaji nota ringkas bersama anak.`;

  const lines = [
    `🌟 *${brandName} — Laporan Perkembangan Kelas*`,
    `📅 *Tarikh:* ${dateLabel}`,
    `👤 *Pelajar:* ${studentName}${yearForm ? ` (${yearForm})` : ''}`,
    `📚 *Topik:* ${topic || 'Pelajaran Bahasa Inggeris'}`,
    `🎯 *Fokus Kemahiran:* ${skillsLine}`,
    `📊 *Tahap Penguasaan (PBD):* *${tp.code} (${tp.labelBm})*`,
    ``,
    `*Maklum Balas Kelas:*`,
    `• ${studentName} ${tp.descriptorBm}`,
    `• *Catatan Tutor:* ${obs}`,
    `• *Langkah Seterusnya:* ${tp.nextStepBm}`,
    ``,
    hwLine,
    `💡 *Tip Sokongan di Rumah:* ${tp.homeTipBm}`,
    ``,
    `Terima kasih atas kerjasama dan sokongan ibu bapa! Sila maklumkan jika ada sebarang pertanyaan.${
      tutorName ? `\n— _${tutorName}, ${brandName}_` : `\n— _${brandName}_`
    }`,
  ];

  return lines.join('\n');
}

function buildBilingualReport(ctx) {
  const {
    brandName,
    tutorName,
    studentName,
    yearForm,
    dateLabel,
    topic,
    skills,
    tp,
    notes,
    homework,
  } = ctx;

  const skillsEn = skills.length > 0 ? skills.join(', ') : 'General English';
  const skillsBm = translateSkillsToBm(skills);
  const skillsBmLine = skillsBm.length > 0 ? skillsBm.join(', ') : 'Bahasa Inggeris Umum';
  const obs = formatObservationSentence(notes, studentName, 'en');

  const hwEn = homework
    ? `${homework}`
    : `No homework today (light revision encouraged)`;
  const hwBm = homework
    ? `${homework}`
    : `Tiada kerja rumah hari ini (ulang kaji ringan digalakkan)`;

  const lines = [
    `🌟 *${brandName} — Class Progress Report / Laporan Perkembangan Kelas*`,
    `📅 *Date / Tarikh:* ${dateLabel}`,
    `👤 *Student / Pelajar:* ${studentName}${yearForm ? ` (${yearForm})` : ''}`,
    `📚 *Topic / Topik:* ${topic || 'English Lesson'}`,
    `🎯 *Skills Focus / Fokus Kemahiran:* ${skillsEn}`,
    `📊 *Mastery Level / Tahap Penguasaan:* *${tp.code} — ${tp.labelEn} (${tp.labelBm})*`,
    ``,
    `🇬🇧 *English Summary:*`,
    `• ${studentName} ${tp.descriptorEn}`,
    `• *Observations:* ${obs}`,
    `• *Next Focus:* ${tp.nextStepEn}`,
    `• *Homework:* ${hwEn}`,
    `• *Tip:* ${tp.homeTipEn}`,
    ``,
    `🇲🇾 *Ringkasan Bahasa Melayu:*`,
    `• *Kemahiran:* ${skillsBmLine}`,
    `• ${studentName} ${tp.descriptorBm}`,
    `• *Catatan Tutor:* ${obs}`,
    `• *Langkah Seterusnya:* ${tp.nextStepBm}`,
    `• *Kerja Rumah:* ${hwBm}`,
    `• *Tip di Rumah:* ${tp.homeTipBm}`,
    ``,
    `Thank you for your continuous support! / Terima kasih atas sokongan berterusan!${
      tutorName ? `\n— _${tutorName}, ${brandName}_` : `\n— _${brandName}_`
    }`,
  ];

  return lines.join('\n');
}

function buildContext(entry, config = {}) {
  return {
    brandName: config.brandName || 'Ace English',
    tutorName: config.tutorName || '',
    studentName: normalizeName(entry.studentName),
    yearForm: String(entry.yearForm || '').trim(),
    dateLabel: formatDateLabel(entry.timestamp),
    topic: String(entry.topic || '').trim(),
    skills: parseSkills(entry.skillFocus),
    tp: parseTP(entry.tp),
    notes: String(entry.strengthsGaps || '').trim(),
    homework: normalizeHomework(entry.homework),
    language: normalizeLanguage(entry.reportLanguage),
  };
}

function generateTemplateReport(entry, config = {}) {
  const ctx = buildContext(entry, config);
  let text = '';

  if (ctx.language === 'English') {
    text = buildEnglishReport(ctx);
  } else if (ctx.language === 'Bahasa Melayu') {
    text = buildMalayReport(ctx);
  } else {
    text = buildBilingualReport(ctx);
  }

  return {
    text,
    engine: 'template',
    tpCode: ctx.tp.code,
    language: ctx.language,
  };
}

function buildAIPrompt(ctx) {
  const hwText = ctx.homework || 'None assigned';
  return `You are a warm, professional Malaysian English tutor writing a post-class parent feedback report for "${ctx.brandName}".

Write a polished, encouraging, parent-friendly WhatsApp message based strictly on these class details and Malaysian MOE PBD Tahap Penguasaan (${ctx.tp.code}) level:

- Student Name: ${ctx.studentName}
- Year/Form: ${ctx.yearForm || 'Not specified'}
- Date: ${ctx.dateLabel}
- Topic: ${ctx.topic || 'General English'}
- Skill Focus Today: ${ctx.skills.join(', ') || 'General English'}
- Tahap Penguasaan (TP): ${ctx.tp.code} — ${ctx.tp.labelEn} / ${ctx.tp.labelBm}
  (TP Rubric meaning: ${ctx.studentName} ${ctx.tp.descriptorEn})
- Tutor's Raw Points (Strengths & Gaps): "${ctx.notes || 'Good participation in class'}"
- Homework: ${hwText}
- Requested Report Language: ${ctx.language}
${ctx.tutorName ? `- Tutor Signature: ${ctx.tutorName}, ${ctx.brandName}` : `- Signature: ${ctx.brandName}`}

Formatting & Quality Rules:
1. Format strictly for WhatsApp: use single *asterisks* for bold headings/labels and _underscores_ for italics. NEVER use markdown **double asterisks** or # headings.
2. Expand the tutor's raw points naturally and tactfully into constructive, specific parent feedback aligned with ${ctx.tp.code} (if there is a gap such as "lack vocabulary", frame it positively with a clear next step).
3. Include a clear Homework line (if "None assigned", state kindly that there is no homework today and suggest brief revision).
4. Include a practical 1-sentence Home Support Tip tailored to ${ctx.tp.code}.
5. Language rule:
   - If "English": write entirely in clear, warm English.
   - If "Bahasa Melayu": write entirely in natural, polite Malaysian Bahasa Melayu.
   - If "Bilingual": include shared header details at the top, followed by a concise English section and a concise Bahasa Melayu section (translating the tutor's notes naturally into BM too).
6. Keep it scannable and concise enough to read comfortably on a phone screen. Output ONLY the final WhatsApp message text.`;
}

async function callGemini(prompt, config) {
  const model = config.geminiModel || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 1200,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error('Gemini returned empty response.');
  }
  return sanitizeWhatsAppText(text);
}

async function callOpenAI(prompt, config) {
  const baseUrl = (config.openaiBaseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = config.openaiModel || 'gpt-4o-mini';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You write WhatsApp parent feedback reports for an English tutor.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.65,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('OpenAI returned empty response.');
  }
  return sanitizeWhatsAppText(text);
}

function sanitizeWhatsAppText(text) {
  return String(text || '')
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

async function generateReport(entry, config = {}, options = {}) {
  const mode = options.mode || 'auto'; // 'auto' | 'ai' | 'template'
  const ctx = buildContext(entry, config);

  const canUseGemini = config.aiProvider === 'gemini' && Boolean(config.geminiApiKey);
  const canUseOpenAI = config.aiProvider === 'openai' && Boolean(config.openaiApiKey);

  if (mode !== 'template' && (canUseGemini || canUseOpenAI)) {
    const prompt = buildAIPrompt(ctx);
    try {
      const text = canUseGemini
        ? await callGemini(prompt, config)
        : await callOpenAI(prompt, config);
      return {
        text,
        engine: canUseGemini ? `ai:gemini (${config.geminiModel})` : `ai:openai (${config.openaiModel})`,
        tpCode: ctx.tp.code,
        language: ctx.language,
      };
    } catch (err) {
      if (mode === 'ai') {
        throw err;
      }
      const fallback = generateTemplateReport(entry, config);
      return {
        ...fallback,
        fallbackReason: err.message,
      };
    }
  }

  return generateTemplateReport(entry, config);
}

module.exports = {
  generateTemplateReport,
  generateReport,
  sanitizeWhatsAppText,
};
