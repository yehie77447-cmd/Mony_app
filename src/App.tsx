import { useState, useEffect, Component, ReactNode } from 'react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { TopBar } from '@/components/TopBar';
import { BottomNav, type View } from '@/components/BottomNav';
import { FeedView } from '@/components/FeedView';
import { ArticleDetailView } from '@/components/ArticleDetailView';
import { AddContentView } from '@/components/AddContentView';
import { SettingsView } from '@/components/SettingsView';

// صائد الأخطاء التشغيلية
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 text-red-400 min-h-screen text-center dir-rtl">
          <h2 className="text-xl font-bold mb-2">حدث خطأ أثناء تشغيل التطبيق</h2>
          <p className="text-sm bg-slate-800 p-3 rounded border border-red-500/30">{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { t } = useLanguage();
  const [view, setView] = useState<View>('feed');
  const [openArticleId, setOpenArticleId] = useState<number | null>(null);

  const topBarTitle = view === 'settings'
    ? t.settingsTitle
    : view === 'add'
    ? t.addContentTitle
    : view === 'saved'
    ? t.navSaved
    : t.appName;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view, openArticleId]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-slate-100">
      <TopBar title={topBarTitle} />

      <main className="pb-20">
        {openArticleId !== null ? (
          <ArticleDetailView articleId={openArticleId} onBack={() => setOpenArticleId(null)} />
        ) : view === 'feed' || view === 'saved' ? (
          <FeedView
            onOpenArticle={(id) => setOpenArticleId(id)}
            onAddContent={() => setView('add')}
          />
        ) : view === 'add' ? (
          <AddContentView
            onDone={() => setView('feed')}
            onBack={() => setView('feed')}
          />
        ) : view === 'settings' ? (
          <SettingsView onCleared={() => setView('feed')} />
        ) : null}
      </main>

      {openArticleId === null && <BottomNav current={view} onNavigate={(v) => { setOpenArticleId(null); setView(v); }} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
