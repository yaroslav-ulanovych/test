Backbone.Templates = {
	bind : (function() {
		
		return function(template, data, options) {
		
			var callee = arguments.callee;
			
			// simple log function
			var log = (options && options.debug && function() { console.log.apply(console, arguments) }) || function(){};
		
			
			
			// if the template consists of several nodes in a sequence,
			// then bind each node separately to the same data
			if (template.length > 1) {
				template.each(function(index, item) {
					callee($(item), data, options);
				});
			}
			
			// change context
			template.attr("data") && (data = data.get(template.attr("data")))
			
			if (data instanceof Backbone.Collection) {
				data.each(function(model) {
					var res = callee(this.clone(), model, options);
					template.append(res);
				}, template.children().detach());
				
			} else if (data instanceof Backbone.Model) {
				var model = data;
				
				// substitute attributes
				_(template[0].attributes).each(function(attr) {
					log("attr", attr.name, attr.value);
					if (attr.value[0] == "$") {
						var variable = attr.value.substring(1);
						model.on("change:" + variable, _(function() {
							template.attr(attr.name, model.get(variable));
						}).tap(function(f)	{f.call()}));
					} else if (attr.value.indexOf("?") != -1) {
						var parsed = /(.*?|)(\w+)(\s*\?\s*)(\w+)(\s*\:\s*)(\w+)(.*)/.exec(attr.value)
						if (parsed) {
							var beginning = parsed[1];
							var variable = parsed[2];
							var arg1 = parsed[4];
							var arg2 = parsed[6];
							var ending = parsed[7];
							model.on("change:" + variable, _(function() {
								template.attr(attr.name, beginning + (model.get(variable) ? arg1 : arg2) + ending);
							}).tap(function(f)	{f.call()}));
						}
					} else if (attr.name == "hovered") {
						log("attr bound")
						model.set(attr.value, false);
						template.mouseover(function() {model.set(attr.value, true);});
						template.mouseout(function() {model.set(attr.value, false);});
					}
				});
				
				if (template.children().length == 0) {
					// substitute content
					var text = template.text();
					if (text[0] == "$") {
						log("bound");
						var variable = text.substring(1);
						model.on("change:" + variable, _(function() {
							template.text(model.get(variable));
						}).tap(function(f){f.call()}));
					}
					return template;
				} else {
					// recursively bind all descendant nodes to the same data
					template.children().each(function(index, node) {
						callee($(node), data, options);
					});
					return template;
				}
			} else {
				throw "model/collection required"
			}
			
		}
	})()
}
