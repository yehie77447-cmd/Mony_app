import { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Database, Trash2, Info, HardDrive, FileStack, Wifi, WifiOff, Check } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { StorageModule } from '@/modules/StorageModule';

interface Props {
  onCleared: () => void;
}

export function SettingsView({ onCleared }: Props) {
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [stats, setStats] = useState({ count: 0, downloadedCount: 0, approxSizeKB: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStats = () => StorageModule.getStats().then(setStats);
    updateStats();
    const interval = setInterval(updateStats, 5000);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleClearAll = async () => {
    if (!window.confirm(t.confirmClear)) return;
    await StorageModule.clearAll();
    setStats({ count: 0, downloadedCount: 0, approxSizeKB: 0 });
    toast.show(t.toastCleared);
    onCleared();
  };

  const sizeDisplay =
    stats.approxSizeKB < 1024
      ? `${stats.approxSizeKB} KB`
      : `${(stats.approxSizeKB / 1024).toFixed(1)} MB`;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-4 animate-fade-in">
      {/* Language */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <Globe className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-800 dark:text-surface-100">{t.language}</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLang('en')}
            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-semibold text-sm ${
              lang === 'en'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400'
            }`}
          >
            {lang === 'en' && <Check className="w-4 h-4" />}
            {t.english}
          </button>
          <button
            onClick={() => setLang('ar')}
            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-semibold text-sm ${
              lang === 'ar'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400'
            }`}
          >
            {lang === 'ar' && <Check className="w-4 h-4" />}
            {t.arabic}
          </button>
        </div>
      </div>

      {/* Dark Mode */}
      <div className="card p-4">
        <button onClick={toggleTheme} className="flex items-center gap-3 w-full">
          <div className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            {theme === 'dark' ? (
              <Moon className="w-4.5 h-4.5 text-primary-400" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-warning-500" />
            )}
          </div>
          <div className="flex-1 text-start">
            <h3 className="text-sm font-bold text-surface-800 dark:text-surface-100">{t.darkMode}</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">{t.darkModeHint}</p>
          </div>
          <div className={`w-12 h-7 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary-500' : 'bg-surface-300'}`}>
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0.5 rtl:-translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Connection status */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isOnline ? 'bg-accent-100 dark:bg-accent-900/40' : 'bg-warning-100 dark:bg-warning-900/40'}`}>
            {isOnline ? <Wifi className="w-4.5 h-4.5 text-accent-600 dark:text-accent-400" /> : <WifiOff className="w-4.5 h-4.5 text-warning-600 dark:text-warning-400" />}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-surface-800 dark:text-surface-100">
              {isOnline ? t.onlineMessage : t.offlineMessage}
            </h3>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <Database className="w-4.5 h-4.5 text-surface-500 dark:text-surface-400" />
          </div>
          <h3 className="text-sm font-bold text-surface-800 dark:text-surface-100">{t.storage}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <FileStack className="w-5 h-5 mx-auto mb-1 text-primary-500" />
            <p className="text-lg font-bold text-surface-800 dark:text-surface-100">{stats.count}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">{t.articlesStored}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <HardDrive className="w-5 h-5 mx-auto mb-1 text-accent-500" />
            <p className="text-lg font-bold text-surface-800 dark:text-surface-100">{sizeDisplay}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">{t.storageUsed}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <Check className="w-5 h-5 mx-auto mb-1 text-accent-500" />
            <p className="text-lg font-bold text-surface-800 dark:text-surface-100">{stats.downloadedCount}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">{t.downloaded}</p>
          </div>
        </div>
        <button
          onClick={handleClearAll}
          disabled={stats.count === 0}
          className="btn-ghost text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 w-full mt-3 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          {t.clearAll}
        </button>
      </div>

      {/* Offline Ready */}
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center shrink-0">
            <Wifi className="w-4.5 h-4.5 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-800 dark:text-surface-100 mb-1">{t.offlineReady}</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{t.offlineReadyHint}</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
            <Info className="w-4.5 h-4.5 text-surface-500 dark:text-surface-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-800 dark:text-surface-100 mb-1">{t.about}</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{t.aboutText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
