<template>
	<view>
		<view style="background:#ffc84c;display:flex;justify-content:center;padding:16rpx;">
			<picker mode="date" fields="month" @change="onMonthChange">
				<text style="font-size:32rpx;font-weight:600;">{{yearMonth}} ▾</text>
			</picker>
		</view>

		<view style="display:flex;padding:24rpx;gap:16rpx;background:white;">
			<view style="flex:1;background:#fbf9f7;border-radius:16rpx;padding:24rpx;text-align:center;">
				<text style="font-size:24rpx;color:#999;">支出</text>
				<text style="display:block;font-size:36rpx;font-weight:700;color:#FD416E;font-family:DIN-Bold;margin-top:8rpx;">{{data.outSum}}</text>
			</view>
			<view style="flex:1;background:#fbf9f7;border-radius:16rpx;padding:24rpx;text-align:center;">
				<text style="font-size:24rpx;color:#999;">收入</text>
				<text style="display:block;font-size:36rpx;font-weight:700;color:#4D7BF3;font-family:DIN-Bold;margin-top:8rpx;">{{data.inSum}}</text>
			</view>
			<view style="flex:1;background:#fbf9f7;border-radius:16rpx;padding:24rpx;text-align:center;">
				<text style="font-size:24rpx;color:#999;">结余</text>
				<text style="display:block;font-size:36rpx;font-weight:700;font-family:DIN-Bold;margin-top:8rpx;"
					:style="{color: (data.inSum - data.outSum) >= 0 ? '#46356B' : '#FD416E'}">{{data.inSum - data.outSum}}</text>
			</view>
		</view>

		<view v-if="lastOut !== null" style="display:flex;padding:0 24rpx 16rpx;background:white;gap:16rpx;">
			<view style="flex:1;text-align:center;">
				<text style="font-size:22rpx;color:#999;">较上月支出</text>
				<text style="display:block;font-size:26rpx;font-weight:600;" :style="{color: lastOut > data.outSum ? '#4D7BF3' : '#FD416E'}">
					{{lastOut > data.outSum ? '↓' : '↑'}}{{Math.abs(data.outSum - lastOut)}} ({{lastOut ? Math.round((data.outSum - lastOut) / lastOut * 100) : 0}}%)
				</text>
			</view>
			<view style="flex:1;text-align:center;">
				<text style="font-size:22rpx;color:#999;">较上月收入</text>
				<text style="display:block;font-size:26rpx;font-weight:600;" :style="{color: lastIn < data.inSum ? '#4D7BF3' : '#FD416E'}">
					{{lastIn < data.inSum ? '↑' : '↓'}}{{Math.abs(data.inSum - lastIn)}} ({{lastIn ? Math.round((data.inSum - lastIn) / lastIn * 100) : 0}}%)
				</text>
			</view>
		</view>

		<view style="height:16rpx;background:#f4f2ef;"></view>

		<view style="padding:24rpx;background:white;">
			<text style="font-size:30rpx;font-weight:600;margin-bottom:16rpx;display:block;">支出分类占比</text>
			<canvas canvas-id="reportPie" id="reportPie" style="width:350px;height:350px;margin:0 auto;display:block;"></canvas>
		</view>

		<view style="height:16rpx;background:#f4f2ef;"></view>

		<view style="padding:24rpx;background:white;">
			<text style="font-size:30rpx;font-weight:600;margin-bottom:16rpx;display:block;">每日趋势</text>
			<canvas canvas-id="reportLine" id="reportLine" style="width:350px;height:240px;margin:0 auto;display:block;"></canvas>
		</view>

		<view style="height:16rpx;background:#f4f2ef;"></view>

		<view style="padding:24rpx;background:white;">
			<text style="font-size:30rpx;font-weight:600;display:block;">支出排行</text>
			<view v-for="(item, idx) in rankList" :key="idx" style="display:flex;align-items:center;padding:16rpx 0;border-bottom:1rpx solid #edeae6;">
				<text style="width:40rpx;color:#999;font-size:24rpx;">{{idx+1}}</text>
				<image :src="getTypeIcon(item.name)" style="width:48rpx;height:48rpx;margin-right:16rpx;"></image>
				<text style="flex:1;font-size:28rpx;">{{item.name}}</text>
				<text style="font-size:28rpx;font-weight:600;margin-right:16rpx;">{{item.value}}</text>
				<u-line-progress :percentage="item.percent" activeColor="#46356B" :showText="false" height="8" style="width:30%;"></u-line-progress>
			</view>
		</view>
		<view style="height:80rpx;"></view>
	</view>
</template>

<script>
	import uCharts from '@qiun/ucharts'

	export default {
		data() {
			const d = new Date()
			return {
				yearMonth: d.getFullYear() + '-' + pad(d.getMonth()+1),
				data: { outSum:0, inSum:0 },
				rankList: [], lastOut: null, lastIn: null, lineLabels: [], lineOut: [], lineIn: [],
			}
		},
		mounted() { this.fetchReport() },
		methods: {
			onMonthChange(e) { this.yearMonth = e.detail.value; this.fetchReport() },
			fetchReport() {
				const [y, m] = this.yearMonth.split('-').map(Number)
				const API = 'http://cash.local'
				const req = (url, data) => new Promise(r => uni.request({ url: API + url, method: 'POST', header: { 'Content-Type': 'application/json' }, data, success: res => r(res.data), fail: () => r({}) }))
				Promise.all([
					req('/query_sum_by_time', { time: this.yearMonth, inorout: 'out' }),
					req('/query_sum_by_time', { time: this.yearMonth, inorout: 'in' }),
					req('/query_sum_by_time_group', { time: this.yearMonth, inorout: 'out' }),
				]).then(([outRes, inRes, groupRes]) => {
					this.data.outSum = outRes.sum || 0; this.data.inSum = inRes.sum || 0
					const maxVal = groupRes.length ? groupRes[0].sum * 1.2 : 1
					this.rankList = groupRes.map(g => ({ name: g.type, value: g.sum, percent: Math.min(Math.round(g.sum / maxVal * 100), 100) })).filter(g => g.value > 0)
					this.$nextTick(() => this.drawPie(groupRes))
					const daysInMonth = new Date(y, m, 0).getDate()
					const labels = []; const dayReqsOut = []; const dayReqsIn = []
					for (let d = 1; d <= daysInMonth; d++) {
						labels.push(m + '/' + d); const ds = y + '-' + pad(m) + '-' + pad(d)
						dayReqsOut.push(req('/query_sum_by_time', { time: ds, inorout: 'out' }))
						dayReqsIn.push(req('/query_sum_by_time', { time: ds, inorout: 'in' }))
					}
					this.lineLabels = labels
					Promise.all(dayReqsOut).then(arr => { this.lineOut = arr.map(r => r.sum || 0); this.$nextTick(() => this.drawLine()) })
					Promise.all(dayReqsIn).then(arr => { this.lineIn = arr.map(r => r.sum || 0); this.$nextTick(() => this.drawLine()) })
					const prevMonth = m === 1 ? (y-1) + '-12' : y + '-' + pad(m-1)
					Promise.all([
						req('/query_sum_by_time', { time: prevMonth, inorout: 'out' }),
						req('/query_sum_by_time', { time: prevMonth, inorout: 'in' }),
					]).then(([prevOut, prevIn]) => { this.lastOut = prevOut.sum || 0; this.lastIn = prevIn.sum || 0 })
				})
			},
			drawPie(groupRes) {
				if (!groupRes.length) return
				const ctx = uni.createCanvasContext('reportPie', this)
				if (!ctx) return setTimeout(() => this.drawPie(groupRes), 300)
				try {
					const topSeries = groupRes.slice(0, 6)
					new uCharts({ context: ctx, canvasId: 'reportPie', type: 'ring', series: topSeries.map(g => ({ name: g.type, data: g.sum })), width: 350, height: 350, $this: this, dataLabel: true, legend: { show: true, position: 'bottom', fontSize: 10 }, extra: { ring: { ringWidth: 24, centerColor: '#fff' } } })
				} catch(e) {}
			},
			drawLine() {
				if (!this.lineOut.length) return
				const ctx = uni.createCanvasContext('reportLine', this)
				if (!ctx) return setTimeout(() => this.drawLine(), 300)
				try {
					new uCharts({ context: ctx, canvasId: 'reportLine', type: 'line', categories: this.lineLabels, series: [{ name: '支出', data: this.lineOut, color: '#FD416E' }, { name: '收入', data: this.lineIn, color: '#4D7BF3' }], yAxis: { min: 0, gridType: 'dash' }, xAxis: { disableGrid: true, labelCount: 8 }, width: 350, height: 240, $this: this, dataLabel: false, legend: { show: true }, extra: { line: { type: 'straight', width: 1.5 } } })
				} catch(e) {}
			},
			getTypeIcon(typeName) {
				const idx = { '日常生活':1,'餐饮美食':2,'购物消费':3,'文教娱乐':4,'充值缴费':5,'旅游住宿':6,'交通出行':7,'医药医疗':8,'美容保养':9,'亲子宠物':10,'债务还款':11,'其他':12,'基本工资':13,'奖金补贴':14,'生活费':15,'红包':16,'礼金礼物':17,'现金支取':18,'理财盈亏':19,'债务收款':20,'公益慈善':21 }[typeName] || 12
				return '/static/img/icon/' + (idx < 10 ? '0' + idx : '' + idx) + '.png'
			}
		}
	}
	function pad(n) { return n < 10 ? '0' + n : '' + n }
</script>

<style>page { background: #f4f2ef; }</style>
