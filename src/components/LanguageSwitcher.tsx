import React from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
}

/**
 * LanguageSwitcher component for English/Myanmar bilingual support.
 * Built with enterprise logistics precision and luxury design aesthetics.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const languages: { code: 'en' | 'my'; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`group gap-2 text-foreground/80 hover:text-primary transition-all duration-300 focus-visible:ring-primary/50 ${className || ''}`}
        >
          <Globe className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          <span className="hidden sm:inline-flex items-center gap-1.5 font-bold text-[10px] tracking-[0.25em] uppercase">
            {currentLanguage?.code || 'EN'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 luxury-glass border-border/50 p-1 shadow-2xl animate-in fade-in-0 zoom-in-95"
      >
        <div className="px-3 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">
          Regional Language
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`
              flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all duration-200
              ${language === lang.code 
                ? 'bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' 
                : 'hover:bg-white/5 text-foreground/70 hover:text-foreground'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg leading-none filter saturate-[0.8]">{lang.flag}</span>
              <span className="text-xs font-semibold tracking-wide">{lang.name}</span>
            </div>
            {language === lang.code && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
