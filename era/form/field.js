Ui.LBox.extend('Form.Field',
/**@lends Form.Field#*/
{
	label: undefined,
	labelBox: undefined,
	require: false,
	description: undefined,
	validation: undefined,
	defaultValue: undefined,
	fieldName: undefined,
	/**Object will have to prepend Ui.Element here*/
	fieldBox: undefined,
	error: undefined,
	background: undefined,
	uiElt: undefined,
	/**Type of the Ui.Element, will be used in setUiElement as default type
	for the create (if left undefined will be Ui.Element)*/
	uiEltType: Ui.Element,
	
	constructor: function(config){
		//If label are align on top of the field, then use a VBox, otherwise HBox an
		var boxType = this.getStyleProperty('labelAlign') ==='top' ? Ui.VBox : Ui.HBox;
		var lblHorizontalAlign = this.getStyleProperty('labelAlign') ==='right' ? 'right' : 'left';

		this.setMargin(2);
		this.setContent([
				{type: Ui.Rectangle, name: 'background', fill: 'white', radius: 8},
				{
					type: boxType, margin: 5, 
					content: [
						{
							//Handle label with multiple colors...
							type: Ui.HBox, name: 'labelBox', width: 200, verticalAlign: 'top', spacing: 2,
								content: [{type: Ui.Label, name: 'label'}]
						},
						{
							type: Ui.VBox,
							name: 'fieldBox',
							content: [
								{type: Ui.Label, name: 'description', horizontalAlign: 'left', color: '#444444'},
								{type: Ui.Label, name: 'error', color: 'red', horizontalAlign: 'left', fontWeight: 'bold'}
							]
						}
					]
				}
			]);
	},

	/**
	 * Define the type of the Ui.Element in the Form.Field
	 * and create an element with a blank config which can be override with the uiElement config param
	 */
	setUiElementType: function(type) {
		this.uiEltType = type;
		this.setUiElement({});
	},

	setLabel: function(label){
		this.label.setText(label);
	},
	
	setRequire: function(require){
		this.require = require;
		if(this.require){
			this.labelBox.append(new Ui.Label({text: '*', color: 'red', fontWeight: 'bold'}));
		}
	},
	
	isRequire: function(){
		return this.require;
	},
	
	setDescription: function(description){
		this.description.setText(description);
	},
	
	setValidation: function(validation){
		this.validation = validation;
	},
	
	getValidation: function(){
		return this.validation;
	},
	
	setDefaultValue: function(defaultValue){
		this.defaultValue = defaultValue;
		this.setValue(this.defaultValue);
	},
	
	setFieldName: function(fieldName){
		this.fieldName = fieldName;
	},
	
	getError: function(){
		return this.error.getText();
	},
	
	setError: function(error){
		if(error !== ''){
			this.background.setFill('pink');
		}
		else{
			this.background.setFill('white');
		}

		this.error.setText(error);
	},
	
	validate: function(){
		this.setError('');
	},
	
	setRequireError: function(){
		this.setError('Champs obligatoire');
	},
	
	getValue: function(){
		return this.uiElt !== undefined ? this.uiElt.getValue() : undefined;
	},
	
	setValue: function(value){
		if(this.uiElt !== undefined){
			this.uiElt.setValue(value);
		}
	},
	
	setUiElement: function(elt){
		if(this.uiElt !== undefined){
			this.fieldBox.remove(this.uiElt);
		}
		this.uiElt = this.uiEltType.create(elt, this);
		this.fieldBox.prepend(this.uiElt);
	},
	
	reset: function(){
		if(this.defaultValue !== undefined){
			this.setValue(this.defaultValue);
		}
	},
	
	/**Need to be override*/
	isValid: function(){
		return true;
	}
},{},
{
	style: {
		/**can be left, right, top*/
		labelAlign: 'top'
	}
});

Form.Field.extend('Form.ComboField',
/**@lends Form.ComboField#*/
{
	constructor: function(config){
		this.setUiElementType(Ui.Combo);
		if(!('uiElement' in config)){
			this.setUiElement({horizontalAlign: 'left'});
		}
	}
},
/**@lends Form.ComboField#*/
{
	/**Get the current selection*/
	getValue: function(){
		return this.uiElt.getCurrent();
	},
	
	/**Set the Combo data*/
	setValue: function(value){
		this.uiElt.setData(value);
	},
	
	/**Override it cause Ui.Combo need to be left align*/
	setUiElement: function(elt){
		elt = Ui.Combo.create(elt, this);
		/**@temp For now Ui.Combo do not display properly if they're not left aligned*/
		elt.setHorizontalAlign('left');
		//Call the parent method to do the rest
		Form.ComboField.base.setUiElement.call(this, elt);
	},
	
	isValid: function(){
		if(this.isRequire() && this.getValue() ===undefined){
			this.setRequireError();
			return false;
		}
		else{
			this.validate();
			return true;
		}
	}
});

Form.Field.extend('Form.TextField',
/**@lends From.TextField#*/
{
	constructor: function(config){
		this.setUiElementType(Ui.TextField);
	}
},
/**@lends From.TextField#*/
{
	isValid: function(){
		var valid = true;
		var realValue = this.getValue().trim();
		var validation = this.getValidation();
		var empty = realValue.length ===0 ? true : false;
		if(this.isRequire() && empty){
			valid = false;
			this.setRequireError();
		}
		else if(!empty && validation !== undefined){
			//Regex validation
			if(validation instanceof RegExp){ 
				valid = validation.test(realValue);
			}
			//Function validation
			else if(typeof validation === "function"){
				valid = validation(realValue);
			}
		}
		
		if(valid){
			this.validate();
		}
		return valid;
	}
});

Form.Field.extend('Form.TextAreaField',
/**@lends Form.TextAreaField#*/
{
	/**
	 * @constructs 
	 * @class description
	 * @extends Form.Field
	 */
	constructor: function(config){
		this.setUiElementType(Ui.TextAreaField);
	}
},
/**@lends From.TextAreaField#*/
{
	isValid: function(){
		var realValue = this.getValue().trim();
		var empty = realValue.length ===0 ? true : false;
		if(this.isRequire() && empty){
			this.setRequireError();
			return false;
		}
		else{
			this.validate();
			return true;
		}
	}
});


Form.TextField.extend('Form.PasswordField',
{
	constructor: function(config){
		this.uiElt.setPasswordMode(true);
	}
});

Form.Field.extend('Form.DateField',
/**@lends Form.DateField#*/
{
	/**
	 * @constructs 
	 * @class Simple Date field with a DatePicker
	 * @extends Form.Field
	 */
	constructor: function(config){
		this.setUiElementType(Ui.DatePicker);
		if(!('uiElement' in config)){
			this.setUiElement({horizontalAlign: 'left'});
		}
	}
},
/**@lends Form.DateField#*/
{
	getValue: function(){
		return this.uiElt.getSelectedDate();
	},
	
	setValue: function(date){
		this.uiElt.setSelectedDate(date);
	},
	
	isValid: function(){
		if((this.isRequire() && !this.uiElt.getIsValid())){
			this.setRequireError();
			return false;
		}
		else{
			this.validate();
			return true;
		}
	}
});