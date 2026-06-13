<template>
	<view>
		<view class="uni-padding-wrap uni-common-mt" style="background-color: #ffc84c;">
			<uni-segmented-control :current="current" :values="items" style-type="text" active-color="#000000" @clickItem="onClickItem" />
		</view>

		<view style="display:flex;align-items:center;justify-content:space-between;padding:16rpx 24rpx;background:white;border-bottom:1rpx solid #edeae6;">
			<view style="display:flex;gap:12rpx;">
				<view @click="setInorout('out')" class="switch-chip" :style="{background: inOrOut2==='out' ? '#FD416E' : '#edeae6', color: inOrOut2==='out' ? '#fff' : '#888'}">支出</view>
				<view @click="setInorout('in')" class="switch-chip" :style="{background: inOrOut2==='in' ? '#4D7BF3' : '#edeae6', color: inOrOut2==='in' ? '#fff' : '#888'}">收入</view>
			</view>
			<picker @change="bindPickerChange1" :range="array1">
				<text style="font-size:26rpx;color:#666;">{{DataTime1}} ▾</text>
			</picker>
		</view>

		<view style="height: 60rpx;padding:0 24rpx;">
			<u-icon name="bookmark-fill" color="#ffc84c" size="28" style="float: left;margin-top: 15rpx;"></u-icon>
			<text style="float: left;font-family: PingFang SC-Medium;font-size: 35rpx;margin-top: 15rpx;">饼图</text>
		</view>
		<canvas canvas-id="pieChart" id="pieChart" style="width:350px;height:350px;margin:0 auto;display:block;"></canvas>

		<view style="width: 100%;height: 20rpx;background-color: #f4f2ef;"></view>

		<view style="height: 60rpx;">
			<u-icon name="bookmark-fill" color="#ffc84c" size="28" style="float: left;"></u-icon>
			<text style="float: left;font-family: PingFang SC-Medium;font-size: 35rpx;">排行</text>
		</view>
		<view style="width: 100%;" v-for="(item,index)  in this.myChart2" :key="index">
			<view style="float: left;width: 100%;height: 150rpx;">
				<image :src="getTypeIcon(item.name)" style="width: 70rpx;height: 70rpx;position: relative;margin: 3%;"></image>
				<text style="position: relative;bottom: 50rpx;font-family:PingFang SC-Regular;font-size: 35rpx;">{{item.name}}</text>
				<view style="width: 75%;height:30rpx;margin-left: 3%;margin-top: -2%;">
					<u-line-progress :percentage="item.setLen1" activeColor="#46356B" :showText="false" height="12"></u-line-progress>
				</view>
				<text style="float: right;right: 25rpx;position: relative;bottom: 40rpx;font-family:DIN-Bold;">￥{{item.value}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import uCharts from '@qiun/ucharts'

	export default {
		data() {
			return {
				items: ['收支', '分类', '趋势', '日历'],
				current: 1,
				array1: ['今日', '本周', '本月', '本年'],
				DataTime1: '本月', DataTime2: 'month',
				inOrOut1: '支出', inOrOut2: 'out',
				group: [], myChart2: [],
			}
		},
		mounted() { this.querNum() },
		watch: { myChart2: { handler() { this.drawPie() }, deep: true } },
		methods: {
			onClickItem(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex
					if (this.current == 0) uni.switchTab({ url: '../shouzhi/shouzhi' })
					if (this.current == 2) uni.redirectTo({ url: '../qushi/qushi' })
					if (this.current == 3) uni.redirectTo({ url: '../chart/chart' })
				}
			},
			bindPickerChange1(e) {
				this.DataTime1 = this.array1[e.detail.value]
				this.DataTime2 = ['today','week','month','year'][e.detail.value]
				this.querNum()
			},
			setInorout(type) { this.inOrOut2 = type; this.inOrOut1 = type === 'out' ? '支出' : '收入'; this.querNum() },
			querNum() {
				this.myChart2 = []
				uni.request({
					url: 'http://cash.local/query_sum_by_time_group',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					data: { inorout: this.inOrOut2, time: this.DataTime2 },
					success: res => {
						let mixNum = 1
						for (const r of res.data) mixNum = Math.max(mixNum, r.sum * 1.2)
						const list = []
						for (const r of res.data) {
							list.push({ value: r.sum, name: r.type, setLen1: Math.min(Math.round(r.sum / mixNum * 100), 100) })
						}
						this.myChart2 = list
						let num = 0; this.group = []
						this.myChart2.forEach(item => { this.group[num] = item.name; num++ })
					}
				})
			},
			drawPie() {
				if (!this.myChart2.length) return
				const ctx = uni.createCanvasContext('pieChart', this)
				if (!ctx) return setTimeout(() => this.drawPie(), 300)
				try {
					const topSeries = this.myChart2.slice(0, 6)
					new uCharts({
						context: ctx, canvasId: 'pieChart', type: 'ring',
						series: topSeries.map(d => ({ name: d.name, data: d.value })),
						width: 350, height: 350,
						$this: this, dataLabel: true, legend: { show: true, position: 'bottom', fontSize: 10 },
						extra: { ring: { ringWidth: 24, centerColor: '#fff' } }
					})
				} catch(e) {}
			},
			getTypeIcon(typeName) {
				const idx = { '日常生活':1,'餐饮美食':2,'购物消费':3,'文教娱乐':4,'充值缴费':5,'旅游住宿':6,'交通出行':7,'医药医疗':8,'美容保养':9,'亲子宠物':10,'债务还款':11,'其他':12,'基本工资':13,'奖金补贴':14,'生活费':15,'红包':16,'礼金礼物':17,'现金支取':18,'理财盈亏':19,'债务收款':20,'公益慈善':21 }[typeName] || 12
				return '/static/img/icon/' + (idx < 10 ? '0' + idx : '' + idx) + '.png'
			}
		}
	}
</script>

<style>
	page { background: #f4f2ef; }
	.switch-chip { padding: 12rpx 36rpx; border-radius: 24rpx; font-size: 28rpx; font-weight: 600; }
</style>
