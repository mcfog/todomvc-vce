var app = require('./app');

module.exports = require('./vc').extend({
	name: 'footer',
	init: function () {
		this.elCounter = this.qs('.todo-count');
		this.elClear = this.qs('.clear-completed');
	},
	events: [
		'click/.clear-completed/onClear',
	],
	render: function (items) {
		var that = this;
		if (items) {
			paint(items);
		} else {
			app.model.read(undefined, paint);
		}

		function paint(items) {
			var left = items.filter(function (item) {
				return !item.completed;
			}).length;
			if (left === 1) {
				that.elCounter.innerHTML = '<strong>1</strong> item left';
			} else {
				that.elCounter.innerHTML = '<strong>' + left + '</strong> items left';
			}

			that.root.style.display = items.length > 0 ? 'block' : 'none';

			that.elClear.style.display = items.some(function (item) {
				return item.completed;
			}) ? 'block' : 'none';
		}
	},
	setFilter: function (type) {
		var that = this;
		this.qsa('[data-route]').forEach(function (el) {
			var method = {
				true: 'add',
				false: 'remove',
			}[el.dataset.route === type];

			el.classList[method]('selected');
		});
	},
	onClear: function () {
		var that = this;
		var remain = false;
		app.model.read(undefined, function (items) {
			Promise
				.all(items.map(function (item) {
					if (!item.completed) {
						remain = true;
						return;
					}
					return app.promisify(app.model, 'remove')(item.id);
				}))
				.then(function () {
					if (!remain) {
						that.root.style.display = 'none';
					}
					that.elClear.style.display = 'none';
					that.emit('update');
				})
			;
		});
	},
});
