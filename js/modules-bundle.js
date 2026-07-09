/**
 * =============================================================================
 * 【业务模块合并包】与原多个独立 .js 逻辑完全一致，仅减少请求次数。
 *
 * 加载顺序：必须先于本文件引入 core.js（提供 window.WechatConsoleCore）。
 * 段内顺序固定：api-catalog → login → profile → contacts → messages → sns
 *              → labels → favorites → webhook → api-log
 *
 * 中文说明：段首以「分节注释」标明原文件名；各 IIFE 内保留原有 JSDoc。
 * api-catalog 内 Look-up 表为导出用元数据，字段 remark 已为中文。
 *
 * 维护方式：若需改某一业务域，在本文件中搜索对应分区标题，或从 Git 历史恢复单文件编辑后再合并。
 * =============================================================================
 */

/* ---------- api-catalog：全量接口索引与导出注释 ---------- */
/**
 * 全量接口索引 + 字段注释（登录模块为文档级细项，其余模块为通用壳 + 文档指向）
 * Base 与 core.js 中 BASE_URL 一致：.../finder/v2/api
 */
; (function () {
  const COMMON_REQ = [
    {
      name: 'appId',
      type: 'string',
      required: '视接口而定',
      remark:
        '设备核心 ID。本控制台在 body 未显式带 appId 时，会从全局状态自动合并；取码等场景可在表单中手动传空或指定值。',
    },
    {
      name: 'useProxy',
      type: 'boolean',
      required: false,
      remark: '文档：可为 true 使该请求走全局代理；默认 false。各接口文档未逐条展示。',
    },
  ]

  const COMMON_RES = [
    { name: 'ret', type: 'number', remark: '业务状态码，200 表示操作成功（与 HTTP 状态独立，以文档为准）。' },
    { name: 'msg', type: 'string', remark: '提示信息。' },
    {
      name: 'data',
      type: 'object | boolean | string | …',
      remark: '业务载荷，结构因接口而异；非登录类接口的字段级说明见仓库对应模块 Markdown。',
    },
  ]

  /** 登录模块：与 登陆模块.md 对齐的入参/出参注释 */
  const LOGIN_DETAIL = {
    '/login/getLoginQrCode': {
      module: '登陆模块',
      title: '获取登录二维码',
      request: [
        { name: 'appId', type: 'string', required: false, remark: '设备 ID；首次登录传空；掉线重连传上次返回的 appId。' },
        { name: 'proxyIp', type: 'string', required: false, remark: 'socks5://username:password@host' },
        { name: 'regionId', type: 'string', required: true, remark: '登陆地区六位 ID，选最近地区。' },
        { name: 'type', type: 'string', required: true, remark: 'ipad 或 mac；验证方式不同。' },
        {
          name: 'ttuid',
          type: 'string',
          required: false,
          remark: '代理本机 ID，需配合 regionId/proxyIp，不单独使用。',
        },
      ],
      response: [
        ...COMMON_RES,
        { name: 'data.qrData', type: 'string', remark: '二维码内信息。' },
        { name: 'data.qrUrl', type: 'string', remark: '二维码直链。' },
        { name: 'data.qrImgBase64', type: 'string', remark: '图片 Base64，可直接作 img src。' },
        { name: 'data.appId', type: 'string', remark: '设备 ID。' },
        { name: 'data.uuid', type: 'string', remark: '本次二维码 uuid，用于 checkLogin。' },
      ],
    },
    '/login/checkLogin': {
      module: '登陆模块',
      title: '执行登录（轮询）',
      request: [
        { name: 'appId', type: 'string', required: true, remark: '设备 ID。' },
        { name: 'uuid', type: 'string', required: true, remark: '取码返回的 uuid。' },
        {
          name: 'autoSliding',
          type: 'boolean',
          required: true,
          remark: 'Mac 可 true 自动滑块；iPad 须 false。'
        },
        { name: 'captchCode', type: 'string', required: false, remark: '数字验证码（如有）。' },
        { name: 'proxyIp', type: 'string', required: false, remark: '代理。' },
      ],
      response: [
        ...COMMON_RES,
        { name: 'data.uuid', type: 'string', remark: '二维码 uuid。' },
        { name: 'data.headImgUrl', type: 'string', remark: '头像。' },
        { name: 'data.nickName', type: 'string', remark: '昵称。' },
        { name: 'data.expiredTime', type: 'number', remark: '二维码剩余时间相关。' },
        {
          name: 'data.status',
          type: 'number',
          remark: '0 未扫码；1 已扫码未登录；2 登录成功；4 已取消等。',
        },
        { name: 'data.loginInfo', type: 'object', remark: '成功时含 wxid、nickName 等。' },
        { name: 'data.url', type: 'string', remark: '需图形验证时可能返回验证链接。' },
      ],
    },
    '/login/dialogLogin': {
      module: '登陆模块',
      title: '弹框登录',
      request: [
        { name: 'appId', type: 'string', required: true, remark: '设备 ID。' },
        { name: 'proxyIp', type: 'string', required: true, remark: '代理。' },
        { name: 'regionId', type: 'string', required: true, remark: '地区。' },
      ],
      response: [...COMMON_RES, { name: 'data.appId', type: 'string' }, { name: 'data.uuid', type: 'string' }],
    },
    '/login/logout': {
      module: '登陆模块',
      title: '退出',
      request: [
        { name: 'appId', type: 'string', required: true, remark: '设备 ID。' },
        { name: 'proxyIp', type: 'string', required: false, remark: '文档示例字段。' },
        { name: 'regionId', type: 'string', required: false, remark: '文档示例字段。' },
      ],
      response: [...COMMON_RES],
    },
    '/login/checkOnline': {
      module: '登陆模块',
      title: '检查是否在线',
      request: [{ name: 'appId', type: 'string', required: true, remark: '设备 ID。' }],
      response: [...COMMON_RES, { name: 'data', type: 'boolean', remark: 'true 在线，否则离线。' }],
    },
    '/login/reconnection': {
      module: '登陆模块',
      title: '异常断线重连',
      request: [{ name: 'appId', type: 'string', required: true, remark: '设备 ID。' }],
      response: [...COMMON_RES, { name: 'data', type: 'boolean', remark: '文档示例为 true。' }],
    },
    '/login/setProxy': {
      module: '登陆模块',
      title: '无感切换代理',
      request: [
        { name: 'appId', type: 'string', required: true, remark: '设备 ID。' },
        { name: 'proxyIp', type: 'string', required: true, remark: '新 socks5 代理。' },
      ],
      response: [...COMMON_RES],
    },
  }

  /** 自各模块 Markdown 汇总的 POST 路径 → 模块名（用于全量目录） */
  const BULK = [
    ['/contacts/addContacts', '联系人模块'],
    ['/contacts/checkRelation', '联系人模块'],
    ['/contacts/deleteFriend', '联系人模块'],
    ['/contacts/fetchContactsList', '联系人模块'],
    ['/contacts/fetchContactsListCache', '联系人模块'],
    ['/contacts/getBriefInfo', '联系人模块'],
    ['/contacts/getDetailInfo', '联系人模块'],
    ['/contacts/getPhoneAddressList', '联系人模块'],
    ['/contacts/search', '联系人模块'],
    ['/contacts/setFriendPermissions', '联系人模块'],
    ['/contacts/setFriendRemark', '联系人模块'],
    ['/contacts/uploadPhoneAddressList', '联系人模块'],
    ['/favor/delete', '收藏夹模块'],
    ['/favor/getContent', '收藏夹模块'],
    ['/favor/sync', '收藏夹模块'],
    ['/finder/browse', '视频号模块'],
    ['/finder/comment', '视频号模块'],
    ['/finder/commentList', '视频号模块'],
    ['/finder/contactList', '视频号模块'],
    ['/finder/createFinder', '视频号模块'],
    ['/finder/follow', '视频号模块'],
    ['/finder/followList', '视频号模块'],
    ['/finder/getFinderInfo', '视频号模块'],
    ['/finder/getMsgSessionId', '视频号模块'],
    ['/finder/getProfile', '视频号模块'],
    ['/finder/getQrCode', '视频号模块'],
    ['/finder/idFav', '视频号模块'],
    ['/finder/idLike', '视频号模块'],
    ['/finder/likeFavList', '视频号模块'],
    ['/finder/mentionList', '视频号模块'],
    ['/finder/postPrivateLetter', '视频号模块'],
    ['/finder/postPrivateLetterImg', '视频号模块'],
    ['/finder/publishFinder', '视频号模块'],
    ['/finder/publishFinderCdn', '视频号模块'],
    ['/finder/publishFinderWeb', '视频号模块'],
    ['/finder/queryFinderVideoAsync', '视频号模块'],
    ['/finder/scanBrowse', '视频号模块'],
    ['/finder/scanComment', '视频号模块'],
    ['/finder/scanFav', '视频号模块'],
    ['/finder/scanFollow', '视频号模块'],
    ['/finder/scanLike', '视频号模块'],
    ['/finder/scanLoginChannels', '视频号模块'],
    ['/finder/scanQrCode', '视频号模块'],
    ['/finder/search', '视频号模块'],
    ['/finder/syncPrivateLetterMsg', '视频号模块'],
    ['/finder/updateProfile', '视频号模块'],
    ['/finder/uploadFinderVideo', '视频号模块'],
    ['/finder/uploadFinderVideoAsync', '视频号模块'],
    ['/finder/userPage', '视频号模块'],
    ['/group/addGroupMemberAsFriend', '群管理模块'],
    ['/group/adminOperate', '群管理模块'],
    ['/group/agreeJoinRoom', '群管理模块'],
    ['/group/createChatroom', '群管理模块'],
    ['/group/getChatroomAnnouncement', '群管理模块'],
    ['/group/getChatroomInfo', '群管理模块'],
    ['/group/getChatroomMemberDetail', '群管理模块'],
    ['/group/getChatroomMemberList', '群管理模块'],
    ['/group/getChatroomQrCode', '群管理模块'],
    ['/group/inviteMember', '群管理模块'],
    ['/group/joinRoomUsingQRCode', '群管理模块'],
    ['/group/modifyChatroomName', '群管理模块'],
    ['/group/modifyChatroomNickNameForSelf', '群管理模块'],
    ['/group/modifyChatroomRemark', '群管理模块'],
    ['/group/pinChat', '群管理模块'],
    ['/group/quitChatroom', '群管理模块'],
    ['/group/removeMember', '群管理模块'],
    ['/group/roomAccessApplyCheckApprove', '群管理模块'],
    ['/group/saveContractList', '群管理模块'],
    ['/group/setChatroomAnnouncement', '群管理模块'],
    ['/group/setMsgSilence', '群管理模块'],
    ['/im/detail', '联系人模块'],
    ['/im/sync', '联系人模块'],
    ['/label/add', '标签模块'],
    ['/label/delete', '标签模块'],
    ['/label/list', '标签模块'],
    ['/label/modifyMemberList', '标签模块'],
    ['/message/downloadCdn', '消息模块'],
    ['/message/downloadEmojiMd5', '消息模块'],
    ['/message/downloadFile', '消息模块'],
    ['/message/downloadImage', '消息模块'],
    ['/message/downloadVideo', '消息模块'],
    ['/message/downloadVoice', '消息模块'],
    ['/message/forwardFile', '消息模块'],
    ['/message/forwardImage', '消息模块'],
    ['/message/forwardMiniApp', '消息模块'],
    ['/message/forwardUrl', '消息模块'],
    ['/message/forwardVideo', '消息模块'],
    ['/message/postAppMsg', '消息模块'],
    ['/message/postEmoji', '消息模块'],
    ['/message/postFile', '消息模块'],
    ['/message/postImage', '消息模块'],
    ['/message/postLink', '消息模块'],
    ['/message/postLocation', '消息模块'],
    ['/message/postMiniApp', '消息模块'],
    ['/message/postNameCard', '消息模块'],
    ['/message/postText', '消息模块'],
    ['/message/postVideo', '消息模块'],
    ['/message/postVoice', '消息模块'],
    ['/message/revokeMsg', '消息模块'],
    ['/message/sendFinderMsg', '视频号模块'],
    ['/personal/getProfile', '个人信息模块'],
    ['/personal/getQrCode', '个人信息模块'],
    ['/personal/getSafetyInfo', '个人信息模块'],
    ['/personal/privacySettings', '个人信息模块'],
    ['/personal/updateHeadImg', '个人信息模块'],
    ['/personal/updateProfile', '个人信息模块'],
    ['/sns/commentSns', '朋友圈模块'],
    ['/sns/contactsSnsList', '朋友圈模块'],
    ['/sns/delSns', '朋友圈模块'],
    ['/sns/downloadSnsVideo', '朋友圈模块'],
    ['/sns/forwardSns', '朋友圈模块'],
    ['/sns/likeSns', '朋友圈模块'],
    ['/sns/sendFinderSns', '视频号模块'],
    ['/sns/sendImgSns', '朋友圈模块'],
    ['/sns/sendTextSns', '朋友圈模块'],
    ['/sns/sendUrlSns', '朋友圈模块'],
    ['/sns/sendVideoSns', '朋友圈模块'],
    ['/sns/snsDetails', '朋友圈模块'],
    ['/sns/snsList', '朋友圈模块'],
    ['/sns/snsSetPrivacy', '朋友圈模块'],
    ['/sns/snsVisibleScope', '朋友圈模块'],
    ['/sns/strangerVisibilityEnabled', '朋友圈模块'],
    ['/sns/uploadSnsImage', '朋友圈模块'],
    ['/sns/uploadSnsVideo', '朋友圈模块'],
  ]

  const API_TITLE_OVERRIDES = {
    '/personal/getProfile': '获取个人资料',
    '/personal/getQrCode': '获取个人二维码',
    '/personal/getSafetyInfo': '获取设备记录',
    '/personal/privacySettings': '提交隐私设置',
    '/personal/updateHeadImg': '修改头像',
    '/personal/updateProfile': '修改个人资料',

    '/contacts/fetchContactsList': '获取通讯录列表',
    '/contacts/fetchContactsListCache': '获取通讯录列表缓存',
    '/contacts/search': '搜索好友',
    '/contacts/addContacts': '添加好友 / 同意好友',
    '/contacts/deleteFriend': '删除好友',
    '/contacts/getBriefInfo': '获取简要信息',
    '/contacts/getDetailInfo': '获取详细信息',
    '/contacts/setFriendPermissions': '设置好友仅聊天',
    '/contacts/setFriendRemark': '设置好友备注',

    '/message/postText': '发送文本消息',
    '/message/postImage': '发送图片消息',
    '/message/postFile': '发送文件消息',
    '/message/postLink': '发送链接消息',
    '/message/postVideo': '发送视频消息',
    '/message/postMiniApp': '发送小程序消息',
    '/message/downloadCdn': '下载 CDN 资源',

    '/sns/snsList': '获取朋友圈大厅',
    '/sns/contactsSnsList': '获取指定好友朋友圈',
    '/sns/likeSns': '点赞 / 取消点赞',
    '/sns/sendTextSns': '发布纯文本朋友圈',
    '/sns/uploadSnsImage': '上传朋友圈图片',
    '/sns/sendImgSns': '发布图文朋友圈',
    '/sns/sendUrlSns': '发布链接朋友圈',
    '/sns/uploadSnsVideo': '上传朋友圈视频',
    '/sns/sendVideoSns': '发布视频朋友圈',
    '/sns/forwardSns': '转发朋友圈',
    '/sns/snsDetails': '获取朋友圈详情',
    '/sns/delSns': '删除朋友圈',
    '/sns/commentSns': '评论 / 删除评论',
    '/sns/snsVisibleScope': '设置朋友圈可见范围',
    '/sns/strangerVisibilityEnabled': '设置陌生人可见',
    '/sns/snsSetPrivacy': '设置单条朋友圈隐私',
    '/sns/downloadSnsVideo': '下载朋友圈视频',

    '/label/list': '获取标签列表',
    '/label/add': '新增标签',
    '/label/delete': '删除标签',
    '/label/modifyMemberList': '修改好友标签',

    '/favor/sync': '同步收藏夹',
    '/favor/getContent': '获取收藏详情',
    '/favor/delete': '删除收藏',
  }

  function buildEntry(path, moduleName, titleOverride) {
    const d = LOGIN_DETAIL[path]
    if (d) {
      return {
        path,
        method: 'POST',
        module: d.module,
        title: d.title,
        docFile: '登陆模块.md',
        requestBodyFields: d.request,
        responseBodyFields: d.response,
      }
    }
    const title =
      titleOverride || API_TITLE_OVERRIDES[path] || path.split('/').filter(Boolean).pop()
    return {
      path,
      method: 'POST',
      module: moduleName,
      title,
      docFile: `${moduleName.replace('模块', '')}相关文档见仓库同名 .md`,
      requestBodyFields: COMMON_REQ,
      responseBodyFields: COMMON_RES,
      remark:
        '该接口的完整入参/出参字段请以仓库中对应模块 Markdown 为准；此处为通用响应壳与 appId 说明。',
    }
  }

  function getFullCatalog(baseUrl) {
    const root = (baseUrl || '').replace(/\/$/, '')
    const fromLogin = Object.keys(LOGIN_DETAIL).map((p) => buildEntry(p))
    const fromBulk = BULK.map(([p, mod]) => buildEntry(p, mod))
    const merged = new Map()
    fromLogin.forEach((e) => merged.set(e.path, e))
    fromBulk.forEach((e) => {
      if (!merged.has(e.path)) merged.set(e.path, e)
    })
    const list = Array.from(merged.values()).sort((a, b) => a.path.localeCompare(b.path))
    return list.map((e) => ({
      ...e,
      fullUrl: root + e.path,
    }))
  }

  function getCatalogForPath(path, baseUrl) {
    const root = (baseUrl || '').replace(/\/$/, '')
    const all = getFullCatalog(root)
    const hit = all.find((x) => x.path === path)
    if (hit) return hit
    const b = buildEntry(path, '未分类')
    return { ...b, fullUrl: root + path }
  }

  window.WechatApiCatalog = {
    getFullCatalog,
    getCatalogForPath,
    COMMON_REQ,
    COMMON_RES,
  }
})()

  /* ---------- login-module：取码、轮询、登录态与顶栏联动 ---------- */
  /**
   * 登录模块：取码、轮询 checkLogin、登录后操作
   * 依赖：WechatConsoleCore（core.js）
   */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) {
      console.error('login-module.js 需在 core.js 之后加载')
      return
    }

    const POLL_MS = 5000
    const QR_TTL_MS = 125000

    /** 登录成功后缓存到 localStorage，刷新页面后仍能先还原右侧卡片（再请求 getProfile 校正） */
    const LOGIN_SNAPSHOT_KEY = C.LOGIN_SNAPSHOT_STORAGE_KEY

    let pollTimer = null
    let qrFetchedAt = 0
    let pollCount = 0
    let pendingLoginAppId = ''
    /** @type {'ipad'|'mac'} */
    let sessionLoginType = 'mac'

    const DEFAULT_QR_HINT =
      '请先输入管理后台的token，然后点击“获取二维码”。二维码生成后会自动开始轮询检查登录状态。'

    function getLoginFlowAppId() {
      return String(pendingLoginAppId || '').trim()
    }

    function getActiveLoginAppId() {
      return String(C.state.appId || '').trim() || getLoginFlowAppId()
    }

    function stopPolling(reason) {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
      setPollUi(false, reason || '未在轮询')
    }

    function setPollUi(active, text) {
      const el = C.$('poll-status')
      if (el) {
        el.textContent = text || (active ? '正在轮询检查登录状态…' : '未在轮询')
        el.classList.toggle('polling', !!active)
      }
      const cnt = C.$('poll-count')
      if (cnt) cnt.textContent = active ? `已请求次数：${pollCount}` : ''
    }

    function setQrHint(html) {
      const el = C.$('login-qr-hint')
      if (!el) return
      el.innerHTML = html || DEFAULT_QR_HINT
    }

    function escapeHtml(v) {
      return String(v || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }

    function resolveQrSrc(raw) {
      const v = String(raw || '').trim()
      if (!v) return ''
      if (v.startsWith('data:')) return v
      if (/^https?:\/\//i.test(v)) return v
      return 'data:image/png;base64,' + v
    }

    function renderQrImage(imgEl, emptyEl, rawSource, emptyText) {
      if (!imgEl || !emptyEl) return
      const src = resolveQrSrc(rawSource)
      if (!src) {
        imgEl.removeAttribute('src')
        imgEl.hidden = true
        emptyEl.hidden = false
        emptyEl.textContent = emptyText || '等待生成二维码...'
        return
      }
      imgEl.src = src
      imgEl.hidden = false
      imgEl.referrerPolicy = 'no-referrer'
      emptyEl.hidden = true
    }

    function showErrorBanner(msg) {
      const b = C.$('login-error-banner')
      if (!b) return
      b.textContent = msg
      b.classList.add('visible')
    }

    function hideErrorBanner() {
      const b = C.$('login-error-banner')
      if (!b) return
      b.textContent = ''
      b.classList.remove('visible')
    }

    function isLoginSuccessBlockVisible() {
      const block = C.$('login-success-block')
      return !!(block && block.classList.contains('visible'))
    }

    /** 右侧已展示登录成功信息时，锁定左侧取码表单（与文档「不允许再次取码」一致） */
    function syncLoginCaptureFormDisabled() {
      const locked = isLoginSuccessBlockVisible()
        ;['btn-get-qrcode', 'btn-stop-poll', 'login-form-appid', 'login-proxy', 'login-region'].forEach((id) => {
          const el = C.$(id)
          if (el) el.disabled = locked
        })
      document.querySelectorAll('input[name="login-type"]').forEach((r) => {
        r.disabled = locked
      })
    }

    function updateAutoSlidingHint() {
      const typeInput = document.querySelector('input[name="login-type"]:checked')
      const isIpad = typeInput?.value === 'ipad'
      const el = C.$('login-autosliding-value')
      if (el) el.textContent = isIpad ? 'false' : 'true'
    }

    function setLoginRightWaiting() {
      const w = C.$('login-right-waiting')
      const s = C.$('login-success-block')
      if (w) w.classList.remove('hidden')
      if (s) s.classList.remove('visible')
      const nickEl = C.$('login-profile-nick')
      const appEl = C.$('login-success-appid')
      const wxidEl = C.$('login-profile-wxid')
      const avatarEl = C.$('login-profile-avatar')
      if (nickEl) nickEl.textContent = '—'
      if (appEl) appEl.textContent = 'appid: —'
      if (wxidEl) wxidEl.textContent = 'wxid: —'
      if (avatarEl) {
        avatarEl.src = ''
        avatarEl.hidden = true
      }
      syncLoginCaptureFormDisabled()
    }

    function persistLoginSnapshot(info) {
      try {
        localStorage.setItem(
          LOGIN_SNAPSHOT_KEY,
          JSON.stringify({
            wxid: info.wxid || '',
            nickName: info.nickName || info.alias || '',
            alias: info.alias || '',
            headImgUrl: info.headImgUrl || '',
          }),
        )
      } catch {
        /* ignore */
      }
    }

    function loadLoginSnapshot() {
      try {
        const raw = localStorage.getItem(LOGIN_SNAPSHOT_KEY)
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    }

    function clearLoginSnapshot() {
      try {
        localStorage.removeItem(LOGIN_SNAPSHOT_KEY)
      } catch {
        /* ignore */
      }
    }

    /**
     * 刷新/重新打开页面后：仅有 appId 时右侧默认仍是「等待登录」。
     * 若有本地快照则先展示；再调 /personal/getProfile 拉在线资料更新卡片（与个人信息模块同源数据）。
     */
    async function restoreLoginUiIfNeeded() {
      if (!C.state.appId?.trim()) {
        return
      }

      const snap = loadLoginSnapshot()
      if (snap && (snap.wxid || snap.nickName)) {
        showLoggedIn(snap, { skipPersist: true })
      }

      try {
        const res = await C.apiPost('/personal/getProfile', { proxyIp: '' })
        const body = res?.data
        if (body?.ret !== 200 || !body.data) {
          return
        }
        const d = body.data
        showLoggedIn({
          wxid: d.wxid,
          nickName: d.nickName,
          alias: d.alias,
          headImgUrl: d.bigHeadImgUrl || d.smallHeadImgUrl,
        })
      } catch {
        /* Token 未配、离线等：保留快照展示，不弹窗打扰 */
      }
      syncLoginCaptureFormDisabled()
    }

    function resetLoggedOutUi() {
      stopPolling('已停止')
      closeVerifyModal()
      hideErrorBanner()
      pollCount = 0
      pendingLoginAppId = ''

      renderQrImage(C.$('qr-img'), C.$('qr-empty'), '', '等待生成二维码...')
      setQrHint(DEFAULT_QR_HINT)

      setLoginRightWaiting()
      clearLoginSnapshot()

      C.state.appId = ''
      C.state.uuid = ''
      C.state.loginNickName = ''
      C.saveState()
      syncHeaderAppId()
      notifyHeaderSync()
      const formApp = C.$('login-form-appid')
      if (formApp) formApp.value = ''
      syncLoginCaptureFormDisabled()
    }

    function syncHeaderAppId() {
      const tag = C.$('app-id-display')
      if (tag) {
        const v = (C.state.appId || '').trim()
        tag.textContent = v || '未设置'
      }
    }

    function notifyHeaderSync() {
      window.dispatchEvent(new CustomEvent('wechat-console:state-changed'))
    }

    function appendLoginApiLog(path, responseJson, requestBody, errorMessage) {
      const box = C.$('login-api-log-body')
      if (!box) return
      const entry = document.createElement('div')
      entry.className = 'profile-log-entry'
      entry.textContent = C.formatApiCallText({
        path,
        requestBody: C.getMergedRequestBody(requestBody ?? {}),
        responseBody: errorMessage ? undefined : responseJson,
        error: errorMessage,
      })
      box.appendChild(entry)
      box.scrollTop = box.scrollHeight
    }

    function appendLoginStatusLog(title, data) {
      const box = C.$('login-runtime-log-body')
      if (!box) return
      const entry = document.createElement('div')
      entry.className = 'profile-log-entry'
      const time = new Date().toLocaleString('zh-CN', { hour12: false })
      let text = `调用时间：${time}\n\n${title}`
      if (data !== undefined) {
        text += '\n\n详情：\n'
        try {
          text += JSON.stringify(data, null, 2)
        } catch {
          text += String(data)
        }
      }
      entry.textContent = text
      box.appendChild(entry)
      box.scrollTop = box.scrollHeight
    }

    function formatLoginEnvelopeSummary(env) {
      const body = env && typeof env === 'object' ? env : {}
      const ret =
        body && Object.prototype.hasOwnProperty.call(body, 'ret') ? body.ret : '—'
      const msg =
        body && body.msg != null && String(body.msg).trim()
          ? String(body.msg).trim()
          : '（空）'
      let dataText = '（无 data 字段）'
      if (body && Object.prototype.hasOwnProperty.call(body, 'data')) {
        try {
          dataText =
            typeof body.data === 'string' ? body.data : JSON.stringify(body.data, null, 2)
        } catch {
          dataText = String(body.data)
        }
        if (!dataText) dataText = '（空）'
      }
      return `ret: ${ret}\nmsg: ${msg}\ndata:\n${dataText}`
    }

    function openVerifyModal(rawSource) {
      const ov = C.$('login-verify-overlay')
      const img = C.$('login-verify-qr')
      const empty = C.$('login-verify-empty')
      if (!ov || !img || !empty) return
      renderQrImage(img, empty, rawSource, '等待验证二维码...')
      ov.setAttribute('aria-hidden', 'false')
      ov.classList.add('show')
    }

    function closeVerifyModal() {
      const ov = C.$('login-verify-overlay')
      const img = C.$('login-verify-qr')
      const empty = C.$('login-verify-empty')
      if (ov) {
        ov.classList.remove('show')
        ov.setAttribute('aria-hidden', 'true')
      }
      if (img && empty) {
        renderQrImage(img, empty, '', '等待验证二维码...')
      }
    }

    /**
     * @param {object} loginInfo - 与 checkLogin 返回的 loginInfo 或 getProfile 映射后的字段一致
     * @param {{ skipPersist?: boolean }} [opts] - 从快照预填时跳过写回，避免无意义循环
     */
    function showLoggedIn(loginInfo, opts) {
      const w = C.$('login-right-waiting')
      const block = C.$('login-success-block')
      if (w) w.classList.add('hidden')
      if (block) block.classList.add('visible')

      const resolvedAppId = getActiveLoginAppId()
      if (resolvedAppId && String(C.state.appId || '').trim() !== resolvedAppId) {
        C.state.appId = resolvedAppId
      }
      pendingLoginAppId = ''
      const appIdVal = (C.state.appId || '').trim() || '—'
      const appEl = C.$('login-success-appid')
      if (appEl) appEl.textContent = `appid: ${appIdVal}`

      const nick =
        loginInfo.nickName || loginInfo.alias || C.$('login-profile-nick')?.textContent || ''
      const wxid = loginInfo.wxid || ''
      const head = loginInfo.headImgUrl || ''

      const elNick = C.$('login-profile-nick')
      const elWxid = C.$('login-profile-wxid')
      const elImg = C.$('login-profile-avatar')
      if (elNick) elNick.textContent = nick
      if (elWxid) elWxid.textContent = wxid ? `wxid: ${wxid}` : 'wxid: —'
      if (elImg) {
        elImg.src = head || ''
        elImg.hidden = !head
      }

      C.state.loginNickName = String(nick || '').trim()
      C.saveState()
      syncHeaderAppId()

      if (!opts?.skipPersist) {
        persistLoginSnapshot({
          wxid,
          nickName: loginInfo.nickName || nick,
          alias: loginInfo.alias,
          headImgUrl: head,
        })
      }
      notifyHeaderSync()
      syncLoginCaptureFormDisabled()
    }

    /** 接口返回的 loginInfo 非空且有实质字段即视为登录完成（不依赖 status 是否为 2） */
    function loginInfoHasData(info) {
      if (info == null || typeof info !== 'object' || Array.isArray(info)) return false
      if (Object.keys(info).length === 0) return false
      return Object.values(info).some((v) => {
        if (v == null) return false
        if (typeof v === 'string') return v.trim() !== ''
        if (typeof v === 'number' || typeof v === 'boolean') return true
        if (typeof v === 'object') return Object.keys(v).length > 0
        return false
      })
    }

    async function pollCheckLogin() {
      if (Date.now() - qrFetchedAt > QR_TTL_MS) {
        stopPolling('已停止')
        showErrorBanner('二维码已超时（约 120 秒），请重新获取二维码。')
        C.showToast('轮询已停止：二维码超时', 'error')
        return
      }

      const flowAppId = getActiveLoginAppId()
      if (!flowAppId || !String(C.state.uuid || '').trim()) {
        setPollUi(false, '等待二维码初始化完成…')
        return
      }

      pollCount += 1
      setPollUi(true, '正在轮询检查登录状态…')

      const autoSliding = sessionLoginType === 'mac'
      const requestBody = {
        appId: flowAppId,
        uuid: C.state.uuid,
        autoSliding,
      }

      let res
      try {
        res = await C.apiPost('/login/checkLogin', requestBody)
        appendLoginApiLog('/login/checkLogin', res?.data, requestBody)
      } catch (e) {
        stopPolling('已停止')
        const msg = e?.message || '网络异常或请求失败'
        appendLoginApiLog('/login/checkLogin', undefined, requestBody, msg)
        showErrorBanner(msg)
        C.showToast(msg, 'error')
        return
      }

      const body = res?.data
      if (!body || typeof body !== 'object') {
        setPollUi(true, '轮询中… 响应格式异常，将继续请求')
        return
      }
      if (body.ret !== 200) {
        setPollUi(
          true,
          `轮询中… 本次 ret=${body.ret} ${body.msg || ''}，将继续请求直至 loginInfo 有数据`,
        )
        return
      }

      const data = body.data
      if (data == null || typeof data !== 'object') {
        setPollUi(true, '轮询中… data 为空，将继续请求')
        return
      }

      const status = data.status
      const loginInfo = data.loginInfo

      if (status === 4) {
        stopPolling('已停止')
        showErrorBanner('已取消登录（status=4），请重新取码。')
        C.showToast('用户已取消登录', 'error')
        return
      }

      if (sessionLoginType === 'ipad' && data.url) {
        stopPolling('等待新设备验证')
        openVerifyModal(data.url)
        setPollUi(false, '检测到新设备验证，请完成安盾操作后继续检查')
        appendLoginStatusLog('触发 iPad 二次验证', {
          verifyUrl: data.url,
          appId: flowAppId,
          uuid: C.state.uuid,
        })
        C.showToast('检测到新设备验证，请先在安盾 APP 完成操作', 'info')
        return
      }

      if (loginInfoHasData(loginInfo)) {
        stopPolling('登录成功')
        hideErrorBanner()
        closeVerifyModal()
        C.showToast('登录成功', 'success')
        if (data.headImgUrl && !loginInfo.headImgUrl) {
          loginInfo.headImgUrl = data.headImgUrl
        }
        showLoggedIn(loginInfo)
        return
      }

      setPollUi(
        true,
        `轮询中… 等待 loginInfo（当前 status=${status ?? '?'}，loginInfo=${loginInfo == null ? '无' : '空或无有效字段'}）`,
      )
    }

    function startPolling() {
      stopPolling()
      pollCount = 0
      qrFetchedAt = Date.now()
      pollTimer = setInterval(pollCheckLogin, POLL_MS)
      pollCheckLogin()
    }

    async function onGetQrCode() {
      hideErrorBanner()
      stopPolling('已停止')
      closeVerifyModal()
      setLoginRightWaiting()
      pendingLoginAppId = ''

      const token = (C.state.token || C.$('input-token')?.value || '').trim()
      if (!token) {
        C.showModal('提示', '请输入管理后台的token')
        return
      }

      const appIdInput = (C.$('login-form-appid')?.value || '').trim()
      const proxyIp = (C.$('login-proxy')?.value || '').trim()
      const regionId = (C.$('login-region')?.value || '').trim()
      const typeInput = document.querySelector('input[name="login-type"]:checked')
      const loginType = typeInput?.value === 'ipad' ? 'ipad' : 'mac'

      if (!regionId) {
        C.showToast('请选择地区 regionId', 'error')
        return
      }

      sessionLoginType = loginType

      const qrBody = {
        appId: appIdInput,
        proxyIp,
        regionId,
        type: loginType,
      }

      const btn = C.$('btn-get-qrcode')
      if (btn) btn.disabled = true
      try {
        const res = await C.apiPost('/login/getLoginQrCode', qrBody)
        appendLoginApiLog('/login/getLoginQrCode', res?.data, qrBody)
        const data = C.assertApiOk(res)
        const qrSource = data?.qrUrl || data?.qrImgBase64 || data?.qrCode
        if (!qrSource) throw new Error('响应缺少二维码地址或图片数据')

        renderQrImage(C.$('qr-img'), C.$('qr-empty'), qrSource, '等待生成二维码...')

        pendingLoginAppId = data?.appId != null ? String(data.appId || '').trim() : appIdInput
        C.state.uuid = data?.uuid != null ? String(data.uuid || '').trim() : ''
        C.saveState()
        notifyHeaderSync()

        const formApp = C.$('login-form-appid')
        if (formApp && pendingLoginAppId) formApp.value = pendingLoginAppId

        setQrHint(
          `请使用微信扫码<br />appId: ${escapeHtml(pendingLoginAppId || '(空)')}<br />uuid: ${escapeHtml(C.state.uuid || '(空)')}`,
        )
        appendLoginStatusLog('二维码获取成功', {
          appId: pendingLoginAppId,
          uuid: C.state.uuid,
          source: data?.qrUrl ? 'qrUrl' : data?.qrImgBase64 ? 'qrImgBase64' : 'qrCode',
        })
        setLoginRightWaiting()

        C.showToast('已获取二维码，开始轮询登录状态', 'success')
        startPolling()
      } catch (e) {
        appendLoginApiLog('/login/getLoginQrCode', undefined, qrBody, e?.message || String(e))
        const msg = e?.message || '获取二维码失败'
        showErrorBanner(msg)
        C.showToast(msg, 'error')
      } finally {
        syncLoginCaptureFormDisabled()
      }
    }

    async function onCheckOnline() {
      if (!C.state.appId?.trim()) {
        C.showModal('检查在线', '请先登录或填写有效 appId')
        return
      }
      try {
        const res = await C.apiPost('/login/checkOnline', {})
        appendLoginApiLog('/login/checkOnline', res?.data, {})
        appendLoginStatusLog('检查在线结果', res?.data)
        const data = C.assertApiOk(res)
        const online = data === true
        C.showModal('检查在线', online ? '当前账号在线（data=true）' : '当前账号离线（data≠true）')
      } catch (e) {
        appendLoginApiLog('/login/checkOnline', undefined, {}, e?.message || String(e))
        appendLoginStatusLog('检查在线异常', { error: e?.message || String(e) })
        C.showModal('检查在线失败', e?.message || '请求异常')
      }
    }

    /**
     * 打开自定义弹层输入 appId；确定返回 trim 后字符串，取消返回 null。
     * @param {string} initialValue
     * @returns {Promise<string | null>}
     */
    function openReuseAppIdDialog(initialValue) {
      return new Promise((resolve) => {
        const ov = C.$('reuse-appid-overlay')
        const input = C.$('reuse-appid-input')
        const btnOk = C.$('reuse-appid-confirm')
        const btnCancel = C.$('reuse-appid-cancel')
        if (!ov || !input || !btnOk || !btnCancel) {
          resolve(null)
          return
        }

        input.value = initialValue || ''

        function cleanup(result) {
          btnOk.removeEventListener('click', onOk)
          btnCancel.removeEventListener('click', onCancel)
          ov.removeEventListener('click', onOverlay)
          document.removeEventListener('keydown', onEscape)
          input.removeEventListener('keydown', onEnter)
          ov.classList.remove('show')
          ov.setAttribute('aria-hidden', 'true')
          resolve(result)
        }

        function onOk() {
          cleanup(String(input.value || '').trim())
        }

        function onCancel() {
          cleanup(null)
        }

        function onOverlay(e) {
          if (e.target === ov) cleanup(null)
        }

        function onEscape(e) {
          if (e.key === 'Escape') cleanup(null)
        }

        function onEnter(e) {
          if (e.key === 'Enter') {
            e.preventDefault()
            onOk()
          }
        }

        btnOk.addEventListener('click', onOk)
        btnCancel.addEventListener('click', onCancel)
        ov.addEventListener('click', onOverlay)
        document.addEventListener('keydown', onEscape)
        input.addEventListener('keydown', onEnter)

        ov.setAttribute('aria-hidden', 'false')
        ov.classList.add('show')
        requestAnimationFrame(() => {
          input.focus()
          input.select()
        })
      })
    }

    /**
     * 顶栏「复用现有 APPID」：先检查在线，通过则写入全局 state，各模块 apiPost 自动合并该 appId。
     */
    async function onReuseExistingAppId() {
      const token = (C.state.token || C.$('input-token')?.value || '').trim()
      if (!token) {
        C.showModal('提示', '请输入管理后台的token')
        return
      }
      const hint = (C.state.appId || '').trim()
      const id = await openReuseAppIdDialog(hint)
      if (id == null) return
      if (!id) {
        C.showToast('未填写 appId', 'error')
        return
      }

      const prevAppId = C.state.appId
      const prevUuid = C.state.uuid
      C.state.appId = id
      C.state.uuid = ''

      try {
        const res = await C.apiPost('/login/checkOnline', {})
        appendLoginApiLog('/login/checkOnline（复用 appId）', res?.data, { appId: id })
        const data = C.assertApiOk(res)
        const online = data === true
        if (!online) {
          C.state.appId = prevAppId
          C.state.uuid = prevUuid
          pendingLoginAppId = ''
          C.saveState()
          syncHeaderAppId()
          notifyHeaderSync()
          C.showModal(
            '未能复用',
            '该 appId 当前不在线（接口 data≠true），未写入本地，请确认设备已在后台登录。',
          )
          return
        }

        if ((prevAppId || '').trim() !== id) {
          clearLoginSnapshot()
        }

        pendingLoginAppId = ''
        C.saveState()
        syncHeaderAppId()
        notifyHeaderSync()
        const formApp = C.$('login-form-appid')
        if (formApp) formApp.value = id
        hideErrorBanner()
        stopPolling('已停止')
        C.showToast('已复用 appId，各模块将使用该设备', 'success')
        void restoreLoginUiIfNeeded()
        syncLoginCaptureFormDisabled()
      } catch (e) {
        C.state.appId = prevAppId
        C.state.uuid = prevUuid
        pendingLoginAppId = ''
        C.saveState()
        syncHeaderAppId()
        notifyHeaderSync()
        appendLoginApiLog(
          '/login/checkOnline（复用 appId）',
          undefined,
          { appId: id },
          e?.message || String(e),
        )
        C.showModal('复用失败', e?.message || '请求异常')
      }
    }

    async function onReconnection() {
      if (!C.state.appId?.trim()) {
        C.showModal('异常断线重连', '缺少 appId')
        return
      }
      try {
        const res = await C.apiPost('/login/reconnection', {})
        const env = res?.data ?? {}
        appendLoginApiLog('/login/reconnection', env, {})
        appendLoginStatusLog('异常断线重连结果', env)
        if (env?.ret === 200) {
          hideErrorBanner()
          const lead =
            env?.data === true
              ? '操作成功（data=true）'
              : env?.msg
                ? `接口返回：${env.msg}`
                : '接口已返回成功结果'
          C.showModal('异常断线重连', `${lead}\n\n${formatLoginEnvelopeSummary(env)}`)
        } else {
          const failMsg = env?.msg || '接口返回失败'
          showErrorBanner(failMsg)
          C.showModal('异常断线重连失败', formatLoginEnvelopeSummary(env))
        }
      } catch (e) {
        const msg = e?.message || String(e)
        appendLoginApiLog('/login/reconnection', undefined, {}, msg)
        appendLoginStatusLog('异常断线重连异常', { error: msg })
        showErrorBanner(msg)
        C.showModal('异常断线重连失败', msg)
      }
    }

    async function onLogout() {
      appendLoginStatusLog('触发退出登录确认', {
        action: '复用右上角清理缓存并退出微信流程',
      })
      const headerClearBtn = C.$('btn-header-clear-cache')
      if (!headerClearBtn) {
        C.showModal('退出登录', '未找到清理缓存入口，无法继续')
        return
      }
      headerClearBtn.click()
    }

    function bind() {
      document.querySelectorAll('input[name="login-type"]').forEach((r) => {
        r.addEventListener('change', updateAutoSlidingHint)
      })
      C.$('btn-get-qrcode')?.addEventListener('click', onGetQrCode)
      C.$('btn-stop-poll')?.addEventListener('click', () => {
        stopPolling('用户点击停止轮询')
        appendLoginStatusLog('轮询已停止', { reason: '用户点击停止轮询' })
      })
      C.$('btn-login-clear-log')?.addEventListener('click', () => {
        const box = C.$('login-api-log-body')
        if (!box) return
        box.innerHTML = ''
      })
      C.$('btn-login-runtime-clear')?.addEventListener('click', () => {
        const box = C.$('login-runtime-log-body')
        if (!box) return
        box.innerHTML = ''
        appendLoginStatusLog('实时日志已清空', { by: 'user' })
      })
      C.$('btn-login-verify-continue')?.addEventListener('click', () => {
        closeVerifyModal()
        appendLoginStatusLog('用户确认已完成安盾验证', {
          action: '弹出手机确认提示并恢复轮询',
        })
        C.showModal('继续登录', '请在手机上确认登录，然后关掉即可')
        startPolling()
      })
      C.$('btn-check-online')?.addEventListener('click', onCheckOnline)
      C.$('btn-header-reuse-appid')?.addEventListener('click', () => void onReuseExistingAppId())
      C.$('btn-reconnection')?.addEventListener('click', onReconnection)
      C.$('btn-logout')?.addEventListener('click', onLogout)
      C.$('modal-ok')?.addEventListener('click', C.hideModal)
      C.$('modal-overlay')?.addEventListener('click', function (ev) {
        if (ev.target === C.$('modal-overlay')) C.hideModal()
      })
    }

    function init() {
      bind()
      updateAutoSlidingHint()
      syncHeaderAppId()
      setQrHint(DEFAULT_QR_HINT)
      const formApp = C.$('login-form-appid')
      if (formApp && C.state.appId && !formApp.value.trim()) {
        formApp.value = C.state.appId
      }

      void restoreLoginUiIfNeeded()

      syncLoginCaptureFormDisabled()

      window.addEventListener('hashchange', function () {
        if (location.hash === '#login') {
          void restoreLoginUiIfNeeded()
        }
      })
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  /* ---------- profile-module：个人资料与隐私 ---------- */
  /**
   * 个人信息管理模块（布局与交互参考登录模块的左右分栏）
   *
   * 说明：
   * - 本页不引入 axios / Element Plus，与当前仓库「纯静态 web」技术栈一致；
   * - 网络层统一走 WechatConsoleCore.apiPost，等价于 axios.post：自动带 VideosApi-token，
   *   且在 body 未手写 appId 时自动合并 Pinia 式全局 state.appId（见 core.js mergeAppId）。
   */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) {
      console.error('profile-module.js 需在 core.js 之后加载')
      return
    }

    /** @type {object | null} 最近一次 getProfile 返回的 data 对象，用于回填等 */
    let lastProfileData = null
    const PROFILE_SNAPSHOT_KEY = 'wechat-console:profile-snapshot'

    /**
     * 是否已在「本次页面生命周期内」对个人页做过首次自动拉取（避免来回切换菜单疯狂打接口）
     */
    let profileAutoFetchedAppId = ''
    const PROFILE_AUTO_FETCH_SESSION_KEY = 'wechat-console:profile-auto-fetched-appid'
    /**
     * 将一次调用追加到右侧黑色日志区：调用时间、路径、合并后的请求体、响应体或异常
     * @param {string} path - 如 /personal/getProfile
     * @param {object} [responseJson] - res.data；失败且无响应时可省略
     * @param {object} [requestBody] - 调用 apiPost 的 body（展示时会合并 appId）
     * @param {string} [errorMessage] - 有值时表示异常，不写响应体
     */
    function appendResponseLog(path, responseJson, requestBody, errorMessage) {
      const box = C.$('profile-log-body')
      if (!box) return

      const entry = document.createElement('div')
      entry.className = 'profile-log-entry'
      entry.textContent = C.formatApiCallText({
        path,
        requestBody: C.getMergedRequestBody(requestBody ?? {}),
        responseBody: errorMessage ? undefined : responseJson,
        error: errorMessage,
      })
      box.appendChild(entry)
      box.scrollTop = box.scrollHeight
    }

    /**
     * 按钮 Loading：禁用并显示「处理中…」（等同 Element Plus 的 :loading）
     * @param {HTMLButtonElement | null} btn
     * @param {boolean} loading
     * @param {string} [doneLabel] 恢复时的文案
     */
    function setButtonLoading(btn, loading, doneLabel) {
      if (!btn) return
      if (loading) {
        if (!btn.dataset._origLabel) btn.dataset._origLabel = btn.textContent
        btn.disabled = true
        btn.textContent = '处理中…'
      } else {
        btn.disabled = false
        btn.textContent = doneLabel || btn.dataset._origLabel || btn.textContent
      }
    }

    /**
     * 用 getProfile 的 data 刷新右侧卡片，并把表单预填方便继续编辑
     * @param {object} data - 接口 data 字段（个人信息对象）
     */
    function renderProfileCard(data) {
      lastProfileData = data

      const empty = C.$('profile-card-empty')
      const body = C.$('profile-card-body')
      if (data && typeof data === 'object') {
        persistProfileSnapshot(String(C.state.appId || '').trim(), data)
        if (empty) empty.hidden = true
        if (body) body.hidden = false

        const avatar = data.bigHeadImgUrl || data.smallHeadImgUrl || ''
        const img = C.$('pf-card-avatar')
        if (img) {
          if (avatar) {
            img.src = avatar
            img.hidden = false
          } else {
            img.removeAttribute('src')
            img.hidden = true
          }
        }

        const nick = data.nickName ?? '—'
        const wxid = data.wxid ? `微信 ID：${data.wxid}` : '—'
        const alias = data.alias ? `微信号：${data.alias}` : '微信号：—'

        const elNick = C.$('pf-card-nick')
        const elWxid = C.$('pf-card-wxid')
        const elAlias = C.$('pf-card-alias')
        if (elNick) elNick.textContent = nick
        if (elWxid) elWxid.textContent = wxid
        if (elAlias) elAlias.textContent = alias

        const region = [data.country, data.province, data.city].filter(Boolean).join(' / ') || '—'
        const sig = data.signature != null && data.signature !== '' ? data.signature : '—'
        const mobile = data.mobile ?? '—'

        const rEl = C.$('pf-card-region')
        const sEl = C.$('pf-card-signature')
        const mEl = C.$('pf-card-mobile')
        if (rEl) rEl.textContent = region
        if (sEl) sEl.textContent = sig
        if (mEl) mEl.textContent = mobile

        // 表单回填（性别：接口为数字 1/2，对应下拉的 value）
        const nickIn = C.$('pf-nickName')
        const countryIn = C.$('pf-country')
        const provIn = C.$('pf-province')
        const cityIn = C.$('pf-city')
        const sigIn = C.$('pf-signature')
        const sexSel = C.$('pf-sex')
        if (nickIn) nickIn.value = data.nickName ?? ''
        if (countryIn) countryIn.value = data.country ?? ''
        if (provIn) provIn.value = data.province ?? ''
        if (cityIn) cityIn.value = data.city ?? ''
        if (sigIn) sigIn.value = data.signature ?? ''
        if (sexSel && data.sex != null) {
          sexSel.value = String(data.sex)
        }
      } else {
        clearProfileSnapshot()
        if (empty) empty.hidden = false
        if (body) body.hidden = true
      }
    }

    function persistProfileSnapshot(appId, data) {
      if (!appId || !data || typeof data !== 'object') return
      try {
        localStorage.setItem(
          PROFILE_SNAPSHOT_KEY,
          JSON.stringify({
            appId,
            data,
          }),
        )
      } catch {
        /* ignore */
      }
    }

    function loadProfileSnapshot() {
      try {
        const raw = localStorage.getItem(PROFILE_SNAPSHOT_KEY)
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    }

    function clearProfileSnapshot() {
      try {
        localStorage.removeItem(PROFILE_SNAPSHOT_KEY)
      } catch {
        /* ignore */
      }
    }

    /**
     * 获取个人资料：POST /personal/getProfile
     * Body：proxyIp 文档示例可为空串；appId 由全局注入
     */
    async function fetchProfile() {
      if (!C.state.appId?.trim()) {
        C.showToast('请先在登录流程中获取 appId 或于顶栏状态中有 appId', 'error')
        appendResponseLog(
          '/personal/getProfile',
          { ret: -1, msg: '缺少 appId，已取消请求' },
          { proxyIp: '' },
        )
        return
      }

      const btn = C.$('btn-profile-fetch')
      setButtonLoading(btn, true)

      try {
        const res = await C.apiPost('/personal/getProfile', { proxyIp: '' })
        // res.data 即服务端返回的完整 JSON：{ ret, msg, data }
        appendResponseLog('/personal/getProfile', res.data, { proxyIp: '' })

        const { ret, msg, data } = res.data || {}
        if (ret === 200 && data) {
          renderProfileCard(data)
          C.showToast('已更新个人资料展示', 'success')
        } else {
          C.showToast(msg || `获取失败 ret=${ret}`, 'error')
        }
      } catch (e) {
        appendResponseLog('/personal/getProfile', undefined, { proxyIp: '' }, e?.message || String(e))
        C.showToast(e?.message || '网络或解析错误', 'error')
      } finally {
        setButtonLoading(btn, false, '获取个人资料')
      }
    }

    /**
     * 修改个人资料：POST /personal/updateProfile
     * 文档说明可只传需要修改的字段；此处按表单提交非空项 + 文本类允许空串（签名等）
     * 性别 sex：下拉值为字符串 '1'|'2'，提交时转为数字 1 / 2
     */
    async function submitUpdateProfile() {
      if (!C.state.appId?.trim()) {
        C.showToast('缺少 appId', 'error')
        return
      }

      const btn = C.$('btn-profile-submit')
      setButtonLoading(btn, true)

      const updateBody = {
        nickName: (C.$('pf-nickName')?.value ?? '').trim(),
        country: (C.$('pf-country')?.value ?? '').trim(),
        province: (C.$('pf-province')?.value ?? '').trim(),
        city: (C.$('pf-city')?.value ?? '').trim(),
        signature: (C.$('pf-signature')?.value ?? '').trim(),
      }
      const sexVal = C.$('pf-sex')?.value ?? ''
      if (sexVal !== '') {
        updateBody.sex = Number(sexVal)
      }

      try {
        const res = await C.apiPost('/personal/updateProfile', updateBody)
        appendResponseLog('/personal/updateProfile', res.data, updateBody)

        const { ret, msg } = res.data || {}
        if (ret === 200) {
          C.showToast('资料已提交，正在重新拉取…', 'success')
          await fetchProfile()
        } else {
          C.showToast(msg || `修改失败 ret=${ret}`, 'error')
        }
      } catch (e) {
        appendResponseLog('/personal/updateProfile', undefined, updateBody, e?.message || String(e))
        C.showToast(e?.message || '请求失败', 'error')
      } finally {
        setButtonLoading(btn, false, '提交修改')
      }
    }

    /**
     * 获取自己的二维码：POST /personal/getQrCode
     * 返回 data.qrCode 为 Base64，可能带或不带 data:image 前缀
     */
    async function fetchMyQrCode() {
      if (!C.state.appId?.trim()) {
        C.showToast('缺少 appId', 'error')
        return
      }

      const btn = C.$('btn-profile-qrcode')
      setButtonLoading(btn, true)

      try {
        const res = await C.apiPost('/personal/getQrCode', { proxyIp: '' })
        appendResponseLog('/personal/getQrCode', res.data, { proxyIp: '' })

        const { ret, msg, data } = res.data || {}
        if (ret !== 200 || !data?.qrCode) {
          C.showToast(msg || '未返回 qrCode', 'error')
          const wrap = C.$('pf-qrcode-wrap')
          if (wrap) wrap.hidden = true
          return
        }

        let src = data.qrCode
        if (!src.startsWith('data:')) {
          src = 'data:image/jpeg;base64,' + src
        }
        const img = C.$('pf-qrcode-img')
        const wrap = C.$('pf-qrcode-wrap')
        if (img) {
          img.src = src
          img.hidden = false
        }
        if (wrap) wrap.hidden = false
        C.showToast('已获取二维码', 'success')
      } catch (e) {
        appendResponseLog('/personal/getQrCode', undefined, { proxyIp: '' }, e?.message || String(e))
        C.showToast(e?.message || '请求失败', 'error')
      } finally {
        setButtonLoading(btn, false, '获取自己的二维码')
      }
    }

    /**
     * 获取设备记录：POST /personal/getSafetyInfo
     * data.list[]：uuid, deviceName, deviceType, lastTime（时间戳）
     */
    async function fetchSafetyInfo() {
      if (!C.state.appId?.trim()) {
        C.showToast('缺少 appId', 'error')
        return
      }

      const btn = C.$('btn-profile-safety')
      setButtonLoading(btn, true)

      try {
        const res = await C.apiPost('/personal/getSafetyInfo', { proxyIp: '' })
        appendResponseLog('/personal/getSafetyInfo', res.data, { proxyIp: '' })

        const { ret, msg, data } = res.data || {}
        const tbody = C.$('pf-safety-tbody')
        const tableWrap = C.$('pf-safety-table-wrap')

        if (ret !== 200 || !Array.isArray(data?.list)) {
          if (tbody) tbody.innerHTML = ''
          if (tableWrap) tableWrap.hidden = true
          C.showToast(msg || '无设备列表数据', 'error')
          return
        }

        if (tbody) {
          tbody.innerHTML = data.list
            .map((row) => {
              const t =
                row.lastTime != null
                  ? new Date(
                    typeof row.lastTime === 'number' && row.lastTime < 1e12
                      ? row.lastTime * 1000
                      : row.lastTime,
                  ).toLocaleString()
                  : '—'
              const deviceName = escapeHtml(String(row.deviceName ?? ''))
              const deviceType = escapeHtml(String(row.deviceType ?? ''))
              const uuid = escapeHtml(String(row.uuid ?? ''))
              return `<article class="pf-safety-item">
              <div class="pf-safety-item-head">
                <strong class="pf-safety-device-name">${deviceName || '—'}</strong>
                <span class="pf-safety-device-type">${deviceType || '—'}</span>
              </div>
              <div class="pf-safety-item-meta">
                <span class="pf-safety-time">${escapeHtml(t)}</span>
                <span class="pf-safety-uuid" title="${uuid}">${uuid || '—'}</span>
              </div>
            </article>`
            })
            .join('')
        }
        if (tableWrap) tableWrap.hidden = data.list.length === 0
        C.showToast(`已加载 ${data.list.length} 条设备记录`, 'success')
      } catch (e) {
        appendResponseLog('/personal/getSafetyInfo', undefined, { proxyIp: '' }, e?.message || String(e))
        C.showToast(e?.message || '请求失败', 'error')
      } finally {
        setButtonLoading(btn, false, '获取设备记录')
      }
    }

    /** 简单 HTML 转义，防止设备名等污染表格 */
    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    /**
     * 隐私设置：POST /personal/privacySettings
     * body: option(整数), open(布尔)；appId 由全局注入
     */
    async function submitPrivacySettings() {
      if (!C.state.appId?.trim()) {
        C.showToast('缺少 appId', 'error')
        return
      }

      const btn = C.$('btn-profile-privacy')
      setButtonLoading(btn, true)

      const privacyBody = {
        option: parseInt(C.$('pf-privacy-option')?.value ?? '4', 10),
        open: !!C.$('pf-privacy-open')?.checked,
      }

      try {
        const res = await C.apiPost('/personal/privacySettings', privacyBody)
        appendResponseLog('/personal/privacySettings', res.data, privacyBody)

        const { ret, msg } = res.data || {}
        if (ret === 200) {
          C.showToast('隐私设置已提交', 'success')
        } else {
          C.showToast(msg || `失败 ret=${ret}`, 'error')
        }
      } catch (e) {
        appendResponseLog(
          '/personal/privacySettings',
          undefined,
          privacyBody,
          e?.message || String(e),
        )
        C.showToast(e?.message || '请求失败', 'error')
      } finally {
        setButtonLoading(btn, false, '提交隐私设置')
      }
    }

    /**
     * 修改头像：POST /personal/updateHeadImg
     * 携带 headImgUrl
     */
    async function submitUpdateHeadImg() {
      if (!C.state.appId?.trim()) {
        C.showToast('缺少 appId', 'error')
        return
      }

      const url = (C.$('pf-headImgUrl')?.value ?? '').trim()
      if (!url) {
        C.showToast('请填写 headImgUrl', 'error')
        return
      }

      const btn = C.$('btn-profile-avatar')
      setButtonLoading(btn, true)

      const headBody = {
        headImgUrl: url,
      }

      try {
        const res = await C.apiPost('/personal/updateHeadImg', headBody)
        appendResponseLog('/personal/updateHeadImg', res.data, headBody)

        const { ret, msg } = res.data || {}
        if (ret === 200) {
          C.showModal(
            '更换头像',
            '提交成功。请关闭手机微信进程并重新打开后查看最新头像（接口文档要求）。',
          )
          await fetchProfile()
        } else {
          C.showToast(msg || `失败 ret=${ret}`, 'error')
        }
      } catch (e) {
        appendResponseLog(
          '/personal/updateHeadImg',
          undefined,
          headBody,
          e?.message || String(e),
        )
        C.showToast(e?.message || '请求失败', 'error')
      } finally {
        setButtonLoading(btn, false, '提交更换头像')
      }
    }

    /**
     * 进入本页（hash 为 #profile-tags）时：若已有 appId，仅在首次进入时自动 getProfile（等同「进入模块即初始化」）
     * 再次进入请点「获取个人资料」手动刷新。
     */
    function onRouteProfile() {
      if (location.hash !== '#profile-tags') return
      if (!C.state.appId?.trim()) return
      const appId = C.state.appId.trim()
      if (!lastProfileData) {
        const snap = loadProfileSnapshot()
        if (snap?.appId === appId && snap.data && typeof snap.data === 'object') {
          renderProfileCard(snap.data)
        }
      }
      let fetchedAppId = ''
      try {
        fetchedAppId = sessionStorage.getItem(PROFILE_AUTO_FETCH_SESSION_KEY) || ''
      } catch {
        fetchedAppId = ''
      }
      if (profileAutoFetchedAppId === appId || fetchedAppId === appId) return
      profileAutoFetchedAppId = appId
      try {
        sessionStorage.setItem(PROFILE_AUTO_FETCH_SESSION_KEY, appId)
      } catch {
        /* ignore */
      }
      fetchProfile()
    }

    function init() {
      C.$('btn-profile-fetch')?.addEventListener('click', () => fetchProfile())
      C.$('btn-profile-qrcode')?.addEventListener('click', () => fetchMyQrCode())
      C.$('btn-profile-safety')?.addEventListener('click', () => fetchSafetyInfo())
      C.$('btn-profile-privacy')?.addEventListener('click', () => submitPrivacySettings())
      C.$('btn-profile-submit')?.addEventListener('click', () => submitUpdateProfile())
      C.$('btn-profile-avatar')?.addEventListener('click', () => submitUpdateHeadImg())

      window.addEventListener('hashchange', onRouteProfile)
      // 首次打开若直接带 #profile-tags 或默认进入后再切过来，由 hashchange 覆盖；此处补一次首屏
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        queueMicrotask(onRouteProfile)
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) return

    function $(id) {
      return C.$(id)
    }

    AMapLoader.load({
      key: "cd5e4d542aebdc44faa549c9494880c5", //申请好的Web端开发者key，调用 load 时必填
      version: "2.0", //指定要加载的 JS API 的版本，缺省时默认为 1.4.15
    })
      .then((AMap) => {
        //JS API 加载完成后获取AMap对象
        var map = new AMap.Map("map-search-list", {
          resizeEnable: true
        });
      })
      .catch((e) => {
        console.error(e); //加载错误提示
      });



    $('btn-map-search')?.addEventListener('click', async () => {
      const keyword = $('map-keyword')?.value?.trim() || ''
      const region = $('map-region-select')?.value?.trim() || ''
      const pageSize = parseInt($('map-page-size')?.value || '20', 10) || 20

      if (!keyword) {
        C.showToast('请输入搜索关键词', 'error')
        return
      }
      if (!region) {
        C.showToast('请选择搜索区域', 'error')
        return
      }

      const statsEl = document.getElementById('map-search-stats')
      const panel = document.getElementById('my-panel')
      
      if (statsEl) {
        statsEl.textContent = '搜索中...'
      }
      if (panel) {
        panel.innerHTML = '<div class="map-search-empty">搜索中，请稍候...</div>'
        panel.hidden = false
      }

      AMap.plugin("AMap.PlaceSearch", function () {
        var placeSearch = new AMap.PlaceSearch({
          city: region,
          pageSize: pageSize,
          pageIndex: 1
        });
        placeSearch.search(keyword, function (status, result) {
          if (statsEl) {
            statsEl.textContent = ''
          }

          if (panel) {
            let html = ''
            if (result.info && result.info === 'OK' && result.poiList && result.poiList.pois) {
              const pois = result.poiList.pois
              const totalCount = result.poiList.count || pois.length
              
              if (statsEl) {
                statsEl.textContent = `共找到 ${totalCount} 条结果，当前显示 ${pois.length} 条`
              }

              html = pois.map((poi, idx) => {
                const name = poi.name || '—'
                const address = poi.address || '—'
                const tel = poi.tel || '—'
                const location = poi.location ? `(${poi.location.lng}, ${poi.location.lat})` : '—'
                const typecode = poi.typeCode ? ` | 类型码: ${poi.typeCode}` : ''
                return `<div class="map-search-item">
                  <div class="map-search-item-title">${idx + 1}. ${name}</div>
                  <div class="map-search-item-info">地址：${address}</div>
                  <div class="map-search-item-info">电话：${tel}</div>
                  <div class="map-search-item-info">坐标：${location}${typecode}</div>
                </div>`
              }).join('')
            } else {
              html = '<div class="map-search-empty">未找到相关结果</div>'
            }
            panel.innerHTML = html
            panel.hidden = false
          }
        });
      });
    });

  })()
  /* ---------- contacts-module：通讯录与 Tab 列表 ---------- */
  /**
   * 联系人模块（不含企微 im 接口；不含检测好友关系 / 手机通讯录相关）
   * 拉取通讯录后自动分批 getDetailInfo（每批 20）；右侧分 Tab 仅展示对应分类。
   */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) return

    /** 每批 wxid 数量（接口上限 20，勿超） */
    const DETAIL_BATCH = 20
    /** 同时发起的 getDetailInfo 请求数（并行显著缩短总等待） */
    const CONCURRENT_DETAIL = 3
    /** 单批 getDetailInfo 最长等待，避免接口挂起导致右侧永远停在「加载中」 */
    const DETAIL_BATCH_TIMEOUT_MS = 90000

    const TAB_DESC = {
      friends: '好友：不含以 @chatroom 结尾的 ID、不以 gh 开头的 ID；展示名优先备注，其次昵称。',
      chatrooms: '群聊：ID 以 @chatroom 结尾（不区分大小写）；含接口 chatrooms 与误写在 friends 中的群。',
      ghs: '公众号：ID 以 gh 开头（不区分大小写）；含接口 ghs 与误写在 friends 中的号。',
    }

    const EMPTY_TEXT = {
      friends: '暂无好友。请先调用「获取通讯录列表」接口。',
      chatrooms: '暂无群聊（接口仅含已保存到通讯录的群，且已归并误分类项）。',
      ghs: '暂无公众号。',
    }

    const PREFILL_HINT_MAP = [
      ['ct-wxid-delete', 'ct-target-delete'],
      ['ct-wxid-brief', 'ct-target-brief'],
      ['ct-wxid-detail', 'ct-target-detail'],
      ['ct-perm-wxid', 'ct-target-perm'],
      ['ct-wxid-remark', 'ct-target-remark'],
    ]

    /** 最近一次通讯录渲染上下文，便于锁定目标后立即重排列表 */
    let lastRenderContext = null
    let contactsListFilterKeyword = ''

    function $(id) {
      return C.$(id)
    }

    /**
     * @param {string} [errorText] 有值时表示请求失败，不写响应体
     */
    function appendModuleLog(path, responseBody, requestBodyMerged, errorText) {
      const el = $('contacts-module-log-body')
      if (!el) return
      const entry = document.createElement('div')
      entry.className = 'profile-log-entry'
      const merged =
        requestBodyMerged !== undefined && requestBodyMerged !== null
          ? requestBodyMerged
          : C.getMergedRequestBody({})
      entry.textContent = C.formatApiCallText({
        path,
        requestBody: merged,
        responseBody: errorText ? undefined : responseBody,
        error: errorText,
      })
      el.appendChild(entry)
      el.scrollTop = el.scrollHeight
    }

    /** 卡片内联展示（不写右侧黑框日志）；含调用时间、合并后的请求体、响应或异常 */
    function showContactsInlineResponse(domId, path, responseBody, requestBodyRaw, errorText) {
      const el = $(domId)
      if (el) {
        el.hidden = true
        el.textContent = ''
      }
      const merged = C.getMergedRequestBody(
        requestBodyRaw !== undefined && requestBodyRaw !== null ? requestBodyRaw : {},
      )
      appendModuleLog(path, errorText ? undefined : responseBody, merged, errorText)
    }

    /**
     * @param {{ contactsModuleLog?: boolean }} [opts] contactsModuleLog 默认 true；为 false 时不写入 #contacts-module-log-body
     */
    async function post(path, body, opts) {
      const logContacts = opts?.contactsModuleLog !== false
      const mergedBody = C.getMergedRequestBody(body)
      let res
      try {
        res = await C.apiPost(path, body)
        if (logContacts) appendModuleLog(path, res.data, mergedBody)
      } catch (e) {
        if (logContacts) appendModuleLog(path, undefined, mergedBody, String(e))
        throw e
      }
      return res
    }

    function uniqueIds(arr) {
      const seen = new Set()
      const out = []
      for (const x of arr || []) {
        const s = String(x || '').trim()
        if (!s || seen.has(s)) continue
        seen.add(s)
        out.push(s)
      }
      return out
    }

    /** 统一 ID 字符串（全角 @、空白）便于判断 */
    function normalizeIdStr(id) {
      return String(id || '')
        .trim()
        .replace(/\uFF20/g, '@')
    }

    /** 群聊：以 @chatroom 结尾（不区分大小写） */
    function isChatroomId(id) {
      return normalizeIdStr(id).toLowerCase().endsWith('@chatroom')
    }

    /** 公众号：以 gh 开头（不区分大小写） */
    function isGhId(id) {
      return normalizeIdStr(id).toLowerCase().startsWith('gh')
    }

    /**
     * 将接口返回的 friends/chatrooms/ghs 归到三类；误写在 friends 里的群/号并入对应列表。
     */
    function normalizeContactsData(data) {
      const friendsRaw = uniqueIds(data.friends)
      const chatroomsRaw = uniqueIds(data.chatrooms)
      const ghsRaw = uniqueIds(data.ghs)

      const friendsIds = []
      const orphanChat = []
      const orphanGh = []
      for (const id of friendsRaw) {
        if (isChatroomId(id)) orphanChat.push(id)
        else if (isGhId(id)) orphanGh.push(id)
        else friendsIds.push(id)
      }

      const chatroomIds = uniqueIds([...chatroomsRaw, ...orphanChat])
      const ghIds = uniqueIds([...ghsRaw, ...orphanGh])

      return { friendsIds, chatroomIds, ghIds }
    }

    /** getDetailInfo 返回的 userName 与通讯录 id 可能大小写不一致，双键写入 Map */
    function mergeDetailRows(map, rows) {
      if (!Array.isArray(rows)) return
      rows.forEach((row) => {
        if (!row || typeof row !== 'object') return
        const u = row.userName != null ? String(row.userName).trim() : ''
        if (!u) return
        map.set(u, row)
        const lower = u.toLowerCase()
        if (lower !== u) map.set(lower, row)
      })
    }

    function detailRowForId(map, id) {
      const raw = normalizeIdStr(id)
      if (!raw) return undefined
      return map.get(raw) || map.get(raw.toLowerCase())
    }

    function pickDisplayName(row, id) {
      if (row && typeof row === 'object') {
        const remark = row.remark != null ? String(row.remark).trim() : ''
        if (remark) return remark
        const nick = row.nickName != null ? String(row.nickName).trim() : ''
        if (nick) return nick
        const un = row.userName != null ? String(row.userName).trim() : ''
        if (un) return un
      }
      return id
    }

    function withTimeout(promise, ms, errLabel) {
      return Promise.race([
        promise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error(errLabel)), ms)
        }),
      ])
    }

    function setDetailStatus(text, hidden) {
      const el = $('contacts-detail-status')
      if (!el) return
      el.hidden = !!hidden
      if (text != null) el.textContent = text
    }

    function resolveDisplayNameForWxid(wxid) {
      const w = String(wxid || '').trim()
      if (!w) return ''
      if (typeof C.lookupContactDisplayName === 'function') {
        const hit = C.lookupContactDisplayName(w)
        if (hit) return hit
      }
      const lock = String(C.state.currentTargetWxid || '').trim()
      const label = String(C.state.currentTargetDisplayName || '').trim()
      if (label && normalizeIdStr(lock).toLowerCase() === normalizeIdStr(w).toLowerCase()) {
        return label
      }
      return ''
    }

    function formatTargetMetaText(wxid, prefix) {
      const w = String(wxid || '').trim()
      if (!w) return ''
      const dn = resolveDisplayNameForWxid(w)
      if (dn && dn !== w) return `${prefix}${dn}（${w}）`
      return `${prefix}${w}`
    }

    function refreshContactsTargetMetaDisplays() {
      const lock = String(C.state.currentTargetWxid || '').trim()
      PREFILL_HINT_MAP.forEach(([inputId, hintId]) => {
        const input = $(inputId)
        const hint = $(hintId)
        if (!hint) return
        const cur = String(input?.value || '').trim()
        const text = cur
          ? formatTargetMetaText(cur, '当前对象：')
          : lock
            ? formatTargetMetaText(lock, '当前锁定目标：')
            : ''
        hint.textContent = text
        hint.hidden = !text
      })
    }

    /**
     * 渲染前按 Tab 再滤一层：@chatroom 结尾→群聊，gh 开头→公众号，其余→好友。
     */
    function filterIdsForTab(ids, emptyKey) {
      const list = Array.isArray(ids) ? ids : []
      if (emptyKey === 'friends') return list.filter((id) => !isChatroomId(id) && !isGhId(id))
      if (emptyKey === 'chatrooms') return list.filter((id) => isChatroomId(id))
      if (emptyKey === 'ghs') return list.filter((id) => isGhId(id))
      return list
    }

    function detailMapToRows(map) {
      const seen = new Set()
      const rows = []
      if (!(map instanceof Map)) return rows
      map.forEach((row) => {
        if (!row || typeof row !== 'object') return
        const u = row.userName != null ? String(row.userName).trim() : ''
        const key = u.toLowerCase()
        if (!key || seen.has(key)) return
        seen.add(key)
        rows.push(row)
      })
      return rows
    }

    function persistContactsCache(norm, detailMap) {
      try {
        const payload = {
          version: 1,
          savedAt: Date.now(),
          appId: String(C.state.appId || '').trim(),
          friendsIds: norm.friendsIds,
          chatroomIds: norm.chatroomIds,
          ghIds: norm.ghIds,
          details: detailMapToRows(detailMap),
        }
        localStorage.setItem(C.CONTACTS_CACHE_STORAGE_KEY, JSON.stringify(payload))
      } catch (e) {
        console.warn('通讯录缓存写入失败（可能超出浏览器存储配额）:', e?.message || e)
      }
    }

    function clearContactsCache() {
      try {
        localStorage.removeItem(C.CONTACTS_CACHE_STORAGE_KEY)
      } catch {
        /* ignore */
      }
    }

    function formatCacheSavedAt(ts) {
      if (!ts || typeof ts !== 'number') return '未知时间'
      try {
        return new Date(ts).toLocaleString('zh-CN', { hour12: false })
      } catch {
        return '未知时间'
      }
    }

    /** 刷新页面后从 localStorage 恢复列表与详情，避免右侧空白 */
    function restoreContactsFromCache() {
      try {
        const raw = localStorage.getItem(C.CONTACTS_CACHE_STORAGE_KEY)
        if (!raw) return false
        const o = JSON.parse(raw)
        if (!o || o.version !== 1) return false
        const currentAppId = String(C.state.appId || '').trim()
        const cachedAppId = String(o.appId || '').trim()
        if (currentAppId && cachedAppId && currentAppId !== cachedAppId) return false
        const friendsIds = Array.isArray(o.friendsIds) ? o.friendsIds.map(String) : []
        const chatroomIds = Array.isArray(o.chatroomIds) ? o.chatroomIds.map(String) : []
        const ghIds = Array.isArray(o.ghIds) ? o.ghIds.map(String) : []
        const all = uniqueIds([...friendsIds, ...chatroomIds, ...ghIds])
        if (all.length === 0) return false

        const detailMap = new Map()
        if (Array.isArray(o.details)) {
          mergeDetailRows(detailMap, o.details)
        }

        lastRenderContext = {
          friendsIds,
          chatroomIds,
          ghIds,
          detailMap,
        }
        renderDetailList('contacts-list-friends', friendsIds, detailMap, 'friends')
        renderDetailList('contacts-list-chatrooms', chatroomIds, detailMap, 'chatrooms')
        renderDetailList('contacts-list-ghs', ghIds, detailMap, 'ghs')
        syncLockedTargetFromDetailMap(detailMap, friendsIds, chatroomIds, ghIds)
        setDetailStatus(
          '已恢复本地缓存通讯录（' + formatCacheSavedAt(o.savedAt) + '）。点击「获取通讯录列表」可更新数据。',
          false,
        )
        setTimeout(() => setDetailStatus('', true), 8000)
        return true
      } catch {
        return false
      }
    }

    let _contactsRedrawRaf = null
    function scheduleContactsRedraw() {
      if (_contactsRedrawRaf != null) cancelAnimationFrame(_contactsRedrawRaf)
      _contactsRedrawRaf = requestAnimationFrame(() => {
        _contactsRedrawRaf = null
        if (!lastRenderContext) return
        const { friendsIds, chatroomIds, ghIds, detailMap } = lastRenderContext
        renderDetailList('contacts-list-friends', friendsIds, detailMap, 'friends')
        renderDetailList('contacts-list-chatrooms', chatroomIds, detailMap, 'chatrooms')
        renderDetailList('contacts-list-ghs', ghIds, detailMap, 'ghs')
        syncLockedTargetFromDetailMap(detailMap, friendsIds, chatroomIds, ghIds)
      })
    }

    function renderDetailList(containerId, ids, detailMap, emptyKey) {
      const root = $(containerId)
      if (!root) return
      root.innerHTML = ''
      const arr = filterIdsForTab(ids, emptyKey)
      if (arr.length === 0) {
        const p = document.createElement('p')
        p.className = 'contacts-list-empty'
        p.textContent = EMPTY_TEXT[emptyKey] || '暂无'
        root.appendChild(p)
        return
      }

      const lockRaw = normalizeIdStr(C.state.currentTargetWxid || '').trim()
      const lockLower = lockRaw.toLowerCase()
      const sorted = [...arr].sort((a, b) => {
        const aLock = lockLower && normalizeIdStr(a).toLowerCase() === lockLower
        const bLock = lockLower && normalizeIdStr(b).toLowerCase() === lockLower
        if (aLock && !bLock) return -1
        if (!aLock && bLock) return 1
        return 0
      })

      sorted.forEach((id) => {
        const rowObj = detailRowForId(detailMap, id)
        const title = pickDisplayName(rowObj, id)

        const rowEl = document.createElement('div')
        rowEl.className = 'contacts-list-row'
        if (lockLower && normalizeIdStr(id).toLowerCase() === lockLower) {
          rowEl.classList.add('contacts-list-row--target-lock')
        }

        const main = document.createElement('div')
        main.className = 'contacts-list-main'
        const titleEl = document.createElement('div')
        titleEl.className = 'contacts-list-title'
        titleEl.textContent = title
        const subEl = document.createElement('div')
        subEl.className = 'contacts-list-sub'
        subEl.textContent = id
        main.appendChild(titleEl)
        main.appendChild(subEl)

        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'btn btn-default contacts-list-btn'
        btn.textContent = '设为目标'
        btn.addEventListener('click', () => setTargetWxid(id, rowObj))

        rowEl.appendChild(main)
        rowEl.appendChild(btn)
        root.appendChild(rowEl)
      })
      applyContactsListFilterToRoot(root)
    }

    function applyContactsListFilterToRoot(root) {
      if (!root) return
      const keyword = String(contactsListFilterKeyword || '')
        .trim()
        .toLowerCase()
      root.querySelector('.contacts-list-empty-filter')?.remove()
      const rows = Array.from(root.querySelectorAll('.contacts-list-row'))
      if (!keyword) {
        rows.forEach((row) => {
          row.hidden = false
        })
        return
      }

      let visibleCount = 0
      rows.forEach((row) => {
        const title = row.querySelector('.contacts-list-title')?.textContent || ''
        const sub = row.querySelector('.contacts-list-sub')?.textContent || ''
        const hit = `${title} ${sub}`.toLowerCase().includes(keyword)
        row.hidden = !hit
        if (hit) visibleCount += 1
      })

      if (!visibleCount && rows.length) {
        const empty = document.createElement('p')
        empty.className = 'contacts-list-empty contacts-list-empty-filter'
        empty.textContent = '未找到匹配结果。'
        root.appendChild(empty)
      }
    }

    function applyContactsListFilter() {
      ;['contacts-list-friends', 'contacts-list-chatrooms', 'contacts-list-ghs'].forEach((id) => {
        applyContactsListFilterToRoot($(id))
      })
    }

    async function applyContactsPayload(data) {
      if (!data || typeof data !== 'object') return
      const norm = normalizeContactsData(data)
      const all = uniqueIds([...norm.friendsIds, ...norm.chatroomIds, ...norm.ghIds])

      if (all.length === 0) {
        clearContactsCache()
        setDetailStatus('', true)
        const empty = new Map()
        lastRenderContext = {
          friendsIds: [],
          chatroomIds: [],
          ghIds: [],
          detailMap: empty,
        }
        renderDetailList('contacts-list-friends', [], empty, 'friends')
        renderDetailList('contacts-list-chatrooms', [], empty, 'chatrooms')
        renderDetailList('contacts-list-ghs', [], empty, 'ghs')
        return
      }

      const detailMap = new Map()
      lastRenderContext = {
        friendsIds: norm.friendsIds,
        chatroomIds: norm.chatroomIds,
        ghIds: norm.ghIds,
        detailMap,
      }
      /* 先立刻用 wxid 渲染，避免在等 getDetailInfo 时右侧空白或长期停在「加载中」 */
      renderDetailList('contacts-list-friends', norm.friendsIds, detailMap, 'friends')
      renderDetailList('contacts-list-chatrooms', norm.chatroomIds, detailMap, 'chatrooms')
      renderDetailList('contacts-list-ghs', norm.ghIds, detailMap, 'ghs')
      persistContactsCache(norm, detailMap)

      const chunks = []
      for (let i = 0; i < all.length; i += DETAIL_BATCH) {
        chunks.push(all.slice(i, i + DETAIL_BATCH))
      }

      const lockWxid = (C.state.currentTargetWxid || '').trim()
      if (lockWxid) {
        const nl = normalizeIdStr(lockWxid).toLowerCase()
        chunks.sort((a, b) => {
          const aHas = a.some((id) => normalizeIdStr(id).toLowerCase() === nl)
          const bHas = b.some((id) => normalizeIdStr(id).toLowerCase() === nl)
          if (aHas && !bHas) return -1
          if (!aHas && bHas) return 1
          return 0
        })
      }

      const totalChunks = chunks.length
      let completed = 0

      setDetailStatus(
        '正在补全备注/昵称：POST /contacts/getDetailInfo，' +
        CONCURRENT_DETAIL +
        ' 路并行、每批 ' +
        DETAIL_BATCH +
        ' 条，单批最长 ' +
        Math.round(DETAIL_BATCH_TIMEOUT_MS / 1000) +
        's… 0/' +
        totalChunks +
        ' 批',
        false,
      )

      async function runChunk(chunk, batchNum) {
        try {
          const res = await withTimeout(
            post('/contacts/getDetailInfo', { wxids: chunk }, { contactsModuleLog: false }),
            DETAIL_BATCH_TIMEOUT_MS,
            'getDetailInfo 第 ' + batchNum + ' 批超时（' + DETAIL_BATCH_TIMEOUT_MS / 1000 + 's）',
          )
          const body = res?.data
          if (body?.ret === 200 && Array.isArray(body.data)) {
            mergeDetailRows(detailMap, body.data)
          }
        } catch (e) {
          appendModuleLog(
            '/contacts/getDetailInfo',
            undefined,
            C.getMergedRequestBody({ wxids: chunk }),
            String(e) + '（本批已跳过）',
          )
        } finally {
          completed++
          scheduleContactsRedraw()
          setDetailStatus(
            '正在补全备注/昵称（并行）… ' + completed + '/' + totalChunks + ' 批已完成',
            false,
          )
        }
      }

      let chunkIdx = 0
      async function detailWorker() {
        while (true) {
          const i = chunkIdx++
          if (i >= chunks.length) break
          await runChunk(chunks[i], i + 1)
        }
      }

      const pool = Math.min(CONCURRENT_DETAIL, chunks.length) || 1
      await Promise.all(Array.from({ length: pool }, () => detailWorker()))

      if (_contactsRedrawRaf != null) {
        cancelAnimationFrame(_contactsRedrawRaf)
        _contactsRedrawRaf = null
      }
      renderDetailList('contacts-list-friends', norm.friendsIds, detailMap, 'friends')
      renderDetailList('contacts-list-chatrooms', norm.chatroomIds, detailMap, 'chatrooms')
      renderDetailList('contacts-list-ghs', norm.ghIds, detailMap, 'ghs')
      syncLockedTargetFromDetailMap(detailMap, norm.friendsIds, norm.chatroomIds, norm.ghIds)

      persistContactsCache(norm, detailMap)

      setDetailStatus('详情补全结束（仍为 wxid 的项表示该 id 未在返回结果中匹配到）。', false)
      setTimeout(() => setDetailStatus('', true), 5000)
    }

    function setFetchButtonsDisabled(disabled) {
      ;['btn-contacts-fetch-list'].forEach((bid) => {
        const b = $(bid)
        if (b) b.disabled = !!disabled
      })
    }

    async function afterFetchContacts(res) {
      const body = res?.data
      if (body?.ret !== 200 || !body.data) return
      setFetchButtonsDisabled(true)
      try {
        await applyContactsPayload(body.data)
      } finally {
        setFetchButtonsDisabled(false)
      }
    }

    function syncTargetBanner() {
      const w = (C.state.currentTargetWxid || '').trim()
      const banner = $('contacts-target-banner')
      if (!banner) return
      if (w) {
        const label = (C.state.currentTargetDisplayName || '').trim()
        const line =
          label && label !== w ? `已锁定操作目标：${label}（${w}）` : '已锁定操作目标：' + w
        banner.textContent = line
        banner.hidden = false
      } else {
        banner.textContent = ''
        banner.hidden = true
      }
      refreshContactsTargetMetaDisplays()
    }

    /** 详情分批返回后，用最新备注/昵称更新已锁定目标的展示名 */
    function syncLockedTargetFromDetailMap(detailMap, friendsIds, chatroomIds, ghIds) {
      const lock = (C.state.currentTargetWxid || '').trim()
      if (!lock) return
      const nl = normalizeIdStr(lock).toLowerCase()
      for (const id of [...friendsIds, ...chatroomIds, ...ghIds]) {
        if (normalizeIdStr(id).toLowerCase() === nl) {
          const row = detailRowForId(detailMap, id)
          if (!row || typeof row !== 'object') return
          const label = pickDisplayName(row, id)
          if (C.state.currentTargetDisplayName !== label) {
            C.state.currentTargetDisplayName = label
            C.saveState()
            syncTargetBanner()
          }
          return
        }
      }
    }

    /**
     * @param {string} wxid
     * @param {object} [rowObj] getDetailInfo 行；无则展示名退化为 wxid
     */
    function setTargetWxid(wxid, rowObj) {
      const w = String(wxid || '').trim()
      if (!w) {
        C.showToast('wxid 为空', 'error')
        return
      }
      C.state.currentTargetWxid = w
      C.state.currentTargetDisplayName = pickDisplayName(rowObj, w)
      C.saveState()
      syncTargetBanner()
      const label = C.state.currentTargetDisplayName
      const toast =
        label && label !== w ? `已锁定操作目标：${label}（${w}）` : '已锁定操作目标：' + w
      C.showToast(toast, 'success')
      if (lastRenderContext) {
        const { friendsIds, chatroomIds, ghIds, detailMap } = lastRenderContext
        renderDetailList('contacts-list-friends', friendsIds, detailMap, 'friends')
        renderDetailList('contacts-list-chatrooms', chatroomIds, detailMap, 'chatrooms')
        renderDetailList('contacts-list-ghs', ghIds, detailMap, 'ghs')
      }
    }

    function prefillWxidOnFocus(ev) {
      const t = ev.target
      if (!t || t.tagName !== 'INPUT') return
      const cur = (t.value || '').trim()
      const lock = (C.state.currentTargetWxid || '').trim()
      if (!lock) return
      if (!cur) t.value = lock
      refreshContactsTargetMetaDisplays()
    }

    function switchContactsTab(name) {
      const tabs = document.querySelectorAll('#contacts .contacts-tab')
      const panels = {
        friends: $('contacts-panel-friends'),
        chatrooms: $('contacts-panel-chatrooms'),
        ghs: $('contacts-panel-ghs'),
      }
      const descEl = $('contacts-tab-desc')
      if (descEl && TAB_DESC[name]) descEl.textContent = TAB_DESC[name]

      tabs.forEach((btn) => {
        const on = btn.getAttribute('data-tab') === name
        btn.classList.toggle('active', on)
        btn.setAttribute('aria-selected', on ? 'true' : 'false')
      })
      Object.keys(panels).forEach((key) => {
        const p = panels[key]
        if (!p) return
        const on = key === name
        p.classList.toggle('active', on)
        p.hidden = !on
      })
      applyContactsListFilter()
    }

    function bindPrefillWxid() {
      document.querySelectorAll('#contacts .contacts-wxid-prefill').forEach((input) => {
        input.addEventListener('focus', prefillWxidOnFocus)
        input.addEventListener('input', refreshContactsTargetMetaDisplays)
        input.addEventListener('change', refreshContactsTargetMetaDisplays)
      })
    }

    function bind() {
      $('btn-contacts-fetch-list')?.addEventListener('click', async () => {
        const res = await post('/contacts/fetchContactsList', {})
        await afterFetchContacts(res)
      })

      $('btn-contacts-search')?.addEventListener('click', async () => {
        const q = ($('ct-search-query')?.value || '').trim()
        if (!q) {
          C.showToast('请填写 contactsInfo', 'error')
          return
        }
        const searchBody = { contactsInfo: q }
        try {
          const res = await post('/contacts/search', searchBody, { contactsModuleLog: false })
          showContactsInlineResponse('ct-inline-search', '/contacts/search', res?.data, searchBody)
        } catch (e) {
          showContactsInlineResponse(
            'ct-inline-search',
            '/contacts/search',
            undefined,
            searchBody,
            String(e),
          )
        }
      })

      $('btn-contacts-add')?.addEventListener('click', async () => {
        const v3 = ($('ct-add-v3')?.value || '').trim()
        const v4 = ($('ct-add-v4')?.value || '').trim()
        const content = ($('ct-add-content')?.value || '').trim()
        const scene = parseInt(String($('ct-add-scene')?.value ?? ''), 10)
        const option = parseInt(String($('ct-add-option')?.value ?? ''), 10)
        if (!v3 || !v4 || !content || Number.isNaN(scene) || Number.isNaN(option)) {
          C.showToast('请填写 v3、v4、content、scene、option', 'error')
          return
        }
        await post('/contacts/addContacts', {
          scene,
          option,
          v3,
          v4,
          content,
        })
      })

      bindPrefillWxid()

      $('btn-contacts-delete')?.addEventListener('click', async () => {
        const wxid = ($('ct-wxid-delete')?.value || '').trim()
        if (!wxid) {
          C.showToast('请填写 wxid', 'error')
          return
        }
        const ok = await C.modalConfirm(
          '删除好友',
          '删除好友属于敏感操作，请确认是否删除。\n\n目标 wxid：' + wxid,
        )
        if (!ok) return
        const delBody = { wxid }
        try {
          const res = await post('/contacts/deleteFriend', delBody, { contactsModuleLog: false })
          showContactsInlineResponse('ct-inline-delete', '/contacts/deleteFriend', res?.data, delBody)
        } catch (e) {
          showContactsInlineResponse(
            'ct-inline-delete',
            '/contacts/deleteFriend',
            undefined,
            delBody,
            String(e),
          )
        }
      })

      $('btn-contacts-brief')?.addEventListener('click', async () => {
        const wxid = ($('ct-wxid-brief')?.value || '').trim()
        if (!wxid) {
          C.showToast('请填写 wxid', 'error')
          return
        }
        const briefBody = { wxids: [wxid] }
        try {
          const res = await post('/contacts/getBriefInfo', briefBody, { contactsModuleLog: false })
          showContactsInlineResponse('ct-inline-brief', '/contacts/getBriefInfo', res?.data, briefBody)
        } catch (e) {
          showContactsInlineResponse(
            'ct-inline-brief',
            '/contacts/getBriefInfo',
            undefined,
            briefBody,
            String(e),
          )
        }
      })

      $('btn-contacts-detail')?.addEventListener('click', async () => {
        const wxid = ($('ct-wxid-detail')?.value || '').trim()
        if (!wxid) {
          C.showToast('请填写 wxid', 'error')
          return
        }
        const detailBody = { wxids: [wxid] }
        try {
          const res = await post('/contacts/getDetailInfo', detailBody, { contactsModuleLog: false })
          showContactsInlineResponse('ct-inline-detail', '/contacts/getDetailInfo', res?.data, detailBody)
        } catch (e) {
          showContactsInlineResponse(
            'ct-inline-detail',
            '/contacts/getDetailInfo',
            undefined,
            detailBody,
            String(e),
          )
        }
      })

      $('btn-contacts-permissions')?.addEventListener('click', async () => {
        const wxid = ($('ct-perm-wxid')?.value || '').trim()
        if (!wxid) {
          C.showToast('请填写 wxid', 'error')
          return
        }
        const onlyChat = !!$('ct-perm-onlychat')?.checked
        const permBody = { wxid, onlyChat }
        try {
          const res = await post('/contacts/setFriendPermissions', permBody, { contactsModuleLog: false })
          showContactsInlineResponse(
            'ct-inline-permissions',
            '/contacts/setFriendPermissions',
            res?.data,
            permBody,
          )
        } catch (e) {
          showContactsInlineResponse(
            'ct-inline-permissions',
            '/contacts/setFriendPermissions',
            undefined,
            permBody,
            String(e),
          )
        }
      })

      $('btn-contacts-set-remark')?.addEventListener('click', async () => {
        const wxid = ($('ct-wxid-remark')?.value || '').trim()
        const remark = ($('ct-remark-value')?.value || '').trim()
        if (!wxid) {
          C.showToast('请填写 wxid', 'error')
          return
        }
        if (!remark) {
          C.showToast('请填写 remark', 'error')
          return
        }
        const remarkBody = { wxid, remark }
        try {
          const res = await post('/contacts/setFriendRemark', remarkBody, { contactsModuleLog: false })
          showContactsInlineResponse('ct-inline-remark', '/contacts/setFriendRemark', res?.data, remarkBody)
        } catch (e) {
          showContactsInlineResponse(
            'ct-inline-remark',
            '/contacts/setFriendRemark',
            undefined,
            remarkBody,
            String(e),
          )
        }
      })

      document.querySelectorAll('#contacts .contacts-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-tab')
          if (name) switchContactsTab(name)
        })
      })

      $('contacts-list-filter')?.addEventListener('input', (ev) => {
        contactsListFilterKeyword = ev.target?.value || ''
        applyContactsListFilter()
      })

      $('btn-contacts-clear-log')?.addEventListener('click', () => {
        const box = $('contacts-module-log-body')
        if (box) box.innerHTML = ''
      })
    }

    function init() {
      syncTargetBanner()
      if (!restoreContactsFromCache()) {
        const empty = new Map()
        renderDetailList('contacts-list-friends', [], empty, 'friends')
        renderDetailList('contacts-list-chatrooms', [], empty, 'chatrooms')
        renderDetailList('contacts-list-ghs', [], empty, 'ghs')
      }
      switchContactsTab('friends')
      bind()
      refreshContactsTargetMetaDisplays()
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  /* ---------- messages-module：发消息与 CDN ---------- */
  /**
   * 消息模块：发送文本/图片/文件/链接/视频/小程序，及 CDN 下载测试。
   */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) return

    function $(id) {
      return C.$(id)
    }

    function idsMatchWxid(a, b) {
      if (typeof C.normalizeWxidForMatch === 'function') {
        return C.normalizeWxidForMatch(a) === C.normalizeWxidForMatch(b)
      }
      return String(a || '').trim() === String(b || '').trim()
    }

    function readTargetMetaFromLocalStorage() {
      try {
        const raw = localStorage.getItem(C.STORAGE_KEY || 'wechat_api_console_v1')
        if (!raw) return { wxid: '', displayName: '' }
        const o = JSON.parse(raw)
        return {
          wxid: String(o.currentTargetWxid || '').trim(),
          displayName: String(o.currentTargetDisplayName || '').trim(),
        }
      } catch {
        return { wxid: '', displayName: '' }
      }
    }

    function resolveTargetDisplayName() {
      const input = $('msg-to-wxid')
      const wxid =
        extractMessageTargetWxid((input?.value || '').trim()) ||
        (C.state.currentTargetWxid || '').trim() ||
        readTargetMetaFromLocalStorage().wxid
      if (!wxid) return ''
      const stateDn = (C.state.currentTargetDisplayName || '').trim()
      if (stateDn && !idsMatchWxid(stateDn, wxid)) return stateDn
      const lsDn = readTargetMetaFromLocalStorage().displayName
      if (lsDn && !idsMatchWxid(lsDn, wxid)) return lsDn
      if (typeof C.lookupContactDisplayName === 'function') {
        const hit = C.lookupContactDisplayName(wxid)
        if (hit) return hit
      }
      return ''
    }

    function extractMessageTargetWxid(raw) {
      const s = String(raw || '').trim()
      if (!s) return ''
      return s.split('（')[0].split('(')[0].trim()
    }

    function formatMessageTargetValue(wxid, displayName) {
      const id = String(wxid || '').trim()
      const dn = String(displayName || '').trim()
      if (!id) return ''
      if (dn && !idsMatchWxid(dn, id)) return id + '（' + dn + '）'
      return id
    }

    function refreshTargetHint() {
      const display = $('msg-target-display')
      if (display) {
        display.textContent = ''
        display.hidden = true
      }
    }

    /** 进入消息页或点「同步目标」时调用 */
    function syncToWxidFromState() {
      const input = $('msg-to-wxid')
      if (!input) return
      const ls = readTargetMetaFromLocalStorage()
      const v = (C.state.currentTargetWxid || '').trim() || ls.wxid
      if (!C.state.currentTargetWxid?.trim() && ls.wxid) {
        C.state.currentTargetWxid = ls.wxid
      }
      if (!C.state.currentTargetDisplayName?.trim() && ls.displayName) {
        C.state.currentTargetDisplayName = ls.displayName
      }
      C.saveState()
      let dn = ''
      const stateDn = (C.state.currentTargetDisplayName || '').trim()
      if (stateDn && !idsMatchWxid(stateDn, v)) dn = stateDn
      if (!dn) {
        const lsDn = String(ls.displayName || '').trim()
        if (lsDn && !idsMatchWxid(lsDn, v)) dn = lsDn
      }
      if (!dn && typeof C.lookupContactDisplayName === 'function') {
        dn = C.lookupContactDisplayName(v) || ''
      }
      if (v) input.value = formatMessageTargetValue(v, dn)
      refreshTargetHint()
    }

    function appendApiLog(path, responseEnvelope, requestBody, errorMessage) {
      const box = $('messages-api-log-body')
      if (!box) return
      const entry = document.createElement('div')
      entry.className = 'profile-log-entry messages-log-syntax'
      entry.innerHTML = formatLogHtml(path, responseEnvelope, requestBody, errorMessage)
      box.appendChild(entry)
      box.scrollTop = box.scrollHeight
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    function highlightValueTail(rest) {
      const strComma = rest.match(/^("(?:\\.|[^"\\])*")(\s*,\s*)$/)
      if (strComma) {
        return (
          '<span class="json-s">' +
          escapeHtml(strComma[1]) +
          '</span>' +
          escapeHtml(strComma[2])
        )
      }
      const strM = rest.match(/^("(?:\\.|[^"\\])*")(\s*)$/)
      if (strM) {
        return (
          '<span class="json-s">' + escapeHtml(strM[1]) + '</span>' + escapeHtml(strM[2])
        )
      }
      const numComma = rest.match(/^(-?\d+\.?\d*(?:[eE][+-]?\d+)?)(\s*,\s*)$/)
      if (numComma) {
        return (
          '<span class="json-n">' +
          escapeHtml(numComma[1]) +
          '</span>' +
          escapeHtml(numComma[2])
        )
      }
      const numM = rest.match(/^(-?\d+\.?\d*(?:[eE][+-]?\d+)?)(\s*)$/)
      if (numM) {
        return (
          '<span class="json-n">' + escapeHtml(numM[1]) + '</span>' + escapeHtml(numM[2])
        )
      }
      const boolComma = rest.match(/^(true|false|null)(\s*,\s*)$/)
      if (boolComma) {
        return (
          '<span class="json-b">' +
          escapeHtml(boolComma[1]) +
          '</span>' +
          escapeHtml(boolComma[2])
        )
      }
      const boolM = rest.match(/^(true|false|null)(\s*)$/)
      if (boolM) {
        return (
          '<span class="json-b">' + escapeHtml(boolM[1]) + '</span>' + escapeHtml(boolM[2])
        )
      }
      return escapeHtml(rest)
    }

    function highlightJsonPretty(obj) {
      let raw
      try {
        raw = JSON.stringify(obj, null, 2)
      } catch {
        return escapeHtml(String(obj))
      }
      return raw
        .split('\n')
        .map((line) => {
          const m = line.match(/^(\s*)("(?:\\.|[^"\\])*")\s*:\s*(.*)$/)
          if (!m) return escapeHtml(line)
          const val = (m[3] || '').trimStart()
          return (
            escapeHtml(m[1]) +
            '<span class="json-k">' +
            escapeHtml(m[2]) +
            '</span>: ' +
            highlightValueTail(val)
          )
        })
        .join('\n')
    }

    function formatLogHtml(path, responseEnvelope, requestBody, errorMessage) {
      const at = new Date()
      const timeStr = at.toLocaleString('zh-CN', { hour12: false })
      const merged = C.getMergedRequestBody(requestBody ?? {})
      const displayPath = C.formatApiPathLabel(path)
      const head =
        '<div class="messages-log-meta"><span class="json-t">' +
        escapeHtml(timeStr) +
        '</span> <span class="json-p">POST ' +
        escapeHtml(displayPath) +
        '</span></div>'
      const reqTitle = '<div class="messages-log-dt">请求体</div>'
      const reqBlock =
        '<pre class="messages-pre">' + highlightJsonPretty(merged) + '</pre>'
      if (errorMessage != null && errorMessage !== '') {
        return (
          head +
          reqTitle +
          reqBlock +
          '<div class="messages-log-dt messages-log-err">异常</div><pre class="messages-pre messages-pre-err">' +
          escapeHtml(String(errorMessage)) +
          '</pre>'
        )
      }
      const resTitle = '<div class="messages-log-dt">响应体</div>'
      const resBlock =
        '<pre class="messages-pre">' + highlightJsonPretty(responseEnvelope) + '</pre>'
      return head + reqTitle + reqBlock + resTitle + resBlock
    }

    function requireToWxid() {
      const to = extractMessageTargetWxid(($('msg-to-wxid')?.value || '').trim())
      if (!to) {
        C.showToast('请填写接收人 toWxid', 'error')
        return null
      }
      return to
    }

    async function postAndLog(path, body) {
      try {
        const res = await C.apiPost(path, body)
        appendApiLog(path, res?.data, body, null)
        return res
      } catch (e) {
        appendApiLog(path, undefined, body, e?.message || String(e))
        C.showToast(path + ' 请求失败', 'error')
        return null
      }
    }

    function switchMessagePanel(type) {
      document.querySelectorAll('#messages .messages-form-panel').forEach((p) => {
        const on = p.getAttribute('data-panel') === type
        p.classList.toggle('active', on)
        p.hidden = !on
      })
    }

    function bind() {
      $('btn-msg-sync-target')?.addEventListener('click', () => {
        const dnBefore = resolveTargetDisplayName()
        syncToWxidFromState()
        const w = extractMessageTargetWxid(($('msg-to-wxid')?.value || '').trim())
        const dn = resolveTargetDisplayName() || dnBefore
        let toast = '已同步发送目标'
        if (w && dn && !idsMatchWxid(dn, w)) toast = '已同步：' + dn + '（' + w + '）'
        else if (w) toast = '已同步 wxid：' + w
        C.showToast(toast, 'success')
      })

      $('msg-to-wxid')?.addEventListener('input', refreshTargetHint)

      $('msg-type-select')?.addEventListener('change', (e) => {
        switchMessagePanel(e.target.value)
      })

      $('btn-msg-clear-log')?.addEventListener('click', () => {
        const box = $('messages-api-log-body')
        if (box) box.innerHTML = ''
      })

      $('btn-msg-send-text')?.addEventListener('click', async () => {
        const toWxid = requireToWxid()
        if (!toWxid) return
        const content = ($('msg-text-content')?.value || '').trim()
        if (!content) {
          C.showToast('请填写 content', 'error')
          return
        }
        const atsRaw = ($('msg-text-ats')?.value || '').trim()
        const body = { toWxid, content }
        if (atsRaw) body.ats = atsRaw
        await postAndLog('/message/postText', body)
      })

      $('btn-msg-send-image')?.addEventListener('click', async () => {
        const toWxid = requireToWxid()
        if (!toWxid) return
        const imgUrl = ($('msg-img-url')?.value || '').trim()
        if (!imgUrl) {
          C.showToast('请填写 imgUrl', 'error')
          return
        }
        await postAndLog('/message/postImage', { toWxid, imgUrl })
      })

      $('btn-msg-send-file')?.addEventListener('click', async () => {
        const toWxid = requireToWxid()
        if (!toWxid) return
        const fileUrl = ($('msg-file-url')?.value || '').trim()
        const fileName = ($('msg-file-name')?.value || '').trim()
        if (!fileUrl || !fileName) {
          C.showToast('请填写 fileUrl 与 fileName', 'error')
          return
        }
        await postAndLog('/message/postFile', { toWxid, fileUrl, fileName })
      })

      $('btn-msg-send-link')?.addEventListener('click', async () => {
        const toWxid = requireToWxid()
        if (!toWxid) return
        const title = ($('msg-link-title')?.value || '').trim()
        const desc = ($('msg-link-desc')?.value || '').trim()
        const linkUrl = ($('msg-link-url')?.value || '').trim()
        const thumbUrl = ($('msg-link-thumb')?.value || '').trim()
        if (!title || !desc || !linkUrl || !thumbUrl) {
          C.showToast('请填写 title、desc、linkUrl、thumbUrl', 'error')
          return
        }
        await postAndLog('/message/postLink', { toWxid, title, desc, linkUrl, thumbUrl })
      })

      $('btn-msg-send-video')?.addEventListener('click', async () => {
        const toWxid = requireToWxid()
        if (!toWxid) return
        const videoUrl = ($('msg-video-url')?.value || '').trim()
        const thumbUrl = ($('msg-video-thumb')?.value || '').trim()
        const durationRaw = ($('msg-video-duration')?.value || '').trim()
        const videoDuration =
          durationRaw === '' ? 10 : Math.max(1, parseInt(durationRaw, 10) || 10)
        if (!videoUrl || !thumbUrl) {
          C.showToast('请填写 videoUrl 与 thumbUrl', 'error')
          return
        }
        await postAndLog('/message/postVideo', { toWxid, videoUrl, thumbUrl, videoDuration })
      })

      $('btn-msg-send-miniapp')?.addEventListener('click', async () => {
        const toWxid = requireToWxid()
        if (!toWxid) return
        const miniAppId = ($('msg-mini-id')?.value || '').trim()
        const userName = ($('msg-mini-user')?.value || '').trim()
        const title = ($('msg-mini-title')?.value || '').trim()
        const coverImgUrl = ($('msg-mini-cover')?.value || '').trim()
        const pagePath = ($('msg-mini-path')?.value || '').trim()
        const displayName = ($('msg-mini-display')?.value || '').trim()
        if (!miniAppId || !userName || !title || !coverImgUrl || !pagePath || !displayName) {
          C.showToast('请填写小程序表单全部字段', 'error')
          return
        }
        await postAndLog('/message/postMiniApp', {
          toWxid,
          miniAppId,
          userName,
          title,
          coverImgUrl,
          pagePath,
          displayName,
        })
      })

      $('btn-msg-download-cdn')?.addEventListener('click', async () => {
        const aesKey = ($('msg-cdn-aes')?.value || '').trim()
        const fileId = ($('msg-cdn-fileid')?.value || '').trim()
        const type = ($('msg-cdn-type')?.value || '').trim()
        const totalSize = ($('msg-cdn-size')?.value || '').trim()
        const suffix = ($('msg-cdn-suffix')?.value || '').trim()
        if (!aesKey || !fileId || type === '' || !totalSize || !suffix) {
          C.showToast('请填写 CDN 下载全部字段', 'error')
          return
        }
        await postAndLog('/message/downloadCdn', {
          aesKey,
          fileId,
          type,
          totalSize,
          suffix,
        })
      })

      window.addEventListener('hashchange', () => {
        if (location.hash === '#messages') syncToWxidFromState()
      })
    }

    function init() {
      switchMessagePanel('text')
      bind()
      syncToWxidFromState()
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  /* ---------- sns-module：朋友圈 ---------- */
  /**
   * 朋友圈（SNS）模块 — 与《朋友圈模块.md》一致的 17 个 POST /sns/* 均在页面中有入口与说明。
   */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) return

    function $(id) {
      return C.$(id)
    }

    /** 大厅（snsList）翻页游标 */
    let timelineCursor = { firstPageMd5: '', maxId: 0 }
    /** 指定好友（contactsSnsList）翻页游标 */
    let contactCursor = { firstPageMd5: '', maxId: 0, wxid: '' }

    /**
     * 朋友圈 id 常超过 JS 安全整数，过大时以字符串传给 JSON，避免精度丢失。
     */
    function snsIdForApi(raw) {
      const s = String(raw ?? '').trim().replace(/\s+/g, '')
      if (!/^\d+$/.test(s)) return null
      if (s.length > 15) return s
      const n = Number(s)
      return Number.isSafeInteger(n) ? n : s
    }

    /**
     * 接口返回的列表字段：文档为 snsList；兼容 list。
     */
    function getSnsListFromData(data) {
      if (!data || typeof data !== 'object') return []
      const a = data.snsList ?? data.list
      return Array.isArray(a) ? a : []
    }

    /**
     * 将 snsXml 中的 HTML 实体与常见换行转义做可读化处理。
     */
    function normalizeSnsText(s) {
      if (s == null) return ''
      return String(s)
        .replace(/&#x0A;/gi, '\n')
        .replace(/&#10;/gi, '\n')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim()
    }

    /**
     * 从单条动态的 snsXml 中尽量提取「朋友圈文案」。
     * 微信结构多为 <contentDesc> 或 CDATA，用 DOMParser + 正则双保险，避免单条异常拖垮整表。
     */
    function parseContentDescFromSnsXml(snsXml) {
      if (!snsXml || typeof snsXml !== 'string') return ''
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(snsXml, 'text/xml')
        if (doc.querySelector('parsererror')) throw new Error('parsererror')
        const els = doc.getElementsByTagName('contentDesc')
        if (els.length && els[0].textContent) return normalizeSnsText(els[0].textContent)
      } catch {
        /* 继续走正则 */
      }
      try {
        const cdata = snsXml.match(/<contentDesc[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/contentDesc>/i)
        if (cdata) return normalizeSnsText(cdata[1])
        const plain = snsXml.match(/<contentDesc[^>]*>([\s\S]*?)<\/contentDesc>/i)
        if (plain) {
          let inner = plain[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
          return normalizeSnsText(inner)
        }
      } catch {
        /* ignore */
      }
      return ''
    }

    /**
     * 从 snsXml 里抽若干缩略图 URL，用于卡片配图（可选链无法用于正则，故包在 try 中）。
     */
    function extractThumbUrlsFromSnsXml(snsXml, limit) {
      const max = limit ?? 6
      const out = []
      if (!snsXml || typeof snsXml !== 'string') return out
      try {
        const re = /<thumb[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]+))<\/thumb>/gi
        let m
        while (out.length < max && (m = re.exec(snsXml)) !== null) {
          const url = (m[1] || m[2] || '').trim()
          if (url.startsWith('http')) out.push(url)
        }
      } catch {
        /* ignore */
      }
      return out
    }

    /** Unix 秒 → 本地中文时间 */
    function formatSnsTime(ts) {
      try {
        const n = Number(ts)
        if (!Number.isFinite(n) || n <= 0) return '—'
        const ms = n < 1e12 ? n * 1000 : n
        const d = new Date(ms)
        if (Number.isNaN(d.getTime())) return String(ts)
        return d.toLocaleString('zh-CN', { hour12: false })
      } catch {
        return String(ts ?? '—')
      }
    }

    function appendSnsLog(path, responseEnvelope, requestBody, errorMessage) {
      const box = $('sns-api-log-body')
      if (!box) return
      const entry = document.createElement('div')
      entry.className = 'profile-log-entry'
      const merged = C.getMergedRequestBody(requestBody ?? {})
      entry.textContent = C.formatApiCallText({
        path,
        requestBody: merged,
        responseBody: errorMessage ? undefined : responseEnvelope,
        error: errorMessage,
      })
      box.appendChild(entry)
      box.scrollTop = box.scrollHeight
    }

    async function apiPostLog(path, body) {
      try {
        const res = await C.apiPost(path, body)
        appendSnsLog(path, res?.data, body, null)
        return res
      } catch (e) {
        appendSnsLog(path, undefined, body, e?.message || String(e))
        C.showToast(path + ' 失败', 'error')
        return null
      }
    }

    function updateCursorHints() {
      const t = $('sns-timeline-cursor-hint')
      if (t) {
        t.textContent =
          '当前游标（大厅）：firstPageMd5=' +
          (timelineCursor.firstPageMd5 || '（空）') +
          '，maxId=' +
          (timelineCursor.maxId ?? 0)
      }
      const c = $('sns-contact-cursor-hint')
      if (c) {
        c.textContent =
          '当前游标（好友）：wxid=' +
          (contactCursor.wxid || '—') +
          '，firstPageMd5=' +
          (contactCursor.firstPageMd5 || '（空）') +
          '，maxId=' +
          (contactCursor.maxId ?? 0)
      }
    }

    function setFeedEmptyVisible(on) {
      const el = $('sns-feed-empty')
      if (el) el.hidden = !on
    }

    /**
     * 渲染单张卡片：内部 try-catch，保证一条坏了不影响其它条目。
     */
    function renderSnsCard(item) {
      const wrap = document.createElement('article')
      wrap.className = 'sns-card'

      const snsIdRaw = item?.id
      const snsIdStr = snsIdRaw != null ? String(snsIdRaw) : ''
      const userName = item?.userName != null ? String(item.userName).trim() : ''
      const nickName = item?.nickName != null ? String(item.nickName).trim() : ''
      const createTime = item?.createTime
      const snsXml = item?.snsXml != null ? String(item.snsXml) : ''

      let contentText = ''
      let thumbs = []
      try {
        contentText = parseContentDescFromSnsXml(snsXml)
      } catch {
        contentText = ''
      }
      try {
        thumbs = extractThumbUrlsFromSnsXml(snsXml, 6)
      } catch {
        thumbs = []
      }

      const likeCount = item?.likeCount
      const commentCount = item?.commentCount

      const head = document.createElement('div')
      head.className = 'sns-card-head'
      const avatar = document.createElement('div')
      avatar.className = 'sns-card-avatar'
      avatar.setAttribute('aria-hidden', 'true')
      avatar.textContent = (nickName || userName || '?').slice(0, 1)
      const meta = document.createElement('div')
      meta.className = 'sns-card-meta'
      const line1 = document.createElement('div')
      line1.className = 'sns-card-nick'
      line1.textContent = '[发布者] ' + (nickName || '（无昵称）') + '　' + (userName ? '微信号：' + userName : '')
      const line2 = document.createElement('div')
      line2.className = 'sns-card-time'
      line2.textContent = '[发布时间] ' + formatSnsTime(createTime)
      meta.appendChild(line1)
      meta.appendChild(line2)
      head.appendChild(avatar)
      head.appendChild(meta)

      const body = document.createElement('div')
      body.className = 'sns-card-body'
      const textEl = document.createElement('div')
      textEl.className = 'sns-card-text'
      textEl.textContent = '[朋友圈文案] ' + (contentText || '（未解析到文案，可看下栏原始 XML 结构）')
      body.appendChild(textEl)

      if (thumbs.length > 0) {
        const grid = document.createElement('div')
        grid.className = 'sns-card-thumbs'
        thumbs.forEach((u) => {
          const img = document.createElement('img')
          img.className = 'sns-card-thumb'
          img.loading = 'lazy'
          img.alt = ''
          img.src = u
          img.referrerPolicy = 'no-referrer'
          grid.appendChild(img)
        })
        body.appendChild(grid)
      }

      const stat = document.createElement('div')
      stat.className = 'sns-card-stat'
      stat.textContent =
        '[点赞数/评论数] ' +
        (likeCount != null ? likeCount : '—') +
        ' / ' +
        (commentCount != null ? commentCount : '—') +
        (snsIdStr ? '　·　snsId：' + snsIdStr : '')
      body.appendChild(stat)

      const actions = document.createElement('div')
      actions.className = 'sns-card-actions'

      const btnLike = document.createElement('button')
      btnLike.type = 'button'
      btnLike.className = 'btn btn-default sns-card-action-btn'
      btnLike.textContent = '👍 点赞此条'
      btnLike.addEventListener('click', () => {
        if (!snsIdStr) {
          C.showToast('无 snsId', 'error')
          return
        }
        if (!userName) {
          C.showToast('缺少发布者 userName，无法点赞', 'error')
          return
        }
        const idVal = snsIdForApi(snsIdStr)
        if (idVal == null) {
          C.showToast('snsId 格式无效', 'error')
          return
        }
        void likeSnsRequest(idVal, userName, 1)
      })

      const btnChat = document.createElement('button')
      btnChat.type = 'button'
      btnChat.className = 'btn btn-primary sns-card-action-btn'
      btnChat.textContent = '✉️ 找他私聊'
      btnChat.addEventListener('click', () => {
        if (!userName) {
          C.showToast('无发布者 wxid', 'error')
          return
        }
        C.state.currentTargetWxid = userName
        C.state.currentTargetDisplayName = nickName || userName
        C.saveState()
        C.showToast('已锁定聊天对象：' + (nickName || userName), 'success')
        window.location.hash = '#messages'
      })

      actions.appendChild(btnLike)
      actions.appendChild(btnChat)

      wrap.appendChild(head)
      wrap.appendChild(body)
      wrap.appendChild(actions)
      return wrap
    }

    function appendCardsFromList(list) {
      const root = $('sns-feed-list')
      if (!root) return
      setFeedEmptyVisible(false)
      for (let i = 0; i < list.length; i++) {
        try {
          const card = renderSnsCard(list[i])
          root.appendChild(card)
        } catch (err) {
          console.warn('sns card render skip', err)
          const errBox = document.createElement('div')
          errBox.className = 'sns-card sns-card--error'
          errBox.textContent = '[单条解析失败，已跳过] ' + (err?.message || String(err))
          root.appendChild(errBox)
        }
      }
      if (!root.children.length) setFeedEmptyVisible(true)
    }

    function clearFeed() {
      const root = $('sns-feed-list')
      if (root) root.innerHTML = ''
      setFeedEmptyVisible(true)
    }

    function applyTimelinePage(data, append) {
      if (!append) {
        timelineCursor = { firstPageMd5: '', maxId: 0 }
        clearFeed()
      }
      if (data && typeof data === 'object') {
        if (data.firstPageMd5 != null) timelineCursor.firstPageMd5 = String(data.firstPageMd5)
        if (data.maxId != null) timelineCursor.maxId = data.maxId
      }
      const list = getSnsListFromData(data)
      appendCardsFromList(list)
      updateCursorHints()
    }

    function applyContactPage(data, wxid, append) {
      if (!append) {
        contactCursor = { firstPageMd5: '', maxId: 0, wxid: String(wxid || '').trim() }
        clearFeed()
      }
      if (data && typeof data === 'object') {
        if (data.firstPageMd5 != null) contactCursor.firstPageMd5 = String(data.firstPageMd5)
        if (data.maxId != null) contactCursor.maxId = data.maxId
      }
      const list = getSnsListFromData(data)
      appendCardsFromList(list)
      updateCursorHints()
    }

    async function fetchSnsListTimeline(append) {
      const body = {
        maxId: append ? timelineCursor.maxId : 0,
        decrypt: true,
        firstPageMd5: append ? timelineCursor.firstPageMd5 : '',
      }
      const res = await apiPostLog('/sns/snsList', body)
      const envelope = res?.data
      if (envelope?.ret !== 200) {
        C.showToast(envelope?.msg || 'snsList 未返回 200', 'error')
        return
      }
      applyTimelinePage(envelope?.data, append)
    }

    async function fetchContactsSnsList(wxid, append) {
      const w = String(wxid || '').trim()
      if (!w) {
        C.showToast('请填写好友 wxid', 'error')
        return
      }
      const body = {
        wxid: w,
        maxId: append ? contactCursor.maxId : 0,
        decrypt: true,
        firstPageMd5: append ? contactCursor.firstPageMd5 : '',
      }
      const res = await apiPostLog('/sns/contactsSnsList', body)
      const envelope = res?.data
      if (envelope?.ret !== 200) {
        C.showToast(envelope?.msg || 'contactsSnsList 未返回 200', 'error')
        return
      }
      applyContactPage(envelope?.data, w, append)
    }

    async function likeSnsRequest(snsId, authorWxid, operType) {
      const wxid = String(authorWxid || '').trim()
      if (!wxid) {
        C.showToast('缺少发布者 wxid', 'error')
        return
      }
      const body = {
        snsId,
        operType,
        wxid,
        useProxy: true,
      }
      const res = await apiPostLog('/sns/likeSns', body)
      const envelope = res?.data
      if (envelope?.ret === 200) {
        C.showToast(operType === 1 ? '已请求点赞' : '已请求取消点赞', 'success')
      }
    }

    function readPrivacyBool() {
      return ($('sns-pub-privacy')?.value || '0') === '1'
    }

    function syncSnsUserWxidFromState() {
      const input = $('sns-user-wxid')
      if (!input) return
      const w = (C.state.currentTargetWxid || '').trim()
      if (w) input.value = w
      refreshSnsTargetDisplays()
    }

    function resolveSnsDisplayName(wxid) {
      const w = String(wxid || '').trim()
      if (!w) return ''
      if (typeof C.lookupContactDisplayName === 'function') {
        const hit = C.lookupContactDisplayName(w)
        if (hit) return hit
      }
      const lock = String(C.state.currentTargetWxid || '').trim()
      const dn = String(C.state.currentTargetDisplayName || '').trim()
      if (dn && lock === w) return dn
      return ''
    }

    function setSnsTargetDisplay(id, wxid, prefix) {
      const el = $(id)
      if (!el) return
      const w = String(wxid || '').trim()
      if (!w) {
        el.hidden = true
        el.textContent = ''
        return
      }
      const dn = resolveSnsDisplayName(w)
      el.textContent = dn && dn !== w ? `${prefix}${dn}（${w}）` : `${prefix}${w}`
      el.hidden = false
    }

    function refreshSnsTargetDisplays() {
      const lock = (C.state.currentTargetWxid || '').trim()
      setSnsTargetDisplay(
        'sns-user-target-display',
        ($('sns-user-wxid')?.value || '').trim() || lock,
        '当前对象：',
      )
      setSnsTargetDisplay(
        'sns-quick-target-display',
        ($('sns-quick-author')?.value || '').trim() || lock,
        '当前对象：',
      )
      setSnsTargetDisplay(
        'sns-comment-target-display',
        ($('sns-comment-wxid')?.value || '').trim() || lock,
        '当前对象：',
      )
    }

    /** 发布类接口常用的三组 wxid 数组，文档多为空数组 */
    const EMPTY_WX_GROUPS = { allowWxIds: [], atWxIds: [], disableWxIds: [] }

    function switchSnsTab(name) {
      document.querySelectorAll('#sns .sns-tab').forEach((btn) => {
        const on = btn.getAttribute('data-sns-tab') === name
        btn.classList.toggle('active', on)
        btn.setAttribute('aria-selected', on ? 'true' : 'false')
      })
      const panels = {
        browse: $('sns-panel-browse'),
        publish: $('sns-panel-publish'),
        quick: $('sns-panel-quick'),
        more: $('sns-panel-more'),
      }
      Object.keys(panels).forEach((key) => {
        const p = panels[key]
        if (!p) return
        const on = key === name
        p.classList.toggle('active', on)
        p.hidden = !on
      })
      if (name === 'browse') syncSnsUserWxidFromState()
    }

    function syncSnsCommentWxidFromState() {
      const el = $('sns-comment-wxid')
      if (!el) return
      const w = (C.state.currentTargetWxid || '').trim()
      if (w && !(el.value || '').trim()) el.value = w
      refreshSnsTargetDisplays()
    }

    function bind() {
      document.querySelectorAll('#sns .sns-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-sns-tab')
          if (name) switchSnsTab(name)
        })
      })

      $('btn-sns-refresh-timeline')?.addEventListener('click', () => {
        void fetchSnsListTimeline(false)
      })
      $('btn-sns-load-more-timeline')?.addEventListener('click', () => {
        void fetchSnsListTimeline(true)
      })

      $('btn-sns-load-user')?.addEventListener('click', () => {
        const wxid = ($('sns-user-wxid')?.value || '').trim()
        void fetchContactsSnsList(wxid, false)
      })
      $('btn-sns-load-more-user')?.addEventListener('click', () => {
        const wxid = ($('sns-user-wxid')?.value || '').trim() || contactCursor.wxid
        void fetchContactsSnsList(wxid, true)
      })

      $('btn-sns-send-text')?.addEventListener('click', async () => {
        const content = ($('sns-pub-content')?.value || '').trim()
        if (!content) {
          C.showToast('请填写文案', 'error')
          return
        }
        const privacy = readPrivacyBool()
        await apiPostLog('/sns/sendTextSns', {
          content,
          privacy,
          useProxy: true,
          ...EMPTY_WX_GROUPS,
        })
      })

      $('btn-sns-send-img')?.addEventListener('click', async () => {
        const content = ($('sns-pub-content')?.value || '').trim() || ' '
        const raw = ($('sns-pub-imgurls')?.value || '').trim()
        const imgUrls = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        if (imgUrls.length === 0) {
          C.showToast('请填写至少一个图片 URL', 'error')
          return
        }
        const up = await apiPostLog('/sns/uploadSnsImage', { imgUrls })
        const upEnv = up?.data
        if (upEnv?.ret !== 200 || !Array.isArray(upEnv?.data)) {
          C.showToast('上传图片失败', 'error')
          return
        }
        const privacy = readPrivacyBool()
        await apiPostLog('/sns/sendImgSns', {
          content,
          privacy,
          imgInfos: upEnv.data,
          ...EMPTY_WX_GROUPS,
        })
      })

      $('btn-sns-upload-img-only')?.addEventListener('click', async () => {
        const raw = ($('sns-pub-imgurls')?.value || '').trim()
        const imgUrls = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        if (imgUrls.length === 0) {
          C.showToast('请填写至少一个图片 URL', 'error')
          return
        }
        await apiPostLog('/sns/uploadSnsImage', { imgUrls })
      })

      $('btn-sns-send-url')?.addEventListener('click', async () => {
        const title = ($('sns-url-title')?.value || '').trim()
        const description = ($('sns-url-desc')?.value || '').trim()
        const linkUrl = ($('sns-url-link')?.value || '').trim()
        const thumbUrl = ($('sns-url-thumb')?.value || '').trim()
        const content = ($('sns-url-content')?.value || '').trim()
        if (!title || !description || !linkUrl || !thumbUrl) {
          C.showToast('请填写 title、description、linkUrl、thumbUrl', 'error')
          return
        }
        const privacy = readPrivacyBool()
        await apiPostLog('/sns/sendUrlSns', {
          title,
          description,
          linkUrl,
          thumbUrl,
          content: content || '',
          privacy,
          ...EMPTY_WX_GROUPS,
        })
      })

      async function uploadSnsVideoOnce() {
        const videoUrl = ($('sns-video-url')?.value || '').trim()
        const thumbUrl = ($('sns-video-thumb')?.value || '').trim()
        if (!videoUrl || !thumbUrl) {
          C.showToast('请填写 videoUrl 与 thumbUrl', 'error')
          return null
        }
        const res = await apiPostLog('/sns/uploadSnsVideo', { videoUrl, thumbUrl })
        const env = res?.data
        if (env?.ret !== 200 || !env?.data || typeof env.data !== 'object') {
          C.showToast('uploadSnsVideo 失败', 'error')
          return null
        }
        return env.data
      }

      $('btn-sns-upload-video-only')?.addEventListener('click', async () => {
        await uploadSnsVideoOnce()
      })

      $('btn-sns-send-video')?.addEventListener('click', async () => {
        const videoInfo = await uploadSnsVideoOnce()
        if (!videoInfo) return
        const content = ($('sns-video-content')?.value || '').trim() || 'in'
        const privacy = readPrivacyBool()
        await apiPostLog('/sns/sendVideoSns', {
          content,
          privacy,
          videoInfo,
          ...EMPTY_WX_GROUPS,
        })
      })

      $('btn-sns-forward')?.addEventListener('click', async () => {
        const snsXml = ($('sns-forward-xml')?.value || '').trim()
        if (!snsXml) {
          C.showToast('请填写 snsXml', 'error')
          return
        }
        const privacy = !!$('sns-forward-privacy')?.checked
        await apiPostLog('/sns/forwardSns', {
          snsXml,
          privacy,
          ...EMPTY_WX_GROUPS,
        })
      })

      $('btn-sns-sns-details')?.addEventListener('click', async () => {
        const snsId = snsIdForApi($('sns-detail-snsid')?.value)
        if (snsId == null) {
          C.showToast('请填写 snsId', 'error')
          return
        }
        await apiPostLog('/sns/snsDetails', { snsId })
      })

      $('btn-sns-del')?.addEventListener('click', async () => {
        const snsId = snsIdForApi($('sns-del-snsid')?.value)
        if (snsId == null) {
          C.showToast('请填写 snsId', 'error')
          return
        }
        await apiPostLog('/sns/delSns', { snsId })
      })

      $('btn-sns-comment')?.addEventListener('click', async () => {
        const snsId = snsIdForApi($('sns-comment-snsid')?.value)
        if (snsId == null) {
          C.showToast('请填写 snsId', 'error')
          return
        }
        const wxid = ($('sns-comment-wxid')?.value || '').trim() || (C.state.currentTargetWxid || '').trim()
        if (!wxid) {
          C.showToast('请填写 wxid', 'error')
          return
        }
        const operType = Number($('sns-comment-opertype')?.value || 1)
        const body = {
          snsId,
          operType,
          wxid,
          content: ($('sns-comment-content')?.value || '').trim(),
        }
        const cid = ($('sns-comment-id')?.value || '').trim()
        if (cid) body.commentId = cid
        await apiPostLog('/sns/commentSns', body)
      })

      $('btn-sns-visible-scope')?.addEventListener('click', async () => {
        const option = Number($('sns-scope-option')?.value || 1)
        await apiPostLog('/sns/snsVisibleScope', { option })
      })

      $('btn-sns-stranger')?.addEventListener('click', async () => {
        const enabled = !!$('sns-stranger-enabled')?.checked
        await apiPostLog('/sns/strangerVisibilityEnabled', { enabled })
      })

      $('btn-sns-set-privacy')?.addEventListener('click', async () => {
        const snsId = snsIdForApi($('sns-privacy-snsid')?.value)
        if (snsId == null) {
          C.showToast('请填写 snsId', 'error')
          return
        }
        const open = !!$('sns-privacy-open')?.checked
        await apiPostLog('/sns/snsSetPrivacy', { snsId, open })
      })

      $('btn-sns-download-video')?.addEventListener('click', async () => {
        const snsXml = ($('sns-download-xml')?.value || '').trim()
        if (!snsXml) {
          C.showToast('请填写 snsXml', 'error')
          return
        }
        await apiPostLog('/sns/downloadSnsVideo', { snsXml })
      })

      $('btn-sns-quick-like')?.addEventListener('click', async () => {
        const snsId = snsIdForApi($('sns-quick-snsid')?.value)
        if (snsId == null) {
          C.showToast('请填写有效 snsId', 'error')
          return
        }
        const wxid = ($('sns-quick-author')?.value || '').trim() || (C.state.currentTargetWxid || '').trim()
        await likeSnsRequest(snsId, wxid, 1)
      })
      $('btn-sns-quick-unlike')?.addEventListener('click', async () => {
        const snsId = snsIdForApi($('sns-quick-snsid')?.value)
        if (snsId == null) {
          C.showToast('请填写有效 snsId', 'error')
          return
        }
        const wxid = ($('sns-quick-author')?.value || '').trim() || (C.state.currentTargetWxid || '').trim()
        await likeSnsRequest(snsId, wxid, 2)
      })

      $('btn-sns-clear-log')?.addEventListener('click', () => {
        const box = $('sns-api-log-body')
        if (box) box.innerHTML = ''
      })

        ;['sns-user-wxid', 'sns-quick-author', 'sns-comment-wxid'].forEach((id) => {
          $(id)?.addEventListener('focus', refreshSnsTargetDisplays)
          $(id)?.addEventListener('input', refreshSnsTargetDisplays)
          $(id)?.addEventListener('change', refreshSnsTargetDisplays)
        })

      window.addEventListener('hashchange', () => {
        if (location.hash === '#sns') {
          syncSnsUserWxidFromState()
          const qa = $('sns-quick-author')
          if (qa && !(qa.value || '').trim() && (C.state.currentTargetWxid || '').trim()) {
            qa.value = C.state.currentTargetWxid.trim()
          }
          syncSnsCommentWxidFromState()
          refreshSnsTargetDisplays()
        }
      })
      window.addEventListener('wechat-console:state-changed', refreshSnsTargetDisplays)
    }

    function init() {
      switchSnsTab('browse')
      syncSnsUserWxidFromState()
      const qa = $('sns-quick-author')
      if (qa && (C.state.currentTargetWxid || '').trim()) {
        qa.value = C.state.currentTargetWxid.trim()
      }
      syncSnsCommentWxidFromState()
      updateCursorHints()
      refreshSnsTargetDisplays()
      bind()
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  /* ---------- labels-module：标签 ---------- */
  /**
   * 标签管理 — 《标签模块.md》全部 4 个接口
   */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) return

    function $(id) {
      return C.$(id)
    }

    /** 最近一次列表，供卡片操作使用 */
    let lastLabelList = []

    function appendLabelLog(path, responseEnvelope, requestBody, errorMessage) {
      const box = $('label-api-log-body')
      if (!box) return
      const entry = document.createElement('div')
      entry.className = 'profile-log-entry'
      entry.textContent = C.formatApiCallText({
        path,
        requestBody: C.getMergedRequestBody(requestBody ?? {}),
        responseBody: errorMessage ? undefined : responseEnvelope,
        error: errorMessage,
      })
      box.appendChild(entry)
      box.scrollTop = box.scrollHeight
    }

    async function apiPostLog(path, body) {
      try {
        const res = await C.apiPost(path, body)
        appendLabelLog(path, res?.data, body, null)
        return res
      } catch (e) {
        appendLabelLog(path, undefined, body, e?.message || String(e))
        C.showToast(path + ' 失败', 'error')
        return null
      }
    }

    function renderLabelCards() {
      const root = $('label-cards')
      if (!root) return
      root.innerHTML = ''
      if (!lastLabelList.length) {
        const p = document.createElement('p')
        p.className = 'hint'
        p.textContent = '暂无标签数据，请点击左侧「获取标签列表」。'
        root.appendChild(p)
        return
      }
      lastLabelList.forEach((row) => {
        const name = row?.labelName != null ? String(row.labelName) : ''
        const id = row?.labelId
        const card = document.createElement('div')
        card.className = 'lf-card label-card'
        card.innerHTML =
          '<div class="lf-card-main">' +
          '<div class="lf-card-title">' +
          escapeHtml(name || '（无名称）') +
          '</div>' +
          '<div class="lf-card-sub">labelId：' +
          escapeHtml(String(id ?? '—')) +
          '</div></div>' +
          '<div class="lf-card-actions"></div>'
        const actions = card.querySelector('.lf-card-actions')

        const btnCopy = document.createElement('button')
        btnCopy.type = 'button'
        btnCopy.className = 'btn btn-default btn-sm'
        btnCopy.textContent = '复制 ID'
        btnCopy.addEventListener('click', () => {
          const s = String(id ?? '')
          if (!s) return
          copyText(s).then(
            () => C.showToast('已复制 labelId', 'success'),
            () => C.showToast('复制失败', 'error'),
          )
        })

        const btnDel = document.createElement('button')
        btnDel.type = 'button'
        btnDel.className = 'btn btn-default btn-sm'
        btnDel.textContent = '删除标签'
        btnDel.addEventListener('click', async () => {
          const ok = await C.modalConfirm('删除标签', '确定删除标签「' + name + '」（ID ' + id + '）？')
          if (!ok) return
          const res = await apiPostLog('/label/delete', { labelIds: String(id) })
          if (res?.data?.ret === 200) {
            C.showToast('已删除', 'success')
            await refreshLabelListQuiet()
          }
        })

        actions.appendChild(btnCopy)
        actions.appendChild(btnDel)
        root.appendChild(card)
      })
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    function copyText(text) {
      if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
      return new Promise((resolve, reject) => {
        try {
          const ta = document.createElement('textarea')
          ta.value = text
          ta.style.position = 'fixed'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }

    async function refreshLabelListQuiet() {
      const res = await apiPostLog('/label/list', {})
      const env = res?.data
      if (env?.ret === 200 && env?.data && Array.isArray(env.data.labelList)) {
        lastLabelList = env.data.labelList
        renderLabelCards()
      }
    }

    function syncModifyWxids() {
      const ta = $('label-modify-wxids')
      if (!ta) return
      const lock = (C.state.currentTargetWxid || '').trim()
      if (lock && !(ta.value || '').trim()) ta.value = lock
      renderLabelTargetDisplay()
    }

    function parseWxIdsInput(raw) {
      return String(raw || '')
        .split(/[,，\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    }

    function renderLabelTargetDisplay() {
      const ta = $('label-modify-wxids')
      const el = $('label-target-display')
      if (!ta || !el) return
      const ids = parseWxIdsInput(ta.value)
      if (!ids.length) {
        const lock = (C.state.currentTargetWxid || '').trim()
        if (!lock) {
          el.hidden = true
          el.textContent = ''
          return
        }
        const dn =
          (typeof C.lookupContactDisplayName === 'function' && C.lookupContactDisplayName(lock)) ||
          (C.state.currentTargetDisplayName || '').trim()
        el.textContent = dn && dn !== lock ? `当前锁定目标：${dn}（${lock}）` : `当前锁定目标：${lock}`
        el.hidden = false
        return
      }
      const preview = ids.slice(0, 3).map((wxid) => {
        const dn =
          (typeof C.lookupContactDisplayName === 'function' && C.lookupContactDisplayName(wxid)) ||
          ''
        return dn && dn !== wxid ? `${dn}（${wxid}）` : wxid
      })
      const more = ids.length > 3 ? ` 等 ${ids.length} 个对象` : ''
      el.textContent = '当前对象：' + preview.join('，') + more
      el.hidden = false
    }

    function bind() {
      $('btn-label-list')?.addEventListener('click', () => {
        void refreshLabelListQuiet()
      })

      $('btn-label-add')?.addEventListener('click', async () => {
        const labelName = ($('label-add-name')?.value || '').trim()
        if (!labelName) {
          C.showToast('请填写 labelName', 'error')
          return
        }
        const res = await apiPostLog('/label/add', { labelName })
        if (res?.data?.ret === 200) await refreshLabelListQuiet()
      })

      $('btn-label-modify-members')?.addEventListener('click', async () => {
        const wxIds = parseWxIdsInput($('label-modify-wxids')?.value)
        const labelIds = ($('label-modify-labelids')?.value || '').trim()
        if (!wxIds.length) {
          C.showToast('请填写 wxIds', 'error')
          return
        }
        if (!labelIds) {
          C.showToast('请填写 labelIds', 'error')
          return
        }
        const res = await apiPostLog('/label/modifyMemberList', { wxIds, labelIds })
        if (res?.data?.ret === 200) C.showToast('修改已提交', 'success')
      })

      $('btn-label-clear-log')?.addEventListener('click', () => {
        const box = $('label-api-log-body')
        if (box) box.innerHTML = ''
      })

      $('label-modify-wxids')?.addEventListener('focus', renderLabelTargetDisplay)
      $('label-modify-wxids')?.addEventListener('input', renderLabelTargetDisplay)
      $('label-modify-wxids')?.addEventListener('change', renderLabelTargetDisplay)

      window.addEventListener('hashchange', () => {
        if (location.hash === '#labels') syncModifyWxids()
      })
      window.addEventListener('wechat-console:state-changed', renderLabelTargetDisplay)
    }

    function init() {
      syncModifyWxids()
      renderLabelCards()
      renderLabelTargetDisplay()
      bind()
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  /* ---------- favorites-module：收藏夹 ---------- */
  /**
   * 收藏夹 — 《收藏夹模块.md》全部 3 个接口 + 与消息模块联动 postText
   */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) return

    function $(id) {
      return C.$(id)
    }

    /** @type {Map<number, object>} */
    const favorMap = new Map()
    /** @type {Map<number, { desc?: string, fromUsr?: string, snippet?: string }>} */
    const favorDetailCache = new Map()

    let favorSyncKey = ''

    const FAV_TYPE_CN = {
      0: '未知',
      1: '文本',
      2: '图片',
      3: '语音',
      4: '视频',
      5: '文件',
      6: '链接',
      7: '音乐',
      8: '位置',
      9: '转账/账单',
      10: '名片',
      11: '聊天记录/合并',
      14: '小程序',
      18: '笔记',
      21: '视频号',
    }

    function favorTypeCn(t) {
      const n = Number(t)
      if (Number.isNaN(n)) return '未知'
      return FAV_TYPE_CN[n] != null ? FAV_TYPE_CN[n] : '类型 ' + n
    }

    function formatTs(sec) {
      if (sec == null || sec === '') return '—'
      const n = Number(sec)
      if (!Number.isFinite(n) || n <= 0) return String(sec)
      const ms = n < 1e12 ? n * 1000 : n
      try {
        return new Date(ms).toLocaleString('zh-CN', { hour12: false })
      } catch {
        return String(sec)
      }
    }

    /**
     * 从 favitem XML 取 type 属性（仅正则，避免整段解析失败）
     * @param {string} raw
     */
    function parseFavTypeFromXml(raw) {
      try {
        const m = String(raw || '').match(/<favitem[^>]*\btype\s*=\s*"(\d+)"/i)
        if (m) return parseInt(m[1], 10)
      } catch {
        /* ignore */
      }
      return NaN
    }

    /**
     * 安全解析收藏 XML（DOMParser + 正则兜底）
     * @param {string} xmlStr
     */
    function parseFavContentXml(xmlStr) {
      const out = { desc: '', fromUsr: '', snippet: '' }
      if (xmlStr == null || typeof xmlStr !== 'string') return out
      const raw = xmlStr.trim()
      if (!raw) return out

      try {
        const doc = new DOMParser().parseFromString(raw, 'text/xml')
        const pe = doc.querySelector('parsererror')
        if (!pe) {
          const descEl = doc.querySelector('desc')
          if (descEl && descEl.textContent != null) {
            out.desc = String(descEl.textContent).trim()
          }
          const from =
            doc.querySelector('fromusr') ||
            doc.querySelector('fromUsr') ||
            doc.querySelector('FromUsr')
          if (from && from.textContent != null) {
            out.fromUsr = String(from.textContent).trim()
          }
        }
      } catch {
        /* 走正则 */
      }

      try {
        if (!out.desc) {
          const m = raw.match(/<desc[^>]*>([\s\S]*?)<\/desc>/i)
          if (m) out.desc = decodeXmlish(m[1]).trim()
        }
        if (!out.fromUsr) {
          const m2 = raw.match(/<fromusr[^>]*>([\s\S]*?)<\/fromusr>/i)
          if (m2) out.fromUsr = decodeXmlish(m2[1]).trim()
        }
      } catch {
        /* ignore */
      }

      const fallback = raw.replace(/\s+/g, ' ').slice(0, 160)
      out.snippet = (out.desc || fallback || '（无摘要）').trim()
      return out
    }

    function decodeXmlish(s) {
      return String(s || '')
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&amp;/gi, '&')
    }

    function appendFavorLog(path, responseEnvelope, requestBody, errorMessage) {
      const box = $('favor-api-log-body')
      if (!box) return
      const entry = document.createElement('div')
      entry.className = 'profile-log-entry'
      entry.textContent = C.formatApiCallText({
        path,
        requestBody: C.getMergedRequestBody(requestBody ?? {}),
        responseBody: errorMessage ? undefined : responseEnvelope,
        error: errorMessage,
      })
      box.appendChild(entry)
      box.scrollTop = box.scrollHeight
    }

    async function apiPostLog(path, body) {
      try {
        const res = await C.apiPost(path, body)
        appendFavorLog(path, res?.data, body, null)
        return res
      } catch (e) {
        appendFavorLog(path, undefined, body, e?.message || String(e))
        C.showToast(path + ' 失败', 'error')
        return null
      }
    }

    function updateSyncKeyHint() {
      const el = $('favor-sync-key-hint')
      if (!el) return
      if (!favorSyncKey) {
        el.textContent = '当前 syncKey：（未同步或已到末页）'
      } else {
        el.textContent = '当前 syncKey：' + favorSyncKey
      }
    }

    function mergeFavorList(list) {
      if (!Array.isArray(list)) return
      for (const row of list) {
        if (!row || row.favId == null) continue
        const id = Number(row.favId)
        favorMap.set(id, { ...row, favId: id })
      }
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    function getSortedFavorItems() {
      return Array.from(favorMap.values()).sort((a, b) => {
        const ta = Number(a.updateTime) || 0
        const tb = Number(b.updateTime) || 0
        return tb - ta
      })
    }

    function renderFavorCards() {
      const root = $('favor-cards')
      if (!root) return
      root.innerHTML = ''
      const items = getSortedFavorItems()
      if (!items.length) {
        const p = document.createElement('p')
        p.className = 'hint lf-feed-empty'
        p.textContent = '暂无收藏条目，请先「同步收藏夹内容」。'
        root.appendChild(p)
        return
      }

      for (const it of items) {
        const favId = it.favId
        const typeCn = favorTypeCn(it.type)
        const cache = favorDetailCache.get(favId) || {}
        const fromUsr = cache.fromUsr ? cache.fromUsr : '—'
        const descLine = cache.snippet || cache.desc || '（内容摘要：可点左侧「获取详情」拉取 XML）'
        const delMark = Number(it.flag) === 1 ? ' <span class="lf-badge-deleted">已删除 flag=1</span>' : ''

        const card = document.createElement('div')
        card.className = 'lf-card favor-card'
        card.innerHTML =
          '<div class="lf-card-main">' +
          '<div class="lf-card-title">favId ' +
          escapeHtml(String(favId)) +
          delMark +
          '</div>' +
          '<div class="lf-favor-meta">' +
          '<div><strong>[收藏类型]</strong> ' +
          escapeHtml(typeCn) +
          '</div>' +
          '<div><strong>[来源好友]</strong> ' +
          escapeHtml(fromUsr) +
          '</div>' +
          '<div><strong>[收藏时间]</strong> ' +
          escapeHtml(formatTs(it.updateTime)) +
          '</div>' +
          '<div class="lf-favor-desc"><strong>[内容描述]</strong> ' +
          escapeHtml(descLine) +
          '</div>' +
          '</div></div>' +
          '<div class="lf-card-actions"></div>'

        const actions = card.querySelector('.lf-card-actions')
        const btnSend = document.createElement('button')
        btnSend.type = 'button'
        btnSend.className = 'btn btn-primary btn-sm'
        btnSend.textContent = '发送给当前目标'
        btnSend.dataset.favId = String(favId)
        btnSend.addEventListener('click', () => void sendFavorToCurrentTarget(favId, it.type))

        actions.appendChild(btnSend)
        root.appendChild(card)
      }
    }

    function readFavIdFromInput() {
      const raw = ($('favor-favid')?.value || '').trim()
      if (!raw) return NaN
      const n = parseInt(raw, 10)
      return Number.isFinite(n) ? n : NaN
    }

    async function runFavorSync(isNextPage) {
      const body = { syncKey: isNextPage ? favorSyncKey : '' }
      if (isNextPage && !favorSyncKey) {
        C.showToast('暂无下一页 syncKey，请先同步首屏', 'error')
        return
      }
      const res = await apiPostLog('/favor/sync', body)
      const env = res?.data
      if (env?.ret !== 200 || !env?.data) return

      const d = env.data
      if (!isNextPage) {
        favorMap.clear()
        favorDetailCache.clear()
      }
      mergeFavorList(d.list)
      favorSyncKey = typeof d.syncKey === 'string' ? d.syncKey : ''
      updateSyncKeyHint()
      renderFavorCards()
      C.showToast(isNextPage ? '已加载下一页' : '同步完成', 'success')
    }

    async function runGetContent() {
      const favId = readFavIdFromInput()
      if (!Number.isFinite(favId)) {
        C.showToast('请填写有效 favId', 'error')
        return
      }
      const res = await apiPostLog('/favor/getContent', { favId })
      const env = res?.data
      if (env?.ret !== 200 || !env?.data) return
      const dat = env.data
      try {
        if (dat.content) {
          const p = parseFavContentXml(dat.content)
          favorDetailCache.set(favId, p)
        }
      } catch {
        /* ignore */
      }
      if (!favorMap.has(favId)) {
        const xmlType = parseFavTypeFromXml(dat.content)
        favorMap.set(favId, {
          favId,
          type: Number.isFinite(xmlType) ? xmlType : 0,
          flag: dat.flag,
          updateTime: dat.updateTime,
        })
      } else {
        const cur = favorMap.get(favId)
        const xmlType = parseFavTypeFromXml(dat.content)
        favorMap.set(favId, {
          ...cur,
          type: Number.isFinite(xmlType) ? xmlType : cur.type,
          flag: dat.flag != null ? dat.flag : cur.flag,
          updateTime: dat.updateTime != null ? dat.updateTime : cur.updateTime,
        })
      }
      renderFavorCards()
      C.showToast('已获取详情', 'success')
    }

    async function runDelete() {
      const favId = readFavIdFromInput()
      if (!Number.isFinite(favId)) {
        C.showToast('请填写有效 favId', 'error')
        return
      }
      const ok = await C.modalConfirm('删除收藏', '确定删除 favId=' + favId + '？')
      if (!ok) return
      const res = await apiPostLog('/favor/delete', { favId })
      if (res?.data?.ret === 200) {
        const row = favorMap.get(favId)
        if (row) {
          favorMap.set(favId, { ...row, flag: 1 })
        }
        renderFavorCards()
        C.showToast('删除成功', 'success')
      }
    }

    async function sendFavorToCurrentTarget(favId, listType) {
      const toWxid = (C.state.currentTargetWxid || '').trim()
      if (!toWxid) {
        C.showToast('请先在通讯录锁定 currentTargetWxid', 'error')
        return
      }
      const res = await apiPostLog('/favor/getContent', { favId })
      const env = res?.data
      if (env?.ret !== 200) return
      const contentXml = env?.data?.content
      let parsed = { desc: '', fromUsr: '', snippet: '' }
      try {
        parsed = parseFavContentXml(typeof contentXml === 'string' ? contentXml : '')
      } catch {
        /* ignore */
      }
      try {
        if (parsed.desc || parsed.fromUsr) {
          favorDetailCache.set(favId, parsed)
          renderFavorCards()
        }
      } catch {
        /* ignore */
      }

      const xmlTypeGuess = parseFavTypeFromXml(typeof contentXml === 'string' ? contentXml : '')
      const typeForLabel = Number.isFinite(Number(listType))
        ? Number(listType)
        : Number.isFinite(xmlTypeGuess)
          ? xmlTypeGuess
          : 0
      const typeCn = favorTypeCn(typeForLabel)
      const lines = [
        '[转发收藏]',
        'favId: ' + favId,
        '类型: ' + typeCn,
        parsed.fromUsr ? '来源: ' + parsed.fromUsr : null,
        '',
        parsed.desc || parsed.snippet || '（无文本描述，详见服务端收藏原文）',
      ].filter(Boolean)

      const textBody = lines.join('\n')
      const sendRes = await apiPostLog('/message/postText', {
        toWxid,
        content: textBody.slice(0, 8000),
      })
      if (sendRes?.data?.ret === 200) {
        C.showToast('已尝试发送给当前目标', 'success')
      }
    }

    function renderFavorTargetDisplay() {
      const el = $('favor-target-display')
      if (!el) return
      const wxid = (C.state.currentTargetWxid || '').trim()
      if (!wxid) {
        el.hidden = true
        el.textContent = ''
        return
      }
      const dn =
        (typeof C.lookupContactDisplayName === 'function' && C.lookupContactDisplayName(wxid)) ||
        (C.state.currentTargetDisplayName || '').trim()
      el.textContent = dn && dn !== wxid ? `当前发送目标：${dn}（${wxid}）` : `当前发送目标：${wxid}`
      el.hidden = false
    }

    function bind() {
      $('btn-favor-sync')?.addEventListener('click', () => void runFavorSync(false))
      $('btn-favor-sync-more')?.addEventListener('click', () => void runFavorSync(true))
      $('btn-favor-get-content')?.addEventListener('click', () => void runGetContent())
      $('btn-favor-delete')?.addEventListener('click', () => void runDelete())
      $('btn-favor-clear-log')?.addEventListener('click', () => {
        const box = $('favor-api-log-body')
        if (box) box.innerHTML = ''
      })
      window.addEventListener('wechat-console:state-changed', renderFavorTargetDisplay)
    }

    function init() {
      updateSyncKeyHint()
      renderFavorCards()
      renderFavorTargetDisplay()
      bind()
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  /* ---------- webhook-module：推送解析沙箱与终端 ---------- */
  /**
   * 消息推送解析面板 — 规则见《消息推送内容.txt》
   */
  ; (function () {
    const C = window.WechatConsoleCore
    const WEBHOOK_RECV_URL_KEY = C.WEBHOOK_RECV_URL_STORAGE_KEY
    const TERMINAL_MAX_LINES = 800

    function $(id) {
      return document.getElementById(id)
    }

    function toast(msg, type) {
      if (C && typeof C.showToast === 'function') C.showToast(msg, type || 'info')
    }

    /**
     * 取文档中的 .string 包装或裸字符串
     * @param {*} v
     */
    function strField(v) {
      if (v == null) return ''
      if (typeof v === 'string') return v
      if (typeof v === 'object' && v.string != null) return String(v.string)
      return String(v)
    }

    /**
     * 群聊 Content：文档示例 wxid_xxx:\n正文。优先按用户要求的 `:\n` 分割，再兼容 :\r\n。
     * @param {string} s
     * @returns {{ speaker: string, body: string }}
     */
    function splitGroupContentByColonNewline(s) {
      if (typeof s !== 'string') return { speaker: '', body: '' }
      const parts = s.split(':\n')
      if (parts.length >= 2) {
        return { speaker: parts[0], body: parts.slice(1).join(':\n') }
      }
      const parts2 = s.split(':\r\n')
      if (parts2.length >= 2) {
        return { speaker: parts2[0], body: parts2.slice(1).join(':\r\n') }
      }
      return { speaker: '', body: s }
    }

    /**
     * 是否群相关：非机器人发群消息 From 以 @chatroom 结尾；机器人发群消息 To 以 @chatroom 结尾（文档）。
     * @param {string} from
     * @param {string} to
     */
    function isGroupChatContext(from, to) {
      return from.endsWith('@chatroom') || to.endsWith('@chatroom')
    }

    function groupIdFrom(from, to) {
      if (from.endsWith('@chatroom')) return from
      if (to.endsWith('@chatroom')) return to
      return ''
    }

    /**
     * 深度解析推送 JSON，输出终端片段（行文本或可折叠原始 JSON）。
     * @param {unknown} jsonData
     * @returns {{ segments: Array<{ type: 'line', text: string, lineClass?: string } | { type: 'fold', data: unknown }> }}
     */
    function parsePushData(jsonData) {
      const segments = []

      if (jsonData === null || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
        segments.push({
          type: 'fold',
          data: jsonData,
        })
        return { segments }
      }

      const o = /** @type {Record<string, unknown>} */ (jsonData)
      const appid = o.Appid != null ? String(o.Appid) : o.appId != null ? String(o.appId) : ''
      const wxid = o.Wxid != null ? String(o.Wxid) : ''

      segments.push({
        type: 'line',
        text: '基础信息 · Appid: ' + (appid || '（无）') + ' | 归属微信 Wxid: ' + (wxid || '（无）'),
        lineClass: 'webhook-line-meta',
      })

      const typeName = o.TypeName != null ? String(o.TypeName) : ''

      if (typeName === 'DelContacts') {
        const data = o.Data
        const userName = data && typeof data === 'object' ? strField(/** @type {any} */(data).UserName) : ''
        const line =
          '🔴 [删除好友通知] 微信 ' + wxid + ' 被 ' + (userName || '（未知）') + ' 删除'
        segments.push({ type: 'line', text: line, lineClass: 'webhook-line-event' })
        return { segments }
      }

      if (typeName === 'AddMsg') {
        const data = o.Data
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          segments.push({ type: 'fold', data: jsonData })
          return { segments }
        }

        const d = /** @type {Record<string, unknown>} */ (data)
        const from = strField(d.FromUserName)
        const to = strField(d.ToUserName)
        const contentRaw = strField(d.Content)
        const isSelf = from === wxid
        const selfMark = isSelf ? '[自己发出的消息] ' : ''

        if (isGroupChatContext(from, to)) {
          const gid = groupIdFrom(from, to) || '（未知群）'
          let member = from
          let body = contentRaw
          if (from.endsWith('@chatroom')) {
            const sp = splitGroupContentByColonNewline(contentRaw)
            if (sp.speaker) {
              member = sp.speaker
              body = sp.body
            }
          } else if (to.endsWith('@chatroom')) {
            const sp = splitGroupContentByColonNewline(contentRaw)
            if (sp.speaker) {
              member = sp.speaker
              body = sp.body
            }
          }

          const line =
            selfMark +
            '🟡 [群聊消息] 群(' +
            gid +
            ') - 成员(' +
            (member || '（未知）') +
            ') : ' +
            body
          segments.push({
            type: 'line',
            text: line,
            lineClass: isSelf ? 'webhook-line-self' : 'webhook-line-group',
          })
          return { segments }
        }

        const line =
          selfMark +
          '🟢 [私聊消息] ' +
          (from || '（无）') +
          ' -> ' +
          (to || '（无）') +
          ' : ' +
          contentRaw
        segments.push({
          type: 'line',
          text: line,
          lineClass: isSelf ? 'webhook-line-self' : 'webhook-line-private',
        })
        return { segments }
      }

      segments.push({ type: 'fold', data: jsonData })
      return { segments }
    }

    function stringifyJson(v) {
      try {
        return JSON.stringify(v, null, 2)
      } catch {
        return String(v)
      }
    }

    function trimTerminalLines(term) {
      const lines = term.querySelectorAll('.webhook-terminal-line, .webhook-terminal-fold')
      while (lines.length > TERMINAL_MAX_LINES) {
        lines[0].remove()
      }
    }

    /**
     * @param {{ segments: ReturnType<typeof parsePushData>['segments'] }} parsed
     */
    function appendParsedToTerminal(parsed) {
      const term = $('webhook-terminal')
      if (!term || !parsed?.segments) return

      const ts = new Date().toLocaleString('zh-CN', { hour12: false })
      const sep = document.createElement('div')
      sep.className = 'webhook-terminal-line webhook-line-ts'
      sep.textContent = '—— ' + ts + ' ——'
      term.appendChild(sep)

      for (const seg of parsed.segments) {
        if (seg.type === 'line') {
          const div = document.createElement('div')
          div.className = 'webhook-terminal-line ' + (seg.lineClass || '')
          div.textContent = seg.text
          term.appendChild(div)
        } else if (seg.type === 'fold') {
          const wrap = document.createElement('details')
          wrap.className = 'webhook-terminal-fold'
          wrap.open = false
          const sum = document.createElement('summary')
          sum.textContent = '▼ 未匹配或需查看完整结构 · 原始 JSON（点击展开）'
          const pre = document.createElement('pre')
          pre.className = 'webhook-terminal-pre'
          pre.textContent = stringifyJson(seg.data)
          wrap.appendChild(sum)
          wrap.appendChild(pre)
          term.appendChild(wrap)
        }
      }

      trimTerminalLines(term)
      term.scrollTop = term.scrollHeight
    }

    function appendParseError(rawInput, errMsg) {
      const term = $('webhook-terminal')
      if (!term) return
      const ts = new Date().toLocaleString('zh-CN', { hour12: false })
      const head = document.createElement('div')
      head.className = 'webhook-terminal-line webhook-line-ts'
      head.textContent = '—— ' + ts + ' ——'
      term.appendChild(head)
      const err = document.createElement('div')
      err.className = 'webhook-terminal-line webhook-line-err'
      err.textContent = '⚠ JSON 解析失败: ' + (errMsg || '') + ' · 原始片段见下方折叠'
      term.appendChild(err)
      const wrap = document.createElement('details')
      wrap.className = 'webhook-terminal-fold'
      const sum = document.createElement('summary')
      sum.textContent = '▼ 原始输入'
      const pre = document.createElement('pre')
      pre.className = 'webhook-terminal-pre'
      pre.textContent = typeof rawInput === 'string' ? rawInput : stringifyJson(rawInput)
      wrap.appendChild(sum)
      wrap.appendChild(pre)
      term.appendChild(wrap)
      trimTerminalLines(term)
      term.scrollTop = term.scrollHeight
    }

    /**
     * 外部接入：传入 JSON 字符串或已解析对象（WebSocket / 控制台调试）。
     * @param {string | object} json
     */
    function handlePushMessage(json) {
      if (json == null) {
        appendParseError('', '空输入')
        return
      }
      if (typeof json === 'string') {
        const t = json.trim()
        if (!t) {
          appendParseError('', '空字符串')
          return
        }
        try {
          const data = JSON.parse(t)
          appendParsedToTerminal(parsePushData(data))
        } catch (e) {
          appendParseError(t, e?.message || String(e))
        }
        return
      }
      if (typeof json === 'object') {
        appendParsedToTerminal(parsePushData(json))
        return
      }
      appendParsedToTerminal(parsePushData(json))
    }

    function loadWebhookUrl() {
      const input = $('webhook-url-input')
      if (!input) return
      try {
        const v = localStorage.getItem(WEBHOOK_RECV_URL_KEY)
        if (v) input.value = v
      } catch {
        /* ignore */
      }
    }

    function saveWebhookUrl() {
      const input = $('webhook-url-input')
      if (!input) return
      const v = (input.value || '').trim()
      try {
        localStorage.setItem(WEBHOOK_RECV_URL_KEY, v)
        toast(v ? '已保存接收地址到本地' : '已清空本地保存的地址', 'success')
      } catch {
        toast('无法写入 localStorage', 'error')
      }
    }

    function simulateFromTextarea() {
      const ta = $('webhook-json-sandbox')
      if (!ta) return
      handlePushMessage(ta.value)
    }

    function clearTerminal() {
      const term = $('webhook-terminal')
      if (term) term.innerHTML = ''
    }

    function bind() {
      $('btn-webhook-save-url')?.addEventListener('click', saveWebhookUrl)
      $('btn-webhook-simulate')?.addEventListener('click', simulateFromTextarea)
      $('btn-webhook-clear-terminal')?.addEventListener('click', clearTerminal)
    }

    function init() {
      loadWebhookUrl()
      bind()
    }

    window.parsePushData = parsePushData
    window.handlePushMessage = handlePushMessage

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  /* ---------- raw-log-export：各模块原始日志导出 ---------- */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) return

    const EXPORT_CONFIG = [
      ['btn-login-export-log', 'login-api-log-body', 'login-raw-log'],
      ['btn-profile-export-log', 'profile-log-body', 'profile-raw-log'],
      ['btn-contacts-export-log', 'contacts-module-log-body', 'contacts-raw-log'],
      ['btn-msg-export-log', 'messages-api-log-body', 'messages-raw-log'],
      ['btn-sns-export-log', 'sns-api-log-body', 'sns-raw-log'],
      ['btn-label-export-log', 'label-api-log-body', 'labels-raw-log'],
      ['btn-favor-export-log', 'favor-api-log-body', 'favorites-raw-log'],
    ]

    function makeStamp() {
      return new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    }

    function downloadText(text, filename) {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    }

    function collectLogText(box) {
      if (!box) return ''
      const chunks = Array.from(box.children)
        .map((node) => (node.textContent || '').trim())
        .filter(Boolean)
      if (chunks.length > 0) {
        return chunks.join('\n\n========================================\n\n')
      }
      return (box.textContent || '').trim()
    }

    function bindExportButton(buttonId, boxId, filenamePrefix) {
      const btn = C.$(buttonId)
      const box = C.$(boxId)
      if (!btn || !box) return
      btn.addEventListener('click', () => {
        const text = collectLogText(box)
        if (!text) {
          C.showToast('当前没有可导出的原始日志', 'info')
          return
        }
        downloadText(text, `${filenamePrefix}_${makeStamp()}.txt`)
        C.showToast('已导出原始日志', 'success')
      })
    }

    function init() {
      EXPORT_CONFIG.forEach(([buttonId, boxId, filenamePrefix]) => {
        bindExportButton(buttonId, boxId, filenamePrefix)
      })
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()

  /* ---------- api-log：调用记录表格与导出 JSON ---------- */
  /**
   * 调用记录日志：列表展示 + 导出原始请求/响应
   */
  ; (function () {
    const C = window.WechatConsoleCore
    if (!C) return

    const MAX_UI_ROWS = 200

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    function renderTable() {
      const tbody = C.$('api-log-tbody')
      if (!tbody) return
      const rows = C.getApiRuntimeLog().slice(-MAX_UI_ROWS).reverse()
      if (rows.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="api-log-empty">暂无记录，发起任意接口请求后将在此显示。</td></tr>'
        return
      }
      tbody.innerHTML = rows
        .map((r) => {
          const st = r.responseHttpStatus != null ? r.responseHttpStatus : '—'
          const ret = r.responseBody && typeof r.responseBody.ret === 'number' ? r.responseBody.ret : '—'
          const err = r.error ? `<span class="api-log-err">${escapeHtml(r.error)}</span>` : '—'
          const t = escapeHtml(r.at || '')
          const p = escapeHtml(C.formatApiPathLabel(r.path || ''))
          const ms = r.durationMs != null ? `${r.durationMs} ms` : '—'
          return `<tr>
          <td class="api-log-time">${t}</td>
          <td class="api-log-path"><code>${p}</code></td>
          <td>${st}</td>
          <td>${ret}</td>
          <td>${err}</td>
          <td>${ms}</td>
        </tr>`
        })
        .join('')
    }

    function buildExportObject() {
      const runtimeLog = C.getApiRuntimeLog().map((entry, index) => ({
        index: index + 1,
        at: entry.at,
        method: entry.method,
        path: entry.path,
        pathLabel: C.formatApiPathLabel(entry.path || ''),
        fullUrl: entry.fullUrl,
        requestHeaders: entry.requestHeaders,
        requestBodyRaw: entry.requestBodyRaw,
        requestBodyMerged: entry.requestBody,
        responseHttpStatus: entry.responseHttpStatus,
        responseBody: entry.responseBody,
        error: entry.error,
        durationMs: entry.durationMs,
      }))

      return {
        exportVersion: 2,
        exportedAt: new Date().toISOString(),
        description: '控制台会话内的原始请求/响应日志导出。requestBodyRaw 为调用时传入参数，requestBodyMerged 为自动合并全局 appId 后的最终请求体。',
        baseUrl: C.BASE_URL,
        runtimeLogCount: runtimeLog.length,
        runtimeLog,
      }
    }

    function downloadJson(obj, filename) {
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    }

    function onExport() {
      try {
        const data = buildExportObject()
        const name = `api-runtime-log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
        downloadJson(data, name)
        C.showToast('已导出原始调用日志 JSON', 'success')
      } catch (e) {
        C.showModal('导出失败', e?.message || String(e))
      }
    }

    function onClear() {
      C.clearApiRuntimeLog()
      renderTable()
      C.showToast('已清空调用记录', 'info')
    }

    function onRefresh() {
      renderTable()
      C.showToast('已刷新', 'info')
    }

    function init() {
      C.$('btn-api-log-export')?.addEventListener('click', onExport)
      C.$('btn-api-log-clear')?.addEventListener('click', onClear)
      C.$('btn-api-log-refresh')?.addEventListener('click', onRefresh)
      C.subscribeApiLog(renderTable)
      renderTable()
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  })()
