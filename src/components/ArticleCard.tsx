import { useState } from 'react';
import { Download, Check, Languages, StickyNote, Clock, ChevronRight } from 'lucide-react';
import type { Article } from '@/modules/StorageModule';
import { useLanguage } from '@/i18n/LanguageContext';
import { SourceBadge } from './SourceBadge';
import { useToast } from '@/context/ToastContext';
import { StorageModule } from '@/modules/StorageModule';

interface Props {
  article: Article;
  onOpen: (id: number) => void;
  onActionComplete: () => void;
}

export function ArticleCard({ article, onOpen, onActionComplete }: Props) {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  const displayTitle = lang === 'ar' ? (article.titleAr || article.titleEn || article.title) : (article.titleEn || article.titleAr || article.title);
  const displaySummary = lang === 'ar' ? (article.summaryAr || article.summaryEn || article.summary) : (article.summaryEn || article.summaryAr || article.summary);

  const timeAgo = getTimeAgo(article.fetchedAt, lang);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.isDownloaded) return;
    setDownloading(true);
    try {
      const { FetcherModule } = await import('@/modules/FetcherModule');
      const fullContent = await FetcherModule.downloadFullContent(article.url);
      await StorageModule.updateArticle(article.id!, {
        isDownloaded: true,
        downloadedContent: fullContent,
      });
      toast.show(t.toastDownloaded);
      onActionComplete();
    } catch {
      toast.show(t.toastError, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleQuickTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lang === 'ar' && article.titleAr) return;
    if (lang === 'en' && article.titleEn) return;

    const { AiModule } = await import('@/modules/AiModule');
    const targetLang = lang === 'ar' ? 'en' : 'ar';

    const translatedTitle = AiModule.translate(displayTitle, lang, targetLang);
    const translatedSummary = displaySummary.map((s) => AiModule.translate(s, lang, targetLang));

    const changes: Partial<Article> = {};
    if (targetLang === 'ar') {
      changes.titleAr = translatedTitle;
      changes.summaryAr = translatedSummary;
    } else {
      changes.titleEn = translatedTitle;
      changes.summaryEn = translatedSummary;
    }

    await StorageModule.updateArticle(article.id!, changes);
    toast.show(t.toastTranslated);
    onActionComplete();
  };

  return (
    <article
      onClick={() => onOpen(article.id!)}
      className="card card-hover p-4 cursor-pointer animate-slide-up group"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <SourceBadge source={article.source} />
        <span className="text-xs text-surface-400 dark:text-surface-500 font-medium">{article.sourceName}</span>
        <span className="text-surface-300 dark:text-surface-600">·</span>
        <span className="flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </span>
        {article.isDownloaded && (
          <>
            <span className="text-surface-300 dark:text-surface-600">·</span>
            <span className="flex items-center gap-1 text-xs text-accent-600 dark:text-accent-400 font-medium">
              <Check className="w-3 h-3" />
              {t.downloaded}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail */}
      {article.thumbnail && (
        <div className="mb-3 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 aspect-video">
          <img
            src={article.thumbnail}
            alt={displayTitle}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      )}

      {/* Title */}
      <h2 className="text-base font-bold leading-snug mb-2 text-balance text-surface-900 dark:text-surface-50 line-clamp-2">
        {displayTitle}
      </h2>

      {/* AI Summary bullets */}
      <div className="space-y-1.5 mb-3">
        {displaySummary.slice(0, 3).map((bullet, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-400 dark:bg-primary-500 shrink-0" />
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-2">{bullet}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1 pt-2 border-t border-surface-100 dark:border-surface-800">
        <button
          onClick={handleDownload}
          disabled={downloading || article.isDownloaded}
          className="btn-ghost text-xs px-3 py-1.5"
        >
          {article.isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          {article.isDownloaded ? t.downloaded : downloading ? t.downloading : t.downloadOffline}
        </button>
        <button onClick={handleQuickTranslate} className="btn-ghost text-xs px-3 py-1.5">
          <Languages className="w-3.5 h-3.5" />
          {lang === 'ar' ? t.translateEnglish : t.translateArabic}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(article.id!); }}
          className="btn-ghost text-xs px-3 py-1.5"
        >
          <StickyNote className="w-3.5 h-3.5" />
          {t.addNotes}
        </button>
        <span className="flex-1" />
        <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600 group-hover:text-primary-400 transition-colors rtl:rotate-180" />
      </div>
    </article>
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
