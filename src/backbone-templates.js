(function() {

	var ViewModel = Backbone.Model.extend({
		constructor : function(model) {
			this.options = {model : model};
			Backbone.Model.apply(this);
		},

		initialize : function() {
			var model = this.options.model;

			_.each(model.toJSON(), function(value, key) {
				this.set(key, new FieldModel(key, model));
				delete this.id;
			}, this);

			this.set("syncing", false);

			var originalFetch = model.fetch;
			var self = this;
			model.fetch = function() {
				self.set("syncing", true);
				originalFetch.call(model, {
					success : function() {
						self.set("syncing", false);
					},
					error : function() {
						self.set("syncing", false);
					}
				});
			}
		},
		get : function(attribute) {
			var result = Backbone.Model.prototype.get.apply(this, arguments);
			if (_.isUndefined(result)) {
				result = new FieldModel(attribute, this.options.model)
				this.set(attribute, result);
			}
			return result;
		}
	});

	var FieldModel = Backbone.Model.extend({
		constructor : function(field, model) {
			this.options = {
				field : field,
				model : model
			};

			Backbone.Model.apply(this);
		},

		initialize : function() {
			this.set("value", this.options.model.get(this.options.field));
			this.set("synced", true);

			this.set("original", this.options.model.get(this.options.field));

			var model = this.options.model;
			var field = this.options.field;

			function isEmpty() {
				var value = model.get(field);
				return _.isUndefined(value) || _.isNull(value);
			};

			this.set("empty", isEmpty());

			model.on("change:" + field, function() {
				var newValue = model.get(field);
				this.set({
					value : newValue,
					synced : _.isEqual(newValue, this.get("original")),
					empty : isEmpty()
				});
			}, this);

			// update model's field when the value attribute is changed
			this.on("change:value", function() {
				model.set(field, this.get("value"));
			}, this);
		},

		save : function() {
			var fm = this;
			var model = this.options.model;
			// remember toJSON
			var ownToJSON = _.has(model, "toJSON");
			var toJSON = model.toJSON;

			var data = {};
			var value = this.get("value");
			data[this.options.field] = value;

			// replace toJSON
			model.toJSON = function() { return data; };

			model.save({}, {
				wait : true,
				success : function() {
					fm.set({
						synced : true,
						original : value
					});

				}
			});

			// restore toJSON
			if (ownToJSON) {
				model.toJSON = toJSON;
			} else {
				model.toJSON = undefined;
			}
			
		},

		cancel : function() {
			this.options.model.set(this.options.field, this.get("original"));
		}

	});

	var ViewCollection = Backbone.Collection.extend({
		//model : Backbone.ViewModel,

		constructor : function(collection, options) {

			collection.bind("add", function(model, collection, options) {
				this.add(new ViewModel(model), {
					at : options.at
				});
			}, this);

			collection.bind("remove", function(model, collection, options) {
				this.remove(this.find(function(viewModel) {
					return viewModel.options.model === model;
				}));
			}, this);

			collection.bind("reset", function(collection, options) {
				this.reset(collection.map(function(model) {
					return new ViewModel(model);
				}));
			}, this);

			Backbone.Collection.call(this, collection.map(function(model) {
				return new ViewModel(model);
			}));


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
			model.bind(this.callable ? "change" : ("change:" + this.attribute), function() {
				handler(this.get(model));
			}, this);
			handler(this.get(model));
		},
		
		/** Get the value of model's attribute. */
		get : function(model) {
			if (this.callable) {
				model = (model instanceof ViewModel) ? model.options.model : model;
				var method = model[this.attribute];
				if (!_.isFunction(method)) {
					console.log(model, this.toString())
					throw Backbone.Templates.Exceptions.NoSuchMethod;
				}
				return method.call(model);
			} else {
				var value = model.get(this.attribute);

				if (value instanceof FieldModel) value = value.get("value");

				if (_.isUndefined(value)) {
					console.log(model, this.toString());
					throw Backbone.Templates.Exceptions.NoSuchAttribute;
				};

				if (this.negated) {
					if (!_.isBoolean(value)) {
						console.log(model, this.toString(), value);
						throw Backbone.Templates.Exceptions.NotBooleanAttribute;
					} else {
						return !value;
					}
				} else {
					return value;
				}
			}
		},
		
		set : function(model, value) {
			if (model instanceof ViewModel) {
				model = model.options.model;
			}
			if (this.callable) {
				var method = model[this.attribute];
				if (!_.isFunction(method)) {
					console.log(model, this.toString(), method);
					throw Backbone.Templates.Exceptions.NoSuchMethod;
				} else {
					model[this.attribute].apply(model, Array.prototype.slice.call(arguments, 1));
				}
			} else {
				model.set(this.attribute, value);
			}
		},

		toString : function() {
			return (this.negated ? "!" : "") + this.attribute + (this.callable ? "()" : "");
		}
	};
	
	var attrHandlers = {};

	attrHandlers[attrNames.hovered] = function(template, model, accessor) {
		accessor.set(model, false);
		template.mouseover(function() {
			accessor.set(model, true);
		});
		template.mouseout(function(e) {
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
					data = new CollectionModel({}, {collection : new ViewCollection(data)});
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

				//log("processing " + template[0].tagName.toLowerCase());

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
						data = new CollectionModel({}, {collection : new ViewCollection(newData)});
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
							var accessor = Accessor.parse(variable);
							accessor.bind(model, function(value) {
								template.attr(attr.name, value);
							});
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


			// what is called when you write Backbone.Templates.bind(),
			// calls the real function with correct default state
			return function(template, data) {
				if (data instanceof Backbone.Model) {
					data = new ViewModel(data);
				};
				bind(template, data, {level : 0});
				template.show();
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
			ViewCollection : ViewCollection,
			ViewModel : ViewModel,
			FieldModel : FieldModel
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
			BadAccessorSyntax : "bad accessor syntax",
			UnsupportedOperation : "unsupported operation"
		}

	}
})();

