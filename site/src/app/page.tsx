import Link from 'next/link'
import { Downloads } from '@/components/Downloads'
import { JsonLd } from '@/components/JsonLd'
import { Phone } from '@/components/Phone'
import { site } from '@/config'
import { desktopApp } from '@/structured-data'

const tabs = [
  { name: 'Claude Code', project: 'api', state: 'busy' },
  { name: 'Codex', project: 'web', state: 'waiting' },
  { name: 'OpenCode', project: 'docs', state: 'idle' },
  { name: 'Terminal', project: 'infra', state: 'idle' },
] as const

const features = [
  {
    title: 'Projects, not windows',
    body: 'Each project has a name, a colour, a main folder and its own instructions for the agent. Group them by category and fold away what you are not working on.',
  },
  {
    title: 'Any agent, in a real terminal',
    body: 'Tabs run Claude Code, Codex, OpenCode or a plain shell in a real PTY. Split a tab, or drag one beside another. Diffs, files and a browser open as tabs too.',
  },
  {
    title: 'Know who needs you',
    body: 'A tab spins while its agent is working and shows a solid dot when it is waiting on you. The same signal shows on the project in the sidebar.',
  },
  {
    title: 'Git, the way VS Code does it',
    body: 'Commit, amend, stage single hunks or lines, branches, merge and rebase, stashes, tags, conflicts resolved in the editor, and a commit graph of every branch.',
  },
  {
    title: 'Review before you merge',
    body: 'Go through uncommitted changes like a pull request, comment on lines, then send the whole review back to the agent to fix.',
  },
  {
    title: 'Picks up where you left off',
    body: 'Projects, tabs, layout and recent terminal output are saved as you go, so a restart or a reboot brings the workspace back.',
  },
]

export default function Home() {
  return (
    <>
      <JsonLd data={desktopApp} />
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">Free · open source · macOS, Windows, Linux</p>
          <h1>
            All your coding agents.
            <br />
            <em>One calm workspace.</em>
          </h1>
          <p className="lead">
            AlmaStudio puts Claude Code, Codex, OpenCode and your shells side by side, project by project, with git,
            files and diffs one click away. Step away from the desk and the companion app keeps you in the loop.
          </p>
          <Downloads />
        </div>
        <ul className="tabstrip" aria-label="Example tabs and their state">
          {tabs.map((t) => (
            <li key={t.name} data-state={t.state}>
              <span className="tab-signal" aria-hidden="true" />
              <span className="tab-name">{t.name}</span>
              <span className="tab-project">{t.project}</span>
              <span className="tab-state">
                {t.state === 'busy' ? 'working' : t.state === 'waiting' ? 'waiting for you' : 'idle'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="shot wrap" aria-label="Screenshot">
        <figure>
          <img
            src="/main-window.png"
            width={1600}
            height={974}
            alt="The AlmaStudio window: projects on the left, a Claude Code tab in the middle, the git changes panel on the right"
          />
        </figure>
      </section>

      <section id="desktop" className="wrap section">
        <div className="section-head">
          <p className="eyebrow">The desktop app</p>
          <h2>Built for the way agents actually work: many at once.</h2>
          <p>
            A Tauri app in Rust and React. One webview for the whole interface, no Electron, no browser process per
            tab.
          </p>
        </div>
        <ol className="features">
          {features.map((f, i) => (
            <li key={f.title}>
              <span className="feature-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="companion-band">
        <div className="wrap companion-grid">
          <div>
            <p className="eyebrow">The companion app · iPhone, iPad, Android</p>
            <h2>Your agents don’t stop when you leave the desk.</h2>
            <p>
              Watch any tab and type into it, open new agents, browse files and git, and get a notification when an
              agent finishes or needs an answer. Everything still runs on your computer, end-to-end encrypted.
            </p>
            <p>
              <Link className="arrow" href="/companion/">
                How the companion app works
              </Link>
            </p>
          </div>
          <Phone />
        </div>
      </section>

      <section className="wrap section get">
        <div className="section-head">
          <p className="eyebrow">Get AlmaStudio</p>
          <h2>Download it, read it, change it.</h2>
          <p>
            Signed builds for macOS (Apple silicon and Intel), Windows and Linux are on GitHub, with automatic
            updates. The whole source is there too, under the MIT license.
          </p>
        </div>
        <Downloads />
        <p className="get-repo">
          Source, releases and issues: <a href={site.github}>github.com/Irregulab/almastudio</a>
        </p>
      </section>
    </>
  )
}
