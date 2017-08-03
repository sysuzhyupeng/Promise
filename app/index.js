// var Promise = require('./promise.js')


var a = new Promise(function(resolve, reject) { // 我们实现的Promise
	setTimeout(function() {
		resolve(42);
		console.log(42);
	}, 5000)
}).then(function(data) {
	setTimeout(function() {
		console.log(data)
		return 43;
	}, 2000);
}).then(function(data) {
	setTimeout(function() {
		console.log(111);
		console.log(data);
	}, 2000)
})