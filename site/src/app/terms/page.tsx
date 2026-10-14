import type { Metadata } from 'next'
import Link from 'next/link'
import { Legal } from '@/components/Legal'
import { site } from '@/config'

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'Terms of use of AlmaStudio and the AlmaStudio Companion App.',
}

export default function Terms() {
  return (
    <Legal title="Terms of use">
      <p>
        These terms apply to the AlmaStudio desktop application, the AlmaStudio Companion App and the AlmaStudio
        relay, published by {site.company} ({site.studio}). By using them you accept these terms.
      </p>

      <h2>License</h2>
      <p>
        AlmaStudio and the companion app are open source under the <a href={site.license}>MIT license</a>. You may
        use, copy, modify and distribute them under its conditions. Apps downloaded from the App Store or Google Play
        are also subject to those stores’ terms.
      </p>

      <h2>Your computer, your responsibility</h2>
      <p>
        The companion app controls terminals and AI agents on your computer: what you type is run there, with your
        permissions. Pair only devices you own, keep them locked, and remove a device you lose (see{' '}
        <Link href="/delete-data/">Delete your data</Link>). AI agents can change or delete files and run commands;
        review what they do and keep backups.
      </p>

      <h2>Third-party software</h2>
      <p>
        Claude Code, Codex, OpenCode and the other programs you run in AlmaStudio are not ours. Their use is governed
        by their own terms, and any account or subscription they need is between you and their provider.
      </p>

      <h2>The relay</h2>
      <p>
        The relay that makes your computer reachable from anywhere is offered free, as is, and may change, be limited
        or stop. Do not use it to attack, overload or misuse it.
      </p>

      <h2>No warranty</h2>
      <p>
        The software is provided “as is”, without warranty of any kind, as stated in the MIT license. To the extent
        allowed by law, {site.company} is not liable for any damage arising from its use. Nothing here limits rights
        you have as a consumer under the law of your country.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms; the date at the top says when. Questions:{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>. These terms are governed by Italian law.
      </p>
    </Legal>
  )
}
