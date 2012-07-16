(function() {

	Backbone.Templates = {

		bind : (function() {
		
			// real bind function
			function bind(template, data, state) {
						
				var recursively = function(template, data) {
					var stateCopy = _.clone(state);
					stateCopy.level = stateCopy.level + 1;
					return bind.call(this, template, data, stateCopy);
				};
				
				function log() {
					var pre = "";
					_.times(state.level, function() {pre = pre + "  "});
					arguments[0] = pre + arguments[0];
					console.log.apply(console, arguments);
				}

				// if the template consists of several nodes in a sequence,
				// then bind each node separately to the same data
				if (template.length > 1) {
					template.each(function(index, item) {
						recursively($(item), data);
					});
				}
				
				log("processing " + template[0].tagName.toLowerCase());
				
				var dataAttr = "data";
				
				// change context
				var dataAttrValue = template.attr(dataAttr);
				dataAttrValue && (dataAttrValue != "models") && (!(data instanceof Backbone.Collection)) && (data = data.get(dataAttrValue));
				
				if (data instanceof Backbone.Collection) {
					var collection = data;
					if (dataAttrValue == "models") {
						collection.each(function(model) {
							var res = recursively(this.clone(), model);
							template.append(res);
						}, template.children().detach());
					} else {
						// recursively bind all descendant nodes to the same data
						template.children().each(function(index, node) {
							recursively($(node), data);
						});
						return template;
					}
					
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
							recursively($(node), data);
						});
						return template;
					}
				} else {
					throw "model/collection required";
				}
				
				
			}
		
			// calls the real function with correct default state
			return function(template, data) {
				bind(template, data, {level : 0});
			}
		})()
		
		,
		setup : function(options) {
		}
		
	}
})();

