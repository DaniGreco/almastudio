import { site } from '@/config'

/** The layout shared by the policy pages: a title, a date and prose. */
export function Legal({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <article className="wrap legal">
      <header className="legal-head">
        <p className="eyebrow">Last updated {site.legalUpdated}</p>
        <h1>{title}</h1>
        {lead && <p className="legal-lead">{lead}</p>}
      </header>
      <div className="prose">{children}</div>
    </article>
  )
}
