Form.Field.extend('Form.FieldContainer',
/**@lends Form.FieldContainer#*/
{
	/**
	 * @constructs
	 * @class Form.Field that can contain other Form.Field.
	 * It avoid user to create their own Field types.
	 * The difference between manual Form layout (using Panel.setLayout) is that the
	 * FieldContainer has a label, a description and an error message.
	 * @note Inspired from ExtJs FieldContainer
	 * @extends Form.Field
	 */
	constructor: function(config){
		//Default layout is Ui.HBox but it can be change with anything that have a setContent
		this.setUiElementType(Ui.HBox);
	}
},
/**@lends Form.FieldContainer#*/
{
	setUiElement: function(elt){
		Form.FieldContainer.base.setUiElement.call(this, elt);
		//Just put the description above the fields
		this.fieldBox.moveChildAt(this.description, 0);
		//Recall the function in case of setRequire has been called
		//before ui element creation.
		if(this.require){
			this.setRequire(this.require);
		}
	},

	/**Needs to be done after setting elements*/
	setValue: function(value){
		//Only works with objects
		if(typeof value === 'object' && this.uiElt != null){
			var fields = this.uiElt.getChildren();
			for(var name in value){
				for(var i = 0 ; i < fields.length; i++){
					var f = fields[i];
					if(f.fieldName === name){
						f.setValue(value[name]);
					}
				}
			}
		}
	},

	getValue: function(){
		var value = {};
		var fields = this.uiElt.getChildren();
		for(var i = 0 ; i < fields.length; i++){
			var f = fields[i];
			if(f.fieldName != null){
				value[f.fieldName] = f.getValue();
			}
		}

		return value;
	},

	isValid: function(){
		var fields = this.uiElt.getChildren();
		for(var i = 0 ; i < fields.length; i++){
			if(!fields[i].isValid()){
				return false;
			}
		}
		return true;
	},

	/** Set all fields to require if true. Otherwise do nothing */
	setRequire: function(require){
		this.require = require;
		if(require){
			var fields = this.uiElt.getChildren();
			for(var i = 0 ; i < fields.length; i++){
				fields[i].setRequire(require);
			}
		}
	}
});