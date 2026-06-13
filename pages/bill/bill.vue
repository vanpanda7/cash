<template>
	<!-- pages/bill/bill.wxml -->
	<view>
		<view class="top-bagd">
			<view class="total">
				<view class="item">
					<view class="number" style="font-family:DIN-Bold;">-{{MMoneyC}}.00</view>
					<view class="title">月支出</view>
				</view>
				<view class="item">
					<view class="number" style="font-family:DIN-Bold;">+{{MMoneyR}}.00</view>
					<view class="title">月收入</view>
				</view>
				<view class="item" @click="quickEditBudget">
					<view class="number" style="font-family:DIN-Bold;" id="yusuan">{{selected}}.00</view>
					<view class="title">预算</view>
				</view>
			</view>
		</view>
		<view style="height:16rpx;background:#f4f2ef;"></view>
		<view @click="goSearch" style="background:white;display:flex;align-items:center;padding:20rpx 28rpx;box-shadow:0 1rpx 8rpx rgba(0,0,0,0.05);">
			<view style="flex:1;display:flex;align-items:center;background:#fbf9f7;border-radius:32rpx;padding:14rpx 24rpx;">
				<u-icon name="search" size="18" color="#999"></u-icon>
				<text style="margin-left:16rpx;font-size:28rpx;color:#b0b0b0;">搜索账单、备注、分类...</text>
			</view>
			<view style="margin-left:20rpx;display:flex;align-items:center;">
				<text style="font-size:26rpx;color:#999;">筛选</text>
				<u-icon name="arrow-right" size="14" color="#999"></u-icon>
			</view>
		</view>
		<view style="height:20rpx;background:#f4f2ef;"></view>
		<view v-if="allList.length === 0 && !loadingMore" style="text-align:center;padding:120rpx 60rpx;">
			<text style="font-size:100rpx;display:block;margin-bottom:24rpx;">📒</text>
			<text style="font-size:32rpx;font-weight:600;color:#333;display:block;margin-bottom:12rpx;">还没有账单</text>
			<text style="font-size:26rpx;color:#999;display:block;line-height:1.6;margin-bottom:40rpx;">点击底部「记一笔」开始记账<br/>或者下拉刷新试试</text>
			<view style="display:flex;justify-content:center;gap:24rpx;">
				<button @click="goAdd" style="background:#ffc84c;color:#333;font-size:28rpx;border-radius:40rpx;padding:0 48rpx;height:72rpx;line-height:72rpx;border:none;">记一笔</button>
			</view>
		</view>
		<!-- 账单列表 -->
		<view class="list-wrap" style="background-color: #f4f2ef;margin-top: 0rpx;" v-for="(item,index)  in this.allList"
		 :key="index">
			<view class="list-item">
				<view class="list-item-header">
					<view id="list-item-header-first">
						<view class="small-text">{{item.ThisTime}}</view>
						<view class="small-text">{{item.xingqi}}</view>
					</view>
					<view id="list-item-header-second">
						<view class="small-text" style="color:#5f88f3;">入 {{item.InMoney}}</view>
						<view class="small-text" style="color:#ff2222;">出 {{item.OutMoney}}</view>
					</view>
				</view>

				<view class="list-item-body">
					<view class="list-item-body-one" @click="selBillInfo(items)" v-for="(items,index)  in item.list1" :key="items.id">
						<image :src="getTypeIcon(items.type)"></image>
						<view style="float: left;">
							<text class="list-item-body-title">{{items.name}}</text>
							<text class="list-item-body-beizhu">{{items.type}} - {{items.book}}</text>
						</view>
						<view style="float: right;">
							<text class="list-item-body-zhibuzhichu">{{items.money}}</text>
							<text class="list-item-body-liqian">{{items.dest}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view v-if="loadingMore && !noMore" style="text-align:center;padding:24rpx 0;color:#999;font-size:26rpx;background:#f4f2ef;">加载中...</view>
		<view v-if="noMore" style="text-align:center;padding:24rpx 0;color:#ccc;font-size:24rpx;background:#f4f2ef;">— 没有更多记录了 —</view>

		<view v-if="showBackTop" @click="scrollToTop" style="position:fixed;bottom:120rpx;right:32rpx;width:80rpx;height:80rpx;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4rpx 16rpx rgba(0,0,0,0.15);z-index:99;">
			<text style="font-size:36rpx;">↑</text>
		</view>

	    <view style="width: 100%;height: 100rpx;background-color: #f4f2ef;float: left;"></view>

		<u-popup :show="showBudgetEdit" mode="center" @close="showBudgetEdit = false">
			<view style="width:500rpx;background:white;border-radius:20rpx;padding:40rpx;">
				<text style="font-size:32rpx;font-weight:600;display:block;text-align:center;margin-bottom:30rpx;">设置月预算</text>
				<input v-model="budgetEditVal" type="digit" placeholder="输入金额" style="width:100%;height:80rpx;border:2rpx solid #edeae6;border-radius:12rpx;padding:0 20rpx;font-size:32rpx;box-sizing:border-box;" />
				<view style="display:flex;margin-top:30rpx;justify-content:space-between;">
					<button size="mini" @click="showBudgetEdit=false" style="width:45%;">取消</button>
					<button size="mini" type="primary" @click="saveBudgetQuick" style="width:45%;">保存</button>
				</view>
				<view @click="goYusuan" style="text-align:center;margin-top:24rpx;color:#999;font-size:24rpx;">更多预算设置 ›</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	// pages/bill/bill.js
	export default {
		data() {
			return {
				MMoneyC: 0,
				MMoneyR: 5846,
				selected: 5000,
				list: [],

				dateList: [],
				allList: [],
				dayOffset: 0,
				loadingMore: false,
				noMore: false,
				pendingLoads: 0,
				batchHasData: 0,
				showBackTop: false,
				showBudgetEdit: false,
				budgetEditVal: '5000'
			};
		},
		onShow(){
			this.dayOffset = 0
			this.noMore = false
			this.allList = []
			this.QueryMoney()
			this.makeObj()
			this.loadBudget()

			const shown = uni.getStorageSync('cash_welcome_shown')
			if (!shown) {
				uni.setStorageSync('cash_welcome_shown', '1')
				setTimeout(() => {
					uni.showModal({
						title: '欢迎使用 Cash',
						content: '感谢下载使用！\n\n这是我做的第一个项目，希望它能帮你轻松记账。\n\n提示：数据保存在手机本地，如需清除请在「我的」页面操作。',
						showCancel: false,
						confirmText: '开始记账'
					})
				}, 600)
			}
		},
		onPullDownRefresh(){
			this.dayOffset = 0
			this.noMore = false
			this.allList = []
			this.QueryMoney()
			this.makeObj()
			this.loadBudget()
			setTimeout(() => uni.stopPullDownRefresh(), 300)
		},
		onReachBottom(){
			if (!this.loadingMore && !this.noMore) this.loadMore()
		},
		onPageScroll(e){
			this.showBackTop = e.scrollTop > 600
		},
		onLoad(data) {
			this.QueryMoney()
		},
		methods: {
			QueryMoney() {
				let res = uni.request({
					url: 'http://cash.local/query_sum_by_time',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"time": "month",
						"inorout": "out"
					},
					success: res => {
						this.MMoneyC = String(res.data.sum)
					},
					fail: res => {
					},
				});
				uni.request({
					url: 'http://cash.local/query_sum_by_time',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"time": "month",
						"inorout": "in"
					},
					success: res => {
						this.MMoneyR = String(res.data.sum)
					},
					fail: res => {
					},
				});
			},
			QuerZhangdan(time) {
				let OneDayInfo = {
					"book": "",
					"dest": "",
					"id": 0,
					"inorout": "",
					"money": "",
					"name": "",
					"remark": null,
					"time": "",
					"type": ""
				}
				let objDay = {
					"ThisTime": "",
					"xingqi": "",
					"InMoney": 0,
					"OutMoney": 0,
					"list1": []
				}
				objDay.ThisTime = time.slice(0, 10)
				let result = uni.request({
					url: 'http://cash.local/query_by_time',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"time": time
					},
					success: res => {
						if (res.data && res.data.length > 0) {
							for (let i = 0; i < res.data.length; i++) {
								OneDayInfo = { ...res.data[i] }
								if (OneDayInfo.inorout == '收入') {
									OneDayInfo.money = "+" + String(OneDayInfo.money)
								} else {
									OneDayInfo.money = "-" + String(OneDayInfo.money)
								}
								objDay.list1.push(OneDayInfo)
								OneDayInfo = {
									"book": "",
									"dest": "",
									"id": 0,
									"inorout": "",
									"money": "",
									"name": "",
									"remark": null,
									"time": "",
									"type": ""
								}
							}

							let resultX = uni.request({
								url: 'http://cash.local/query_sum_by_time',
								method: 'POST',
								header: {
									'Content-Type': 'application/json'
								},
								data: {
									"time": time,
									"inorout": 'in'
								},
								success: res => {
									objDay.InMoney = res.data.sum
									let resultX = uni.request({
										url: 'http://cash.local/query_sum_by_time',
										method: 'POST',
										header: {
											'Content-Type': 'application/json'
										},
										data: {
											"time": time,
											"inorout": 'out'
										},
										success: res => {
											objDay.OutMoney = res.data.sum
											this.allList.push(objDay)
											this.batchHasData++
											this.pendingLoads--
											if (this.pendingLoads <= 0) {
												this.loadingMore = false
												if (this.batchHasData === 0) this.noMore = true
											}
											objDay = {
												"ThisTime": "",
												"xingqi": "",
												"InMoney": 0,
												"OutMoney": 0,
												"list1": []
											}
										},
									fail: res => {
										this.pendingLoads--
										if (this.pendingLoads <= 0) {
											this.loadingMore = false
											if (this.batchHasData === 0) this.noMore = true
										}
									},
									})
								},
								fail: res => {
								},
							})
						} else {
							this.pendingLoads--
							if (this.pendingLoads <= 0) {
								this.loadingMore = false
								if (this.batchHasData === 0) this.noMore = true
							}
						}
					},
					fail: res => {
						this.pendingLoads--
						if (this.pendingLoads <= 0) {
							this.loadingMore = false
							if (this.batchHasData === 0) this.noMore = true
						}
					},
				});
			},

			makeObj() {
				this.setTimeData()
			},
			loadMore() {
				this.loadingMore = true
				this.batchHasData = 0
				this.dayOffset += 10
				this.setTimeData()
			},
			setTimeData() {
				this.dateList = []
				const date = new Date();
				const start = this.dayOffset
				const end = start + 10
				for(let x = start; x < end; x++){
					const date1 = new Date(date.getTime() - x * 24 * 60 * 60 * 1000);
					this.dateList.push(date1)
				}
				this.ReturnTime()
			},
			ReturnTime() {
				const total = this.dateList.length
				this.pendingLoads = total
				for (const date of this.dateList) {
					const Y = date.getFullYear() + '-';
					const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
					const D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
					const hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
					const mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
					const ss = date.getSeconds() < 10 ? ':0' + date.getSeconds() : ':' + date.getSeconds();
					const DataTime = Y + M + D + ' ' + hh + mm + ss
					this.newObj(DataTime)
				}
			},
			newObj(DataTime) {
				this.QuerZhangdan(DataTime)
			},

			selBillInfo(e) {
				uni.navigateTo({
					url: '../bill_info/bill_info?book='+encodeURIComponent(e.book)+'&dest='+encodeURIComponent(e.dest)+
					'&id='+e.id+'&inorout='+encodeURIComponent(e.inorout)+'&money='+encodeURIComponent(e.money)+
					'&name='+encodeURIComponent(e.name)+
					'&remark='+encodeURIComponent(e.remark||'')+'&time='+encodeURIComponent(e.time)+'&type='+encodeURIComponent(e.type)
				})
			},
			loadBudget() {
				this.selected = Number(uni.getStorageSync('cash_budget_month') || 5000)
			},
			quickEditBudget() {
				this.budgetEditVal = String(this.selected)
				this.showBudgetEdit = true
			},
			saveBudgetQuick() {
				const val = parseInt(this.budgetEditVal) || 5000
				this.selected = val
				uni.setStorageSync('cash_budget_month', val)
				this.showBudgetEdit = false
			},
			goYusuan() {
				this.showBudgetEdit = false
				uni.navigateTo({ url: '../yusuan/yusuan' })
			},
			goSearch() {
				uni.navigateTo({ url: '../search/search' })
			},
			goAdd() {
				uni.switchTab({ url: '/pages/add/add' })
			},
			scrollToTop(){
				uni.pageScrollTo({ scrollTop: 0, duration: 300 })
			},
			getTypeIcon(typeName) {
				const idx = { '日常生活':1,'餐饮美食':2,'购物消费':3,'文教娱乐':4,'充值缴费':5,'旅游住宿':6,'交通出行':7,'医药医疗':8,'美容保养':9,'亲子宠物':10,'债务还款':11,'其他':12,'基本工资':13,'奖金补贴':14,'生活费':15,'红包':16,'礼金礼物':17,'现金支取':18,'理财盈亏':19,'债务收款':20,'公益慈善':21 }[typeName] || 12
				const names = ['','日常生活','餐饮美食','购物消费','文教娱乐','充值缴费','旅游住宿','交通出行','医药医疗','美容保养','亲子宠物','债务还款','其他','基本工资','奖金补贴','生活费','红包','礼金礼物','现金支取','理财盈亏','债务收款','公益慈善']
				return '/static/img/icon/' + (idx < 10 ? '0' + idx : '' + idx) + '.png'
			}
		
		}
	}
</script>
<style>
	page {
		background-color: #f4f2ef;
	}

	text {
		font-family: PingFang SC-Regular;
	}

	/* pages/bill/bill.wxss */
	.top-bagd {
		padding: 36rpx 0;
		background-color: #ffc84c;
	}

	.total {
		height: 15vh;
		width: 90vw;
		margin: 0 5vw;
		text-align: center;
		background: -webkit-linear-gradient(top, #7360a1, #433468);
		border-radius: 12rpx;

		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		align-content: center;
	}

	.item {
		display: flex;
		flex-direction: column;
		margin: 28rpx;
	}

	#yusuan {
		color: #f7c75e;
	}

	.title {
		color: #ffffff;
		font-size: small;
		opacity: 0.6;
		/* 透明度 */
	}

	.number {
		color: #ffffff;
		font-size: large;
		font-weight: 600;
	}

	.small-title {
		font-size: 32rpx;
		float: left;
		font-weight: 600;
	}

	.small-text {
		font-size: 28rpx;
		float: left;
		font-family: PingFang SC-Regular;
	}

	.list-wrap {
		width: 100%;
		float: left;
		margin-bottom: 5%;
		background-color: #007AFF;
	}

	.list-item {
		/* background-color: #826bbb; */
		width: 100%;
		min-height: 100rpx;
	}

	.list-item-header {
		/* background-color: #4D7BF3; */
		height: 40rpx;
		margin-top: 0%;
		margin-bottom: 1%;
	}

	#list-item-header-second view {
		float: right;
		margin-right: 3%;
		/* background-color:#E22121; */
	}

	#list-item-header-first view {
		float: left;
		color: #929292;
		/* background-color:#E22121; */
		margin-left: 3%;
	}


	.list-item-body-one {
		width: 94%;
		height: 120rpx;
		background-color: white;
		margin-left: 3%;
		border-radius: 20rpx;
		margin-bottom: 3%;
	}

	.list-item-body-one image {
		width: 80rpx;
		height: 80rpx;
		float: left;
		position: relative;
		top: 20rpx;
		left: 20rpx;
	}

	.list-item-body-title {
		/* background-color: #007AFF; */
		width: 300rpx;
		float: left;
		margin-top: 20rpx;
		margin-left: 40rpx;
		font-size: 35rpx;
		font-family: PingFang SC-Regular;
		font-weight: 400;
	}

	.list-item-body-zhibuzhichu {
		/* background-color: #007AFF; */
		float: right;
		text-align: right;
		margin-top: 20rpx;
		margin-right: 15rpx;
		width: 250rpx;
		font-weight: 400;
		font-size: 35rpx;
		font-family: DIN-Bold;
	}

	.list-item-body-beizhu {
		/* background-color: #007AFF; */
		float: left;
		margin-top: 70rpx;
		margin-left: -300rpx;
		color: #929292;
		font-size: 24rpx;
		font-family: PingFang SC-Regular;
	}

	.list-item-body-liqian {
		/* background-color: #007AFF; */
		float: right;
		margin-right: -250rpx;
		margin-top: 70rpx;
		color: #929292;
		font-size: 24rpx;
		font-family: PingFang SC-Regular;
	}
</style>
