import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Inbox, Loader2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { StorageModule, type Article } from '@/modules/StorageModule';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArticleCard } from './ArticleCard';

type FilterType = 'all' | 'article' | 'youtube' | 'saved';

interface Props {
  onOpenArticle: (id: number) => void;
  onAddContent: () => void;
}

export function FeedView({ onOpenArticle, onAddContent }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const allArticles = useLiveQuery(() => StorageModule.getAllArticles(), [refreshKey]);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const filteredArticles = (allArticles || []).filter((a: Article) => {
    if (filter === 'article' && a.source !== 'article') return false;
    if (filter === 'youtube' && a.source !== 'youtube') return false;
    if (filter === 'saved' && !a.isDownloaded) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        a.sourceName.toLowerCase().includes(q) ||
        a.summary.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t.feedFilterAll },
    { key: 'article', label: t.feedFilterArticles },
    { key: 'youtube', label: t.feedFilterVideos },
    { key: 'saved', label: t.feedFilterSaved },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 left-3 rtl:right-3 rtl:left-auto w-4 h-4 text-surface-400 dark:text-surface-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.feedSearchPlaceholder}
          className="input pl-10 rtl:pr-10 rtl:pl-4 py-2.5 text-sm"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {!allArticles ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-surface-400 dark:text-surface-500" />
          </div>
          <h3 className="text-lg font-bold text-surface-700 dark:text-surface-200 mb-1">{t.feedEmpty}</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-xs mb-4">{t.feedEmptyHint}</p>
          <button onClick={onAddContent} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t.navAdd}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onOpen={onOpenArticle}
              onActionComplete={triggerRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
