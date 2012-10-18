describe("Bacbone.ViewModel", function() {

	var ViewModel = Backbone.Templates.Internals.ViewModel;
	var ViewCollection = Backbone.Templates.Internals.ViewCollection;
	var FieldModel = Backbone.Templates.Internals.FieldModel;

	it("should create field models for each attribute", function() {
		var model = new Backbone.Model({
			a : 123,
			b : 456
		});
		
		var vm = new ViewModel(model);

		expect(vm.get("a").options.field).toBe("a");
		expect(vm.get("b").options.field).toBe("b");
	});

	it("should have the model it was created with in it's options", function() {
		var model = new Backbone.Model();
		var vm = new ViewModel(model);
		expect(vm.options.model).toBe(model);
	});

	it("shouldn't have id", function() {
		expect((new ViewModel(new Backbone.Model({id : 1})).id)).toBe(undefined);
	});

	it("should be not syncing initially", function() {
		expect((new ViewModel(new Backbone.Model()).get("syncing"))).toBe(false);
	});

	describe("gives an ability from a model to change attributes of field models using colon notation by substituting the set method", function() {
		describe("original set should be used when", function() {

			it("several attributes are set at once", function() {
				var model = new Backbone.Model();
				var actualThis;
				var setSpy = jasmine.createSpy("set").andCallFake(function() { actualThis = this; return 123; });
				model.set = setSpy;
				var vm = new ViewModel(model);
				var fm = vm.get("a");
				var obj = {a : 1}
				expect(model.set(obj)).toBe(123);
				expect(actualThis).toBe(model);
				expect(setSpy).toHaveBeenCalledWith(obj)
			});

			it("there is no colon in the attribute name", function() {
				var model = new Backbone.Model();
				var actualThis;
				var setSpy = jasmine.createSpy("set").andCallFake(function() { actualThis = this; return 123; });
				model.set = setSpy;
				var vm = new ViewModel(model);
				var fm = vm.get("a");
				expect(model.set("abc", true)).toBe(123);
				expect(actualThis).toBe(model);
				expect(setSpy).toHaveBeenCalledWith("abc", true);
			});
		});

		it("it does", function() {
			var model = new Backbone.Model();
			var vm = new ViewModel(model);
			var fm = vm.get("a");
			model.set("a:syncing", true);
			expect(fm.get("syncing")).toBe(true);
		});
		
	});

	describe("should substitute the fetch method of the original model so that", function() {

		it("original fetch is still called", function() {
			var model = new Backbone.Model();
			var originalFetch = jasmine.createSpy("original fetch");
			model.fetch = originalFetch;
			new ViewModel(model);
			model.fetch()
			expect(originalFetch).toHaveBeenCalled;
		});

		it("view model gets syncing when fethc is called", function() {
			var model = new Backbone.Model();
			var vm = new ViewModel(model);
			model.sync = function() {};
			model.fetch();
			expect(vm.get("syncing")).toBe(true);
		});

		it("should reset syncing when finished", function() {
			var model = new Backbone.Model();
			var vm = new ViewModel(new Backbone.Model());
			model.sync = function(method, model, options) { options.success(); };
			model.fetch();
			expect(vm.get("syncing")).toBe(false);
		});

		it("should reset syncing when failed", function() {
			var model = new Backbone.Model();
			var vm = new ViewModel(model);
			model.sync = function(method, model, options) { options.error(); };
			model.fetch();
			expect(vm.get("syncing")).toBe(false);
		});

	});




});