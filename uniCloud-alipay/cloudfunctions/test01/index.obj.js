// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const anti_content= require('anti-content-common')
module.exports = {
	_before: function () { // 通用预处理器

	},
	async get(){
		const res = await anti_content.getAnti("anti-content-a")
		console.log(res)
		return anti_content.getAnti("anti-content-a")
		
	}
}
