class DB {
	type: string = "mongodb";
	host: string = "localhost";
	port: number = 27017;
	db: string = "zzzs";
}
class List {
	limit: number = 20;
}
class Config {
	static db: DB = new DB();
	static list: List = new List();
}
export = Config;