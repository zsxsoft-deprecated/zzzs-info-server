var that = this;
class Robot {
	/**
	 * 学信网的Host Url
	 * @type {string}
	 */
	hostUrl: string = "http://gaokao.chsi.com.cn/";
	/**
	 * 不采集超过年份的信息
	 * @type {number}
	 */
	earlistYear: number = 2014;
	/**
	 * 学信网每个列表页的文章数目
	 * @type {number}
	 */
	singlePageList: number = 30;
	/**
	 * 学信网栏目列表
	 * @type {string[]}
	 */
	scanList: string[] = [
		"gkxx/zzzs/", // 动态
	    "gkxx/zzzs/bkzn/", // 报考指南
		"gkxx/zzzs/gxzc/", // 高校政策
	];
	/**
	 * 抓取延迟（毫秒）
	 * @type {number}
	 */
	delay: number = 200;
	/**
	 * 抓取超时时间（毫秒）
	 */
	requestTimeout: number = 2000;
}
class DB {
	/**
	 * 数据库类型
	 * @type {string}
	 */
	type: string = "mongodb";
	/**
	 * 数据库地址
	 * @type {string}
	 */
	host: string = "localhost";
	/**
	 * 数据库端口
	 * @type {string}
	 */
	port: number = 27017;
	/**
	 * 数据库
	 * @type {string}
	 */
	db: string = "zzzs";
	/**
	 * 打开身份验证
	 * @type {string}
	 */
    authenticate: boolean = false;
	/**
	 * 身份验证用户名
	 * @type {string}
	 */
    username: string = "";
	/**
	 * 密码
	 * @type {string}
	 */
    password: string = "";
}
class View {
	/**
	 * 站点标题
	 * @type {string}
	 */
	title: string = "自主招生信息";
	/**
	 * 站点副标题
	 * @type {string}
	 */
	subTitle: string = "for zsx";
	/**
	 * 站点详细信息
	 * @type {string}
	 */
	description: string = "自主招生信息推送";
	/**
	 * 站点管理员
	 * @type {string}
	 */
	webMaster: string = "";
	/**
	 * 每页显示数量
	 * @type {number}
	 */
	limit: number = 20;
}
class Cron {
	/**
	 * 机器人定时抓取开关
	 * @type {boolean}
	 */
	enable: boolean = true;
	/**
	 * 机器人定时抓取时间
	 * @type {string}
	 * @example
	 * * * * * * *
	 * 00 30 11 * * 1-5
	 * @description Seconds: 0-59 / Minutes: 0-59 / Hours: 0-23 / Day of Month: 1-31 / Months: 0-11 / Day of Week: 0-6
	 * @see https://github.com/ncb000gt/node-cron
	 */
	cronTime: string = "0 * * * * *";
}

class Plugin {
	
	/**
	 * 插件列表
	 * 插件必须存在/plugin/xxx/index.js
	 * TypeScript编写插件需要额外在tsconfig.json内写入需要编译文件
	 * @type {string}
	 */
	pluginList: string[] = [
		""
	];
	
	/**
	 * 动态插件类
	 */
	plugin: any = {
		/*getui: {
			host: "http://sdk.open.api.igexin.com/apiex.htm",
			appKey: "",
			appId: [""],
			masterSecret: "",
			logoUrl: "http://static-file.zsxsoft.com/zzzs/image/logo.png"
		}, 
		xinge: {
			accessId: 0, // 这里必须为Int类型！
			secretKey: ""
		}*/
	};
	
}
class Extra {
	/**
	 * 最大日志数量
	 * @type {number}
	 */
	maxLogCount: number = 100;
}
class Config {
	static db: DB = new DB();
	static view: View = new View();
	static robot: Robot = new Robot();
	static cron: Cron = new Cron();
	static plugin: Plugin = new Plugin();
	static extra: Extra = new Extra();
}
export = Config;