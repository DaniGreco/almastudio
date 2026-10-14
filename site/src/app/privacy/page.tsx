import type { Metadata } from 'next'
import Link from 'next/link'
import { Legal } from '@/components/Legal'
import { site } from '@/config'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'What the AlmaStudio desktop app and the AlmaStudio Companion App do with your data.',
}

export default function Privacy() {
  return (
    <Legal
      title="Privacy policy"
      lead="AlmaStudio has no accounts, no analytics and no ads. Your code, terminals and files stay on your own devices. This page lists the few things that do leave them, and why."
    >
      <p>
        This policy covers the AlmaStudio desktop application (“AlmaStudio”) and the AlmaStudio Companion App for iOS,
        iPadOS and Android (“the app”), both published by {site.company} ({site.studio}), and this website.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {site.company}, Italy — <a href={`mailto:${site.email}`}>{site.email}</a>. Write to this address for any
        question or request about your data.
      </p>

      <h2>The desktop app</h2>
      <p>
        AlmaStudio runs on your computer. Your projects, tabs, settings and terminal history are stored in its data
        folder on that computer (see <Link href="/delete-data/">where</Link>) and are never sent to us.
      </p>
      <ul>
        <li>
          <strong>Updates.</strong> AlmaStudio checks for new versions by downloading a small file from{' '}
          <code>{site.updatesHost}</code>, and downloads the update from there or from GitHub when you install it.
          These requests carry no identifier of yours; like any web request they reveal your IP address and the
          version of the app to the server, whose standard access logs are kept for a limited time for security
          and operations.
        </li>
        <li>
          <strong>Agents and tools you run.</strong> Claude Code, Codex, OpenCode, git and any other program you start
          in a tab are separate software that talk to their own services under their own terms and privacy policies.
          AlmaStudio does not see or forward that traffic.
        </li>
        <li>
          <strong>Browser tabs</strong> visit the sites you open, like any browser; the default search engine is
          DuckDuckGo.
        </li>
      </ul>

      <h2>The companion app</h2>
      <h3>What stays between your devices</h3>
      <p>
        Terminal output, what you type, file contents, git data and search results travel only between the app and
        your own computer, end-to-end encrypted with the Noise protocol. On a local network the two talk directly.
        When you turn on <em>Reachable from anywhere</em> on the computer, the connection can also go through a relay
        operated by {site.company}, which forwards encrypted data it cannot read and stores none of it. We never
        receive, store or see this content.
      </p>
      <h3>What the app stores on your device</h3>
      <p>
        The keys and addresses of the computers you paired, and your preferences (theme, text size, lock). They stay on
        the device, the keys in its secure storage.
      </p>
      <h3>Push notifications</h3>
      <p>
        If you allow notifications, the app obtains a push token from Apple (APNs) or Google (Firebase Cloud
        Messaging) through Expo and sends it to your computer, which stores it. When an agent finishes or needs your
        input, your computer sends a short notification to that token through Expo’s push service (expo.dev), which
        delivers it through Apple or Google. It names the agent and the project and may include a short excerpt of
        what the agent said or is asking permission for. With <em>Hide project names in notifications</em> in AlmaStudio’s
        Companion app settings, only the agent and its status are sent; you can also turn notifications off.
      </p>
      <h3>Camera and biometrics</h3>
      <p>
        The camera is used only to scan the pairing QR code; no image is saved or sent anywhere. Face ID, Touch ID and
        fingerprint unlock are handled by the operating system; the app only learns whether it succeeded.
      </p>

      <h2>This website</h2>
      <p>
        This is a static site with no cookies, no analytics and no forms. The server that hosts it keeps standard
        access logs (IP address, page, time, browser) for security and operations.
      </p>

      <h2>What we do not do</h2>
      <p>We do not sell, rent or share personal data, build profiles, track you across apps or show ads.</p>

      <h2>Legal basis and your rights</h2>
      <p>
        Where the GDPR applies, the little data described here is processed to provide the features you use
        (Art. 6(1)(b)) and, for server logs, for our legitimate interest in keeping the service secure (Art.
        6(1)(f)). You can ask to access, correct or delete your data, object to processing, or complain to your data
        protection authority (in Italy, the Garante per la protezione dei dati personali). Since we hold no account
        and no content of yours, most data can be deleted by you directly: see{' '}
        <Link href="/delete-data/">Delete your data</Link>.
      </p>

      <h2>Children</h2>
      <p>AlmaStudio is a developer tool and is not directed at children under 16.</p>

      <h2>Changes</h2>
      <p>
        We will update this page when the apps change what they do with data, and change the date at the top. The
        history of this page is public in the <a href={site.github}>source repository</a>.
      </p>
    </Legal>
  )
}
