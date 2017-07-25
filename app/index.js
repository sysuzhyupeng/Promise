// var getElementById = require('./getElementById');
// var querySelector = require('./querySelector');

/*
	Promise 本质是一个状态机。每个 promise 只能是 3 种状态中的一种：pending、fulfilled 或 rejected。状态转变只能是 pending -> fulfilled 或者 pending -> rejected。状态转变不可逆。
	then 方法可以被同一个 promise 调用多次。
	then 方法必须返回一个 promise。规范里没有明确说明返回一个新的 promise 还是复用老的 promise（即 return this），大多数实现都是返回一个新的 promise，而且复用老的 promise 可能改变内部状态，这与规范也是相违背的。
	值穿透。
*/
function Promise(resolver) {

}

Promise.prototype.then = function() {}
Promise.prototype.catch = function() {}

Promise.resolve = function() {}
Promise.reject = function() {}
Promise.all = function() {}
Promise.race = function() {}