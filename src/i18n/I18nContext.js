import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import en from './en.json';
import fr from './fr.json';

const DICTIONARIES = { en, fr };
const I18nContext = createContext(null);

function readInitialLang() {
  try {
    const saved = localStorage.getItem('zhuyin.lang');
    if (saved === 'en' || saved === 'fr') return saved;
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (nav === 'fr') return 'fr';
  } catch {}
  return 'en';
}

function lookup(dict, path) {
  const parts = path.split('.');
  let cur = dict;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(readInitialLang);

  useEffect(() => {
    try { localStorage.setItem('zhuyin.lang', lang); } catch {}
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'en' ? 'fr' : 'en'));
  }, []);

  const t = useCallback(
    (path, params) => {
      let value = lookup(DICTIONARIES[lang], path);
      if (value === undefined) {
        const fallback = lookup(DICTIONARIES.en, path);
        if (fallback !== undefined) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[i18n] missing key "${path}" for lang "${lang}"`);
          }
          value = fallback;
        } else {
          value = path;
        }
      }
      if (params && typeof value === 'string') {
        for (const key of Object.keys(params)) {
          value = value.replace(`{${key}}`, String(params[key]));
        }
      }
      return value;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, toggleLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
