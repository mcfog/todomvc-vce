var app = require('./app');

function isItemFiltered(item, type) {
	if (type === 'active') {
		return !!item.completed;
	} else if (type === 'completed') {
		return !item.completed;
	}
	return false;
}

module.exports = require('./vc').extend({
	name: 'main',
	init: function () {
		this.elToggleAll = this.qs('input.toggle-all');
		this.elList = this.qs('ul.todo-list');
	},
	events: [
		'change/input.toggle-all/onToggleAll',
	],
	render: function (items) {
		var that = this;
		if (items) {
			paint(items);
		} else {
			app.model.read(undefined, paint);
		}

		function paint(items) {
			var itemObj = {};
			var wait = [];
			var children = (that.children.item || []).slice();

			items.forEach(function (item, idx) {
				var child = children.filter(function (child) {
					return child.getId() == item.id;
				})[0];
				if (child) {
					child.redraw(item);
				} else {
					wait.push(that.appendItem(item));
				}
				itemObj[item.id] = item;
			});

			Promise.all(wait).then(function () {
				(that.children.item || []).slice().forEach(function (child) {
					var id = child.getId();
					if (!itemObj[id]) {
						that.removeChild(child);
					} else if (isItemFiltered(itemObj[id], that.filter)) {
						child.root.classList.add('hide');
					} else {
						child.root.classList.remove('hide');
					}
				});

				that.root.style.display =
					that.children.item && that.children.item.length > 0
						? 'block'
						: 'none';

				that.elToggleAll.checked = items.every(function (item) {
					return item.completed;
				});
			});
		}
	},
	setFilter: function (type) {
		this.filter = type;
		this.render();
	},
	appendItem: function (item, refEl) {
		var that = this;
		var el = app.renderItem(item);
		if (refEl) {
			this.elList.insertBefore(el, refEl);
		} else {
			this.elList.appendChild(el);
		}
		return this.createChild(el).then(function (child) {
			return child.on('destroy update', function () {
				that.render();
				that.emit('update');
			});
		});
	},
	onToggleAll: function (event) {
		var that = this;
		app.model.read(undefined, function (items) {
			var all = items.map(function (item) {
				return app.promisify(app.model, 'update')(item.id, {
					completed: event.target.checked,
				});
			});
			Promise.all(all).then(function () {
				that.render();
				that.emit('update');
			});
		});
	},
});
