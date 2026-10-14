import type { MetadataRoute } from 'next'
import { site } from '@/config'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', 'companion/', 'support/', 'privacy/', 'delete-data/', 'terms/'].map((path) => ({
    url: `${site.url}/${path}`,
  }))
}
