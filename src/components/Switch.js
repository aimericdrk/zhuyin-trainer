import './Switch.css';

export default function Switch({ checked, onChange, label, disabled = false }) {
  const className = [
    'sw',
    checked ? 'sw--on' : '',
    disabled ? 'sw--disabled' : '',
  ].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={className}
      onClick={onChange}
    >
      <span className="sw-track" />
      <span className="sw-thumb" />
    </button>
  );
}
