/* TP1–TP6 Malaysian PBD rubric + WhatsApp report template engine (browser build) */
(function () {
  const TP_RUBRIC = {
    TP1: {
      code: 'TP1', level: 1, labelEn: 'Very Limited', labelBm: 'Sangat Terhad',
      descriptorEn: 'is at an early foundational stage and recognizes basic words and simple instructions with close, step-by-step guidance.',
      descriptorBm: 'masih berada di peringkat asas awal dan dapat mengenal pasti perkataan mudah serta arahan ringkas dengan bimbingan rapat langkah demi langkah.',
      nextStepEn: 'Our focus is building confidence through repetition, phonics/vocabulary familiarity, and short guided practice.',
      nextStepBm: 'Fokus kami ialah membina keyakinan melalui latihan berulang, penguasaan kosa kata asas, dan bimbingan berterusan.',
      homeTipEn: 'Encourage 5–10 minutes of daily reading aloud or reviewing 3–5 new words together in a relaxed way.',
      homeTipBm: 'Galakkan anak membaca atau mengulang kaji 3–5 perkataan baharu selama 5–10 minit setiap hari dalam suasana yang santai.',
    },
    TP2: {
      code: 'TP2', level: 2, labelEn: 'Limited', labelBm: 'Terhad',
      descriptorEn: 'shows basic understanding of the lesson and can complete simple tasks when given prompts and structured examples.',
      descriptorBm: 'menunjukkan pemahaman asas terhadap topik yang dipelajari dan dapat menyelesaikan tugasan mudah dengan bantuan contoh serta panduan.',
      nextStepEn: 'We are strengthening core vocabulary and sentence patterns so they can respond with less prompting.',
      nextStepBm: 'Kami sedang mengukuhkan kosa kata teras dan struktur ayat mudah supaya anak lebih yakin menjawab tanpa banyak panduan.',
      homeTipEn: 'Ask your child to explain 1–2 things they learned today and practice forming simple short sentences at home.',
      homeTipBm: 'Minta anak kongsikan 1–2 perkara yang dipelajari hari ini dan latih membina ayat pendek yang mudah di rumah.',
    },
    TP3: {
      code: 'TP3', level: 3, labelEn: 'Satisfactory', labelBm: 'Memuaskan',
      descriptorEn: 'demonstrates a satisfactory grasp of the lesson and can apply key concepts in guided activities, with room to grow in accuracy and vocabulary.',
      descriptorBm: 'menunjukkan penguasaan yang memuaskan dan mampu menggunakan konsep utama dalam latihan berpandu, namun masih boleh diperkukuh dari segi ketepatan dan kosa kata.',
      nextStepEn: 'Moving forward, we will focus on reducing common mistakes and expanding expressive vocabulary for smoother independence.',
      nextStepBm: 'Selepas ini, kami akan memberi tumpuan untuk mengurangkan kesilapan lazim dan memperluas kosa kata supaya anak lebih berdikari.',
      homeTipEn: 'Short daily English exposure (reading short stories or simple conversation) will help bridge the gap from guided to independent use.',
      homeTipBm: 'Pendedahan harian yang ringkas (membaca cerita pendek atau perbualan mudah) amat membantu anak beralih daripada latihan berpandu kepada penggunaan kendiri.',
    },
    TP4: {
      code: 'TP4', level: 4, labelEn: 'Good', labelBm: 'Baik',
      descriptorEn: 'shows good understanding of the topic and applies today’s skills accurately in familiar contexts with minimal guidance.',
      descriptorBm: 'menunjukkan pemahaman yang baik terhadap topik hari ini dan mampu mengaplikasikan kemahiran dengan tepat dalam situasi biasa tanpa banyak bantuan.',
      nextStepEn: 'Next, we will challenge them with slightly varied questions and richer sentence structures to push toward higher mastery.',
      nextStepBm: 'Seterusnya, kami akan mencabar anak dengan soalan yang lebih pelbagai dan struktur ayat yang lebih matang untuk melangkah ke tahap seterusnya.',
      homeTipEn: 'Praise their steady progress and encourage them to read slightly longer passages or write 2–3 original sentences on today’s topic.',
      homeTipBm: 'Berikan pujian atas perkembangan baik ini dan galakkan anak membaca petikan yang lebih panjang atau menulis 2–3 ayat sendiri berkaitan topik hari ini.',
    },
    TP5: {
      code: 'TP5', level: 5, labelEn: 'Very Good', labelBm: 'Sangat Baik',
      descriptorEn: 'consistently demonstrates strong command of the topic, communicates ideas clearly, and handles tasks independently with confidence.',
      descriptorBm: 'menunjukkan penguasaan yang sangat baik secara konsisten, dapat menyampaikan idea dengan jelas, dan menyiapkan tugasan secara berdikari serta yakin.',
      nextStepEn: 'We will continue refining nuance, varied expression, and critical thinking in more challenging tasks.',
      nextStepBm: 'Kami akan terus mengasah kehalusan bahasa, variasi ungkapan, dan kemahiran berfikir aras tinggi melalui latihan yang lebih mencabar.',
      homeTipEn: 'Encourage wider reading and open-ended discussions in English to keep sharpening fluency and natural expression.',
      homeTipBm: 'Galakkan pembacaan lebih meluas dan perbincangan terbuka dalam Bahasa Inggeris untuk terus menajamkan kelancaran berbahasa.',
    },
    TP6: {
      code: 'TP6', level: 6, labelEn: 'Excellent', labelBm: 'Cemerlang',
      descriptorEn: 'displays exemplary mastery of the lesson, applying English creatively, accurately, and naturally across different contexts.',
      descriptorBm: 'mempamerkan penguasaan yang cemerlang serta mampu menggunakan Bahasa Inggeris dengan tepat, kreatif, dan semula jadi dalam pelbagai konteks.',
      nextStepEn: 'We will keep nurturing their leadership in expression through enrichment activities, advanced comprehension, and creative tasks.',
      nextStepBm: 'Kami akan terus menyuburkan potensi anak melalui aktiviti pengayaan, pemahaman aras tinggi, dan tugasan kreatif.',
      homeTipEn: 'Provide engaging English books, journals, or discussion topics that match their curiosity so they stay inspired.',
      homeTipBm: 'Sediakan bahan bacaan atau topik perbincangan menarik yang sepadan dengan minat anak supaya semangat belajar terus menyala.',
    },
  };

  const SKILL_BM = {
    'reading comprehension': 'Pemahaman Bacaan', 'grammar & tenses': 'Tatabahasa & Tenses',
    grammar: 'Tatabahasa', 'guided writing': 'Penulisan Berpandu', writing: 'Penulisan',
    speaking: 'Kemahiran Bertutur', listening: 'Kemahiran Mendengar', vocabulary: 'Kosa Kata',
    phonics: 'Fonik', spelling: 'Ejaan', comprehension: 'Pemahaman',
  };

  function parseTP(raw) {
    const m = String(raw || '').trim().toUpperCase().match(/([1-6])/);
    return TP_RUBRIC[m ? 'TP' + m[1] : 'TP3'];
  }
  function normalizeName(raw) {
    const t = String(raw || '').trim();
    if (!t) return 'Student';
    return t.split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
  function normalizeHomework(raw) {
    const t = String(raw || '').trim();
    if (!t) return null;
    const l = t.toLowerCase();
    return ['no','n0','none','nil','na','n/a','-','--','tiada','tak ada','nothing'].includes(l) ? null : t;
  }
  function normalizeLanguage(raw) {
    const l = String(raw || '').trim().toLowerCase();
    if (/bilingual|dwibahasa|both/.test(l)) return 'Bilingual';
    if (/bm|melayu|malay/.test(l)) return 'Bahasa Melayu';
    if (/en$|english|inggeris/.test(l)) return 'English';
    return 'Bilingual';
  }
  function parseSkills(raw) {
    if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean);
    return String(raw || '').split(',').map(s => s.trim()).filter(Boolean);
  }
  function translateSkills(skills) {
    return skills.map(s => SKILL_BM[s.toLowerCase()] || s);
  }
  function formatDateLabel(raw) {
    const str = String(raw || '').trim();
    if (!str) return new Date().toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' });
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' });
    return str.split(' ')[0];
  }
  function observation(notes, name, lang) {
    const raw = String(notes || '').trim();
    if (!raw) return lang === 'bm'
      ? `${name} memberi kerjasama yang baik sepanjang sesi kelas hari ini.`
      : `${name} participated attentively throughout today’s session.`;
    const cleaned = raw.replace(/\s+/g, ' ').replace(/^[,\s]+|[.\s]+$/g, '');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + '.';
  }

  function buildContext(entry, config) {
    return {
      brandName: (config && config.brandName) || 'Ace English',
      tutorName: (config && config.tutorName) || '',
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

  function generateTemplateReport(entry, config) {
    const c = buildContext(entry, config);
    const skillsEn = c.skills.length ? c.skills.join(', ') : 'General English';
    const skillsBmList = translateSkills(c.skills);
    const skillsBm = skillsBmList.length ? skillsBmList.join(', ') : 'Bahasa Inggeris Umum';
    const obs = observation(c.notes, c.studentName, c.language === 'Bahasa Melayu' ? 'bm' : 'en');
    const sign = c.tutorName ? `\n— _${c.tutorName}, ${c.brandName}_` : `\n— _${c.brandName}_`;
    let text = '';

    if (c.language === 'English') {
      const hw = c.homework ? `📝 *Homework:* ${c.homework}` : '📝 *Homework:* No homework assigned today — light revision of today’s notes is encouraged.';
      text = [
        `🌟 *${c.brandName} — Class Progress Report*`,
        `📅 *Date:* ${c.dateLabel}`,
        `👤 *Student:* ${c.studentName}${c.yearForm ? ` (${c.yearForm})` : ''}`,
        `📚 *Topic:* ${c.topic || 'English Lesson'}`,
        `🎯 *Skills Focus:* ${skillsEn}`,
        `📊 *Mastery Level (PBD):* *${c.tp.code} (${c.tp.labelEn})*`, '',
        '*Class Feedback:*',
        `• ${c.studentName} ${c.tp.descriptorEn}`,
        `• *Tutor Notes:* ${obs}`,
        `• *Next Step:* ${c.tp.nextStepEn}`, '',
        hw,
        `💡 *Home Support Tip:* ${c.tp.homeTipEn}`, '',
        `Thank you for your continued support! Feel free to reply if you have any questions.${sign}`,
      ].join('\n');
    } else if (c.language === 'Bahasa Melayu') {
      const hw = c.homework ? `📝 *Kerja Rumah:* ${c.homework}` : '📝 *Kerja Rumah:* Tiada kerja rumah hari ini — digalakkan mengulang kaji nota ringkas bersama anak.';
      text = [
        `🌟 *${c.brandName} — Laporan Perkembangan Kelas*`,
        `📅 *Tarikh:* ${c.dateLabel}`,
        `👤 *Pelajar:* ${c.studentName}${c.yearForm ? ` (${c.yearForm})` : ''}`,
        `📚 *Topik:* ${c.topic || 'Pelajaran Bahasa Inggeris'}`,
        `🎯 *Fokus Kemahiran:* ${skillsBm}`,
        `📊 *Tahap Penguasaan (PBD):* *${c.tp.code} (${c.tp.labelBm})*`, '',
        '*Maklum Balas Kelas:*',
        `• ${c.studentName} ${c.tp.descriptorBm}`,
        `• *Catatan Tutor:* ${obs}`,
        `• *Langkah Seterusnya:* ${c.tp.nextStepBm}`, '',
        hw,
        `💡 *Tip Sokongan di Rumah:* ${c.tp.homeTipBm}`, '',
        `Terima kasih atas kerjasama dan sokongan ibu bapa! Sila maklumkan jika ada sebarang pertanyaan.${sign}`,
      ].join('\n');
    } else {
      const hwEn = c.homework || 'No homework today (light revision encouraged)';
      const hwBm = c.homework || 'Tiada kerja rumah hari ini (ulang kaji ringan digalakkan)';
      text = [
        `🌟 *${c.brandName} — Class Progress Report / Laporan Perkembangan Kelas*`,
        `📅 *Date / Tarikh:* ${c.dateLabel}`,
        `👤 *Student / Pelajar:* ${c.studentName}${c.yearForm ? ` (${c.yearForm})` : ''}`,
        `📚 *Topic / Topik:* ${c.topic || 'English Lesson'}`,
        `🎯 *Skills Focus / Fokus Kemahiran:* ${skillsEn}`,
        `📊 *Mastery Level / Tahap Penguasaan:* *${c.tp.code} — ${c.tp.labelEn} (${c.tp.labelBm})*`, '',
        '🇬🇧 *English Summary:*',
        `• ${c.studentName} ${c.tp.descriptorEn}`,
        `• *Observations:* ${obs}`,
        `• *Next Focus:* ${c.tp.nextStepEn}`,
        `• *Homework:* ${hwEn}`,
        `• *Tip:* ${c.tp.homeTipEn}`, '',
        '🇲🇾 *Ringkasan Bahasa Melayu:*',
        `• *Kemahiran:* ${skillsBm}`,
        `• ${c.studentName} ${c.tp.descriptorBm}`,
        `• *Catatan Tutor:* ${obs}`,
        `• *Langkah Seterusnya:* ${c.tp.nextStepBm}`,
        `• *Kerja Rumah:* ${hwBm}`,
        `• *Tip di Rumah:* ${c.tp.homeTipBm}`, '',
        `Thank you for your continuous support! / Terima kasih atas sokongan berterusan!${sign}`,
      ].join('\n');
    }

    return { text, engine: 'template', tpCode: c.tp.code, language: c.language };
  }

  window.TPEngine = { TP_RUBRIC, parseTP, normalizeName, normalizeLanguage, generateTemplateReport };
})();
