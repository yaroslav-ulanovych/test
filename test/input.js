describe("Backbone.Templates", function() {

	describe("input", function() {
		it("should work", function() {
			var template = $("<input type='text' input='input'>");
			template.val("as");
			var model = new Backbone.Model();
			Backbone.Templates.bind(template, model);
			expect(model.get("input")).toBe("as");
			template.val("qw");
			template.trigger("input");
			expect(model.get("input")).toBe("qw");
		});
	});

});