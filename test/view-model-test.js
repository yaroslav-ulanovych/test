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


});