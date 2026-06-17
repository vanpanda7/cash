<template>
	<view>
		<!-- pages/assets/assets.wxml -->
		<view class="assetsHeader">
			<view class="bg">
				<image mode="widthFix" src="/static/img/zichan-bg.png"></image>
			</view>
			<view class="total">
				<text class="title_h1">{{ total }}.00</text>
				<text class="title_h2">总资产 (元)</text>
			</view>
		</view>
		<view class="assetsBody">
			<view>
				<view class="list-item">
					<text id="MainTitle">我的账户</text>
					<view class="list-item-body" style="border-radius: 100px;" v-for="(item,index)  in this.allList" :key="index">

						<view class="list-item-body-one" :style="{backgroundColor:item.typeBac}" @click="selAssets(item.typeName)">
							<image :src="item.typeImg"></image>
							<view style="float: left;">
								<text class="list-item-body-title">{{item.typeName}}</text>
								<text class="list-item-body-beizhu">{{item.typeName}}</text>
							</view>
							<view style="float: right;">
								<text class="list-item-body-zhibuzhichu">￥{{item.typeMoney}}.00</text>
							</view>
						</view>

					</view>
					<view class="list-item-body">

						<view class="list-item-body-one" style="height: 80px;border: dashed 1px;" @click="addAssets">
							<image src="../../static/img/zc-add.png" style="position: relative;left:45%;top: 20%;"></image>
							<text style="float: left;margin-left: 113px;margin-top:15%">添加更多</text>
						</view>
					</view>

				</view>
				<view style="width: 100%;height:200rpx;"></view>
			</view>
		</view>

	</view>
</template>

<script>
	// pages/assets/assets.js
	export default {
		data() {
			return {
				total: 0,
				selected: 0,
				allList: [],

					zhanghuImg: [
						'/static/img/zc-icon1.png',
						'/static/img/zc-icon2.png',
						'/static/img/zc-icon3.png',
						'/static/img/zc-icon4.png',
						'/static/img/zc-icon5.png',
						'/static/img/zc-icon6.png',
						'/static/img/zc-icon7.png'
					],
					presetColors: {
						'微信': { img: 0, bac: '#e2f4f4' },
						'支付宝': { img: 1, bac: '#cfdff3' },
					}
			};
		},
		onShow() {
			this.selZhanghu()
			this.selAllnum()
		},
		onPullDownRefresh() {
		Promise.all([this.selZhanghu(), this.selAllnum()])
			.finally(() => uni.stopPullDownRefresh())
	},
		onLoad() {
			this.selAllnum()
		},
		methods: {
			selZhanghu() {
				this.allList = []
				return new Promise(resolve => {
					uni.request({
						url: 'http://cash.local/query_get_destlist',
						method: 'POST',
						header: {
							'Content-Type': 'application/json'
						},
						success: res => {
							let obj = {
								typeName: '',
								typeMoney: 0,
								typeImg: '',
								typeBac: ''
							}
						for (const i in res.data) {
								obj.typeName = i
								obj.typeMoney = res.data[i]
								const p = this.presetColors[i]
								if (p) {
									obj.typeImg = this.zhanghuImg[p.img]
									obj.typeBac = p.bac
								} else {
									obj.typeImg = this.zhanghuImg[4]
									obj.typeBac = '#EDEEF2'
								}
								this.allList.push(obj)
								obj = {
									typeName: '',
									typeMoney: 0,
									typeImg: '',
									typeBac: '',
								}
							}
						},
						fail: () => {},
						complete: () => resolve()
					})
				})
			},

			selAllnum() {
				return new Promise(resolve => {
					uni.request({
						url: 'http://cash.local/query_all_dest_sum',
						method: 'POST',
						header: {
							'Content-Type': 'application/json'
						},
						success: res => {
							this.total = String(res.data.sum)
						},
						fail: () => {},
						complete: () => resolve()
					})
				})
			},

			selAssets(item) {
				uni.navigateTo({
					url: '../assets_info/assets_info?type=' + encodeURIComponent(item)
				})
			},
			addAssets(item) {
				uni.navigateTo({
					url: '../assets_add/assets_add'
				})
			}

		}
	};
</script>


<style>
	.assetsHeader {
		position: absolute;
		top: 0;
		width: 100%;
		height: 400rpx;
		/* background-color: #02825F; */
	}

	.bg image {
		position: absolute;
		top: 0px;
		bottom: 0px;
		width: 91.5%;
		margin: 16px;
		border-radius: 12px;
		box-shadow: rgb(223, 162, 24, 0.5) 0px 7px 14px;
	}

	.assetsHeader .total {
		position: absolute;
		top: 150rpx;
		left: 10%;
		width: 80%;
		height: 150rpx;
	}

	.assetsHeader .total .title_h1 {
		float: left;
		font-size: 30px;
		font-weight: 400;
		line-height: 48px;
		font-family: DIN-Bold;
	}

	.assetsHeader .total .title_h2 {
		float: right;
		line-height: 28px;
		margin-right: 65%;
		font-family: PingFang SC-Regular;
		font-weight: 400;
		font-size: 32rpx;
	}

	.assetsBody {
		position: relative;
		top: 400rpx;
		width: 100%;
		/* background-color: #121DBB; */
		padding-top: 20rpx;
	}

	#MainTitle {
		font-size: 18px;
		font-weight: 500;
		text-align: left;
		margin: 20px 16px 12px 16px;
		font-family: PingFang SC-Medium;
		font-weight: 500;
		/* background-color: #2C405A; */

	}

	.list-item {
		/* background-color: #826bbb; */
		width: 100%;
		min-height: 100rpx;
	}

	.list-item-body {
		margin-top: 40rpx;
	}

	.list-item-body-Maintitle {
		height: 100rpx;
		background-color: #2C405A;
		float: left;
		width: 100%;
	}

	.list-item-body-one {
		width: 94%;
		height: 140rpx;
		background-color: white;
		margin-left: 3%;
		border-radius: 20rpx;
		margin-bottom: 3%;
	}

	.list-item-body-one image {
		width: 64rpx;
		height: 64rpx;
		float: left;
		position: relative;
		top: 38rpx;
		left: 25rpx;
	}

	.list-item-body-title {
		/* background-color: #007AFF; */
		width: 250rpx;
		float: left;
		margin-top: 30rpx;
		margin-left: 40rpx;
		font-size: 30rpx;
		font-family: PingFang SC-Medium;
		font-weight: 500;
	}

	.list-item-body-zhibuzhichu {
		/* background-color: #007AFF; */
		float: right;
		text-align: right;
		margin-top: 45rpx;
		margin-right: 50rpx;
		width: 220rpx;
		font-weight: bold;
		font-size: 40rpx;
		font-family: DIN-Bold;
	}

	.list-item-body-beizhu {
		/* background-color: #007AFF; */
		float: left;
		margin-top: 80rpx;
		margin-left: -246rpx;
		color: #929292;
		font-size: 24rpx;
	}
</style>
