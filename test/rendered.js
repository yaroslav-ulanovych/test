describe("Bacbone.Templates", function() {

	var backbonize = Backbone.Templates.Util.backbonize;
	
	describe("rendered binding", function() {
	
		describe("having next always rendered sibling", function() {
		
			//var template = $("<div><span id='span1' rendered='rendered1'></span><span id='span2' rendered='rendered2'></span></div>");
		
			it("rename me", function() {
				var template = $("<div><span id='span1' rendered='rendered1'></span><span id='span2' rendered='rendered2'></span></div>");
				Backbone.Templates.bind(template, backbonize({rendered1 : true, rendered2 : true}));
				expect(template.find("#span1").length).toBe(1);
				expect(template.find("#span2").length).toBe(1);
				
				template = $("<div><span id='span1' rendered='rendered1'></span><span id='span2' rendered='rendered2'></span></div>");
				Backbone.Templates.bind(template, backbonize({rendered1 : true, rendered2 : false}));
				expect(template.find("#span1").length).toBe(1);
				expect(template.find("#span2").length).toBe(0);
				
				template = $("<div><span id='span1' rendered='rendered1'></span><span id='span2' rendered='rendered2'></span></div>");
				Backbone.Templates.bind(template, backbonize({rendered1 : false, rendered2 : true}));
				expect(template.find("#span1").length).toBe(0);
				expect(template.find("#span2").length).toBe(1);
				
				template = $("<div><span id='span1' rendered='rendered1'></span><span id='span2' rendered='rendered2'></span></div>");
				Backbone.Templates.bind(template, backbonize({rendered1 : false, rendered2 : false}));
				expect(template.find("#span1").length).toBe(0);
				expect(template.find("#span2").length).toBe(0);
				
				expect(1).toBe(1);
			});	

		});		
		
	});
	
});