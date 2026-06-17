<template>
	<view>
		<view class="uni-padding-wrap uni-common-mt" style="background-color: #ffc84c;">
			<uni-segmented-control :current="current" :values="items" style-type="text" active-color="#000000" @clickItem="onClickItem" />
		</view>

		<view>
			<view style="height: 60rpx;">
				<u-icon name="bookmark-fill" color="#FFC84C" size="28" style="float: left;margin-top: 15rpx;"></u-icon>
				<text style="float: left;font-family: PingFang SC-Medium;font-size: 35rpx;margin-top: 15rpx;">预算结余</text>
			</view>
			<view style="width: 100%;height: 300rpx;">
				<view style="width: 94%;height:30rpx;margin-left: 3%;margin-top: 3%;margin-bottom: 8%;">
					<text style="font-family: PingFang SC-Regular;">日支出</text>
					<text style="font-family: DIN-Bold;float: right;">{{dayOut}} / {{dayBudget}}</text>
					<u-line-progress :percentage="dayPercent" activeColor="#46356B" :showText="false" height="12"></u-line-progress>
				</view>
				<view style="width: 94%;height:30rpx;margin-left: 3%;margin-top: 3%;margin-bottom: 8%;">
					<text style="font-family: PingFang SC-Regular;">月支出</text>
					<text style="font-family: DIN-Bold;float: right;">{{monthOut}} / {{monthBudget}}</text>
					<u-line-progress :percentage="monthOutPercent" activeColor="#46356B" :showText="false" height="12"></u-line-progress>
				</view>
				<view style="width: 94%;height:30rpx;margin-left: 3%;margin-top: 3%;margin-bottom: 8%;">
					<text style="font-family: PingFang SC-Regular;">月收入</text>
					<text style="font-family: DIN-Bold;float: right;">{{monthIn}}</text>
					<u-line-progress :percentage="monthInPercent" activeColor="#4D7BF3" :showText="false" height="12"></u-line-progress>
				</view>
			</view>
		</view>

		<view style="width: 100%;height: 20rpx;background-color: #f4f2ef ;position:relative;top: -20rpx;"></view>

		<view>
			<view style="height: 60rpx;padding:0 24rpx;">
				<u-icon name="bookmark-fill" color="#FD416E" size="28" style="float: left;margin-top: 15rpx;"></u-icon>
				<text style="float: left;font-family: PingFang SC-Medium;font-size: 35rpx;margin-top: 15rpx;">7日支出</text>
			</view>
			<canvas canvas-id="canvasOut" id="canvasOut" style="width:350px;height:220px;margin:0 auto;display:block;"></canvas>
		</view>

		<view style="width: 100%;height: 20rpx;background-color: #f4f2ef;"></view>

		<view>
			<view style="height: 60rpx;padding:0 24rpx;">
				<u-icon name="bookmark-fill" color="#4D7BF3" size="28" style="float: left;margin-top: 15rpx;"></u-icon>
				<text style="float: left;font-family: PingFang SC-Medium;font-size: 35rpx;margin-top: 15rpx;">7日收入</text>
			</view>
			<canvas canvas-id="canvasIn" id="canvasIn" style="width:350px;height:220px;margin:0 auto;display:block;"></canvas>
		</view>
	</view>
</template>

<script>
	import uCharts from '@qiun/ucharts'

	export default {
		data() {
			return {
				items: ['收支', '分类', '趋势', '日历'],
				current: 0,
				dayOut: 0,
				dayBudget: 100,
				monthOut: 0,
				monthBudget: 3000,
				monthIn: 0,
				weekLabels: [],
				weekOutData: [],
				weekInData: [],
			}
		},
		computed: {
			dayPercent() { return this.dayBudget > 0 ? Math.min(Math.round((this.dayOut / this.dayBudget) * 100), 100) : 0 },
			monthOutPercent() { return this.monthBudget > 0 ? Math.min(Math.round((this.monthOut / this.monthBudget) * 100), 100) : 0 },
			monthInPercent() { return this.monthIn > 0 ? Math.min(Math.round((this.monthIn / 10000) * 100), 100) : 10 }
		},
		mounted() { this.loadBudget(); this.fetchAllData() },
	onPullDownRefresh() {
		this.loadBudget()
		this.fetchAllData().finally(() => uni.stopPullDownRefresh())
	},
		methods: {
			onClickItem(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex
					if (this.current == 1) uni.redirectTo({ url: '../fenglei/fenglei' })
					if (this.current == 2) uni.redirectTo({ url: '../qushi/qushi' })
					if (this.current == 3) uni.redirectTo({ url: '../chart/chart' })
				}
			},
		loadBudget() {
			try { this.dayBudget = Number(uni.getStorageSync('cash_budget_day')) || 100 } catch(e) {}
			try { this.monthBudget = Number(uni.getStorageSync('cash_budget_month')) || 3000 } catch(e) {}
		},
		fetchAllData() {
			const req = (url, data) => new Promise((resolve) => {
				uni.request({ url, method: 'POST', header: { 'Content-Type': 'application/json' }, data, success: res => resolve(res.data.sum || 0), fail: () => resolve(0) })
			})
			const API = 'http://cash.local'
			const p0 = Promise.all([
				req(API + '/query_sum_by_time', { time: 'today', inorout: 'out' }),
				req(API + '/query_sum_by_time', { time: 'month', inorout: 'out' }),
				req(API + '/query_sum_by_time', { time: 'month', inorout: 'in' }),
			]).then(([dayO, monthO, monthI]) => {
				this.dayOut = dayO; this.monthOut = monthO; this.monthIn = monthI
			})
			const now = new Date()
			const days = []; const dayReqsOut = []; const dayReqsIn = []
			for (let d = 6; d >= 0; d--) {
				const dt = new Date(now.getTime() - d * 24 * 3600 * 1000)
				days.push((dt.getMonth() + 1) + '/' + dt.getDate())
				const ds = dt.getFullYear() + '-' + (dt.getMonth()+1<10?'0':'')+(dt.getMonth()+1) + '-' + (dt.getDate()<10?'0':'')+dt.getDate()
				dayReqsOut.push(req(API + '/query_sum_by_time', { time: ds, inorout: 'out' }))
				dayReqsIn.push(req(API + '/query_sum_by_time', { time: ds, inorout: 'in' }))
			}
			this.weekLabels = days
			const p1 = Promise.all(dayReqsOut).then(data => { this.weekOutData = data; this.$nextTick(() => this.drawChart('canvasOut', data, '#FD416E')) })
			const p2 = Promise.all(dayReqsIn).then(data => { this.weekInData = data; this.$nextTick(() => this.drawChart('canvasIn', data, '#4D7BF3')) })
			return Promise.all([p0, p1, p2])
		},
			drawChart(canvasId, yData, color) {
				const ctx = uni.createCanvasContext(canvasId, this)
				if (!ctx) {
					setTimeout(() => this.drawChart(canvasId, yData, color), 300)
					return
				}
				try {
					new uCharts({
						context: ctx, canvasId: canvasId, type: 'line',
						categories: this.weekLabels, series: [{ name: '金额', data: yData, color: color }],
						yAxis: { min: 0, gridType: 'dash' }, xAxis: { disableGrid: true },
						width: 350, height: 220,
						$this: this, dataLabel: false, legend: { show: false },
						extra: { line: { type: 'straight', width: 2 } }
					})
				} catch(e) {}
			}
		}
	}
</script>

<style></style>
