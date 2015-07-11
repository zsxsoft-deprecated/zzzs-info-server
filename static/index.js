///<reference path="../typings/tsd.d.ts" />
(function () {

    function getJsonAsync(url, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, true);
        xmlHttp.send();
        xmlHttp.addEventListener("readystatechange", function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                callback(null, JSON.parse(xmlHttp.responseText));
            }
            else if (xmlHttp.readyState === 4) {
                callback({
                    readyState: xmlHttp.readyState,
                    status: xmlHttp.status,
                    statusText: xmlHttp.statusText
                }, null);
            }
        });
        return true;
    }

    window.addEventListener('DOMContentLoaded', function () {

        Vue.component('list', {
            template: '#list-template',
            created: function () {
                var that = this; // 这玩意在TypeScript格式化后会改变作用域，所以不能用了=_=
                getJsonAsync("/api/list/", function (err, res) {
                    that.list = res;
                    that.isInitialized = true;
                });
            }
        });
        Vue.component('view', {
            template: '#view-template',
            created: function () {
                var that = this;
                // Page得到的ID不能在这里即时出现，应该是双向绑定的锅
                getJsonAsync("/api/article/" + location.pathname.split("/").pop(), function (err, res) {
                    that.list = [res];
                    that.isInitialized = true;
                });
            }
        });
        Vue.component('single-list', {
            template: "#single-list",
            replace: true,
            methods: {
                onClick: function (id, e) {
                    //e.preventDefault();
                }
            }
        });
        Vue.component('single-view', {
            template: "#single-view",
            replace: true,
            methods: {
                onClick: function (id, e) {
                    //e.preventDefault();
                }
            }
        });
        var app = new Vue({
            el: "#app",
            data: {
                isInitialized: false,
                currentView: '',
                result: {
                    list: []
                }
            }
        });

        page('/', function () {
            app.currentView = 'list';
        });

        page('/article/:id', function (object) {
            app.currentView = 'view';
        });
        
        page();
    });
})();