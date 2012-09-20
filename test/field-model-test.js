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

	describe("scenario", function() {
		var model = new Backbone.Model({a : 123});
		var fm = new FieldModel("a", model);

		it("initially", function() {});

		it("synced attribute should be true", function() {
			expect(fm.get("synced")).toBe(true);
		});

		it("original attribute should be set to field's value", function() {
			expect(fm.get("original")).toBe(123);
		});

		it("when the field is changed", function() {
			model.set("a", 456);
		});

		it("synced attribute should get false", function() {
			expect(fm.get("value")).toBe(456);
			expect(fm.get("synced")).toBe(false);
		});

		it("when the field is restored to the original value", function() {
			model.set("a", 123);
		});

		it("synced attribute should get true", function() {
			expect(fm.get("synced")).toBe(true);
		});

		it("after successful save", function() {
			model.set("a", 789);
			var sync = Backbone.sync;
			Backbone.sync = jasmine.createSpy("Backbone.sync").andCallFake(function(method, model, options) {
				options.success();
			});
			fm.save();
			Backbone.sync = sync;
		});

		it("synced attribute should get true", function() {
			expect(fm.get("synced")).toBe(true);
		});

		it("original attribute should be set to the new value", function() {
			expect(fm.get("original")).toBe(789);
		});

	});


	describe("cancel", function() {
		it("should restore model's field to the original state", function() {
			var model = new Backbone.Model({a : 123});
			var fm = new FieldModel("a", model);
			model.set("a", 456);
			fm.cancel();
			expect(model.get("a")).toBe(123);
		});
	});

});