import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://bookingwulf.com'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/impressum`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/datenschutz`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/agb`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/avv`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
