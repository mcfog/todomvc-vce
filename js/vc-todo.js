var app = require('./app');
var Component = require('./vc');
var routes = {
	'/': 'all',
	'': 'all',
	'/active': 'active',
	'/completed': 'completed',
};

module.exports = Component.extend({
	init: function () {
		var that = this;

		this.children.header[0].on('enter', this.method('onEnterItem'));
		this.followUpdate('header');
		this.followUpdate('main');
		this.followUpdate('footer');
		this.on('update', this.method('onUpdate'));

		app.model.read(undefined, function (items) {
			that.children.main[0].render(items);
			that.children.footer[0].render(items);
		});
	},
	followUpdate: function (name) {
		this.children[name][0].on('update', this.emit.bind(this, 'update', name));
	},
	routeTo: function (path) {
		if (!routes[path]) {
			location.hash = '/';
			return;
		}

		this.children.main[0].setFilter(routes[path]);
		this.children.footer[0].setFilter(routes[path]);
	},
	onEnterItem: function (title) {
		var that = this;

		this.children.header[0].clear();
		app.model.create(title, function (items) {
			var main = that.children.main[0];
			Promise.all(items.map(main.appendItem.bind(main)))
				.then(that.emit.bind(that, 'update', 'header'));
		});
	},
	onUpdate: function (source) {
		var that = this;
		app.model.read(undefined, function (items) {
			setTimeout(function () {
				if (source !== 'header') {
					that.children.header[0].render(items);
				}
				if (source !== 'main') {
					that.children.main[0].render(items);
				}
				if (source !== 'footer') {
					that.children.footer[0].render(items);
				}
			});
		});
	},
});
