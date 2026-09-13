import Dexie, { type Table } from 'dexie';

export type SourceType = 'article' | 'youtube' | 'rss' | 'web';

export interface Article {
  id?: number;
  url: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  content: string;
  contentAr?: string;
  contentEn?: string;
  summary: string[];
  summaryAr?: string[];
  summaryEn?: string[];
  tags: string[];
  source: SourceType;
  sourceName: string;
  author?: string;
  thumbnail?: string;
  publishedAt?: string;
  fetchedAt: string;
  isDownloaded: boolean;
  downloadedContent?: string;
  notes: Note[];
  readProgress: number;
  isRead: boolean;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: unknown;
}

class KnowledgeHubDB extends Dexie {
  articles!: Table<Article, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('KnowledgeHubDB');
    this.version(1).stores({
      articles: '++id, url, source, isDownloaded, isRead, fetchedAt, *tags',
      settings: 'key',
    });
  }
}

const db = new KnowledgeHubDB();

export const StorageModule = {
  async addArticle(article: Omit<Article, 'id'>): Promise<number> {
    return await db.articles.add(article as Article);
  },

  async getArticle(id: number): Promise<Article | undefined> {
    return await db.articles.get(id);
  },

  async getAllArticles(): Promise<Article[]> {
    return await db.articles.orderBy('fetchedAt').reverse().toArray();
  },

  async getDownloadedArticles(): Promise<Article[]> {
    return await db.articles.where('isDownloaded').equals(1 as any).toArray();
  },

  async updateArticle(id: number, changes: Partial<Article>): Promise<void> {
    await db.articles.update(id, changes);
  },

  async deleteArticle(id: number): Promise<void> {
    await db.articles.delete(id);
  },

  async clearAll(): Promise<void> {
    await db.articles.clear();
  },

  async addNote(id: number, note: Note): Promise<void> {
    const article = await db.articles.get(id);
    if (article) {
      const notes = [...(article.notes || []), note];
      await db.articles.update(id, { notes });
    }
  },

  async deleteNote(id: number, noteId: string): Promise<void> {
    const article = await db.articles.get(id);
    if (article) {
      const notes = (article.notes || []).filter((n) => n.id !== noteId);
      await db.articles.update(id, { notes });
    }
  },

  async setSetting(key: string, value: unknown): Promise<void> {
    await db.settings.put({ key, value });
  },

  async getSetting<T>(key: string): Promise<T | undefined> {
    const setting = await db.settings.get(key);
    return setting?.value as T | undefined;
  },

  async getStats(): Promise<{ count: number; downloadedCount: number; approxSizeKB: number }> {
    const all = await db.articles.toArray();
    const count = all.length;
    const downloadedCount = all.filter((a) => a.isDownloaded).length;
    const jsonStr = JSON.stringify(all);
    const approxSizeKB = Math.round(new Blob([jsonStr]).size / 1024);
    return { count, downloadedCount, approxSizeKB };
  },

  async searchArticles(query: string): Promise<Article[]> {
    const q = query.toLowerCase().trim();
    if (!q) return await this.getAllArticles();
    const all = await db.articles.toArray();
    return all
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.sourceName.toLowerCase().includes(q) ||
          a.summary.some((s) => s.toLowerCase().includes(q)),
      )
      .sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
  },
};

export default StorageModule;
