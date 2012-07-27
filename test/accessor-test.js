describe("Backbone.Templates", function() {
	
	describe("Accessor", function() {
	
		var Accessor = Backbone.Templates.Internals.Accessor;
	
		describe("parse", function() {
		
			var exception = Accessor.parse.exception;
			
			it("should work", function() {
				var data = [
					// single word with an optional negation is ok
					["abc",  [false, "abc"]],
					["!abc", [true,  "abc"]],
					["abc()",  [false, "abc", true]],
					["!abc()", [true,  "abc", true]],

					// whitespaces anywhere are fine
					["  abc",   [false, "abc"]],
					["abc  ",   [false, "abc"]],
					["  abc  ", [false, "abc"]],
					["  !abc",     [true, "abc"]],
					["!abc  ",     [true, "abc"]],
					["  !abc  ",   [true, "abc"]],
					["!  abc",     [true, "abc"]],
					["  !  abc",   [true, "abc"]],
					["!  abc  ",   [true, "abc"]],
					["  !  abc  ", [true, "abc"]],
					
					// empty strings aren't allowed
					["",   exception],
					["  ", exception],
					
					// special characters aren't allowed
					["#$",    exception],
					["sdf#$", exception],
					["#$sdf", exception],
					
					// several attributes aren't allowed
					["abc a",     exception],
					["  abc a",   exception],
					["abc a  ",   exception],
					["  abc a  ", exception]
				];
				
				_.each(data, function(item) {
					if (item[1] === Accessor.parse.exception) {
						expect(function() {Accessor.parse(item[0])}).toThrow(Accessor.parse.exception);
					} else {
						expect(Accessor.parse(item[0])).toEqual(new Accessor(item[1][0], item[1][1], item[1][2] === true));
					}
				});
			});
		
		});
		
		describe("get", function() {
		
			describe("attribute", function() {
			
				var accessor = new Accessor(false, "a", false);
			
				it("should return that attribute", function() {
					var model = new Backbone.Model({a: "asd"});
					expect(accessor.get(model)).toBe("asd");
				});
				
				it("or throw an exception if the model doesn't have that attribute", function() {
					expect(function() {
						accessor.get(new Backbone.Model())
					}).toThrow(Backbone.Templates.Exceptions.NoSuchAttribute);
				});
			});	
			
			describe("negated attribute", function() {
			
				var accessor = new Accessor(true, "a", false);
			
				it("should return that attribute negated", function() {
					expect(accessor.get(new Backbone.Model({a: false}))).toBe(true);
					expect(accessor.get(new Backbone.Model({a: true}))).toBe(false);
				});
				
				it("or throw an exception if the attribute isn't a boolean", function() {
					expect(function() {
						accessor.get(new Backbone.Model({a: ""}))
					}).toThrow(Backbone.Templates.Exceptions.NotBooleanAttribute);
				});
			});
			
		});
		
		describe("set", function() {
			describe("attribute", function() {
				it("should update the model with the value", function() {
					var model = new Backbone.Model();
					var accessor = new Accessor(false, "a", false);
					accessor.set(model, "asd");
					expect(model.get("a")).toBe("asd");
				});
			});
			
			describe("callable attribute", function() {
				it("should call the method on the model with proper context and arguments", function() {
					var model = new Backbone.Model();
					var result = [];
					model.method = function() {
						result[0] = this;
						result[1] = Array.prototype.slice.call(arguments);
					};
					var accessor = new Accessor(false, "method", true);
					accessor.set(model, 1, 2, 3);
					expect(result[0]).toBe(model);
					expect(result[1]).toEqual([1, 2, 3]);
				});				
				
				it("or throw an exception if the model doesn't have such method", function() {
					var model = new Backbone.Model();
					var accessor = new Accessor(false, "method", true);
					expect(function() {
						accessor.set(model, 1, 2, 3);
					}).toThrow(Backbone.Templates.Exceptions.NoSuchMethod);
				});
			});
		});
		
		describe("bind", function() {
			it("should pass the result of the get method to the handler", function() {
				var model = new Backbone.Model({a: "1"});
				var accessor = new Accessor(false, "a", false);
				var handler = jasmine.createSpy("handler");
				accessor.bind(model, handler);
				accessor.get = function() {return 123};
				model.set("a", "2");
				expect(handler).toHaveBeenCalledWith(123);
			});
		});
	
	});

});