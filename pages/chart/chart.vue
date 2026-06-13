<template>
	<view>
		<view class="uni-padding-wrap uni-common-mt" style="background-color: #ffc84c;">
			<uni-segmented-control :current="current" :values="items" style-type="text" active-color="#000000" @clickItem="onClickItem" />
		</view>

		<view class="content">
			<view>
				<uni-calendar :insert="true" :lunar="true" :selected="calendarData" @change="change" />
			</view>

			<view class="list-wrap" style="background-color: #f4f2ef;margin-top: 16rpx;" v-for="(item,index)  in this.allList"
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

					<view style="width: 100%;height: 100rpx;background-color: #f4f2ef;float: left;"></view>
				</view>
			</view>

		</view>

	</view>

</template>

<script>
	export default {
		components: {},
		data() {
			return {
				items: ['收支', '分类', '趋势', '日历'],
				current: 3,

				calendarData: [],
				data: '',
				list: [],

				dateList: [],
				allList: [],
			}
		},
		onShow() {
			this.loadCalendarMarks()
		},
		methods: {
			loadCalendarMarks() {
				uni.request({
					url: 'http://cash.local/query_all_bills',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					success: res => {
						const bills = res.data || []
						const dates = {}
						for (const b of bills) {
							const d = (b.time || '').slice(0, 10)
							if (d) dates[d] = true
						}
						this.calendarData = Object.keys(dates).map(d => ({ date: d }))
					}
				})
			},

			onClickItem(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex
					if (this.current == 0) {
						uni.switchTab({ url: '../shouzhi/shouzhi' })
					}
					if (this.current == 1) {
						uni.redirectTo({ url: '../fenglei/fenglei' })
					}
					if (this.current == 2) {
						uni.redirectTo({ url: '../qushi/qushi' })
					}
				}
			},
			change(e) {
				this.allList = []
				this.data = e.fulldate
				this.QuerZhangdan(this.data)
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
				const objDay = {
					"ThisTime": "",
					"xingqi": "",
					"InMoney": 0,
					"OutMoney": 0,
					"list1": []
				}
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
							}

							let pendingSums = 2
							const tryPush = () => {
								pendingSums--
								if (pendingSums === 0) {
									objDay.ThisTime = time.slice(0, 10)
									this.allList.push(objDay)
								}
							}
							uni.request({
								url: 'http://cash.local/query_sum_by_time',
								method: 'POST',
								header: { 'Content-Type': 'application/json' },
								data: { "time": time, "inorout": 'in' },
								success: res => { objDay.InMoney = res.data.sum; tryPush() },
								fail: res => { console.log("false"); tryPush() },
							})
							uni.request({
								url: 'http://cash.local/query_sum_by_time',
								method: 'POST',
								header: { 'Content-Type': 'application/json' },
								data: { "time": time, "inorout": 'out' },
								success: res => { objDay.OutMoney = res.data.sum; tryPush() },
								fail: res => { console.log("false"); tryPush() },
							})
						}
					},
					fail: res => {
					},
				});
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
