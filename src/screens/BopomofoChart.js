import { useI18n } from '../i18n/I18nContext';
import { useSpeech } from '../hooks/useSpeech';
import TopBar from '../components/TopBar';
import { BOPOMOFO_GROUPS, TONES } from '../data/bopomofo';
import './BopomofoChart.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';
function readRate() {
  try {
    const n = Number(localStorage.getItem(SPEECH_RATE_LS));
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1.0;
  } catch { return 1.0; }
}

export default function BopomofoChart({ onBack }) {
  const { t } = useI18n();
  const { speak, speakingId } = useSpeech({ rate: readRate() });

  return (
    <div className="bp-wrap">
      <TopBar title={t('tools.bopomofo.title')} onBack={onBack} />
      <main className="bp-main">
        <p className="bp-intro">{t('tools.bopomofo.intro')}</p>
        {BOPOMOFO_GROUPS.map((group) => (
          <section key={group.key} className="bp-section">
            <h2 className="bp-section-title">
              <span className="bp-section-zh">{group.zh}</span>
              <span className="bp-section-en">{t(`tools.bopomofo.${group.key}`)}</span>
            </h2>
            <div className="bp-grid">
              {group.items.map((s) => {
                const id = `bp-${s.sym}`;
                return (
                  <button
                    key={s.sym}
                    className={`bp-cell${speakingId === id ? ' bp-cell--playing' : ''}`}
                    onClick={() => speak(s.ex, { id })}
                    title={`${s.sym} · ${s.exPy}`}
                  >
                    <span className="bp-sym">{s.sym}</span>
                    <span className="bp-py">{s.py}</span>
                    <span className="bp-ex">{s.ex} <span className="bp-ex-py">{s.exPy}</span></span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        <section className="bp-section">
          <h2 className="bp-section-title">
            <span className="bp-section-zh">聲調</span>
            <span className="bp-section-en">{t('tools.bopomofo.tones')}</span>
          </h2>
          <div className="bp-grid bp-grid--tones">
            {TONES.map((tn) => {
              const id = `bp-tone-${tn.mark}`;
              return (
                <button
                  key={tn.mark}
                  className={`bp-cell${speakingId === id ? ' bp-cell--playing' : ''}`}
                  onClick={() => speak(tn.ex, { id })}
                >
                  <span className="bp-sym">{tn.mark}</span>
                  <span className="bp-py">{tn.py}</span>
                  <span className="bp-ex">{tn.ex} <span className="bp-ex-py">{tn.exPy}</span></span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
