export const ExtractorModule = {
  // فحص هل المدخل رابط أم نص بحث
  isUrl(str) {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  },

  // تحديد المنصة المجلوب منها الرابط
  detectPlatform(url) {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'x';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
    if (lower.includes('tiktok.com')) return 'tiktok';
    return 'web';
  },

  // استخراج معرّف فيديو اليوتيوب
  getYouTubeId(url) {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : '';
  },

  // جلب وتفكيك المحتوى من رابط
  async extractFromUrl(url) {
    const platform = this.detectPlatform(url);

    // 1. معالجة روابط يوتيوب وتضمين المشغل تلقائياً
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

    // 2. معالجة منصات السوشيال ميديا الأخرى عبر محركات oEmbed المفتوحة
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (!data.error) {
          return {
            title: data.title || `محتوى من ${platform}`,
            summary: data.author_name ? `منشور بواسطة ${data.author_name}` : 'منشور وسائط متعددة',
            content: data.html || `<p><a href="${url}" target="_blank" rel="noopener">فتح المنشور الأصلي على ${platform}</a></p>`,
            type: platform === 'tiktok' ? 'video' : 'social',
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

    // 3. جلب الويب العام في حال لم تكن المنصة مدعومة بـ oEmbed
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

  // البحث عن مواضيع وأخبار وتفكيك نتائجها
  async searchByText(query) {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ar&gl=YE&ceid=YE:ar`;
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    const data = await res.json();

    if (data.status === 'ok' && data.items && data.items.length > 0) {
      return data.items.slice(0, 5).map(item => ({
        title: item.title,
        summary: item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 180) + '...' : '',
        content: item.content || item.description || '',
        type: 'article',
        platform: 'web',
        mediaUrl: item.link || '',
        author: item.author || 'مصدر إخباري',
        thumbnail: item.thumbnail || (item.enclosure ? item.enclosure.link : ''),
        createdAt: item.pubDate || new Date().toISOString(),
      }));
    } else {
      throw new Error('لم يتم العثور على نتائج لهذا البحث');
    }
  }
};

export default ExtractorModule;

