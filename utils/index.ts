/**
 * 数组去重
 * @param {any} arr [description]
 * @return any
 */
export function unique(arr: any) {
	  var ret: any = [];
	  var hash: any = {};

	  for (var i = 0; i < arr.length; i++) {
		    var item = arr[i];
		    var key = typeof (item) + item;
		    if (hash[key] !== 1) {
			      ret.push(item)
			      hash[key] = 1;
		    }
	  }

	  return ret;
}

/**
 * 时间格式化
 * @param {Date} date [description]
 * @return any
 */
export function formatDate(date: Date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDay() + " " + date.getHours() + ":" + date.getMinutes()
}