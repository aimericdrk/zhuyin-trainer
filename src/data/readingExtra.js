// Curated beginner sentences for Reading + Dictation, reusing vocabulary that
// already appears across the app so they reinforce it. Each word carries char,
// pinyin, zhuyin and bilingual gloss — the shape the Reading screen and the
// dictation generator expect.
const w = (char, pinyin, zhuyin, en, fr) => ({ char, pinyin, zhuyin, en, fr });

export const READING_EXTRA = [
  {
    chinese: '我喜歡喝茶。',
    words: [w('我', 'wǒ', 'ㄨㄛˇ', 'I', 'je'), w('喜歡', 'xǐhuān', 'ㄒㄧˇ ㄏㄨㄢ', 'to like', 'aimer'), w('喝', 'hē', 'ㄏㄜ', 'to drink', 'boire'), w('茶', 'chá', 'ㄔㄚˊ', 'tea', 'thé')],
    translation: { en: 'I like drinking tea.', fr: "J'aime boire du thé." },
  },
  {
    chinese: '今天天氣很好。',
    words: [w('今天', 'jīntiān', 'ㄐㄧㄣ ㄊㄧㄢ', 'today', "aujourd'hui"), w('天氣', 'tiānqì', 'ㄊㄧㄢ ㄑㄧˋ', 'weather', 'temps'), w('很', 'hěn', 'ㄏㄣˇ', 'very', 'très'), w('好', 'hǎo', 'ㄏㄠˇ', 'good', 'bon')],
    translation: { en: 'The weather is nice today.', fr: "Il fait beau aujourd'hui." },
  },
  {
    chinese: '我有兩隻貓。',
    words: [w('我', 'wǒ', 'ㄨㄛˇ', 'I', 'je'), w('有', 'yǒu', 'ㄧㄡˇ', 'to have', 'avoir'), w('兩', 'liǎng', 'ㄌㄧㄤˇ', 'two', 'deux'), w('隻', 'zhī', 'ㄓ', '(measure word)', '(classificateur)'), w('貓', 'māo', 'ㄇㄠ', 'cat', 'chat')],
    translation: { en: 'I have two cats.', fr: "J'ai deux chats." },
  },
  {
    chinese: '他是我的老師。',
    words: [w('他', 'tā', 'ㄊㄚ', 'he', 'il'), w('是', 'shì', 'ㄕˋ', 'to be', 'être'), w('我的', 'wǒ de', 'ㄨㄛˇ ㄉㄜ˙', 'my', 'mon'), w('老師', 'lǎoshī', 'ㄌㄠˇ ㄕ', 'teacher', 'professeur')],
    translation: { en: 'He is my teacher.', fr: 'Il est mon professeur.' },
  },
  {
    chinese: '現在三點半。',
    words: [w('現在', 'xiànzài', 'ㄒㄧㄢˋ ㄗㄞˋ', 'now', 'maintenant'), w('三', 'sān', 'ㄙㄢ', 'three', 'trois'), w('點', 'diǎn', 'ㄉㄧㄢˇ', "o'clock", 'heure'), w('半', 'bàn', 'ㄅㄢˋ', 'half', 'demie')],
    translation: { en: "It's half past three now.", fr: 'Il est trois heures et demie.' },
  },
  {
    chinese: '這個多少錢?',
    words: [w('這個', 'zhège', 'ㄓㄜˋ ㄍㄜ˙', 'this', 'ceci'), w('多少', 'duōshǎo', 'ㄉㄨㄛ ㄕㄠˇ', 'how much', 'combien'), w('錢', 'qián', 'ㄑㄧㄢˊ', 'money', 'argent')],
    translation: { en: 'How much is this?', fr: 'Combien ça coûte ?' },
  },
  {
    chinese: '我們去公園吧。',
    words: [w('我們', 'wǒmen', 'ㄨㄛˇ ㄇㄣ˙', 'we', 'nous'), w('去', 'qù', 'ㄑㄩˋ', 'to go', 'aller'), w('公園', 'gōngyuán', 'ㄍㄨㄥ ㄩㄢˊ', 'park', 'parc'), w('吧', 'ba', 'ㄅㄚ˙', '(suggestion)', '(suggestion)')],
    translation: { en: "Let's go to the park.", fr: 'Allons au parc.' },
  },
  {
    chinese: '你喜歡什麼運動?',
    words: [w('你', 'nǐ', 'ㄋㄧˇ', 'you', 'tu'), w('喜歡', 'xǐhuān', 'ㄒㄧˇ ㄏㄨㄢ', 'to like', 'aimer'), w('什麼', 'shénme', 'ㄕㄣˊ ㄇㄜ˙', 'what', 'quel'), w('運動', 'yùndòng', 'ㄩㄣˋ ㄉㄨㄥˋ', 'sport', 'sport')],
    translation: { en: 'What sport do you like?', fr: 'Quel sport aimes-tu ?' },
  },
  {
    chinese: '媽媽在廚房做飯。',
    words: [w('媽媽', 'māma', 'ㄇㄚ ㄇㄚ˙', 'mum', 'maman'), w('在', 'zài', 'ㄗㄞˋ', 'at / in', 'dans'), w('廚房', 'chúfáng', 'ㄔㄨˊ ㄈㄤˊ', 'kitchen', 'cuisine'), w('做飯', 'zuòfàn', 'ㄗㄨㄛˋ ㄈㄢˋ', 'to cook', 'cuisiner')],
    translation: { en: 'Mum is cooking in the kitchen.', fr: 'Maman cuisine dans la cuisine.' },
  },
  {
    chinese: '明天是星期五。',
    words: [w('明天', 'míngtiān', 'ㄇㄧㄥˊ ㄊㄧㄢ', 'tomorrow', 'demain'), w('是', 'shì', 'ㄕˋ', 'to be', 'être'), w('星期五', 'xīngqíwǔ', 'ㄒㄧㄥ ㄑㄧˊ ㄨˇ', 'Friday', 'vendredi')],
    translation: { en: 'Tomorrow is Friday.', fr: 'Demain, c’est vendredi.' },
  },
  {
    chinese: '我想買一杯咖啡。',
    words: [w('我', 'wǒ', 'ㄨㄛˇ', 'I', 'je'), w('想', 'xiǎng', 'ㄒㄧㄤˇ', 'would like', 'vouloir'), w('買', 'mǎi', 'ㄇㄞˇ', 'to buy', 'acheter'), w('一', 'yī', 'ㄧ', 'one / a', 'un'), w('杯', 'bēi', 'ㄅㄟ', 'cup of', 'tasse de'), w('咖啡', 'kāfēi', 'ㄎㄚ ㄈㄟ', 'coffee', 'café')],
    translation: { en: 'I want to buy a coffee.', fr: 'Je veux acheter un café.' },
  },
  {
    chinese: '謝謝你的幫忙。',
    words: [w('謝謝', 'xièxie', 'ㄒㄧㄝˋ ㄒㄧㄝ˙', 'thank you', 'merci'), w('你的', 'nǐ de', 'ㄋㄧˇ ㄉㄜ˙', 'your', 'ton'), w('幫忙', 'bāngmáng', 'ㄅㄤ ㄇㄤˊ', 'help', 'aide')],
    translation: { en: 'Thanks for your help.', fr: 'Merci pour ton aide.' },
  },
  {
    chinese: '我每天七點起床。',
    words: [w('我', 'wǒ', 'ㄨㄛˇ', 'I', 'je'), w('每天', 'měitiān', 'ㄇㄟˇ ㄊㄧㄢ', 'every day', 'chaque jour'), w('七點', 'qī diǎn', 'ㄑㄧ ㄉㄧㄢˇ', "7 o'clock", '7 heures'), w('起床', 'qǐchuáng', 'ㄑㄧˇ ㄔㄨㄤˊ', 'get up', 'se lever')],
    translation: { en: 'I get up at seven every day.', fr: 'Je me lève à sept heures chaque jour.' },
  },
  {
    chinese: '弟弟在學校學中文。',
    words: [w('弟弟', 'dìdi', 'ㄉㄧˋ ㄉㄧ˙', 'younger brother', 'petit frère'), w('在', 'zài', 'ㄗㄞˋ', 'at', 'à'), w('學校', 'xuéxiào', 'ㄒㄩㄝˊ ㄒㄧㄠˋ', 'school', 'école'), w('學', 'xué', 'ㄒㄩㄝˊ', 'to study', 'étudier'), w('中文', 'zhōngwén', 'ㄓㄨㄥ ㄨㄣˊ', 'Chinese', 'chinois')],
    translation: { en: 'My younger brother studies Chinese at school.', fr: 'Mon petit frère étudie le chinois à l’école.' },
  },
  {
    chinese: '我想喝一杯熱咖啡。',
    words: [w('我', 'wǒ', 'ㄨㄛˇ', 'I', 'je'), w('想', 'xiǎng', 'ㄒㄧㄤˇ', 'would like', 'vouloir'), w('喝', 'hē', 'ㄏㄜ', 'to drink', 'boire'), w('一杯', 'yì bēi', 'ㄧ ㄅㄟ', 'a cup of', 'une tasse de'), w('熱', 'rè', 'ㄖㄜˋ', 'hot', 'chaud'), w('咖啡', 'kāfēi', 'ㄎㄚ ㄈㄟ', 'coffee', 'café')],
    translation: { en: 'I want to drink a hot coffee.', fr: 'Je veux boire un café chaud.' },
  },
  {
    chinese: '下雨了,記得帶傘。',
    words: [w('下雨', 'xià yǔ', 'ㄒㄧㄚˋ ㄩˇ', 'to rain', 'pleuvoir'), w('了', 'le', 'ㄌㄜ˙', '(change)', '(particule)'), w('記得', 'jìde', 'ㄐㄧˋ ㄉㄜ˙', 'remember', 'se souvenir'), w('帶', 'dài', 'ㄉㄞˋ', 'to bring', 'apporter'), w('傘', 'sǎn', 'ㄙㄢˇ', 'umbrella', 'parapluie')],
    translation: { en: "It's raining — remember your umbrella.", fr: 'Il pleut, n’oublie pas ton parapluie.' },
  },
  {
    chinese: '你的生日是幾月幾號?',
    words: [w('你的', 'nǐ de', 'ㄋㄧˇ ㄉㄜ˙', 'your', 'ton'), w('生日', 'shēngrì', 'ㄕㄥ ㄖˋ', 'birthday', 'anniversaire'), w('是', 'shì', 'ㄕˋ', 'is', 'est'), w('幾月', 'jǐ yuè', 'ㄐㄧˇ ㄩㄝˋ', 'which month', 'quel mois'), w('幾號', 'jǐ hào', 'ㄐㄧˇ ㄏㄠˋ', 'which day', 'quel jour')],
    translation: { en: 'When is your birthday?', fr: 'Quand est ton anniversaire ?' },
  },
  {
    chinese: '週末我們去看電影吧。',
    words: [w('週末', 'zhōumò', 'ㄓㄡ ㄇㄛˋ', 'weekend', 'week-end'), w('我們', 'wǒmen', 'ㄨㄛˇ ㄇㄣ˙', 'we', 'nous'), w('去', 'qù', 'ㄑㄩˋ', 'to go', 'aller'), w('看', 'kàn', 'ㄎㄢˋ', 'to watch', 'regarder'), w('電影', 'diànyǐng', 'ㄉㄧㄢˋ ㄧㄥˇ', 'movie', 'film'), w('吧', 'ba', 'ㄅㄚ˙', '(suggestion)', '(suggestion)')],
    translation: { en: "Let's go see a movie this weekend.", fr: 'Allons voir un film ce week-end.' },
  },
  {
    chinese: '老師說我們很棒。',
    words: [w('老師', 'lǎoshī', 'ㄌㄠˇ ㄕ', 'teacher', 'professeur'), w('說', 'shuō', 'ㄕㄨㄛ', 'to say', 'dire'), w('我們', 'wǒmen', 'ㄨㄛˇ ㄇㄣ˙', 'we', 'nous'), w('很', 'hěn', 'ㄏㄣˇ', 'very', 'très'), w('棒', 'bàng', 'ㄅㄤˋ', 'great', 'génial')],
    translation: { en: 'The teacher says we are great.', fr: 'Le professeur dit que nous sommes super.' },
  },
];
