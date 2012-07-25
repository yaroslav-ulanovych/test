describe("Bacbone.CollectionModel", function() {
	
	describe("the empty attribute", function() {
	
		var collection = new Backbone.Collection();
		var model = new Backbone.CollectionModel({}, {collection: collection});
	
		it("given an empty collection", function() {
			expect(collection.length).toBe(0);
		});
		
		it("then it should have the empty attribute set to true", function() {
			expect(model.get("empty")).toBe(true);
		});
		
		it("when a model is added", function() {
			collection.add({});
		});
		
		it("then the empty attribute should get false", function() {
			expect(model.get("empty")).toBe(false);
		});
		
		it("when a model is removed", function() {
			collection.remove(collection.at(0));
			expect(collection.length).toBe(0);
		});
		
		it("then the empty attribute should get true again", function() {
			expect(model.get("empty")).toBe(true);
		});
		
		it("given a non-empty collection", function() {
			collection = new Backbone.ViewCollection([{}, {}]);
			model = new Backbone.CollectionModel({}, {collection: collection});
			expect(collection.length).toBe(2);
		});
		
		it("then the empty attribute should be false", function() {
			expect(model.get("empty")).toBe(false);
		});
		
		it("when the collection is reset", function() {
			collection.reset();
			expect(collection.length).toBe(0);
		});		
		
		it("then the empty attribute should get true", function() {
			collection.reset();
			expect(model.get("empty")).toBe(true);
		});
		
	});
	
	describe("the collection attribute", function() {
		it("should be set to the collection, the model was initialized with", function() {
			var collection = new Backbone.Collection();
			var model = new Backbone.CollectionModel({}, {collection: collection});
			expect(model.get("collection")).toBe(collection);
		});
	});
	
	
});