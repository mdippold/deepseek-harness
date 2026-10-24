import type { ReactNode } from 'react'
import { Tag, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import css from './PrivacyBadge.module.css'
import type { NS } from './locales.ts'

/** Props of the root overlay privacy badge. */
export type PrivacyBadgeProps = PropsRuntime<'shell.overlay'> & PropsLocale<typeof NS>

/**
 * Show a persistent local-only badge whose tooltip lists what the build disables.
 * @param props - localized copy.
 * @returns the badge pinned to the frame's bottom-right corner.
 */
export function PrivacyBadge({ t }: PrivacyBadgeProps): ReactNode {
  return (
    <div className={css.seat} data-testid="privacy-notice-badge">
      <Tooltip label={t('badge.detail')} side="top" align="end" maxWidth={320} openOnClick>
        <span className={css.anchor} tabIndex={0}>
          <Tag tone="success">{t('badge.label')}</Tag>
        </span>
      </Tooltip>
    </div>
  )
}
