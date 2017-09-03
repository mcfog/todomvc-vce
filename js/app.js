'use strict';
var Store = require('./store');
var Model = require('./model');

var itemTpl = doT.template(
	document.getElementById('todo-list-item').innerHTML,
);
var itemKeys = 'id title completed'.split(/ /);

module.exports = {
	model: new Model(new Store('todomvc-vce')),
	renderItem: function render(it) {
		render._div = render._div || document.createElement('div');
		render._div.innerHTML = itemTpl(it);

		return render._div.childNodes[0];
	},
	itemSame: function (a, b) {
		return itemKeys.every(function (k) {
			return a[k] === b[k];
		});
	},
	promisify: function (obj, method) {
		return function () {
			var args = [].slice.call(arguments);
			return new Promise(function (resolve) {
				args.push(resolve);
				obj[method].apply(obj, args);
			});
		};
	},
	ENTER_KEY: 13,
	ESCAPE_KEY: 27,
};

VComponent.components = {
	'todo': require('./vc-todo'),
	'todo-header': require('./vc-header'),
	'todo-footer': require('./vc-footer'),
	'todo-main': require('./vc-main'),
	'todo-item': require('./vc-item'),
};

VComponent.render(document).then(function (children) {
	var root = children.filter(function (child) {
		return child.name === 'todo';
	})[0];

	function route() {
		root.routeTo(location.hash.replace(/^[#!]+/, '') || '/');
	}

	window.addEventListener('hashchange', route);
	setTimeout(route);
});

