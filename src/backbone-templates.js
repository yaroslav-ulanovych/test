(function() {

	var attrNames = {
		data : "data",
		hovered : "hovered",
		rendered : "rendered"
	};
	
	var attrHandlers = {};
	attrHandlers[attrNames.hovered] = function(template, model, attrValue) {
		model.set(attrValue, false);
		template.mouseover(function() {
			console.log("mouseover", template);
			model.set(attrValue, true);
		});
		template.mouseout(function() {
			console.log("mouseout", template);
			model.set(attrValue, false);
		});
	};
	
	attrHandlers[attrNames.rendered] = function(template, model, attrValue) {
		var next = template.next();
		var parent = template.parent();
		var prev = template.prev();
		if (prev.length === 0) {
			model.bind("change:" + attrValue, _.tap(function() {
				if (model.get(attrValue)) {
					parent.prepend(template);
				} else {
					template.detach();
				}
			}, function(fn) {fn()}));
		} else if (next.length === 0) {
			model.bind("change:" + attrValue, _.tap(function() {
				if (model.get(attrValue)) {
					parent.append(template);
				} else {
					template.detach();
				}
			}, function(fn) {fn()}));
		}
	};

	Backbone.Templates = {

		bind : (function() {
		
			// real bind function
			function bind(template, data, state) {
			
				if (data instanceof Backbone.Collection) {
					data = new Backbone.CollectionModel({}, {collection : data});
				}
						
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
					return;
				}
				log("processing " + template[0].tagName.toLowerCase());
				
				// real work starts
				
				// change context
				var dataAttrValue = template.attr(attrNames.data);
				if (dataAttrValue) {
					var newData = data.get(dataAttrValue);
					
					if (!(newData instanceof Backbone.Model) && !(newData instanceof Backbone.Collection)) {
						console.log(data, dataAttrValue);
						throw "error changing context: model's field doesn't contain model/collection (see above)";
					}
					
					if (!(data instanceof Backbone.CollectionModel) && (newData instanceof Backbone.Collection)) {
						data = new Backbone.CollectionModel({}, {collection : newData});
					} else {
						data = newData;
					}
				}
				
				// render collection
				if (data instanceof Backbone.Collection) {
					var collection = data;
					collection.each(function(model) {
						var x = this.clone();
						recursively(x, model);
						template.append(x);
					}, template.children().detach());
				}	
				// render model
				else if (data instanceof Backbone.Model) {
					var model = data;
					// substitute attributes
					_(template[0].attributes).each(function(attr) {
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
						// handling of special attributes
						} else {
							var handler = attrHandlers[attr.name];
							if (handler) handler(template, model, attr.value);
						}
					});
					
					if (template.children().length == 0) {
						// substitute content
						var text = template.text();
						if (text[0] == "$") {
							var variable = text.substring(1);
							model.on("change:" + variable, _(function() {
								template.text(model.get(variable));
							}).tap(function(f){f.call()}));
						}
					} else {
						recursively(template.children(), data);
					}
				} else {
					throw "model/collection required, got: " + data;
				}
				
				
			}
			/*
			function backbonize(obj) {
				var callee = arguments.callee;
				if (_.isArray(obj)) {
					return new Backbone.Collection(_(obj).map(function(item) {
						return callee(item);
					}));
				} else if (_.isObject(obj)) {
					var result = {};
					_(obj).chain().keys().each(function(key) {
						result[key] = callee(obj[key]);
					});
					return new Backbone.Model(result);
				} else {
					return obj;
				}
			};
			*/
		
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

