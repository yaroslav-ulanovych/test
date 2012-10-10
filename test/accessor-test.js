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
				"model with a field" : function(value) { return new Backbone.Model({fieldName: value}); },
				"model without a field" : function() { return new Backbone.Model(); },
				"model with a method" : function() { var model = new Backbone.Model(); model.method = function() {return "abc"}; return model; },
				"model without a method" : function() { return new Backbone.Model(); }
			};

			var dataFor = {
				negated : [false, true],
				callable : [false],
				model : ["model with a field", "model without a field"],
				attributeType : ["boolean", "not boolean"],
				viewModel : [false, true]
			};

			var data2For = {
				negated : [false],
				callable : [true],
				model : ["model with a method", "model without a method"],
				attributeType : ["any"],
				viewModel : [false, true]
			};

			var expectations = [{
				pattern : {callable: false, model : "model without a field"},
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
			}, {
				pattern : {callable : true, model : "model without a method"},
				expect : function(accessor, model) { expect(function(){accessor.get(model);}).toThrow(Backbone.Templates.Exceptions.NoSuchMethod); },
				message : "throw a NoSuchMethod exception"
			}, {
				pattern : {callable : true, model : "model with a method"},
				expect : function(accessor, model) { expect(accessor.get(model)).toBe("abc"); },
				message : "return the result of that method"
			}];



			var allPossibleDataSets = _.union(
				_.product(dataFor.negated, dataFor.callable, dataFor.attributeType, dataFor.model, dataFor.viewModel),
				_.product(data2For.negated, data2For.callable, data2For.attributeType, data2For.model, data2For.viewModel)
			);

			_.each(allPossibleDataSets, _.bind(Function.prototype.apply, function(negated, callable, attributeType, model, viewModel) {
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
							testName = testName + "attribute ";
							if (!callable) testName = testName + "of " + attributeType + " type ";
							testName = testName + "from a ";
							if (viewModel) testName = testName + "view model over a ";
							testName = testName + model + " ";
							if (!callable) testName = testName + "with " + value + " value ";
							testName = testName + "should " + expectation.message;
							var accessor = new Accessor(negated, callable ? "method" : "fieldName", callable);
							it(testName, function() {
								var instantiatedModel = models[model](value)
								var modelToPassToTest = viewModel ? new ViewModel(instantiatedModel) : instantiatedModel
								expectation.expect(accessor, modelToPassToTest, value);
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

			it("should listen to all change events if the accessor is callable", function () {
				var model = new Backbone.Model();
				var accessor = new Accessor(false, "a", true);
				accessor.get = function() {return "abc"; }
				var handler = jasmine.createSpy("handler");
				accessor.bind(model, handler);
				model.set("b", "2");
				expect(handler.callCount).toBe(2);
			});
		});

	});

});