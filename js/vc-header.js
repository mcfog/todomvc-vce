var app = require('./app');

module.exports = require('./vc').extend({
	name: 'header',
	init: function () {
		this.elInput = this.qs('input.new-todo');
	},
	events: [
		'keydown blur/input.new-todo/onInput',
	],
	render: function (items) {
		// var that = this;
		// if (items) {
		// 	paint(items);
		// } else {
		// 	app.model.read(undefined, paint);
		// }
		//
		// function paint(items) {
		// }
	},
	clear: function () {
		this.elInput.value = '';
	},
	onInput: function (event) {
		if (event.keyCode && event.keyCode !== app.ENTER_KEY) return;
		if (!this.elInput.value) return;
		this.emit('enter', this.elInput.value);
	},
});
