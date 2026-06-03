// Guided conversations. Each dialogue is a sequence of steps:
//   { who: 'partner', zh, py, en, fr }      → the other person speaks
//   { who: 'choose', options: [ {zh,py,en,fr} ] } → you pick how to reply
// Any reply advances (all are plausible) — it's guided production practice, not
// a test. The partner's lines auto-play; tap any bubble to replay it.
export const DIALOGUES = [
  {
    id: 'meet', icon: '👋', title: { en: 'Meeting someone', fr: 'Faire connaissance' },
    steps: [
      { who: 'partner', zh: '你好!', py: 'nǐ hǎo', en: 'Hello!', fr: 'Bonjour !' },
      { who: 'choose', options: [
        { zh: '你好!', py: 'nǐ hǎo', en: 'Hello!', fr: 'Bonjour !' },
        { zh: '嗨!', py: 'hāi', en: 'Hi!', fr: 'Salut !' },
      ] },
      { who: 'partner', zh: '你叫什麼名字?', py: 'nǐ jiào shénme míngzì?', en: "What's your name?", fr: 'Comment tu t’appelles ?' },
      { who: 'choose', options: [
        { zh: '我叫小明。', py: 'wǒ jiào Xiǎomíng', en: "I'm Xiaoming.", fr: 'Je m’appelle Xiaoming.' },
        { zh: '我姓陳。', py: 'wǒ xìng Chén', en: 'My surname is Chen.', fr: 'Je m’appelle Chen.' },
      ] },
      { who: 'partner', zh: '很高興認識你!', py: 'hěn gāoxìng rènshì nǐ', en: 'Nice to meet you!', fr: 'Enchanté !' },
      { who: 'choose', options: [
        { zh: '我也是!', py: 'wǒ yě shì', en: 'You too!', fr: 'Moi aussi !' },
        { zh: '認識你很開心。', py: 'rènshì nǐ hěn kāixīn', en: 'Happy to meet you.', fr: 'Ravi de te connaître.' },
      ] },
      { who: 'partner', zh: '再見!', py: 'zàijiàn', en: 'Goodbye!', fr: 'Au revoir !' },
    ],
  },
  {
    id: 'restaurant', icon: '🍜', title: { en: 'At a restaurant', fr: 'Au restaurant' },
    steps: [
      { who: 'partner', zh: '歡迎光臨!請問幾位?', py: 'huānyíng guānglín! qǐngwèn jǐ wèi?', en: 'Welcome! How many people?', fr: 'Bienvenue ! Combien de personnes ?' },
      { who: 'choose', options: [
        { zh: '兩位。', py: 'liǎng wèi', en: 'Two.', fr: 'Deux.' },
        { zh: '一位。', py: 'yí wèi', en: 'Just one.', fr: 'Une seule.' },
      ] },
      { who: 'partner', zh: '請問要點什麼?', py: 'qǐngwèn yào diǎn shénme?', en: 'What would you like to order?', fr: 'Que désirez-vous commander ?' },
      { who: 'choose', options: [
        { zh: '我要牛肉麵。', py: 'wǒ yào niúròu miàn', en: 'Beef noodles, please.', fr: 'Des nouilles au bœuf.' },
        { zh: '我要一碗飯。', py: 'wǒ yào yì wǎn fàn', en: 'A bowl of rice.', fr: 'Un bol de riz.' },
      ] },
      { who: 'partner', zh: '要喝什麼嗎?', py: 'yào hē shénme ma?', en: 'Anything to drink?', fr: 'Quelque chose à boire ?' },
      { who: 'choose', options: [
        { zh: '一杯茶,謝謝。', py: 'yì bēi chá, xièxie', en: 'A tea, thanks.', fr: 'Un thé, merci.' },
        { zh: '我要水就好。', py: 'wǒ yào shuǐ jiù hǎo', en: 'Just water.', fr: "De l'eau, ça ira." },
      ] },
      { who: 'partner', zh: '好的,請稍等。', py: 'hǎo de, qǐng shāo děng', en: 'Okay, please wait a moment.', fr: 'Très bien, un instant.' },
    ],
  },
  {
    id: 'shopping', icon: '🛍️', title: { en: 'Shopping', fr: 'Faire les courses' },
    steps: [
      { who: 'partner', zh: '您好,需要幫忙嗎?', py: 'nín hǎo, xūyào bāngmáng ma?', en: 'Hello, need any help?', fr: 'Bonjour, je peux vous aider ?' },
      { who: 'choose', options: [
        { zh: '我想買這個。', py: 'wǒ xiǎng mǎi zhège', en: 'I want to buy this.', fr: 'Je veux acheter ça.' },
        { zh: '我只是看看。', py: 'wǒ zhǐshì kànkan', en: "I'm just looking.", fr: 'Je regarde seulement.' },
      ] },
      { who: 'partner', zh: '這個三百塊。', py: 'zhège sānbǎi kuài', en: 'This is 300 dollars.', fr: 'Celui-ci fait 300.' },
      { who: 'choose', options: [
        { zh: '太貴了!', py: 'tài guì le', en: 'Too expensive!', fr: 'Trop cher !' },
        { zh: '可以便宜一點嗎?', py: 'kěyǐ piányí yìdiǎn ma?', en: 'Can it be cheaper?', fr: 'Un peu moins cher ?' },
      ] },
      { who: 'partner', zh: '好啦,算你兩百五。', py: 'hǎo la, suàn nǐ liǎngbǎi wǔ', en: 'Fine, 250 for you.', fr: 'D’accord, 250 pour vous.' },
      { who: 'choose', options: [
        { zh: '好,我買了。', py: 'hǎo, wǒ mǎi le', en: "Okay, I'll take it.", fr: 'D’accord, je le prends.' },
        { zh: '謝謝!', py: 'xièxie', en: 'Thank you!', fr: 'Merci !' },
      ] },
      { who: 'partner', zh: '謝謝光臨!', py: 'xièxie guānglín', en: 'Thanks for coming!', fr: 'Merci de votre visite !' },
    ],
  },
  {
    id: 'directions', icon: '🧭', title: { en: 'Asking directions', fr: 'Demander son chemin' },
    steps: [
      { who: 'partner', zh: '請問,需要幫忙嗎?', py: 'qǐngwèn, xūyào bāngmáng ma?', en: 'Excuse me, do you need help?', fr: 'Excusez-moi, besoin d’aide ?' },
      { who: 'choose', options: [
        { zh: '車站怎麼走?', py: 'chēzhàn zěnme zǒu?', en: 'How do I get to the station?', fr: 'Comment aller à la gare ?' },
        { zh: '請問廁所在哪裡?', py: 'qǐngwèn cèsuǒ zài nǎlǐ?', en: 'Where is the toilet?', fr: 'Où sont les toilettes ?' },
      ] },
      { who: 'partner', zh: '直走,然後右轉。', py: 'zhí zǒu, ránhòu yòu zhuǎn', en: 'Go straight, then turn right.', fr: 'Tout droit, puis à droite.' },
      { who: 'choose', options: [
        { zh: '遠嗎?', py: 'yuǎn ma?', en: 'Is it far?', fr: 'C’est loin ?' },
        { zh: '謝謝你!', py: 'xièxie nǐ', en: 'Thank you!', fr: 'Merci !' },
      ] },
      { who: 'partner', zh: '不遠,走五分鐘就到了。', py: 'bù yuǎn, zǒu wǔ fēnzhōng jiù dào le', en: "Not far — 5 minutes' walk.", fr: 'Pas loin, 5 minutes à pied.' },
      { who: 'choose', options: [
        { zh: '太好了,謝謝!', py: 'tài hǎo le, xièxie', en: 'Great, thanks!', fr: 'Super, merci !' },
        { zh: '麻煩你了。', py: 'máfan nǐ le', en: 'Thanks for the trouble.', fr: 'Merci du dérangement.' },
      ] },
      { who: 'partner', zh: '不客氣!', py: 'bú kèqi', en: "You're welcome!", fr: 'Je vous en prie !' },
    ],
  },
  {
    id: 'doctor', icon: '🏥', title: { en: 'At the doctor', fr: 'Chez le médecin' },
    steps: [
      { who: 'partner', zh: '你哪裡不舒服?', py: 'nǐ nǎlǐ bù shūfú?', en: 'Where do you feel unwell?', fr: 'Où avez-vous mal ?' },
      { who: 'choose', options: [
        { zh: '我頭痛。', py: 'wǒ tóu tòng', en: 'I have a headache.', fr: "J'ai mal à la tête." },
        { zh: '我肚子痛。', py: 'wǒ dùzi tòng', en: 'I have a stomachache.', fr: "J'ai mal au ventre." },
      ] },
      { who: 'partner', zh: '有發燒嗎?', py: 'yǒu fāshāo ma?', en: 'Do you have a fever?', fr: 'Avez-vous de la fièvre ?' },
      { who: 'choose', options: [
        { zh: '有一點。', py: 'yǒu yìdiǎn', en: 'A little.', fr: 'Un peu.' },
        { zh: '沒有。', py: 'méiyǒu', en: 'No.', fr: 'Non.' },
      ] },
      { who: 'partner', zh: '多喝水,早點休息。', py: 'duō hē shuǐ, zǎodiǎn xiūxí', en: 'Drink water and rest early.', fr: "Buvez de l'eau et reposez-vous." },
      { who: 'choose', options: [
        { zh: '好,謝謝醫生。', py: 'hǎo, xièxie yīshēng', en: 'Okay, thank you, doctor.', fr: 'D’accord, merci docteur.' },
        { zh: '我知道了。', py: 'wǒ zhīdào le', en: 'I understand.', fr: 'Je comprends.' },
      ] },
      { who: 'partner', zh: '祝你早日康復!', py: 'zhù nǐ zǎorì kāngfù', en: 'Get well soon!', fr: 'Prompt rétablissement !' },
    ],
  },
  {
    id: 'plans', icon: '⏰', title: { en: 'Making plans', fr: 'Prendre rendez-vous' },
    steps: [
      { who: 'partner', zh: '我們幾點見面?', py: 'wǒmen jǐ diǎn jiànmiàn?', en: 'What time shall we meet?', fr: 'À quelle heure on se voit ?' },
      { who: 'choose', options: [
        { zh: '下午三點。', py: 'xiàwǔ sān diǎn', en: '3 in the afternoon.', fr: '15 heures.' },
        { zh: '晚上七點。', py: 'wǎnshàng qī diǎn', en: '7 in the evening.', fr: '19 heures.' },
      ] },
      { who: 'partner', zh: '在哪裡見?', py: 'zài nǎlǐ jiàn?', en: 'Where shall we meet?', fr: 'Où se retrouve-t-on ?' },
      { who: 'choose', options: [
        { zh: '在車站。', py: 'zài chēzhàn', en: 'At the station.', fr: 'À la gare.' },
        { zh: '在你家。', py: 'zài nǐ jiā', en: 'At your place.', fr: 'Chez toi.' },
      ] },
      { who: 'partner', zh: '好,不見不散!', py: 'hǎo, bùjiàn-búsàn', en: "Okay, see you there!", fr: 'D’accord, on s’y retrouve !' },
      { who: 'choose', options: [
        { zh: '一言為定!', py: 'yìyán-wéidìng', en: "It's a deal!", fr: 'C’est convenu !' },
        { zh: '到時候見!', py: 'dào shíhòu jiàn', en: 'See you then!', fr: 'À tout à l’heure !' },
      ] },
      { who: 'partner', zh: '再見!', py: 'zàijiàn', en: 'Goodbye!', fr: 'Au revoir !' },
    ],
  },
  {
    id: 'smalltalk', icon: '☕', title: { en: 'Small talk', fr: 'Bavardage' },
    steps: [
      { who: 'partner', zh: '你週末通常做什麼?', py: 'nǐ zhōumò tōngcháng zuò shénme?', en: 'What do you usually do on weekends?', fr: 'Que fais-tu le week-end ?' },
      { who: 'choose', options: [
        { zh: '我喜歡看書。', py: 'wǒ xǐhuān kàn shū', en: 'I like reading.', fr: "J'aime lire." },
        { zh: '我常常運動。', py: 'wǒ chángcháng yùndòng', en: 'I often exercise.', fr: 'Je fais souvent du sport.' },
      ] },
      { who: 'partner', zh: '聽起來很不錯!', py: 'tīng qǐlái hěn búcuò', en: 'Sounds great!', fr: 'Ça a l’air super !' },
      { who: 'choose', options: [
        { zh: '你呢?', py: 'nǐ ne?', en: 'And you?', fr: 'Et toi ?' },
        { zh: '你喜歡什麼?', py: 'nǐ xǐhuān shénme?', en: 'What do you like?', fr: "Qu'aimes-tu ?" },
      ] },
      { who: 'partner', zh: '我喜歡聽音樂。', py: 'wǒ xǐhuān tīng yīnyuè', en: 'I like listening to music.', fr: "J'aime écouter de la musique." },
      { who: 'choose', options: [
        { zh: '我們很像!', py: 'wǒmen hěn xiàng', en: "We're alike!", fr: 'On se ressemble !' },
        { zh: '真有趣!', py: 'zhēn yǒuqù', en: 'How interesting!', fr: 'Intéressant !' },
      ] },
      { who: 'partner', zh: '改天一起出去吧!', py: 'gǎitiān yìqǐ chūqù ba', en: "Let's hang out sometime!", fr: 'On sortira un de ces jours !' },
    ],
  },
  {
    id: 'hotel', icon: '🏨', title: { en: 'Hotel check-in', fr: "À l'hôtel" },
    steps: [
      { who: 'partner', zh: '您好,有預訂嗎?', py: 'nín hǎo, yǒu yùdìng ma?', en: 'Hello, do you have a reservation?', fr: 'Bonjour, avez-vous une réservation ?' },
      { who: 'choose', options: [
        { zh: '有,我姓林。', py: 'yǒu, wǒ xìng Lín', en: 'Yes, my surname is Lin.', fr: 'Oui, je m’appelle Lin.' },
        { zh: '沒有。', py: 'méiyǒu', en: 'No.', fr: 'Non.' },
      ] },
      { who: 'partner', zh: '請問住幾晚?', py: 'qǐngwèn zhù jǐ wǎn?', en: 'How many nights?', fr: 'Combien de nuits ?' },
      { who: 'choose', options: [
        { zh: '兩晚。', py: 'liǎng wǎn', en: 'Two nights.', fr: 'Deux nuits.' },
        { zh: '一晚。', py: 'yì wǎn', en: 'One night.', fr: 'Une nuit.' },
      ] },
      { who: 'partner', zh: '這是您的房卡。', py: 'zhè shì nín de fángkǎ', en: 'Here is your room card.', fr: 'Voici votre carte de chambre.' },
      { who: 'choose', options: [
        { zh: '早餐幾點?', py: 'zǎocān jǐ diǎn?', en: 'What time is breakfast?', fr: 'Le petit-déjeuner à quelle heure ?' },
        { zh: '謝謝!', py: 'xièxie', en: 'Thank you!', fr: 'Merci !' },
      ] },
      { who: 'partner', zh: '早餐七點開始。', py: 'zǎocān qī diǎn kāishǐ', en: 'Breakfast starts at 7.', fr: 'Le petit-déjeuner commence à 7 h.' },
    ],
  },
  {
    id: 'taxi', icon: '🚕', title: { en: 'Taking a taxi', fr: 'Prendre un taxi' },
    steps: [
      { who: 'partner', zh: '您要去哪裡?', py: 'nín yào qù nǎlǐ?', en: 'Where would you like to go?', fr: 'Où voulez-vous aller ?' },
      { who: 'choose', options: [
        { zh: '我要去火車站。', py: 'wǒ yào qù huǒchēzhàn', en: 'To the train station.', fr: 'À la gare.' },
        { zh: '請到這個地址。', py: 'qǐng dào zhège dìzhǐ', en: 'To this address, please.', fr: 'À cette adresse.' },
      ] },
      { who: 'partner', zh: '好,大概十分鐘。', py: 'hǎo, dàgài shí fēnzhōng', en: 'Okay, about ten minutes.', fr: 'D’accord, environ dix minutes.' },
      { who: 'choose', options: [
        { zh: '謝謝。', py: 'xièxie', en: 'Thank you.', fr: 'Merci.' },
        { zh: '可以快一點嗎?', py: 'kěyǐ kuài yìdiǎn ma?', en: 'Could you go a bit faster?', fr: 'Un peu plus vite ?' },
      ] },
      { who: 'partner', zh: '到了,一百五十塊。', py: 'dào le, yìbǎi wǔshí kuài', en: "Here we are — 150 dollars.", fr: 'On y est, 150.' },
      { who: 'choose', options: [
        { zh: '這是兩百,不用找了。', py: 'zhè shì liǎngbǎi, búyòng zhǎo le', en: "Here's 200, keep the change.", fr: 'Voici 200, gardez la monnaie.' },
        { zh: '謝謝,再見。', py: 'xièxie, zàijiàn', en: 'Thanks, goodbye.', fr: 'Merci, au revoir.' },
      ] },
      { who: 'partner', zh: '謝謝,祝您愉快!', py: 'xièxie, zhù nín yúkuài', en: 'Thanks, have a nice day!', fr: 'Merci, bonne journée !' },
    ],
  },
  {
    id: 'phone', icon: '📞', title: { en: 'A phone call', fr: 'Un appel téléphonique' },
    steps: [
      { who: 'partner', zh: '喂,請問哪位?', py: 'wéi, qǐngwèn nǎ wèi?', en: 'Hello, who is this?', fr: 'Allô, qui est-ce ?' },
      { who: 'choose', options: [
        { zh: '我是小明。', py: 'wǒ shì Xiǎomíng', en: "It's Xiaoming.", fr: "C'est Xiaoming." },
        { zh: '請問小華在嗎?', py: 'qǐngwèn Xiǎohuá zài ma?', en: 'Is Xiaohua there?', fr: 'Xiaohua est là ?' },
      ] },
      { who: 'partner', zh: '他現在不在。', py: 'tā xiànzài bú zài', en: "He's not here right now.", fr: "Il n'est pas là." },
      { who: 'choose', options: [
        { zh: '那我晚點再打。', py: 'nà wǒ wǎndiǎn zài dǎ', en: "I'll call back later.", fr: 'Je rappellerai plus tard.' },
        { zh: '可以幫我留言嗎?', py: 'kěyǐ bāng wǒ liúyán ma?', en: 'Can you take a message?', fr: 'Pouvez-vous prendre un message ?' },
      ] },
      { who: 'partner', zh: '好的,沒問題。', py: 'hǎo de, méi wèntí', en: 'Sure, no problem.', fr: 'D’accord, pas de problème.' },
      { who: 'choose', options: [
        { zh: '謝謝,再見。', py: 'xièxie, zàijiàn', en: 'Thanks, bye.', fr: 'Merci, au revoir.' },
        { zh: '麻煩你了。', py: 'máfan nǐ le', en: 'Thanks for your trouble.', fr: 'Merci du dérangement.' },
      ] },
      { who: 'partner', zh: '不客氣,再見!', py: 'bú kèqi, zàijiàn', en: "You're welcome, bye!", fr: 'Je vous en prie, au revoir !' },
    ],
  },
  {
    id: 'drink', icon: '🧋', title: { en: 'Ordering a drink', fr: 'Commander une boisson' },
    steps: [
      { who: 'partner', zh: '歡迎光臨,要喝什麼?', py: 'huānyíng guānglín, yào hē shénme?', en: 'Welcome! What would you like to drink?', fr: 'Bienvenue ! Que désirez-vous boire ?' },
      { who: 'choose', options: [
        { zh: '我要珍珠奶茶。', py: 'wǒ yào zhēnzhū nǎichá', en: "I'd like bubble tea.", fr: 'Un thé aux perles.' },
        { zh: '一杯紅茶。', py: 'yì bēi hóngchá', en: 'A black tea.', fr: 'Un thé noir.' },
        { zh: '我要一個漢堡。', py: 'wǒ yào yí ge hànbǎo', en: 'I want a hamburger.', fr: 'Je veux un hamburger.', bad: true },
      ] },
      { who: 'partner', zh: '甜度要多少?', py: 'tiándù yào duōshǎo?', en: 'How sweet would you like it?', fr: 'Quel niveau de sucre ?' },
      { who: 'choose', options: [
        { zh: '半糖。', py: 'bàn táng', en: 'Half sugar.', fr: 'Demi-sucre.' },
        { zh: '微糖。', py: 'wēi táng', en: 'A little sugar.', fr: 'Peu de sucre.' },
        { zh: '無糖。', py: 'wú táng', en: 'No sugar.', fr: 'Sans sucre.' },
        { zh: '加辣。', py: 'jiā là', en: 'Add chili.', fr: 'Ajouter du piment.', bad: true },
      ] },
      { who: 'partner', zh: '冰塊呢?', py: 'bīngkuài ne?', en: 'And ice?', fr: 'Et la glace ?' },
      { who: 'choose', options: [
        { zh: '正常冰。', py: 'zhèngcháng bīng', en: 'Normal ice.', fr: 'Glace normale.' },
        { zh: '少冰。', py: 'shǎo bīng', en: 'Less ice.', fr: 'Peu de glace.' },
        { zh: '去冰。', py: 'qù bīng', en: 'No ice.', fr: 'Sans glace.' },
        { zh: '熱的。', py: 'rè de', en: 'Make it hot.', fr: 'Chaud.' },
      ] },
      { who: 'partner', zh: '好,三十五塊。', py: 'hǎo, sānshíwǔ kuài', en: 'Okay, 35 dollars.', fr: 'D’accord, 35.' },
      { who: 'choose', options: [
        { zh: '這是錢,謝謝。', py: 'zhè shì qián, xièxie', en: "Here's the money, thanks.", fr: 'Voici l’argent, merci.' },
        { zh: '可以刷卡嗎?', py: 'kěyǐ shuākǎ ma?', en: 'Can I pay by card?', fr: 'Je peux payer par carte ?' },
        { zh: '不用錢吧?', py: 'búyòng qián ba?', en: "It's free, right?", fr: 'C’est gratuit, non ?', bad: true },
      ] },
      { who: 'partner', zh: '謝謝光臨!', py: 'xièxie guānglín', en: 'Thanks, come again!', fr: 'Merci, à bientôt !' },
    ],
  },
  {
    id: 'time', icon: '⌚', title: { en: 'Asking the time', fr: "Demander l'heure" },
    steps: [
      { who: 'partner', zh: '你好!', py: 'nǐ hǎo', en: 'Hello!', fr: 'Bonjour !' },
      { who: 'choose', options: [
        { zh: '請問現在幾點?', py: 'qǐngwèn xiànzài jǐ diǎn?', en: 'Excuse me, what time is it?', fr: 'Quelle heure est-il ?' },
        { zh: '你好!', py: 'nǐ hǎo', en: 'Hello!', fr: 'Bonjour !' },
        { zh: '我要買票。', py: 'wǒ yào mǎi piào', en: 'I want to buy a ticket.', fr: 'Je veux un billet.', bad: true },
      ] },
      { who: 'partner', zh: '現在下午三點半。', py: 'xiànzài xiàwǔ sān diǎn bàn', en: "It's half past three in the afternoon.", fr: 'Il est 15 h 30.' },
      { who: 'choose', options: [
        { zh: '謝謝你!', py: 'xièxie nǐ', en: 'Thank you!', fr: 'Merci !' },
        { zh: '這麼晚了!', py: 'zhème wǎn le', en: "It's that late already!", fr: 'Déjà si tard !' },
        { zh: '早安!', py: 'zǎo’ān', en: 'Good morning!', fr: 'Bonjour (matin) !', bad: true },
      ] },
      { who: 'partner', zh: '不客氣!', py: 'bú kèqi', en: "You're welcome!", fr: 'Je vous en prie !' },
    ],
  },
  {
    id: 'store', icon: '🏪', title: { en: 'Convenience store', fr: 'Supérette' },
    steps: [
      { who: 'partner', zh: '歡迎光臨!', py: 'huānyíng guānglín', en: 'Welcome!', fr: 'Bienvenue !' },
      { who: 'choose', options: [
        { zh: '請問有水嗎?', py: 'qǐngwèn yǒu shuǐ ma?', en: 'Do you have water?', fr: 'Avez-vous de l’eau ?' },
        { zh: '我要買東西。', py: 'wǒ yào mǎi dōngxī', en: 'I want to buy some things.', fr: 'Je veux acheter des choses.' },
        { zh: '我想睡覺。', py: 'wǒ xiǎng shuìjiào', en: 'I want to sleep.', fr: 'Je veux dormir.', bad: true },
      ] },
      { who: 'partner', zh: '在那邊,需要袋子嗎?', py: 'zài nàbiān, xūyào dàizi ma?', en: 'Over there. Do you need a bag?', fr: 'Là-bas. Besoin d’un sac ?' },
      { who: 'choose', options: [
        { zh: '要,謝謝。', py: 'yào, xièxie', en: 'Yes, thanks.', fr: 'Oui, merci.' },
        { zh: '不用,謝謝。', py: 'búyòng, xièxie', en: 'No, thanks.', fr: 'Non, merci.' },
        { zh: '我要游泳。', py: 'wǒ yào yóuyǒng', en: 'I want to swim.', fr: 'Je veux nager.', bad: true },
      ] },
      { who: 'partner', zh: '一共五十塊。', py: 'yígòng wǔshí kuài', en: '50 dollars in total.', fr: '50 au total.' },
      { who: 'choose', options: [
        { zh: '可以刷卡嗎?', py: 'kěyǐ shuākǎ ma?', en: 'Can I pay by card?', fr: 'Par carte ?' },
        { zh: '這是一百塊。', py: 'zhè shì yìbǎi kuài', en: "Here's 100.", fr: 'Voici 100.' },
        { zh: '太便宜了!', py: 'tài piányí le', en: 'Too cheap!', fr: 'Trop bon marché !', bad: true },
      ] },
      { who: 'partner', zh: '謝謝,歡迎再來!', py: 'xièxie, huānyíng zài lái', en: 'Thanks, come again!', fr: 'Merci, revenez !' },
    ],
  },
];

// Walk steps from `from`, collecting partner bubbles until a choose step or end.
export function collectTurn(dialogue, from) {
  const bubbles = [];
  let i = from;
  while (i < dialogue.steps.length && dialogue.steps[i].who === 'partner') {
    const s = dialogue.steps[i];
    bubbles.push({ who: 'partner', zh: s.zh, py: s.py, en: s.en, fr: s.fr });
    i += 1;
  }
  const atChoose = i < dialogue.steps.length && dialogue.steps[i].who === 'choose';
  return { bubbles, nextIndex: i, choose: atChoose ? dialogue.steps[i].options : null };
}
