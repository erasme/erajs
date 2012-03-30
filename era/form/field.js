Ui.LBox.extend('Form.Field',
/**@lends Form.Field#*/
{
	label: undefined,
	labelBox: undefined,
	require: false,
	description: undefined,
	validation: undefined,
	defaultValue: undefined,
	/**Object will have to prepend Ui.Element here*/
	fieldBox: undefined,
	/**contains labelBox + fieldBox*/
	contentBox: undefined,
	labelAlign: undefined,
	error: undefined,
	background: undefined,
	uiElt: undefined,
	/**Type of the Ui.Element, will be used in setUiElement as default type
	for the create (if left undefined will be Ui.Element)*/
	uiEltType: Ui.Element,
	
	constructor: function(config){
		//Default field width
		this.setWidth(200);
		//By default use the styleProperty
		this.labelAlign = this.getStyleProperty('labelAlign');
		//If label are align on top of the field, then use a VBox, otherwise HBox an
		var boxType = this.labelAlign ==='top' ? Ui.VBox : Ui.HBox;
		var lblHorizontalAlign = this.labelAlign ==='right' ? 'right' : 'left';

		this.setMargin(2);
		this.setContent([
			{type: Ui.Rectangle, name: 'background', opacity: 0.0, fill: 'pink', radius: 8},
			{
				type: boxType, margin: 5, name: 'contentBox',
				content: [
					{
						//Handle label with multiple colors...
						type: Ui.HBox, name: 'labelBox', spacing: 2,
						horizontalAlign: lblHorizontalAlign, verticalAlign: 'top',
						content: [{type: Ui.Label, name: 'label'}]
					},
					{
						type: Ui.VBox, name: 'fieldBox',
						content: [
							{type: Ui.Text, name: 'description', textAlign: 'left', color: '#444444'},
							{type: Ui.Text, name: 'error', color: 'red', textAlign: 'left', fontWeight: 'bold'}
						]
					}
				]
			}
		]);
	},

	/**
	 * Change label alignement
	 * @param top|left|right
	 */
	setLabelAlign: function(align){
		if(this.labelAlign !== align){
			this.labelAlign = align;

			this.contentBox.clear();
			this.remove(this.contentBox);

			var boxType = this.labelAlign ==='top' ? Ui.VBox : Ui.HBox;
			var lblHorizontalAlign = this.labelAlign ==='right' ? 'right' : 'left';
			this.contentBox = new boxType({content: [this.labelBox, this.fieldBox]});
			this.labelBox.setHorizontalAlign(lblHorizontalAlign);

			this.append(this.contentBox);
		}
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
		else if(this.labelBox.getChildren().length > 1){
			this.labelBox.remove(this.labelBox.getLastChild());
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
	
	getError: function(){
		return this.error.getText();
	},
	
	setError: function(error){
		if(error !== ''){
			this.background.setOpacity(1.0);
		}
		else{
			this.background.setOpacity(0.0);
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
		this.uiElt = this.uiEltType.create(elt);
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
		elt = Ui.Combo.create(elt);
		/**@temp For now Ui.Combo do not display properly if they're not left aligned*/
		elt.setHorizontalAlign('left');
		//Call the parent method to do the rest
		Form.ComboField.base.setUiElement.call(this, elt);
	},
	
	isValid: function(){
		if(this.isRequire() && this.getValue() === undefined){
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
		var realValue = this.getValue() != null ? this.getValue().trim() : "";
		var validation = this.getValidation();
		var empty = realValue.length === 0 ? true : false;
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

			if(!valid){
				this.setError('Non valide')
			}
		}
		
		if(valid){
			this.validate();
		}

		return valid;
	}
});

Form.TextField.extend('Form.TextAreaField',
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

Form.Field.extend('Form.CheckBoxField',
/**@lends Form.CheckBoxField#*/
{
	constructor: function(){
		this.setUiElementType(Ui.CheckBox);
	}
},
/**@lends Form.CheckBoxField#*/
{
	/**
	 * @note that a checkbox can only be require if it MUST be checked
	 */
	isValid: function(){
		if((this.isRequire() && !this.getValue())){
			this.setRequireError();
			return false;
		}
		else{
			this.validate();
			return true;
		}
	}
});