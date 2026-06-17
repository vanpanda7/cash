---
name: cash-app-fix
overview: 修复 mock 数据反复生成的核心 bug，优化性能，修复关键功能 bug
todos:
  - id: fix-seed-data
    content: 修复 P0：store.js 添加 cash_initialized 标记，防止 mock 数据反复生成
    status: completed
  - id: fix-store-perf
    content: 修复 P1：store.js 去掉 30ms 延迟，新增 query_day_summary 和 query_month_daily_sums 合并端点
    status: completed
    dependencies:
      - fix-seed-data
  - id: fix-bill-page
    content: 修复 P1+P2：bill.vue 使用合并查询减少请求，补充星期字段显示
    status: completed
    dependencies:
      - fix-store-perf
  - id: fix-report-yusuan
    content: 修复 P1+P2：report.vue 使用批量查询，Canvas 重试限 3 次；yusuan.vue 用分组汇总替代循环请求
    status: completed
    dependencies:
      - fix-store-perf
  - id: fix-add-icon
    content: 修复 P2：add.vue 移除图标路径中多余拼接的分类名称
    status: completed
  - id: fix-import-bypass
    content: 修复 P2：store.js 新增 import_bills 端点，my.vue 导入改为走 store 同步 nextBillId
    status: completed
    dependencies:
      - fix-store-perf
---

## 用户需求

修复 Cash 记账应用中已识别的问题，按优先级分三个批次：

### P0 - 严重 Bug

- **Mock 数据反复生成**：每次进入 App 自动生成 62 天假数据，即使「清除数据」后重启也无法阻止。根因是 `store.js` 仅凭 `allBills.length === 0` 判断是否 seed，无法区分首次使用与主动清空。

### P1 - 流畅度优化

- **30ms 人为延迟**：`store.js` 每条请求 `setTimeout(30ms)`，首页 30+ 请求累计延迟近 1 秒
- **首页请求过多**：`bill.vue` 每天发出 3 次请求（查账单 + 查收入汇总 + 查支出汇总），10 天 = 30 请求
- **月度报表请求爆炸**：`report.vue` 按天循环每天 2 次请求，31 天 = 62 次

### P2 - 功能 Bug

- **图标路径拼接错误**：`add.vue:165` 多拼接了分类名称 `n`，导致图标不显示
- **导入数据绕过 store**：`my.vue` 和 `search.vue` 直接操作 Storage，导致 `nextBillId` 不同步，后续记账 ID 冲突
- **分类预算循环请求**：`yusuan.vue` 对每个分类单独查一次汇总，N 个分类 = N 次请求
- **Canvas 轮询重试**：`report.vue` 用 300ms setTimeout 轮询 canvas context，失败会循环

## 技术方案

### 1. P0 Mock 数据修复

**策略**：在 Storage 中添加 `cash_initialized` 标记，区分首次使用与主动清空。

- 新增常量 `STORAGE_KEY_INITIALIZED = 'cash_initialized'`
- `seedData()` 执行后将标记设为 `true`
- `initStore()` 判断改为：`allBills.length === 0 && !uni.getStorageSync('cash_initialized')`
- `/reset_store` 不清除 `cash_initialized`（保留已初始化状态）
- `clearData()` 也保留该标记

### 2. P1 性能优化

**策略 A：去掉 30ms 延迟** — 将 `setTimeout(30)` 改为 `setTimeout(0)`，因为是纯本地存储无网络延迟，同步调用即可。

**策略 B：首页请求合并** — 在 `store.js` 新增 `/query_day_summary` 端点，一次返回某天的账单列表 + 收入汇总 + 支出汇总。`bill.vue` 从 3 次/天降为 1 次/天，10 天从 30 请求降为 10 请求。

**策略 C：月度报表批量查询** — 在 `store.js` 新增 `/query_month_daily_sums` 端点，一次返回整月每天的收入/支出汇总。`report.vue` 从 62 次请求降为 1 次。

### 3. P2 Bug 修复

**策略 A：图标路径** — `add.vue:165` 移除 `+ n` 后缀，改为 `/static/img/icon/0X.png` 格式。

**策略 B：导入数据** — 在 `store.js` 新增 `/import_bills` 端点，接收账单数组，统一分配 ID 并写入内存 + 持久化，同步 `nextBillId`。`my.vue` 导入路径改为调用此端点。

**策略 C：分类预算** — `yusuan.vue` 使用已有的 `query_sum_by_time_group` 一次性获取全部分类汇总，替代逐个分类查询。

**策略 D：Canvas 轮询** — 增加最大重试次数限制（最多 3 次），避免无限循环。

## 涉及文件

| 文件 | 操作 | 说明 |
| --- | --- | --- |
| `util/store.js` | 修改 | P0 初始化标记、P1 去延迟、新增合并端点 |
| `pages/bill/bill.vue` | 修改 | P1 使用合并查询、补充 xingqi 星期字段 |
| `pages/add/add.vue` | 修改 | P2 修复图标路径 |
| `pages/report/report.vue` | 修改 | P1 批量查询、P2 Canvas 重试限制 |
| `pages/my/my.vue` | 修改 | P2 导入走 store 端点、保留初始化标记 |
| `pages/yusuan/yusuan.vue` | 修改 | P2 使用分组汇总替代循环查询 |


## 架构不变

- 保持 pure-local Storage 架构
- 保持 `uni.request` 劫持模式
- 所有新端点遵循现有 `handleRequest` switch-case 模式
- 不引入新依赖