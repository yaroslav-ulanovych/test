(function() {
	if (Backbone.ViewModel) throw "Backbone.ViewModel already exists";

	Backbone.ViewModel = Backbone.Model.extend({
		initialize : function(attrs, options) {
			
		}
	});
})();