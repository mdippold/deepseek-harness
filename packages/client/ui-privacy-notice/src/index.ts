/**
 * Local-only privacy notice, node half. At load it checks that every
 * configured Loader entry is disabled and prints a terminal banner stating
 * the result; the browser half ships through `exports["./client"]`.
 * @module @deepseek-ai/dsh-client-ui-privacy-notice
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import z from '@deepseek-ai/schemastery'

export const name = 'privacy-notice'

/** Required service: the Loader whose entries are checked. */
export const inject = ['loader']

/** Plugin config: the top-level Loader entry ids that must be disabled. */
export interface Config {
  /** Entry ids that send data off the machine; each must be present and disabled. */
  disabledRows: string[]
}

export const Config: z<Config> = z.object({
  disabledRows: z.array(z.string()).required(),
})

/** One configured entry that is not in the required disabled state. */
export interface PrivacyRowViolation {
  readonly id: string
  readonly reason: 'enabled' | 'missing'
}

/** The Loader entry fields the check reads. */
export interface CheckedEntry {
  readonly options: { readonly id?: string | undefined }
  readonly disabled: boolean
}

/**
 * Check each configured id against every entry in the composed Loader tree,
 * including nested include subtrees. An id fails when any matching entry is
 * enabled, or when no entry matches, so a renamed upstream row cannot pass
 * unnoticed.
 * @param entries - every Loader entry, as yielded by `EntryTree.entries()`.
 * @param ids - entry ids that must be disabled.
 * @returns violations in configuration order; empty when every entry is disabled.
 */
export function findPrivacyViolations(entries: Iterable<CheckedEntry>, ids: readonly string[]): PrivacyRowViolation[] {
  const enabledById = new Map<string, boolean>()
  for (const entry of entries) {
    const id = entry.options.id
    if (id !== undefined) enabledById.set(id, (enabledById.get(id) ?? false) || !entry.disabled)
  }
  const violations: PrivacyRowViolation[] = []
  for (const id of ids) {
    const enabled = enabledById.get(id)
    if (enabled === undefined) violations.push({ id, reason: 'missing' })
    else if (enabled) violations.push({ id, reason: 'enabled' })
  }
  return violations
}

const WIDTH = 64

function boxed(lines: readonly string[]): string {
  const rule = '═'.repeat(WIDTH + 2)
  const body = lines.map(line => `║ ${line.padEnd(WIDTH)} ║`)
  return [`╔${rule}╗`, ...body, `╚${rule}╝`].join('\n')
}

/**
 * Render the terminal banner for a check result.
 * @param violations - result of {@link findPrivacyViolations}.
 * @param checked - number of entries checked.
 * @param color - whether to wrap the banner in ANSI color.
 * @returns the banner text, ending in a newline.
 */
export function renderPrivacyBanner(violations: readonly PrivacyRowViolation[], checked: number, color: boolean): string {
  const ok = violations.length === 0
  const lines = ok
    ? [
      'LOCAL-ONLY PRIVACY BUILD',
      '',
      'Disabled: session-log upload, OTel telemetry, product analytics,',
      'feedback, and built-in DeepSeek provider, account, and search.',
      `Verified ${checked} of ${checked} privacy entries disabled.`,
    ]
    : [
      'WARNING: PRIVACY BUILD CHECK FAILED',
      '',
      'These entries can send data off this machine:',
      ...violations.map(v => `  ${v.id} (${v.reason === 'enabled' ? 'enabled' : 'not in composition'})`),
      'Check $DSH_HOME patches and --patch overlays before',
      'using this run.',
    ]
  const text = `\n${boxed(lines)}\n\n`
  if (!color) return text
  return ok ? `\u001B[1;32m${text}\u001B[0m` : `\u001B[1;41;97m${text}\u001B[0m`
}

/**
 * Check the configured entries and print the banner to stderr.
 * @param ctx - Host context carrying the Loader.
 * @param config - entry ids that must be disabled.
 */
export function apply(ctx: Context, config: Config): void {
  const violations = findPrivacyViolations(ctx.loader.entries(), config.disabledRows)
  process.stderr.write(renderPrivacyBanner(violations, config.disabledRows.length, process.stderr.isTTY === true))
}
