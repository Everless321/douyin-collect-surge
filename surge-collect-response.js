/**
 * Surge HTTP 脚本：拦截抖音收藏接口的「响应」，可打印 + 伪造
 *
 * 触发事件：http-response（请求已发出、服务器已返回，在交给 App 前拦截）
 *
 * FORGE 开关：
 *   false → 只打印真实响应，不修改（先用这个看清楚响应结构）
 *   true  → 把响应强制改成「成功」(status_code=0)
 */

const FORGE = true

// 从请求 body 里解析 action / aweme_id（response 脚本里 $request 仍可用）
const reqBody = ($request && $request.body) || ''
const reqParams = {}
for (const pair of reqBody.split('&')) {
  if (!pair) continue
  const idx = pair.indexOf('=')
  reqParams[decodeURIComponent(idx === -1 ? pair : pair.slice(0, idx))] =
    idx === -1 ? '' : decodeURIComponent(pair.slice(idx + 1))
}
const actionText = { 0: '取消收藏', 1: '收藏' }[reqParams.action] ?? `未知(${reqParams.action})`

const rawResp = ($response && $response.body) || ''
let obj = {}
try {
  obj = JSON.parse(rawResp)
} catch (e) {
  obj = {}
}

console.log(
  [
    '===== 抖音收藏「响应」拦截 =====',
    `action:     ${reqParams.action} → ${actionText}`,
    `aweme_id:   ${reqParams.aweme_id}`,
    `status_code(真实): ${obj.status_code}`,
    `status_msg (真实): ${obj.status_msg ?? ''}`,
    `raw response: ${rawResp}`,
  ].join('\n')
)

if (!FORGE) {
  // 原样放行
  $notification.post(`抖音${actionText}·真实响应`, `status_code=${obj.status_code}`, rawResp.slice(0, 120))
  $done({})
} else {
  // 伪造：强制成功，保留原结构其余字段
  obj.status_code = 0
  obj.status_msg = ''
  const forged = JSON.stringify(obj)

  $notification.post(`抖音${actionText}·已伪造成功`, `aweme_id: ${reqParams.aweme_id}`, forged.slice(0, 120))
  $done({ body: forged })
}
