import { useI18n } from '../i18n/I18nContext';
import './SentenceArranger.css';

function Card({ word, lang, disabled, onClick }) {
  return (
    <button
      type="button"
      className="sa-card"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="sa-card-char">{word.char}</span>
      <span className="sa-card-gloss">{word[lang] ?? word.en}</span>
    </button>
  );
}

export default function SentenceArranger({
  available,
  placed,
  status,
  onPlace,
  onRemove,
}) {
  const { lang } = useI18n();
  const disabled = status === 'correct' || status === 'revealed';
  return (
    <div className="sa-wrap">
      <div className={`sa-placed sa-placed--${status}`}>
        {placed.map((w) => (
          <Card
            key={`p-${w.id}`}
            word={w}
            lang={lang}
            disabled={disabled}
            onClick={() => onRemove(w.id)}
          />
        ))}
      </div>
      <hr className="sa-divider" />
      <div className="sa-available">
        {available.map((w) => (
          <Card
            key={`a-${w.id}`}
            word={w}
            lang={lang}
            disabled={disabled}
            onClick={() => onPlace(w.id)}
          />
        ))}
      </div>
    </div>
  );
}
