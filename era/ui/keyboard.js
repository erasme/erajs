
Core.Object.extend('Ui.Keyboard', 
/**@lends Ui.Keyboard#*/
{
	shiftKey: false,
	altKey: false,
	ctrlKey: false,
	altGraphKey: false,
	metaKey: false,
	elementCapture: undefined,

	/**
     * @constructs
	 * @class
     * @extends Core.Object
	 */
	constructor: function(config) {
	},

	/**
	 * Capture all keyboard event to send them to element
	 * until keyboard release called.
	 * WARNING: the normal way to handle the keyboard capture
	 * is to use the focus system. This function is only for
	 * very special cases.
	 */
	capture: function(element) {
		if(this.elementCapture != undefined)
			throw('keyboard capture already done on element (type: '+this.elementCapture.type+', id: '+this.elementCapture.id+', newid: '+element.id+')');
		this.elementCapture = element;
	},
	
	/**
	 * Release the current mouse event capture
	 */
	release: function() {
		if(this.elementCapture != undefined)
			this.elementCapture = undefined;
		else
			throw('keyboard capture release but no element capture the keyboard');
	},

	getShiftKey: function() {
		return this.shiftKey;
	},

	getAltKey: function() {
		return this.altKey;
	},

	getCtrlKey: function() {
		return this.ctrlKey;
	},

	getAltGraphKey: function() {
		return this.altGraphKey;
	},

	getMetaKey: function() {
		return this.metaKey;
	}
});

/**
 * The keyboard defined in the system
 */
Ui.Keyboard.current = new Ui.Keyboard();

