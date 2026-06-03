// Registry of all mini-games. Each entry drives a card on the Games hub and is
// hosted by GameScreen. `engine` selects the generic hook:
//   - 'builder' → useGameBuilder, needs `generate`
//   - 'quiz'    → useGameQuiz, needs `items` (sampled) or `generate` (self-options)
// i18n keys live under games.<id>.title / games.<id>.desc.
import { generateTime } from './timePhrase';
import { generateNumber } from './numberPhrase';
import { generateDate } from './datePhrase';
import { generateMoney } from './moneyPhrase';
import { generateTone } from './tonePhrase';
import { generateListening, generatePinyinReading } from './listening';
import { generateBopomofo } from './bopomofo';
import { generateDictation } from './sentences';
import { generateStrokeCount } from './writingChars';
import { generateCount } from './countPhrase';
import {
  MEASURE_WORDS, ORDERING, DIRECTIONS, FAMILY, COLORS, WEATHER, GREETINGS,
  ANIMALS, BODY, FOOD, COUNTRIES, JOBS, VERBS, ADJECTIVES, QUESTION_WORDS, TRANSPORT,
  PLACES, TIME_WORDS, HOBBIES, FEELINGS, CLOTHING,
  RADICALS, ZODIAC, FESTIVALS, IDIOMS,
  FRUITS, DRINKS, SPORTS, HOUSEHOLD, SUBJECTS, TECH, FREQUENCY, ROOMS, ROUTINE,
  TABLEWARE, STATIONERY, CALENDAR, PRONOUNS, CONNECTORS, GRAMMAR,
} from './quizSets';

export const GAMES = [
  { id: 'time', zh: '時間', icon: '🕐', cat: 'build', engine: 'builder', generate: generateTime },
  { id: 'numbers', zh: '數字', icon: '🔢', cat: 'build', engine: 'builder', generate: generateNumber },
  { id: 'counting', zh: '數量', icon: '🧺', cat: 'build', engine: 'builder', generate: generateCount },
  { id: 'dates', zh: '日期', icon: '📅', cat: 'build', engine: 'builder', generate: generateDate },
  { id: 'money', zh: '錢', icon: '💰', cat: 'build', engine: 'builder', generate: generateMoney },
  { id: 'measureWords', zh: '量詞', icon: '🧮', cat: 'vocab', engine: 'quiz', items: MEASURE_WORDS },
  { id: 'ordering', zh: '點菜', icon: '🍜', cat: 'vocab', engine: 'quiz', items: ORDERING },
  { id: 'directions', zh: '方向', icon: '🧭', cat: 'vocab', engine: 'quiz', items: DIRECTIONS },
  { id: 'family', zh: '家人', icon: '👪', cat: 'vocab', engine: 'quiz', items: FAMILY },
  { id: 'colors', zh: '顏色', icon: '🎨', cat: 'vocab', engine: 'quiz', items: COLORS },
  { id: 'weather', zh: '天氣', icon: '⛅', cat: 'vocab', engine: 'quiz', items: WEATHER },
  { id: 'greetings', zh: '問候', icon: '🙋', cat: 'vocab', engine: 'quiz', items: GREETINGS },
  { id: 'animals', zh: '動物', icon: '🐼', cat: 'vocab', engine: 'quiz', items: ANIMALS },
  { id: 'food', zh: '食物', icon: '🍚', cat: 'vocab', engine: 'quiz', items: FOOD },
  { id: 'body', zh: '身體', icon: '🖐️', cat: 'vocab', engine: 'quiz', items: BODY },
  { id: 'countries', zh: '國家', icon: '🌏', cat: 'vocab', engine: 'quiz', items: COUNTRIES },
  { id: 'jobs', zh: '職業', icon: '💼', cat: 'vocab', engine: 'quiz', items: JOBS },
  { id: 'verbs', zh: '動作', icon: '🏃', cat: 'vocab', engine: 'quiz', items: VERBS },
  { id: 'adjectives', zh: '形容詞', icon: '↔️', cat: 'vocab', engine: 'quiz', items: ADJECTIVES },
  { id: 'questionWords', zh: '疑問詞', icon: '❓', cat: 'vocab', engine: 'quiz', items: QUESTION_WORDS },
  { id: 'transport', zh: '交通', icon: '🚆', cat: 'vocab', engine: 'quiz', items: TRANSPORT },
  { id: 'places', zh: '地方', icon: '🏫', cat: 'vocab', engine: 'quiz', items: PLACES },
  { id: 'timeWords', zh: '時候', icon: '⏳', cat: 'vocab', engine: 'quiz', items: TIME_WORDS },
  { id: 'hobbies', zh: '興趣', icon: '🎨', cat: 'vocab', engine: 'quiz', items: HOBBIES },
  { id: 'feelings', zh: '心情', icon: '😊', cat: 'vocab', engine: 'quiz', items: FEELINGS },
  { id: 'clothing', zh: '衣物', icon: '👕', cat: 'vocab', engine: 'quiz', items: CLOTHING },
  { id: 'fruits', zh: '水果', icon: '🍎', cat: 'vocab', engine: 'quiz', items: FRUITS },
  { id: 'drinks', zh: '飲料', icon: '🥤', cat: 'vocab', engine: 'quiz', items: DRINKS },
  { id: 'sports', zh: '運動', icon: '🏀', cat: 'vocab', engine: 'quiz', items: SPORTS },
  { id: 'household', zh: '家具', icon: '🛋️', cat: 'vocab', engine: 'quiz', items: HOUSEHOLD },
  { id: 'subjects', zh: '科目', icon: '📚', cat: 'vocab', engine: 'quiz', items: SUBJECTS },
  { id: 'tech', zh: '科技', icon: '💻', cat: 'vocab', engine: 'quiz', items: TECH },
  { id: 'frequency', zh: '頻率', icon: '🔁', cat: 'vocab', engine: 'quiz', items: FREQUENCY },
  { id: 'rooms', zh: '房間', icon: '🚪', cat: 'vocab', engine: 'quiz', items: ROOMS },
  { id: 'routine', zh: '日常', icon: '⏰', cat: 'vocab', engine: 'quiz', items: ROUTINE },
  { id: 'tableware', zh: '餐具', icon: '🥢', cat: 'vocab', engine: 'quiz', items: TABLEWARE },
  { id: 'stationery', zh: '文具', icon: '✏️', cat: 'vocab', engine: 'quiz', items: STATIONERY },
  { id: 'calendar', zh: '月份', icon: '📆', cat: 'vocab', engine: 'quiz', items: CALENDAR },
  { id: 'pronouns', zh: '代名詞', icon: '👤', cat: 'vocab', engine: 'quiz', items: PRONOUNS },
  { id: 'connectors', zh: '連接詞', icon: '🔗', cat: 'vocab', engine: 'quiz', items: CONNECTORS },
  { id: 'grammar', zh: '語法詞', icon: '🧩', cat: 'vocab', engine: 'quiz', items: GRAMMAR },
  { id: 'radicals', zh: '部首', icon: '⼝', cat: 'culture', engine: 'quiz', items: RADICALS },
  { id: 'zodiac', zh: '生肖', icon: '🐉', cat: 'culture', engine: 'quiz', items: ZODIAC },
  { id: 'festivals', zh: '節日', icon: '🧧', cat: 'culture', engine: 'quiz', items: FESTIVALS },
  { id: 'idioms', zh: '成語', icon: '📜', cat: 'culture', engine: 'quiz', items: IDIOMS },
  { id: 'strokes', zh: '筆畫', icon: '🖌️', cat: 'culture', engine: 'quiz', generate: generateStrokeCount },
  { id: 'sounds', zh: '拼音', icon: '🔠', cat: 'ear', engine: 'quiz', generate: generateBopomofo },
  { id: 'pinyin', zh: '拼讀', icon: '👁️', cat: 'ear', engine: 'quiz', generate: generatePinyinReading },
  { id: 'dictation', zh: '聽寫', icon: '✏️', cat: 'ear', engine: 'builder', generate: generateDictation },
  { id: 'listening', zh: '聽力', icon: '🎧', cat: 'ear', engine: 'quiz', generate: generateListening },
  { id: 'tones', zh: '聲調', icon: '🎵', cat: 'ear', engine: 'quiz', generate: generateTone },
];

// Display order of categories on the Games hub.
export const GAME_CATEGORIES = ['build', 'vocab', 'culture', 'ear'];

export function getGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}
