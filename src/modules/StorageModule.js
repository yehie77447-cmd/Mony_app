const DB_NAME = 'MonyAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'articles';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageModule = {
  // جلب كافة المحتويات
  async getAllArticles() {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const res = req.result || [];
          res.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          resolve(res);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('DB Error:', e);
      return [];
    }
  },

  // جلب عنصر محدد برقمه (حل مشكلة getArticle)
  async getArticle(id) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(Number(id));
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('getArticle Error:', e);
      return null;
    }
  },

  // حفظ عنصر جديد مع تراكم المحتوى القديم
  async saveArticle(article) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const itemToSave = {
          ...article,
          createdAt: article.createdAt || new Date().toISOString()
        };
        const req = store.add(itemToSave);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('saveArticle Error:', e);
    }
  },

  // حذف عنصر
  async deleteArticle(id) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(Number(id));
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('deleteArticle Error:', e);
    }
  }
};

export default StorageModule;
