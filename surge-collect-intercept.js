/**
 * Surge HTTP 脚本：拦截抖音收藏请求，把 aweme_id 转发到暂存服务。
 *
 * 触发：http-request（原请求不修改，转发是旁路上报）。
 * 只在「收藏」(action=1) 时转发；取消收藏 (action=0) 不转发。
 *
 * endpoint / token 由模块的 argument 传入（在 Surge 模块参数里填）。
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

// 读取模块参数
const args = Object.fromEntries(new URLSearchParams($argument || ''))
const ENDPOINT = (args.endpoint || '').trim()
const TOKEN = (args.token || '').trim()

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
      $done({})
    }
  )
}
