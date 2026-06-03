import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import SpeakerButton from './SpeakerButton';
import './CharacterCard.css';

export default function CharacterCard({
  character,
  pinyin,
  speak,
  speakingId,
  audioSupported = false,
}) {
  const { t } = useI18n();
  const { annot } = useAnnotation();
  const id = 'headline';
  const canPlay = typeof speak === 'function' && audioSupported;
  return (
    <div className="cc-wrap">
      <div className="cc-character-row">
        <div className="cc-character">{character}</div>
        {speak && (
          <SpeakerButton
            label={t('trainer.playCharacter')}
            onPlay={() => speak(character, { id })}
            playing={speakingId === id}
            disabled={!canPlay}
            size="md"
          />
        )}
      </div>
      {annot.pinyin && <div className="cc-pinyin">{pinyin}</div>}
    </div>
  );
}
