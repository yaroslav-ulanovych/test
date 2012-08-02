describe("Backbone.Templates", function() {

	describe("input event binding", function() {
		it("should update the model on the input event", function() {
			var template = $("<input type='text' input='input'>");
			var model = new Backbone.Model({input : ""});
			Backbone.Templates.bind(template, model);
			template.val("qw");
			template.trigger("input");
			expect(model.get("input")).toBe("qw");
		});

		describe("should update the value of the input element", function() {

			var template = $("<input type='text' input='input'>");
			var model = new Backbone.Model({input : "123"});
			Backbone.Templates.bind(template, model);

			it("immediately after binding", function() {
				expect(template.val()).toBe("123");
			});

			it("when model's property changes", function() {
				model.set("input", "456")
				expect(template.val()).toBe("456");
			});

		});

	});

});