import './InputStrip.css';

function buildGroupEndSet(groups, length) {
  if (!Array.isArray(groups) || groups.length <= 1) return new Set();
  const boundaries = new Set();
  let acc = 0;
  for (let i = 0; i < groups.length - 1; i++) {
    acc += groups[i];
    boundaries.add(acc - 1);
  }
  for (const idx of boundaries) {
    if (idx < 0 || idx >= length) boundaries.delete(idx);
  }
  return boundaries;
}

export default function InputStrip({
  length,
  input,
  perSymbolResult,
  phase,
  groups,
  showCount = true,
}) {
  const visibleCount = showCount
    ? length
    : Math.min(length, (input ? input.length : 0) + 1);
  const slots = Array.from({ length: visibleCount });
  const groupEnds = showCount ? buildGroupEndSet(groups, length) : new Set();
  return (
    <div className="is-strip" role="status" aria-live="polite">
      {slots.map((_, i) => {
        const sym = input[i];
        const result = perSymbolResult ? perSymbolResult[i] : null;
        let cls = 'is-slot';
        if (result === 'ok') cls += ' is-slot--ok';
        else if (result === 'bad') cls += ' is-slot--bad';
        else if (phase === 'correct') cls += ' is-slot--ok';
        else if (phase === 'wrong' && sym != null) cls += ' is-slot--wrong-flash';
        if (groupEnds.has(i)) cls += ' is-slot--group-end';
        return (
          <div key={i} className={cls}>
            {sym ?? <span className="is-placeholder">?</span>}
          </div>
        );
      })}
    </div>
  );
}
