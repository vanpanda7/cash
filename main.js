import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

import uView from "uview-ui";
Vue.use(uView);

import { initStore } from './util/store.js'
initStore()

import { myRequestPost } from './util/api.js'
import { myRequestGet } from './util/api.js'
Vue.prototype.$myRequestGet = myRequestGet
Vue.prototype.$myRequestPost = myRequestPost

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()


Vue.prototype.$typeIcon = function(typeName) {
	const idx = { '日常生活':1,'餐饮美食':2,'购物消费':3,'文教娱乐':4,'充值缴费':5,'旅游住宿':6,'交通出行':7,'医药医疗':8,'美容保养':9,'亲子宠物':10,'债务还款':11,'其他':12,'基本工资':13,'奖金补贴':14,'生活费':15,'红包':16,'礼金礼物':17,'现金支取':18,'理财盈亏':19,'债务收款':20,'公益慈善':21 }[typeName] || 12
	return '/static/img/icon/' + (idx < 10 ? '0' + idx : '' + idx) + '.png'
}
