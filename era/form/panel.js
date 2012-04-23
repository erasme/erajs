Ui.LBox.extend('Form.Panel',
/**@lends Form.Layout#*/
{
	title: undefined,
	description: undefined,
	requireFieldMsg: undefined,
	fields: undefined,
	layout: undefined,
	defaultLayout: true,
	value: undefined,
	submitUrl: undefined,
	submitHandler: undefined,
	submitType: 'ajax',

	constructor: function(config){
		this.addEvents("change", "submit");

		this.setPadding(10);

		this.title = new Ui.Label({fontSize: 18, horizontalAlign: 'left'});
		this.description = new Ui.Text({textAlign: 'left', marginBottom : 10});
		this.requireFieldMsg = new Ui.HBox({ spacing: 2, marginBottom : 5,
				content: [{type: Ui.Label, text: '*', color: 'red', fontWeight: 'bold'},
									{type: Ui.Label, text: 'Champs indispensables'}]}
				);

		if('layout' in config){
			this.defaultLayout = false;
		}
	},

	reset: function(){
		for(var field in this.fields){
			this.fields[field].reset();
		}
	},

	/**Test the overall validity of the Form*/
	isValid: function(){
		var valid = true;
		//Test all the field for validity
		for(var field in this.fields){
			if(!this.fields[field].isValid()){
				valid = false;
			}
		}
		
		return valid;
	},
	
	getValue: function(){
		var value = {};
		for(var field in this.fields){
			value[field] = this.fields[field].getValue();
		}
		
		//We add the panel's hidden value. No risk for keys collision cause we kept only the ones that were not in a field
		for(var attr in this.value) {
			value[attr] = this.value[attr];
		}
		
		return value;
	},

	setValue: function(value){
		this.value = value;
		this.updateValue();
	},

	updateValue: function(){
		var tempValue = {};
		if(this.value !==  undefined){
			if(this.fields !==  undefined){
				for(var v in this.value){
					if(v in this.fields){
						//Look for specific setter in the object that override setValue behaviour
						var func = 'set'+v.charAt(0).toUpperCase()+v.substr(1);
						if((func in this) && (typeof(this[func]) === 'function')) {
							this[func].call(this, this.value[v]);
						}
						else{
							this.fields[v].setValue(this.value[v]);
						}
					}
					//The panel only keeps value that do not corresponds to fields (ie hidden values)
					else{
						tempValue[v] = this.value[v];
					}
				}
				this.value = tempValue;
			}
		}
	},
	
	submit: function(){
		var valid = this.isValid();
		if(this.submitUrl !==  undefined && valid){
			var values = this.getValue();
			//Pass the value throw the handler ?
			if(this.submitHandler !==  undefined){
				values = this.submitHandler(values);
			}

			if(this.submitType === 'ajax'){
				//A form is usually a POST request
				req = new Core.HttpRequest({url: this.submitUrl, method: 'POST', arguments: values});
				this.connect(req, "done", this.onSubmitDone);
				req.send();
			}
			//The form is a link so no HttpRequest
			else if (this.submitType === 'link'){
				var args = Core.Util.encodeURIQuery(values);
				var url = this.submitUrl;
				var paramChar = url.indexOf('?') === -1 ? '?' : '&'
				url += paramChar + args;
				window.open(url);
			}
		}

		return valid;
	},
	
	onSubmitDone: function(request){
		this.fireEvent("submit", request);
	},

	_buildDefaultLayout: function(someFieldRequire){
		//Default layout is VBox
		var vbox = new Ui.VBox({
			content: [
				this.title,
				this.description
			]
		});
		if(someFieldRequire){
			vbox.prepend(this.requireFieldMsg);
		}
		
		for(var field in this.fields){
			vbox.append(this.fields[field]);
		}

		return vbox;
	},

	setTitle: function(title){
		this.title.setText(title);
	},

	setDescription: function(description){
		this.description.setText(description);
	},

	setFields: function(fields){
		var someFieldRequire = false;
		this.fields = {};
		for(var name in fields){
			var f = this.fields[name] = Form.Field.create(fields[name]);
			this.connect(f, 'change', this.onChange);
			if(f.isRequire()){
				someFieldRequire = true;
			}
		}
		
		if(this.defaultLayout){
			var layout = this._buildDefaultLayout(someFieldRequire);
			this.setLayout(layout);
		}
		//If setLayout has been called before setFields
		else if(this.layout !==  undefined && this.content === undefined){
			//Recall setLayout
			this.setLayout(this.layout);
		}
		
		this.updateValue();
	},

	/**
	 * Append a field at the end of the layout (container)
	 */
	appendField: function(name, field){
		if(this.fields == null){
			this.fields = {}
			if(this.defaultLayout){
				var layout = this._buildDefaultLayout(false);
				this.setLayout(layout);
			}
		}
		//console.log(field);
		var f = this.fields[name] = Form.Field.create(field);
		this.connect(f, 'change', this.onChange);
		this.layout.append(f);
	},

	/**
	 * @warning this function only work with simple layout (ie with only 1 level of children)
	 * if you've defined a specific layout at the field is not directly 
	 * a child of the panel's layout, then you'll have to remove it yourself
	 */
	removeField: function(name){
		if(this.fields != null){
			var f = this.fields[name];
			if(f != null){
				this.layout.remove(f);
			}
		}
	},

	getField: function(name){
		return this.fields != null ? this.fields[name] : undefined;
	},

	setLayout: function(layout){
		this.layout = layout;
		if(this.fields === undefined){
			return;
		}
		else{
			this.setContent(layout);
		}
	},
	
	setSubmitUrl: function(url){
		if(typeof url ===  'string'){
			this.submitUrl = url;
		}
	},
	
	getSubmitUrl: function(){
		return this.submitUrl;
	},
	
	setSubmitType: function(type){
		this.submitType = type;
	},
	
	getSubmitType: function(){
		return this.submitType;
	},
	
	setSubmitHandler: function(handler){
		if(typeof handler ===  'function'){
			this.submitHandler = handler;
		}
	},

	onChange: function(field){
		this.fireEvent("change", field);
	}
});
