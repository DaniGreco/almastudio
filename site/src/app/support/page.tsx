import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/config'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Help with AlmaStudio and the AlmaStudio Companion App: common questions, issues and contact.',
}

const faq: Array<[string, React.ReactNode]> = [
  [
    'Does the companion app work on its own?',
    <>
      No. It is a remote control for AlmaStudio, which must be installed and running on your Mac, Windows or Linux
      computer. <a href={site.releases}>Download AlmaStudio</a> for free.
    </>,
  ],
  [
    'How do I pair my phone?',
    <>
      In AlmaStudio open Settings → Companion app, allow the companion app and click <em>Pair a device…</em>. In the
      app tap <em>Scan the pairing code</em>, scan the QR code, then click <em>Allow</em> on the computer. The code
      expires after five minutes; open a new one if it does.
    </>,
  ],
  [
    'The app cannot reach my computer.',
    <>
      Check that AlmaStudio is open, that the companion app is allowed in its settings, and that the phone is on the
      same network as the computer. A firewall must let AlmaStudio accept connections on the port shown in its
      settings. To connect from another network, turn on <em>Reachable from anywhere</em>.
    </>,
  ],
  [
    'I do not get notifications.',
    <>
      Allow notifications for the app in the phone’s settings, and check that <em>Notifications</em> is on in
      AlmaStudio’s Companion app settings. The app shows a notification only for tabs other than the one on screen.
    </>,
  ],
  [
    'Is it safe to use on public Wi-Fi?',
    <>
      Yes. Every connection is end-to-end encrypted and only devices you allowed can connect. See the{' '}
      <Link href="/privacy/">privacy policy</Link>.
    </>,
  ],
  [
    'Which agents does AlmaStudio support?',
    <>
      Claude Code, Codex and OpenCode, plus plain shells. Each agent is a separate program you install and sign in to
      yourself.
    </>,
  ],
  [
    'How do I remove a phone, or delete everything?',
    <>
      See <Link href="/delete-data/">Delete your data</Link>.
    </>,
  ],
  [
    'Does it cost anything?',
    <>No. AlmaStudio and the companion app are free and open source under the MIT license.</>,
  ],
]

export default function Support() {
  return (
    <article className="wrap legal">
      <header className="legal-head">
        <p className="eyebrow">Support</p>
        <h1>How can we help?</h1>
        <p className="legal-lead">
          Most answers are below. For a bug or an idea, open an issue on GitHub; for anything private, write to us.
        </p>
      </header>

      <div className="contact">
        <a className="contact-card" href={site.issues}>
          <span className="dl-small">Bugs and ideas</span>
          <span className="dl-big">Open an issue on GitHub</span>
        </a>
        <a className="contact-card" href={`mailto:${site.email}?subject=AlmaStudio%20support`}>
          <span className="dl-small">Everything else</span>
          <span className="dl-big">{site.email}</span>
        </a>
      </div>

      <h2 className="faq-title">Questions</h2>
      <div className="faq">
        {faq.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <div className="faq-a">{a}</div>
          </details>
        ))}
      </div>
    </article>
  )
}
