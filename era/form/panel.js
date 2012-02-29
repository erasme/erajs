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
		if(this.submitUrl !==  undefined && this.isValid()){
			var values = this.getValue();
			//Pass the value throw the handler ?
			if(this.submitHandler !==  undefined){
				values = this.submitHandler(values);
			}

			if(this.submitType === 'ajax'){
				//console.log('Envois de ', values, ' a ', this.submitUrl);
			}
			//The form is a link so no HttpRequest
			else if (this.submitType === 'link'){
				var args = Core.Util.encodeURIQuery(values);
				var url = this.submitUrl;
				if(url.indexOf('?') === -1){
					url += '?'+args;
				}
				else{
					url += '&'+args;
				}

				return url;
			}
		}
		
		return "";
	},
	
	setValue: function(value){
		this.value = value;
		this.updateValue();
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
		for(var i = 0; i < fields.length ; i++){
			var field = fields[i];
			var formField = Form.Field.create(field);
			this.fields[formField.fieldName] = formField;
			
			if(formField.isRequire()){
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
	}
});