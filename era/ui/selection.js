
Core.Object.extend('Ui.Selection', {
	elements: undefined,

	constructor: function(config) {
		this.addEvents('change');
		this.elements = [];
	},

	clear: function() {	
		var currentElements = this.elements;
		this.elements = [];
		for(var i = 0; i < currentElements.length; i++) {
			this.connect(currentElements[i], 'unload', this.onElementUnload);
			currentElements[i].setIsSelected(false);
		}
		this.fireEvent('change', this);
	},

	append: function(element) {
		var i;
		// test if we already have it
		var found = false;
		for(i = 0; !found && (i < this.elements.length); i++)
			found = (this.elements[i] === element);
		if(!found) {
			var hasMultiple = false;
			var actions = this.getElementActions(element);
			for(var actionName in actions) {
				if(actions[actionName].multiple === true)
					hasMultiple = true;
			}
			// test compatibility with other elements
			if(this.elements.length > 0) {
				var compat = true;
				for(i = 0; compat && (i < this.elements.length); i++) {
					var otherCompat = false;
					var otherActions = this.getElementActions(this.elements[i]);
					for(var actionKey in actions) {
						var action = actions[actionKey];
						if(action.multiple === true) {
							for(var otherActionKey in otherActions) {
								var otherAction = otherActions[otherActionKey];
								if((otherAction.multiple === true) && (otherAction.callback === action.callback)) {
									otherCompat = true;
									break;
								}
							}
						}
					}
					compat = compat && otherCompat;
				}
				// if not compatible, remove old selection
				if(!compat || !hasMultiple) {
					for(i = 0; i < this.elements.length; i++)
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
		var foundPos;
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
		// return a copy, because action on elements might change
		// the elements list
		return this.elements.slice();
	},

	getElementActions: function(element) {
		var actions = Core.Util.clone(element.getSelectionActions());
		// handle parent context actions
		var current = element.getParent();
		while((current !== null) && (current !== undefined)) {
			if('getContextActions' in current)
				actions = current.getContextActions(element, actions);
			current = current.getParent();
		}
		return actions;
	},

	getActions: function() {
		var actions; var allActions; var actionName; var action;
		if(this.elements.length === 0)
			return undefined;
		else {
			if(this.elements.length === 1) {
				actions = {};
				allActions = this.getElementActions(this.elements[0]);
				for(actionName in allActions) {
					action = allActions[actionName];
					if(!('testRight' in action) || action.testRight.call(this.elements[0]))
						actions[actionName] = allActions[actionName];
				}
				return actions;
			}
			// return only actions that support multiple element
			else {
				actions = {};
				allActions = this.getElementActions(this.elements[0]);
				for(actionName in allActions) {
					action = allActions[actionName];
					if(action.multiple === true) {
						var compat = true;
						for(i = 1; compat && (i < this.elements.length); i++) {
							var otherCompat = false;
							var otherActions = this.getElementActions(this.elements[i]);
							for(var otherActionKey in otherActions) {
								var otherAction = otherActions[otherActionKey];
								if((otherAction.multiple === true) && (otherAction.callback === action.callback)) {
									otherCompat = true;
									break;
								}
							}
							compat = compat && otherCompat;
						}
						if(compat) {
							var allowed = true;
							// test rights for all elements
							if('testRight' in action) {
								for(var i = 0; allowed && (i < this.elements.length); i++) {
									allowed &= action.testRight.call(this.elements[i]);
								}
							}
							if(allowed)
								actions[actionName] = allActions[actionName];
						}
					}
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
			this.clear();
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
		else if(actions.suppress !== undefined)
			return actions.suppress;
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
			this.clear();
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