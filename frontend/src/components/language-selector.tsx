'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LOCALES = {
  es: { flag: '🇦🇷', label: 'ES' },
  en: { flag: '🇺🇸', label: 'EN' },
};

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">|</span>}
          <button
            onClick={() => switchLocale(l)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors duration-200 cursor-pointer ${
              locale === l
                ? 'text-white font-medium'
                : 'text-muted-foreground hover:text-white'
            }`}
            aria-label={`Switch to ${l === 'es' ? 'Spanish' : 'English'}`}
            aria-pressed={locale === l}
          >
            <span aria-hidden="true">{LOCALES[l as keyof typeof LOCALES].flag}</span>
            <span>{LOCALES[l as keyof typeof LOCALES].label}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
