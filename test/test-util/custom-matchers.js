CustomMatchers = {
	toHaveElement : function(selector) {
		this.message = function() {
			var notText = this.isNot ? " not" : "";
			return "Expected " + $("<div>").append(this.actual.clone()).html() + notText + " to have " + selector;
		}
		return $(this.actual.children()).is(selector);
	}
}