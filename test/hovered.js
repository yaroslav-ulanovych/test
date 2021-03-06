describe("Bacbone.Templates", function() {

	var backbonize = Backbone.Templates.Util.backbonize;
	
	describe("hovered binding should", function() {
		
		var template = $("<span bt-hovered='hovered'></span>");
		var model = backbonize({});
		Backbone.Templates.bind(template, model);
	
		it("be false initially", function() {
			expect(model.get("hovered")).toBe(false);
		});
		
		it("then get true on mouseover", function() {
			template.trigger("mouseover");
			expect(model.get("hovered")).toBe(true);
		});
		
		it("then get false on mouseout", function() {
			template.trigger("mouseout");
			expect(model.get("hovered")).toBe(false);
		});
	});

	
});