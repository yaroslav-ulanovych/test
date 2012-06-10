describe("Bacbone.Templates", function() {

	describe("should substitute", function() {
		
		describe("content placeholders", function() {
			it("in single nodes", function() {
				var template = $("<span>$name</span>");
				var model = new Backbone.Model({name: "Jack"});
				Backbone.Templates.bind(template, model);
				expect(template.text()).toBe("Jack");
				model.set({name: "John"})
				expect(template.text()).toBe("John");
			});
			
			it("in child nodes", function() {
				var template = $("<span><div>$name</div></span>");
				var model = new Backbone.Model({name: "Jack"});
				Backbone.Templates.bind(template, model);
				expect(template.children("div").text()).toBe("Jack");
				model.set({name: "John"});
				expect(template.children("div").text()).toBe("John");
			});			

		});
		
		describe("attribute placeholders", function() {
			it("in single nodes", function() {
				var template = $("<span id='$id'>");
				var model = new Backbone.Model({id: "1"});
				Backbone.Templates.bind(template, model);
				expect(template.attr("id")).toBe("1");
				model.set({id: 2});
				expect(template.attr("id")).toBe("2");
			});
			
			it("in child nodes", function() {
				var template = $("<div><span id='$id'></span></div>");
				var model = new Backbone.Model({id: "1"});
				Backbone.Templates.bind(template, model);
				expect(template.children("span").attr("id")).toBe("1");
				model.set({id: 2});
				expect(template.children("span").attr("id")).toBe("2");
			});
		});
		
	
	});
	
	describe("change context", function() {
		it("", function() {
			var template = $("<span data='car'>$color</span>");
			Backbone.Templates.bind(template, new Backbone.Model({car: new Backbone.Model({color: "red"})}));
			expect(template.text()).toBe("red");
		});
		
	});
	
	describe("", function() {
		it("", function() {
			var template = $("<span></span>");
			
		});
	});
	
});