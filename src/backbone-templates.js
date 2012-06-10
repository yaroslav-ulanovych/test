Backbone.Templates = {
	bind : function(template, data) {
		if (template.length > 1) throw "single node required";
		//change context
		template.attr("data") && (data = data.get(template.attr("data")))
	
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
		} else {
			
			
			// recursively bind all descendant nodes
			template.children().each(function(index, node) {
				Backbone.Templates.bind($(node), data);
			});
		}
		
	}
}
