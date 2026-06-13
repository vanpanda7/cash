<template>
	<view>
		<view style="background:#ffc84c;display:flex;justify-content:center;padding:16rpx;">
			<view @click="tab='out'" style="padding:12rpx 40rpx;border-radius:30rpx;margin-right:20rpx;"
				:style="{background: tab==='out' ? '#333' : 'transparent', color: tab==='out' ? '#fff' : '#333'}">支出分类</view>
			<view @click="tab='in'" style="padding:12rpx 40rpx;border-radius:30rpx;"
				:style="{background: tab==='in' ? '#333' : 'transparent', color: tab==='in' ? '#fff' : '#333'}">收入分类</view>
		</view>

		<view v-for="(cat, idx) in list" :key="idx" style="background:white;display:flex;align-items:center;padding:24rpx 32rpx;border-bottom:1rpx solid #edeae6;">
			<image :src="cat.icon" style="width:64rpx;height:64rpx;border-radius:12rpx;margin-right:24rpx;"></image>
			<text style="flex:1;font-size:30rpx;">{{cat.name}}</text>
			<view @click="delCat(cat.name)" style="color:#FD416E;font-size:26rpx;padding:8rpx 20rpx;">删除</view>
		</view>

		<view style="padding:24rpx 32rpx;background:white;margin-top:20rpx;">
			<button type="primary" @click="showIcons=true" style="background:#ffc84c;color:#333;border:none;">选择图标添加分类</button>
		</view>

		<u-popup :show="showIcons" mode="bottom" @close="showIcons=false">
			<view style="background:white;padding:20rpx 20rpx 60rpx;border-radius:20rpx 20rpx 0 0;">
				<text style="font-size:30rpx;font-weight:600;display:block;text-align:center;margin-bottom:20rpx;">选择图标添加</text>
				<view style="display:flex;flex-wrap:wrap;">
					<view v-for="(ic, idx) in iconLib" :key="idx" @click="addCat(ic)"
						style="width:20%;text-align:center;padding:16rpx 0;">
						<image :src="ic.f" style="width:56rpx;height:56rpx;display:block;margin:0 auto 6rpx;"></image>
						<text style="font-size:20rpx;color:#666;">{{ic.n}}</text>
					</view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tab: 'out',
				list: [],
				showIcons: false,
				iconLib: []
			}
		},
		onShow() { this.loadCats(); this.loadIcons() },
		watch: { tab() { this.loadCats() } },
		methods: {
			loadCats() {
				uni.request({
					url: 'http://cash.local/query_categories',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					success: res => {
						this.list = (res.data[this.tab] || []).map(c => ({ name: c.name || c, icon: c.icon || '/static/img/icon/12.png' }))
					}
				})
			},
			loadIcons() {
				uni.request({
					url: 'http://cash.local/query_icon_list',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					success: res => { this.iconLib = res.data || [] }
				})
			},
			pickIcon(ic) {},
			addCat(ic) {
				uni.request({
					url: 'http://cash.local/insert_category',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					data: { catType: this.tab, name: ic.n, icon: ic.f },
					success: () => { this.showIcons = false; this.loadCats() }
				})
			},
			delCat(name) {
				uni.showModal({
					title: '删除分类',
					content: '确定删除 "' + name + '" 吗？',
					success: res => {
						if (res.confirm) {
							uni.request({
								url: 'http://cash.local/delete_category',
								method: 'POST', header: { 'Content-Type': 'application/json' },
								data: { catType: this.tab, name },
								success: () => this.loadCats()
							})
						}
					}
				})
			}
		}
	}
</script>

<style>
	page { background: #f4f2ef; }
</style>
