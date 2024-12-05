// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const createConfig = require('uni-config-center')
const antiContentCommon = require('anti-content-common')
const axios = require('axios');

module.exports = {
	_timing: function(param) {


	},
	async get() {
		const dbJQL = uniCloud.databaseForJQL({})
		dbJQL.setUser({
			role: ['admin']
		})

		// 准备配置文件中的数据
		const shareConfig = createConfig({
			pluginId: 'post-duoduo'
		})
		const Config = shareConfig.config()
		let requests = Config.refreshTokenCookie

		// 准备cookie
		let doc = await dbJQL.collection("duoduo-config").get();

		// 准备anti-content的库名字集合
		const keys = Object.keys(antiContentCommon.antiMap)
		const antiNameArr = [...keys]

		// 在requests的基础上加上cookie和anti-content
		for (let i = 0; i < requests.length; i++) {
			requests[i].headers.Cookie = doc.data[i].cookie;
			requests[i].headers["anti-content"] = await antiContentCommon.getAnti(antiNameArr[i])
			console.log(`requests[${i}]`,requests[i])
		}

		// 请求到token、cookie
		Promise.all(
				requests.map(req =>
					axios({
						method: req.method,
						url: req.url,
						headers: req.headers,
						data: req.data
					})
				)
			)
			.then(responses => {
				console.log("responses",responses)
				// 将结果放到doc中
				for (let i = 0; i < responses.length; i++) {
					doc.data[i].token = responses[i].data.result.token
					doc.data[i].cookie = responses[i].headers['set-cookie']
					console.log("responses[i]",responses[i].data)
				}
			})
			.catch(errors => {
				console.error('Error:', errors);
			});

		// 从doc将新cookie和token更新到数据库
		for (let i = 0; i < doc.data.length; i++) {
			await dbJQL.collection("duoduo-config").doc(doc.data[i]._id).update({
				token: doc.data[i].token,
				cookie: doc.data[i].cookie
			});
		}
	}
}