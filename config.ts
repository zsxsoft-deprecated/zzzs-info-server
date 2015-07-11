class DB {
	type: string = "mongodb";
	host: string = "localhost";
	port: number = 27017;
	db: string = "zzzs";
}
class Config {
	static db: DB = new DB();
}
export = Config;