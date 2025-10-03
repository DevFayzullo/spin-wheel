import { useTranslation } from "react-i18next";

const langs = [
  { code: "en", label: "EN" },
  { code: "uz", label: "UZ" },
  { code: "ko", label: "KO" },
  { code: "ru", label: "RU" },
  { code: "es", label: "ES" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language;

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  return (
    <div
      className={`inline-flex rounded-xl overflow-hidden border dark:border-gray-700 ${className}`}>
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-3 py-2 text-sm
            ${
              current === l.code
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
          aria-pressed={current === l.code}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
