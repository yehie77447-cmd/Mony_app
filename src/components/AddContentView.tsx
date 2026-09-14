import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { StorageModule } from '@/modules/StorageModule';
import { ExtractorModule } from '@/modules/ExtractorModule';

interface AddContentViewProps {
  onDone: () => void;
  onBack: () => void;
}

export function AddContentView({ onDone, onBack }: AddContentViewProps) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    try {
      if (ExtractorModule.isUrl(input.trim())) {
        // جلب واستخراج المحتوى والوسائط من الرابط المباشر
        const extractedData = await ExtractorModule.extractFromUrl(input.trim());
        await StorageModule.saveArticle({
          ...extractedData,
          category: 'مجلوب',
          isSaved: true,
        });
      } else {
        // البحث والنقب عن المحتوى عن طريق نص البحث
        const results = await ExtractorModule.searchByText(input.trim());
        for (const item of results) {
          await StorageModule.saveArticle({
            ...item,
            category: input.trim(),
            isSaved: true,
          });
        }
      }

      setInput('');
      onDone(); // العودة للرئيسية وعرض العناصر المجلوبة
    } catch (err: any) {
      setError(err.message || 'تعذر جلب البيانات، يرجى التأكد من الرابط أو نص البحث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto dir-rtl">
      <button 
        onClick={onBack}
        className="mb-4 text-sm text-sky-400 hover:underline flex items-center gap-1"
      >
        ← العودة للرئيسية
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-2 text-white">إضافة محتوى / بحث شامل</h2>
        <p className="text-slate-400 text-sm mb-6">
          الصق رابط (يوتيوب، إكس/تويتر، تيك توك، فيسبوك، أو مقال) أو اكتب نص البحث لجلب المحتوى والوسائط تلقائياً.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب كلمة البحث أو الصق رابط الوسائط..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleFetch}
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? 'جاري الاستخراج والجلب...' : 'استخراج وجلب المحتوى'}
          </button>
        </div>
      </div>
    </div>
  );
}
