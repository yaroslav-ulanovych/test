/**
 * Returns a copy of an argument, where all objects are substituted
 * with backbone models and arrays with collections.
 */
function backbonize(obj) {
	var callee = arguments.callee;
	if (_.isArray(obj)) {
		return new Backbone.Collection(_(obj).map(function(item) {
			return callee(item);
		}));
	} else if (_.isObject(obj)) {
		var result = {};
		_(obj).chain().keys().each(function(key) {
			result[key] = callee(obj[key]);
		});
		return new Backbone.Model(result);
	} else {
		return obj;
	}
}
