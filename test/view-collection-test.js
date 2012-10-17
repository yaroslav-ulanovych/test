describe("Backbone.ViewCollection", function() {

	var ViewModel = Backbone.Templates.Internals.ViewModel;
	var ViewCollection = Backbone.Templates.Internals.ViewCollection;

	var collection = new Backbone.Collection([{id : 1}, {id : 2}, {id : 3}]);
	var vc;

	function check(length) {
		it("should have proper length", function() {
			expect(vc.length).toBe(length);
		});

		it("all models should be view models", function() {
			vc.each(function(model) {
				expect(model instanceof ViewModel).toBe(true);
			});
		});
		
	}

	it("when is created over a non-empty collection", function() {
		vc = new ViewCollection(collection);
	});

	check(3);

	it("when a model is removed", function() {
		collection.remove(collection.get(2));
	});

	check(2);

	it("when a model is added", function() {
		collection.add([{id: 4}]);
	});

	check(3);

	it("when collection is reset to the empty state", function() {
		collection.reset([]);
	});

	check(0);

	it("when collection is reset to the empty state", function() {
		collection.reset({id: 5});
	});

	check(1);

});