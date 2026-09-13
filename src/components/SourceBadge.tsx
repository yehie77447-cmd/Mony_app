import { FileText, Youtube, Rss, Globe, type LucideIcon } from 'lucide-react';
import type { SourceType } from '@/modules/StorageModule';
import { useLanguage } from '@/i18n/LanguageContext';

const sourceConfig: Record<SourceType, { icon: LucideIcon; color: string; bg: string }> = {
  article: { icon: FileText, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/40' },
  youtube: { icon: Youtube, color: 'text-error-600 dark:text-error-400', bg: 'bg-error-100 dark:bg-error-900/40' },
  rss: { icon: Rss, color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-100 dark:bg-warning-900/40' },
  web: { icon: Globe, color: 'text-surface-500 dark:text-surface-400', bg: 'bg-surface-100 dark:bg-surface-800' },
};

export function SourceBadge({ source }: { source: SourceType }) {
  const { t } = useLanguage();
  const config = sourceConfig[source] || sourceConfig.web;
  const Icon = config.icon;

  let label: string;
  switch (source) {
    case 'article': label = t.sourceArticle; break;
    case 'youtube': label = t.sourceYouTube; break;
    case 'rss': label = t.sourceRSS; break;
    default: label = t.sourceUnknown;
  }

  return (
    <span className={`badge ${config.bg} ${config.color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
