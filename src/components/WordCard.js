import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import SpeakerButton from './SpeakerButton';
import './WordCard.css';

const HEADLINE_ID = 'wc-headline';

export default function WordCard({
  character,
  pinyin,
  zhuyin,
  speak,
  speakingId,
  audioSupported = false,
}) {
  const { t } = useI18n();
  const { annot } = useAnnotation();
  const canPlay = typeof speak === 'function' && audioSupported;
  return (
    <div className="wc-wrap">
      <div className="wc-char-row">
        <div className="wc-character">{character}</div>
        {speak && (
          <SpeakerButton
            label={t('trainer.playCharacter')}
            onPlay={() => speak(character, { id: HEADLINE_ID })}
            playing={speakingId === HEADLINE_ID}
            disabled={!canPlay}
            size="md"
          />
        )}
      </div>
      {annot.pinyin && <div className="wc-pinyin">{pinyin}</div>}
      {annot.zhuyin && <div className="wc-zhuyin">{zhuyin}</div>}
    </div>
  );
}
