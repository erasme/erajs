Ui.Dialog.extend('Form.Dialog',
/**@lends Form.Dialog#*/
{
	panel: undefined,
	formVbox: undefined,
	buttonBox: undefined,
	undoBtn: undefined,
	submitBtn: undefined,
	/**
	 * @constructs 
	 * @class A Dialog that wraps a Form.Panel and display cancel/submit buttons
	 * @extends Ui.Dialog
	 */
	constructor: function(config){
		this.setFullScrolling(true);
		this.setPreferedWidth(600);
		this.setPreferedHeight(600);
	
		this.undoBtn = new Ui.Button({ text: 'Annuler' });
		this.connect(this.undoBtn, 'press', this.close);
		this.setCancelButton(this.undoBtn);
		
		this.submitBtn = new Ui.Button({ text: 'Valider' });
		this.connect(this.submitBtn, 'press', this.onSubmit);
		this.setActionButtons([ this.submitBtn ]);				
	},

	setPanel: function(panel){
		this.panel = Form.Panel.create(panel);
		this.setTitle(this.panel.getTitle());
		this.setContent(this.panel);
	},
	
	setUndoText: function(text){
		this.undoBtn.setText(text);
	},
	
	setSubmitText: function(text){
		this.submitBtn.setText(text);
	},
	
	onSubmit: function(){
		this.panel.submit();
		this.hide();
	}
});

