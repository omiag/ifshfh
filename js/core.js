/**
 * =============================================================================
 * 【核心层 core.js】全站唯一基础设施：全局状态、本地存储、HTTP、轻提示、弹窗、接口运行日志。
 * 向 window 挂载 WechatConsoleCore，供各业务 IIFE 读取。请勿在业务脚本中重复实现请求封装。
 * =============================================================================
 */

// --- API 根地址（与官方接口文档一致；业务模块只传 path）---
const BASE_URL = 'http://api.wechatapi.net/finder/v2/api'
const STORAGE_KEY = 'wechat_api_console_v1'
/** 联系人列表 + getDetailInfo 结果，供刷新后恢复、消息页反查昵称 */
const CONTACTS_CACHE_STORAGE_KEY = 'wechat_api_contacts_cache_v1'
/** 与 login-module 一致：登录卡片快照 */
const LOGIN_SNAPSHOT_STORAGE_KEY = 'wechat_console_login_snapshot_v1'
/** 与 webhook-module 一致：接收推送地址备忘 */
const WEBHOOK_RECV_URL_STORAGE_KEY = 'wechat_console_webhook_recv_url_v1'
const TOKEN_INVALID_PATTERNS = ['不可用', '已过期']

// --- 顶栏「清理缓存」：退出接口重试策略 ---
const LOGOUT_RETRY_MAX = 3
const LOGOUT_RETRY_DELAY_MS = 800

// --- 通讯录展示用：wxid 归一化比较（全角 @ 等）---
function normalizeWxidForMatch(id) {
  return String(id || '')
    .trim()
    .replace(/\uFF20/g, '@')
    .toLowerCase()
}

/** 从联系人详情行取展示名：备注 > 昵称 > userName */
function pickDetailDisplayName(row, idFallback) {
  if (row && typeof row === 'object') {
    const remark = row.remark != null ? String(row.remark).trim() : ''
    if (remark) return remark
    const nick = row.nickName != null ? String(row.nickName).trim() : ''
    if (nick) return nick
    const un = row.userName != null ? String(row.userName).trim() : ''
    if (un) return un
  }
  return String(idFallback || '').trim()
}

/**
 * 从本地通讯录缓存中按 wxid 解析展示名（备注优先，其次昵称）
 * @param {string} wxid
 * @returns {string} 无缓存或仅有 id 时返回 ''
 */
function lookupContactDisplayName(wxid) {
  const w = String(wxid || '').trim()
  if (!w) return ''
  try {
    const raw = localStorage.getItem(CONTACTS_CACHE_STORAGE_KEY)
    if (!raw) return ''
    const o = JSON.parse(raw)
    if (!o || o.version !== 1 || !Array.isArray(o.details)) return ''
    const nl = normalizeWxidForMatch(w)
    for (const row of o.details) {
      if (!row || typeof row !== 'object') continue
      const u = row.userName != null ? String(row.userName).trim() : ''
      if (normalizeWxidForMatch(u) === nl) {
        const name = pickDetailDisplayName(row, w)
        return name && name !== w ? name : ''
      }
    }
  } catch {
    /* ignore */
  }
  return ''
}

// --- 内存中的「全局状态」（与 localStorage 主键同步，见 loadState/saveState）---
const state = {
  token: '',
  tokenStatus: 'empty',
  appId: '',
  uuid: '',
  currentTargetWxid: '',
  /** 联系人列表展示名：备注优先，其次昵称（与 pickDisplayName 一致） */
  currentTargetDisplayName: '',
  /** 顶栏展示：当前登录微信昵称（无则空） */
  loginNickName: '',
}

/** 从 localStorage 恢复 state（页面加载时执行一次） */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const o = JSON.parse(raw)
    state.token = o.token ?? ''
    state.tokenStatus = o.tokenStatus ?? (state.token ? 'draft' : 'empty')
    state.appId = o.appId ?? ''
    state.uuid = o.uuid ?? ''
    state.currentTargetWxid = o.currentTargetWxid ?? ''
    state.currentTargetDisplayName = o.currentTargetDisplayName ?? ''
    state.loginNickName = o.loginNickName ?? ''
  } catch {
    /* ignore */
  }
}

/** 将 state 持久化到 localStorage（Token、appId、联系人锁定目标等） */
function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token: state.token,
      tokenStatus: state.tokenStatus,
      appId: state.appId,
      uuid: state.uuid,
      currentTargetWxid: state.currentTargetWxid,
      currentTargetDisplayName: state.currentTargetDisplayName,
      loginNickName: state.loginNickName,
    }),
  )
}

function emitStateChanged() {
  try {
    window.dispatchEvent(new CustomEvent('wechat-console:state-changed'))
  } catch {
    /* ignore */
  }
}

function normalizeTokenStatus(status) {
  const allowed = new Set(['empty', 'draft', 'checking', 'valid_locked', 'invalid'])
  return allowed.has(status) ? status : 'empty'
}

function setTokenStatus(status, emit = true) {
  state.tokenStatus = normalizeTokenStatus(status)
  saveState()
  if (emit) emitStateChanged()
}

function setTokenDraft(value, emit = true) {
  state.token = String(value || '')
  const trimmed = state.token.trim()
  if (!trimmed) {
    state.tokenStatus = 'empty'
  } else if (state.tokenStatus === 'valid_locked') {
    state.tokenStatus = 'draft'
  } else if (state.tokenStatus !== 'checking') {
    state.tokenStatus = 'draft'
  }
  saveState()
  if (emit) emitStateChanged()
}

function isTokenInvalidMessage(msg) {
  const text = String(msg || '').trim()
  if (!text) return false
  return TOKEN_INVALID_PATTERNS.some((part) => text.includes(part))
}

function isTokenInvalidPayload(payload) {
  if (!payload || typeof payload !== 'object') return false
  return isTokenInvalidMessage(payload.msg)
}

async function probeTokenByCheckOnline(tokenValue) {
  const token = String(tokenValue || '').trim()
  if (!token) {
    return {
      ok: false,
      invalid: false,
      message: '请先去API管理后台申请TOKEN',
      payload: null,
    }
  }
  const res = await fetch(BASE_URL + '/login/checkOnline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'VideosApi-token': token,
    },
    body: JSON.stringify({ appId: '' }),
  })
  const text = await res.text()
  let payload = {}
  try {
    payload = text ? JSON.parse(text) : {}
  } catch {
    payload = { raw: text }
  }
  if (isTokenInvalidPayload(payload)) {
    return {
      ok: false,
      invalid: true,
      message: 'TOKEN不可用或已过期，请先去API管理后台重新申请',
      payload,
    }
  }
  return {
    ok: true,
    invalid: false,
    message: '',
    payload,
  }
}

/**
 * 合并 appId：若 body 未显式包含 appId 字段，则使用 state.appId
 */
function mergeAppId(body) {
  const data =
    body && typeof body === 'object' && !Array.isArray(body) ? { ...body } : {}
  if (!Object.prototype.hasOwnProperty.call(data, 'appId')) {
    data.appId = state.appId ?? ''
  }
  return data
}

/** 与 apiPost 实际发送的 body 一致（含自动合并的 appId），供各模块展示入参 */
function getMergedRequestBody(body) {
  return mergeAppId(body)
}

function stringifyApiPayload(v) {
  if (v === undefined) return '(无)'
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

function formatApiPathLabel(path) {
  const raw = String(path || '').trim()
  if (!raw) return ''

  const m = raw.match(/^(\/[^\uFF08(]*?)(?:（([^）]+)）)?$/)
  const basePath = m ? String(m[1] || '').trim() : raw
  const extra = m && m[2] ? String(m[2]).trim() : ''

  try {
    const cat = window.WechatApiCatalog
    if (cat && typeof cat.getCatalogForPath === 'function' && basePath.startsWith('/')) {
      const doc = cat.getCatalogForPath(basePath, BASE_URL)
      const title = doc?.title ? String(doc.title).trim() : ''
      if (title && extra) return `${basePath}（${title} / ${extra}）`
      if (title) return `${basePath}（${title}）`
    }
  } catch {
    /* ignore catalog lookup failure */
  }

  return raw
}

/**
 * 统一展示：调用时间、路径、请求体、响应体或异常
 * @param {{ path: string, method?: string, at?: Date, requestBody?: object, responseBody?: unknown, error?: string }} params
 */
function formatApiCallText(params) {
  const {
    path,
    method = 'POST',
    at = new Date(),
    requestBody,
    responseBody,
    error,
  } = params
  const timeStr =
    at instanceof Date
      ? at.toLocaleString('zh-CN', { hour12: false })
      : String(at)
  const parts = [
    '调用时间：' + timeStr,
    method + ' ' + formatApiPathLabel(path),
    '请求体：\n' + stringifyApiPayload(requestBody),
  ]
  if (error != null && error !== '') {
    parts.push('异常：\n' + String(error))
  } else {
    parts.push('响应体：\n' + stringifyApiPayload(responseBody))
  }
  return parts.join('\n\n')
}

// --- 调用记录：内存环形缓冲区 + 订阅者（api-log 模块刷新表格）---
const API_LOG_MAX = 2000
const _apiRuntimeLog = []
const _apiLogListeners = []

function pushApiRuntimeLog(entry) {
  _apiRuntimeLog.push(entry)
  if (_apiRuntimeLog.length > API_LOG_MAX) {
    _apiRuntimeLog.splice(0, _apiRuntimeLog.length - API_LOG_MAX)
  }
  _apiLogListeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ignore */
    }
  })
}

function getApiRuntimeLog() {
  return _apiRuntimeLog.map((e) => JSON.parse(JSON.stringify(e)))
}

function clearApiRuntimeLog() {
  _apiRuntimeLog.length = 0
  _apiLogListeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ignore */
    }
  })
}

/**
 * 最多重试 LOGOUT_RETRY_MAX 次退出接口。
 * @returns {Promise<boolean>} 无 appId 或任一 次 ret=200 为 true；否则 false
 */
async function tryLogoutWithRetries() {
  const body = { proxyIp: '', regionId: '88' }
  if (!(state.appId || '').trim()) return true
  for (let i = 0; i < LOGOUT_RETRY_MAX; i++) {
    try {
      const res = await apiPost('/login/logout', body)
      if (res?.data?.ret === 200) return true
    } catch {
      /* 网络等异常：继续重试 */
    }
    if (i < LOGOUT_RETRY_MAX - 1) {
      await new Promise((r) => setTimeout(r, LOGOUT_RETRY_DELAY_MS))
    }
  }
  return false
}

/**
 * 清除本控制台相关 localStorage、内存运行日志并刷新页面（不先发退出请求）。
 */
function purgeLocalConsoleDataAndReload() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CONTACTS_CACHE_STORAGE_KEY)
    localStorage.removeItem(LOGIN_SNAPSHOT_STORAGE_KEY)
    localStorage.removeItem('wechat-console:profile-snapshot')
    localStorage.removeItem(WEBHOOK_RECV_URL_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  clearApiRuntimeLog()
  location.reload()
}

/**
 * 先尽力退出微信（最多 3 次）；失败仍提示手动退出，并照常清理本地测试数据后整页刷新。
 */
async function exitWeChatClearAllAndReload() {
  const hadAppId = !!(state.appId || '').trim()
  const logoutOk = await tryLogoutWithRetries()
  if (hadAppId && !logoutOk) {
    window.alert('请手动退出微信')
  }
  purgeLocalConsoleDataAndReload()
}

function subscribeApiLog(fn) {
  if (typeof fn === 'function') _apiLogListeners.push(fn)
}

/**
 * 统一 POST JSON：自动带 VideosApi-token、合并 appId，并写入运行日志。
 */
async function apiPost(path, body) {
  const payload = mergeAppId(body)
  const t0 = Date.now()
  const clonedRawBody =
    body === undefined ? undefined : JSON.parse(JSON.stringify(body))
  const clonedMergedBody = JSON.parse(JSON.stringify(payload))
  const logEntry = {
    at: new Date().toISOString(),
    path,
    method: 'POST',
    fullUrl: BASE_URL + path,
    requestHeaders: {
      'Content-Type': 'application/json',
      'VideosApi-token': state.token ? '***已配置（导出已脱敏）***' : '',
    },
    requestBodyRaw: clonedRawBody,
    requestBody: clonedMergedBody,
    responseHttpStatus: null,
    responseBody: null,
    error: null,
    durationMs: null,
  }

  try {
    const res = await fetch(BASE_URL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'VideosApi-token': state.token || '',
      },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    logEntry.responseHttpStatus = res.status
    let json
    try {
      json = text ? JSON.parse(text) : {}
    } catch (pe) {
      logEntry.responseBody = { _nonJsonBody: true, rawPreview: text.slice(0, 8000) }
      logEntry.error = '响应 JSON 解析失败: ' + (pe?.message || String(pe))
      logEntry.durationMs = Date.now() - t0
      pushApiRuntimeLog(logEntry)
      const err = new Error('响应不是合法 JSON')
      err.raw = text
      throw err
    }
    logEntry.responseBody = json
    logEntry.durationMs = Date.now() - t0
    if (isTokenInvalidPayload(json)) {
      state.tokenStatus = 'invalid'
      saveState()
      emitStateChanged()
    }
    pushApiRuntimeLog(logEntry)
    return { ok: res.ok, status: res.status, data: json }
  } catch (e) {
    if (logEntry.durationMs == null) logEntry.durationMs = Date.now() - t0
    if (logEntry.responseHttpStatus == null && !logEntry.error) {
      logEntry.error = e?.message || String(e)
      pushApiRuntimeLog(logEntry)
    }
    throw e
  }
}

/** ret !== 200 时抛错，成功则返回 data */
function assertApiOk(apiResult) {
  const body = apiResult?.data ?? {}
  const { ret, msg, data } = body
  if (ret !== 200) {
    const err = new Error(msg || `接口异常 ret=${ret}`)
    err.payload = body
    throw err
  }
  return data
}

/** document.getElementById 简写 */
function $(id) {
  return document.getElementById(id)
}

/** 右上角轻提示：success | error | info */
function showToast(message, type = 'info') {
  const el = $('toast')
  if (!el) return
  el.textContent = message
  el.className = 'show ' + type
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => {
    el.classList.remove('show')
  }, 2800)
}

/** 单按钮模态（仅确定），与双按钮 modalConfirm 共用遮罩 */
function showModal(title, message) {
  const ov = $('modal-overlay')
  const t = $('modal-title')
  const b = $('modal-body')
  const cancelBtn = $('modal-cancel')
  if (!ov || !t || !b) {
    window.alert(title + '\n\n' + message)
    return
  }
  t.textContent = title
  b.textContent = message
  if (cancelBtn) cancelBtn.hidden = true
  ov.classList.add('show')
}

function hideModal() {
  const ov = $('modal-overlay')
  if (ov) ov.classList.remove('show')
}

/**
 * 双按钮确认（确定 / 取消）。与 showModal 共用弹层；点击遮罩视为取消。
 * @returns {Promise<boolean>}
 */
function modalConfirm(title, message) {
  const ov = $('modal-overlay')
  const t = $('modal-title')
  const b = $('modal-body')
  const okBtn = $('modal-ok')
  const cancelBtn = $('modal-cancel')
  if (!ov || !t || !b || !okBtn) {
    return Promise.resolve(window.confirm(title + '\n\n' + message))
  }

  return new Promise((resolve) => {
    t.textContent = title
    b.textContent = message
    if (cancelBtn) cancelBtn.hidden = false

    function finish(value) {
      okBtn.removeEventListener('click', onOk)
      if (cancelBtn) cancelBtn.removeEventListener('click', onCancel)
      ov.removeEventListener('click', onOverlay)
      hideModal()
      if (cancelBtn) cancelBtn.hidden = true
      resolve(value)
    }

    function onOk() {
      finish(true)
    }
    function onCancel() {
      finish(false)
    }
    function onOverlay(e) {
      if (e.target === ov) finish(false)
    }

    okBtn.addEventListener('click', onOk)
    if (cancelBtn) cancelBtn.addEventListener('click', onCancel)
    ov.addEventListener('click', onOverlay)
    ov.classList.add('show')
  })
}

// --- 对外 API：业务模块仅依赖此对象 ---
window.WechatConsoleCore = {
  BASE_URL,
  STORAGE_KEY,
  CONTACTS_CACHE_STORAGE_KEY,
  LOGIN_SNAPSHOT_STORAGE_KEY,
  WEBHOOK_RECV_URL_STORAGE_KEY,
  state,
  loadState,
  saveState,
  apiPost,
  assertApiOk,
  $,
  showToast,
  showModal,
  hideModal,
  modalConfirm,
  getMergedRequestBody,
  formatApiPathLabel,
  formatApiCallText,
  getApiRuntimeLog,
  clearApiRuntimeLog,
  subscribeApiLog,
  emitStateChanged,
  setTokenStatus,
  setTokenDraft,
  probeTokenByCheckOnline,
  isTokenInvalidMessage,
  isTokenInvalidPayload,
  lookupContactDisplayName,
  normalizeWxidForMatch,
  exitWeChatClearAllAndReload,
  purgeLocalConsoleDataAndReload,
}

// 启动时从 localStorage 恢复 Token、appId、锁定联系人、顶栏昵称等
loadState()
