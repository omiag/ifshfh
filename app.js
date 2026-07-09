/**
 * =============================================================================
 * 【应用壳 app.js】最后加载：顶栏 Token、appId/昵称、「清理缓存」、侧栏 hash 路由。
 * 依赖：core.js（WechatConsoleCore）、modules-bundle.js（无直接依赖，仅保证 DOM 已存在）。
 * =============================================================================
 */
;(function () {
  const C = window.WechatConsoleCore
  if (!C) return
  const HOME_WELCOME_TIP_SHOWN_KEY = 'wechat_console_home_welcome_tip_shown_v1'

  const TOKEN_PROTECTED_EXEMPT_IDS = new Set([
    'btn-token-save',
    'btn-token-edit',
    'btn-header-clear-cache',
    'btn-stop-poll',
    'btn-login-clear-log',
    'btn-login-runtime-clear',
    'btn-profile-export-log',
    'btn-contacts-export-log',
    'btn-contacts-clear-log',
    'btn-msg-export-log',
    'btn-msg-clear-log',
    'btn-sns-export-log',
    'btn-sns-clear-log',
    'btn-label-export-log',
    'btn-label-clear-log',
    'btn-favor-export-log',
    'btn-favor-clear-log',
    'btn-api-log-export',
    'btn-api-log-clear',
    'btn-api-log-refresh',
    'btn-webhook-save-url',
    'btn-webhook-simulate',
    'btn-webhook-clear-terminal',
    'btn-login-verify-continue',
    'btn-logout',
    'clear-cache-cancel',
    'clear-cache-purge-only',
    'clear-cache-exit',
    'reuse-appid-cancel',
    'reuse-appid-confirm',
    'modal-ok',
    'modal-cancel',
  ])

  const TOKEN_ONLY_BUTTON_IDS = new Set([
    'btn-get-qrcode',
    'btn-header-reuse-appid',
  ])

  /** 同步顶栏：Token 输入框、appId 标签、微信昵称（读 state，不写接口） */
  function syncHeaderUi() {
    const input = C.$('input-token')
    if (input) input.value = C.state.token
    const saveBtn = C.$('btn-token-save')
    const editBtn = C.$('btn-token-edit')
    const statusTag = C.$('token-lock-tag')
    const tokenStatus = C.state.tokenStatus || (C.state.token ? 'draft' : 'empty')
    const hasToken = !!(C.state.token || '').trim()
    if (input) {
      input.readOnly = tokenStatus === 'valid_locked' || tokenStatus === 'checking'
      input.classList.toggle('is-locked', tokenStatus === 'valid_locked')
      input.classList.toggle('is-invalid', tokenStatus === 'invalid')
    }
    if (saveBtn) {
      saveBtn.disabled = !hasToken || tokenStatus === 'checking' || tokenStatus === 'valid_locked'
      saveBtn.textContent = tokenStatus === 'checking' ? '校验中' : '保存'
    }
    if (editBtn) {
      editBtn.disabled = !hasToken || tokenStatus === 'checking' || tokenStatus !== 'valid_locked'
    }
    if (statusTag) {
      let text = '未校验'
      if (tokenStatus === 'empty') text = '未填写'
      if (tokenStatus === 'draft') text = '待保存'
      if (tokenStatus === 'checking') text = '校验中'
      if (tokenStatus === 'valid_locked') text = '已锁定'
      if (tokenStatus === 'invalid') text = '已失效'
      statusTag.textContent = text
      statusTag.dataset.status = tokenStatus
    }
    const tag = C.$('app-id-display')
    if (tag) {
      const v = (C.state.appId || '').trim()
      tag.textContent = v || '未设置'
    }
    const nick = C.$('header-nick-display')
    if (nick) {
      const n = (C.state.loginNickName || '').trim()
      nick.textContent = n || '—'
    }
  }

  function showTokenApplyHint() {
    C.showModal('提示', '请先去API管理后台申请TOKEN')
  }

  function showTokenSaveHint() {
    C.showModal('提示', '请先保存并校验TOKEN')
  }

  function showTokenInvalidHint() {
    C.showModal('提示', 'TOKEN不可用或已过期，请先去API管理后台重新申请')
  }

  function showNeedLoginHint() {
    C.showModal('提示', '请先前往登陆模块进行账号登陆')
  }

  function getGuardRuleByButton(button) {
    const id = String(button?.id || '').trim()
    if (!id || !id.startsWith('btn-')) return null
    if (TOKEN_PROTECTED_EXEMPT_IDS.has(id)) return null
    if (TOKEN_ONLY_BUTTON_IDS.has(id)) {
      return { requireAppId: false }
    }
    return { requireAppId: true }
  }

  function guardProtectedAction(button) {
    const rule = getGuardRuleByButton(button)
    if (!rule) return true
    const token = (C.state.token || '').trim()
    if (!token) {
      showTokenApplyHint()
      return false
    }
    if (C.state.tokenStatus === 'invalid') {
      showTokenInvalidHint()
      return false
    }
    if (C.state.tokenStatus !== 'valid_locked') {
      showTokenSaveHint()
      return false
    }
    if (rule.requireAppId && !(C.state.appId || '').trim()) {
      showNeedLoginHint()
      return false
    }
    return true
  }

  async function onTokenSave() {
    const input = C.$('input-token')
    const token = (input?.value || '').trim()
    if (!token) {
      showTokenApplyHint()
      return
    }
    C.setTokenDraft(token, false)
    C.setTokenStatus('checking')
    try {
      const result = await C.probeTokenByCheckOnline(token)
      C.setTokenDraft(token, false)
      if (!result.ok) {
        C.setTokenStatus(result.invalid ? 'invalid' : 'draft')
        if (result.invalid) {
          showTokenInvalidHint()
        } else {
          C.showModal('TOKEN校验失败', result.message || 'TOKEN校验失败，请稍后重试')
        }
        return
      }
      C.setTokenStatus('valid_locked')
      C.showToast('TOKEN校验成功，已锁定', 'success')
    } catch (e) {
      C.setTokenDraft(token, false)
      C.setTokenStatus('draft')
      C.showModal('TOKEN校验失败', e?.message || '请求异常，请稍后重试')
    }
  }

  async function onTokenEdit() {
    const input = C.$('input-token')
    const token = (input?.value || C.state.token || '').trim()
    if (!token) {
      showTokenApplyHint()
      return
    }
    C.setTokenDraft(token, false)
    C.setTokenStatus('checking')
    try {
      const result = await C.probeTokenByCheckOnline(token)
      C.setTokenDraft(token, false)
      C.setTokenStatus('draft')
      if (input) {
        input.focus()
        input.select()
      }
      if (!result.ok && result.invalid) {
        showTokenInvalidHint()
        return
      }
      if (!result.ok) {
        C.showModal('TOKEN校验失败', result.message || 'TOKEN校验失败，请稍后重试')
        return
      }
      C.showToast('TOKEN已解锁，可重新编辑', 'success')
    } catch (e) {
      C.setTokenDraft(token, false)
      C.setTokenStatus('draft')
      if (input) {
        input.focus()
        input.select()
      }
      C.showModal('TOKEN校验失败', e?.message || '请求异常，请稍后重试')
    }
  }

  /**
   * 清理缓存三选一：确定并退出 | 确定不退出 | 取消
   * @returns {Promise<'exit' | 'purge-only' | 'cancel'>}
   */
  function openClearCacheChoice() {
    return new Promise((resolve) => {
      const ov = C.$('clear-cache-overlay')
      const bExit = C.$('clear-cache-exit')
      const bPurge = C.$('clear-cache-purge-only')
      const bCancel = C.$('clear-cache-cancel')
      if (!ov || !bExit || !bPurge || !bCancel) {
        resolve('cancel')
        return
      }

      function cleanup(choice) {
        bExit.removeEventListener('click', onExit)
        bPurge.removeEventListener('click', onPurge)
        bCancel.removeEventListener('click', onCancel)
        ov.removeEventListener('click', onOverlay)
        document.removeEventListener('keydown', onEscape)
        ov.classList.remove('show')
        ov.setAttribute('aria-hidden', 'true')
        resolve(choice)
      }

      function onExit() {
        cleanup('exit')
      }
      function onPurge() {
        cleanup('purge-only')
      }
      function onCancel() {
        cleanup('cancel')
      }
      function onOverlay(e) {
        if (e.target === ov) cleanup('cancel')
      }
      function onEscape(e) {
        if (e.key === 'Escape') cleanup('cancel')
      }

      bExit.addEventListener('click', onExit)
      bPurge.addEventListener('click', onPurge)
      bCancel.addEventListener('click', onCancel)
      ov.addEventListener('click', onOverlay)
      document.addEventListener('keydown', onEscape)
      ov.setAttribute('aria-hidden', 'false')
      ov.classList.add('show')
    })
  }

  /** 顶栏「清理缓存」：三按钮——退出微信并清本地 / 仅清本地 / 取消 */
  async function onHeaderClearCache() {
    const choice = await openClearCacheChoice()
    if (choice === 'cancel') return

    const btn = C.$('btn-header-clear-cache')
    if (btn) btn.disabled = true

    try {
      if (choice === 'exit') {
        C.showToast('正在退出微信并清理本地数据…', 'info')
        await C.exitWeChatClearAllAndReload()
      } else {
        C.showToast('正在清理本地数据（未调用退出微信）…', 'info')
        C.purgeLocalConsoleDataAndReload()
      }
    } catch (e) {
      C.showToast(e?.message || '清理过程异常', 'error')
      if (btn) btn.disabled = false
    }
  }

  /** 根据 hash 高亮侧栏链接与对应 .panel */
  function setNavActive(hash) {
    document.querySelectorAll('.side-menu a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === hash)
    })
    document.querySelectorAll('.panel').forEach((p) => {
      p.classList.toggle('active', '#' + p.id === hash)
    })
  }

  /** hash 变化时校验白名单，非法则回退 #login */
  function onHashChange() {
    let h = location.hash || '#login'
    if (!h.startsWith('#')) h = '#' + h
    const allowed = [
      '#login',
      '#profile-tags',
      '#map',
      '#contacts',
      '#messages',
      '#sns',
      '#labels',
      '#favorites',
      '#webhook',
      '#api-logs',
    ]
    if (!allowed.includes(h)) {
      h = '#login'
      location.replace(h)
      return
    }
    setNavActive(h)
  }

  function bindNav() {
    window.addEventListener('hashchange', onHashChange)
    document.querySelectorAll('.side-menu a').forEach((a) => {
      a.addEventListener('click', () => {
        setTimeout(() => setNavActive(location.hash || '#login'), 0)
      })
    })
  }

  function showHomeWelcomeTipOnce() {
    const currentHash = location.hash || '#login'
    if (currentHash !== '#login') return
    try {
      if (localStorage.getItem(HOME_WELCOME_TIP_SHOWN_KEY) === '1') return
      localStorage.setItem(HOME_WELCOME_TIP_SHOWN_KEY, '1')
    } catch {
      /* ignore storage failure */
    }
    C.showModal(
      '💡 温馨提示',
      '当前页面仅供您快速体验和验证接口功能。\n若需正式接入您的业务，建议您先在此获取并导出 JSON 报文，随后参考详细的接口文档完成系统对接。',
    )
  }

  function bindRequestGuard() {
    document.addEventListener(
      'click',
      (ev) => {
        const button = ev.target instanceof Element ? ev.target.closest('button') : null
        if (!button) return
        if (guardProtectedAction(button)) return
        ev.preventDefault()
        ev.stopPropagation()
      },
      true,
    )
  }

  function init() {
    syncHeaderUi()
    window.addEventListener('wechat-console:state-changed', syncHeaderUi)

    C.$('input-token')?.addEventListener('input', (e) => {
      C.setTokenDraft(e.target.value, false)
      syncHeaderUi()
    })
    C.$('btn-token-save')?.addEventListener('click', () => void onTokenSave())
    C.$('btn-token-edit')?.addEventListener('click', () => void onTokenEdit())

    C.$('btn-header-clear-cache')?.addEventListener('click', () => void onHeaderClearCache())

    if (!location.hash) location.hash = '#login'
    bindRequestGuard()
    bindNav()
    onHashChange()
    showHomeWelcomeTipOnce()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
