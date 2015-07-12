///<reference path="../typings/tsd.d.ts" />
(function () {

    /**
     * 异步得到json
     * @param  {string}   url      
     * @param  {Function} callback 
     * @return {XMLHttpRequest}
     */
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
        return xmlHttp;
    }

    /**
     * 强制触发currentView更新
     * @param  {Vue}      vueObject
     * @param  {string}   url      
     * @see https://github.com/yyx990803/vue/issues/945
     */
    function updateVue(vueObject, currentView) {
        vueObject.currentView = '' // 销毁当前的 view
        Vue.nextTick(function () {
          vueObject.currentView = currentView
        }.bind(vueObject))
    }
    
    /** 
     * 上一页ID记录
     */
    var lastPageId = 0;
    /**
     * 上一页ID临时记录
     */
    var lastPageTempId = 0;
    /**
     * 记录上一页ID
     * 每次翻页前，要先记录本次翻页的ID；在下次翻页之后暂不记录，先把值赋给computed.lastId后才可重新记录
     * 但Vue处理的流程是翻页->compute->拿数据
     * 因此，需要一个函数在拿数据之后，计算之前，临时存储ID。
     */    
     function updateLastId(id, method) {
         if (method === 0) { // 拿数据时，更新上一页ID
             //console.log("Update! origId = " + lastPageId + ", lastPageId = " + lastPageTempId + ", tempId = " + id);
             lastPageId = lastPageTempId; // 更新ID到正式变量，并返回原Id
             lastPageTempId = id; // 存储ID到临时变量内
             
         } else { // 计算时，拿回ID。
             //console.log("lastPageId = " + lastPageId + ", tempId = " + lastPageTempId);
             return lastPageId;
         }
     }
                    // 
    // 先把URL Parse一遍
    // 好像并没有什么卵用，全部交给服务端来处理了
    /**
     * HTTP Get QueryString对象
     * @type {Object}
     */
    var $get = {};
    location.search.substr(1).split("&").forEach(function(item) {var k = item.split("=")[0], v = item.split("=")[1]; v = v && decodeURIComponent(v); (k in $get) ? $get[k].push(v) : $get[k] = [v]});
    
    window.addEventListener('DOMContentLoaded', function () {

        Vue.component('list', {
            template: '#list-template',
            created: function () {
                var that = this; // 这玩意在TypeScript格式化后会改变作用域，所以不能用了=_=
                getJsonAsync("/api/list/" + location.search, function (err, res) {
                    that.list = res;
                    that.isInitialized = true;
                    
                    // 上一页ID应该在这里处理，防止数据覆盖
                    updateLastId(that.list[0].id, 0);
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
                    // 处理上一页的ID
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
        /** 
         * 用于记录上一页的ID
         */
       
        var app = new Vue({
            el: "#app",
            data: {
                isInitialized: false,
                currentView: '',
                result: {
                    list: []
                }
            },
            computed: { // Computed不能在component里定义
                nextId: function() {
                    return this.result.list[this.result.list.length - 1].id;
                }, 
                lastId: function() {
                    return updateLastId(0, 1);
                }
            }
        });

        page('/', function () {
            updateVue(app, 'list');
        });

        page('/article/:id', function (object) {
            updateVue(app, 'view');
        });

        page();
    });
})();