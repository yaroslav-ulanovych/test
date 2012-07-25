describe("Bacbone.Templates", function() {
	
	describe("should render nested", function() {
		it("models", function() {
			var template = $("<span data='car'>$color</span>");
			var model = backbonize({car : {color : "red"}});
			Backbone.Templates.bind(template, model);
			expect(template.text()).toBe("red");
			model.get("car").set("color", "red2");
			expect(template.text()).toBe("red2");
		});
		
		it("collections", function() {
			var template = $("<div data='cars'><ul data='collection'><li>$color</li></ul></div>");
			var model = backbonize({cars : [{color: "red"}, {color: "green"}]});
			Backbone.Templates.bind(template, model);
			expect(template.find("ul > li:nth-child(1)").text()).toBe("red");
			expect(template.find("ul > li:nth-child(2)").text()).toBe("green");
			model.get("cars").at(0).set("color", "red2");
			model.get("cars").at(1).set("color", "green2");
			expect(template.find("ul > li:nth-child(1)").text()).toBe("red2");
			expect(template.find("ul > li:nth-child(2)").text()).toBe("green2");
		});
	});

	
});