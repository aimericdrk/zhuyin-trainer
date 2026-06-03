// Daily check-in streak — a small motivation aid. Pure logic (date passed in as
// a YYYY-MM-DD string) so it is fully testable; the screen supplies today's date.
const PROGRESS_LS = 'zhuyin.progress';

export function todayStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayDiff(a, b) {
  const da = Date.parse(`${a}T00:00:00Z`);
  const db = Date.parse(`${b}T00:00:00Z`);
  return Math.round((db - da) / 86400000);
}

export function updateStreak(prev, today) {
  if (!prev || !prev.lastDate) return { lastDate: today, streak: 1, days: 1 };
  if (prev.lastDate === today) return prev;
  const diff = dayDiff(prev.lastDate, today);
  if (diff === 1) return { lastDate: today, streak: prev.streak + 1, days: prev.days + 1 };
  return { lastDate: today, streak: 1, days: prev.days + 1 };
}

export function readProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_LS) || 'null'); } catch { return null; }
}

export function writeProgress(p) {
  try { localStorage.setItem(PROGRESS_LS, JSON.stringify(p)); } catch {}
}

// Read, advance for today, persist, and return the updated progress.
export function checkInToday(date = new Date()) {
  const next = updateStreak(readProgress(), todayStr(date));
  writeProgress(next);
  return next;
}
