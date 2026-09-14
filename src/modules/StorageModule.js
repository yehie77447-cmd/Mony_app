import Dexie from 'dexie';

export const db = new Dexie('MonyAppDB');

// دعم كافة تصنيفات المحتوى والمصادر والوسائط
db.version(2).stores({
  articles: '++id, title, type, platform, category, isSaved, createdAt',
  transactions: '++id, type, amount, note, date'
});

export const StorageModule = {
  // جلب العناصر
  async getAllArticles() {
    try {
      return await db.articles.orderBy('id').reverse().toArray();
    } catch (error) {
      console.error('Error fetching content:', error);
      return [];
    }
  },

  // حفظ عنصر جديد متعدد الوسائط
  async saveArticle(itemData) {
    return await db.articles.add({
      title: itemData.title || 'بدون عنوان',
      summary: itemData.summary || '',
      content: itemData.content || '',
      type: itemData.type || 'article', // 'article' | 'video' | 'audio' | 'social'
      platform: itemData.platform || 'web', // 'youtube' | 'x' | 'facebook' | 'instagram' | 'tiktok' | 'rss'
      mediaUrl: itemData.mediaUrl || '',
      author: itemData.author || '',
      thumbnail: itemData.thumbnail || '',
      category: itemData.category || 'عام',
      isSaved: itemData.isSaved ?? true,
      createdAt: itemData.createdAt || new Date().toISOString()
    });
  },

  // حذف عنصر
  async deleteArticle(id) {
    return await db.articles.delete(id);
  },

  // جلب المحفوظات
  async getSavedArticles() {
    return await db.articles.filter(item => item.isSaved === true).toArray();
  }
};

export default StorageModule;

