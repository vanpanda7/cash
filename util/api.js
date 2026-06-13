const BASE_URL = 'http://cash.local'

export const myRequestGet = (options) => {
	return new Promise((resolve, reject) => {
		let token = uni.getStorageSync('token')
		//
		uni.request({
			header: options.header || {
				Authorization: token
			},
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			success: (res) => {
				if (res.statusCode !== 200) {
					return uni.showToast({
						title: '获取数据失败！'
					})
				}
				resolve(res)
			},
			fail: (err) => {
				return uni.showToast({
					title: '请求接口失败！'
				})
				reject(err)
			}
		})
	})
}

export const myRequestPost = (options) => {
	let token = uni.getStorageSync('token')
	return new Promise((resolve, reject) => {
		uni.request({
			header: options.header || {
				Authorization: token
			},
			url: BASE_URL + options.url,
			method: options.method || 'POST',
			data: options.data || {},
			success: (res) => {
				if (res.statusCode !== 200) {
					return uni.showToast({
						title: '获取数据失败！'
					})
				}
				resolve(res)
			},
			fail: (err) => {
				return uni.showToast({
					title: '请求接口失败！'
				})
				reject(err)
			}
		})
	})
}