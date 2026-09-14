import React, { useEffect, useState } from 'react';
import { StorageModule } from '@/modules/StorageModule';

interface FeedViewProps {
  onOpenArticle: (id: number) => void;
  onAddContent: () => void;
}

export function FeedView({ onOpenArticle, onAddContent }: FeedViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'social' | 'article'>('all');
  const [displayLimit, setDisplayLimit] = useState(10);

  const loadData = async () => {
    setLoading(true);
    const data = await StorageModule.getAllArticles();
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('هل تريد حذف هذا المحتوى؟')) {
      await StorageModule.deleteArticle(id);
      await loadData();
    }
  };

  // تصفية العناصر حسب التبويب المختار
  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'video') return item.type === 'video' || item.platform === 'youtube' || item.platform === 'tiktok';
    if (activeTab === 'social') return item.type === 'social' || ['x', 'twitter', 'instagram', 'facebook'].includes(item.platform);
    if (activeTab === 'article') return item.type === 'article' || item.platform === 'web';
    return true;
  });

  const visibleItems = filteredItems.slice(0, displayLimit);

  const renderPlatformBadge = (platform: string) => {
    const badges: Record<string, { name: string; color: string }> = {
      youtube: { name: 'YouTube', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      x: { name: 'X / Twitter', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
      instagram: { name: 'Instagram', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
      facebook: { name: 'Facebook', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      tiktok: { name: 'TikTok', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      web: { name: 'ويب / أخبار', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    };

    const b = badges[platform] || badges.web;
    return (
      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${b.color} font-medium`}>
        {b.name}
      </span>
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 dir-rtl">
      {/* هيدر وزر إضافة */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-white">الموجز والوسائط</h1>
        <button
          onClick={onAddContent}
          className="bg-sky-500 hover:bg-sky-600 text-white text-sm px-4 py-2 rounded-xl transition flex items-center gap-1 shadow-lg shadow-sky-500/20"
        >
          + إضافة / بحث
        </button>
      </div>

      {/* تبويبات الفرز بأسلوب المنصات الحديثة */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'video', label: '🎬 فيديوهات' },
          { id: 'social', label: '💬 سوشيال ميديا' },
          { id: 'article', label: '📰 أخبار ومقالات' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setDisplayLimit(10); }}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">جاري تحميل المحتوى والوسائط...</div>
      ) : visibleItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400 mb-4">لا يوجد محتوى في هذا القسم حالياً.</p>
          <button
            onClick={onAddContent}
            className="text-sky-400 hover:underline font-medium text-sm"
          >
            اضغط هنا لإضافة روابط أو إجراء بحث جديد ↵
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              onClick={() => item.id && onOpenArticle(item.id)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-lg cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderPlatformBadge(item.platform || 'web')}
                  {item.author && <span className="text-xs text-slate-400">بواسطة {item.author}</span>}
                </div>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  className="text-slate-500 hover:text-red-400 text-xs p-1"
                  title="حذف"
                >
                  ✕
                </button>
              </div>

              <h2 className="text-base font-bold text-slate-100 leading-snug">{item.title}</h2>

              {item.platform === 'youtube' && item.content && item.content.includes('iframe') ? (
                <div
                  className="my-2 overflow-hidden rounded-xl border border-slate-800 aspect-video"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              ) : item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-xl border border-slate-800 my-2"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : null}

              {item.summary && (
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                <span>{item.category || 'عام'}</span>
                <span>{new Date(item.createdAt).toLocaleDateString('ar-YE')}</span>
              </div>
            </div>
          ))}

          {/* زر تحميل المزيد لأسلوب التصفح اللانهائي */}
          {filteredItems.length > visibleItems.length && (
            <button
              onClick={() => setDisplayLimit(prev => prev + 10)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium text-xs rounded-xl transition shadow"
            >
              تحميل المزيد من المنشورات ↓
            </button>
          )}
        </div>
      )}
    </div>
  );
}
