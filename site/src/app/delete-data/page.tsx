import type { Metadata } from 'next'
import Link from 'next/link'
import { Legal } from '@/components/Legal'
import { site } from '@/config'

export const metadata: Metadata = {
  title: 'Delete your data',
  description:
    'How to delete the data of the AlmaStudio Companion App and the AlmaStudio desktop app. There is no account: everything is on your own devices.',
}

export default function DeleteData() {
  return (
    <Legal
      title="Delete your data"
      lead="AlmaStudio and the AlmaStudio Companion App have no accounts, so there is no account to close. Everything they keep is on your own devices, and you can delete it yourself at any time."
    >
      <h2>Companion app (iPhone, iPad, Android)</h2>
      <ol>
        <li>
          <strong>Remove the device on your computer.</strong> In AlmaStudio open Settings → Companion app, find the
          device under <em>Paired devices</em> and click <em>Remove</em>. The computer disconnects it and deletes its
          key and its push notification token at once.
        </li>
        <li>
          <strong>Forget the computer in the app.</strong> On the app’s first screen, press and hold the computer and
          choose <em>Forget</em>. This deletes the computer’s key and address from the phone.
        </li>
        <li>
          <strong>Uninstall the app</strong> to delete its preferences as well.
        </li>
      </ol>
      <p>
        Once the device is removed, no more notifications are sent to it. The relay keeps nothing, so there is nothing
        to delete there.
      </p>

      <h2>Desktop app</h2>
      <p>AlmaStudio keeps its projects, tabs, settings, terminal history and pairing keys in one data folder:</p>
      <ul>
        <li>
          macOS: <code>~/Library/Application Support/net.almaware.almastudio</code>
        </li>
        <li>
          Windows: <code>%APPDATA%\net.almaware.almastudio</code>
        </li>
        <li>
          Linux: <code>~/.local/share/net.almaware.almastudio</code>
        </li>
      </ul>
      <p>
        Quit AlmaStudio and delete that folder to remove all of it. A project’s instructions for the agent are also
        written to a <code>.almastudio</code> folder inside the project; delete it there if you no longer want it.
        Then uninstall the app as usual.
      </p>

      <h2>Anything else</h2>
      <p>
        We do not hold personal data about you beyond short-lived server access logs (see the{' '}
        <Link href="/privacy/">privacy policy</Link>). To ask about them, or for any other request, write to{' '}
        <a href={`mailto:${site.email}?subject=Data%20request`}>{site.email}</a>. We answer within 30 days.
      </p>
    </Legal>
  )
}
