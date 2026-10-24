/** Locale namespace owned by the privacy notice. */
export const NS = 'privacy-notice'

/** English privacy notice strings. */
export const en = {
  'badge.label': 'Local-only build',
  'badge.detail': 'Session-log upload, telemetry, analytics, feedback, and the built-in DeepSeek provider are disabled in this build.',
} as const

/** Message keys of the privacy notice namespace. */
export type PrivacyNoticeKey = keyof typeof en

/** Simplified-Chinese privacy notice strings. */
export const zh: Record<PrivacyNoticeKey, string> = {
  'badge.label': '仅本地构建',
  'badge.detail': '此构建已禁用会话日志上传、遥测、使用分析、反馈以及内置 DeepSeek 提供方。',
}

/** Japanese privacy notice strings. */
export const ja: Record<PrivacyNoticeKey, string> = {
  'badge.label': 'ローカル専用ビルド',
  'badge.detail': 'このビルドでは、セッションログのアップロード、テレメトリー、分析、フィードバック、組み込みの DeepSeek プロバイダーが無効です。',
}

/** Spanish privacy notice strings. */
export const es: Record<PrivacyNoticeKey, string> = {
  'badge.label': 'Compilación solo local',
  'badge.detail': 'En esta compilación están desactivados la carga del registro de sesión, la telemetría, la analítica, los comentarios y el proveedor integrado de DeepSeek.',
}

/** French privacy notice strings. */
export const fr: Record<PrivacyNoticeKey, string> = {
  'badge.label': 'Version locale uniquement',
  'badge.detail': 'Cette version désactive l’envoi du journal de session, la télémétrie, l’analytique, les retours et le fournisseur DeepSeek intégré.',
}

/** German privacy notice strings. */
export const de: Record<PrivacyNoticeKey, string> = {
  'badge.label': 'Nur-lokaler Build',
  'badge.detail': 'In diesem Build sind Sitzungsprotokoll-Upload, Telemetrie, Analysen, Feedback und der integrierte DeepSeek-Anbieter deaktiviert.',
}

/** Russian privacy notice strings. */
export const ru: Record<PrivacyNoticeKey, string> = {
  'badge.label': 'Только локальная сборка',
  'badge.detail': 'В этой сборке отключены загрузка журнала сеанса, телеметрия, аналитика, отзывы и встроенный провайдер DeepSeek.',
}

/** Portuguese privacy notice strings. */
export const pt: Record<PrivacyNoticeKey, string> = {
  'badge.label': 'Build somente local',
  'badge.detail': 'Esta build desativa o envio do registro de sessão, a telemetria, a análise, o feedback e o provedor DeepSeek integrado.',
}
