import Dexie from 'dexie';

// 1. إنشاء قاعدة البيانات المحلية وتسميتها
export const db = new Dexie('AppLocalDB');

// 2. تحديد الجداول والوسوم لحفظ البيانات بدون إنترنت
db.version(1).stores({
  transactions: '++id, type, amount, note, date, isOffline',
  notes: '++id, title, content, date'
});

// 3. الوظائف البرمجية لإدارة البيانات
export const StorageModule = {
  // إضافة معاملة جديدة (مصروف، دين، أو قيد)
  async addTransaction(data) {
    return await db.transactions.add({
      ...data,
      date: data.date || new Date().toISOString(),
      isOffline: true
    });
  },

  // جلب كافة المعاملات المحفوظة على الهاتف
  async getTransactions() {
    return await db.transactions.toArray();
  },

  // حذف معاملة بواسطة الـ ID
  async deleteTransaction(id) {
    return await db.transactions.delete(id);
  }
};

