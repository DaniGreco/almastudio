import { site } from '@/config'

export const dynamic = 'force-static'

// https://llmstxt.org: a plain summary of the site for language models.
export function GET() {
  const appStore = site.appStore
    ? `- [App Store](${site.appStore}): the companion app for iPhone and iPad`
    : '- App Store: the iPhone and iPad version is coming soon'
  const text = `# ${site.name}

> ${site.name} is a free, open-source (MIT) desktop workspace for AI coding agents on macOS, Windows and Linux. It runs Claude Code, Codex, OpenCode and plain shells side by side in real terminals, organised by project, with git, files and diffs one click away. The AlmaStudio Companion App for iPhone, iPad and Android lets you watch and drive those agents from your phone, end-to-end encrypted.

Everything runs on the user's own computer. There is no account, no analytics and no ads. The companion app connects directly on the local network, or through the AlmaStudio relay, which only forwards encrypted data it cannot read. ${site.name} is made by ${site.studio} (${site.company}).

## Desktop app

- [Home page](${site.url}/): features of the desktop app — projects, agent tabs, git, review, restore
- [Download](${site.releases}): signed builds for macOS (Apple silicon and Intel), Windows and Linux, with automatic updates
- [Source code](${site.github}): the whole app, under the [MIT license](${site.license})

## Companion app

- [Companion app](${site.url}/companion/): what the app does and how pairing works
- [Google Play](${site.googlePlay}): the companion app for Android
${appStore}

## Help and policies

- [Support](${site.url}/support/): common questions and how to get help
- [Issues](${site.issues}): bug reports and feature requests
- [Privacy policy](${site.url}/privacy/): what the apps do with your data
- [Delete your data](${site.url}/delete-data/): how to remove the companion app's data
- [Terms of use](${site.url}/terms/)
- Contact: ${site.email}
`
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
