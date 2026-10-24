/** Browser plugin showing the local-only privacy badge in the frame-wide overlay. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { PrivacyBadge } from './PrivacyBadge.tsx'
import { de, en, es, fr, ja, NS, pt, ru, zh, type PrivacyNoticeKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'privacy-notice': PrivacyNoticeKey
  }
}

/** Required services: the slot registry and locale dictionaries. */
export const inject = ['slots', 'locale']

/**
 * Register the privacy dictionaries and the overlay badge.
 * @param ctx - browser context carrying slots and locale services.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en, ja, es, fr, de, ru, pt }), 'privacy-notice: browser dictionaries')
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'privacy-notice.badge',
    locale: NS,
  }, PrivacyBadge))
}
