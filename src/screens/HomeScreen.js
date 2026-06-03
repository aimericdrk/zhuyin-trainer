import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import TopBar from '../components/TopBar';
import { GAMES } from '../data/games';
import { checkInToday } from '../data/streak';
import './HomeScreen.css';

const SECTIONS = [
  {
    key: 'foundations',
    items: [
      { view: 'bopomofo', zh: '注音', tkey: 'bopomofo' },
      { view: 'writing', zh: '寫字', tkey: 'writing' },
      { view: 'reading', zh: '閱讀', tkey: 'reading' },
    ],
  },
  {
    key: 'study',
    items: [
      { view: 'flashcards', zh: '學習卡', tkey: 'flashcards' },
      { view: 'review', zh: '複習', tkey: 'review' },
      { view: 'memory', zh: '配對', tkey: 'memory' },
    ],
  },
  {
    key: 'practice',
    items: [
      { view: 'trainer', zh: '簡單', tkey: 'easy' },
      { view: 'hard', zh: '困難', tkey: 'hard' },
      { view: 'chat', zh: '對話', tkey: 'chat' },
      { view: 'patterns', zh: '句型', tkey: 'patterns' },
    ],
  },
  {
    key: 'play',
    items: [
      { view: 'games', zh: '遊戲', tkey: 'games' },
    ],
  },
];

export default function HomeScreen({ onNavigate }) {
  const { t } = useI18n();
  const [progress] = useState(() => checkInToday());
  return (
    <div className="hs-wrap">
      <TopBar title={t('home.title')} />
      <main className="hs-main">
        <h1 className="hs-tagline">{t('home.title')}</h1>
        <p className="hs-sub">{t('home.subtitle')}</p>
        {progress && progress.streak > 0 && (
          <div className="hs-streak" title={t('home.daysTotal', { n: progress.days })}>
            🔥 {t('home.streak', { n: progress.streak })}
          </div>
        )}
        {SECTIONS.map((section) => (
          <section key={section.key} className="hs-section">
            <h2 className="hs-section-title">{t(`home.sections.${section.key}`)}</h2>
            <div className="hs-cards">
              {section.items.map((item) => (
                <button key={item.view} className="hs-card" onClick={() => onNavigate(item.view)}>
                  <span className="hs-card-zh">{item.zh}</span>
                  <span className="hs-card-en">{t(`home.${item.tkey}`)}</span>
                  <span className="hs-card-desc">
                    {item.tkey === 'games'
                      ? t('home.gamesDesc', { count: GAMES.length })
                      : t(`home.${item.tkey}Desc`)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
