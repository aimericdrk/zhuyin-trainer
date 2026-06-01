import './SpeakerButton.css';

const SIZE_MAP = { sm: 16, md: 22 };

export default function SpeakerButton({
  label,
  onPlay,
  playing = false,
  disabled = false,
  size = 'md',
}) {
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;
  const className = [
    'sb',
    `sb--${size}`,
    playing ? 'sb--playing' : '',
  ].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={className}
      onClick={onPlay}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <svg
        className="sb-icon"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path d="M16 8.5a4 4 0 010 7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M18.5 6a7 7 0 010 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}
