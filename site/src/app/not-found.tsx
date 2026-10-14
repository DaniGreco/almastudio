import Link from 'next/link'

export default function NotFound() {
  return (
    <article className="wrap legal">
      <header className="legal-head">
        <p className="eyebrow">404</p>
        <h1>This page is not here.</h1>
        <p className="legal-lead">
          <Link href="/">Back to the home page</Link>
        </p>
      </header>
    </article>
  )
}
