<template>
	<view style="background:#f4f2ef;min-height:100vh;padding-top:24rpx;">
		<view style="background:white;margin:0 24rpx 24rpx;border-radius:20rpx;padding:32rpx;">
			<text style="font-size:30rpx;font-weight:600;display:block;margin-bottom:8rpx;">账户名称</text>
			<input v-model="accountName" placeholder="如：支付宝、微信、工资卡..." style="width:100%;height:80rpx;background:#fbf9f7;border-radius:12rpx;padding:0 20rpx;font-size:30rpx;box-sizing:border-box;" />
		</view>

		<view style="background:white;margin:0 24rpx 24rpx;border-radius:20rpx;padding:32rpx;">
			<text style="font-size:30rpx;font-weight:600;display:block;margin-bottom:20rpx;">快捷选择</text>
			<view style="display:flex;flex-wrap:wrap;gap:16rpx;">
				<view v-for="(p, idx) in presets" :key="idx" @click="accountName = p"
					style="padding:14rpx 28rpx;border-radius:24rpx;font-size:28rpx;"
					:style="{background: accountName === p ? '#46356B' : '#edeae6', color: accountName === p ? '#fff' : '#666'}">{{p}}</view>
			</view>
		</view>

		<view style="background:white;margin:0 24rpx 24rpx;border-radius:20rpx;padding:32rpx;">
			<text style="font-size:30rpx;font-weight:600;display:block;margin-bottom:8rpx;">初始余额（可选）</text>
			<text style="font-size:24rpx;color:#999;display:block;margin-bottom:20rpx;">如果账户已有余额可填入，否则留空</text>
			<input v-model="initBalance" type="digit" placeholder="0.00" style="width:100%;height:80rpx;background:#fbf9f7;border-radius:12rpx;padding:0 20rpx;font-size:30rpx;box-sizing:border-box;" />
		</view>

		<button @click="save" type="primary" style="margin:0 24rpx;height:88rpx;line-height:88rpx;font-size:32rpx;background:#46356B;border-radius:16rpx;">保存</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				accountName: '',
				initBalance: '',
				presets: ['支付宝', '微信', '银行卡', '现金', '花呗', '余额宝', '其他']
			}
		},
		methods: {
			save() {
				const name = this.accountName.trim()
				if (!name) { uni.showToast({ title: '请输入账户名称', icon: 'none' }); return }
				const balance = parseFloat(this.initBalance) || 0
				uni.request({
					url: 'http://cash.local/insert_dest',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: { name: name },
					success: () => {
						if (balance > 0) {
							uni.request({
								url: 'http://cash.local/insert_account',
								method: 'POST',
								header: { 'Content-Type': 'application/json' },
								data: { name: '初始余额', type: '其他', inorout: '收入', dest: name, money: balance, time: this.todayStr(), book: '日常账本', remark: '初始余额' }
							})
						}
						uni.navigateBack({ delta: 1 })
					}
				})
			},
			todayStr() {
				const d = new Date()
				return d.getFullYear() + '-' + (d.getMonth()+1<10?'0':'') + (d.getMonth()+1) + '-' + (d.getDate()<10?'0':'') + d.getDate()
			}
		}
	}
</script>
