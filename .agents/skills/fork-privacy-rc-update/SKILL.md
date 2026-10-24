---
name: fork-privacy-rc-update
description: Use when moving this local-only privacy fork onto a new upstream DeepSeek Harness release or RC tag, when an upstream change touches a privacy-disabled row, or when the dsh web startup banner reports PRIVACY BUILD CHECK FAILED. Covers the privacy layer's files, the rebase procedure, the audit for new data egress, and the checks that prove the layer still holds.
---

# Fork privacy layer: RC updates

This fork runs the latest upstream RC with every data-egress path and the built-in DeepSeek provider disabled, for use with local models only. The privacy changes are a small set of commits on top of an upstream tag, kept out of upstream-owned lines so each rebase stays mechanical.

## What the layer consists of

| File | Role |
|---|---|
| `packages/bundle/base/privacy.patch.yml` | Disables session-log upload, OTel session telemetry, `/feedback`, plugin inventory, DeepSeek request extensions, the `deepseek-official` provider, account sign-in, and DeepSeek search and fetch |
| `packages/bundle/web-app/privacy.patch.yml` | Disables Desktop product analytics, message feedback UI, account UI, and the DeepSeek search switch; mounts `ui-privacy-notice` with the `disabledRows` list |
| `packages/bundle/sdk-minimal/privacy.patch.yml` | Same request-field and provider rows for the standalone SDK bundle |
| `packages/client/ui-privacy-notice/` | Startup banner that checks `disabledRows` against the composed Loader tree, and the "Local-only build" Web badge |
| `scripts/product-package-policy.ts` | The block after the `Local-only privacy fork` comment classifies the disabled packages as `optional` |

Each `privacy.patch.yml` is registered last in its bundle's `package.json` `dsh.bundle.patch` and `files` lists. Two bundle tests (`packages/bundle/base/tests/base.spec.ts`, `packages/bundle/sdk-minimal/tests/sdk-minimal.spec.ts`) expect that two-file patch list.

Rules:

- Never disable or edit an upstream row inside its upstream `cordis.patch.yml`; add an id-targeted `disabled: true` patch to the matching `privacy.patch.yml`.
- Every row disabled in a `privacy.patch.yml` is also listed in `disabledRows` in `packages/bundle/web-app/privacy.patch.yml`, and its package directory is in the policy block.
- A banner line `<id> (not in composition)` means upstream renamed or removed that row. Find the replacement id in `docs/upgrade-guide/<version>/` and the bundle diff; do not just delete the id from the list.

Not covered by the layer, by design: requests to the model endpoint you configure, `web_fetch` calls the agent makes, plugin-market browsing (`registry.npmmirror.com`, `raw.githubusercontent.com`), the Desktop app's auto-updater (`download.deepseek.com`), and opt-in experimental plugins such as voice input model downloads.

## Move to a new tag

1. Fetch upstream once per update:
   ```sh
   git remote get-url upstream || git remote add upstream https://github.com/deepseek-ai/deepseek-harness.git
   git fetch upstream --tags
   TAG=$(git tag -l 'dsh-v*-rc.*' --sort=-v:refname | head -1)
   OLD=$(git describe --tags --abbrev=0 HEAD)
   ```
2. Rebase only the privacy commits onto the tag:
   ```sh
   git rebase --onto "$TAG" "$(git merge-base HEAD upstream/master)" privacy/local-only
   ```
   Expected conflicts are list edits: bundle `package.json` patch/file lists, root `tsconfig.*.json` registrations, the policy block, and the `AGENTS.md` tail. Keep both sides. For `pnpm-lock.yaml`, take the upstream side and regenerate it with `pnpm install`.
3. Rebuild: `pnpm install && pnpm run build:artifacts`.

## Audit the new tag for egress

Do every step; upstream adds telemetry and DeepSeek-service rows between RCs.

1. Bundle composition changes: `git diff "$OLD" "$TAG" -- 'packages/bundle/*/cordis.patch.yml' 'packages/bundle/*/presets/*.yml'`. Inspect each inserted or renamed row.
2. New packages whose names suggest egress:
   ```sh
   git diff --name-only --diff-filter=A "$OLD" "$TAG" -- 'packages/*/*/package.json' | grep -iE 'telemetry|analytics|otel|upload|feedback|collector|session-log|report|deepseek|account'
   ```
3. New hardcoded external hosts in source:
   ```sh
   hosts() { git grep -hoE 'https?://[a-zA-Z0-9.-]+\.[a-z]{2,}' "$1" -- 'packages/*/*/src' 'apps/*/src' | sort -u; }
   comm -13 <(hosts "$OLD") <(hosts "$TAG") | grep -vE 'example|\.test|\.invalid|localhost'
   ```
4. New contributors to official DeepSeek requests, which carry data to the same host as the model API and cannot be blocked by a firewall: `git grep -l deepseekLlmApiExtensions "$TAG" -- 'packages/*/*/src'`.
5. New environment switches for endpoints: `git grep -hoE 'DSH_[A-Z_]*(URL|ENDPOINT|OTLP|TELEMETRY|ANALYTICS|UPLOAD)[A-Z_]*' "$TAG" -- packages apps | sort -u`.
6. Read `docs/upgrade-guide/` entries newer than `$OLD` for renamed rows.

For each new egress row: add `disabled: true` to the matching `privacy.patch.yml`, add the id to `disabledRows`, and add the package directory to the policy block. If a new client surface depends on a disabled service, disable its row too.

## Prove the layer still holds

```sh
npx vitest run packages/client/ui-privacy-notice packages/bundle/base packages/bundle/web-app packages/bundle/sdk-minimal packages/util/official-bundles
pnpm run verify-product-use && pnpm run constraints && pnpm run verify-package-dependencies
pnpm run build:check
pnpm dsh web --no-open
```

The last command must print the green banner with `Verified N of N privacy entries disabled.` before the `dsh web:` URL. A red banner is a failed update; fix it before using the build. `pnpm run test:snapshot` replays sessions recorded against the DeepSeek provider and is expected to fail on this fork.

Commit the resolved layer, then push with `git push --force-with-lease origin privacy/local-only`.
