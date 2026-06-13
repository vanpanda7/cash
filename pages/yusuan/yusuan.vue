<template>
	<view>
		<view style="width: 100%;float: left;background-color: white;padding-bottom: 20rpx;">
			<view style="width: 94%;margin-left: 3%;margin-top: 24rpx;">
				<text style="font-family:PingFang SC-Medium;color: #333333;font-size: 32rpx;">日支出</text>
				<text style="float: right;font-family:PingFang SC-Regular;color: #46356B;" @click="editBudget('day')">修改</text>
			</view>
			<view style="width: 94%;height:36rpx;margin-left: 3%;margin-top: 16rpx;">
				<u-line-progress :percentage="dayPercent" activeColor="#46356B" :showText="false" height="12"></u-line-progress>
			</view>
			<view style="width: 94%;margin-left: 3%;margin-top: 16rpx;display: flex;justify-content: space-between;">
				<view style="text-align: center;flex:1;">
					<text style="font-family:PingFang SC-Regular;font-size: 24rpx;color: #888;">每日预算</text>
					<text style="display:block;font-family:DIN-Bold;font-size: 38rpx;margin-top: 8rpx;">{{dayBudget}}</text>
				</view>
				<view style="text-align: center;flex:1;">
					<text style="font-family:PingFang SC-Regular;font-size: 24rpx;color: #888;">今日支出</text>
					<text style="display:block;font-family:DIN-Bold;font-size: 38rpx;margin-top: 8rpx;">{{daySpent}}</text>
				</view>
				<view style="text-align: center;flex:1;">
					<text style="font-family:PingFang SC-Regular;font-size: 24rpx;color: #888;">剩余预算</text>
					<text style="display:block;font-family:DIN-Bold;font-size: 38rpx;margin-top: 8rpx;" :style="{color: dayRemain >= 0 ? '#46356B' : '#FD416E'}">{{dayRemain}}</text>
				</view>
			</view>
			<view style="width:94%;margin-left:3%;margin-top:20rpx;">
				<u-notice-bar :text="dayNotice" speed="40" fontSize="14" style="border-radius: 20rpx; background-color: #fff57e;opacity: 0.7;"></u-notice-bar>
			</view>
		</view>

		<view style="width: 100%;height:20rpx;float:left;background-color: #f4f2ef;"></view>

		<view style="width: 100%;float: left;background-color: white;padding-bottom: 20rpx;margin-top: 0;">
			<view style="width: 94%;margin-left: 3%;margin-top: 24rpx;">
				<text style="font-family:PingFang SC-Medium;color: #333333;font-size: 32rpx;">月支出</text>
				<text style="float: right;font-family:PingFang SC-Regular;color: #46356B;" @click="editBudget('month')">修改</text>
			</view>
			<view style="width: 94%;height:36rpx;margin-left: 3%;margin-top: 16rpx;">
				<u-line-progress :percentage="monthPercent" activeColor="#46356B" :showText="false" height="12"></u-line-progress>
			</view>
			<view style="width: 94%;margin-left: 3%;margin-top: 16rpx;display: flex;justify-content: space-between;">
				<view style="text-align: center;flex:1;">
					<text style="font-family:PingFang SC-Regular;font-size: 24rpx;color: #888;">每月预算</text>
					<text style="display:block;font-family:DIN-Bold;font-size: 38rpx;margin-top: 8rpx;">{{monthBudget}}</text>
				</view>
				<view style="text-align: center;flex:1;">
					<text style="font-family:PingFang SC-Regular;font-size: 24rpx;color: #888;">本月支出</text>
					<text style="display:block;font-family:DIN-Bold;font-size: 38rpx;margin-top: 8rpx;">{{monthSpent}}</text>
				</view>
				<view style="text-align: center;flex:1;">
					<text style="font-family:PingFang SC-Regular;font-size: 24rpx;color: #888;">剩余预算</text>
					<text style="display:block;font-family:DIN-Bold;font-size: 38rpx;margin-top: 8rpx;" :style="{color: monthRemain >= 0 ? '#46356B' : '#FD416E'}">{{monthRemain}}</text>
				</view>
			</view>
		</view>

		<u-popup :show="showEdit" mode="center" @close="showEdit = false">
			<view style="width:500rpx;background:white;border-radius:20rpx;padding:40rpx;">
				<text style="font-size:32rpx;font-weight:600;display:block;text-align:center;margin-bottom:30rpx;">设置{{editType === 'day' ? '每日' : '每月'}}预算</text>
				<input v-model="editValue" type="digit" placeholder="输入预算金额" style="width:100%;height:80rpx;border:2rpx solid #edeae6;border-radius:12rpx;padding:0 20rpx;font-size:32rpx;box-sizing:border-box;" />
				<view style="display:flex;margin-top:30rpx;justify-content:space-between;">
					<button size="mini" @click="showEdit=false" style="width:45%;">取消</button>
					<button size="mini" type="primary" @click="saveBudget" style="width:45%;">保存</button>
				</view>
			</view>
		</u-popup>

		<u-popup :show="showCatEdit" mode="center" @close="showCatEdit = false">
			<view style="width:500rpx;background:white;border-radius:20rpx;padding:40rpx;">
				<text style="font-size:32rpx;font-weight:600;display:block;text-align:center;margin-bottom:30rpx;">{{editCat}} 预算</text>
				<input v-model="catEditValue" type="digit" placeholder="输入金额" style="width:100%;height:80rpx;border:2rpx solid #edeae6;border-radius:12rpx;padding:0 20rpx;font-size:32rpx;box-sizing:border-box;" />
				<view style="display:flex;margin-top:30rpx;justify-content:space-between;">
					<button size="mini" @click="showCatEdit=false" style="width:45%;">取消</button>
					<button size="mini" type="primary" @click="saveCatBudget" style="width:45%;">保存</button>
				</view>
			</view>
		</u-popup>

		<view style="width:100%;height:20rpx;float:left;background-color:#f4f2ef;"></view>

		<view style="width:100%;float:left;background-color:white;padding-bottom:20rpx;">
			<view style="width:94%;margin-left:3%;margin-top:24rpx;">
				<text style="font-family:PingFang SC-Medium;color:#333;font-size:32rpx;">分类预算</text>
			</view>
			<view v-for="(cat, idx) in catList" :key="idx" style="width:94%;margin-left:3%;margin-top:20rpx;">
				<view style="display:flex;justify-content:space-between;align-items:center;">
					<image :src="getTypeIcon(cat.name)" style="width:40rpx;height:40rpx;"></image>
					<text style="flex:1;font-size:28rpx;margin-left:16rpx;">{{cat.name}}</text>
					<text style="font-size:26rpx;margin-right:16rpx;">{{cat.spent}} / {{cat.budget || '未设'}}</text>
					<text @click="editCatBudget(cat.name)" style="font-size:24rpx;color:#46356B;">{{cat.budget ? '修改' : '设置'}}</text>
				</view>
				<u-line-progress v-if="cat.budget" :percentage="cat.percent" activeColor="#46356B" :showText="false" height="10" style="margin-top:8rpx;"></u-line-progress>
			</view>
		</view>
	</view>
</template>

<script>
	const STORE_DAY = 'cash_budget_day'
	const STORE_MONTH = 'cash_budget_month'
	const STORE_CAT_BUDGET = 'cash_cat_budget'

	export default {
		data() {
			return {
				dayBudget: 100,
				monthBudget: 3000,
				daySpent: 0,
				monthSpent: 0,
				showEdit: false,
				editType: 'day',
				editValue: '100',
				catList: [],
				catBudgetMap: {},
				showCatEdit: false,
				editCat: '',
				catEditValue: '0'
			}
		},
		computed: {
			dayPercent() {
				return this.dayBudget > 0 ? Math.min(Math.round((this.daySpent / this.dayBudget) * 100), 100) : 0
			},
			monthPercent() {
				return this.monthBudget > 0 ? Math.min(Math.round((this.monthSpent / this.monthBudget) * 100), 100) : 0
			},
			dayRemain() {
				return (this.dayBudget - this.daySpent).toFixed(2)
			},
			monthRemain() {
				return (this.monthBudget - this.monthSpent).toFixed(2)
			},
			dayNotice() {
				const r = this.dayBudget - this.daySpent
				if (r < 0) return '已超支 ' + Math.abs(r) + ' 元，请谨慎消费！'
				if (r < this.dayBudget * 0.2) return '今日预算即将用完，还剩 ' + r.toFixed(0) + ' 元'
				return '今日预算使用 ' + this.dayPercent + '%，控制得不错'
			}
		},
		onShow() {
			this.loadBudgets()
			this.fetchSpending()
			this.loadCatBudgets()
		},
		methods: {
			loadBudgets() {
				try {
					const db = uni.getStorageSync(STORE_DAY)
					if (db) this.dayBudget = parseFloat(db) || 100
					const mb = uni.getStorageSync(STORE_MONTH)
					if (mb) this.monthBudget = parseFloat(mb) || 3000
				} catch (e) {}
			},
			fetchSpending() {
				const req = (time, inorout) => new Promise((resolve) => {
					uni.request({
						url: 'http://cash.local/query_sum_by_time',
						method: 'POST',
						header: { 'Content-Type': 'application/json' },
						data: { time, inorout },
						success: res => resolve(res.data.sum || 0),
						fail: () => resolve(0)
					})
				})
				Promise.all([req('today', 'out'), req('month', 'out')]).then(([d, m]) => {
					this.daySpent = d
					this.monthSpent = m
				})
			},
			editBudget(type) {
				this.editType = type
				this.editValue = type === 'day' ? String(this.dayBudget) : String(this.monthBudget)
				this.showEdit = true
			},
			saveBudget() {
				const val = parseFloat(this.editValue) || 0
				if (this.editType === 'day') {
					this.dayBudget = val
					uni.setStorageSync(STORE_DAY, val)
				} else {
					this.monthBudget = val
					uni.setStorageSync(STORE_MONTH, val)
				}
				this.showEdit = false
			},
			loadCatBudgets() {
				try { this.catBudgetMap = JSON.parse(uni.getStorageSync(STORE_CAT_BUDGET) || '{}') } catch(e) { this.catBudgetMap = {} }
				uni.request({
					url: 'http://cash.local/query_categories',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					success: res => {
						const cats = (res.data.out || []).map(c => c.name || c)
						Promise.all(cats.map(c => new Promise(r => {
							uni.request({
								url: 'http://cash.local/query_sum_by_time_group',
								method: 'POST', header: { 'Content-Type': 'application/json' },
								data: { time: 'month', inorout: 'out' },
								success: gr => {
									const found = (gr.data || []).find(g => g.type === c)
									r({ name: c, spent: found ? found.sum : 0, budget: this.catBudgetMap[c] || 0, percent: this.catBudgetMap[c] ? Math.min(Math.round((found ? found.sum : 0) / this.catBudgetMap[c] * 100), 100) : 0 })
								},
								fail: () => r({ name: c, spent: 0, budget: this.catBudgetMap[c] || 0, percent: 0 })
							})
						}))).then(list => { this.catList = list })
					}
				})
			},
			editCatBudget(name) {
				this.editCat = name
				this.catEditValue = String(this.catBudgetMap[name] || '')
				this.showCatEdit = true
			},
			saveCatBudget() {
				this.catBudgetMap[this.editCat] = parseFloat(this.catEditValue) || 0
				uni.setStorageSync(STORE_CAT_BUDGET, JSON.stringify(this.catBudgetMap))
				this.showCatEdit = false
				this.loadCatBudgets()
			},
			getTypeIcon(typeName) {
				const idx = { '日常生活':1,'餐饮美食':2,'购物消费':3,'文教娱乐':4,'充值缴费':5,'旅游住宿':6,'交通出行':7,'医药医疗':8,'美容保养':9,'亲子宠物':10,'债务还款':11,'其他':12 }[typeName] || 12
				const names = ['','日常生活','餐饮美食','购物消费','文教娱乐','充值缴费','旅游住宿','交通出行','医药医疗','美容保养','亲子宠物','债务还款','其他']
				return '/static/img/icon/' + (idx < 10 ? '0' + idx : '' + idx) + '.png'
			}
		}
	}
</script>

<style lang="scss" scoped>
	page { background-color: #f4f2ef; }
</style>
