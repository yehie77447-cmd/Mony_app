import Dexie from 'dexie';

// إنشاء قاعدة البيانات المحلية
export const db = new Dexie('MonyAppDB');

db.version(1).stores({
  articles: '++id, title, summary, content, category, isSaved, createdAt',
  transactions: '++id, type, amount, note, date'
});

export const StorageModule = {
  // جلب كافة المقالات (الدالة التي كانت مفقودة وتسببت بالخطأ)
  async getAllArticles() {
    try {
      const articles = await db.articles.toArray();
      return articles;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },

  // دالة بديلة لنفس الغرض
  async getArticles() {
    return await this.getAllArticles();
  },

  // حفظ مقال أو عنصر جديد
  async saveArticle(articleData) {
    return await db.articles.add({
      ...articleData,
      createdAt: articleData.createdAt || new Date().toISOString(),
      isSaved: articleData.isSaved ?? true
    });
  },

  // حذف مقال
  async deleteArticle(id) {
    return await db.articles.delete(id);
  },

  // جلب العناصر المحفوظة فقط
  async getSavedArticles() {
    return await db.articles.filter(item => item.isSaved === true).toArray();
  }
};

export default StorageModule;
