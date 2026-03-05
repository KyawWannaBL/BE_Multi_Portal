import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center gap-2 text-sm text-white/70">
      <span className="text-white/40">{t("common.language")}:</span>
      <button
        onClick={() => i18n.changeLanguage("en")}
        className={`hover:underline ${i18n.language === "en" ? "text-white" : ""}`}
      >
        {t("common.english")}
      </button>
      <span className="text-white/20">|</span>
      <button
        onClick={() => i18n.changeLanguage("mm")}
        className={`hover:underline ${i18n.language === "mm" ? "text-white" : ""}`}
      >
        {t("common.myanmar")}
      </button>
    </div>
  );
}