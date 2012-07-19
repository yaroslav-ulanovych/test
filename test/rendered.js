describe("Bacbone.Templates", function() {
	
	describe("rendered binding", function() {
	
		describe("having next always rendered sibling", function() {
		
			it("should", function() {
				var template = $("<span rendered='rendered'></span><span></span>");
				expect(1).toBe(0);
			});	

		});		
		
	});
	
});