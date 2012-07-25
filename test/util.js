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

jasmine.Matchers.prototype.toBeHtml = function() {
	
	var actual = this.actual;
	var expected = $(arguments[0]);
	
	function compare(pre, actual, expected) {
		//if (_.isUndefined(actual) && _.isUndefined(expected))
	};
	
	


	this.message = function() {
		return "hello";
	};
	return false;
	
}