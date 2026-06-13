<template>
	<!-- pages/bill/bill.wxml -->
	<view>
		<view class="top-bagd" style="margin-bottom: 5%;">
			<view class="total1" @click="goConZhang(item)" v-for="(item,index)  in this.allList" :key="index">
				<view style="float: left;height: 100rpx;width: 100%;background-color: #fff6dd;">

					<text style="float: left;font-family: PingFang SC-Medium;font-weight: 500;
					margin-left: 20rpx;
					margin-top: 25rpx;
					">{{item.name}}</text>
					<image src="../../static/img/moren.png" style="float: left;
					width: 40rpx;
					height: 40rpx;
					margin-left: 20rpx;
					margin-top: 30rpx;
					"
					></image>
					<!-- 	<text style="float: right;font-family: PingFang SC-Medium;font-weight: 500;
					margin-right: 20rpx;
					margin-top: 25rpx;
					color: #696660;
					">编辑</text> -->

				</view>
				<view style="position: relative;top: 100rpx;width: 100%;height: 150rpx;background-color: #ffffff;z-index: 1;">
					<view>
						<text style="float: left;position: relative;bottom: 80rpx;left: 20rpx;font-family:PingFang SC-Regular;font-weight:400;color:#333333;">总支出:</text>
						<text style="float: left;position: relative;bottom: 80rpx;left: 30rpx;font-family:PingFang SC-Medium;font-weight:500;">{{item.out_sum}}.00</text>
						<text style="float: right;position: relative;bottom: 80rpx;right: 270rpx;font-family:PingFang SC-Regular;font-weight:400;color:#333333;">总收入:</text>
						<text style="float: right;position: relative;bottom: 80rpx;font-family:PingFang SC-Medium;font-weight:500;">{{item.in_sum}}.00</text>
					</view>
					<view style="float: left;">
						<text style="float: left;position: relative;left: 25rpx;bottom: 50rpx;font-family: PingFang SC-Regular;font-size: 20rpx;color: #CCCCCC;">共{{item.count}}条账单</text>
						<text style="float: right;position: relative;left: 100rpx;bottom: 50rpx;font-family: PingFang SC-Regular;font-size: 20rpx;color: #CCCCCC;">创建于{{item.creat_time}}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- background-color: #02825F; -->
		<view style="width: 100%;height:220rpx;">
		</view>

	</view>
</template>

<script>
	// pages/bill/bill.js
	export default {
		data() {
			return {
				typeMoney: '',
				typeMoneyAllOut: 0,
				typeMoneyAllIn: 0,

				typeName: '',
				totleMoney: 0,

				selected: 0,
				list: [],

				dateList: [],
				allList: [],
			};
		},
		onLoad: function(option) {
			this.queryBooks()
		},
		onShow() {},
		onPageShow() {},

		methods: {
			goConZhang(oneBook) {
				uni.navigateTo({
					url: '../conZhangbeng/conZhangbeng?creat_time=' + encodeURIComponent(oneBook.creat_time) + '&in_sum=' + oneBook.in_sum + '&out_sum='+oneBook.out_sum + '&name=' + encodeURIComponent(oneBook.name)+ '&count=' + oneBook.count
				})
			},
			queryBooks() {
				let res = uni.request({
					url: 'http://cash.local/query_get_bookslist_detail',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {},
					success: res => {
						let oneBook = {
							"count": 0,
							"creat_time": "",
							"id": 0,
							"in_sum": 0,
							"out_sum": 0,
							"name": ""
						}
						for (let i = 0; i < res.data.length; i++) {
							oneBook = res.data[i]
							this.allList.push(oneBook)
						}
					},
					fail: res => {
					},
				})
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
