describe("Bacbone.Templates", function() {
	
	describe("bind attributes conditionally", function() {
		
		it("xxxxxxx", function() {
			var template = $("<span class='even ? even : odd'></span>");
			var model = backbonize({even: true});
			Backbone.Templates.bind(template, model);
			expect(template.attr("class")).toBe("even");
		});
	});

	
});