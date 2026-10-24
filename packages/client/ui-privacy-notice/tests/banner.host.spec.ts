import { describe, expect, it } from 'vitest'
import { findPrivacyViolations, renderPrivacyBanner } from '../src/index.ts'

describe('privacy notice terminal check', () => {
  it('reports an id enabled in any subtree, and a missing id, in configuration order', () => {
    const entries = [
      { options: { id: 'a' }, disabled: true },
      { options: { id: 'b' }, disabled: true },
      { options: { id: 'b' }, disabled: false },
      { options: {}, disabled: false },
    ]
    expect(findPrivacyViolations(entries, ['a', 'b', 'c'])).toEqual([
      { id: 'b', reason: 'enabled' },
      { id: 'c', reason: 'missing' },
    ])
    expect(findPrivacyViolations(entries, ['a'])).toEqual([])
  })

  it('prints a verified banner when every entry is disabled', () => {
    const text = renderPrivacyBanner([], 3, false)
    expect(text).toContain('LOCAL-ONLY PRIVACY BUILD')
    expect(text).toContain('Verified 3 of 3 privacy entries disabled.')
    expect(text).not.toContain('\u001B[')
  })

  it('names each violation in a red warning banner', () => {
    const text = renderPrivacyBanner([{ id: 'session-log-deepseek', reason: 'enabled' }, { id: 'gone', reason: 'missing' }], 2, true)
    expect(text.startsWith('\u001B[1;41;97m')).toBe(true)
    expect(text).toContain('WARNING: PRIVACY BUILD CHECK FAILED')
    expect(text).toContain('session-log-deepseek (enabled)')
    expect(text).toContain('gone (not in composition)')
  })
})
