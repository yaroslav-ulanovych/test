describe("Backbone.Templates", function() {
	
	describe("Accessor", function() {
	
		var Accessor = Backbone.Templates.Internals.Accessor;
		var ViewModel = Backbone.Templates.Internals.ViewModel;
	
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



		(function() {



		})();

		describe("get", function() {

			var models = {
				usualModel : function(value) { return new Backbone.Model({fieldName: value}) },
				emptyModel : function() { return new Backbone.Model() },
				viewModel : function(value) { return new ViewModel(new Backbone.Model({fieldName: value}))}
			};

			var valuesFor = {
				negated : [false, true],
				callable : [false, true],
				model : ["usualModel", "emptyModel", "viewModel"],
				attributeType : ["boolean", "not boolean"]
			};

			var expectations = [{
				pattern : {model : "emptyModel"},
				expect : function(accessor, model) { expect(function(){accessor.get(model);}).toThrow(Backbone.Templates.Exceptions.NoSuchAttribute); },
				message : "throw a NoSuchAttribute exception"
			}, {
				pattern : {negated : true, attributeType: "not boolean"},
				expect : function(accessor, model) { expect(function(){accessor.get(model);}).toThrow(Backbone.Templates.Exceptions.NotBooleanAttribute); },
				message : "throw a NotBooleanAttribute exception"
			}, {
				pattern : {negated : true, attributeType: "boolean"},
				expect : function(accessor, model, value) { expect(accessor.get(model)).toBe(!value); },
				message : "return that attribute negated"
			}];


			_.each(valuesFor.negated, function(negated) {
				_.each(valuesFor.callable, function(callable) {
					_.each(valuesFor.attributeType, function(attributeType) {
						_.each(valuesFor.model, function(model) {
							_.each(attributeType == "boolean" ? [false, true] : [123], function(value) {
								var testFound = _.any(expectations, function(expectation) {
									var current = {
										negated : negated,
										callable : callable,
										attributeType : attributeType,
										model : model,
										value : value
									};
									if (_.isEqual(_.extend({}, current, expectation.pattern), current)) {
										var testName = "";
										testName = testName + (negated ? "negated " : "");
										testName = testName + (callable ? "callable " : "");
										testName = testName + "attribute of ";
										testName = testName + attributeType + " type from ";
										testName = testName + model + " ";
										testName = testName + "with " + value + " value should " + expectation.message;
										var accessor = new Accessor(negated, "fieldName", callable);
										it(testName, function() {
											expectation.expect(accessor, models[model](value), value);
										});
										return true;
									};
									return false;
								});
								if (!testFound) {
									it("not exhaustive match", function() {expect(1).toBe(2)});
								}
							});
						});
					});
				});
			});
		});

/*
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
*/
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