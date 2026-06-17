# 抖音收藏接口拦截 (Surge Module)

点击抖音「收藏 / 取消收藏」按钮时，拦截并打印实际发出的请求参数，用来验证收藏接口的约定：

- `action=1` → 收藏
- `action=0` → 取消收藏

**只读日志，不修改请求。**

## 安装

Surge → 模块 → 从 URL 安装，粘贴：

```
https://raw.githubusercontent.com/Everless321/douyin-collect-surge/main/douyin-collect.sgmodule
```

## 使用

1. 安装模块后，确保已为 `*.douyin.com` 启用 MITM，并安装+信任 Surge CA 证书。
2. 打开抖音（**建议先用网页版 douyin.com**，App 端可能有 SSL Pinning 抓不到）。
3. 点一个视频的收藏按钮。
4. 查看：
   - Surge **事件 / 脚本控制台**：`===== 抖音收藏接口拦截 =====`，含 `action`、`aweme_id`、原始 body；
   - 顶部通知：`抖音收藏` / `抖音取消收藏`。

## 接口

```
POST https://*.douyin.com/aweme/v1/web/aweme/collect/
Content-Type: application/x-www-form-urlencoded

action=1&aweme_id=<视频id>&aweme_type=0
```

## 说明

- `requires-body=1` 必须开启，否则取不到请求 body。
- pattern 用 `.*\.douyin\.com` 兜住 `www`、`www-hj` 等子域。如实测走其它域，放宽 `[MITM] hostname` 与 pattern 即可。
