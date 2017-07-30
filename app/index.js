// var getElementById = require('./getElementById');
// var querySelector = require('./querySelector');

/*
	Promise 本质是一个状态机。每个 promise 只能是 3 种状态中的一种：pending、fulfilled 或 rejected。
	状态转变只能是 pending -> fulfilled 或者 pending -> rejected。状态转变不可逆。
	then 方法可以被同一个 promise 调用多次。
	then 方法必须返回一个 promise。规范里没有明确说明返回一个新的 promise 还是复用老的 promise（即 return this），
	大多数实现都是返回一个新的 promise，而且复用老的 promise 可能改变内部状态，这与规范也是相违背的。
	值穿透。
*/
/*
	Promise是一个构造函数，自己身上有all、reject、resolve这几个眼熟的方法，原型上有then、catch等同样很眼熟的方法
	只是new了一个Promise对象，并没有调用它，我们传进去的函数就已经执行了，这是需要注意的一个细节。
	所以我们用Promise的时候一般是包在一个函数中，在需要的时候去运行这个函数
	Promise的all方法提供了并行执行异步操作的能力，并且在所有异步操作执行完后才执行回调
*/
var PENDING = 0;
var RESOLVED = 1;
// var FULFILLED = 1;
var REJECTED = 2;

function Promise(executor) {
	var self = this
	self.status = PENDING // Promise当前的状态
		//保存promise中的值，如resolve(42)
	self.data = undefined;
	self.onResolvedCallback = [] // Promise resolve时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面
	self.onRejectedCallback = [] // Promise reject时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面

	//resolve作用是保存promise的值，改变状态，如果有回调再执行回调。
	function resolve(value) {
		if (self.status === PENDING) {
			self.status = RESOLVED;
			self.data = value;
			for (var i = 0; i < self.onResolvedCallback.length; i++) {
				self.onResolvedCallback[i](value)
			}
		}
	}

	function reject(reason) {
		if (self.status === PENDING) {
			self.status = REJECTED;
			self.data = reason;
			for (var i = 0; i < self.onRejectedCallback.length; i++) {
				self.onRejectedCallback[i](reason)
			}
		}
	}

	try { // 考虑到执行executor的过程中有可能出错，所以我们用try/catch块给包起来，
		// 执行传入的函数executor
		executor(resolve, reject)
	} catch (e) {
		//出错后以catch到的值reject掉这个Promise
		reject(e)
	}
}

// then方法接收两个参数，onResolved，onRejected，分别为Promise成功或失败后的回调
//Promise对象有一个then方法，用来注册在这个Promise状态确定后的回调
Promise.prototype.then = function(onResolved, onRejected) {
	var self = this
	var promise2 = {};
	// 根据标准，如果then的参数不是function，则我们需要忽略它，此处以如下方式处理
	onResolved = typeof onResolved === 'function' ? onResolved : function(v) {}
	onRejected = typeof onRejected === 'function' ? onRejected : function(r) {}
		//根据promise1的状态，我们需要在then里面执行onResolved或者onRejected
	if (self.status === RESOLVED) {
		// 如果promise1(此处即为this/self)的状态已经确定并且是resolved，我们调用onResolved
		// 进入下一个承诺 promise
		// 因为考虑到有可能throw，所以我们将其包在try/catch块里
		return promise2 = new Promise(function(resolve, reject) {
			try {
				//上一个promise的data，作为then的参数
				var x = onResolved(self.data);
				// 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
				if (x instanceof Promise) {
					//递归
					x.then(resolve, reject);
				}
				resolve(x);
			} catch (e) {
				reject(e) // 如果出错，以捕获到的错误做为promise2的结果
			}
		})
	}

	if (self.status === REJECTED) {
		return promise2 = new Promise(function(resolve, reject) {
			try {
				var x = onRejected(self.data)
				if (x instanceof Promise) {
					x.then(resolve, reject)
				}
			} catch (e) {
				reject(e)
			}
		})
	}

	if (self.status === PENDING) {
		return promise2 = new Promise(function(resolve, reject) {
			// 如果当前的Promise还处于pending状态，我们并不能确定调用onResolved还是onRejected，
			// 只能等到Promise的状态确定后
			self.onResolvedCallback.push(function(value) {
				try {
					var x = onResolved(self.data)
					if (x instanceof Promise) {
						x.then(resolve, reject)
					}
				} catch (e) {
					reject(e)
				}
			})

			self.onRejectedCallback.push(function(reason) {
				try {
					var x = onRejected(self.data)
					if (x instanceof Promise) {
						x.then(resolve, reject)
					}
				} catch (e) {
					reject(e)
				}
			})
		})
	}
}

Promise.prototype.catch = function(onRejected) {
	//相当于then的第二个参数
	return this.then(null, onRejected)
}

Promise.resolve = function() {}
Promise.reject = function() {}
Promise.all = function() {}
Promise.race = function() {}

/*
	还有几个问题：
	1. 不同的Promise实现之间需要无缝的可交互，即Q的Promise，ES6的Promise，和上面实现的Promise，
	应该并且是有必要无缝相互调用的
    2. new Promise(resolve=>resolve(8))
	    .then()
	    .then()
	    .then(function foo(value) {
	        alert(value)
	    })
	    正确的行为应该是alert出8，而如果拿上面的Promise，
	    运行上述代码，将会alert出undefined。这种行为称为穿透，
	    即8这个值会穿透两个then(说Promise更为准确)到达最后一个then里的foo函数里，成为它的实参，最终将会alert出8。
*/

// var immediate = require('immediate');

function INTERNAL() {}

function isFunction(func) {
	return typeof func === 'function';
}

function isObject(obj) {
	return typeof obj === 'object';
}

function isArray(arr) {
	return Object.prototype.toString.call(arr) === '[object Array]';
}

var a = new Promise(function(resolve, reject) { // 我们实现的Promise
	setTimeout(function() {
		resolve(42);
		console.log(42);
	}, 2000)
}).then(function(data) {
	setTimeout(function() {
		console.log(data)
		return '43';
	}, 2000);
})