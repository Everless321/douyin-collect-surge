/**
 * Surge HTTP 脚本：拦截抖音收藏接口的「响应」，可打印 + 伪造
 *
 * 触发事件：http-response
 * 注意：response 阶段读不到 $request.body，所以拿不到 action/aweme_id，
 *       但能拿到响应里真正的状态字段 collects_flag。
 *
 * 真实响应结构：
 *   { "collects_flag": false/true, "status_code": 0, "extra": {...} }
 *   - status_code: 0 = 请求成功
 *   - collects_flag: 该视频当前是否「已收藏」（true=已收藏，false=未收藏）
 *
 * FORGE 开关：
 *   false → 只打印真实响应，不修改
 *   true  → 把 collects_flag 强制改成 FORGE_FLAG
 */

const FORGE = true
const FORGE_FLAG = true // 想伪造成「已收藏」=true；「未收藏」=false

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
    `status_code(真实):    ${obj.status_code}`,
    `collects_flag(真实):  ${obj.collects_flag}`,
    `raw response: ${rawResp}`,
  ].join('\n')
)

if (!FORGE) {
  $notification.post('抖音收藏·真实响应', `collects_flag=${obj.collects_flag}`, rawResp.slice(0, 140))
  $done({})
} else {
  obj.status_code = 0
  obj.collects_flag = FORGE_FLAG
  const forged = JSON.stringify(obj)

  $notification.post('抖音收藏·已伪造', `collects_flag → ${FORGE_FLAG}`, forged.slice(0, 140))
  $done({ body: forged })
}
