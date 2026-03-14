const fs = require('fs');
const path = 'src/pages/portals/ExecutionParcelIntakePage.tsx';

if (!fs.existsSync(path)) {
  console.log('[warn] ExecutionParcelIntakePage.tsx not found; patch manually: pass actorEmail/actorRole to upload rows.');
  process.exit(0);
}

let s = fs.readFileSync(path, 'utf-8');

// Ensure import useAuth
if (!s.includes('useAuth')) {
  s = s.replace('import { useLanguage } from "@/contexts/LanguageContext";',
                'import { useLanguage } from "@/contexts/LanguageContext";\nimport { useAuth } from "@/contexts/AuthContext";');
}

// Add const { user, role } = useAuth();
if (!s.includes('const { user, role } = useAuth();')) {
  s = s.replace('const { lang } = useLanguage();',
                'const { lang } = useLanguage();\n  const { user, role } = useAuth() as any;');
}

// Inject actorEmail/actorRole in uploadToSystem mapping using Regex ($1 syntax for Node)
const regex = /(labelPhotoDataUrl:\s*r\.labelPhotoDataUrl\s*\?\?\s*null,)/;
if (regex.test(s)) {
  s = s.replace(
    regex, 
    '$1\n        actorEmail: (user?.email ?? null) as any,\n        actorRole: (role ?? null) as any,'
  );
}

fs.writeFileSync(path, s, 'utf-8');
console.log('[ok] Intake page now passes actorEmail/actorRole to uploader (for audit logs)');
