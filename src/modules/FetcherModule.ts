import type { SourceType } from './StorageModule';

export interface FetchedContent {
  url: string;
  title: string;
  content: string;
  source: SourceType;
  sourceName: string;
  author?: string;
  thumbnail?: string;
  publishedAt?: string;
}

function detectSourceType(url: string): SourceType {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('/feed') || lower.includes('rss') || lower.endsWith('.xml') || lower.endsWith('.rss')) return 'rss';
  return 'article';
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

async function fetchViaProxy(url: string): Promise<string> {
  const proxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
    (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  ];

  for (const proxy of proxies) {
    try {
      const proxyUrl = proxy(url);
      const res = await fetch(proxyUrl, {
        headers: { Accept: 'text/html,application/xhtml+xml,application/xml,text/xml' },
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 200) return text;
      }
    } catch {
      // try next proxy
    }
  }

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) return await res.text();
  } catch {
    // direct fetch failed
  }

  throw new Error('All fetch methods failed');
}

function parseHtmlContent(html: string, url: string): { title: string; content: string; author?: string; thumbnail?: string; publishedAt?: string; sourceName: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove non-content elements
  doc.querySelectorAll('script, style, nav, footer, header, aside, iframe, noscript, form, button').forEach((el) => el.remove());

  // Title
  const title =
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
    doc.querySelector('title')?.textContent ||
    doc.querySelector('h1')?.textContent ||
    'Untitled Article';
  const cleanTitle = title.trim();

  // Author
  const author =
    doc.querySelector('meta[name="author"]')?.getAttribute('content') ||
    doc.querySelector('meta[property="article:author"]')?.getAttribute('content') ||
    doc.querySelector('[rel="author"]')?.textContent ||
    undefined;

  // Thumbnail
  const thumbnail =
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
    doc.querySelector('article img')?.getAttribute('src') ||
    undefined;

  // Published date
  const publishedAt =
    doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
    doc.querySelector('time')?.getAttribute('datetime') ||
    undefined;

  // Source name
  let sourceName = 'Web';
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    sourceName = hostname;
  } catch {
    // keep default
  }

  // Extract main content
  let contentEl = doc.querySelector('article') || doc.querySelector('main') || doc.querySelector('[role="main"]');
  if (!contentEl) {
    const paragraphs = Array.from(doc.querySelectorAll('p'));
    if (paragraphs.length > 0) {
      contentEl = doc.body;
    }
  }

  let content = '';
  if (contentEl) {
    const paragraphs = Array.from(contentEl.querySelectorAll('p, h2, h3, li, blockquote'))
      .filter((el) => {
        const text = el.textContent?.trim() || '';
        return text.length > 30;
      })
      .map((el) => {
        const tag = el.tagName.toLowerCase();
        const text = el.textContent?.trim() || '';
        if (tag.startsWith('h')) return `\n\n## ${text}`;
        if (tag === 'blockquote') return `\n> ${text}`;
        if (tag === 'li') return `- ${text}`;
        return text;
      });
    content = paragraphs.join('\n\n');
  }

  if (!content || content.length < 100) {
    const allText = doc.body?.textContent?.trim() || '';
    content = allText.replace(/\s{3,}/g, '\n\n').slice(0, 10000);
  }

  // Resolve relative URLs in thumbnail
  let resolvedThumbnail = thumbnail;
  if (thumbnail && !thumbnail.startsWith('http')) {
    try {
      resolvedThumbnail = new URL(thumbnail, url).href;
    } catch {
      resolvedThumbnail = undefined;
    }
  }

  return {
    title: cleanTitle,
    content: content.slice(0, 20000),
    author,
    thumbnail: resolvedThumbnail,
    publishedAt,
    sourceName,
  } as { title: string; content: string; author?: string; thumbnail?: string; publishedAt?: string; sourceName: string };
}

async function fetchYouTubeContent(url: string): Promise<FetchedContent> {
  const videoId = extractYouTubeId(url);
  if (!videoId) throw new Error('Invalid YouTube URL');

  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  // Try to fetch transcript via the page
  let title = 'YouTube Video';
  let content = '';

  try {
    const html = await fetchViaProxy(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      doc.querySelector('title')?.textContent ||
      'YouTube Video';

    // Try to extract description as content
    const description =
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      '';
    content = description || `YouTube video: ${title}. Video ID: ${videoId}`;
  } catch {
    content = `YouTube video (ID: ${videoId}). Unable to fetch full transcript, but metadata is available for offline reference.`;
  }

  return {
    url,
    title: title.trim(),
    content,
    source: 'youtube',
    sourceName: 'YouTube',
    thumbnail,
  };
}

async function fetchRSSContent(url: string): Promise<FetchedContent> {
  const xml = await fetchViaProxy(url);
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const channelTitle = doc.querySelector('channel > title')?.textContent || 'RSS Feed';
  const firstItem = doc.querySelector('item');
  const itemTitle = firstItem?.querySelector('title')?.textContent || 'RSS Article';
  const itemDescription = firstItem?.querySelector('description')?.textContent || '';
  const itemLink = firstItem?.querySelector('link')?.textContent || url;
  const itemDate = firstItem?.querySelector('pubDate')?.textContent || undefined;

  // Clean HTML from description
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = itemDescription;
  const cleanText = tempDiv.textContent?.trim() || '';

  return {
    url: itemLink.trim() || url,
    title: itemTitle.trim(),
    content: cleanText.slice(0, 20000) || 'No content available from RSS feed.',
    source: 'rss',
    sourceName: channelTitle.trim(),
    publishedAt: itemDate,
  thumbnail: undefined,
  author: undefined,
  };
}

export const FetcherModule = {
  async fetch(url: string): Promise<FetchedContent> {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) throw new Error('URL is required');

    let normalizedUrl = trimmedUrl;
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const sourceType = detectSourceType(normalizedUrl);

    if (sourceType === 'youtube') {
      return await fetchYouTubeContent(normalizedUrl);
    }

    if (sourceType === 'rss') {
      return await fetchRSSContent(normalizedUrl);
    }

    // Article / web page
    const html = await fetchViaProxy(normalizedUrl);
    const parsed = parseHtmlContent(html, normalizedUrl);

    return {
      url: normalizedUrl,
      title: parsed.title,
      content: parsed.content,
      source: 'article',
      sourceName: parsed.sourceName,
      author: parsed.author,
      thumbnail: parsed.thumbnail,
      publishedAt: parsed.publishedAt,
    };
  },

  async downloadFullContent(url: string): Promise<string> {
    const html = await fetchViaProxy(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, nav, footer, header, aside, iframe, noscript').forEach((el) => el.remove());
    const article = doc.querySelector('article') || doc.querySelector('main') || doc.body;
    return article?.textContent?.trim().slice(0, 50000) || '';
  },

  detectSourceType,
};

export default FetcherModule;
