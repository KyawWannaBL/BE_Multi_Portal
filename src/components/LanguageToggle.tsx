import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export function LanguageToggle() {
  const { language, setLanguage } = useI18n() as {
    language: string;
    setLanguage: (value: string) => void;
  };

  const isMyanmar = language === "my";

  return (
    <div className="inline-flex items-center rounded-lg border bg-background p-1">
      <Button
        type="button"
        variant={isMyanmar ? "ghost" : "default"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="h-8 px-3"
      >
        EN
      </Button>

      <Button
        type="button"
        variant={isMyanmar ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("my")}
        className="h-8 px-3"
      >
        မြန်မာ
      </Button>
    </div>
  );
}

export default LanguageToggle;