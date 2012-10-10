describe("Bacbone.Templates", function() {

	var backbonize = Backbone.Templates.Util.backbonize;
	
	describe("should keep proper context while rendering", function() {
		
		it("simple model", function() {
			var template = $("<span>$color</span>");
			Backbone.Templates.bind(template, backbonize({color : "red"}));
			expect(template.text()).toBe("red1");
		});
		
		it("simple model", function() {
			var template = $("<div><span>$color</span></div>");
			Backbone.Templates.bind(template, backbonize({color : "red"}));
			expect(template.children("span").text()).toBe("red");
		});
		
	});

	
});