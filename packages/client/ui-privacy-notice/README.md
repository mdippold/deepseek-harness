---
description: "Local-only privacy build notice: a startup terminal check that data-egress rows are disabled, and a persistent Web client badge."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-privacy-notice

English | [中文](README.zh.md)

## Summary

This fork-only package marks a local-only privacy build. At load, its Host half checks that every configured Loader entry is present and disabled, then prints a boxed banner to stderr: green when the check passes, red with each failing row when it does not. Its browser half shows a "Local-only build" badge in the bottom-right corner of the Web client; its tooltip lists what the build disables. It does not affect model requests.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

The `dsh-web-app` bundle's `privacy.patch.yml` mounts this plugin and lists the rows that both `privacy.patch.yml` files disable:

```yaml
- insert:
    - id: ui-privacy-notice
      name: '@deepseek-ai/dsh-client-ui-privacy-notice'
      config:
        disabledRows: [session-log-deepseek, session-telemetry-otel]
```

| Field | Default | Meaning |
|---|---|---|
| `disabledRows` | required | Loader entry ids that must be present and disabled |

A row fails when any entry with its id is enabled anywhere in the tree, or when no entry has its id. A missing id fails so that an upstream rename cannot pass unnoticed; update the list when an upstream release renames a row.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The Host half reads `ctx.loader.entries()`, which includes nested include subtrees, and evaluates each entry's effective `disabled` state once, at load. ANSI color applies only when stderr is a TTY. The browser half registers one `shell.overlay` entry, `privacy-notice.badge`, with a `success` Tag and a Tooltip; the overlay layer is click-through, and the badge opts back into pointer events.

</details>

-----

<a id="model-experience"></a>
## Model Experience

None, as the package prints a terminal banner and renders browser presentation; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>


- **Load-time check** — the terminal banner reflects the composition at load; a later live configuration edit is not rechecked until restart.
- **Static badge** — the browser badge states the build's purpose and does not reflect the Host check result; the terminal banner is the verified signal.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
