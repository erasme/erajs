Ui.LBox.extend('Form.PanelContainer',
/**@lends Form.PanelContainer#*/
{
	/**Where panel will be pushed*/
	layout: undefined,
	layoutType: Ui.VBox,
	panels: undefined,
	/**
	 * @constructs 
	 * @class Layout agnostic panel container. It only puts panels into a container (Ui.VBox by default)
	 * and retrieve their value in a single object
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
	},

	/**
	 * Define the container type used for layout.
	 * Rebuild layout this way change can be dynamic.
	 */
	setLayoutType: function(type) {
		this.layoutType = type;
		this._rebuildLayout();
	},

	setPanels: function(panels) {
		this.panels = {};
		for(var name in panels) {
			this.panels[name] = Form.Panel.create(panels[name]);
		}
		this._rebuildLayout();
	},

	appendPanel: function(name, panel) {
		if(this.panels === undefined) {
			this.panels = {};
		}
		var p = this.panels[name] = Form.Panel.create(panel);
		this.layout.append(p);
	},

	removePanel: function(name) {
		if(this.panels !== undefined) {
			var p = this.panels[name];
			if(p !== undefined) {
				this.layout.remove(p);
			}
		}
	},

	getPanel: function(name){
		return (this.panels !== undefined) ? this.panels[name] : undefined;
	},

	setValue: function(value){
		if(this.panels !== undefined ){
			for(var name in value){
				var p = this.panels[name];
				if(p !== undefined){
					p.setValue(value[name]);
				}
			}
		}
	},

	getValue: function(){
		var val = {};
		if(this.panels !== undefined) {
			for(var name in this.panels) {
				val[name] = this.panels[name].getValue();
			}
		}
		return val;
	},

	/**
	 * Create a new layout (container) and append all the panels in.
	 * If layout already exists destory it.
	 */
	_rebuildLayout: function() {
		if(this.layout !== undefined) {
			this.layout.clear();
		}
		if(this.panels !== undefined) {
			this.layout = new this.layoutType();
			for(var name in this.panels) {
				this.layout.append(this.panels[name]);
			}
			this.append(this.layout);
		}
	}
});