import Link from 'next/link'
import { site } from '@/config'
import { GitHubMark } from './GitHubMark'

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-about">
          <p className="footer-brand">
            <img src="/icon.png" alt="" width={24} height={24} /> AlmaStudio
          </p>
          <p>
            Free and open source under the MIT license.
            <br />
            Made by {site.studio} ({site.company}).
          </p>
          <a className="footer-github" href={site.github}>
            <GitHubMark size={16} /> github.com/Irregulab/almastudio
          </a>
        </div>
        <nav aria-label="Product" className="footer-col">
          <h2>Product</h2>
          <Link href="/#desktop">Desktop app</Link>
          <Link href="/companion/">Companion app</Link>
          <a href={site.releases}>Download</a>
          <a href={site.github}>Source code</a>
        </nav>
        <nav aria-label="Help" className="footer-col">
          <h2>Help</h2>
          <Link href="/support/">Support</Link>
          <a href={site.issues}>Report an issue</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </nav>
        <nav aria-label="Legal" className="footer-col">
          <h2>Legal</h2>
          <Link href="/privacy/">Privacy policy</Link>
          <Link href="/delete-data/">Delete your data</Link>
          <Link href="/terms/">Terms of use</Link>
        </nav>
      </div>
    </footer>
  )
}
