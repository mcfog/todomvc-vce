module.exports = window.VComponent.extend({
	method: function (name) {
		return this[name].bind(this);
	},
});
