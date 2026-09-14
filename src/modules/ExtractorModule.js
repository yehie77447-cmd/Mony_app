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

  // استخراج رابط مباشر
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

  // البحث الشامل والمتوازي في يوتيوب والسوشيال ميديا والأخبار
  async searchByText(query) {
    const results = [];

    // 1. جلب الفيديوهات من يوتيوب
    const fetchVideos = async () => {
      try {
        const res = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`);
        if (res.ok) {
          const data = await res.json();
          if (data.items) {
            return data.items.slice(0, 6).map((item) => {
              const videoId = item.url ? item.url.replace('/watch?v=', '') : '';
              return {
                title: item.title || 'فيديو يوتيوب',
                summary: `فيديو بواسطة: ${item.uploaderName || 'قناة يوتيوب'} (${item.duration ? Math.floor(item.duration / 60) + ' دقيقة' : ''})`,
                content: `<iframe class="w-full aspect-video rounded-xl" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`,
                type: 'video',
                platform: 'youtube',
                mediaUrl: `https://www.youtube.com/watch?v=${videoId}`,
                author: item.uploaderName || 'YouTube',
                thumbnail: item.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                createdAt: new Date().toISOString()
              };
            });
          }
        }
      } catch (e) {
        console.warn('YouTube Search Warning:', e);
      }
      return [];
    };

    // 2. جلب المنشورات والوسائط من منصات التواصل الاجتماعي
    const fetchSocial = async () => {
      try {
        const res = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=6&sort=relevance`);
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.children) {
            return data.data.children.map((c) => {
              const post = c.data;
              let thumb = '';
              if (post.thumbnail && post.thumbnail.startsWith('http')) {
                thumb = post.thumbnail;
              } else if (post.preview && post.preview.images && post.preview.images[0]) {
                thumb = post.preview.images[0].source.url.replace(/&amp;/g, '&');
              }
              return {
                title: post.title,
                summary: post.selftext ? post.selftext.substring(0, 180) + '...' : `منشور وتفاعل من مجتمع ${post.subreddit_name_prefixed}`,
                content: `<p>${post.selftext || post.title}</p>${thumb ? `<img src="${thumb}" class="w-full rounded-xl my-2"/>` : ''}<p><a href="https://reddit.com${post.permalink}" target="_blank" class="text-sky-400">مشاهدة المنشور الأصلي</a></p>`,
                type: 'social',
                platform: 'x',
                mediaUrl: `https://reddit.com${post.permalink}`,
                author: post.author ? `@${post.author}` : post.subreddit_name_prefixed,
                thumbnail: thumb,
                createdAt: new Date(post.created_utc * 1000).toISOString()
              };
            });
          }
        }
      } catch (e) {
        console.warn('Social Search Warning:', e);
      }
      return [];
    };

    // 3. جلب الأخبار والمقالات المرفقة بالصور المصغرة
    const fetchNews = async () => {
      try {
        const rssUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.contents) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            const items = Array.from(xmlDoc.querySelectorAll("item"));

            return items.slice(0, 8).map((item) => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "";
              const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
              const description = item.querySelector("description")?.textContent || "";

              let thumb = '';
              const imgMatch = description.match(/src=["'](.*?)["']/i);
              if (imgMatch) thumb = imgMatch[1];

              const cleanDesc = description.replace(/<[^>]*>?/gm, '').trim();

              return {
                title: title,
                summary: cleanDesc.substring(0, 200) + (cleanDesc.length > 200 ? '...' : ''),
                content: `<p>${cleanDesc}</p>${thumb ? `<img src="${thumb}" class="w-full rounded-xl my-2"/>` : ''}<p><a href="${link}" target="_blank" class="text-sky-400">قراءة المقال الكامل</a></p>`,
                type: 'article',
                platform: 'web',
                mediaUrl: link,
                author: 'مصدر إخباري',
                thumbnail: thumb,
                createdAt: pubDate
              };
            });
          }
        }
      } catch (e) {
        console.warn('News Search Warning:', e);
      }
      return [];
    };

    // تشغيل عمليات البحث المتوازية
    const [videos, socialPosts, newsArticles] = await Promise.all([
      fetchVideos(),
      fetchSocial(),
      fetchNews()
    ]);

    results.push(...videos, ...socialPosts, ...newsArticles);

    // إذا وُجدت نتائج
    if (results.length > 0) {
      return results;
    }

    // fallback: ويكيبيديا في حال عدم وجود نتائج
    try {
      const wikiUrl = `https://ar.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const wikiRes = await fetch(wikiUrl);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.query && wikiData.query.search) {
          return wikiData.query.search.slice(0, 5).map((item) => {
            const cleanSnippet = item.snippet.replace(/<[^>]*>?/gm, '');
            return {
              title: item.title,
              summary: cleanSnippet,
              content: `<p>${cleanSnippet}</p>`,
              type: 'article',
              platform: 'web',
              mediaUrl: `https://ar.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
              author: 'ويكيبيديا الموسوعة الحرة',
              thumbnail: '',
              createdAt: new Date().toISOString(),
            };
          });
        }
      }
    } catch (e) {}

    throw new Error('لم يتم العثور على نتائج للبحث، يرجى تجربة كلمات أخرى أو إضافة رابط مباشر');
  }
};

export default ExtractorModule;
