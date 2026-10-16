import type { MetadataRoute } from 'next';

const SITE = 'https://imin.wtf';
const LANGS = ['en', 'fr', 'es', 'uk'] as const;
type Path = '' | '/pro';

// English sits at the root, the other languages under /<lang>.
const url = (lang: (typeof LANGS)[number], path: Path) =>
  lang === 'en' ? `${SITE}${path || '/'}` : `${SITE}/${lang}${path}`;

// One entry per page and language, each listing every translation and English as x-default. In-page anchors are not URLs.
function page(path: Path, priority: number, changeFrequency: 'weekly' | 'monthly'): MetadataRoute.Sitemap {
  const languages = { ...Object.fromEntries(LANGS.map(l => [l, url(l, path)])), 'x-default': url('en', path) };
  return LANGS.map(lang => ({ url: url(lang, path), lastModified: new Date(), changeFrequency, priority, alternates: { languages } }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [...page('', 1, 'weekly'), ...page('/pro', 0.8, 'monthly')];
}
