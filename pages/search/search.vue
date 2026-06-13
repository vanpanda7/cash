<template>
	<view>
		<view style="background:#ffc84c;padding:16rpx 24rpx;">
			<view style="display:flex;align-items:center;background:white;border-radius:40rpx;padding:8rpx 20rpx;">
				<u-icon name="search" size="20" color="#999"></u-icon>
				<input v-model="keyword" placeholder="搜索备注、分类、名称..." style="flex:1;height:64rpx;font-size:28rpx;margin-left:12rpx;" @input="doFilter" />
				<text v-if="keyword" @click="keyword='';doFilter()" style="color:#999;font-size:24rpx;">清除</text>
			</view>
		</view>

		<view style="background:white;padding:16rpx 24rpx;display:flex;flex-wrap:wrap;align-items:center;gap:12rpx;border-bottom:8rpx solid #f4f2ef;">
			<picker mode="date" @change="e => { dateFrom = e.detail.value; doFilter() }">
				<text class="chip" :style="{background: dateFrom ? '#ffc84c' : '#edeae6', color: dateFrom ? '#333' : '#888'}">{{dateFrom || '开始日期'}}</text>
			</picker>
			<picker mode="date" @change="e => { dateTo = e.detail.value; doFilter() }">
				<text class="chip" :style="{background: dateTo ? '#ffc84c' : '#edeae6', color: dateTo ? '#333' : '#888'}">{{dateTo || '结束日期'}}</text>
			</picker>
			<view @click="toggleFilter('inorout', '')" class="chip" :style="{background: !selInorout ? '#333' : '#edeae6', color: !selInorout ? '#fff' : '#888'}">全部</view>
			<view @click="toggleFilter('inorout', '支出')" class="chip" :style="{background: selInorout==='支出' ? '#FD416E' : '#edeae6', color: selInorout==='支出' ? '#fff' : '#888'}">支出</view>
			<view @click="toggleFilter('inorout', '收入')" class="chip" :style="{background: selInorout==='收入' ? '#4D7BF3' : '#edeae6', color: selInorout==='收入' ? '#fff' : '#888'}">收入</view>
			<text v-if="hasFilter" @click="clearAllFilter" class="chip" style="background:none;color:#FD416E;border:1rpx solid #FD416E;">重置</text>
		</view>

		<view style="background:white;padding:10rpx 24rpx 16rpx;display:flex;flex-wrap:wrap;gap:10rpx;border-bottom:1rpx solid #edeae6;">
			<text v-for="t in activeCats" :key="t" @click="toggleFilter('type', t)" class="chip small"
				:style="{background: selType===t ? '#ffc84c' : '#fbf9f7', color: selType===t ? '#333' : '#888'}">{{t}}</text>
		</view>

		<view style="background:white;padding:10rpx 24rpx 16rpx;display:flex;flex-wrap:wrap;gap:10rpx;">
			<text v-for="d in filterDests" :key="d" @click="toggleFilter('dest', d)" class="chip small"
				:style="{background: selDest===d ? '#46356B' : '#fbf9f7', color: selDest===d ? '#fff' : '#888'}">{{d}}</text>
		</view>

		<view style="text-align:center;padding:40rpx 0;color:#999;font-size:28rpx;" v-if="filtered.length === 0 && loaded">
			无匹配记录
		</view>

		<view v-for="(item, idx) in filtered" :key="idx" @click="goDetail(item)"
			style="background:white;margin:8rpx 24rpx 16rpx;border-radius:16rpx;padding:24rpx;display:flex;align-items:center;">
			<image :src="getTypeIcon(item.type)" style="width:80rpx;height:80rpx;margin-right:20rpx;border-radius:12rpx;"></image>
			<view style="flex:1;">
				<view style="display:flex;justify-content:space-between;">
					<text style="font-size:30rpx;font-weight:500;">{{item.name}}</text>
					<text style="font-size:34rpx;font-weight:700;font-family:DIN-Bold;"
						:style="{color: item.inorout === '收入' ? '#4D7BF3' : '#FD416E'}">{{item.inorout === '收入' ? '+' : '-'}}{{item.money}}</text>
				</view>
				<view style="display:flex;justify-content:space-between;margin-top:8rpx;">
					<text style="font-size:24rpx;color:#999;">{{item.type}} · {{item.book}}</text>
					<text style="font-size:24rpx;color:#999;">{{item.dest}} · {{item.time.slice(0,10)}}</text>
				</view>
			</view>
		</view>
		<view style="height:60rpx;"></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				dateFrom: '',
				dateTo: '',
				selType: '',
				selDest: '',
				selInorout: '',
				filterTypesOut: ['餐饮美食','购物消费','交通出行','日常生活','文教娱乐','充值缴费','旅游住宿','医药医疗','美容保养','亲子宠物','债务还款','其他'],
				filterTypesIn: ['基本工资','奖金补贴','生活费','红包','礼金礼物','现金支取','理财盈亏','债务收款','公益慈善'],
				filterDests: ['支付宝', '微信'],
				allBills: [],
				filtered: [],
				loaded: false
			}
		},
		computed: {
			hasFilter() { return this.selType || this.selDest || this.selInorout || this.dateFrom || this.dateTo },
			activeCats() {
				if (this.selInorout === '支出') return this.filterTypesOut
				if (this.selInorout === '收入') return this.filterTypesIn
				return [...this.filterTypesOut, ...this.filterTypesIn]
			}
		},
		onShow() { this.loadBills() },
		methods: {
			loadBills() {
				uni.request({
					url: 'http://cash.local/query_all_bills',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					success: res => {
						this.allBills = (res.data || []).sort((a, b) => b.id - a.id)
						this.filtered = [...this.allBills]
						this.loaded = true
					},
					fail: () => { this.allBills = []; this.loaded = true }
				})
			},
			toggleFilter(field, val) {
				if (field === 'type') { this.selType = this.selType === val ? '' : val }
				if (field === 'dest') { this.selDest = this.selDest === val ? '' : val }
				if (field === 'inorout') { this.selInorout = this.selInorout === val ? '' : val; this.selType = '' }
				this.doFilter()
			},
			clearAllFilter() {
				this.selType = ''; this.selDest = ''; this.selInorout = ''; this.dateFrom = ''; this.dateTo = ''; this.keyword = ''
				this.filtered = [...this.allBills]
			},
			doFilter() {
				let list = [...this.allBills]
				const kw = this.keyword.toLowerCase()
				if (kw) list = list.filter(b => b.name.includes(kw) || (b.type||'').includes(kw) || (b.remark||'').includes(kw) || (b.dest||'').includes(kw))
				if (this.selType) list = list.filter(b => b.type === this.selType)
				if (this.selDest) list = list.filter(b => b.dest === this.selDest)
				if (this.selInorout) list = list.filter(b => b.inorout === this.selInorout)
				if (this.dateFrom) list = list.filter(b => b.time.slice(0,10) >= this.dateFrom)
				if (this.dateTo) list = list.filter(b => b.time.slice(0,10) <= this.dateTo)
				this.filtered = list
			},
			goDetail(item) {
				uni.navigateTo({
					url: '../bill_info/bill_info?book=' + encodeURIComponent(item.book) + '&dest=' + encodeURIComponent(item.dest) +
						'&id=' + item.id + '&inorout=' + encodeURIComponent(item.inorout) + '&money=' + encodeURIComponent(item.money) +
						'&name=' + encodeURIComponent(item.name) +
						'&remark=' + encodeURIComponent(item.remark||'') + '&time=' + encodeURIComponent(item.time) + '&type=' + encodeURIComponent(item.type)
				})
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
	.chip { padding: 8rpx 20rpx; border-radius: 20rpx; font-size: 26rpx; display: inline-block; }
	.chip.small { font-size: 24rpx; padding: 6rpx 16rpx; }
</style>
