const TP_RUBRIC = {
  TP1: {
    code: 'TP1',
    level: 1,
    labelEn: 'Very Limited',
    labelBm: 'Sangat Terhad',
    descriptorEn:
      'is at an early foundational stage and recognizes basic words and simple instructions with close, step-by-step guidance.',
    descriptorBm:
      'masih berada di peringkat asas awal dan dapat mengenal pasti perkataan mudah serta arahan ringkas dengan bimbingan rapat langkah demi langkah.',
    nextStepEn:
      'Our focus is building confidence through repetition, phonics/vocabulary familiarity, and short guided practice.',
    nextStepBm:
      'Fokus kami ialah membina keyakinan melalui latihan berulang, penguasaan kosa kata asas, dan bimbingan berterusan.',
    homeTipEn:
      'Encourage 5–10 minutes of daily reading aloud or reviewing 3–5 new words together in a relaxed way.',
    homeTipBm:
      'Galakkan anak membaca atau mengulang kaji 3–5 perkataan baharu selama 5–10 minit setiap hari dalam suasana yang santai.',
  },
  TP2: {
    code: 'TP2',
    level: 2,
    labelEn: 'Limited',
    labelBm: 'Terhad',
    descriptorEn:
      'shows basic understanding of the lesson and can complete simple tasks when given prompts and structured examples.',
    descriptorBm:
      'menunjukkan pemahaman asas terhadap topik yang dipelajari dan dapat menyelesaikan tugasan mudah dengan bantuan contoh serta panduan.',
    nextStepEn:
      'We are strengthening core vocabulary and sentence patterns so they can respond with less prompting.',
    nextStepBm:
      'Kami sedang mengukuhkan kosa kata teras dan struktur ayat mudah supaya anak lebih yakin menjawab tanpa banyak panduan.',
    homeTipEn:
      'Ask your child to explain 1–2 things they learned today and practice forming simple short sentences at home.',
    homeTipBm:
      'Minta anak kongsikan 1–2 perkara yang dipelajari hari ini dan latih membina ayat pendek yang mudah di rumah.',
  },
  TP3: {
    code: 'TP3',
    level: 3,
    labelEn: 'Satisfactory',
    labelBm: 'Memuaskan',
    descriptorEn:
      'demonstrates a satisfactory grasp of the lesson and can apply key concepts in guided activities, with room to grow in accuracy and vocabulary.',
    descriptorBm:
      'menunjukkan penguasaan yang memuaskan dan mampu menggunakan konsep utama dalam latihan berpandu, namun masih boleh diperkukuh dari segi ketepatan dan kosa kata.',
    nextStepEn:
      'Moving forward, we will focus on reducing common mistakes and expanding expressive vocabulary for smoother independence.',
    nextStepBm:
      'Selepas ini, kami akan memberi tumpuan untuk mengurangkan kesilapan lazim dan memperluas kosa kata supaya anak lebih berdikari.',
    homeTipEn:
      'Short daily English exposure (reading short stories or simple conversation) will help bridge the gap from guided to independent use.',
    homeTipBm:
      'Pendedahan harian yang ringkas (membaca cerita pendek atau perbualan mudah) amat membantu anak beralih daripada latihan berpandu kepada penggunaan kendiri.',
  },
  TP4: {
    code: 'TP4',
    level: 4,
    labelEn: 'Good',
    labelBm: 'Baik',
    descriptorEn:
      'shows good understanding of the topic and applies today’s skills accurately in familiar contexts with minimal guidance.',
    descriptorBm:
      'menunjukkan pemahaman yang baik terhadap topik hari ini dan mampu mengaplikasikan kemahiran dengan tepat dalam situasi biasa tanpa banyak bantuan.',
    nextStepEn:
      'Next, we will challenge them with slightly varied questions and richer sentence structures to push toward higher mastery.',
    nextStepBm:
      'Seterusnya, kami akan mencabar anak dengan soalan yang lebih pelbagai dan struktur ayat yang lebih matang untuk melangkah ke tahap seterusnya.',
    homeTipEn:
      'Praise their steady progress and encourage them to read slightly longer passages or write 2–3 original sentences on today’s topic.',
    homeTipBm:
      'Berikan pujian atas perkembangan baik ini dan galakkan anak membaca petikan yang lebih panjang atau menulis 2–3 ayat sendiri berkaitan topik hari ini.',
  },
  TP5: {
    code: 'TP5',
    level: 5,
    labelEn: 'Very Good',
    labelBm: 'Sangat Baik',
    descriptorEn:
      'consistently demonstrates strong command of the topic, communicates ideas clearly, and handles tasks independently with confidence.',
    descriptorBm:
      'menunjukkan penguasaan yang sangat baik secara konsisten, dapat menyampaikan idea dengan jelas, dan menyiapkan tugasan secara berdikari serta yakin.',
    nextStepEn:
      'We will continue refining nuance, varied expression, and critical thinking in more challenging tasks.',
    nextStepBm:
      'Kami akan terus mengasah kehalusan bahasa, variasi ungkapan, dan kemahiran berfikir aras tinggi melalui latihan yang lebih mencabar.',
    homeTipEn:
      'Encourage wider reading and open-ended discussions in English to keep sharpening fluency and natural expression.',
    homeTipBm:
      'Galakkan pembacaan lebih meluas dan perbincangan terbuka dalam Bahasa Inggeris untuk terus menajamkan kelancaran berbahasa.',
  },
  TP6: {
    code: 'TP6',
    level: 6,
    labelEn: 'Excellent',
    labelBm: 'Cemerlang',
    descriptorEn:
      'displays exemplary mastery of the lesson, applying English creatively, accurately, and naturally across different contexts.',
    descriptorBm:
      'mempamerkan penguasaan yang cemerlang serta mampu menggunakan Bahasa Inggeris dengan tepat, kreatif, dan semula jadi dalam pelbagai konteks.',
    nextStepEn:
      'We will keep nurturing their leadership in expression through enrichment activities, advanced comprehension, and creative tasks.',
    nextStepBm:
      'Kami akan terus menyuburkan potensi anak melalui aktiviti pengayaan, pemahaman aras tinggi, dan tugasan kreatif.',
    homeTipEn:
      'Provide engaging English books, journals, or discussion topics that match their curiosity so they stay inspired.',
    homeTipBm:
      'Sediakan bahan bacaan atau topik perbincangan menarik yang sepadan dengan minat anak supaya semangat belajar terus menyala.',
  },
};

function parseTP(raw) {
  const str = String(raw || '').trim().toUpperCase();
  const match = str.match(/([1-6])/);
  if (match) {
    return TP_RUBRIC[`TP${match[1]}`];
  }
  return TP_RUBRIC.TP3;
}

function normalizeName(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return 'Student';
  return trimmed
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeHomework(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;
  const lowered = trimmed.toLowerCase();
  if (
    ['no', 'n0', 'none', 'nil', 'na', 'n/a', '-', '--', 'tiada', 'tak ada', 'nothing'].includes(
      lowered
    )
  ) {
    return null;
  }
  return trimmed;
}

function normalizeLanguage(raw) {
  const lowered = String(raw || '').trim().toLowerCase();
  if (lowered.includes('bilingual') || lowered.includes('dwibahasa') || lowered.includes('both')) {
    return 'Bilingual';
  }
  if (lowered.includes('bm') || lowered.includes('melayu') || lowered.includes('malay')) {
    return 'Bahasa Melayu';
  }
  if (lowered.includes('en') || lowered.includes('english') || lowered.includes('inggeris')) {
    return 'English';
  }
  return 'Bilingual';
}

function parseSkills(raw) {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = {
  TP_RUBRIC,
  parseTP,
  normalizeName,
  normalizeHomework,
  normalizeLanguage,
  parseSkills,
};
