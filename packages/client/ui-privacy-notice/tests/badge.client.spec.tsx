// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { apply, inject } from '../src/client/index.ts'
import { PrivacyBadge } from '../src/client/PrivacyBadge.tsx'

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const slots = ctx.get('slots') as SlotRegistry
  slots.register({ name: 'root', children: { 'shell.overlay': { kind: 'list', scope: 'root' } } } as never, () => null)
  ctx.provide('locale', new LocaleRuntime(ctx))
  return { ctx, slots }
}

describe('privacy notice browser plugin', () => {
  it('declares only the services it uses', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('registers one overlay badge and removes it on disposal', async () => {
    const { ctx, slots } = await bench()
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const [entry, ...rest] = slots.entries('shell.overlay')
    expect(rest).toHaveLength(0)
    expect(entry?.component).toBe(PrivacyBadge)
    expect(entry?.options).toMatchObject({ id: 'privacy-notice.badge' })
    await fiber.dispose()
    expect(slots.entries('shell.overlay')).toHaveLength(0)
  })
})
