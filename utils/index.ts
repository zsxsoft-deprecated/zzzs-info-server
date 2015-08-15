/**
 * 数组去重
 * @param {any} arr 
 * @return {any}
 */
export function unique(arr: any): any {
	var set = new Set(arr);
	var ret = [];
	for (var value of set.values()) {
		ret.push(value);
	}
	return ret;
}

/**
 * 时间格式化
 * @param {Date} date [description]
 * @return {any}
 */
export function formatDate(date: Date): string {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
}

/**
 * 将正则表达式特殊字符去除
 * @param {string} regEx [description]
 * @return {string}
 */
export function quoteRegExp(regEx: string): string {
	return regEx.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
}