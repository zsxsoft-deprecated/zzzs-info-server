var DB = (function () {
    function DB() {
        this.type = "mongodb";
        this.host = "localhost";
        this.port = 27017;
        this.db = "zzzs";
    }
    return DB;
})();
var Config = (function () {
    function Config() {
    }
    Config.db = new DB();
    return Config;
})();
module.exports = Config;
//# sourceMappingURL=config.js.map