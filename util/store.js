/* ============================================
   本地存储模块 - 基于 uni.Storage 的持久化数据层
   拦截所有后端 API 请求，读写本地存储
   ============================================ */

const BASE_URL = 'http://cash.local'

const STORAGE_KEY_BILLS = 'cash_bills'
const STORAGE_KEY_DESTS = 'cash_dests'
const STORAGE_KEY_NEXT_ID = 'cash_next_id'
const STORAGE_KEY_CATS = 'cash_cats'
const STORAGE_KEY_RECUR = 'cash_recurring'

const DEFAULT_DESTS = ['支付宝', '微信']
const EXPENSE_CATEGORIES = ['餐饮美食', '购物消费', '交通出行', '日常生活', '文教娱乐', '充值缴费', '旅游住宿', '医药医疗', '美容保养', '亲子宠物', '债务还款', '其他']
const INCOME_CATEGORIES = ['基本工资', '奖金补贴', '生活费', '红包', '礼金礼物', '现金支取', '理财盈亏', '债务收款', '公益慈善']

const ICON_LIBRARY = [
  { n: '餐饮美食', f: '/static/img/icon/02.png' },
  { n: '购物消费', f: '/static/img/icon/03.png' },
  { n: '交通出行', f: '/static/img/icon/07.png' },
  { n: '日常生活', f: '/static/img/icon/01.png' },
  { n: '文教娱乐', f: '/static/img/icon/04.png' },
  { n: '充值缴费', f: '/static/img/icon/05.png' },
  { n: '旅游住宿', f: '/static/img/icon/06.png' },
  { n: '医药医疗', f: '/static/img/icon/08.png' },
  { n: '美容保养', f: '/static/img/icon/09.png' },
  { n: '亲子宠物', f: '/static/img/icon/10.png' },
  { n: '债务还款', f: '/static/img/icon/11.png' },
  { n: '其他支出', f: '/static/img/icon/12.png' },
  { n: '基本工资', f: '/static/img/icon/13.png' },
  { n: '奖金补贴', f: '/static/img/icon/14.png' },
  { n: '生活费',   f: '/static/img/icon/15.png' },
  { n: '红包',     f: '/static/img/icon/16.png' },
  { n: '礼金礼物', f: '/static/img/icon/17.png' },
  { n: '现金支取', f: '/static/img/icon/18.png' },
  { n: '理财盈亏', f: '/static/img/icon/19.png' },
  { n: '债务收款', f: '/static/img/icon/20.png' },
  { n: '公益慈善', f: '/static/img/icon/21.png' },
]

function catObj(name) {
  const found = ICON_LIBRARY.find(i => i.n === name)
  return { name, icon: found ? found.f : '/static/img/icon/12.png' }
}

function defaultCats() {
  return {
    out: EXPENSE_CATEGORIES.map(catObj),
    in: INCOME_CATEGORIES.map(catObj)
  }
}
const EXPENSE_NAMES = ['午餐', '晚餐', '早餐', '咖啡', '奶茶', '超市购物', '外卖', '水果', '零食', '公交地铁', '打车', '加油', '话费充值', '电影票', '理发', '护肤品', '药品', '猫粮', '书籍', '游戏', '礼物', '房租', '水电费', '维修', '日用品', 'T恤', '运动鞋', '聚餐', '门票', '停车费']
const INCOME_NAMES = ['月工资', '项目奖金', '差旅报销', '周末兼职', '微信红包', '理财收益', '购物退款', '生日礼金', '季度奖金']
const DEFAULT_BOOKS = ['日常账本', '旅行账本', '家庭账本', '汽车消费', '投资收益', '亲子开销']

/* ---------- 工具函数 ---------- */
function pad(n) { return n < 10 ? '0' + n : '' + n }
function formatDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }
function formatDateTime(d, h, m, s) { return formatDate(d) + ' ' + pad(h || 0) + ':' + pad(m || 0) + ':' + pad(s || 0) }

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash = hash | 0 }
  return Math.abs(hash)
}

class SRNG {
  constructor(seed) { this.seed = seed }
  next() { this.seed = (this.seed * 16807 + 0) % 2147483647; return this.seed / 2147483647 }
  int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min }
  pick(arr) { return arr[this.int(0, arr.length - 1)] }
}

function extractDate(timeStr) {
  if (!timeStr) return formatDate(new Date())
  const idx = timeStr.indexOf(' ')
  return idx > 0 ? timeStr.substring(0, idx) : timeStr.substring(0, 10)
}

/* ---------- 内存数据 ---------- */
let allBills = []
let allDests = [...DEFAULT_DESTS]
let allCats = defaultCats()
let allRecurring = []
let nextBillId = 1000
const billsByDate = {}

/* ---------- 持久化 ---------- */
function saveBills() {
  try { uni.setStorageSync(STORAGE_KEY_BILLS, JSON.stringify(allBills)) } catch (e) { console.error('[Store] 保存 bills 失败', e) }
}
function saveDests() {
  try { uni.setStorageSync(STORAGE_KEY_DESTS, JSON.stringify(allDests)) } catch (e) { console.error('[Store] 保存 dests 失败', e) }
}
function saveCats() {
  try { uni.setStorageSync(STORAGE_KEY_CATS, JSON.stringify(allCats)) } catch (e) { console.error('[Store] 保存 cats 失败', e) }
}
function saveRecurring() {
  try { uni.setStorageSync(STORAGE_KEY_RECUR, JSON.stringify(allRecurring)) } catch (e) { console.error('[Store] 保存 recurring 失败', e) }
}
function saveNextId() {
  try { uni.setStorageSync(STORAGE_KEY_NEXT_ID, nextBillId) } catch (e) { console.error('[Store] 保存 nextId 失败', e) }
}

function loadAll() {
  try {
    const rawBills = uni.getStorageSync(STORAGE_KEY_BILLS)
    if (rawBills) allBills = JSON.parse(rawBills)
    repairBills()
  } catch (e) { allBills = [] }
  try {
    const rawDests = uni.getStorageSync(STORAGE_KEY_DESTS)
    if (rawDests) allDests = JSON.parse(rawDests)
  } catch (e) { allDests = [...DEFAULT_DESTS] }
  try {
    const rawCats = uni.getStorageSync(STORAGE_KEY_CATS)
    if (rawCats) {
      allCats = JSON.parse(rawCats)
      for (const k of ['out', 'in']) {
        if (allCats[k] && allCats[k].length > 0 && typeof allCats[k][0] === 'string') {
          allCats[k] = allCats[k].map(name => catObj(name))
        }
      }
    }
  } catch (e) { allCats = defaultCats() }
  try {
    const rawRecur = uni.getStorageSync(STORAGE_KEY_RECUR)
    if (rawRecur) allRecurring = JSON.parse(rawRecur)
  } catch (e) { allRecurring = [] }
  try {
    const rawId = uni.getStorageSync(STORAGE_KEY_NEXT_ID)
    if (rawId) nextBillId = Number(rawId) || 1000
  } catch (e) { nextBillId = 1000 }
}

function repairBills() {
  let fixed = 0
  for (const b of allBills) {
    if (typeof b.money !== 'number') {
      b.money = parseFloat(String(b.money).replace(/[^0-9.]/g, '')) || 0
      fixed++
    }
  }
  if (fixed > 0) {
    saveBills()
  }
}

function rebuildIndex() {
  for (const k of Object.keys(billsByDate)) delete billsByDate[k]
  for (const b of allBills) {
    const d = extractDate(b.time)
    if (!billsByDate[d]) billsByDate[d] = []
    billsByDate[d].push(b)
  }
}

/* ---------- Seed 初始数据 ---------- */
function seedData() {
  const today = new Date()
  allBills = []
  nextBillId = 1000
  for (const k of Object.keys(billsByDate)) delete billsByDate[k]

  for (let d = 0; d < 62; d++) {
    const date = new Date(today.getTime() - (62 - d) * 24 * 3600 * 1000)
    const dateStr = formatDate(date)
    const rng = new SRNG(hashCode(dateStr))
    const count = rng.int(1, 5)
    for (let i = 0; i < count; i++) {
      const isExpense = rng.next() > 0.12
      const type = isExpense ? rng.pick(EXPENSE_CATEGORIES) : rng.pick(INCOME_CATEGORIES)
      const name = isExpense ? rng.pick(EXPENSE_NAMES) : rng.pick(INCOME_NAMES)
      const dest = rng.pick(DEFAULT_DESTS)
      const book = rng.pick(DEFAULT_BOOKS)
      const money = isExpense ? rng.int(6, 200) : rng.int(500, 5000)
      const hour = rng.int(7, 22)
      const minute = rng.int(0, 59)
      const second = rng.int(0, 59)
      const time = formatDateTime(date, hour, minute, second)
      const bill = {
        book, dest, id: nextBillId++,
        inorout: isExpense ? '支出' : '收入',
        money, name,
        remark: name + (isExpense ? '消费' : '到账'),
        time, type
      }
      allBills.push(bill)
      if (!billsByDate[dateStr]) billsByDate[dateStr] = []
      billsByDate[dateStr].push(bill)
    }
  }
  nextBillId = 1000 + allBills.length
  saveBills()
  saveNextId()
}

/* ---------- 查询辅助 ---------- */
function getBillsForTime(timeStr, destName, bookName) {
  if (timeStr === 'today' || timeStr === 'week' || timeStr === 'month' || timeStr === 'year') {
    const now = new Date()
    return allBills.filter(b => {
      if (destName && b.dest !== destName) return false
      if (bookName && b.book !== bookName) return false
      const bd = new Date(extractDate(b.time))
      if (timeStr === 'today') return bd.toDateString() === now.toDateString()
      if (timeStr === 'week') return (now - bd) <= 7 * 24 * 3600 * 1000
      if (timeStr === 'month') return bd.getMonth() === now.getMonth() && bd.getFullYear() === now.getFullYear()
      if (timeStr === 'year') return bd.getFullYear() === now.getFullYear()
      return false
    })
  }
  const date = extractDate(timeStr)
  let bills = billsByDate[date] || []
  if (destName) bills = bills.filter(b => b.dest === destName)
  if (bookName) bills = bills.filter(b => b.book === bookName)
  return bills.map(b => ({ ...b }))
}

function getDestBalances() {
  const map = {}
  for (const d of allDests) map[d] = 0
  for (const b of allBills) {
    if (!map.hasOwnProperty(b.dest)) map[b.dest] = 0
    if (b.inorout === '收入') map[b.dest] += b.money
    else map[b.dest] -= b.money
  }
  return map
}

function getDerivedBooks() {
  const bookSet = new Set(DEFAULT_BOOKS)
  for (const b of allBills) bookSet.add(b.book)
  const books = []
  for (const name of bookSet) {
    const bills = allBills.filter(b => b.book === name)
    const inSum = bills.filter(b => b.inorout === '收入').reduce((s, b) => s + (typeof b.money === 'number' ? b.money : Number(b.money)), 0)
    const outSum = bills.filter(b => b.inorout === '支出').reduce((s, b) => s + (typeof b.money === 'number' ? b.money : Number(b.money)), 0)
    books.push({ id: books.length + 1, name, count: bills.length, creat_time: '2023-0' + ((books.length % 12) + 1) + '-' + pad((books.length + 1) * 3), in_sum: inSum, out_sum: outSum })
  }
  return books
}

/* ---------- 各端点处理 ---------- */
function handleRequest(path, data) {
  switch (path) {
    case '/insert_account': {
      const money = typeof data.money === 'string' ? parseFloat(data.money) || 0 : (Number(data.money) || 0)
      const time = data.time || formatDateTime(new Date(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds())
      const bill = {
        book: data.book || '日常账本',
        dest: data.dest || '微信',
        id: nextBillId++,
        inorout: data.inorout || '支出',
        money: money,
        name: data.name || '未命名',
        remark: data.remark || '',
        time: time,
        type: data.type || '其他'
      }
      allBills.push(bill)
      const dateKey = extractDate(time)
      if (!billsByDate[dateKey]) billsByDate[dateKey] = []
      billsByDate[dateKey].push(bill)
      saveBills()
      saveNextId()
      return { ret: 'success' }
    }

    case '/insert_dest': {
      const name = data && data.name
      if (name && allDests.indexOf(name) === -1) {
        allDests.push(name)
        saveDests()
      }
      return { ret: 'success' }
    }

    case '/query_categories': {
      return allCats
    }

    case '/query_icon_list': {
      return ICON_LIBRARY
    }

    case '/insert_category': {
      if (data && data.name && data.catType) {
        const list = allCats[data.catType]
        const icon = data.icon || '/static/img/icon/12.png'
        if (list && !list.find(c => (c.name || c) === data.name)) {
          list.push({ name: data.name, icon: icon })
          saveCats()
        }
      }
      return { ret: 'success' }
    }

    case '/delete_category': {
      if (data && data.name && data.catType) {
        const list = allCats[data.catType]
        if (list) {
          allCats[data.catType] = list.filter(c => (c.name || c) !== data.name)
          saveCats()
        }
      }
      return { ret: 'success' }
    }

    case '/query_recurring': {
      return allRecurring
    }

    case '/query_all_bills': {
      return allBills.map(b => ({ ...b }))
    }

    case '/query_total_count': {
      return { count: allBills.length }
    }

    case '/insert_recurring': {
      if (data) {
        allRecurring.push({
          id: Date.now(), name: data.name || '', type: data.type || '', inorout: data.inorout || '支出',
          money: Number(data.money) || 0, dest: data.dest || '微信', book: data.book || '日常账本',
          cycle: data.cycle || 'month', nextDate: data.nextDate || formatDate(new Date()), active: true
        })
        saveRecurring()
      }
      return { ret: 'success' }
    }

    case '/delete_recurring': {
      if (data && data.id) allRecurring = allRecurring.filter(r => r.id !== Number(data.id))
      saveRecurring()
      return { ret: 'success' }
    }

    case '/toggle_recurring': {
      if (data && data.id) {
        const r = allRecurring.find(r => r.id === Number(data.id))
        if (r) { r.active = !r.active; saveRecurring() }
      }
      return { ret: 'success' }
    }

    case '/delete_item_by_id': {
      if (data && data.id) {
        const id = Number(data.id)
        const idx = allBills.findIndex(b => b.id === id)
        if (idx !== -1) {
          const removed = allBills.splice(idx, 1)[0]
          const dateKey = extractDate(removed.time)
          if (billsByDate[dateKey]) {
            const di = billsByDate[dateKey].findIndex(b => b.id === id)
            if (di !== -1) billsByDate[dateKey].splice(di, 1)
          }
          saveBills()
        }
      }
      return { ret: 'success' }
    }

    case '/update_item_by_id': {
      if (data && data.id) {
        const id = Number(data.id)
        const bill = allBills.find(b => b.id === id)
        if (bill) {
          const oldDateKey = extractDate(bill.time)
          if (data.name !== undefined) bill.name = data.name
          if (data.type !== undefined) bill.type = data.type
          if (data.inorout !== undefined) bill.inorout = data.inorout
          if (data.dest !== undefined) bill.dest = data.dest
          if (data.money !== undefined) bill.money = typeof data.money === 'string' ? parseFloat(data.money) || 0 : Number(data.money) || 0
          if (data.time !== undefined) bill.time = data.time
          if (data.book !== undefined) bill.book = data.book
          if (data.remark !== undefined) bill.remark = data.remark
          const newDateKey = extractDate(bill.time)
          if (oldDateKey !== newDateKey) {
            if (billsByDate[oldDateKey]) {
              const di = billsByDate[oldDateKey].findIndex(b => b.id === id)
              if (di !== -1) billsByDate[oldDateKey].splice(di, 1)
            }
            if (!billsByDate[newDateKey]) billsByDate[newDateKey] = []
            billsByDate[newDateKey].push(bill)
          }
          saveBills()
        }
      }
      return { ret: 'success' }
    }

    case '/query_get_bookslist_detail':
      return getDerivedBooks()

    case '/query_get_destlist':
      return getDestBalances()

    case '/query_all_dest_sum': {
      const balances = getDestBalances()
      const total = Object.values(balances).reduce((s, v) => s + v, 0)
      return { sum: total }
    }

    case '/query_one_dest_sum': {
      const dest = (data && data.destname) || '微信'
      const balances = getDestBalances()
      return { sum: balances[dest] || 0 }
    }

    case '/query_by_time': {
      const time = (data && data.time) || formatDate(new Date())
      return getBillsForTime(time)
    }

    case '/query_by_time_book_itemlist': {
      const time = (data && data.time) || formatDate(new Date())
      const book = (data && data.bookname) || '日常账本'
      return getBillsForTime(time, null, book)
    }

    case '/query_by_time_dest_itemlist': {
      const time = (data && data.time) || formatDate(new Date())
      const dest = (data && data.destname) || '微信'
      return getBillsForTime(time, dest, null)
    }

    case '/query_sum_by_time': {
      const time = (data && data.time) || 'month'
      const inorout = (data && data.inorout) || 'out'
      const bills = getBillsForTime(time)
      const filtered = bills.filter(b =>
        (inorout === 'in' && b.inorout === '收入') || (inorout === 'out' && b.inorout === '支出')
      )
      return { sum: filtered.reduce((s, b) => s + (typeof b.money === 'number' ? b.money : Number(b.money)), 0) }
    }

    case '/query_sum_by_time_dest': {
      const time = (data && data.time) || 'month'
      const inorout = (data && data.inorout) || 'out'
      const dest = (data && data.destname) || '微信'
      const bills = getBillsForTime(time, dest, null)
      const filtered = bills.filter(b =>
        (inorout === 'in' && b.inorout === '收入') || (inorout === 'out' && b.inorout === '支出')
      )
      return { sum: filtered.reduce((s, b) => s + (typeof b.money === 'number' ? b.money : Number(b.money)), 0) }
    }

    case '/query_sum_by_time_group': {
      const time = (data && data.time) || 'month'
      const inorout = (data && data.inorout) || 'out'
      const label = inorout === 'in' ? '收入' : '支出'
      const bills = getBillsForTime(time).filter(b => b.inorout === label)
      const groupMap = {}
      for (const b of bills) {
        groupMap[b.type] = (groupMap[b.type] || 0) + (typeof b.money === 'number' ? b.money : Number(b.money))
      }
      const keys = Object.keys(groupMap)
      if (keys.length === 0) {
        const defaultTypes = inorout === 'out' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
        return defaultTypes.map(t => ({ sum: 0, type: t }))
      }
      return keys.map(k => ({ sum: groupMap[k], type: k })).sort((a, b) => b.sum - a.sum)
    }

    case '/query_day_summary': {
      const time = (data && data.time) || formatDate(new Date())
      const bills = getBillsForTime(time)
      const inSum = bills.filter(b => b.inorout === '收入').reduce((s, b) => s + (typeof b.money === 'number' ? b.money : Number(b.money)), 0)
      const outSum = bills.filter(b => b.inorout === '支出').reduce((s, b) => s + (typeof b.money === 'number' ? b.money : Number(b.money)), 0)
      return { bills, inSum, outSum, date: time }
    }

    case '/query_month_daily_sums': {
      const yearMonth = (data && data.yearMonth) || (formatDate(new Date()).substring(0, 7))
      const days = {}
      const [y, m] = yearMonth.split('-').map(Number)
      const daysInMonth = new Date(y, m, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = yearMonth + '-' + pad(d)
        const dayBills = billsByDate[dateStr] || []
        days[dateStr] = {
          inSum: dayBills.filter(b => b.inorout === '收入').reduce((s, b) => s + (typeof b.money === 'number' ? b.money : Number(b.money)), 0),
          outSum: dayBills.filter(b => b.inorout === '支出').reduce((s, b) => s + (typeof b.money === 'number' ? b.money : Number(b.money)), 0)
        }
      }
      return { days, yearMonth }
    }

    case '/import_bills': {
      const bills = (data && data.bills) || []
      if (!bills.length) return { ret: 'success', count: 0 }
      let count = 0
      for (const b of bills) {
        const bill = {
          book: b.book || '日常账本',
          dest: b.dest || '微信',
          id: nextBillId++,
          inorout: b.inorout || '支出',
          money: typeof b.money === 'string' ? parseFloat(b.money) || 0 : (Number(b.money) || 0),
          name: b.name || '未命名',
          remark: b.remark || '',
          time: b.time || formatDateTime(new Date(), 12, 0, 0),
          type: b.type || '其他'
        }
        allBills.push(bill)
        const dateKey = extractDate(bill.time)
        if (!billsByDate[dateKey]) billsByDate[dateKey] = []
        billsByDate[dateKey].push(bill)
        count++
      }
      saveBills()
      saveNextId()
      return { ret: 'success', count }
    }

    case '/seed_data': {
      seedData()
      return { ret: 'success', count: allBills.length }
    }

    case '/reset_store': {
      allBills = []
      for (const k of Object.keys(billsByDate)) delete billsByDate[k]
      allDests = [...DEFAULT_DESTS]
      allCats = defaultCats()
      allRecurring = []
      nextBillId = 1000
      saveBills()
      saveDests()
      saveCats()
      saveRecurring()
      saveNextId()
      return { ret: 'success' }
    }

    default:
      return {}
  }
}

function checkRecurring() {
  const today = formatDate(new Date())
  let inserted = 0
  for (const r of allRecurring) {
    if (!r.active) continue
    if (r.nextDate <= today) {
      allBills.push({
        book: r.book, dest: r.dest, id: nextBillId++,
        inorout: r.inorout, money: Number(r.money) || 0,
        name: r.name, remark: '自动记账', time: r.nextDate, type: r.type
      })
      const dateKey = extractDate(r.nextDate)
      if (!billsByDate[dateKey]) billsByDate[dateKey] = []
      billsByDate[dateKey].push(allBills[allBills.length - 1])
      const nd = new Date(r.nextDate)
      if (r.cycle === 'month') nd.setMonth(nd.getMonth() + 1)
      else if (r.cycle === 'week') nd.setDate(nd.getDate() + 7)
      else nd.setDate(nd.getDate() + 1)
      r.nextDate = formatDate(nd)
      inserted++
    }
  }
  if (inserted > 0) { saveBills(); saveNextId(); saveRecurring() }
}

/* ---------- 安装拦截器 ---------- */
let _installed = false

export function initStore() {
  if (_installed) return
  _installed = true

  loadAll()
  rebuildIndex()
  checkRecurring()

  const _origRequest = uni.request

  uni.request = function (opts) {
    if (opts.url && (opts.url.startsWith(BASE_URL) || opts.url.indexOf('cash.local') > -1 || opts.url.indexOf('account.huatianzhu.top') > -1)) {
      const path = opts.url.replace(BASE_URL, '').replace('http://cash.local', '').replace(/^https?:\/\/account\.huatianzhu\.top:5000/, '')
      const payload = opts.data || {}
      const result = { data: handleRequest(path, payload), statusCode: 200 }

      const tid = setTimeout(() => {
        if (opts.success) opts.success(result)
        if (opts.complete) opts.complete(result)
      }, 0)

      return { abort() { clearTimeout(tid) } }
    }
    return _origRequest.call(uni, opts)
  }
}
