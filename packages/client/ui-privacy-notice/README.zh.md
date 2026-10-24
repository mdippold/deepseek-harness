---
description: "仅本地隐私构建提示：启动时在终端检查数据外发条目均已禁用，并在 Web 客户端显示常驻徽标。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-privacy-notice

[English](README.md) | 中文

## 概述

本包仅用于本 fork，用来标记仅本地的隐私构建。加载时，其 Host 部分检查每个已配置的 Loader 条目均存在且已禁用，随后向 stderr 打印带边框的横幅：检查通过时为绿色，未通过时为红色并列出每个未通过的条目。其浏览器部分在 Web 客户端右下角显示“仅本地构建”徽标，提示框列出此构建禁用的内容。本包不影响模型请求。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

`dsh-web-app` bundle 的 `privacy.patch.yml` 挂载本插件，并列出两个 `privacy.patch.yml` 文件所禁用的条目：

```yaml
- insert:
    - id: ui-privacy-notice
      name: '@deepseek-ai/dsh-client-ui-privacy-notice'
      config:
        disabledRows: [session-log-deepseek, session-telemetry-otel]
```

| 字段 | 默认值 | 含义 |
|---|---|---|
| `disabledRows` | 必填 | 必须存在且已禁用的 Loader 条目 id |

只要树中任一同 id 条目处于启用状态，或没有任何条目使用该 id，该条目即判定为未通过。缺失 id 也判定为未通过，以免上游重命名被忽略；上游版本重命名条目时请更新此列表。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节 — 点击展开</summary>

Host 部分读取包含嵌套 include 子树的 `ctx.loader.entries()`，并在加载时对每个条目的实际 `disabled` 状态求值一次。仅当 stderr 为 TTY 时使用 ANSI 颜色。浏览器部分注册一个 `shell.overlay` 条目 `privacy-notice.badge`，内容为 `success` Tag 与 Tooltip；overlay 层不拦截点击，徽标自行恢复指针事件。

</details>

-----

<a id="model-experience"></a>
## 模型体验

无，因为本包只打印终端横幅并渲染浏览器呈现；不会进入模型请求。

#### KV Cache 影响

无；本包既不组装也不发送提供方请求。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>


- **加载时检查** — 终端横幅反映加载时的组合；之后的实时配置修改在重启前不会重新检查。
- **静态徽标** — 浏览器徽标说明构建用途，不反映 Host 检查结果；终端横幅才是经过验证的信号。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作背景 — 点击展开</summary>

无。

</details>
