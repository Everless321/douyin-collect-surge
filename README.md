# 抖音收藏转发 (Surge Module)

点击抖音「收藏」按钮时，拦截请求并把 `aweme_id` 转发到你的暂存服务（供 dym 消费）。
**原请求不修改**，转发是旁路上报。只在收藏 (`action=1`) 时转发，取消收藏不转发。

## 安装

Surge → 模块 → 从 URL 安装：

```
https://raw.githubusercontent.com/Everless321/douyin-collect-surge/main/douyin-collect.sgmodule
```

## 填参数（重要）

安装后进入 **模块详情页 → 参数(Arguments)**，填两项：

- `endpoint`：你的暂存服务地址，含 `/collect`，例如 `https://your-server.com/collect`
- `token`：身份口令，需与服务器白名单一致

token / 地址只存在你本地 Surge，不进这个公开仓库。

## 前置

- 为 `*.douyin.com` 开启 MITM，并安装+信任 Surge CA 证书。
- App 端可能有 SSL Pinning，建议用网页版 douyin.com。

## 转发格式

```
POST <endpoint>
X-Collect-Token: <token>
Content-Type: application/json

{ "aweme_id": "765...", "action": 1, "aweme_type": 0 }
```
