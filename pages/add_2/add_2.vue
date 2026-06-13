<template>
	<view>
		<view style="background-color: #ffc84c;">
			<view class="uni-padding-wrap uni-common-mt" style="width: 50%;margin-left: 25%;">
				<uni-segmented-control :current="current" :values="items" style-type="text" active-color="#000000" @clickItem="onClickItem" />
			</view>
		</view>

		<view class="page_class_wrap">
			<swiper class="page_class_swiper" duration="300" :current="current" @change="onSwiperChange">
				<swiper-item>
					<view class="grid-wrap">
						<view class="grid-item" v-for="(item, index) in ClassificationList1" :key="index" @click="clickCategory(item)">
							<image :src="item.icon" mode="widthFix"></image>
							<text>{{ item.name }}</text>
						</view>
						<view class="grid-item" @click="showAddCat=true;newCatType='out'">
							<view style="width:80rpx;height:80rpx;border:2rpx dashed #ccc;border-radius:16rpx;display:flex;align-items:center;justify-content:center;">
								<text style="font-size:40rpx;color:#ccc;">+</text>
							</view>
							<text style="color:#ccc;">添加</text>
						</view>
					</view>
				</swiper-item>
				<swiper-item>
					<view class="grid-wrap">
						<view class="grid-item" v-for="(item, index) in ClassificationList2" :key="index" @click="clickCategory(item)">
							<image :src="item.icon" mode="widthFix"></image>
							<text>{{ item.name }}</text>
						</view>
						<view class="grid-item" @click="showAddCat=true;newCatType='in'">
							<view style="width:80rpx;height:80rpx;border:2rpx dashed #ccc;border-radius:16rpx;display:flex;align-items:center;justify-content:center;">
								<text style="font-size:40rpx;color:#ccc;">+</text>
							</view>
							<text style="color:#ccc;">添加</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="send">
			<view class="price">
				<input type="digit" v-model="money" placeholder="0.00" auto-focus adjust-position=false />
				<view class="fenlei">
					<image :src="selected.icon" v-if="selected.icon"></image>
					<text>{{ selected.name || '请选择分类' }}</text>
				</view>
			</view>
			<view class="remarks">
				<input v-model="remark" placeholder="添加备注" />
			</view>
			<view class="option">
				<view class="option-item" @click="showDatePicker = true">
					<image class="opimg" src="/static/img/riqi.png"></image>
					<text>{{ showDate }}</text>
				</view>
				<view class="option-item">
					<image class="opimg" src="/static/img/zhangben.png"></image>
					<picker :range="books" @change="onBookChange">
						<text>{{ book }}</text>
					</picker>
				</view>
				<view class="option-item">
					<image class="opimg" src="/static/img/zhanghu.png"></image>
					<picker :range="dests" @change="onDestChange">
						<text>{{ dest }}</text>
					</picker>
				</view>
			</view>
			<view class="submit-btn">
				<button type="primary" @click="submit" :disabled="!selected.name || !money">记一笔</button>
			</view>
		</view>

		<u-calendar :show="showDatePicker" @confirm="onDateConfirm" @close="showDatePicker = false"></u-calendar>

		<u-popup :show="showAddCat" mode="bottom" @close="showAddCat=false">
				<view style="background:white;padding:24rpx 32rpx 60rpx;border-radius:20rpx 20rpx 0 0;">
					<text style="font-size:32rpx;font-weight:600;display:block;text-align:center;margin-bottom:24rpx;">选择图标添加分类</text>
					<view style="display:flex;flex-wrap:wrap;">
						<view v-for="(ic, idx) in iconLib" :key="idx" @click="addCategory(ic)"
							style="width:20%;text-align:center;padding:16rpx 0;">
							<image :src="ic.f" style="width:56rpx;height:56rpx;display:block;margin:0 auto 6rpx;"></image>
							<text style="font-size:22rpx;color:#666;">{{ic.n}}</text>
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
				items: ['支出', '收入'],
				current: 0,
				showDatePicker: false,

				money: '',
				remark: '',
				book: '日常账本',
				dest: '微信',
				showDate: formatDateStr(new Date()),

				books: ['日常账本', '旅行账本', '家庭账本', '汽车消费', '投资收益', '亲子开销'],
				dests: ['支付宝', '微信'],

				selected: { id: 0, icon: '', name: '' },
				showAddCat: false,
				newCatType: 'out',
				iconLib: [],

				ClassificationList1: [
					{ id: 1,  icon: '/static/img/icon/01.png', name: '日常生活' },
					{ id: 2,  icon: '/static/img/icon/02.png', name: '餐饮美食' },
					{ id: 3,  icon: '/static/img/icon/03.png', name: '购物消费' },
					{ id: 4,  icon: '/static/img/icon/04.png', name: '文教娱乐' },
					{ id: 5,  icon: '/static/img/icon/05.png', name: '充值缴费' },
					{ id: 6,  icon: '/static/img/icon/06.png', name: '旅游住宿' },
					{ id: 7,  icon: '/static/img/icon/07.png', name: '交通出行' },
					{ id: 8,  icon: '/static/img/icon/08.png', name: '医药医疗' },
					{ id: 9,  icon: '/static/img/icon/09.png', name: '美容保养' },
					{ id: 10, icon: '/static/img/icon/10.png', name: '亲子宠物' },
					{ id: 11, icon: '/static/img/icon/11.png', name: '债务还款' },
					{ id: 12, icon: '/static/img/icon/12.png',      name: '其他' },
				],
				ClassificationList2: [
					{ id: 13, icon: '/static/img/icon/13.png', name: '基本工资' },
					{ id: 14, icon: '/static/img/icon/14.png', name: '奖金补贴' },
					{ id: 15, icon: '/static/img/icon/15.png',   name: '生活费' },
					{ id: 16, icon: '/static/img/icon/16.png',     name: '红包' },
					{ id: 17, icon: '/static/img/icon/17.png', name: '礼金礼物' },
					{ id: 18, icon: '/static/img/icon/18.png', name: '现金支取' },
					{ id: 19, icon: '/static/img/icon/19.png', name: '理财盈亏' },
					{ id: 20, icon: '/static/img/icon/20.png', name: '债务收款' },
					{ id: 21, icon: '/static/img/icon/21.png', name: '公益慈善' },
				],
			}
		},
		onLoad() { this.loadCats(); this.loadIcons() },
		methods: {
			loadIcons() {
				uni.request({
					url: 'http://cash.local/query_icon_list',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					success: res => { this.iconLib = res.data || [] }
				})
			},
			addCategory(ic) {
				uni.request({
					url: 'http://cash.local/insert_category',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					data: { catType: this.newCatType, name: ic.n, icon: ic.f },
					success: () => {
						this.showAddCat = false
						this.loadCats()
					}
				})
			},
			loadCats() {
				uni.request({
					url: 'http://cash.local/query_categories',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					success: res => {
						const cats = res.data
						this.ClassificationList1 = (cats.out || []).map((c, i) => ({ id: i+1, icon: c.icon || this.$typeIcon(c.name || c), name: c.name || c }))
						this.ClassificationList2 = (cats.in || []).map((c, i) => ({ id: i+13, icon: c.icon || this.$typeIcon(c.name || c), name: c.name || c }))
					}
				})
			},
			onClickItem(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex
				}
			},
			onSwiperChange(e) {
				this.current = e.detail.current
			},
			clickCategory(item) {
				this.selected = { id: item.id, icon: item.icon, name: item.name }
			},
			onBookChange(e) {
				this.book = this.books[e.detail.value]
			},
			onDestChange(e) {
				this.dest = this.dests[e.detail.value]
			},
			onDateConfirm(e) {
				this.showDate = e[0] ? formatDateStr(new Date(e[0])) : this.showDate
				this.showDatePicker = false
			},
			submit() {
				const inorout = this.current === 1 ? '收入' : '支出'
				const dateStr = this.showDate || formatDateStr(new Date())
				const moneyVal = parseFloat(this.money) || 0
				if (!this.selected.name || !moneyVal) return

				uni.request({
					url: 'http://cash.local/insert_account',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: {
						name: this.selected.name,
						type: this.selected.name,
						inorout: inorout,
						dest: this.dest,
						money: moneyVal,
						time: dateStr,
						book: this.book,
						remark: this.remark
					},
					success: () => {
						uni.showToast({ title: '记账成功', icon: 'success', duration: 1000 })
						setTimeout(() => {
							uni.switchTab({ url: '/pages/bill/bill' })
						}, 800)
					}
				})
			},
		}
	}

	function pad(n) { return n < 10 ? '0' + n : '' + n }
	function formatDateStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }
</script>

<style>
	.grid-wrap {
		padding: 16rpx 0 40rpx;
		display: flex;
		flex-wrap: wrap;
	}
	.grid-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24rpx 0;
		box-sizing: border-box;
	}
	.grid-item image {
		width: 80rpx;
		height: 80rpx;
		display: block;
		margin-bottom: 12rpx;
	}
	.grid-item text {
		font-size: 24rpx;
		color: #3d3d3d;
	}
	.page_class_swiper {
		height: 720rpx;
	}

	.send {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 91.5vw;
		background-color: white;
		border-radius: 18px 18px 0 0;
		box-shadow: 0 -3px 20px rgba(76,76,76,0.16);
		display: flex;
		flex-direction: column;
		padding: 16px 16px 0;
		z-index: 10;
	}
	.price {
		height: 80rpx;
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		border-bottom: 2rpx solid #333;
	}
	.price input {
		flex: 1;
		font-size: 48rpx;
		height: 100%;
	}
	.fenlei {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-bottom: 8rpx;
		white-space: nowrap;
	}
	.fenlei image {
		width: 48rpx;
		height: 48rpx;
		margin-right: 8rpx;
	}
	.fenlei text {
		font-size: 26rpx;
		color: #666;
	}
	.remarks {
		margin-top: 14rpx;
		width: 100%;
		height: 72rpx;
		background-color: #edeae6;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
	}
	.remarks input {
		margin: 0 16rpx;
		width: 100%;
		font-size: 28rpx;
	}
	.option {
		height: 72rpx;
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		margin-top: 12rpx;
	}
	.option-item {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.option-item text {
		font-size: 26rpx;
		color: #666;
	}
	.opimg {
		width: 36rpx;
		height: 36rpx;
		margin-right: 10rpx;
	}
	.submit-btn {
		margin: 16rpx 0 20rpx;
	}
	.submit-btn button {
		font-size: 32rpx;
		font-weight: 600;
	}
</style>
