# 抖音收藏转发 (Surge Module)

点击抖音「收藏」按钮时，拦截请求并把视频 `aweme_id` 转发到你自己的暂存服务，
之后可由下载器（如 dym）拉取消费。

- **原请求不修改**，转发是旁路上报，不影响抖音本身。
- 只在收藏 (`action=1`) 时转发，取消收藏 (`action=0`) 不转发。
- `endpoint` / `token` 只存在你本地 Surge，不进这个公开仓库。

## 前置条件

- Surge 已为 `*.douyin.com` 开启 MITM，并安装+信任 Surge CA 证书。
- App 端可能有 SSL Pinning，建议用网页版 douyin.com 触发收藏。
- 你有一个可接收上报的后端（见下方「后端契约」），自建即可。

---

## 用法一：自建后端，一键安装（推荐）

如果你的后端是 [collect-worker](#后端契约) 那种实现，它会自带一个
`GET /surge?token=xxx` 接口，动态生成 token/endpoint 已内置的模块。
直接从你自己的服务器安装，无需手动填参数：

```
https://<你的服务器>/surge?token=<你的token>
```

## 用法二：通用模块 + 手动填参数

从本仓库安装通用模块：

```
https://raw.githubusercontent.com/Everless321/douyin-collect-surge/main/douyin-collect.sgmodule
```

安装后进入 **模块详情页 → 参数(Arguments)**，填两项：

| 参数 | 说明 |
|---|---|
| `endpoint` | 你的暂存服务地址，含 `/collect`，如 `https://your-server.com/collect` |
| `token` | 身份口令，需与后端白名单一致 |

---

## 后端契约

转发脚本会发出这样的请求，任何兼容此契约的后端都能接：

```
POST <endpoint>
X-Collect-Token: <token>
Content-Type: application/json

{ "aweme_id": "765...", "action": 1, "aweme_type": 0 }
```

后端应校验 `X-Collect-Token`，把 `aweme_id` 按 token 分队列暂存，
并提供拉取接口供下载器消费。一个参考实现（Rust/axum，含 `/surge` 自动生成模块）
见 collect-worker。

## 文件说明

| 文件 | 作用 |
|---|---|
| `douyin-collect.sgmodule` | 通用 Surge 模块（用法二），用 `#!arguments` 让你填自己的 endpoint/token |
| `surge-collect-intercept.js` | 转发脚本，读取模块参数后上报 |
