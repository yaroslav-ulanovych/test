Backbone.Templates = {
	bind : function(template, data) {
	
		// if the template consists of several nodes in a sequence,
		// then bind each node separately to the same data
		if (template.length > 1) {
			template.each(function(index, item) {
				Backbone.Templates.bind($(item), data);
			});
		}
		
		//change context
		template.attr("data") && (data = data.get(template.attr("data")))
		
		if (data instanceof Backbone.Collection) {
			data.bind("reset", function() {
				
			});
			data.each(function(model) {
				template.append(Backbone.Templates.bind(this.clone(), model));
			}, template.children().detach());
			
		} else if (data instanceof Backbone.Model) {
			if (template.children().length == 0) {
				// substitute content
				var text = template.text();
				if (text[0] == "$") {
					var variable = text.substring(1);
					data.on("change:" + variable, _(function() {
						template.text(data.get(variable));
					}).tap(function(f){f.call()}));
				}
				// substitute attributes
				_(template[0].attributes).each(function(attr) {
					if (attr.value[0] == "$") {
						var variable = attr.value.substring(1);
						data.on("change:" + variable, _(function() {
							template.attr(attr.name, data.get(variable));
						}).tap(function(f)	{f.call()}));
					}
				});
				return template;
			} else {
				// recursively bind all descendant nodes to the same data
				template.children().each(function(index, node) {
					Backbone.Templates.bind($(node), data);
				});
			}
		} else {
			throw "model/collection required"
		}
	
		
		
	}
}
