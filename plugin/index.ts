///<reference path="../typings/tsd.d.ts" />
import fs = require('fs');
import config = require('../config');

config.plugin.pluginList.map((value: string) => {
	console.info('Import plugin ' + value);
	require('./' + value + '/');
});