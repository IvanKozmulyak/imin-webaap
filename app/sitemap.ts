import type { MetadataRoute } from 'next';

// One-page site: the in-page anchors (#product, #team, …) are not URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://imin.wtf/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
