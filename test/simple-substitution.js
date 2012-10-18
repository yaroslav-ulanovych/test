describe("Bacbone.Templates", function() {

	var backbonize = Backbone.Templates.Util.backbonize;

	describe("should substitute", function() {
		describe("content placeholders", function() {
			describe("initially", function() {
				it("in single nodes", function() {
					var template = $("<span bt-data='name'>$value</span>");
					Backbone.Templates.bind(template, backbonize({name: "Jack"}));
					expect(template.text()).toBe("Jack");
				});
				
				it("in child nodes", function() {
					var template = $("<span bt-data='name'><div>$value</div></span>");
					Backbone.Templates.bind(template, backbonize({name: "Jack"}));
					expect(template.children("div").text()).toBe("Jack");
				});
				
				it("in sibling nodes", function() {
					var template = $("<span bt-data='name'>$value</span><span bt-data='name'>$value</span>");
					Backbone.Templates.bind(template, backbonize({name: "Jack"}));
					expect($(template[0]).text()).toBe("Jack");
					expect($(template[1]).text()).toBe("Jack");
				});
			});

			describe("dynamically", function() {
				it("in single nodes", function() {
					var template = $("<span bt-data='name'>$value</span>");
					var model = backbonize({name: "Jack"});
					Backbone.Templates.bind(template, model);
					model.set({name: "John"})
					expect(template.text()).toBe("John");
				});
				
				it("in child nodes", function() {
					var template = $("<span bt-data='name'><div>$value</div></span>");
					var model = backbonize({name: "Jack"});
					Backbone.Templates.bind(template, model);
					model.set({name: "John"});
					expect(template.children("div").text()).toBe("John");
				});
				
				it("in sibling nodes", function() {
					var template = $("<span bt-data='name'>$value</span><span bt-data='name'>$value</span>");
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
					var template = $("<span bt-data='id' id='$value'>");
					Backbone.Templates.bind(template, backbonize({id: "1"}));
					expect(template.attr("id")).toBe("1");
				});
				
				it("in child nodes", function() {
					var template = $("<div bt-data='id'><span id='$value'></span></div>");
					Backbone.Templates.bind(template, backbonize({id: "1"}));
					expect(template.children("span").attr("id")).toBe("1");
				});
				
				it("in sibling nodes", function() {
					var template = $("<span bt-data='id' id='$value'></span><span bt-data='id' id='$value'></span>");
					Backbone.Templates.bind(template, backbonize({id: "1"}));
					expect($(template[0]).attr("id")).toBe("1");
					expect($(template[1]).attr("id")).toBe("1");
				});
			});
			
			describe("dynamically", function() {
				it("in single nodes", function() {
					var template = $("<span bt-data='id' id='$value'>");
					var model = backbonize({id: "1"});
					Backbone.Templates.bind(template, model);
					model.set({id: 2});
					expect(template.attr("id")).toBe("2");
				});
				
				it("in child nodes", function() {
					var template = $("<div bt-data='id'><span id='$value'></span></div>");
					var model = backbonize({id: "1"});
					Backbone.Templates.bind(template, model);
					model.set({id: 2});
					expect(template.children("span").attr("id")).toBe("2");
				});
				
				it("in sibling nodes", function() {
					var template = $("<span bt-data='id' id='$value'></span><span bt-data='id' id='$value'></span>");
					var model = backbonize({id: "1"});
					Backbone.Templates.bind(template, model);
					model.set({id: 2});
					expect($(template[0]).attr("id")).toBe("2");
					expect($(template[1]).attr("id")).toBe("2");
				});
			});
			
			it("with the value of model's method", function() {
				var methodResult = "abc";
				var model = new Backbone.Model();
				model.method = function() { return methodResult; }
				var template = $("<a href='$method()'></a>");
				Backbone.Templates.bind(template, model);
				expect(template.attr("href")).toBe(methodResult);
			});
			
		});
		
	
	});

});