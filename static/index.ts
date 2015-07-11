///<reference path="../typings/tsd.d.ts" />
(() => {
	function getJsonAsync(url: string, callback:(err: any, responseObject: any) => void): boolean {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, true);
		xmlHttp.send();
		xmlHttp.addEventListener("readystatechange", () => {
			if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
				callback(null, JSON.parse(xmlHttp.responseText));
			} else {
				callback({
					readyState: xmlHttp.readyState,
					status: xmlHttp.status,
					statusText: xmlHttp.statusText
				}, null);
			}
		});
		return true;
	}
	
	new Vue({
		el: "#app",
		data: {
			isInitialized: false,
			result: {list: []}
		}, 
		created: () => {
			var that = this;
			getJsonAsync("/api/list/?page=1", (err, res) => {
				that.data.isInitialized = true;
			});
		}
	});
})();