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

	describe("fetch", function() {

		it("should call fetch on the origin model", function() {
			var model = new Backbone.Model();
			var actualThis;
			model.fetch = function() { actualThis = this; }
			var vm = new ViewModel(model);
			vm.fetch()
			expect(actualThis).toBe(model);
		});

		it("should set syncing when called", function() {
			var vm = new ViewModel(new Backbone.Model());
			vm.options.model.sync = function() {};
			vm.fetch();
			expect(vm.get("syncing")).toBe(true);
		});

		it("should reset syncing when finished.", function() {
			var vm = new ViewModel(new Backbone.Model());
			vm.options.model.sync = function(method, model, options) { options.success(); };
			vm.fetch();
			expect(vm.get("syncing")).toBe(false);
		});

		it("should reset syncing when failed.", function() {
			var vm = new ViewModel(new Backbone.Model());
			vm.options.model.sync = function(method, model, options) { options.error(); };
			vm.fetch();
			expect(vm.get("syncing")).toBe(false);
		});

	});


});