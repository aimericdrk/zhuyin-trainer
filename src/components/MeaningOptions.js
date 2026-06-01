import { useI18n } from '../i18n/I18nContext';
import './MeaningOptions.css';

export default function MeaningOptions({
  options,
  picked,
  correctId,
  status,
  onPick,
  disabled = false,
}) {
  const { lang } = useI18n();
  return (
    <div className="mo-grid">
      {options.map((opt) => {
        const isPicked = picked.has(opt.id);
        const isCorrect = opt.id === correctId;
        const showCorrect = isCorrect && isPicked && (status === 'correct' || status === 'revealed');
        const showWrong = isPicked && !isCorrect;
        const cls = [
          'mo-chip',
          showWrong ? 'mo-chip--wrong' : '',
          showCorrect ? 'mo-chip--correct' : '',
        ].filter(Boolean).join(' ');
        const isDisabled = disabled || isPicked || status !== 'guessing';
        return (
          <button
            key={opt.id}
            type="button"
            className={cls}
            onClick={() => onPick(opt.id)}
            disabled={isDisabled}
          >
            {opt.meaning[lang] ?? opt.meaning.en}
          </button>
        );
      })}
    </div>
  );
}
