var app = require('./app');

module.exports = require('./vc').extend({
	name: 'item',
	init: function () {
		var that = this;
		app.model.read(this.getId(), function (items) {
			that.item = items[0];
		});
	},
	events: [
		'change/.toggle/onToggle',
		'click/.destroy/onDestroy',
		'dblclick/label/onStartEdit',
		'keyup blur/input.edit/onEditing',
	],
	getId: function () {
		return this.root.dataset.itemId;
	},
	redraw: function (item) {
		if (!app.itemSame(item, this.item) || item.editing || this.item.editing) {
			this.replaceRoot(app.renderItem(item));
			this.item = item;
		}
	},
	onDestroy: function (event) {
		var that = this;
		app.model.remove(this.getId(), function () {
			that.emit('destroy');
		});
	},
	onToggle: function (event) {
		var that = this;
		app.model.update(this.getId(), {
			completed: !!event.target.checked,
		}, function (items) {
			that.redraw(items[0]);
			that.emit('update', items[0]);
		});
	},
	onStartEdit: function (event) {
		var that = this;
		app.model.read(this.getId(), function (items) {
			that.redraw(Object.assign({
				editing: true,
			}, items[0]));
			var edit = that.qs('input.edit');
			edit.value = items[0].title;
			edit.focus();
		});
	},
	onEditing: function (event) {
		var that = this;
		if (!event.keyCode) { // blur
			if (!that.iscancel) {
				app.model.update(that.getId(), {
					title: event.target.value,
				}, function (items) {
					that.redraw(items[0]);
					that.emit('update', items[0]);
				});
			} else {
				app.model.read(that.getId(), function (items) {
					that.redraw(items[0]);
				});
				delete that.iscancel;
			}
		} else if (event.keyCode === app.ESCAPE_KEY) {
			that.iscancel = true;
			event.target.blur();
		} else if (event.keyCode === app.ENTER_KEY) {
			event.target.blur();
		}
	},
});
