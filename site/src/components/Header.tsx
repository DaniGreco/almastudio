import Link from 'next/link'
import { site } from '@/config'
import { GitHubMark } from './GitHubMark'

export function Header() {
  return (
    <header className="header">
      <div className="wrap header-row">
        <Link href="/" className="brand">
          <img src="/icon.png" alt="" width={28} height={28} />
          <span>AlmaStudio</span>
        </Link>
        <nav aria-label="Main" className="nav">
          <Link href="/#desktop">Desktop</Link>
          <Link href="/companion/">Companion app</Link>
          <Link href="/support/">Support</Link>
          <a className="nav-github" href={site.github}>
            <GitHubMark />
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
