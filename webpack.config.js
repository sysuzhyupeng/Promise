var htmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var webpack = require('webpack');


var PATHS = {
	app: path.join(__dirname, 'app/index'),
	dist: path.join(__dirname, 'dist/')
};

var baseConfig = {
	entry: {
		app: PATHS.app,
	},
	output: {
		path: PATHS.dist,
		filename: 'bundle.js',
	},
	module: {},
	//插件（Plugins）是用来拓展Webpack功能的,插件并不直接操作单个文件，它直接对整个构建过程其作用。
	plugins: [
	// new htmlWebpackPlugin({
	// 	filename: 'index-[hash].html',
	// 	//把output文件注入到head标签中
	// 	inject: 'head'
	// })
	]
};
module.exports = baseConfig