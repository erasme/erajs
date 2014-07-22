
Core.Object.extend('Ui.Event', {
	type: undefined,
	bubbles: true,
	cancelable: true,
	target: undefined,
	cancelBubble: false,
	stop: false,

	constructor: function(config) {
	},

	stopPropagation: function() {
		this.cancelBubble = true;
	},

	stopImmediatePropagation: function() {
		this.stop = true;
	},

	setType: function(type) {
		this.type = type;
	},

	setBubbles: function(bubbles) {
		this.bubbles = bubbles;
	},

	dispatchEvent: function(target) {
		var i; var i2; var list;
		this.target = target;

		if(this.bubbles) {
			var stack = [];

			var current = this.target;
			while((current !== undefined) && (current !== null)) {
				stack.push(current);
				current = current.parent;
			}

			// mode capture
			for(i = stack.length - 1; (i >= 0) && (!this.cancelBubble) && (!this.stop); i--) {
				current = stack[i];
				var handlers = current.getEventHandlers(this.type);
				for(var i2 = 0; (i2 < handlers.length) && (!this.stop); i2++) {
					var handler = handlers[i2];
					if(handler.capture)
						handler.method.apply(handler.scope, [this]);
				}
			}

			// bubble mode
			for(i = 0; (i < stack.length) && (!this.cancelBubble) && (!this.stop); i++) {
				current = stack[i];
				var handlers = current.getEventHandlers(this.type);
				for(var i2 = 0; (i2 < handlers.length) && (!this.stop); i2++) {
					var handler = handlers[i2];
					if(!handler.capture)
						handler.method.apply(handler.scope, [this]);
				}
			}
		}
		else {
			// capture before
			var handlers = current.getEventHandlers(this.type);
			for(var i2 = 0; (i2 < handlers.length) && (!this.stop); i2++) {
				var handler = handlers[i2];
				if(handler.capture)
					handler.method.apply(handler.scope, [this]);
			}

			// normal mode
			for(var i2 = 0; (i2 < handlers.length) && (!this.stop); i2++) {
				var handler = handlers[i2];
				if(!handler.capture)
					handler.method.apply(handler.scope, [this]);
			}
		}
	}
});
