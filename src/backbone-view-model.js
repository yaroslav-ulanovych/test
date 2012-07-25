(function() {
	if (Backbone.ViewModel) throw "Backbone.ViewModel already exists";

	Backbone.ViewModel = Backbone.Model.extend({
		initialize : function(attrs, options) {
			
		},
		set : function(attributes, options) {
			// set attributes to the model
			var valid = this.model.set.apply(this.model, arguments);
			// set the same attributes to the view model
			Backbone.Model.prototype.set.apply(this, arguments);
			// set additional attributes to the view model
			Backbone.Model.prototype.set.call(this, { valid : valid });

			return valid;
		}
	});
	
	Backbone.ViewCollection = Backbone.Collection.extend({
		//model : Backbone.ViewModel,

		constructor : function(collection, options) {
			this.viewModel = new Backbone.Model({
				empty : this.length === 0
			});
			
			this.bind("add", function(model, collection, options) {
				collection.viewModel.set("empty", false);
			});			
			this.bind("remove", function(model, collection, options) {
				collection.viewModel.set("empty", collection.length === 0);
			});
			this.bind("reset", function(collection, options) {
				collection.viewModel.set("empty", collection.length === 0);
			});
			
			Backbone.Collection.apply(this, arguments);
			
			this.viewModel.set({empty : this.length === 0});
		}
	});
	
	Backbone.CollectionModel = Backbone.Model.extend({
		initialize : function(attrs, options) {
		
			var collection = options.collection;
			
			collection.bind("add", function(model, collection, options) {
				this.set("empty", false);
			}, this);			
			
			collection.bind("remove", function(model, collection, options) {
				this.set("empty", collection.length === 0);
			}, this);
			
			collection.bind("reset", function(collection, options) {
				this.set("empty", collection.length === 0);
			}, this);
			
			this.set({
				empty : collection.length === 0,
				collection : collection
			});
		}
	});
	
})();