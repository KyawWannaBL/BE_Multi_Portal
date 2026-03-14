Bilingual Portal Integration Notes

1. Import i18n once at application startup:
   import './i18n';

2. Place LanguageToggle in your menu bar or header:
   import LanguageToggle from './components/common/LanguageToggle';

3. Mount route screens from:
   src/features/bilingual-portal/pages/index.tsx

4. Replace endpoint values in:
   src/features/bilingual-portal/config/screens.ts

5. This scaffold is mock-data-free.
   UI renders real API results or clean empty states only.

6. Merge rule:
   If two portals share the same fields and behaviors, reuse the same config entry and component.
   If the current design does not contain the screen, add a new config entry and endpoint.
