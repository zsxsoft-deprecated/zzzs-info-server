var DB = (function () {
    function DB() {
        this.type = "mongodb";
        this.host = "localhost";
        this.port = 27017;
        this.db = "zzzs";
    }
    return DB;
})();
var List = (function () {
    function List() {
        this.limit = 20;
    }
    return List;
})();
var Config = (function () {
    function Config() {
    }
    Config.db = new DB();
    Config.list = new List();
    return Config;
})();
module.exports = Config;
