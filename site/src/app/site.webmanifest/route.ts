import { site } from '@/config'

export const dynamic = 'force-static'

export function GET() {
  const manifest = {
    name: `${site.name} — a desktop workspace for AI coding agents`,
    short_name: site.name,
    description:
      'Run Claude Code, Codex, OpenCode and shells side by side, and follow them from your phone with the companion app.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#1e1e1e',
    theme_color: '#1e1e1e',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    // The native companion app, so browsers can point to the store instead.
    related_applications: [
      { platform: 'play', url: site.googlePlay, id: 'com.irregulab.almastudio.app' },
      ...(site.appStore ? [{ platform: 'itunes', url: site.appStore }] : []),
    ],
    prefer_related_applications: false,
  }
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
