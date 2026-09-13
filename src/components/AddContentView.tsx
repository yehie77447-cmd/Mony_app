import { useState } from 'react';
import { Link, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { FetcherModule } from '@/modules/FetcherModule';
import { AiModule } from '@/modules/AiModule';
import { StorageModule } from '@/modules/StorageModule';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/context/ToastContext';

interface Props {
  onDone: () => void;
  onBack: () => void;
}

export function AddContentView({ onDone, onBack }: Props) {
  const { t } = useLanguage();
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!url.trim()) {
      setError(t.fetchError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fetched = await FetcherModule.fetch(url);
      const { summary, tags } = AiModule.process(fetched.content, fetched.title);

      const article = {
        url: fetched.url,
        title: fetched.title,
        content: fetched.content,
        summary,
        tags,
        source: fetched.source,
        sourceName: fetched.sourceName,
        author: fetched.author,
        thumbnail: fetched.thumbnail,
        publishedAt: fetched.publishedAt,
        fetchedAt: new Date().toISOString(),
        isDownloaded: false,
        notes: [],
        readProgress: 0,
        isRead: false,
      };

      await StorageModule.addArticle(article);
      toast.show(t.fetchSuccess);
      setUrl('');
      onDone();
    } catch {
      setError(t.fetchError);
      toast.show(t.fetchError, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 animate-fade-in">
      <button onClick={onBack} className="btn-ghost mb-4 -ml-2 rtl:-mr-2">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t.backToFeed}
      </button>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <Link className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">{t.addContentTitle}</h2>
          </div>
        </div>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">{t.addContentHint}</p>

        <div className="relative mb-3">
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder={t.urlPlaceholder}
            className="input pr-20"
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleFetch()}
            disabled={loading}
            autoFocus
          />
          <button
            onClick={handlePaste}
            className="absolute top-1/2 -translate-y-1/2 right-2 rtl:left-2 rtl:right-auto text-xs text-primary-500 hover:text-primary-600 font-semibold px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30"
          >
            Paste
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-sm text-error-700 dark:text-error-400 animate-slide-down">
            {error}
          </div>
        )}

        <button
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.fetching}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t.fetchContent}
            </>
          )}
        </button>

        {/* Quick examples */}
        <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
          <p className="text-xs text-surface-400 dark:text-surface-500 mb-2 font-medium">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Wikipedia Article', url: 'https://en.wikipedia.org/wiki/Web_browser' },
              { label: 'YouTube Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
            ].map((ex) => (
              <button
                key={ex.url}
                onClick={() => setUrl(ex.url)}
                className="tag"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
