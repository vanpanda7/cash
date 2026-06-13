<template>
	<view>
		<view class="uni-padding-wrap uni-common-mt" style="background-color: #ffc84c;">
			<uni-segmented-control :current="current" :values="items" style-type="text" active-color="#000000" @clickItem="onClickItem" />
		</view>

		<view style="height: 80rpx;padding:0 24rpx;">
			<u-icon name="bookmark-fill" color="#ffc84c" size="28" style="float: left;margin-top: 20rpx;"></u-icon>
			<text style="float: left;font-family: PingFang SC-Medium;font-size: 35rpx;margin-top: 20rpx;">近30天支出趋势</text>
		</view>
		<canvas canvas-id="trendChart" id="trendChart" style="width:350px;height:240px;margin:0 auto;display:block;"></canvas>

		<view style="width: 100%;height: 20rpx;background-color: #f4f2ef;"></view>

		<view style="height: 80rpx;padding:0 24rpx;">
			<u-icon name="bookmark-fill" color="#4D7BF3" size="28" style="float: left;margin-top: 20rpx;"></u-icon>
			<text style="float: left;font-family: PingFang SC-Medium;font-size: 35rpx;margin-top: 20rpx;">近30天收入趋势</text>
		</view>
		<canvas canvas-id="trendChart2" id="trendChart2" style="width:350px;height:240px;margin:0 auto;display:block;"></canvas>
	</view>
</template>

<script>
	import uCharts from '@qiun/ucharts'

	export default {
		data() { return { items: ['收支', '分类', '趋势', '日历'], current: 2, labels: [], outData: [], inData: [] } },
		mounted() { this.fetchTrend() },
		methods: {
			onClickItem(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex
					if (this.current == 0) uni.switchTab({ url: '../shouzhi/shouzhi' })
					if (this.current == 1) uni.redirectTo({ url: '../fenglei/fenglei' })
					if (this.current == 3) uni.redirectTo({ url: '../chart/chart' })
				}
			},
			fetchTrend() {
				const API = 'http://cash.local'
				const req = (time, inorout) => new Promise(r => {
					uni.request({ url: API + '/query_sum_by_time', method: 'POST', header: { 'Content-Type': 'application/json' }, data: { time, inorout }, success: res => r(res.data.sum || 0), fail: () => r(0) })
				})
				const now = new Date(); const labels = []; const outReqs = []; const inReqs = []
				for (let d = 29; d >= 0; d--) {
					const dt = new Date(now.getTime() - d * 24 * 3600 * 1000)
					labels.push((dt.getMonth()+1) + '/' + dt.getDate())
					const ds = dt.getFullYear() + '-' + (dt.getMonth()+1<10?'0':'')+(dt.getMonth()+1) + '-' + (dt.getDate()<10?'0':'')+dt.getDate()
					outReqs.push(req(ds, 'out')); inReqs.push(req(ds, 'in'))
				}
				this.labels = labels
				Promise.all(outReqs).then(d => { this.outData = d; this.$nextTick(() => this.draw('trendChart', d, '#FD416E')) })
				Promise.all(inReqs).then(d => { this.inData = d; this.$nextTick(() => this.draw('trendChart2', d, '#4D7BF3')) })
			},
			draw(canvasId, data, color) {
				if (!data.length) return
				const ctx = uni.createCanvasContext(canvasId, this)
				if (!ctx) return setTimeout(() => this.draw(canvasId, data, color), 300)
				const labels = this.labels.filter((_, i) => i % 5 === 0)
				try {
					new uCharts({
						context: ctx, canvasId: canvasId, type: 'line',
						categories: this.labels, series: [{ name: '金额', data: data, color: color }],
						yAxis: { min: 0, gridType: 'dash' }, xAxis: { disableGrid: true, labelCount: 5 },
						width: 350, height: 240,
						$this: this, dataLabel: false, legend: { show: false },
						extra: { line: { type: 'straight', width: 1.5 }, area: { type: 'straight', opacity: 0.1, color: color } }
					})
				} catch(e) {}
			}
		}
	}
</script>

<style>page { background: #f4f2ef; }</style>
