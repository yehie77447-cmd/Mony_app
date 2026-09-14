export const ExtractorModule = {
  isUrl(str) {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  },

  detectPlatform(url) {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'x';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
    if (lower.includes('tiktok.com')) return 'tiktok';
    return 'web';
  },

  getYouTubeId(url) {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : '';
  },

  async extractFromUrl(url) {
    const platform = this.detectPlatform(url);

    if (platform === 'youtube') {
      const videoId = this.getYouTubeId(url);
      try {
        const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (res.ok) {
          const data = await res.json();
          return {
            title: data.title || 'فيديو يوتيوب',
            summary: `فيديو بواسطة: ${data.author_name || 'قناة يوتيوب'}`,
            content: `<iframe class="w-full aspect-video rounded-xl" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`,
            type: 'video',
            platform: 'youtube',
            mediaUrl: url,
            author: data.author_name || 'YouTube',
            thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          };
        }
      } catch (e) {
        console.error('YouTube Extract Error:', e);
      }
    }

    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (!data.error) {
          return {
            title: data.title || `محتوى من ${platform}`,
            summary: data.author_name ? `منشور بواسطة ${data.author_name}` : 'منشور وسائط متعددة',
            content: data.html || `<p><a href="${url}" target="_blank" rel="noopener">فتح المنشور الأصلي على ${platform}</a></p>`,
            type: platform === 'tiktok' || platform === 'youtube' ? 'video' : 'social',
            platform: platform,
            mediaUrl: url,
            author: data.author_name || platform,
            thumbnail: data.thumbnail_url || '',
          };
        }
      }
    } catch (e) {
      console.error('oEmbed Extract Error:', e);
    }

    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      const rawHtml = data.contents || '';
      const titleMatch = rawHtml.match(/<title[^>]*>(.*?)<\/title>/i);
      const extractedTitle = titleMatch ? titleMatch[1] : 'مقال ويب';
      const cleanText = rawHtml.replace(/<[^>]*>?/gm, '').trim();

      return {
        title: extractedTitle,
        summary: cleanText.substring(0, 200) + '...',
        content: cleanText.substring(0, 3000),
        type: 'article',
        platform: platform,
        mediaUrl: url,
        author: platform,
        thumbnail: '',
      };
    } catch (e) {
      throw new Error('تعذر جلب محتوى الرابط');
    }
  },

  // البحث الشامل من مصادر متعددة وتفكيك المحتوى بـ DOMParser
  async searchByText(query) {
    const results = [];

    // المصدر 1: الأخبار والمواضيع المباشرة
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ar&gl=YE&ceid=YE:ar`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.contents) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.contents, "text/xml");
          const items = Array.from(xmlDoc.querySelectorAll("item"));

          items.slice(0, 15).forEach((item) => {
            const title = item.querySelector("title")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "";
            const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
            const source = item.querySelector("source")?.textContent || "مصدر إخباري";
            const description = item.querySelector("description")?.textContent || "";

            const cleanDesc = description.replace(/<[^>]*>?/gm, '').trim();

            if (title) {
              results.push({
                title: title,
                summary: cleanDesc.substring(0, 200) + (cleanDesc.length > 200 ? '...' : ''),
                content: description || cleanDesc,
                type: 'article',
                platform: 'web',
                mediaUrl: link,
                author: source,
                thumbnail: '',
                createdAt: pubDate,
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("News Fetch Error:", e);
    }

    // المصدر 2: ويكيبيديا المعرفية (للمصطلحات والأسماء والشخصيات مثل "فنان اليمن" أو "اليمن")
    try {
      const wikiUrl = `https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const wikiRes = await fetch(wikiUrl);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.query && wikiData.query.search) {
          wikiData.query.search.slice(0, 5).forEach((item) => {
            const cleanSnippet = item.snippet.replace(/<[^>]*>?/gm, '');
            results.push({
              title: item.title,
              summary: cleanSnippet,
              content: `<p>${cleanSnippet}</p><p><a href="https://ar.wikipedia.org/wiki/${encodeURIComponent(item.title)}" target="_blank">المقال الكامل على ويكيبيديا</a></p>`,
              type: 'article',
              platform: 'web',
              mediaUrl: `https://ar.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
              author: 'ويكيبيديا الموسوعة الحرة',
              thumbnail: '',
              createdAt: new Date().toISOString(),
            });
          });
        }
      }
    } catch (e) {
      console.warn("Wiki Fetch Error:", e);
    }

    if (results.length > 0) {
      return results;
    }

    throw new Error('لم يتم العثور على نتائج للبحث، يرجى تجربة كلمات أخرى أو إضافة رابط مباشر');
  }
};

export default ExtractorModule;
