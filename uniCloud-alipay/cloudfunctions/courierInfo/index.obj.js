const axios = require('axios');
const qs = require('qs');
const createConfig = require('uni-config-center')
const db = uniCloud.database();
const dbCmd = db.command;

module.exports = {
	_before: function () { // 通用预处理器

	},
	async get(){
		// 定义返回值
		let result = {
		    "status": 0,
		    "describe": "success",
		    "data": {
		        "packageInfo": []
		    }
		};
		
		// 从前端获取数据
		const { type, data } = event;

		// 定义手机号或快递号
		let code;
		
		switch (type) {
		    case 1: {
		        // 直接使用传入的手机号
		        code = data;
		
		        // 验证手机号是否合法（10-15位数字）
		        const phoneRegex = /^\d{10,15}$/;
		        const isCodeValid = phoneRegex.test(code);
		
		        if (!isCodeValid) {
		            return {
		                "status": 3,
		                "describe": "手机号不合法",
		                "data": {
		                    "packageInfo": []
		                }
		            };
		        }
		        break;
		    }
		    case 2: {
		        // 验证快递号是否合法（至少9个字符）
		        if (data.length < 9) {
		            return {
		                "status": 5,
		                "describe": "快递号不合法",
		                "data": {
		                    "packageInfo": []
		                }
		            };
		        }
		        code = data;
		        break;
		    }
		    default: {
		        return {
		            "status": 4,
		            "describe": "类型不合法",
		            "data": {
		                "packageInfo": []
		            }
		        };
		    }
		}
		
		// 从数据库获取数据
		const [TXDoc, DDDoc, antiContentCount, antiContentDoc, countAdd, IconDoc] = await Promise.all([
		    db.collection("TuXiAuthentication").doc("665c435093a03abf82fc11cd").get(),
		    db.collection("DuoDuoAuthentication").doc("665c43211bef6bf8b34a8e11").get(),
		    db.collection("DuoDuoAuthentication").doc("665c43211bef6bf8b34a8e11").field({
		        "antiContentCount": true
		    }).get(),
		    db.collection("DuoDuoAntiContent").limit(1).get(),
		    db.collection("DuoDuoAuthentication").doc("665c43211bef6bf8b34a8e11").update({
		        antiContentCount: dbCmd.inc(1)
		    }),
		    db.collection("ExpressCompanyIconMap").limit(1).get(),
		]);
		
		// 处理数据库数据
		const { Token: TXToken, XYsDt } = TXDoc.data[0];
		const { accessToken: DDToken, cookie } = DDDoc.data[0];
		const antiContent = antiContentDoc.data[0].anti;
		const iconMap = IconDoc.data[0];
		const wayBillStatusMap = {
		    "1": 1,
		    "3": 3,
		    "4": 2,
		    "100": 1,
		    "800": 2,
		    "301": 3
		};
		const DDQueryTypeMap = {
		    "1": 1,
		    "2": 3
		};
		
		// 检查 antiContent 字段是否超出限制
		if (antiContentCount.data[0].antiContentCount >= 10) {
		    let res = await db.collection("DuoDuoAntiContent").limit(1).get(); // 只返回第一条记录
		    await Promise.all([
		        db.collection("DuoDuoAntiContent").doc(res.data[0]._id).remove(),
		        db.collection("DuoDuoAuthentication").doc("665c43211bef6bf8b34a8e11").update({
		            antiContentCount: 0
		        })
		    ]);
		}
		
		// 准备网络请求
		const postDuoDuo = createConfig({ // 获取配置实例
			pluginId: 'post-duoduo' 
		})
		const postTuXi = createConfig({ // 获取配置实例
			pluginId: 'post-tuxi' 
		})
		let configDuoDuo = postDuoDuo.config()
		let configTuXi = postTuXi.config()
		
		
		// 组建网络请求
		let TXResult = [],
		    DDResult = [];
		for (let i = 0; i < Things.length; i++) {
			Things[i]
		}
		let TXData = qs.stringify({
		    'data': `{"billCode":null,"code":"${code}","type":"${type}","dateRange":1,"depotCode":"KDCS39300264913","endDate":"2024-05-27 15:23:52","expressCompanyCode":null,"grayFlag":"Y","leaveRemark":null,"pageSize":50,"page":1}`
		});
		let TXConfig = {
		    method: 'POST',
		    url: 'https://kdcsgateway.zt-express.com/gateway.do/',
		    headers: {
		        'Reqable-Id': 'reqable-id-17bce034-256c-4767-86d7-092958963060',
		        'User-Agent': 'Android:9 ;MI 9 ;Android; Version 4.38.2',
		        'Connection': 'Keep-Alive',
		        'Accept-Encoding': 'gzip',
		        'Content-Type': 'application/x-www-form-urlencoded',
		        'X-Ca-Version': '5',
		        'X-Zop-Name': 'tuxi.spm.stock.read.queryScanEnterInfoAppByCode',
		        'X-App-Version': '4.38.2',
		        'X-Ys-Dt': XYsDt,
		        'X-Sv-V': 'com.zto.families.ztofamilies_4.38.2',
		        'x-device-id': 'b746cb22-edd5-4200-8ef6-6d6585d5a835',
		        'X-Iam-Token': TXToken,
		        'X-Userid': '248453',
		        'X-Unionid': 'union5SUmRfNUAEQ_98UAO7Xw0P_R'
		    },
		    data: TXData
		};
		let DDData = JSON.stringify({
		    "page_index": 1,
		    "content": code,
		    "selected": false,
		    "offset": 0,
		    "search_type": DDQueryTypeMap[`${type}`]
		});
		let DDConfig = {
		    method: 'POST',
		    url: 'https://mdkd-api.pinduoduo.com/api/orion/op/package/search/content',
		    headers: {
		        'Reqable-Id': 'reqable-id-f90f3bce-83c3-4c7a-83f1-5f2d16e70d7f',
		        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; SM-N9700 Build/PQ3B.190801.06161913)station_android_version/3.8.0 PackegeName/com.xunmeng.station AppVersion/3.8.0 DeviceType/Mobile AppName/DDStore pstation_android_version/3.8.0',
		        'Accept-Encoding': 'gzip',
		        'content-type': 'application/json;charset=utf-8',
		        'p-appname': 'DDStore',
		        'verifyauthtoken': 'PY8IH3e8Y8JkPwvBjLrBFA4bdc2d46274077ff6',
		        'device-name': 'SM-N9700',
		        'etag': '1LNVYCSN',
		        'accesstoken': DDToken,
		        'anti-content': antiContent,
		        'referer': 'Android',
		        'mcmd-enc': 'AAAAAAAAAAAAAAAAAAAAAH97/sceJByxAkDejG5VVEuhDWRfsuvISEqdpG3oLuuWH3PEE3aWghMqVWBq9WRLNg==',
		        'pdd-config': 'V4:069.030800',
		        'vip': '81.69.68.235',
		        'Cookie': cookie
		    },
		    data: DDData
		};
		
		// 发送网络请求
		const [TXResponse, DDResponse] = await Promise.all([
		    axios.request(TXConfig),
		    axios.request(DDConfig)
		]);
		
		// 处理 TX 响应
		if (TXResponse.data.status) {
		    TXResult = TXResponse.data.result.stockInfos
		        .map(item => ({
		            updateDate: item.updateDate,
		            expressCompanyCode: item.expressCompanyCode,
		            expressCompanyIcon: item.expressCompanyCode,
		            wayBillStatus: item.leaveType,
		            billCode: item.billCode,
		            takeCode: item.takeCode
		        }));
		} else {
		    result.status = 1;
		    result.describe = "兔喜API报错:" + TXResponse.data.message;
		}
		
		// 处理 DD 响应
		try {
		    DDResponse.data.success
		    if (DDResponse?.data?.result?.detail) {
		        DDResult = DDResponse.data.result.detail
		            .map(item => ({
		                updateDate: item.first_in_time,
		                expressCompanyCode: item.wp_code,
		                expressCompanyIcon: item.wp_code,
		                wayBillStatus: item.waybill_status,
		                billCode: item.waybill_code,
		                takeCode: item.pickup_code
		            }));
		    }
		} catch (err) {
		    result.status = 2;
		    result.describe = "多多API报错:" + DDResponse.data;
		}
		
		// 合并并格式化结果
		result.data.packageInfo = TXResult.concat(DDResult)
		    .sort((a, b) => b.updateDate - a.updateDate)
		    .map(item => ({
		        updateDate: item.updateDate,
		        expressCompanyIcon: iconMap[item.expressCompanyIcon] || iconMap["default"],
		        wayBillStatus: wayBillStatusMap[`${item.wayBillStatus}`],
		        billCode: item.billCode,
		        takeCode: item.takeCode
		    }));
		
		console.log("返回给后端的数据：");
		console.log(result);
		return result;
	}


}
