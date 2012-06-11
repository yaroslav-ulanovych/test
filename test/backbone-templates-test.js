describe("Bacbone.Templates", function() {

	function backbonize(obj) {
		var callee = arguments.callee;
		if (_.isArray(obj)) {
			return new Backbone.Collection(_(obj).map(function(item) {
				return callee(item);
			}));
		} else if (_.isObject(obj)) {
			var result = {};
			_(obj).chain().keys().each(function(key) {
				result[key] = callee(obj[key]);
			});
			return new Backbone.Model(result);
		} else {
			return obj;
		}
	}

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
			
			it("in sibling nodes", function() {
				var template = $("<span>$name</span><span>$name</span>");
				var model = new Backbone.Model({name: "Jack"});
				Backbone.Templates.bind(template, model);
				expect($(template[0]).text()).toBe("Jack");
				expect($(template[1]).text()).toBe("Jack");
				model.set({name: "John"});
				expect($(template[0]).text()).toBe("John");
				expect($(template[1]).text()).toBe("John");
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
			
			it("in sibling nodes", function() {
				var template = $("<span id='$id'></span><span id='$id'></span>");
				var model = new Backbone.Model({id: "1"});
				Backbone.Templates.bind(template, model);
				expect($(template[0]).attr("id")).toBe("1");
				expect($(template[1]).attr("id")).toBe("1");
				model.set({id: 2});
				expect($(template[0]).attr("id")).toBe("2");
				expect($(template[1]).attr("id")).toBe("2");
			});
		});
		
	
	});
	
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
			var template = $("<div><ul data='cars'><li>$color</li></ul></div>");
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

		
	describe("while rendering collections", function() {
		it("should bind templates to models", function() {
			var template = $("<div><span>$name</span></div>");
			var collection = new Backbone.Collection([{name: 1}, {name: 2}, {name: 3}]);
			Backbone.Templates.bind(template, collection);
			expect(template.children("span:nth-child(1)").text()).toBe("1");
			expect(template.children("span:nth-child(2)").text()).toBe("2");
			expect(template.children("span:nth-child(3)").text()).toBe("3");
			collection.at(0).set({name: 4});
			collection.at(1).set({name: 5});
			collection.at(2).set({name: 6});
			expect(template.children("span:nth-child(1)").text()).toBe("4");
			expect(template.children("span:nth-child(2)").text()).toBe("5");
			expect(template.children("span:nth-child(3)").text()).toBe("6");
		});
		
		describe("should react on add event", function() {
			it("when adding to the end", function() {
				var template = $("<div><span>$name</span></div>");
				var collection = backbonize([{name: 1}, {name: 2}]);
				Backbone.Templates.bind(template, collection);
				collection.add({name: 3});
				expect(template.children("span:nth-child(3)").text()).toBe("3");
			});
		});
	});
	
	xit("should render complex templates with nested models and collections", function() {
	});
	
});