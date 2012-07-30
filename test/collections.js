describe("Bacbone.Templates", function() {

	var backbonize = Backbone.Templates.Util.backbonize;
	
	describe("should render collections", function() {

		
		describe("so that the length of rendered stuff is equal to the size of the collection", function() {
			
			describe("when using as a template for an item in the collection", function() {
				
				it("a single node", function() {
					var template = $("<div data='collection'><span></span></div>");
					Backbone.Templates.bind(template, backbonize([{}, {}, {}]));
					expect(template.children("span").length).toBe(3);
				});
				
				it("a node with a nested node", function() {
					var template = $("<div data='collection'><span><p></p></span></div>");
					Backbone.Templates.bind(template, backbonize([{}, {}, {}]));
					expect(template.children("span").length).toBe(3);
				});
			
			});
			
		});
		
		it("binding templates to models", function() {
			var template = $("<div data='collection'><span>$name</span></div>");
			var collection = backbonize([{name: 1}, {name: 2}, {name: 3}]);
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

		describe("dynamically", function() {

			describe("when a model is", function() {

				describe("added", function() {

					var collection = new Backbone.Collection();
					var template = $("<div data='collection'><span>$name</span><span>$age</span></div>");
					Backbone.Templates.bind(template, collection);

					it("to the empty collection", function() {
						collection.add({name: "name1", age: "age1"});
						expect(template.children("span:nth-child(1)").text()).toBe("name1");
						expect(template.children("span:nth-child(2)").text()).toBe("age1");
					});

					it("to the beginning of the collection", function() {
						collection.add({name: "name2", age: "age2"}, {at : 0});
						expect(template.children("span:nth-child(1)").text()).toBe("name2");
						expect(template.children("span:nth-child(2)").text()).toBe("age2");
					});

					it("the end of the collection", function() {
						collection.add({name: "name3", age: "age3"});
						expect(template.children("span:nth-child(5)").text()).toBe("name3");
						expect(template.children("span:nth-child(6)").text()).toBe("age3");
					});

					it("in the middle of the collection", function() {
						collection.add({name: "name4", age: "age4"}, {at : 1});
						expect(template.children("span:nth-child(3)").text()).toBe("name4");
						expect(template.children("span:nth-child(4)").text()).toBe("age4");
					});

				});

				describe("removed", function() {

					var collection = new Backbone.Collection([{
						name : "name0",
						age : "age0"
					}, {
						name : "name1",
						age : "age1"
					}, {
						name : "name2",
						age : "age2"
					}, {
						name : "name3",
						age : "age3"
					}]);

					var template = $("<div data='collection'><span name='$name'></span><span age='$age'></span></div>");
					Backbone.Templates.bind(template, collection);

					it("from the end of the collection", function() {
						collection.remove(collection.at(3));
						expect(template.children().length).toBe(6);
						expect(template.children('span[name="name3"]').length).toBe(0);
						expect(template.children('span[age="age3"]').length).toBe(0);
					});

					it("from the middle of the collection", function() {
						collection.remove(collection.at(1));
						expect(template.children().length).toBe(4);
						expect(template.children('span[name="name1"]').length).toBe(0);
						expect(template.children('span[age="age1"]').length).toBe(0);
					});

					it("from the beginning of the collection", function() {
						collection.remove(collection.at(0));
						expect(template.children().length).toBe(2);
						expect(template.children('span[name="name0"]').length).toBe(0);
						expect(template.children('span[age="age0"]').length).toBe(0);
					});

					it("from a single item collection", function() {
						collection.remove(collection.at(0));
						expect(template.children().length).toBe(0);
					});

				});



			});

			describe("when the collection is reset", function() {

				var collection = new Backbone.Collection();
				var template = $("<div data='collection'><span>$name</span><span>$age</span></div>");
				Backbone.Templates.bind(template, collection);

				it("to the populated state", function() {
					collection.reset([{name : "name0", age : "age0"}, {name : "name1", age : "age1"}]);
					expect(template.children().length).toBe(4);
					expect(template.children("span:nth-child(1)").text()).toBe("name0");
					expect(template.children("span:nth-child(2)").text()).toBe("age0");
					expect(template.children("span:nth-child(3)").text()).toBe("name1");
					expect(template.children("span:nth-child(4)").text()).toBe("age1");
				});

				it("to the empty state", function() {
					collection.reset();
					expect(template.children().length).toBe(0);
				});

			});

		});
		
	});

});