/**
 * Surge HTTP 脚本：拦截抖音收藏请求，把 aweme_id 转发到暂存服务
 *
 * 触发：http-request（原请求不修改，转发是旁路上报）
 * 只在「收藏」(action=1) 时转发；取消收藏 (action=0) 不转发。
 *
 * 参数（在 Surge 模块详情页里填，不写进仓库）：
 *   endpoint  暂存服务地址（含 /collect），例如 https://xxx.com/collect
 *   token     身份口令，需与服务器白名单一致
 */

const req = $request

// 解析 body（收藏接口是 application/x-www-form-urlencoded）
const rawBody = req.body || ''
const params = {}
for (const pair of rawBody.split('&')) {
  if (!pair) continue
  const idx = pair.indexOf('=')
  const key = idx === -1 ? pair : pair.slice(0, idx)
  const val = idx === -1 ? '' : pair.slice(idx + 1)
  params[decodeURIComponent(key)] = decodeURIComponent(val)
}

const action = Number(params.action)
const awemeId = params.aweme_id

// 读取模块参数（在 Surge 里填的 endpoint / token）
const args = Object.fromEntries(new URLSearchParams($argument || ''))
const ENDPOINT = (args.endpoint || '').trim()
const TOKEN = (args.token || '').trim()

// 只在收藏时转发；其它情况原样放行
if (action !== 1 || !awemeId || !ENDPOINT) {
  $done({})
} else {
  $httpClient.post(
    {
      url: ENDPOINT,
      headers: { 'Content-Type': 'application/json', 'X-Collect-Token': TOKEN },
      body: JSON.stringify({
        aweme_id: awemeId,
        action,
        aweme_type: Number(params.aweme_type ?? 0),
      }),
    },
    (err, resp, data) => {
      if (err) {
        $notification.post('抖音收藏·转发失败', `aweme_id: ${awemeId}`, String(err))
      } else {
        $notification.post('抖音收藏·已上报', `aweme_id: ${awemeId}`, data || `HTTP ${resp && resp.status}`)
      }
      // 在回调里放行：确保上报完成（代价是收藏按钮会多等一下下）
      $done({})
    }
  )
}
