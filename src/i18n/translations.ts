export type Language = 'en' | 'ar';

export interface TranslationKeys {
  appName: string;
  tagline: string;
  // Navigation
  navFeed: string;
  navSaved: string;
  navSettings: string;
  navAdd: string;
  // Feed
  feedTitle: string;
  feedEmpty: string;
  feedEmptyHint: string;
  feedSearchPlaceholder: string;
  feedFilterAll: string;
  feedFilterArticles: string;
  feedFilterVideos: string;
  feedFilterSaved: string;
  // Article card
  readMore: string;
  readLess: string;
  bullets: string;
  sourceArticle: string;
  sourceYouTube: string;
  sourceRSS: string;
  sourceUnknown: string;
  // Actions
  downloadOffline: string;
  downloaded: string;
  downloading: string;
  translateArabic: string;
  translateEnglish: string;
  addNotes: string;
  saveNote: string;
  deleteArticle: string;
  confirmDelete: string;
  // Add content
  addContentTitle: string;
  addContentHint: string;
  urlPlaceholder: string;
  fetchContent: string;
  fetching: string;
  fetchSuccess: string;
  fetchError: string;
  // Settings
  settingsTitle: string;
  language: string;
  english: string;
  arabic: string;
  darkMode: string;
  darkModeHint: string;
  storage: string;
  storageUsed: string;
  articlesStored: string;
  clearAll: string;
  confirmClear: string;
  about: string;
  aboutText: string;
  offlineReady: string;
  offlineReadyHint: string;
  // Tags
  tags: string;
  autoTagged: string;
  noTags: string;
  // Notes
  notesTitle: string;
  notesPlaceholder: string;
  notesSaved: string;
  noNotes: string;
  // Detail view
  backToFeed: string;
  originalContent: string;
  translatedContent: string;
  summary: string;
  // Errors
  errorGeneric: string;
  offlineMessage: string;
  onlineMessage: string;
  // Toast
  toastAdded: string;
  toastDeleted: string;
  toastTranslated: string;
  toastDownloaded: string;
  toastNoteSaved: string;
  toastCleared: string;
  toastError: string;
}

export const translations: Record<Language, TranslationKeys> = {
  en: {
    appName: 'Knowledge Hub',
    tagline: 'Fetch, summarize, and read offline',
    navFeed: 'Feed',
    navSaved: 'Saved',
    navSettings: 'Settings',
    navAdd: 'Add',
    feedTitle: 'Your Feed',
    feedEmpty: 'No articles yet',
    feedEmptyHint: 'Add a URL to start building your offline knowledge library.',
    feedSearchPlaceholder: 'Search articles, tags, sources...',
    feedFilterAll: 'All',
    feedFilterArticles: 'Articles',
    feedFilterVideos: 'Videos',
    feedFilterSaved: 'Saved',
    readMore: 'Read more',
    readLess: 'Read less',
    bullets: 'Key points',
    sourceArticle: 'Article',
    sourceYouTube: 'YouTube',
    sourceRSS: 'RSS',
    sourceUnknown: 'Web',
    downloadOffline: 'Download for Offline',
    downloaded: 'Saved Offline',
    downloading: 'Downloading...',
    translateArabic: 'Translate to Arabic',
    translateEnglish: 'Translate to English',
    addNotes: 'Add Notes',
    saveNote: 'Save Note',
    deleteArticle: 'Delete',
    confirmDelete: 'Delete this article permanently?',
    addContentTitle: 'Add Content',
    addContentHint: 'Paste an article URL, YouTube link, or RSS feed URL. The content will be fetched, summarized, and tagged automatically.',
    urlPlaceholder: 'https://example.com/article or https://youtube.com/watch?v=...',
    fetchContent: 'Fetch & Summarize',
    fetching: 'Fetching...',
    fetchSuccess: 'Content added to your feed',
    fetchError: 'Could not fetch this URL. Try another link.',
    settingsTitle: 'Settings',
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'Dark Mode',
    darkModeHint: 'Toggle between dark and light themes',
    storage: 'Storage',
    storageUsed: 'Storage used',
    articlesStored: 'Articles stored',
    clearAll: 'Clear All Data',
    confirmClear: 'This will permanently delete all articles, notes, and downloads. Continue?',
    about: 'About',
    aboutText: 'Knowledge Hub is a privacy-first, offline-capable PWA that fetches, summarizes, and translates web content. All data stays on your device.',
    offlineReady: 'Offline Ready',
    offlineReadyHint: 'This app works fully offline once loaded. Your articles and downloads are stored locally.',
    tags: 'Tags',
    autoTagged: 'AI-tagged',
    noTags: 'No tags',
    notesTitle: 'Personal Notes',
    notesPlaceholder: 'Write your thoughts, key takeaways, or references...',
    notesSaved: 'Note saved',
    noNotes: 'No notes yet. Add your first note above.',
    backToFeed: 'Back to Feed',
    originalContent: 'Original',
    translatedContent: 'Translation',
    summary: 'AI Summary',
    errorGeneric: 'Something went wrong',
    offlineMessage: 'You are offline. Showing saved content.',
    onlineMessage: 'Back online',
    toastAdded: 'Article added to feed',
    toastDeleted: 'Article deleted',
    toastTranslated: 'Content translated',
    toastDownloaded: 'Article downloaded for offline',
    toastNoteSaved: 'Note saved',
    toastCleared: 'All data cleared',
    toastError: 'Something went wrong',
  },
  ar: {
    appName: 'مركز المعرفة',
    tagline: 'اجلب، لخّص، واقرأ دون اتصال',
    navFeed: 'الرئيسية',
    navSaved: 'المحفوظات',
    navSettings: 'الإعدادات',
    navAdd: 'إضافة',
    feedTitle: 'موجزك',
    feedEmpty: 'لا توجد مقالات بعد',
    feedEmptyHint: 'أضف رابطًا لبدء بناء مكتبتك المعرفية دون اتصال.',
    feedSearchPlaceholder: 'ابحث في المقالات، الوسوم، المصادر...',
    feedFilterAll: 'الكل',
    feedFilterArticles: 'مقالات',
    feedFilterVideos: 'فيديوهات',
    feedFilterSaved: 'محفوظ',
    readMore: 'قراءة المزيد',
    readLess: 'قراءة أقل',
    bullets: 'النقاط الرئيسية',
    sourceArticle: 'مقال',
    sourceYouTube: 'يوتيوب',
    sourceRSS: 'RSS',
    sourceUnknown: 'ويب',
    downloadOffline: 'تنزيل للقراءة دون اتصال',
    downloaded: 'محفوظ دون اتصال',
    downloading: 'جارٍ التنزيل...',
    translateArabic: 'ترجمة إلى العربية',
    translateEnglish: 'ترجمة إلى الإنجليزية',
    addNotes: 'إضافة ملاحظات',
    saveNote: 'حفظ الملاحظة',
    deleteArticle: 'حذف',
    confirmDelete: 'حذف هذا المقال نهائيًا؟',
    addContentTitle: 'إضافة محتوى',
    addContentHint: 'الصق رابط مقال أو رابط يوتيوب أو رابط RSS. سيتم جلب المحتوى وتلخيصه ووسمه تلقائيًا.',
    urlPlaceholder: 'https://example.com/article أو https://youtube.com/watch?v=...',
    fetchContent: 'جلب وتلخيص',
    fetching: 'جارٍ الجلب...',
    fetchSuccess: 'تمت إضافة المحتوى إلى موجزك',
    fetchError: 'تعذر جلب هذا الرابط. جرّب رابطًا آخر.',
    settingsTitle: 'الإعدادات',
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    darkMode: 'الوضع الداكن',
    darkModeHint: 'التبديل بين الوضعين الداكن والفاتح',
    storage: 'التخزين',
    storageUsed: 'المساحة المستخدمة',
    articlesStored: 'المقالات المخزنة',
    clearAll: 'مسح جميع البيانات',
    confirmClear: 'سيؤدي هذا إلى حذف جميع المقالات والملاحظات والتنزيلات نهائيًا. متابعة؟',
    about: 'حول التطبيق',
    aboutText: 'مركز المعرفة هو تطبيق PWA يحترم خصوصيتك ويعمل دون اتصال، يجلب وي لخّص ويترجم محتوى الويب. جميع البيانات تبقى على جهازك.',
    offlineReady: 'جاهز للعمل دون اتصال',
    offlineReadyHint: 'يعمل هذا التطبيق بالكامل دون اتصال بمجرد تحميله. مقالاتك وتنزيلاتك مخزنة محليًا.',
    tags: 'الوسوم',
    autoTagged: 'وسم ذكي',
    noTags: 'لا توجد وسوم',
    notesTitle: 'ملاحظات شخصية',
    notesPlaceholder: 'اكتب أفكارك أو أهم الاستنتاجات أو المراجع...',
    notesSaved: 'تم حفظ الملاحظة',
    noNotes: 'لا توجد ملاحظات بعد. أضف ملاحظتك الأولى أعلاه.',
    backToFeed: 'العودة للرئيسية',
    originalContent: 'الأصلي',
    translatedContent: 'الترجمة',
    summary: 'ملخص ذكي',
    errorGeneric: 'حدث خطأ ما',
    offlineMessage: 'أنت دون اتصال. عرض المحتوى المحفوظ.',
    onlineMessage: 'عاد الاتصال',
    toastAdded: 'تمت إضافة المقال للموجز',
    toastDeleted: 'تم حذف المقال',
    toastTranslated: 'تمت ترجمة المحتوى',
    toastDownloaded: 'تم تنزيل المقال للقراءة دون اتصال',
    toastNoteSaved: 'تم حفظ الملاحظة',
    toastCleared: 'تم مسح جميع البيانات',
    toastError: 'حدث خطأ ما',
  },
};
