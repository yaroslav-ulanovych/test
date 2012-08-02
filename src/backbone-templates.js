(function() {

	var ViewModel = Backbone.Model.extend({
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
	
	var ViewCollection = Backbone.Collection.extend({
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
	
	var CollectionModel = Backbone.Model.extend({
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

	var attrNames = {
		data : "data",
		hovered : "hovered",
		rendered : "rendered",
		click : "click",
		input : "input"
	};

	function Accessor(negated, attribute, callable) {
		this.negated = negated;
		this.attribute = attribute;
		this.callable = callable
	};

	Accessor.parse = (function() {
		var regex = /^(\!?)(\s*)(\w+)(\(\))?(.*)$/;
		var parse = function(rawProperty) {
			var property = rawProperty.trim();
			var parsed = regex.exec(property);
			if (parsed) {
				var exclamationMark = parsed[1];
				var property = parsed[3];
				var braces = parsed[4];
				var tail = parsed[5];
				if (tail.length !== 0) throw Backbone.Templates.Exceptions.BadAccessorSyntax;
				return new Accessor(exclamationMark == "!", property, braces == "()");
			};
			console.log(rawProperty);
			throw Backbone.Templates.Exceptions.BadAccessorSyntax;
		}
		return parse;
	})();

	Accessor.prototype = {
		/** Subscribe to changes of model's attribute. */
		bind : function(model, handler) {
			model.bind("change:" + this.attribute, function() {
				handler(this.get(model));
			}, this);
			handler(this.get(model));
		},
		
		/** Get the value of model's attribute. */
		get : function(model) {
		
			var value = model.get(this.attribute);
			
			if (this.negated) {
				if (!_.isBoolean(value)) {
					console.log(model, this.attribute, value);
					throw Backbone.Templates.Exceptions.NotBooleanAttribute;
				} else {
					return !value;
				}
			} else {
				if (!model.has(this.attribute)) {
					console.log(model, this.attribute);
					throw Backbone.Templates.Exceptions.NoSuchAttribute;
				};
				return value;
			}
			
		},
		
		set : function(model, value) {
			if (this.callable) {
				var method = model[this.attribute];
				if (!_.isFunction(method)) {
					console.log(model, this.attribute, method);
					throw Backbone.Templates.Exceptions.NoSuchMethod;
				} else {
					model[this.attribute].apply(model, Array.prototype.slice.call(arguments, 1));
				}				
			} else {
				model.set(this.attribute, value);
			}
		}
		
	};
	
	var attrHandlers = {};

	attrHandlers[attrNames.hovered] = function(template, model, accessor) {
		accessor.set(model, false);
		template.mouseover(function() {
			console.log("mouseover", template);
			accessor.set(model, true);
		});
		template.mouseout(function(e) {
			console.log("mouseout", template);
			// avoid blinking with nested elements
			if (!template.is(":hover")) {
				accessor.set(model, false);
			}
		});
	};

	attrHandlers[attrNames.rendered] = function(template, model, accessor) {
		var next = template.next();
		var parent = template.parent();
		var prev = template.prev();
		if (prev.length === 0) {
			accessor.bind(model, function(value) {
				if (value) {
					parent.prepend(template);
				} else {
					template.detach();
				}
			});
		} else if (next.length === 0) {
			accessor.bind(model, function(value) {
				if (value) {
					parent.append(template);
				} else {
					template.detach();
				}
			});
		}
	};

	attrHandlers[attrNames.click] = function(template, model, accessor) {
		template.click(function() {
			accessor.set(model);
		});
	};	
	
	attrHandlers[attrNames.input] = function(template, model, accessor) {
		template.on("input", function() {
			accessor.set(model, template.val());
		});
		accessor.bind(model, function(value) {
			template.val(value);
		});
	};

	Backbone.Templates = {

		bind : (function() {
		
			// real bind function
			function bind(template, data, state) {

				if (data instanceof Backbone.Collection) {
					data = new CollectionModel({}, {collection : data});
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
					
					if (!(data instanceof CollectionModel) && (newData instanceof Backbone.Collection)) {
						data = new CollectionModel({}, {collection : newData});
					} else {
						data = newData;
					}
				}

				// render collection
				if (data instanceof Backbone.Collection) {
					var collection = data;
					var parent = template;
					var template = template.children().detach()
					collection.each(function(model) {
						var x = template.clone();
						recursively(x, model);
						parent.append(x);
					});
					collection.bind("add", function(model, collection, options) {
						var templateCopy = template.clone();
						recursively(templateCopy, model);
						if (options.index === 0) {
							parent.prepend(templateCopy);
						} else {
							$(parent.children()[options.index * template.length - 1]).after(templateCopy);
						}
					});
					collection.bind("remove", function(model, collection, options) {
						//TODO test me
						//TODO remove listeners
						$(parent.children().slice(options.index * template.length, options.index * template.length + template.length)).detach();
					});
					collection.bind("reset", function() {
						parent.empty();
							collection.each(function(model) {
							var x = template.clone();
							recursively(x, model);
							parent.append(x);
						});
					});
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
							if (handler) handler(template, model, Accessor.parse(attr.value));
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

			};


			// calls the real function with correct default state
			return function(template, data) {
				bind(template, data, {level : 0});
			}
		})()

		,
		setup : function(options) {
		},

		/**
		 * Exposed for testing purposes only and not intended
		 * to be used outside of the library.
		 */
		Internals : {
			Accessor : Accessor,
			CollectionModel : CollectionModel,
			ViewCollection : ViewCollection
		},
		
		Util : {
			/**
			 * Returns a copy of an argument, where all objects are substituted
			 * with backbone models and arrays with collections.
			 */
			backbonize : function(obj) {
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
			}
		},

		Exceptions : {
			NotBooleanAttribute : "not boolean attribute",
			NoSuchAttribute : "no such attribute",
			NoSuchMethod : "no such method",
			BadAccessorSyntax : "bad accessor syntax"
		}

	}
})();

