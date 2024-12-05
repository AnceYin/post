module.exports = {
	maxCount:10,
	antiMap: {
		"anti-content-a":"66e550fc988f93d70b7567cf",
		"anti-content-b":"66e5518bd41b3595dabe05ae"
	},
	getAnti: async function(name){
		const dbJQL = uniCloud.databaseForJQL({})
		dbJQL.setUser({
			role: ['admin']
		})
		// 拿计数器数据
		const countDoc = await dbJQL.collection("duoduo-config").doc(this.antiMap[name]).get();
		const count = countDoc.data[0].anti_content_count
		
		// 拿anti_content数据
		const res = await dbJQL.collection(name).limit(1).get(); // 返回第一条记录
		await dbJQL.collection("duoduo-config").doc(this.antiMap[name]).update({ // 计数加一
			anti_content_count:count+1
		});
		
		// 清理无用数据
		if(count>this.maxCount){
			await dbJQL.collection(name).where(`_id=="${res.data[0]._id}"`).remove(); // 删除第一条记录
			await dbJQL.collection("duoduo-config").doc(this.antiMap[name]).update({ // 计数清零
				anti_content_count:0
			});
		}

		return res.data[0].anti
	}
}