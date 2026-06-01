import { useI18n } from '../i18n/I18nContext';
import TopBar from '../components/TopBar';
import './HomeScreen.css';

export default function HomeScreen({ onStart, onStartHard }) {
  const { t } = useI18n();
  return (
    <div className="hs-wrap">
      <TopBar title={t('home.title')} />
      <main className="hs-main">
        <h1 className="hs-tagline">{t('home.title')}</h1>
        <div className="hs-cards">
          <button className="hs-card" onClick={onStart}>
            <span className="hs-card-zh">簡單</span>
            <span className="hs-card-en">{t('home.easy')}</span>
            <span className="hs-card-desc">{t('home.easyDesc')}</span>
          </button>
          <button className="hs-card" onClick={onStartHard}>
            <span className="hs-card-zh">困難</span>
            <span className="hs-card-en">{t('home.hard')}</span>
            <span className="hs-card-desc">{t('home.hardDesc')}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
