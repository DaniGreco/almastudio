import type { NextConfig } from 'next'

// A fully static site: `next build` writes plain HTML to out/, which any web
// server or static host can serve.
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default config
