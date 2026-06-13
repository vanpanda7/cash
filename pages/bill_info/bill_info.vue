<template>
	<view class="page">
		<view class="card" style="display:flex;align-items:center;padding:32rpx;margin-top:24rpx;">
			<image :src="getTypeIcon(OneDayInfo.type)" style="width:100rpx;height:100rpx;border-radius:16rpx;"></image>
			<view style="flex:1;margin-left:24rpx;">
				<text class="card-title" v-if="!editing">{{OneDayInfo.name}}</text>
				<picker v-else :range="typeList" @change="e => editData.type = typeList[e.detail.value]">
					<text class="card-title picker-underline">{{editData.type}}</text>
				</picker>
				<text class="card-sub">{{OneDayInfo.type}} · {{OneDayInfo.time}}</text>
			</view>
		</view>

		<view class="card" style="padding:32rpx;margin-top:16rpx;">
			<view style="display:flex;justify-content:space-between;align-items:center;">
				<view style="display:flex;align-items:center;">
					<view class="tag" :style="{background: OneDayInfo.inorout==='收入'?'#e8f4fd':'#fde8e8', color: OneDayInfo.inorout==='收入'?'#4D7BF3':'#FD416E'}">{{OneDayInfo.inorout}}</view>
				</view>
				<text v-if="!editing" class="money-big" :style="{color: OneDayInfo.inorout==='收入'?'#4D7BF3':'#FD416E'}">{{OneDayInfo.money}}</text>
				<input v-else type="digit" v-model="editData.money" class="money-input" placeholder="金额" />
			</view>
		</view>

		<view class="card info-list" style="margin-top:16rpx;">
			<view class="info-row">
				<image src="../../static/img/leixing.png" class="info-icon"></image>
				<text class="info-label">类型</text>
				<text class="info-value" v-if="!editing">{{OneDayInfo.type}}</text>
				<picker v-else :range="typeList" @change="e => editData.type = typeList[e.detail.value]">
					<text class="info-value picker-underline">{{editData.type}}</text>
				</picker>
			</view>
			<view class="info-row">
				<image src="../../static/img/riqi.png" class="info-icon"></image>
				<text class="info-label">日期</text>
				<text class="info-value" v-if="!editing">{{OneDayInfo.time}}</text>
				<picker v-else mode="date" :value="editData.time" @change="onDateChange">
					<text class="info-value picker-underline">{{editData.time}}</text>
				</picker>
			</view>
			<view class="info-row">
				<image src="../../static/img/zhangben.png" class="info-icon"></image>
				<text class="info-label">账本</text>
				<text class="info-value" v-if="!editing">{{OneDayInfo.book}}</text>
				<picker v-else :range="bookList" @change="e => editData.book = bookList[e.detail.value]">
					<text class="info-value picker-underline">{{editData.book}}</text>
				</picker>
			</view>
			<view class="info-row">
				<image src="../../static/img/zhanghu.png" class="info-icon"></image>
				<text class="info-label">账户</text>
				<text class="info-value" v-if="!editing">{{OneDayInfo.dest}}</text>
				<picker v-else :range="destList" @change="e => editData.dest = destList[e.detail.value]">
					<text class="info-value picker-underline">{{editData.dest}}</text>
				</picker>
			</view>
			<view class="info-row" v-if="!editing && OneDayInfo.remark">
				<image src="../../static/img/zhangben.png" class="info-icon"></image>
				<text class="info-label">备注</text>
				<text class="info-value">{{OneDayInfo.remark}}</text>
			</view>
			<view class="info-row" v-if="editing">
				<image src="../../static/img/zhangben.png" class="info-icon"></image>
				<text class="info-label">备注</text>
				<input v-model="editData.remark" class="info-input" placeholder="添加备注" />
			</view>
		</view>

		<view class="btn-group">
			<button v-if="!editing" class="btn btn-edit" @click="startEdit">编辑</button>
			<button v-if="editing" class="btn btn-save" @click="saveEdit">保存</button>
			<button v-if="editing" class="btn btn-cancel" @click="editing=false">取消</button>
			<button v-if="!editing" class="btn btn-del" @click="showToast">删除</button>
		</view>

		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				editing: false,
				OneDayInfo: { book:'', dest:'', id:0, inorout:'', money:'', name:'', remark:'', time:'', type:'' },
				editData: { type:'', money:'', time:'', book:'', dest:'', remark:'' },
				typeList: ['餐饮美食','购物消费','交通出行','日常生活','文教娱乐','充值缴费','旅游住宿','医药医疗','美容保养','亲子宠物','债务还款','其他','基本工资','奖金补贴','生活费','红包','礼金礼物','现金支取','理财盈亏','债务收款','公益慈善'],
				bookList: ['日常账本','旅行账本','家庭账本','汽车消费','投资收益','亲子开销'],
				destList: ['支付宝', '微信'],
			}
		},
		onLoad(option) {
			this.OneDayInfo = {
				book: option.book || '',
				dest: option.dest || '',
				id: Number(option.id) || 0,
				inorout: option.inorout || '',
				money: String(option.money || '').replace(/\s/g, ''),
				name: option.name || '',
				remark: option.remark || '',
				time: option.time ? option.time.slice(0, 10) : '',
				type: option.type || ''
			}
			if (this.OneDayInfo.inorout === '收入' && !String(this.OneDayInfo.money).startsWith('+')) {
				this.OneDayInfo.money = '+' + String(this.OneDayInfo.money).replace(/^[+-]/, '')
			}
			if (this.OneDayInfo.inorout === '支出' && !String(this.OneDayInfo.money).startsWith('-')) {
				this.OneDayInfo.money = '-' + String(this.OneDayInfo.money).replace(/^[+-]/, '')
			}
		},
		methods: {
			startEdit() {
				this.editData = {
					type: this.OneDayInfo.type,
					money: String(this.OneDayInfo.money).replace(/[^0-9.]/g, ''),
					time: this.OneDayInfo.time,
					book: this.OneDayInfo.book,
					dest: this.OneDayInfo.dest,
					remark: this.OneDayInfo.remark || ''
				}
				this.editing = true
			},
			saveEdit() {
				if (!this.editData.money || parseFloat(this.editData.money) <= 0) {
					uni.showToast({ title: '请输入金额', icon: 'none' })
					return
				}
				uni.request({
					url: 'http://cash.local/update_item_by_id',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: { id: this.OneDayInfo.id, ...this.editData, name: this.editData.type },
					success: () => {
						this.OneDayInfo.type = this.editData.type
						this.OneDayInfo.name = this.editData.type
						this.OneDayInfo.money = this.OneDayInfo.inorout === '收入' ? '+' + this.editData.money : '-' + this.editData.money
						this.OneDayInfo.time = this.editData.time
						this.OneDayInfo.book = this.editData.book
						this.OneDayInfo.dest = this.editData.dest
						this.OneDayInfo.remark = this.editData.remark
						this.editing = false
						uni.showToast({ title: '已保存', icon: 'success' })
					}
				})
			},
			onDateChange(e) { this.editData.time = e.detail.value },
			showToast() {
				uni.showModal({
					title: '确认删除',
					content: '删除后不可恢复',
					success: res => { if (res.confirm) this.delInfo() }
				})
			},
			delInfo() {
				uni.request({
					url: 'http://cash.local/delete_item_by_id',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: { id: this.OneDayInfo.id },
					success: () => {
						this.$refs.uToast.show({ type: 'loading', message: '正在删除', duration: 1000,
							complete() { uni.navigateBack({ delta: 1 }) }
						})
					}
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
	.page { background: #f4f2ef; min-height: 100vh; padding-bottom: 40rpx; }
	.card { background: white; border-radius: 20rpx; margin: 0 24rpx; }
	.card-title { font-size: 40rpx; font-family: PingFang SC-Medium; font-weight: 500; color: #333; }
	.card-sub { display: block; font-size: 24rpx; color: #999; margin-top: 8rpx; }
	.picker-underline { border-bottom: 2rpx solid #ffc84c; }
	.tag { font-size: 24rpx; padding: 6rpx 20rpx; border-radius: 20rpx; font-weight: 500; }
	.money-big { font-weight: 700; font-size: 48rpx; font-family: DIN-Bold; }
	.money-input { font-size: 48rpx; font-weight: 700; width: 250rpx; text-align: right; border-bottom: 2rpx solid #ffc84c; }

	.info-list { padding: 8rpx 0; }
	.info-row { display: flex; align-items: center; padding: 24rpx 32rpx; border-bottom: 1rpx solid #fbf9f7; }
	.info-row:last-child { border-bottom: none; }
	.info-icon { width: 36rpx; height: 36rpx; }
	.info-label { font-size: 28rpx; color: #4b497f; margin-left: 16rpx; width: 80rpx; }
	.info-value { margin-left: auto; font-size: 28rpx; color: #666; text-align: right; max-width: 340rpx; }
	.info-input { flex: 1; text-align: right; font-size: 28rpx; }

	.btn-group { display: flex; gap: 20rpx; padding: 40rpx 24rpx; justify-content: space-between; }
	.btn { flex: 1; height: 80rpx; line-height: 80rpx; font-size: 30rpx; font-weight: 500; border-radius: 16rpx; border: none; }
	.btn-edit { background: #ffc84c; color: #333; }
	.btn-save { background: #46356B; color: white; }
	.btn-cancel { background: #edeae6; color: #666; }
	.btn-del { background: #FD416E; color: white; }
</style>
