import { useI18n } from '../i18n/I18nContext';
import TopBar from '../components/TopBar';
import { GAMES, GAME_CATEGORIES } from '../data/games';
import './GamesScreen.css';

export default function GamesScreen({ onBack, onSelect }) {
  const { t } = useI18n();
  return (
    <div className="gs-wrap">
      <TopBar title={t('games.title')} onBack={onBack} />
      <main className="gs-main">
        <p className="gs-intro">{t('games.intro')}</p>
        {GAME_CATEGORIES.map((cat) => {
          const games = GAMES.filter((g) => g.cat === cat);
          if (games.length === 0) return null;
          return (
            <section key={cat} className="gs-section">
              <h2 className="gs-section-title">{t(`games.cats.${cat}`)}</h2>
              <div className="gs-grid">
                {games.map((g) => (
                  <button key={g.id} className="gs-card" onClick={() => onSelect(g.id)}>
                    <span className="gs-card-icon" aria-hidden="true">{g.icon}</span>
                    <span className="gs-card-zh">{g.zh}</span>
                    <span className="gs-card-title">{t(`games.${g.id}.title`)}</span>
                    <span className="gs-card-desc">{t(`games.${g.id}.desc`)}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
