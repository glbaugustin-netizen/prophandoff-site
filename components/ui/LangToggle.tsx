"use client";

import { useLang } from "@/components/LanguageProvider";
import { LOCALES, type Locale } from "@/lib/i18n";

/**
 * Bulle FR / EN : pastille en verre dans la navbar, l'option active est en
 * blanc plein et glisse d'un côté à l'autre.
 */
export default function LangToggle() {
  const { locale, t, setLocale } = useLang();
  const index = LOCALES.indexOf(locale);

  return (
    <div className="lang" role="radiogroup" aria-label={t.nav.langAria}>
      <span
        aria-hidden="true"
        className="lang-thumb"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {LOCALES.map((code: Locale) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={code === locale}
          className={`lang-opt${code === locale ? " is-active" : ""}`}
          onClick={() => code !== locale && setLocale(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
