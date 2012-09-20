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
				pattern : {negated : false, callable : false},
				expect : function(accessor, model, value) { expect(accessor.get(model)).toBe(value); },
				message : "return that attribute"
			}, {
				pattern : {negated : true, attributeType: "not boolean"},
				expect : function(accessor, model) { expect(function(){accessor.get(model);}).toThrow(Backbone.Templates.Exceptions.NotBooleanAttribute); },
				message : "throw a NotBooleanAttribute exception"
			}, {
				pattern : {negated : true, attributeType: "boolean"},
				expect : function(accessor, model, value) { expect(accessor.get(model)).toBe(!value); },
				message : "return that attribute negated"
			}];

			_.each(_.product(valuesFor.negated, valuesFor.callable, valuesFor.attributeType, valuesFor.model), _.bind(Function.prototype.apply, function(negated, callable, attributeType, model) {
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
				});
			}, undefined));
		});

		describe("set", function() {
			var models = {
				modelWithMethod : function() { return new Backbone.Model({}) },
				modelWithoutMethod : function() { return new Backbone.Model() },
				viewModelWithMethod : function() { return new ViewModel(new Backbone.Model({}))}
			};

			var valuesFor = {
				negated : [false, true],
				callable : [false, true],
				model : ["modelWithMethod", "modelWithoutMethod", "viewModelWithMethod"]
			};

			var expectations = [{
				pattern : {negated : false, callable : true, model : "modelWithMethod"},
				expect : function(accessor, model) {
					var result = [];
					model.method = function() {
						result[0] = this;
						result[1] = Array.prototype.slice.call(arguments);
					};
					accessor.set(model, 1, 2, 3);
					expect(result[0]).toBe(model);
					expect(result[1]).toEqual([1, 2, 3]);
				},
				message : "call the method on the model with proper context and arguments"
			}, {
				pattern : {negated : false, callable : true, model : "modelWithoutMethod"},
				expect : function(accessor, model) {
					expect(function() {
						accessor.set(model, 1, 2, 3);
					}).toThrow(Backbone.Templates.Exceptions.NoSuchMethod);
				},
				message : "throw a NoSuchMethod exception"
			}, {
				pattern : {negated : false, callable : true, model : "viewModelWithMethod"},
				expect : function(accessor, viewModel) {
					var result = [];
					var model = viewModel.options.model;
					model.method = function() {
						result[0] = this;
						result[1] = Array.prototype.slice.call(arguments);
					};
					accessor.set(viewModel, 1, 2, 3);
					expect(result[0]).toBe(model);
					expect(result[1]).toEqual([1, 2, 3]);
				},
				message : "call the method on the model with proper context and arguments"
			}];

			_.each(_.product(valuesFor.negated, valuesFor.callable, valuesFor.model), _.bind(Function.prototype.apply, function(negated, callable, model) {
				var testFound = _.any(expectations, function(expectation) {
					var current = {
						negated : negated,
						callable : callable,
						model : model
					};
					if (_.isEqual(_.extend({}, current, expectation.pattern), current)) {
						var testName = "";
						testName = testName + (negated ? "negated " : "");
						testName = testName + (callable ? "callable " : "");
						testName = testName + " attribute from ";
						testName = testName + model + " ";
						testName = testName + "should " + expectation.message;
						it(testName, function() {
							var accessor = new Accessor(negated, "method", callable);
							expectation.expect(accessor, models[model]());
						});
						return true;
					};
					return false;
				});
			}, undefined));
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