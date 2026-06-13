<template>
	<!-- pages/bill/bill.wxml -->
	<view>

		<view class="top-bagd" style="margin-bottom: 5%;">
			<view class="total1">
				<view style="float: left;height: 100rpx;width: 100%;background-color: #fff6dd;">

					<text style="float: left;font-family: PingFang SC-Medium;font-weight: 500;
						margin-left: 20rpx;
						margin-top: 25rpx;
						">{{this.oneBook.name}}</text>
					<image src="../../static/img/moren.png" style="float: left;
						width: 40rpx;
						height: 40rpx;
						margin-left: 20rpx;
						margin-top: 30rpx;
						"></image>
					<!-- 	<text style="float: right;font-family: PingFang SC-Medium;font-weight: 500;
						margin-right: 20rpx;
						margin-top: 25rpx;
						color: #696660;
						">编辑</text> -->

				</view>
				<view style="position: relative;top: 100rpx;width: 100%;height: 150rpx;background-color: #ffffff;z-index: 1;">
					<view>
						<text style="float: left;position: relative;bottom: 80rpx;left: 20rpx;font-family:PingFang SC-Regular;font-weight:400;color:#333333;">总支出:</text>
						<text style="float: left;position: relative;bottom: 80rpx;left: 30rpx;font-family:PingFang SC-Medium;font-weight:500;">{{this.oneBook.out_sum}}.00</text>
						<text style="float: right;position: relative;bottom: 80rpx;right: 270rpx;font-family:PingFang SC-Regular;font-weight:400;color:#333333;">总收入:</text>
						<text style="float: right;position: relative;bottom: 80rpx;font-family:PingFang SC-Medium;font-weight:500;">{{this.oneBook.in_sum}}.00</text>
					</view>
					<view style="float: left;">
						<text style="float: left;position: relative;left: 25rpx;bottom: 50rpx;font-family: PingFang SC-Regular;font-size: 20rpx;color: #CCCCCC;">共{{this.oneBook.count}}条账单</text>
						<text style="float: right;position: relative;left: 100rpx;bottom: 50rpx;font-family: PingFang SC-Regular;font-size: 20rpx;color: #CCCCCC;">创建于{{this.oneBook.creat_time}}</text>
					</view>
				</view>
			</view>
		</view>


			<view style="position: absolute;top: 280rpx;width: 90%;left: 5%;height: 100rpx;background-color: #d3d3d3;z-index: 0;border-radius: 20rpx;">
				<view style="width: 50%;height: 80rpx;position: relative;background-color: #d3d3d3;float: left;left: 2%;">
					<text style="font-family: PingFang SC-Regular;font-weight: 400;font-size: 30rpx;line-height: 110rpx;text-align: left;margin-left: 50rpx;">默认</text>
				</view>
				<view style="width: 50%;height: 80rpx;position: relative;background-color: #d3d3d3;float: left;" @click="gengxin">
					<text style="font-family: PingFang SC-Regular;font-weight: 400;font-size: 30rpx;line-height: 110rpx;margin-left: 40rpx;">刷新</text>
				</view>
			</view>



		<!-- background-color: #02825F; -->
		<view style="width: 100%;height:100rpx;">
		</view>

		<u-divider text="账单"></u-divider>

		<!-- 账单列表 -->
		<view class="list-wrap" style="background-color: #f4f2ef;margin-top: 0rpx;" v-for="(item,index)  in this.allList"
		 :key="index">
			<view class="list-item">
				<view class="list-item-header">
					<view id="list-item-header-first">
						<view class="small-text">{{item.ThisTime}}</view>
						<view class="small-text">{{item.xingqi}}</view>
					</view>
					<!-- <view id="list-item-header-second">
						<view class="small-text" style="color:#5f88f3;">入 {{item.InMoney}}</view>
						<view class="small-text" style="color:#ff2222;">出 {{item.OutMoney}}</view>
					</view> -->
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
				oneBook: {
					"count": 0,
					"creat_time": "",
					"id": 0,
					"in_sum": 0,
					"out_sum": 0,
					"name": "",
				},
				dateList: [],
				allList: [],
			};
		},
		onLoad: function(option) {
			this.oneBook.name = option.name
			this.oneBook.creat_time = option.creat_time
			this.oneBook.in_sum = option.in_sum
			this.oneBook.out_sum = option.out_sum
			this.oneBook.count = option.count
			this.makeObj()
		},
		onShow() {},
		onPageShow() {},

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
				objDay.ThisTime = time.slice(0, 10)
				let result = uni.request({
					url: 'http://cash.local/query_by_time_book_itemlist',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"time": time,
						"bookname": this.oneBook.name

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
							this.allList.push(objDay)
							objDay = {
								"ThisTime": "",
								"xingqi": "",
								"InMoney": 0,
								"OutMoney": 0,
								"list1": []
							}
						}
					},
					fail: res => {
					},
				});
			},

			makeObj() {
				this.allList = []
				this.setTimeData()
			},
			gengxin() {
				this.allList = []
				this.makeObj()
			},
			setTimeData() {
				this.dateList = []
				const date = new Date();
				for (let x = 1; x < 15; x++) {
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
					const DataTime = Y + M + D + ' ' + hh + mm + ss
					this.newObj(DataTime)
				}
			},
			newObj(DataTime) {
				this.QuerZhangdan(DataTime)
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

	.total1 {
		background-color: #4b3a70;
		border-radius: 12rpx;
		position: relative;
		top: 50rpx;
		left: 5%;
		height: 240rpx;
		width: 90%;
		overflow: hidden;
		margin-bottom: 5%;
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
