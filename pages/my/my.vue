<template>
	<view class="page">
		<view class="top">
			<view class="top-info">
				<image src="/static/img/TouXiang.png" class="touxiang"></image>
				<text class="name">我的账本</text>
			</view>
			<view class="stats">
				<view class="stat-item">
					<text class="stat-num">{{totalCount}}</text>
					<text class="stat-label">总笔数</text>
				</view>
				<view class="stat-item">
					<text class="stat-num" style="color:#FD416E;">{{totalOut}}</text>
					<text class="stat-label">总支出</text>
				</view>
				<view class="stat-item">
					<text class="stat-num" style="color:#4D7BF3;">{{totalIn}}</text>
					<text class="stat-label">总收入</text>
				</view>
			</view>
		</view>

		<view class="block">
			<view class="list">
				<view class="list-info" @click="goYusuan">
					<image src="/static/img/mylist1.png"></image>
					<text>预算设置</text>
				</view>
				<view class="list-info" @click="goZhangbeng">
					<image src="/static/img/mylist2.png"></image>
					<text>账本管理</text>
				</view>
				<view class="list-info" @click="goAssets">
					<image src="/static/img/zc-icon1.png"></image>
					<text>资产管理</text>
				</view>
				<view class="list-info" @click="goRecur">
					<image src="/static/img/mylist1.png"></image>
					<text>周期账单</text>
				</view>
				<view class="list-info" @click="goReport">
					<image src="/static/img/chart-active.png"></image>
					<text>月度报表</text>
				</view>
				<view class="list-info" @click="goCats">
					<image src="/static/img/leixing.png"></image>
					<text>分类管理</text>
				</view>
				<view class="list-info" @click="exportData">
					<image src="/static/img/mylist3.png"></image>
					<text>导出数据</text>
				</view>
				<view class="list-info" @click="importData">
					<image src="/static/img/mylist2.png"></image>
					<text>导入数据</text>
				</view>
				<view class="list-info" @click="seedData">
					<image src="/static/img/mylist4.png"></image>
					<text>生成演示数据</text>
				</view>
				<view class="list-info" @click="clearData">
					<image src="/static/img/mylist4.png"></image>
					<text>清除数据</text>
				</view>
			</view>
		</view>

		<view style="text-align:center;margin-top:80rpx;color:#ccc;font-size:24rpx;">Cash 记账 v1.0</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				totalCount: 0,
				totalOut: 0,
				totalIn: 0,
			}
		},
		onShow() {
			this.loadStats()
		},
		methods: {
			loadStats() {
				const API = 'http://cash.local'
				Promise.all([
					new Promise(r => uni.request({ url: API + '/query_sum_by_time', method: 'POST', header: { 'Content-Type': 'application/json' }, data: { time: 'year', inorout: 'out' }, success: res => r(res.data.sum || 0), fail: () => r(0) })),
					new Promise(r => uni.request({ url: API + '/query_sum_by_time', method: 'POST', header: { 'Content-Type': 'application/json' }, data: { time: 'year', inorout: 'in' }, success: res => r(res.data.sum || 0), fail: () => r(0) })),
				]).then(([out, inc]) => {
					this.totalOut = out
					this.totalIn = inc
				})
				uni.request({
					url: API + '/query_total_count',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					success: res => { this.totalCount = (res.data && res.data.count) || 0 }
				})
			},
			goYusuan() { uni.navigateTo({ url: '../yusuan/yusuan' }) },
			goZhangbeng() { uni.navigateTo({ url: '../zhangBeng/zhangBeng' }) },
			goCats() { uni.navigateTo({ url: '../cats/cats' }) },
			goReport() { uni.navigateTo({ url: '../report/report' }) },
			goRecur() { uni.navigateTo({ url: '../recur/recur' }) },
			exportData() {
				const data = {
					cash_bills: uni.getStorageSync('cash_bills') || '[]',
					cash_dests: uni.getStorageSync('cash_dests') || '[]',
					cash_cats: uni.getStorageSync('cash_cats') || '{}',
					cash_budget_day: uni.getStorageSync('cash_budget_day') || '100',
					cash_budget_month: uni.getStorageSync('cash_budget_month') || '3000',
					exportTime: new Date().toISOString(),
					version: '1.0.0'
				}
				const json = JSON.stringify(data, null, 2)
				uni.setClipboardData({
					data: json,
					success: () => uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
				})
			},
			importData() {
				uni.showModal({
					title: '导入数据',
					content: '将从剪贴板读取数据。支持：\n1. 本App备份JSON\n2. 支付宝/微信导出CSV\n\n选择"合并"将追加到现有数据，"替换"将清空后导入。',
					cancelText: '合并',
					confirmText: '替换',
					success: res => {
						const mode = res.confirm ? 'replace' : 'merge'
						uni.getClipboardData({
							success: r => {
								this.parseImport(r.data, mode)
							},
							fail: () => uni.showToast({ title: '读取剪贴板失败', icon: 'none' })
						})
					}
				})
			},
			parseImport(raw, mode) {
				const API = 'http://cash.local'
				const importBills = (bills, cb) => {
					uni.request({
						url: API + '/import_bills', method: 'POST',
						header: { 'Content-Type': 'application/json' },
						data: { bills }, success: res => {
							uni.showToast({ title: '已导入 ' + (res.data.count || bills.length) + ' 条账单', icon: 'success' })
							this.loadStats()
						}, fail: () => uni.showToast({ title: '导入失败', icon: 'none' })
					})
				}
				try {
					const data = JSON.parse(raw)
					if (data.cash_bills) {
						const parsedBills = typeof data.cash_bills === 'string' ? JSON.parse(data.cash_bills) : data.cash_bills
						if (mode === 'replace') {
							uni.request({
								url: API + '/reset_store', method: 'POST',
								header: { 'Content-Type': 'application/json' },
								success: () => {
									if (data.cash_dests) uni.setStorageSync('cash_dests', data.cash_dests)
									if (data.cash_cats) uni.setStorageSync('cash_cats', data.cash_cats)
									if (data.cash_budget_day) uni.setStorageSync('cash_budget_day', data.cash_budget_day)
									if (data.cash_budget_month) uni.setStorageSync('cash_budget_month', data.cash_budget_month)
									importBills(parsedBills)
								}
							})
						} else {
							importBills(parsedBills)
						}
						return
					}
				} catch (e) {}

				const bills = this.parseCSV(raw)
				if (bills.length === 0) {
					uni.showToast({ title: '无法识别数据格式', icon: 'none' })
					return
				}
				if (mode === 'replace') {
					uni.request({
						url: API + '/reset_store', method: 'POST',
						header: { 'Content-Type': 'application/json' },
						success: () => importBills(bills)
					})
				} else {
					importBills(bills)
				}
			},
			parseCSV(raw) {
				const lines = raw.trim().split(/\r?\n/).filter(l => l.trim())
				if (lines.length < 2) return []
				const headers = lines[0].split(',').map(h => h.trim())
				const colMap = {}
				if (headers.includes('收/支') && headers.includes('交易对方')) {
					for (let i = 0; i < headers.length; i++) {
						if (headers[i].includes('交易时间')) colMap.time = i
						else if (headers[i].includes('交易分类') || headers[i].includes('交易类型')) colMap.type = i
						else if (headers[i].includes('交易对方')) colMap.remark = i
						else if (headers[i].includes('商品说明') || headers[i].includes('商品')) colMap.name = i
						else if (headers[i].includes('收/支')) colMap.inorout = i
						else if (headers[i].includes('金额')) colMap.money = i
						else if (headers[i].includes('支付方式') || headers[i].includes('付款方式')) colMap.dest = i
					}
				} else {
					return []
				}
				const bills = []
				for (let r = 1; r < lines.length; r++) {
					const cols = lines[r].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
					if (cols.length < 5) continue
					const moneyStr = (cols[colMap.money] || '0').replace(/[￥¥,]/g, '')
					const money = parseFloat(moneyStr)
					if (isNaN(money) || money <= 0) continue
					const inorout = (cols[colMap.inorout] || '').includes('支') ? '支出' : '收入'
					bills.push({
						time: cols[colMap.time] || '',
						type: cols[colMap.type] || (inorout === '收入' ? '基本工资' : '其他'),
						name: cols[colMap.name] || cols[colMap.type] || '',
						inorout: inorout,
						money: money,
						dest: cols[colMap.dest] || '其他',
						book: '日常账本',
						remark: cols[colMap.remark] || ''
					})
				}
				return bills
			},
			goAssets() { uni.switchTab({ url: '../assets/assets' }) },
			seedData() {
				uni.showModal({
					title: '生成演示数据',
					content: '将生成约 62 天的模拟账单数据，方便体验 App 功能。已有数据会被覆盖。',
					success: res => {
						if (res.confirm) {
							uni.request({
								url: 'http://cash.local/seed_data',
								method: 'POST',
								header: { 'Content-Type': 'application/json' },
								success: r => {
									const count = (r.data && r.data.count) || 0
									this.$refs.uToast.show({ type: 'success', message: '已生成 ' + count + ' 条演示数据', duration: 2000 })
									setTimeout(() => { this.loadStats() }, 800)
								},
								fail: () => uni.showToast({ title: '生成失败', icon: 'none' })
							})
						}
					}
				})
			},
			clearData() {
				uni.showModal({
					title: '确认清除',
					content: '将清除所有记账数据（账单、分类、预算、周期账单），不可恢复',
					success: res => {
						if (res.confirm) {
							uni.removeStorageSync('cash_budget_day')
							uni.removeStorageSync('cash_budget_month')
							uni.removeStorageSync('cash_cat_budget')
							uni.request({
								url: 'http://cash.local/reset_store',
								method: 'POST',
								header: { 'Content-Type': 'application/json' },
								success: () => {
									this.$refs.uToast.show({ type: 'success', message: '已清除全部数据', duration: 2000 })
									setTimeout(() => { this.loadStats() }, 800)
								}
							})
						}
					}
				})
			},
		}
	}
</script>

<style>
	page { background-color: #faf8f5; }
	.top { background-color: white; padding: 30rpx 0; }
	.top-info { display: flex; flex-direction: row; align-items: center; padding: 0 48rpx; }
	.touxiang { width: 114rpx; height: 114rpx; border-radius: 100rpx; }
	.name { flex:1; font-size: 36rpx; margin-left: 30rpx; }
	.stats { display: flex; justify-content: space-around; margin-top: 30rpx; padding: 20rpx 0; }
	.stat-item { text-align: center; }
	.stat-num { display: block; font-family: DIN-Bold; font-size: 40rpx; font-weight: 700; }
	.stat-label { display: block; font-size: 24rpx; color: #999; margin-top: 6rpx; }
	.block { background: white; border-radius: 20rpx; margin: 24rpx 32rpx; }
	.list { display: flex; flex-direction: column; }
	.list-info { display: flex; flex-direction: row; align-items: center; padding: 28rpx; border-bottom: 1rpx solid #edeae6; }
	.list-info image { width: 40rpx; height: 40rpx; margin-right: 24rpx; }
	.list-info text { font-size: 30rpx; }
</style>
