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