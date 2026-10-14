import type { Metadata } from 'next'
import Link from 'next/link'
import { Downloads } from '@/components/Downloads'
import { JsonLd } from '@/components/JsonLd'
import { Phone } from '@/components/Phone'
import { site } from '@/config'
import { companionApp } from '@/structured-data'

export const metadata: Metadata = {
  title: 'Companion app',
  description:
    'AlmaStudio Companion App for iPhone, iPad and Android: watch and drive the terminals and AI agents running on your computer, end-to-end encrypted.',
}

const can = [
  ['Watch and type', 'Any terminal or agent tab, live, with a key bar for esc, ctrl, tab and the arrows.'],
  ['Start and restart', 'Open a new Claude Code, Codex, OpenCode or shell tab in any project, or restart one that stopped.'],
  ['Get notified', 'A notification when an agent finishes or is waiting for your answer, even with the app closed.'],
  ['Browse the project', 'Files, git changes, diffs, commit history and search across the project.'],
  ['Several computers', 'Pair more than one computer and switch between them.'],
  ['Lock it', 'Ask for Face ID, Touch ID or a fingerprint before the app shows anything.'],
]

const steps = [
  ['Turn it on', 'In AlmaStudio on your computer, open Settings → Companion app and allow the companion app.'],
  ['Scan the code', 'Click “Pair a device…”. Open the app on your phone, tap “Scan the pairing code” and point it at the QR code.'],
  ['Allow the device', 'Your computer asks whether to allow it. Click Allow, and the app shows your projects and tabs.'],
]

export default function Companion() {
  return (
    <>
      <JsonLd data={companionApp} />
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">AlmaStudio Companion App · iPhone, iPad, Android</p>
          <h1>
            Your agents, <em>in your pocket.</em>
          </h1>
          <p className="lead">
            Nothing runs on your phone. The app connects to AlmaStudio on your computer and shows what is happening
            there, so you can follow and steer your agents from the couch, the kitchen or the train.
          </p>
          <Downloads only="mobile" />
          <p className="small">
            Needs AlmaStudio running on a Mac, Windows or Linux computer —{' '}
            <a href={site.releases}>download it free from GitHub</a>.
          </p>
        </div>
        <Phone />
      </section>

      <section className="wrap section">
        <div className="section-head">
          <p className="eyebrow">What it does</p>
          <h2>The parts of your desk you miss when you are away from it.</h2>
        </div>
        <dl className="pairs">
          {can.map(([t, d]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="companion-band">
        <div className="wrap section">
          <div className="section-head">
            <p className="eyebrow">Pairing</p>
            <h2>Three steps, once per device.</h2>
          </div>
          <ol className="steps">
            {steps.map(([t, d], i) => (
              <li key={t}>
                <span className="feature-n">{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <p className="eyebrow">Private by design</p>
          <h2>Between your phone and your computer. Nobody else.</h2>
        </div>
        <div className="prose narrow">
          <p>
            Every connection is end-to-end encrypted with the Noise protocol (<code>Noise_IK_25519_ChaChaPoly_SHA256</code>
            , the same family WireGuard uses). Only devices you allowed on the computer can connect.
          </p>
          <p>
            On your home or office network the app talks to your computer directly. With <em>Reachable from anywhere</em>{' '}
            turned on, it can also go through the AlmaStudio relay, which forwards encrypted data it cannot read.
          </p>
          <p>
            No account, no analytics, no ads. Notifications are the only thing that leaves your devices, and you can
            leave project names and messages out of them. Read the <Link href="/privacy/">privacy policy</Link>, or see{' '}
            <Link href="/delete-data/">how to delete your data</Link>.
          </p>
        </div>
      </section>
    </>
  )
}
