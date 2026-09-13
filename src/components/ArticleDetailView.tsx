import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Check, Languages, Trash2, Clock, ExternalLink, StickyNote, Plus, X, Loader2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { StorageModule, type Article, type Note } from '@/modules/StorageModule';
import { useLanguage } from '@/i18n/LanguageContext';
import { SourceBadge } from './SourceBadge';
import { useToast } from '@/context/ToastContext';

interface Props {
  articleId: number;
  onBack: () => void;
}

export function ArticleDetailView({ articleId, onBack }: Props) {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);

  const article = useLiveQuery(() => StorageModule.getArticle(articleId), [articleId]);

  useEffect(() => {
    if (article && !article.isRead) {
      StorageModule.updateArticle(articleId, { isRead: true });
    }
  }, [articleId, article]);

  const handleDownload = useCallback(async () => {
    if (!article || article.isDownloaded) return;
    setDownloading(true);
    try {
      const { FetcherModule } = await import('@/modules/FetcherModule');
      const fullContent = await FetcherModule.downloadFullContent(article.url);
      await StorageModule.updateArticle(articleId, {
        isDownloaded: true,
        downloadedContent: fullContent,
      });
      toast.show(t.toastDownloaded);
    } catch {
      toast.show(t.toastError, 'error');
    } finally {
      setDownloading(false);
    }
  }, [article, articleId, t, toast]);

  const handleTranslate = useCallback(async () => {
    if (!article) return;
    setTranslating(true);
    try {
      const { AiModule } = await import('@/modules/AiModule');
      const targetLang = lang === 'ar' ? 'en' : 'ar';
      const changes: Partial<Article> = {};

      if (targetLang === 'ar' && !article.titleAr) {
        changes.titleAr = AiModule.translate(article.title, 'en', 'ar');
        changes.summaryAr = article.summary.map((s) => AiModule.translate(s, 'en', 'ar'));
        changes.contentAr = AiModule.translate(article.content, 'en', 'ar');
      } else if (targetLang === 'en' && !article.titleEn) {
        changes.titleEn = AiModule.translate(article.title, 'ar', 'en');
        changes.summaryEn = article.summary.map((s) => AiModule.translate(s, 'ar', 'en'));
        changes.contentEn = AiModule.translate(article.content, 'ar', 'en');
      }

      await StorageModule.updateArticle(articleId, changes);
      setShowTranslation(true);
      toast.show(t.toastTranslated);
    } catch {
      toast.show(t.toastError, 'error');
    } finally {
      setTranslating(false);
    }
  }, [article, articleId, lang, t, toast]);

  const handleSaveNote = useCallback(async () => {
    if (!noteText.trim() || !article) return;
    const note: Note = {
      id: Math.random().toString(36).slice(2),
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    await StorageModule.addNote(articleId, note);
    setNoteText('');
    setShowNoteInput(false);
    toast.show(t.toastNoteSaved);
  }, [article, articleId, noteText, t, toast]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    await StorageModule.deleteNote(articleId, noteId);
  }, [articleId]);

  const handleDelete = useCallback(async () => {
    if (!article) return;
    if (!window.confirm(t.confirmDelete)) return;
    await StorageModule.deleteArticle(articleId);
    toast.show(t.toastDeleted);
    onBack();
  }, [article, articleId, t, toast, onBack]);

  if (!article) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
      </div>
    );
  }

  const displayTitle = lang === 'ar' ? (article.titleAr || article.title) : (article.titleEn || article.title);
  const displaySummary = lang === 'ar' ? (article.summaryAr || article.summary) : (article.summaryEn || article.summary);
  const displayContent = showTranslation
    ? (lang === 'ar' ? (article.contentAr || article.content) : (article.contentEn || article.content))
    : article.content;
  const timeAgo = getTimeAgo(article.fetchedAt, lang);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 animate-fade-in">
      {/* Back button */}
      <button onClick={onBack} className="btn-ghost mb-4 -ml-2 rtl:-mr-2">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t.backToFeed}
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <SourceBadge source={article.source} />
        <span className="text-sm text-surface-500 dark:text-surface-400 font-medium">{article.sourceName}</span>
        <span className="text-surface-300 dark:text-surface-600">·</span>
        <span className="flex items-center gap-1 text-sm text-surface-400 dark:text-surface-500">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo}
        </span>
      </div>

      {/* Thumbnail */}
      {article.thumbnail && (
        <div className="mb-4 rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 aspect-video">
          <img src={article.thumbnail} alt={displayTitle} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl font-bold leading-tight mb-4 text-balance text-surface-900 dark:text-surface-50">
        {displayTitle}
      </h1>

      {/* Author */}
      {article.author && (
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
          {article.author}
        </p>
      )}

      {/* AI Summary */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">AI</span>
          </div>
          <h3 className="text-sm font-bold text-surface-700 dark:text-surface-200">{t.summary}</h3>
        </div>
        <div className="space-y-2">
          {displaySummary.map((bullet, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-400 dark:bg-primary-500 shrink-0" />
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{bullet}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-surface-500 dark:text-surface-400">{t.tags}</h3>
            <span className="badge bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300">{t.autoTagged}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          {showTranslation ? (
            <h3 className="text-sm font-bold text-surface-700 dark:text-surface-200">{t.translatedContent}</h3>
          ) : (
            <h3 className="text-sm font-bold text-surface-700 dark:text-surface-200">{t.originalContent}</h3>
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {displayContent.split('\n').map((para, i) => {
            if (para.startsWith('## ')) {
              return <h3 key={i} className="font-bold text-surface-800 dark:text-surface-100 mt-3 mb-1">{para.slice(3)}</h3>;
            }
            if (para.startsWith('> ')) {
              return <blockquote key={i} className="border-s-2 border-primary-400 dark:border-primary-600 ps-3 italic text-surface-600 dark:text-surface-400 my-2">{para.slice(2)}</blockquote>;
            }
            if (para.startsWith('- ')) {
              return <li key={i} className="text-sm text-surface-700 dark:text-surface-300 ms-4">{para.slice(2)}</li>;
            }
            if (para.trim()) {
              return <p key={i} className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed mb-2">{para}</p>;
            }
            return null;
          })}
        </div>
      </div>

      {/* Notes section */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-surface-500 dark:text-surface-400" />
            <h3 className="text-sm font-bold text-surface-700 dark:text-surface-200">{t.notesTitle}</h3>
          </div>
          <button onClick={() => setShowNoteInput(!showNoteInput)} className="btn-ghost text-xs px-2 py-1">
            <Plus className="w-3.5 h-3.5" />
            {t.addNotes}
          </button>
        </div>

        {showNoteInput && (
          <div className="mb-3 animate-slide-down">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={3}
              className="input mb-2 text-sm resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveNote} className="btn-primary text-xs flex-1">
                {t.saveNote}
              </button>
              <button onClick={() => { setShowNoteInput(false); setNoteText(''); }} className="btn-secondary text-xs">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {article.notes && article.notes.length > 0 ? (
          <div className="space-y-2">
            {article.notes.map((note) => (
              <div key={note.id} className="flex items-start gap-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 group">
                <div className="flex-1">
                  <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{note.text}</p>
                  <span className="text-xs text-surface-400 dark:text-surface-500 mt-1 block">
                    {new Date(note.createdAt).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-error-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : !showNoteInput ? (
          <p className="text-sm text-surface-400 dark:text-surface-500">{t.noNotes}</p>
        ) : null}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading || article.isDownloaded}
          className={article.isDownloaded ? 'btn-secondary' : 'btn-accent'}
        >
          {article.isDownloaded ? <Check className="w-4 h-4" /> : downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {article.isDownloaded ? t.downloaded : downloading ? t.downloading : t.downloadOffline}
        </button>
        <button onClick={handleTranslate} disabled={translating} className="btn-secondary">
          {translating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
          {lang === 'ar' ? t.translateEnglish : t.translateArabic}
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          <ExternalLink className="w-4 h-4" />
          {t.originalContent}
        </a>
        <button onClick={handleDelete} className="btn-ghost text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20">
          <Trash2 className="w-4 h-4" />
          {t.deleteArticle}
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string, lang: 'en' | 'ar'): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (lang === 'ar') {
    if (mins < 1) return 'الآن';
    if (mins < 60) return `قبل ${mins} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    if (days < 30) return `قبل ${days} يوم`;
    return new Date(dateStr).toLocaleDateString('ar');
  }

  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en');
}
