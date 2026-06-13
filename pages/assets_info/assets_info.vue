<template>
	<!-- pages/bill/bill.wxml -->
	<view>
		<view class="top-bagd">
			<view style="width: 100%;height: 150rpx;">
				<view style="width:100%;height: 50rpx;text-align: center;line-height: 90rpx;font-family:PingFang SC-Regular;font-weight: 400;color: #8a7731;">
					<text>总资产(元)</text>
				</view>
				<view style="width:100%;height: 100rpx;text-align: center;line-height: 140rpx;font-size: 70rpx;font-family:DIN-Bold;font-weight: 400;">
					<text style="">{{typeMoney}}.00</text>
				</view>
			</view>
			<view class="total1">
				<view style="float: left;height: 100rpx;width: 100%;background-color: #fff6dd;">
					<image src="../../static/img/zc-icon1.png" style="float: left;
					width: 70rpx;
					height: 70rpx;
					margin-left: 20rpx;
					margin-top: 17rpx;
					"></image>
					<text style="float: left;font-family: PingFang SC-Medium;font-weight: 500;
					margin-left: 20rpx;
					margin-top: 25rpx;
					">{{typeName}}</text>

					<text style="float: left;font-family: PingFang SC-Medium;font-weight: 500;
					margin-left: 20rpx;
					margin-top: 25rpx;
					color: #fd6483;
					">默认账户</text>

					<!-- 	<text style="float: right;font-family: PingFang SC-Medium;font-weight: 500;
					margin-right: 20rpx;
					margin-top: 25rpx;
					color: #696660;
					">编辑</text> -->

				</view>
				<view style="position: absolute;top: 100rpx;width: 100%;height: 150rpx;background-color: #ffffff;z-index: 1;">
					<text style="position: absolute;top: 50rpx;left: 20rpx;font-family:PingFang SC-Regular;font-weight:400;color:#989898;">今日支出</text>
					<text style="position: absolute;top: 50rpx;left: 170rpx;font-family:PingFang SC-Medium;font-weight:500;">{{typeMoneyDayOut}}.00</text>
					<view style="width: 4rpx;height: 80rpx;background-color: #d3d3d3;position: absolute;top: 30rpx;margin-left: 50%;"></view>
					<text style="position: absolute;top: 50rpx;left: 370rpx;font-family:PingFang SC-Regular;font-weight:400;color:#989898;">本月支出</text>
					<text style="position: absolute;top: 50rpx;left: 520rpx;font-family:PingFang SC-Medium;font-weight:500;">{{typeMoneyMonOut}}.00</text>
				</view>
			</view>


			<view style="position: absolute;top: 420rpx;width: 90%;left: 5%;height: 100rpx;background-color: #d3d3d3;z-index: 0;border-radius: 20rpx;">
				<view style="width: 50%;height: 80rpx;position: relative;background-color: #d3d3d3;float: left;left: 2%;">
					<text style="font-family: PingFang SC-Regular;font-weight: 400;font-size: 30rpx;line-height: 110rpx;text-align: left;margin-left: 50rpx;">默认</text>
				</view>
				<view style="width: 50%;height: 80rpx;position: relative;background-color: #d3d3d3;float: left;" @click="gengxin">
					<text style="font-family: PingFang SC-Regular;font-weight: 400;font-size: 30rpx;line-height: 110rpx;margin-left: 40rpx;">刷新</text>
				</view>
			</view>


		</view>
		<!-- background-color: #02825F; -->
		<view style="width: 100%;height:220rpx;">
	</view>
	<u-divider text="账单"></u-divider>

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
					<view class="list-item-body-one" @click="selBillInfo(items)" v-for="(items,index)  in item.list1" :key="index">
						<image :src="getTypeIcon(items.type)"></image>
						<view style="float: left;">
							<text class="list-item-body-title">{{items.name}}</text>
							<text class="list-item-body-beizhu">{{items.type}} - {{items.book}}</text>
						</view>
						<view style="float: right;">
							<text class="list-item-body-zhibuzhichu">{{items.money}}.00</text>
							<text class="list-item-body-liqian">{{items.dest}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>


	</view>
</template>

<script>
	// pages/bill/bill.js
	export default {
		data() {
			return {
				typeMoney: '0',
				typeMoneyDayOut: 0,
				typeMoneyMonOut: 0,

				typeName: '',
				totleMoney: 0,

				selected: 0,
				list: [],

				dateList: [],
				allList: [],
			};
		},
		onLoad: function(option) {
			this.typeName = option.type
			this.QuerMoney()
		},
		onShow(){
			this.allList = []
			this.makeObj()
		},
		onPageShow() {
			if (typeof this.getTabBar === 'function' && this.getTabBar()) {
				this.getTabBar().setData({
					selected: 0
				});
			}
		},

		methods: {
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
				let result = uni.request({
					url: 'http://cash.local/query_by_time_dest_itemlist',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"destname": this.typeName,
						"time": time,
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
								url: 'http://cash.local/query_sum_by_time_dest',
								method: 'POST',
								header: {
									'Content-Type': 'application/json'
								},
								data: {
									"time": time,
									"inorout": 'in',
									"destname": this.typeName
								},
								success: res => {
									objDay.InMoney = res.data.sum
									let resultXX = uni.request({
										url: 'http://cash.local/query_sum_by_time_dest',
										method: 'POST',
										header: {
											'Content-Type': 'application/json'
										},
										data: {
											"time": time,
											"inorout": 'out',
											"destname": this.typeName
										},
										success: res => {
											objDay.OutMoney = res.data.sum
											objDay.ThisTime = time.slice(0, 10)
											this.allList.push(objDay)
											objDay = {
												"ThisTime": "",
												"xingqi": "",
												"InMoney": 0,
												"OutMoney": 0,
												"list1": []
											}
										},
										fail: res => {
										},
									})
								},
								fail: res => {
								},
							})
						}
					},
					fail: res => {
					},
				});
			},
			makeObj() {
				this.setTimeData()
			},
			setTimeData() {
				this.dateList = []
				const date = new Date();
				for (let x = 0; x < 15; x++) {
					const date1 = new Date(date.getTime() - x * 24 * 60 * 60 * 1000);
					this.dateList.push(date1)
				}
				this.ReturnTime()
			},
			ReturnTime() {
				for (const date of this.dateList) {
					const Y = date.getFullYear() + '-';
					const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
					const D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
					const hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
					const mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
					const ss = date.getSeconds() < 10 ? ':0' + date.getSeconds() : ':' + date.getSeconds();
					let DataTime = Y + M + D + ' ' + hh + mm + ss
					this.newObj(DataTime)
					//
				}
			},
			newObj(DataTime) {
				this.QuerZhangdan(DataTime)
			},

			QuerMoney() {
				let res = uni.request({
					url: 'http://cash.local/query_one_dest_sum',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"destname": this.typeName
					},
					success: res => {
						this.typeMoney = res.data.sum
						this.QuerTypeMoneyOut()
					},
					fail: res => {
					},
				})
			},
			QuerTypeMoneyOut() {
				let res = uni.request({
					url: 'http://cash.local/query_sum_by_time_dest',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"time": "today",
						"inorout": "out",
						"destname": this.typeName
					},
					success: res => {
						this.typeMoneyDayOut = res.data.sum

						res = uni.request({
							url: 'http://cash.local/query_sum_by_time_dest',
							method: 'POST',
							header: {
								'Content-Type': 'application/json'
							},
							data: {
								"time": "month",
								"inorout": "out",
								"destname": this.typeName
							},
							success: res => {
								this.typeMoneyMonOut = res.data.sum
								this.makeObj()
							},
							fail: res => {
							},
						})

					},
					fail: res => {
					},
				})

			},


			bianji() {
			},
			gengxin() {
				this.allList = []
				this.makeObj()
			},
			shanchu() {
			},

			selBillInfo(e) {
				uni.navigateTo({
					url: '../bill_info/bill_info?book=' + encodeURIComponent(e.book) + '&dest=' + encodeURIComponent(e.dest) +
						'&id=' + e.id + '&inorout=' + encodeURIComponent(e.inorout) + '&money=' + encodeURIComponent(e.money) +
						'&name=' + encodeURIComponent(e.name) +
						'&remark=' + encodeURIComponent(e.remark||'') + '&time=' + encodeURIComponent(e.time) + '&type=' + encodeURIComponent(e.type)
				})
			},
			getTypeIcon(typeName) {
				const idx = { '日常生活':1,'餐饮美食':2,'购物消费':3,'文教娱乐':4,'充值缴费':5,'旅游住宿':6,'交通出行':7,'医药医疗':8,'美容保养':9,'亲子宠物':10,'债务还款':11,'其他':12,'基本工资':13,'奖金补贴':14,'生活费':15,'红包':16,'礼金礼物':17,'现金支取':18,'理财盈亏':19,'债务收款':20,'公益慈善':21 }[typeName] || 12
				const names = ['','日常生活','餐饮美食','购物消费','文教娱乐','充值缴费','旅游住宿','交通出行','医药医疗','美容保养','亲子宠物','债务还款','其他','基本工资','奖金补贴','生活费','红包','礼金礼物','现金支取','理财盈亏','债务收款','公益慈善']
				return '/static/img/icon/' + (idx < 10 ? '0' + idx : '' + idx) + '.png'
			}

		},
	};
</script>
<style>
	page {
		background-color: #f4f2ef;
	}

	/* pages/bill/bill.wxss */
	.top-bagd {
		height: 160px;
		/* background-color: #ffc84c; */
		background: -webkit-linear-gradient(left, rgb(255, 232, 100), #ffcc4f);
		position: static;
	}

	.total1 {
		margin: 36rpx;
		background-color: #4b3a70;
		border-radius: 12rpx;
		overflow: hidden;
		position: absolute;
		top: 160rpx;
		height: 240rpx;
		width: 90%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
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
		font-family: PingFang SC-Medium;
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
		min-height: 0rpx;
		float: left;
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
		margin-bottom: 3%;
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
		top: 15rpx;
		left: 15rpx;
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



<style lang="scss">
	.wrap {
		padding: 12px;
	}

	.demo-layout {
		height: 25px;
		border-radius: 4px;
	}

	.bg-purple {
		background: #CED7E1;
	}

	.bg-purple-light {
		background: #e5e9f2;
	}

	.bg-purple-dark {
		background: #99a9bf;
	}
</style>
