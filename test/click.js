describe("Backbone.Templates", function() {

	describe("click", function() {
		it("should work", function() {
			var template = $("<div bt-click='click()'>");
			var model = new Backbone.Model();
			var click = jasmine.createSpy("click");
			model.click = click;
			Backbone.Templates.bind(template, model);
			template.click();
			expect(click).toHaveBeenCalled();
		});
	});

});