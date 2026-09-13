import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { TopBar } from '@/components/TopBar';
import { BottomNav, type View } from '@/components/BottomNav';
import { FeedView } from '@/components/FeedView';
import { ArticleDetailView } from '@/components/ArticleDetailView';
import { AddContentView } from '@/components/AddContentView';
import { SettingsView } from '@/components/SettingsView';

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

  const handleOpenArticle = (id: number) => {
    setOpenArticleId(id);
  };

  const handleCloseArticle = () => {
    setOpenArticleId(null);
  };

  const handleNavigate = (newView: View) => {
    setOpenArticleId(null);
    setView(newView);
  };

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view, openArticleId]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <TopBar title={topBarTitle} />

      <main>
        {openArticleId !== null ? (
          <ArticleDetailView articleId={openArticleId} onBack={handleCloseArticle} />
        ) : view === 'feed' ? (
          <FeedView
            onOpenArticle={handleOpenArticle}
            onAddContent={() => setView('add')}
          />
        ) : view === 'saved' ? (
          <FeedView
            onOpenArticle={handleOpenArticle}
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

      {openArticleId === null && <BottomNav current={view} onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
