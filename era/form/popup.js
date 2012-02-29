Ui.Popup.extend('Form.Popup',
/**@lends Form.Popup#*/
{
	panel: undefined,
	vbox: undefined,
	buttonBox: undefined,
	undoBtn: undefined,
	submitBtn: undefined,
	/**
	 * @constructs 
	 * @class A Popup that wraps a Form.Panel and display cancel/submit buttons
	 * @extends Ui.Popup
	 */
	constructor: function(config){
		this.setContent({
			type: Ui.VBox,
			name: 'vbox',
			width: 600,
			content: [
				{ 
					type: Ui.HBox, uniform: true, 
					name: 'buttonBox', horizontalAlign: 'right',
					content: [
						{type: Ui.Button, name: 'undoBtn', text: 'Annuler', onPress: function(){this.hide()}},
						{type: Ui.Button, name: 'submitBtn', text: 'Valider', onPress: this.onSubmit}
					]
				}
			]
		});
	},

	setPanel: function(panel){
		this.panel = Form.Panel.create(panel);
		this.vbox.prepend(this.panel, true);
	},
	
	setUndoText: function(text){
		this.undoBtn.setText(text);
	},
	
	setSubmitText: function(text){
		this.submitBtn.setText(text);
	},
	
	onSubmit: function(){
		var realUrl = this.panel.submit();
		if(this.panel.getSubmitType() == 'link' && realUrl.length > 0){
			window.open(realUrl);
		}
	}
});

