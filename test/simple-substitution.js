describe("Bacbone.Templates", function() {

	describe("should substitute", function() {
		
		describe("content placeholders", function() {
		
			describe("initially", function() {
				it("in single nodes", function() {
					var template = $("<span>$name</span>");
					Backbone.Templates.bind(template, backbonize({name: "Jack"}));
					expect(template.text()).toBe("Jack");
				});
				
				it("in child nodes", function() {
					var template = $("<span><div>$name</div></span>");
					Backbone.Templates.bind(template, backbonize({name: "Jack"}));
					expect(template.children("div").text()).toBe("Jack");
				});
				
				it("in sibling nodes", function() {
					var template = $("<span>$name</span><span>$name</span>");
					Backbone.Templates.bind(template, backbonize({name: "Jack"}));
					expect($(template[0]).text()).toBe("Jack");
					expect($(template[1]).text()).toBe("Jack");
				});
			});

			describe("dynamically", function() {
				it("in single nodes", function() {
					var template = $("<span>$name</span>");
					var model = backbonize({name: "Jack"});
					Backbone.Templates.bind(template, model);
					model.set({name: "John"})
					expect(template.text()).toBe("John");
				});
				
				it("in child nodes", function() {
					var template = $("<span><div>$name</div></span>");
					var model = backbonize({name: "Jack"});
					Backbone.Templates.bind(template, model);
					model.set({name: "John"});
					expect(template.children("div").text()).toBe("John");
				});
				
				it("in sibling nodes", function() {
					var template = $("<span>$name</span><span>$name</span>");
					var model = backbonize({name: "Jack"});
					Backbone.Templates.bind(template, model);
					model.set({name: "John"});
					expect($(template[0]).text()).toBe("John");
					expect($(template[1]).text()).toBe("John");
				});
			});			

		});
		
		describe("attribute placeholders", function() {
		
			describe("initially", function() {
				it("in single nodes", function() {
					var template = $("<span id='$id'>");
					Backbone.Templates.bind(template, backbonize({id: "1"}));
					expect(template.attr("id")).toBe("1");
				});
				
				it("in child nodes", function() {
					var template = $("<div><span id='$id'></span></div>");
					Backbone.Templates.bind(template, backbonize({id: "1"}));
					expect(template.children("span").attr("id")).toBe("1");
				});
				
				it("in sibling nodes", function() {
					var template = $("<span id='$id'></span><span id='$id'></span>");
					Backbone.Templates.bind(template, backbonize({id: "1"}));
					expect($(template[0]).attr("id")).toBe("1");
					expect($(template[1]).attr("id")).toBe("1");
				});
			});
			
			describe("dynamically", function() {
				it("in single nodes", function() {
					var template = $("<span id='$id'>");
					var model = backbonize({id: "1"});
					Backbone.Templates.bind(template, model);
					model.set({id: 2});
					expect(template.attr("id")).toBe("2");
				});
				
				it("in child nodes", function() {
					var template = $("<div><span id='$id'></span></div>");
					var model = backbonize({id: "1"});
					Backbone.Templates.bind(template, model);
					model.set({id: 2});
					expect(template.children("span").attr("id")).toBe("2");
				});
				
				it("in sibling nodes", function() {
					var template = $("<span id='$id'></span><span id='$id'></span>");
					var model = backbonize({id: "1"});
					Backbone.Templates.bind(template, model);
					model.set({id: 2});
					expect($(template[0]).attr("id")).toBe("2");
					expect($(template[1]).attr("id")).toBe("2");
				});
			});
			
			
		});
		
	
	});

});