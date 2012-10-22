describe("Backbone.Templates", function() {

	describe("input event binding", function() {

		describe("on check boxes", function() {

			describe("should update the value of the input element", function() {
				var template1 = $("<input type='checkbox' bt-data='a' bt-input='value'>");
				var template2 = $("<input type='checkbox' bt-data='b' bt-input='value'>");

				var model = new Backbone.Model({
					a : false,
					b : true
				});

				Backbone.Templates.bind(template1, model);
				Backbone.Templates.bind(template2, model);

				it("immediately after binding", function() {
					expect(template1.is(":checked")).toBe(false);
					expect(template2.is(":checked")).toBe(true);
				});

				it("when model's property changes", function() {
					model.set({a : true, b : false});
					expect(template1.is(":checked")).toBe(true);
					expect(template2.is(":checked")).toBe(false);
				});
			});

			it("should update the model on the change event>", function() {
				var template = $("<input type='checkbox' bt-data='a' bt-input='value'>");
				var model = new Backbone.Model({a : false});
				Backbone.Templates.bind(template, model);

				template.attr("checked", true);
				template.trigger("change");
				expect(model.get("a")).toBe(true);

				template.attr("checked", false);
				template.trigger("change");
				expect(model.get("a")).toBe(false);
			});


		});

		describe("should work with", function() {
			describe("textfield elements", function() {
				it("should update the model on the input event", function() {
					var template = $("<input bt-data='input' type='text' bt-input='value'>");
					var model = new Backbone.Model({input : ""});
					Backbone.Templates.bind(template, model);
					template.val("qw");
					template.trigger("input");
					expect(model.get("input")).toBe("qw");
				});

				describe("should update the value of the input element", function() {
					var template = $("<input bt-data='input' type='text' bt-input='value'>");
					var model = new Backbone.Model({input : "123"});
					Backbone.Templates.bind(template, model);

					it("immediately after binding", function() {
						expect(template.val()).toBe("123");
					});

					it("when model's property changes", function() {
						model.set("input", "456")
						expect(template.val()).toBe("456");
					});
				});
			});

			describe("select elements", function() {

				describe("selected option should match field's value", function() {
					var template = $("<select bt-data='a' bt-input='value'><option>1</option><option>2</option></select>")
					var model = new Backbone.Model({a : "2"});
					Backbone.Templates.bind(template, model);

					it("immediately after binding", function() {
						expect(template.val()).toBe("2");
					});

					it("and after model changes", function() {
						template.val("1");
						template.trigger("change");
						expect(model.get("a")).toBe("1");
					});
				});

				describe("an exception should be thrown if there is no option matching field's value", function() {
					it("on the moment of binding", function() {
						var template = $("<select bt-data='a' bt-input='value'><option>1</option><option>2</option></select>")
						var model = new Backbone.Model({a : "3"});
						expect(function() {
							Backbone.Templates.bind(template, model);
						}).toThrow();
					});

					it("and later", function() {
						var template = $("<select bt-data='a' bt-input='value'><option>1</option><option>2</option></select>")
						var model = new Backbone.Model({a : "1"});
						Backbone.Templates.bind(template, model);
						expect(function() {
							model.set("a", "3");
						}).toThrow();
					});
				});

				
			});

		});

		

	});

});