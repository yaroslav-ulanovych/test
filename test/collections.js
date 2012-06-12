describe("Bacbone.Templates", function() {
	
	describe("should render collection", function() {
		
		describe("so that the length of rendered stuff is equal to the size of the collection", function() {
			
			describe("when using as a template for an item in the collection", function() {
				
				it("a single node", function() {
					var template = $("<div><span></span></div>");
					Backbone.Templates.bind(template, backbonize([{}, {}, {}]));
					expect(template.children("span").length).toBe(3);
				});
				
				it("a node with a nested node", function() {
					var template = $("<div><span><p></p></span></div>");
					Backbone.Templates.bind(template, backbonize([{}, {}, {}]));
					expect(template.children("span").length).toBe(3);
				});
			
			});
			
		});
		
		it("binding templates to models", function() {
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
		
	});

});