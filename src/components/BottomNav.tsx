import { Home, Bookmark, Settings, Plus } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export type View = 'feed' | 'saved' | 'settings' | 'add';

interface Props {
  current: View;
  onNavigate: (view: View) => void;
}

export function BottomNav({ current, onNavigate }: Props) {
  const { t } = useLanguage();

  const items: { key: View; label: string; icon: typeof Home }[] = [
    { key: 'feed', label: t.navFeed, icon: Home },
    { key: 'saved', label: t.navSaved, icon: Bookmark },
    { key: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <>
      {/* Floating Add button */}
      <button
        onClick={() => onNavigate('add')}
        className="fixed bottom-20 sm:bottom-6 right-4 rtl:right-auto rtl:left-4 z-50 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center active:scale-90 transition-transform hover:bg-primary-600"
        aria-label={t.navAdd}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-4 py-2 pb-[env(safe-area-inset-bottom)]">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.key || (item.key === 'feed' && current === 'add');
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`nav-item flex-1 max-w-[80px] ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
