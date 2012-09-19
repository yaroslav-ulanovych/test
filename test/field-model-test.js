describe("FieldModel", function() {
	var ViewModel = Backbone.Templates.Internals.ViewModel;
	var ViewCollection = Backbone.Templates.Internals.ViewCollection;
	var FieldModel = Backbone.Templates.Internals.FieldModel;



	describe("should have the value attribute set to the value of model's field", function() {
		var model = new Backbone.Model({a : 123})
		var fm = new FieldModel("a", model);

		it("immediately after creation", function() {
			expect(fm.get("value")).toBe(123);
		});

		it("and later", function() {
			model.set("a", 345)
			expect(fm.get("value")).toBe(345);
		});
	});


	it("should update the model when the value attribute is updated", function () {
		var model = new Backbone.Model();
		var fm = new FieldModel("a", model);
		fm.set("value", 123);
		expect(model.get("a")).toBe(123);
	});

	describe("should wrap values with proper wrappers", function() {
		it("usual values should be left untouched", function() {
			var fm = new FieldModel("a", new Backbone.Model({a : 123}));
			expect(fm.get("value")).toBe(123);
		});
	});

	it("should save", function() {
		
	});

});