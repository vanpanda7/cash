<template>
	<view>
		<view v-for="r in list" :key="r.id" style="background:white;padding:24rpx 32rpx;border-bottom:1rpx solid #edeae6;">
			<view style="display:flex;align-items:center;justify-content:space-between;">
				<view style="display:flex;align-items:center;flex:1;">
					<image :src="getTypeIcon(r.type)" style="width:64rpx;height:64rpx;margin-right:20rpx;"></image>
					<view>
						<text style="font-size:30rpx;font-weight:500;">{{r.name}}</text>
						<text style="display:block;font-size:24rpx;color:#999;">{{r.cycle === 'month' ? '每月' : r.cycle === 'week' ? '每周' : '每天'}} · {{r.nextDate}} · {{r.dest}}</text>
					</view>
				</view>
				<view style="text-align:right;">
					<text style="font-size:34rpx;font-weight:700;font-family:DIN-Bold;"
						:style="{color: r.inorout === '收入' ? '#4D7BF3' : '#FD416E'}">{{r.inorout === '收入' ? '+' : '-'}}{{r.money}}</text>
					<view style="display:flex;gap:16rpx;margin-top:8rpx;justify-content:flex-end;">
						<switch :checked="r.active" @change="toggle(r)" color="#ffc84c" style="transform:scale(0.7);" />
						<text @click="delRecur(r.id)" style="color:#FD416E;font-size:24rpx;">删除</text>
					</view>
				</view>
			</view>
		</view>

		<view v-if="list.length === 0" style="text-align:center;padding:80rpx 0;color:#999;">暂无周期账单</view>

		<button type="primary" @click="showForm = true" style="margin:32rpx;background:#ffc84c;color:#333;border:none;">添加周期账单</button>

		<u-popup :show="showForm" mode="bottom" @close="showForm = false">
			<view style="background:white;padding:24rpx 32rpx 60rpx;border-radius:20rpx 20rpx 0 0;">
				<text style="font-size:32rpx;font-weight:600;display:block;text-align:center;margin-bottom:24rpx;">新增周期账单</text>
				<u-input v-model="form.name" placeholder="名称（如：房租）" border="surround" style="margin-bottom:16rpx;"></u-input>
				<u-input v-model="form.money" type="number" placeholder="金额" border="surround" style="margin-bottom:16rpx;"></u-input>
				<view style="display:flex;gap:16rpx;margin-bottom:16rpx;">
					<picker :range="form.tabs" @change="e => form.inorout = form.tabs[e.detail.value] === '支出' ? '支出' : '收入'"><text style="border:1rpx solid #ddd;padding:12rpx 24rpx;border-radius:10rpx;">{{form.inorout}} ▾</text></picker>
					<picker :range="cycles" @change="e => form.cycle = cycles[e.detail.value]"><text style="border:1rpx solid #ddd;padding:12rpx 24rpx;border-radius:10rpx;">{{form.cycle === 'month' ? '每月' : form.cycle === 'week' ? '每周' : '每天'}} ▾</text></picker>
					<picker :range="dests" @change="e => form.dest = dests[e.detail.value]"><text style="border:1rpx solid #ddd;padding:12rpx 24rpx;border-radius:10rpx;">{{form.dest}} ▾</text></picker>
				</view>
				<picker mode="date" @change="e => form.nextDate = e.detail.value"><text style="border:1rpx solid #ddd;padding:12rpx 24rpx;border-radius:10rpx;display:inline-block;">下次：{{form.nextDate}} ▾</text></picker>
				<button type="primary" @click="addRecur" style="margin-top:24rpx;background:#46356B;">确认添加</button>
			</view>
		</u-popup>

		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	export default {
		data() {
			const d = new Date()
			return {
				list: [], showForm: false,
				cycles: ['month', 'week', 'day'],
				dests: ['支付宝', '微信'],
				form: { name:'', money:'', inorout:'支出', cycle:'month', dest:'微信', nextDate: d.getFullYear()+'-'+(d.getMonth()+1<10?'0':'')+(d.getMonth()+1)+'-'+d.getDate(), tabs:['支出','收入'] }
			}
		},
		onShow() { this.loadList() },
		methods: {
			loadList() {
				uni.request({
					url: 'http://cash.local/query_recurring',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					success: res => { this.list = res.data || [] }
				})
			},
			addRecur() {
				if (!this.form.name || !this.form.money) return uni.showToast({ title:'请填写完整', icon:'none' })
				uni.request({
					url: 'http://cash.local/insert_recurring',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					data: { ...this.form, type: this.form.name, book: '日常账本' },
					success: () => { this.showForm = false; this.loadList() }
				})
			},
			toggle(r) {
				uni.request({
					url: 'http://cash.local/toggle_recurring',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					data: { id: r.id },
					success: () => this.loadList()
				})
			},
			delRecur(id) {
				uni.showModal({
					title: '删除', content: '确定删除此周期账单？',
					success: res => {
						if (res.confirm) {
							uni.request({
								url: 'http://cash.local/delete_recurring',
								method: 'POST', header: { 'Content-Type': 'application/json' },
								data: { id },
								success: () => this.loadList()
							})
						}
					}
				})
			},
			getTypeIcon(t) {
				const idx = { '日常生活':1,'餐饮美食':2,'购物消费':3,'文教娱乐':4,'充值缴费':5,'旅游住宿':6,'交通出行':7,'医药医疗':8,'美容保养':9,'亲子宠物':10,'债务还款':11,'其他':12,'基本工资':13,'奖金补贴':14,'生活费':15,'红包':16,'礼金礼物':17,'现金支取':18,'理财盈亏':19,'债务收款':20,'公益慈善':21, '房租':12,'工资':13 }[t] || 12
				const names = ['','日常生活','餐饮美食','购物消费','文教娱乐','充值缴费','旅游住宿','交通出行','医药医疗','美容保养','亲子宠物','债务还款','其他','基本工资','奖金补贴','生活费','红包','礼金礼物','现金支取','理财盈亏','债务收款','公益慈善']
				return '/static/img/icon/' + (idx < 10 ? '0' + idx : '' + idx) + '.png'
			}
		}
	}
</script>

<style>page { background:#f4f2ef; }</style>
