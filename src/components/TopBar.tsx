import { Languages, Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  title: string;
}

export function TopBar({ title }: Props) {
  const { lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 glass border-b border-surface-200 dark:border-surface-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 8h12M6 12h12M6 16h8" strokeLinecap="round" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h1 className="text-base font-bold text-surface-900 dark:text-surface-50">{title}</h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleLang}
            className="btn-ghost px-2.5 py-2"
            aria-label="Toggle language"
          >
            <span className="text-sm font-bold">{lang === 'en' ? 'ع' : 'EN'}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="btn-ghost px-2.5 py-2"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
