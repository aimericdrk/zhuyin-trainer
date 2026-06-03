// Ear-training generator for the Tones game. Plays a single syllable and asks
// the learner to identify its tone (1–4). Each base supplies four real
// characters that differ only by tone, so the audio is authentic.
export const TONE_BASES = [
  { key: 'ma', chars: ['媽', '麻', '馬', '罵'], py: ['mā', 'má', 'mǎ', 'mà'] },
  { key: 'yi', chars: ['一', '姨', '椅', '意'], py: ['yī', 'yí', 'yǐ', 'yì'] },
  { key: 'ba', chars: ['八', '拔', '把', '爸'], py: ['bā', 'bá', 'bǎ', 'bà'] },
  { key: 'shu', chars: ['書', '熟', '鼠', '樹'], py: ['shū', 'shú', 'shǔ', 'shù'] },
  { key: 'tang', chars: ['湯', '糖', '躺', '燙'], py: ['tāng', 'táng', 'tǎng', 'tàng'] },
  { key: 'yan', chars: ['煙', '鹽', '眼', '燕'], py: ['yān', 'yán', 'yǎn', 'yàn'] },
  { key: 'wu', chars: ['屋', '無', '五', '物'], py: ['wū', 'wú', 'wǔ', 'wù'] },
  { key: 'shi', chars: ['詩', '十', '使', '是'], py: ['shī', 'shí', 'shǐ', 'shì'] },
];

export const TONE_OPTIONS = [
  { id: 'tone1', zh: '第一聲', py: 'ˉ high / píng' },
  { id: 'tone2', zh: '第二聲', py: 'ˊ rising / yáng' },
  { id: 'tone3', zh: '第三聲', py: 'ˇ dipping / shǎng' },
  { id: 'tone4', zh: '第四聲', py: 'ˋ falling / qù' },
];

export function buildToneItem(baseIdx, tone) {
  const base = TONE_BASES[baseIdx];
  const ch = base.chars[tone - 1];
  return {
    id: `tone-${base.key}-${tone}`,
    prompt: { audio: ch, gloss: { en: 'Which tone did you hear?', fr: 'Quel ton as-tu entendu ?' } },
    options: TONE_OPTIONS,
    correctId: `tone${tone}`,
    audio: ch,
    autoPlay: true,
  };
}

export function generateTone(rand = Math.random, prevId = null) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const baseIdx = Math.floor(rand() * TONE_BASES.length);
    const tone = 1 + Math.floor(rand() * 4);
    const item = buildToneItem(baseIdx, tone);
    if (item.id !== prevId) return item;
  }
  return buildToneItem(0, 1);
}
