import type { MetadataRoute } from 'next';

// In-page anchors (#faq, #create, …) are not URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://imin.wtf/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://imin.wtf/pro',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
