describe("Simple examples", function() {

	beforeEach(function() {
		this.addMatchers(CustomMatchers);
	});

	it("showing an ajax spinner while fetching a model", function() {
		var model = new Backbone.Model();
		var template = $("<div><img bt-rendered='syncing'></img></div>");
		Backbone.Templates.bind(template, model);
		expect(template).not.toHaveElement("img");
		model.sync = function(method, model, options) {
			expect(template).toHaveElement("img");
			options.success();
		};
		model.fetch();
		expect(template).not.toHaveElement("img");
	});

});