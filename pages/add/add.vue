<template>
	<view style="background:#fbf9f7;min-height:100vh;">
		<view style="position:relative;height:340rpx;overflow:hidden;">
			<image src="/static/img/add-bg.png" style="width:100%;height:340rpx;opacity:0.7;" mode="aspectFill"></image>
		</view>

		<view style="margin-top:-120rpx;position:relative;z-index:2;padding:0 32rpx;">
			<view style="background:white;border-radius:24rpx;padding:40rpx 32rpx 32rpx;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
				<view style="display:flex;justify-content:center;margin-bottom:20rpx;">
					<view @click="inorout='支出'" style="padding:14rpx 60rpx;border-radius:30rpx 0 0 30rpx;font-size:28rpx;font-weight:600;transition:all 0.2s;"
						:style="{background: inorout==='支出' ? '#FD416E' : '#edeae6', color: inorout==='支出' ? '#fff' : '#999'}">支出</view>
					<view @click="inorout='收入'" style="padding:14rpx 60rpx;border-radius:0 30rpx 30rpx 0;font-size:28rpx;font-weight:600;transition:all 0.2s;"
						:style="{background: inorout==='收入' ? '#4D7BF3' : '#edeae6', color: inorout==='收入' ? '#fff' : '#999'}">收入</view>
				</view>

				<view style="text-align:center;padding:24rpx 0 8rpx;">
					<text style="font-size:72rpx;font-weight:700;font-family:DIN-Bold;color:#333;">{{displayMoney}}</text>
				</view>
				<view style="text-align:center;margin-bottom:20rpx;">
					<text style="font-size:24rpx;color:#ccc;">{{today}}  {{dest}} · {{book}}</text>
				</view>

				<view style="display:flex;align-items:center;justify-content:center;margin-bottom:8rpx;"
					@click="showTypePicker = true">
					<image :src="getIcon(selectedType)" style="width:48rpx;height:48rpx;margin-right:12rpx;" v-if="selectedType"></image>
					<text style="font-size:32rpx;font-weight:600;" :style="{color: inorout==='收入' ? '#4D7BF3' : '#333'}">
						{{selectedType || '点此选择分类'}}
					</text>
					<text style="font-size:24rpx;color:#ccc;margin-left:8rpx;">▾</text>
				</view>

				<scroll-view scroll-x style="white-space:nowrap;padding:12rpx 0 8rpx;" :show-scrollbar="false">
					<view v-for="(t, i) in quickCats" :key="i" @click="selectType(t)"
						style="display:inline-block;padding:10rpx 24rpx;margin-right:12rpx;border-radius:20rpx;font-size:26rpx;white-space:nowrap;"
						:style="{background: selectedType===t ? (inorout==='收入'?'#4D7BF3':'#ffc84c') : '#fbf9f7', color: selectedType===t ? '#fff' : '#666'}">
						{{t}}
					</view>
					<view @click="showTypePicker = true"
						style="display:inline-block;padding:10rpx 24rpx;border-radius:20rpx;font-size:26rpx;background:#eee;color:#999;">
						更多 ▸
					</view>
				</scroll-view>
			</view>

			<view style="background:white;border-radius:24rpx;margin-top:16rpx;padding:0;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
				<view style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;border-bottom:1rpx solid #edeae6;">
					<view @click="appendNum('1')" class="key">1</view>
					<view @click="appendNum('2')" class="key">2</view>
					<view @click="appendNum('3')" class="key">3</view>
					<view @click="appendNum('del')" class="key" style="background:#f9f9f9;color:#999;font-size:24rpx;">⌫</view>
					<view @click="appendNum('4')" class="key">4</view>
					<view @click="appendNum('5')" class="key">5</view>
					<view @click="appendNum('6')" class="key">6</view>
					<view @click="appendNum('+')" class="key" style="background:#f9f9f9;color:#FD416E;font-weight:600;">+</view>
					<view @click="appendNum('7')" class="key">7</view>
					<view @click="appendNum('8')" class="key">8</view>
					<view @click="appendNum('9')" class="key">9</view>
					<view @click="appendNum('-')" class="key" style="background:#f9f9f9;color:#4D7BF3;font-weight:600;">−</view>
					<view @click="appendNum('clear')" class="key" style="font-size:24rpx;color:#999;">C</view>
					<view @click="appendNum('0')" class="key">0</view>
					<view @click="appendNum('.')" class="key">.</view>
					<view @click="Showdown" class="key" style="background:linear-gradient(135deg,#ffc84c,#f5a623);color:white;font-weight:700;font-size:28rpx;">确定</view>
				</view>
			</view>

			<view style="display:flex;justify-content:center;gap:40rpx;padding:24rpx 0 60rpx;">
				<view @click="toRegister" style="text-align:center;">
					<view style="width:72rpx;height:72rpx;border-radius:50%;background:#edeae6;display:flex;align-items:center;justify-content:center;margin:0 auto 8rpx;">
						<text style="font-size:36rpx;">📋</text>
					</view>
					<text style="font-size:22rpx;color:#999;">详细记账</text>
				</view>
				<view @click="transferMode = !transferMode" style="text-align:center;">
					<view style="width:72rpx;height:72rpx;border-radius:50%;background:#edeae6;display:flex;align-items:center;justify-content:center;margin:0 auto 8rpx;"
						:style="{background: transferMode ? '#46356B' : '#edeae6'}">
						<text style="font-size:36rpx;">⇄</text>
					</view>
					<text style="font-size:22rpx;color:#999;">转账</text>
				</view>
			</view>

			<view v-if="transferMode" style="background:white;border-radius:24rpx;padding:24rpx 32rpx;margin-bottom:24rpx;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
				<text style="font-size:26rpx;color:#999;display:block;margin-bottom:16rpx;">转账设置</text>
				<picker :range="dests" @change="e => transFrom = dests[e.detail.value]">
					<text style="font-size:28rpx;">转出：{{transFrom}} ▾</text>
				</picker>
				<picker :range="dests" @change="e => transTo = dests[e.detail.value]" style="margin-top:16rpx;display:block;">
					<text style="font-size:28rpx;">转入：{{transTo}} ▾</text>
				</picker>
			</view>
		</view>

		<u-popup :show="show" @close="close" mode="center">
			<u-loading-icon text="保存中" textSize="18" :vertical="true"></u-loading-icon>
		</u-popup>

		<u-popup :show="showTypePicker" mode="bottom" @close="showTypePicker = false">
			<view style="background:white;padding:20rpx 20rpx 60rpx;border-radius:20rpx 20rpx 0 0;">
				<view style="display:flex;justify-content:center;gap:20rpx;margin-bottom:20rpx;">
					<text :class="typeTab === 0 ? 'tab-active' : 'tab'" @click="typeTab = 0">支出</text>
					<text :class="typeTab === 1 ? 'tab-active' : 'tab'" @click="typeTab = 1">收入</text>
				</view>
				<view style="display:flex;flex-wrap:wrap;">
					<view v-for="t in allCats" :key="t.name" @click="selectType(t.name)"
						style="width:23%;text-align:center;padding:16rpx 0;margin:1%;border-radius:12rpx;"
						:style="{background: selectedType === t.name ? '#ffc84c' : '#fbf9f7'}">
						<image :src="t.icon" style="width:56rpx;height:56rpx;display:block;margin:0 auto 8rpx;" v-if="t.icon"></image>
						<text style="font-size:24rpx;">{{t.name}}</text>
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
				show: false,
				showTypePicker: false,
				typeTab: 0,
				today: '',
				changeValue: '',
				money: 0,
				inorout: '支出',
				type: '餐饮美食',
				dest: '微信',
				book: '日常账本',
				dests: ['支付宝', '微信'],
				books: ['日常账本', '旅行账本', '家庭账本', '汽车消费', '投资收益', '亲子开销'],
				typesOut: ['餐饮美食','购物消费','交通出行','日常生活','文教娱乐','充值缴费','旅游住宿','医药医疗','美容保养','亲子宠物','债务还款','其他'],
				typesIn: ['基本工资','奖金补贴','生活费','红包','礼金礼物','现金支取','理财盈亏','债务收款','公益慈善'],
				transferMode: false,
				transFrom: '支付宝',
				transTo: '微信',
				lastSaved: 0
			}
		},
		computed: {
			displayMoney() { return this.money > 0 ? this.money.toFixed(2) : '0.00' },
			selectedType() { return this.type },
			quickCats() { return (this.inorout === '支出' ? this.typesOut : this.typesIn).slice(0, 3) },
			allCats() {
				const list = this.typeTab === 0 ? this.typesOut : this.typesIn
				return list.map(name => ({ name, icon: this.$typeIcon(name) }))
			}
		},
		onLoad() {
			this.today = this.getToday()
			this.loadCats()
		},
		methods: {
			getToday() {
				const d = new Date()
				return d.getFullYear() + '-' + (d.getMonth()+1<10?'0':'') + (d.getMonth()+1) + '-' + (d.getDate()<10?'0':'') + d.getDate()
			},
			catIndex(n) {
				const map = {'日常生活':1,'餐饮美食':2,'购物消费':3,'文教娱乐':4,'充值缴费':5,'旅游住宿':6,'交通出行':7,'医药医疗':8,'美容保养':9,'亲子宠物':10,'债务还款':11,'其他':12,'基本工资':13,'奖金补贴':14,'生活费':15,'红包':16,'礼金礼物':17,'现金支取':18,'理财盈亏':19,'债务收款':20,'公益慈善':21}
				return map[n] || 12
			},
			getIcon(n) {
				if (!n) return ''
				const idx = this.catIndex(n)
				return '/static/img/icon/' + (idx < 10 ? '0' + idx : '' + idx) + n + '.png'
			},
			appendNum(v) {
				if (v === 'del') { this.changeValue = this.changeValue.slice(0, -1) }
				else if (v === 'clear') { this.changeValue = '' }
				else if (v === '+') { this.inorout = '收入'; this.changeValue = '' }
				else if (v === '-') { this.inorout = '支出'; this.changeValue = '' }
				else { this.changeValue += v }
				this.money = parseFloat(this.changeValue) || 0
			},
			selectType(t) {
				this.type = t
				this.inorout = this.typeTab === 0 ? '支出' : '收入'
				this.showTypePicker = false
			},
			onDestChange(e) { this.dest = this.dests[e.detail.value] },
			onBookChange(e) { this.book = this.books[e.detail.value] },
			close() { this.show = false },
			loadCats() {
				uni.request({
					url: 'http://cash.local/query_categories',
					method: 'POST', header: { 'Content-Type': 'application/json' },
					success: res => {
						this.typesOut = (res.data.out || this.typesOut).map(c => c.name || c)
						this.typesIn = (res.data.in || this.typesIn).map(c => c.name || c)
					}
				})
			},
			Showdown() {
				if (!this.money || this.money <= 0) return
				if (this.transferMode) {
					if (this.transFrom === this.transTo) { uni.showToast({ title:'不能相同', icon:'none' }); return }
					this.show = true
					const base = { method:'POST', header:{'Content-Type':'application/json'} }
					uni.request({ ...base, url:'http://cash.local/insert_account', data:{ name:'转账',type:'转账',inorout:'支出',dest:this.transFrom,money:this.money,time:this.today,book:this.book,remark:'转账至'+this.transTo }, success:()=>this.afterSave(), fail:()=>this.afterSave() })
					uni.request({ ...base, url:'http://cash.local/insert_account', data:{ name:'转账',type:'转账',inorout:'收入',dest:this.transTo,money:this.money,time:this.today,book:this.book,remark:'转账自'+this.transFrom }, success:()=>this.afterSave(), fail:()=>this.afterSave() })
					return
				}
				this.show = true
				uni.request({
					url: 'http://cash.local/insert_account',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: { name: this.type, type: this.type, inorout: this.inorout, dest: this.dest, money: this.money, time: this.today, book: this.book, remark: this.type },
					success: () => this.afterSave(),
					fail: () => { this.show = false; uni.showToast({ title:'保存失败', icon:'none' }) }
				})
			},
			afterSave() {
				this.show = false
				this.lastSaved = this.money
				this.changeValue = ''
				this.money = 0
				uni.vibrateShort && uni.vibrateShort()
				uni.showToast({ title: this.transferMode ? '转账成功' : '记账成功', icon: 'success' })
			},
			toRegister() {
				uni.navigateTo({ url: '../add_2/add_2' })
			},
		}
	}
</script>

<style>
	.key {
		height: 100rpx; display: flex; align-items: center; justify-content: center;
		font-size: 36rpx; font-family: DIN-Bold; border-right: 1rpx solid #edeae6; border-bottom: 1rpx solid #edeae6; user-select: none;
	}
	.key:nth-child(4n) { border-right: none; }
	.key:active { background: #e8e8e8 !important; }
	.tab { font-size: 28rpx; padding: 12rpx 60rpx; border-radius: 30rpx; background: #eee; }
	.tab-active { font-size: 28rpx; padding: 12rpx 60rpx; border-radius: 30rpx; background: #ffc84c; font-weight: 600; }
</style>
