import './SpeedSlider.css';

export default function SpeedSlider({
  value,
  onChange,
  label,
  min = 0.5,
  max = 1.5,
  step = 0.05,
}) {
  const handleChange = (event) => {
    onChange(Number(event.target.value));
  };
  return (
    <div className="ss-wrap">
      <input
        type="range"
        className="ss-range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={handleChange}
      />
      <span className="ss-value">{value.toFixed(2)}×</span>
    </div>
  );
}
