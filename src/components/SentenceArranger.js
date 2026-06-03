import { useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import './SentenceArranger.css';

const DRAG_THRESHOLD_PX = 5;

// Build the annotation lines shown under a tile, honouring the global pref and
// whatever data the word carries (zhuyin / pinyin / meaning).
function annoLines(word, annot, lang) {
  const lines = [];
  if (annot.zhuyin && word.zhuyin) lines.push({ k: 'zh', t: word.zhuyin });
  if (annot.pinyin && (word.pinyin ?? word.py)) lines.push({ k: 'py', t: word.pinyin ?? word.py });
  if (annot.meaning && (word[lang] ?? word.en)) lines.push({ k: 'mn', t: word[lang] ?? word.en });
  return lines;
}

function CardAnnos({ word, annot, lang }) {
  return annoLines(word, annot, lang).map((l) => (
    <span key={l.k} className={`sa-card-anno sa-card-anno--${l.k}`}>{l.t}</span>
  ));
}

function Card({
  word,
  lang,
  annot,
  rowName,
  index,
  disabled,
  isDraggingThis,
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}) {
  return (
    <button
      type="button"
      className={`sa-card${isDraggingThis ? ' sa-card--dragging' : ''}`}
      data-row={rowName}
      data-card-id={word.id}
      data-card-index={index}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      disabled={disabled}
    >
      <span className="sa-card-char">{word.char}</span>
      <CardAnnos word={word} annot={annot} lang={lang} />
    </button>
  );
}

export default function SentenceArranger({
  available,
  placed,
  status,
  onPlace,
  onRemove,
  onReorder,
}) {
  const { lang } = useI18n();
  const { annot } = useAnnotation();
  const disabled = status === 'correct' || status === 'revealed';

  const [drag, setDrag] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [hover, setHover] = useState(null);
  const dragMoved = useRef(false);

  function findWord(source, id) {
    const list = source === 'available' ? available : placed;
    return list.find((w) => w.id === id) || null;
  }

  function computeDropTarget(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    let cur = el;
    let card = null;
    let rowName = null;
    while (cur) {
      if (cur.dataset && cur.dataset.cardId && !card) card = cur;
      if (cur.dataset && cur.dataset.row) {
        rowName = cur.dataset.row;
        break;
      }
      cur = cur.parentElement;
    }
    if (!rowName) return null;
    if (rowName === 'available') return { row: 'available' };
    if (!card) return { row: 'placed', index: placed.length };
    const rect = card.getBoundingClientRect();
    const fromIndex = Number(card.dataset.cardIndex);
    const after = x > rect.left + rect.width / 2;
    return { row: 'placed', index: after ? fromIndex + 1 : fromIndex };
  }

  function handlePointerDown(e, word, source, sourceIndex) {
    if (disabled) return;
    if (e.button !== undefined && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    dragMoved.current = false;
    setDrag({ id: word.id, source, sourceIndex, startX: e.clientX, startY: e.clientY });
    setDragPos({ x: e.clientX, y: e.clientY });
  }

  function handlePointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!dragMoved.current && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      dragMoved.current = true;
    }
    if (dragMoved.current) {
      setDragPos({ x: e.clientX, y: e.clientY });
      setHover(computeDropTarget(e.clientX, e.clientY));
    }
  }

  function handlePointerUp(e) {
    if (!drag) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    const wasDrag = dragMoved.current;
    const target = wasDrag ? computeDropTarget(e.clientX, e.clientY) : null;
    const currentDrag = drag;
    setDrag(null);
    setDragPos(null);
    setHover(null);
    if (!wasDrag) return;
    if (!target) return;
    if (currentDrag.source === 'available' && target.row === 'placed') {
      onPlace(currentDrag.id, target.index);
      return;
    }
    if (currentDrag.source === 'placed' && target.row === 'available') {
      onRemove(currentDrag.id);
      return;
    }
    if (currentDrag.source === 'placed' && target.row === 'placed') {
      let toIndex = target.index;
      if (toIndex > currentDrag.sourceIndex) toIndex -= 1;
      if (toIndex === currentDrag.sourceIndex) return;
      onReorder(currentDrag.sourceIndex, toIndex);
      return;
    }
  }

  function handlePointerCancel() {
    setDrag(null);
    setDragPos(null);
    setHover(null);
    dragMoved.current = false;
  }

  const placedHoverClass = hover && hover.row === 'placed' && status === 'arranging' ? ' sa-placed--hover' : '';
  const availableHoverClass = hover && hover.row === 'available' && status === 'arranging' ? ' sa-available--hover' : '';

  const draggedWord = drag ? findWord(drag.source, drag.id) : null;

  return (
    <div className="sa-wrap">
      <div
        className={`sa-placed sa-placed--${status}${placedHoverClass}`}
        data-row="placed"
      >
        {placed.map((w, i) => (
          <Card
            key={`p-${w.id}`}
            word={w}
            lang={lang}
            annot={annot}
            rowName="placed"
            index={i}
            disabled={disabled}
            isDraggingThis={!!(drag && drag.id === w.id)}
            onClick={() => onRemove(w.id)}
            onPointerDown={(e) => handlePointerDown(e, w, 'placed', i)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />
        ))}
      </div>
      <hr className="sa-divider" />
      <div
        className={`sa-available${availableHoverClass}`}
        data-row="available"
      >
        {available.map((w, i) => (
          <Card
            key={`a-${w.id}`}
            word={w}
            lang={lang}
            annot={annot}
            rowName="available"
            index={i}
            disabled={disabled}
            isDraggingThis={!!(drag && drag.id === w.id)}
            onClick={() => onPlace(w.id)}
            onPointerDown={(e) => handlePointerDown(e, w, 'available', i)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />
        ))}
      </div>
      {drag && dragMoved.current && dragPos && draggedWord && (
        <div
          className="sa-drag-overlay"
          style={{ left: dragPos.x, top: dragPos.y }}
        >
          <div className="sa-card sa-card--ghost">
            <span className="sa-card-char">{draggedWord.char}</span>
            <CardAnnos word={draggedWord} annot={annot} lang={lang} />
          </div>
        </div>
      )}
    </div>
  );
}
