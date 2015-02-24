
Ui.LBox.extend('Ui.DropBox', {
	watchers: undefined,
	allowedTypes: undefined,

	constructor: function(config) {
		this.addEvents('drageffect', 'dragenter', 'dragleave', 'drop', 'dropfile');
		this.watchers = [];
		this.connect(this, 'dragover', this.onDragOver);
	},

	addType: function(type, effects) {
		if(typeof(type) === 'string')
			type = type.toLowerCase();
		if(this.allowedTypes === undefined)
			this.allowedTypes = [];
		if(typeof(effects) === 'string')
			effects = [ effects ];
		if(typeof(effects) !== 'function') {
			for(var i = 0; i < effects.length; i++) {
				var effect = effects[i];
				if(typeof(effect) === 'string')
					effect = { action: effect };
				if(!('text' in effect)) {
					if(effect.action === 'copy')
						effect.text = 'Copier';
					else if(effect.action === 'move')
						effect.text = 'Déplacer';
					else if(effect.action === 'link')
						effect.text = 'Lier';
					else
						effect.text = effect.action;
				}
				if(!('dragicon' in effect))
					effect.dragicon = 'drag'+effect.action;
				effects[i] = effect;
			}
		}
		this.allowedTypes.push({ type: type, effect: effects });
	},

	onDragOver: function(event) {
//		console.log(this+'.onDragOver effectAllowed: ');
//		console.log(event.dataTransfer);

		// test if we already captured this dataTransfer
		var found = false;
		for(var i = 0; !found && (i < this.watchers.length); i++)
			found = (this.watchers[i].getDataTransfer() === event.dataTransfer);

		if(!found) {
			// get allowed effect for the given dataTransfer
			var effect = this.onDragEffect(event.dataTransfer);
			if((effect !== undefined) && (effect.length > 0)) {
				// capture the dataTransfer
				var watcher = event.dataTransfer.capture(this, effect);
				this.watchers.push(watcher);
				this.connect(watcher, 'move', this.onWatcherMove);
				this.connect(watcher, 'drop', this.onWatcherDrop);
				this.connect(watcher, 'leave', this.onWatcherLeave);
				event.stopImmediatePropagation();

				this.onWatcherEnter(watcher);
			}
		}
		// we are already interrested
		else
			event.stopImmediatePropagation();
	},

	getWatchers: function() {
		return this.watchers;
	},

	onWatcherEnter: function(watcher) {
		this.onDragEnter(watcher.getDataTransfer());
	},

	onWatcherMove: function(watcher) {
	},

	onWatcherDrop: function(watcher, effect, x, y) {
		var point = this.pointFromWindow(new Ui.Point({ x: x, y: y }));
		this.onDrop(watcher.getDataTransfer(), effect, point.getX(), point.getY());
	},

	onWatcherLeave: function(watcher) {
		var found = false;
		var i = 0;
		for(; !found && (i < this.watchers.length); i++) {
			found = (this.watchers[i] === watcher);
		}
		i--;
		if(found)
			this.watchers.splice(i, 1);
		if(this.watchers.length === 0)
			this.onDragLeave();
	},

	getAllowedTypesEffect: function(dataTransfer) {
		if(this.allowedTypes !== undefined) {
			var data = dataTransfer.getData();
			var effect = undefined;
			for(var i = 0; (effect === undefined) && (i < this.allowedTypes.length); i++) {
				var type = this.allowedTypes[i];
				if(typeof(type.type) === 'string') {
				 	if(Ui.DragNativeData.hasInstance(data)) {
				 		if((type.type === 'files') && data.hasFiles())
				 			effect = type.effect;
				 		else if(((type.type === 'text') || (type.type === 'text/plain')) && data.hasTypes('text/plain', 'text'))
				 			effect = type.effect;
				 		else if(data.hasType(type.type))
							effect = type.effect;
				 	}
				}
				else if(type.type.hasInstance(data))
					effect = type.effect;
			}
			if(typeof(effect) === 'function') {
				var effects = this.onDragEffectFunction(dataTransfer, effect);

				for(var i = 0; i < effects.length; i++) {
					var effect = effects[i];
					if(typeof(effect) === 'string')
						effect = { action: effect };
					if(!('text' in effect)) {
						if(effect.action === 'copy')
							effect.text = 'Copier';
						else if(effect.action === 'move')
							effect.text = 'Déplacer';
						else if(effect.action === 'link')
							effect.text = 'Lier';
						else if(effect.action === 'run')
							effect.text = 'Exécuter';
						else if(effect.action === 'play')
							effect.text = 'Jouer';
						else
							effect.text = effect.action;
					}
					if(!('dragicon' in effect))
						effect.dragicon = 'drag'+effect.action;
					effects[i] = effect;
				}
				effect = effects;
			}
			if(effect === undefined)
				effect = [];
			return effect;
		}
		else
			return [];
	},

	//
	// Override to allow a drop for the given dataTransfer.
	// This method return the possible allowed effect [move|copy|link|...] in an array
	//
	onDragEffect: function(dataTransfer) {
		var dragEvent = new Ui.DragEvent({
			type: 'drageffect', bubbles: false,
			dataTransfer: dataTransfer
		});
		dragEvent.dispatchEvent(this);
		var effectAllowed = dragEvent.getEffectAllowed();
		if(effectAllowed !== undefined)
			return dragEvent.getEffectAllowed();
		else
			return this.getAllowedTypesEffect(dataTransfer);
	},

	onDragEffectFunction: function(dataTransfer, func) {
		return func(dataTransfer.getData());
	},

	//
	// Override to get the drop when it happends. The default
	// action is to raise the 'drop' event.
	//
	onDrop: function(dataTransfer, dropEffect, x, y) {
		var done = false;
		if(!this.fireEvent('drop', this, dataTransfer.getData(), dropEffect, x, y)) {
			var data = dataTransfer.getData();
			if(Ui.DragNativeData.hasInstance(data) && data.hasFiles()) {
				var files = data.getFiles();
				var done = true;
				for(var i = 0; i < files.length; i++)
					done &= this.fireEvent('dropfile', this, files[i], dropEffect, x, y);
			}
		}
		else
			done = true;
		return done;
	},

	//
	// Override to do something when the first allowed drag enter the element.
	// The default action is to raise the 'dragenter' event
	//	
	onDragEnter: function(dataTransfer) {
		this.fireEvent('dragenter', this, dataTransfer.getData());
	},

	//
	// Override to do something when the last allowed drag leave the element.
	// The default action is to raise the 'dragleave' event
	//	
	onDragLeave: function() {
		this.fireEvent('dragleave', this);
	}
});

