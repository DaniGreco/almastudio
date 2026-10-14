/** A drawn phone (an illustration, not a screenshot) with a terminal and a notification. */
export function Phone() {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-notice">
        <img src="/icon.png" alt="" width={22} height={22} />
        <div>
          <strong>Codex is waiting for you</strong>
          <span>web · Ready to run the migration?</span>
        </div>
      </div>
      <div className="phone-term">
        <p>
          <b>$</b> codex
        </p>
        <p className="dim">› Updated 4 files, 2 tests added</p>
        <p className="dim">› All 128 tests pass</p>
        <p>
          Run the migration on staging now? <b>(y/n)</b>
        </p>
        <p className="cursor">y</p>
      </div>
      <div className="phone-keys">
        <span>esc</span>
        <span>ctrl</span>
        <span>tab</span>
        <span>↑</span>
        <span>↓</span>
      </div>
    </div>
  )
}
