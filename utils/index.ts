/**
 * 数组去重
 * @param {any} arr 
 * @param {any} objectId 如果对象是Object的话，指定一个Object内的方法或属性作为唯一去重ID
 * @return {any}
 */
export function unique(arr: any, objectId: any = null): any {
	  var ret: any = [];
	  var hash: any = {};

	  for (var i = 0; i < arr.length; i++) {
		    var item = arr[i];
		    var key = typeof (item) + (objectId === null ? item : item[objectId]);
		    if (hash[key] !== 1) {
			      ret.push(item);
			      hash[key] = 1;
		    }
	  }

	  return ret;
}

/**
 * 时间格式化
 * @param {Date} date [description]
 * @return {any}
 */
export function formatDate(date: Date): string {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDay() + " " + date.getHours() + ":" + date.getMinutes()
}

/**
 * 将正则表达式特殊字符去除
 * @param {string} regEx [description]
 * @return {string}
 */
export function quoteRegExp(regEx: string): string {
	return regEx.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
}