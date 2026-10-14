import { site } from '@/config'
import { GitHubMark } from './GitHubMark'

/** The store and release links, shown wherever the site says "get it". */
export function Downloads({ only }: { only?: 'desktop' | 'mobile' }) {
  return (
    <div className="downloads">
      {only !== 'mobile' && (
        <a className="dl dl-primary" href={site.releases}>
          <span className="dl-small">macOS · Windows · Linux</span>
          <span className="dl-big">Download for desktop</span>
        </a>
      )}
      {only !== 'desktop' && (
        <>
          {site.appStore ? (
            <a className="dl" href={site.appStore}>
              <span className="dl-small">Download on the</span>
              <span className="dl-big">App Store</span>
            </a>
          ) : (
            <span className="dl dl-soon" aria-disabled="true">
              <span className="dl-small">Coming soon to the</span>
              <span className="dl-big">App Store</span>
            </span>
          )}
          <a className="dl" href={site.googlePlay}>
            <span className="dl-small">Get it on</span>
            <span className="dl-big">Google Play</span>
          </a>
        </>
      )}
      <a className="dl dl-ghost" href={site.github}>
        <span className="dl-small">
          <GitHubMark size={13} /> Open source
        </span>
        <span className="dl-big">View on GitHub</span>
      </a>
    </div>
  )
}
