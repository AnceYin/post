/**
 * 备注：内部方法请勿使用
 * 描述：间隔一段时间刷新多多买菜的token和cookie
 * 进度：暂定间隔时间为8小时
 */

// [ "0 0 0/8 * * ? " ]


const axios = require('axios');
const db = uniCloud.database();
const dbCmd = db.command 
'use strict';

exports.main = async (event, context) => {
	// 从数据库获取 cookie
	const doc = await db.collection("DuoDuoAuthentication").doc("665c43211bef6bf8b34a8e11").get();
	const {
		cookie,
		accessToken
	} = doc.data[0];

	console.log("从数据库获取cookie：")
	console.log(cookie)
	// anti-content字段处理
	let res = await db.collection("DuoDuoAntiContent").limit(1).get(); // 只返回第一条记录
	await db.collection("DuoDuoAntiContent").doc(res.data[0]._id).remove()
	let newRes = await db.collection("DuoDuoAntiContent").limit(1).get(); // 返回一条新记录
	let antiContent = newRes.data[0].anti;
	console.log("此次获取到的anti-content：")
	console.log(antiContent)
	// 定义网络请求格式
	let data = JSON.stringify({
		"appIndex": "2",
		"mobile": "15818695952",
		"encryptedPassword": "I9591+wpXCoBwST/ym+4Avm5n5Jv+B3U7gO1Z0ZXIEMEWXRtArk3tVVTeHx1n74flBe81q0aOS+u\n7UpZnuVnBEDCCJp6TW/e+Vq1JXUtWrtGNKoTms788FN7E9+6kh3w6TsEZiTRN82txswaYVaHvW5Q\nJPayxbEem78YKOyphLM=\n"
	});

	let config = {
		method: 'POST',
		url: 'https://mdkd-api.pinduoduo.com/sixers/api/user/loginByMobile',
		headers: {
			'Reqable-Id': 'reqable-id-8894917a-1c6c-4f63-b796-ae99a2526c32',
			'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; SM-N9700 Build/PQ3B.190801.06161913)station_android_version/3.8.0 PackegeName/com.xunmeng.station AppVersion/3.8.0 DeviceType/Mobile AppName/DDStore pstation_android_version/3.8.0',
			'Accept-Encoding': 'gzip',
			'content-type': 'application/json;charset=utf-8',
			'p-appname': 'DDStore',
			'verifyauthtoken': 'PY8IH3e8Y8JkPwvBjLrBFA4bdc2d46274077ff6',
			'device-name': 'SM-N9700',
			'etag': '1LNVYCSN',
			'anti-content': antiContent,
			'referer': 'Android',
			'mcmd-enc': 'AAAAAAAAAAAAAAAAAAAAAMb2AT3qoQufYThizCDRf3wEEKhkz/GKBJrdAPDI3tw3',
			'pdd-config': 'V4:069.030800',
			'vip': '81.69.68.235',
			'Cookie': cookie
		},
		data: data
	};

	let setToken = accessToken;
	let setCookie = cookie;
	await axios.request(config)
		.then(response => {
			console.log(response.data)
			// 更新数据库中的 accessToken
			setToken = response.data.result.accessToken;
			setCookie = response.headers['set-cookie'];
		})
		.catch(error => console.log('error', error.message));
	await db.collection("DuoDuoAuthentication").doc("665c43211bef6bf8b34a8e11").update({
		accessToken: setToken,
		cookie: setCookie
	}).catch(error => console.log('error', error.message));
};