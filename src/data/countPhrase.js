// Procedural generator for the Counting game: compose [number][measure][noun],
// e.g. 兩杯茶 (two cups of tea), 三本書 (three books). Teaches the count +
// classifier + noun structure and the 兩-before-measure rule.
import { spellNumber, charPinyin } from './chineseNumber';

const NOUNS = [
  // 本 běn — bound volumes
  { zh: '書', py: 'shū', mw: '本', mwPy: 'běn', en: 'book', fr: 'livre' },
  { zh: '字典', py: 'zìdiǎn', mw: '本', mwPy: 'běn', en: 'dictionary', fr: 'dictionnaire' },
  { zh: '雜誌', py: 'zázhì', mw: '本', mwPy: 'běn', en: 'magazine', fr: 'magazine' },
  { zh: '小說', py: 'xiǎoshuō', mw: '本', mwPy: 'běn', en: 'novel', fr: 'roman' },
  // 杯 bēi — cups/glasses
  { zh: '茶', py: 'chá', mw: '杯', mwPy: 'bēi', en: 'cup of tea', fr: 'tasse de thé' },
  { zh: '水', py: 'shuǐ', mw: '杯', mwPy: 'bēi', en: 'glass of water', fr: "verre d'eau" },
  { zh: '咖啡', py: 'kāfēi', mw: '杯', mwPy: 'bēi', en: 'coffee', fr: 'café' },
  // 瓶 píng / 罐 guàn — bottles & cans
  { zh: '牛奶', py: 'niúnǎi', mw: '瓶', mwPy: 'píng', en: 'bottle of milk', fr: 'bouteille de lait' },
  { zh: '啤酒', py: 'píjiǔ', mw: '瓶', mwPy: 'píng', en: 'beer', fr: 'bière' },
  { zh: '可樂', py: 'kělè', mw: '罐', mwPy: 'guàn', en: 'can of cola', fr: 'canette de cola' },
  // 隻 zhī — animals / one of a pair
  { zh: '狗', py: 'gǒu', mw: '隻', mwPy: 'zhī', en: 'dog', fr: 'chien' },
  { zh: '貓', py: 'māo', mw: '隻', mwPy: 'zhī', en: 'cat', fr: 'chat' },
  { zh: '鳥', py: 'niǎo', mw: '隻', mwPy: 'zhī', en: 'bird', fr: 'oiseau' },
  { zh: '雞', py: 'jī', mw: '隻', mwPy: 'zhī', en: 'chicken', fr: 'poulet' },
  { zh: '兔子', py: 'tùzi', mw: '隻', mwPy: 'zhī', en: 'rabbit', fr: 'lapin' },
  // 輛 liàng — wheeled vehicles
  { zh: '車', py: 'chē', mw: '輛', mwPy: 'liàng', en: 'car', fr: 'voiture' },
  { zh: '腳踏車', py: 'jiǎotàchē', mw: '輛', mwPy: 'liàng', en: 'bicycle', fr: 'vélo' },
  { zh: '公車', py: 'gōngchē', mw: '輛', mwPy: 'liàng', en: 'bus', fr: 'bus' },
  // 條 tiáo — long, thin or winding things
  { zh: '魚', py: 'yú', mw: '條', mwPy: 'tiáo', en: 'fish', fr: 'poisson' },
  { zh: '河', py: 'hé', mw: '條', mwPy: 'tiáo', en: 'river', fr: 'rivière' },
  { zh: '路', py: 'lù', mw: '條', mwPy: 'tiáo', en: 'road', fr: 'route' },
  { zh: '褲子', py: 'kùzi', mw: '條', mwPy: 'tiáo', en: 'pair of trousers', fr: 'pantalon' },
  { zh: '蛇', py: 'shé', mw: '條', mwPy: 'tiáo', en: 'snake', fr: 'serpent' },
  { zh: '毛巾', py: 'máojīn', mw: '條', mwPy: 'tiáo', en: 'towel', fr: 'serviette' },
  // 張 zhāng — flat things
  { zh: '紙', py: 'zhǐ', mw: '張', mwPy: 'zhāng', en: 'sheet of paper', fr: 'feuille' },
  { zh: '桌子', py: 'zhuōzi', mw: '張', mwPy: 'zhāng', en: 'table', fr: 'table' },
  { zh: '床', py: 'chuáng', mw: '張', mwPy: 'zhāng', en: 'bed', fr: 'lit' },
  { zh: '票', py: 'piào', mw: '張', mwPy: 'zhāng', en: 'ticket', fr: 'billet' },
  { zh: '照片', py: 'zhàopiàn', mw: '張', mwPy: 'zhāng', en: 'photo', fr: 'photo' },
  { zh: '地圖', py: 'dìtú', mw: '張', mwPy: 'zhāng', en: 'map', fr: 'carte' },
  // 個 gè — the general classifier
  { zh: '人', py: 'rén', mw: '個', mwPy: 'gè', en: 'person', fr: 'personne' },
  { zh: '問題', py: 'wèntí', mw: '個', mwPy: 'gè', en: 'question', fr: 'question' },
  { zh: '朋友', py: 'péngyǒu', mw: '個', mwPy: 'gè', en: 'friend', fr: 'ami' },
  { zh: '故事', py: 'gùshi', mw: '個', mwPy: 'gè', en: 'story', fr: 'histoire' },
  // 顆 kē — small round things
  { zh: '蘋果', py: 'píngguǒ', mw: '顆', mwPy: 'kē', en: 'apple', fr: 'pomme' },
  { zh: '蛋', py: 'dàn', mw: '顆', mwPy: 'kē', en: 'egg', fr: 'œuf' },
  { zh: '星星', py: 'xīngxing', mw: '顆', mwPy: 'kē', en: 'star', fr: 'étoile' },
  { zh: '糖', py: 'táng', mw: '顆', mwPy: 'kē', en: 'sweet', fr: 'bonbon' },
  // 朵 duǒ — flowers & clouds
  { zh: '花', py: 'huā', mw: '朵', mwPy: 'duǒ', en: 'flower', fr: 'fleur' },
  { zh: '雲', py: 'yún', mw: '朵', mwPy: 'duǒ', en: 'cloud', fr: 'nuage' },
  { zh: '玫瑰', py: 'méiguī', mw: '朵', mwPy: 'duǒ', en: 'rose', fr: 'rose' },
  // 位 wèi — people (polite)
  { zh: '老師', py: 'lǎoshī', mw: '位', mwPy: 'wèi', en: 'teacher', fr: 'professeur' },
  { zh: '醫生', py: 'yīshēng', mw: '位', mwPy: 'wèi', en: 'doctor', fr: 'médecin' },
  { zh: '客人', py: 'kèrén', mw: '位', mwPy: 'wèi', en: 'guest', fr: 'invité' },
  // 件 jiàn — clothes, matters, gifts
  { zh: '衣服', py: 'yīfú', mw: '件', mwPy: 'jiàn', en: 'piece of clothing', fr: 'vêtement' },
  { zh: '禮物', py: 'lǐwù', mw: '件', mwPy: 'jiàn', en: 'gift', fr: 'cadeau' },
  { zh: '外套', py: 'wàitào', mw: '件', mwPy: 'jiàn', en: 'jacket', fr: 'veste' },
  { zh: '事情', py: 'shìqing', mw: '件', mwPy: 'jiàn', en: 'matter', fr: 'affaire' },
  // 雙 shuāng — pairs
  { zh: '鞋子', py: 'xiézi', mw: '雙', mwPy: 'shuāng', en: 'pair of shoes', fr: 'paire de chaussures' },
  { zh: '筷子', py: 'kuàizi', mw: '雙', mwPy: 'shuāng', en: 'pair of chopsticks', fr: 'paire de baguettes' },
  { zh: '襪子', py: 'wàzi', mw: '雙', mwPy: 'shuāng', en: 'pair of socks', fr: 'paire de chaussettes' },
  // 把 bǎ — things with a handle
  { zh: '傘', py: 'sǎn', mw: '把', mwPy: 'bǎ', en: 'umbrella', fr: 'parapluie' },
  { zh: '椅子', py: 'yǐzi', mw: '把', mwPy: 'bǎ', en: 'chair', fr: 'chaise' },
  { zh: '刀', py: 'dāo', mw: '把', mwPy: 'bǎ', en: 'knife', fr: 'couteau' },
  { zh: '鑰匙', py: 'yàoshi', mw: '把', mwPy: 'bǎ', en: 'key', fr: 'clé' },
  // 支 zhī — stick-like things
  { zh: '筆', py: 'bǐ', mw: '支', mwPy: 'zhī', en: 'pen', fr: 'stylo' },
  { zh: '手機', py: 'shǒujī', mw: '支', mwPy: 'zhī', en: 'mobile phone', fr: 'téléphone' },
  { zh: '鉛筆', py: 'qiānbǐ', mw: '支', mwPy: 'zhī', en: 'pencil', fr: 'crayon' },
  // 台 tái — machines & appliances
  { zh: '電腦', py: 'diànnǎo', mw: '台', mwPy: 'tái', en: 'computer', fr: 'ordinateur' },
  { zh: '電視', py: 'diànshì', mw: '台', mwPy: 'tái', en: 'television', fr: 'télévision' },
  { zh: '冰箱', py: 'bīngxiāng', mw: '台', mwPy: 'tái', en: 'fridge', fr: 'réfrigérateur' },
  { zh: '相機', py: 'xiàngjī', mw: '台', mwPy: 'tái', en: 'camera', fr: 'appareil photo' },
  // 部 bù — films
  { zh: '電影', py: 'diànyǐng', mw: '部', mwPy: 'bù', en: 'film', fr: 'film' },
  // 間 jiān — rooms
  { zh: '房間', py: 'fángjiān', mw: '間', mwPy: 'jiān', en: 'room', fr: 'chambre' },
  { zh: '教室', py: 'jiàoshì', mw: '間', mwPy: 'jiān', en: 'classroom', fr: 'salle de classe' },
  // 棟 dòng / 座 zuò — buildings & large structures
  { zh: '房子', py: 'fángzi', mw: '棟', mwPy: 'dòng', en: 'house', fr: 'maison' },
  { zh: '山', py: 'shān', mw: '座', mwPy: 'zuò', en: 'mountain', fr: 'montagne' },
  { zh: '橋', py: 'qiáo', mw: '座', mwPy: 'zuò', en: 'bridge', fr: 'pont' },
  // 頭 tóu / 匹 pǐ — livestock
  { zh: '牛', py: 'niú', mw: '頭', mwPy: 'tóu', en: 'cow', fr: 'vache' },
  { zh: '豬', py: 'zhū', mw: '頭', mwPy: 'tóu', en: 'pig', fr: 'cochon' },
  { zh: '羊', py: 'yáng', mw: '頭', mwPy: 'tóu', en: 'sheep', fr: 'mouton' },
  { zh: '馬', py: 'mǎ', mw: '匹', mwPy: 'pǐ', en: 'horse', fr: 'cheval' },
  // 副 fù / 串 chuàn / 包 bāo — sets, bunches, packs
  { zh: '眼鏡', py: 'yǎnjìng', mw: '副', mwPy: 'fù', en: 'pair of glasses', fr: 'paire de lunettes' },
  { zh: '葡萄', py: 'pútáo', mw: '串', mwPy: 'chuàn', en: 'bunch of grapes', fr: 'grappe de raisins' },
  { zh: '餅乾', py: 'bǐnggān', mw: '包', mwPy: 'bāo', en: 'pack of biscuits', fr: 'paquet de biscuits' },
  // 碗 wǎn — bowls
  { zh: '飯', py: 'fàn', mw: '碗', mwPy: 'wǎn', en: 'bowl of rice', fr: 'bol de riz' },
  { zh: '麵', py: 'miàn', mw: '碗', mwPy: 'wǎn', en: 'bowl of noodles', fr: 'bol de nouilles' },
  { zh: '湯', py: 'tāng', mw: '碗', mwPy: 'wǎn', en: 'bowl of soup', fr: 'bol de soupe' },
  // 塊 kuài / 片 piàn — chunks & slices
  { zh: '蛋糕', py: 'dàngāo', mw: '塊', mwPy: 'kuài', en: 'piece of cake', fr: 'part de gâteau' },
  { zh: '肉', py: 'ròu', mw: '塊', mwPy: 'kuài', en: 'piece of meat', fr: 'morceau de viande' },
  { zh: '麵包', py: 'miànbāo', mw: '片', mwPy: 'piàn', en: 'slice of bread', fr: 'tranche de pain' },
  // 棵 kē / 根 gēn — plants & slender things
  { zh: '樹', py: 'shù', mw: '棵', mwPy: 'kē', en: 'tree', fr: 'arbre' },
  { zh: '香蕉', py: 'xiāngjiāo', mw: '根', mwPy: 'gēn', en: 'banana', fr: 'banane' },
  { zh: '頭髮', py: 'tóufǎ', mw: '根', mwPy: 'gēn', en: 'strand of hair', fr: 'cheveu' },
  // 首 shǒu / 封 fēng / 篇 piān / 幅 fú — songs, letters, texts, paintings
  { zh: '歌', py: 'gē', mw: '首', mwPy: 'shǒu', en: 'song', fr: 'chanson' },
  { zh: '信', py: 'xìn', mw: '封', mwPy: 'fēng', en: 'letter', fr: 'lettre' },
  { zh: '文章', py: 'wénzhāng', mw: '篇', mwPy: 'piān', en: 'article', fr: 'article' },
  { zh: '畫', py: 'huà', mw: '幅', mwPy: 'fú', en: 'painting', fr: 'tableau' },
  // 頂 dǐng / 場 chǎng / 節 jié — hats, events, lessons
  { zh: '帽子', py: 'màozi', mw: '頂', mwPy: 'dǐng', en: 'hat', fr: 'chapeau' },
  { zh: '比賽', py: 'bǐsài', mw: '場', mwPy: 'chǎng', en: 'match', fr: 'match' },
  { zh: '課', py: 'kè', mw: '節', mwPy: 'jié', en: 'class', fr: 'cours' },
  // 家 jiā / 所 suǒ — establishments
  { zh: '公司', py: 'gōngsī', mw: '家', mwPy: 'jiā', en: 'company', fr: 'entreprise' },
  { zh: '商店', py: 'shāngdiàn', mw: '家', mwPy: 'jiā', en: 'shop', fr: 'magasin' },
  { zh: '餐廳', py: 'cāntīng', mw: '家', mwPy: 'jiā', en: 'restaurant', fr: 'restaurant' },
  { zh: '醫院', py: 'yīyuàn', mw: '家', mwPy: 'jiā', en: 'hospital', fr: 'hôpital' },
  { zh: '學校', py: 'xuéxiào', mw: '所', mwPy: 'suǒ', en: 'school', fr: 'école' },
  // 扇 shàn — doors & windows
  { zh: '門', py: 'mén', mw: '扇', mwPy: 'shàn', en: 'door', fr: 'porte' },
  { zh: '窗戶', py: 'chuānghu', mw: '扇', mwPy: 'shàn', en: 'window', fr: 'fenêtre' },
];

// 2 directly before a measure word is 兩, not 二.
function countZh(n) {
  return n === 2 ? '兩' : spellNumber(n);
}
function countPy(n) {
  return n === 2 ? 'liǎng' : [...spellNumber(n)].map(charPinyin).join('');
}

export function buildCountPhrase(n, noun) {
  const tokens = [
    { id: 't0', zh: countZh(n), py: countPy(n), en: String(n), fr: String(n) },
    { id: 't1', zh: noun.mw, py: noun.mwPy, en: '(measure word)', fr: '(classificateur)' },
    { id: 't2', zh: noun.zh, py: noun.py, en: noun.en, fr: noun.fr },
  ];
  const speak = tokens.map((t) => t.zh).join('');
  const plural = n > 1 ? 's' : '';
  return {
    id: `count-${n}-${noun.zh}`,
    value: n,
    display: `${n} × ${noun.zh}`,
    speak,
    tokens,
    gloss: {
      en: `${n} ${noun.en}${plural}`,
      fr: `${n} ${noun.fr}${n > 1 ? 's' : ''}`,
    },
  };
}

export function generateCount(rand = Math.random, prevId = null) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const n = 1 + Math.floor(rand() * 10); // 1–10
    const noun = NOUNS[Math.floor(rand() * NOUNS.length)];
    const item = buildCountPhrase(n, noun);
    if (item.id !== prevId) return item;
  }
  return buildCountPhrase(2, NOUNS[1]);
}

export { NOUNS };
