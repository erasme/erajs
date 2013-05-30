
Core.Object.extend('Ui.Selection', {
	elements: undefined,

	constructor: function(config) {
		this.addEvents('change');
		this.elements = [];
	},

	clear: function() {	
		for(var i = 0; i < this.elements.length; i++) {
			this.elements[i].setIsSelected(false);
			this.connect(this.elements[i], 'unload', this.onElementUnload);
		}
		this.elements = [];
		this.fireEvent('change', this);
	},

	append: function(element) {
		// test if we already have it
		var found = false;
		for(var i = 0; !found && (i < this.elements.length); i++)
			found = (this.elements[i] === element);
		if(!found) {
			var hasMultiple = false;
			for(var actionName in element.getSelectionActions()) {
				if(element.getSelectionActions()[actionName].multiple === true)
					hasMultiple = true;
			}
			// test compatibility with other element
			if(this.elements.length > 0) {
				var compat = true;
				for(var i = 0; compat && (i < this.elements.length); i++)
					compat = (this.elements[i].getSelectionActions() === element.getSelectionActions());
				// if not compatible, remove old selection
				if(!compat || !hasMultiple) {
					for(var i = 0; i < this.elements.length; i++)
						this.elements[i].setIsSelected(false);
					this.elements = [];
				}
			}
			this.elements.push(element);
			this.connect(element, 'unload', this.onElementUnload);
			this.fireEvent('change', this);
		}
	},
	
	remove: function(element) {
		// test if we already have it
		var foundPos = undefined;
		for(var i = 0; (foundPos === undefined) && (i < this.elements.length); i++)
			if(this.elements[i] === element)
				foundPos = i;
		if(foundPos !== undefined) {
			this.elements.splice(foundPos, 1);
			this.disconnect(element, 'unload', this.onElementUnload);
			this.fireEvent('change', this);
		}
	},
	
	getElements: function() {
		return this.elements;
	},
	
	getActions: function() {
		if(this.elements.length === 0)
			return undefined;
		else {
			if(this.elements.length === 1)
				return this.elements[0].getSelectionActions();
			// return only actions that support multiple element
			else {
				var actions = {};
				var allActions = this.elements[0].getSelectionActions();
				for(var actionName in allActions) {
					if(allActions[actionName].multiple === true)
						actions[actionName] = allActions[actionName];
				}
				return actions;
			}
		}
	},
	
	getDefaultAction: function() {
		var actions = this.getActions();
		for(var actionName in actions) {
			if(actions[actionName]['default'] === true)
				return actions[actionName];
		}
		return undefined;
	},
	
	executeDefaultAction: function() {
		var action = this.getDefaultAction();
		if(action !== undefined) {
			var scope = this;
			if('scope' in action)
				scope = action.scope;
			action.callback.call(scope, this);
			return true;
		}
		else {
			return false;
		}
	},
	
	getDeleteAction: function() {
		var actions = this.getActions();
		if('delete' in actions)
			return actions['delete'];
		else
			return undefined;
	},
	
	executeDeleteAction: function() {
		var action = this.getDeleteAction();
		if(action !== undefined) {
			var scope = this;
			if('scope' in action)
				scope = action.scope;
			action.callback.call(scope, this);
			return true;
		}
		else {
			return false;
		}
	},
	
	onElementUnload: function(element) {
		// remove the element from the selection
		// if removed from the DOM
		this.remove(element);
	}
});