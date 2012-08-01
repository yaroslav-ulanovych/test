describe("Backbone.Templates", function() {

function callbacksCount(model) {
	if (model._callbacks) {
		return _(model._callbacks).chain().map(function(value, key) {
			var callback = value.next;
			var tail = value.tail;
			var count = 0;
			while (callback != tail) {
				callback = callback.next;
				count = count + 1;
			};
			return count;
		}).reduce(function(a, b) {
			return a + b;
		}, 0).value();
	} else {
		return 0;
	}
};


	describe("sholud remove event handlers from models", function() {

		it("when templates are conditionally rendered", function() {
			var template = $("<div><div rendered='rendered'><span id='$id'>$name</span><span id='$id'>$age</span></div></div>");
			var model = new Backbone.Model({rendered: true});
			Backbone.Templates.bind(template, model);
			expect(callbacksCount(model)).toBe(5);
			model.set("rendered", false);
			expect(callbacksCount(model)).toBe(1);
		});

	});

});