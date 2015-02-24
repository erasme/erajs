
Ui.DropBox.extend('Ui.DropAtBox', {
	container: undefined,
	fixed: undefined,
	markerOrientation: 'horizontal',

	constructor: function(config) {
		this.addEvents('dropat', 'dropfileat');
		this.fixed = new Ui.Fixed();
		Ui.DropAtBox.base.append.call(this, this.fixed);
	},

	setContainer: function(container) {
		this.container = container;
		Ui.DropAtBox.base.append.call(this, this.container);
	},

	getContainer: function() {
		return this.container;
	},

	setMarkerOrientation: function(orientation) {
		this.markerOrientation = orientation;
	},

	setMarkerPos: function(marker, pos) {
		marker.show();
		var spacing = 0;
		if('getSpacing' in this.container)
			spacing = this.container.getSpacing();
		if(pos < this.container.getChildren().length) {
			var child = this.container.getChildren()[pos];

			if(this.markerOrientation === 'horizontal') {
				var x = child.getLayoutX() - child.getMarginLeft() -
					(marker.getLayoutWidth() + marker.getMarginLeft() + marker.getMarginRight() + spacing)/2;
				var y = child.getLayoutY();
				var height = child.getLayoutHeight();
				marker.setHeight(height);
				this.fixed.setPosition(marker, x, y);
			}
			else {
				var x = child.getLayoutX();
				var y = child.getLayoutY() - child.getMarginTop() - (marker.getLayoutHeight() + marker.getMarginTop() + marker.getMarginBottom())/2 - spacing/2;
				marker.setWidth(child.getLayoutWidth());
				this.fixed.setPosition(marker, x, y);
			}
		}
		else if(this.container.getChildren().length > 0) {
			var child = this.container.getChildren()[this.container.getChildren().length-1];

			if(this.markerOrientation === 'horizontal') {
				var x = child.getLayoutX() + child.getLayoutWidth() - (marker.getLayoutWidth() - spacing)/2;
				var y = child.getLayoutY();
				var height = child.getLayoutHeight();
				marker.setHeight(height);
				this.fixed.setPosition(marker, x, y);
			}
			else {
				var x = child.getLayoutX();
				var y = child.getLayoutY() + child.getLayoutHeight() - marker.getLayoutHeight()/2;
				marker.setWidth(child.getLayoutWidth());
				this.fixed.setPosition(marker, x, y);
			}
		}
	},

	findPosition: function(point) {
		if(this.markerOrientation === 'horizontal')
			return this.findPositionHorizontal(point);
		else
			return this.findPositionVertical(point);
	},

	findPositionHorizontal: function(point) {
		var line = [];
		var childs = this.container.getChildren();
		for(var i = 0; i < childs.length; i++) {
			if((point.y >= childs[i].getLayoutY()) && (point.y < childs[i].getLayoutY() + childs[i].getLayoutHeight()))
				line.push(childs[i]);
		}
		var element = undefined;
		var dist = Number.MAX_VALUE;
		for(var i = 0; i < line.length; i++) {
			var cx = line[i].getLayoutX() + ((line[i].getLayoutWidth())/2);
			var d = Math.abs(point.x - cx);
			if(d < dist) {
				dist = d;
				element = line[i];
			}
		}
		if((element === undefined) && (line.length > 0))
			element = line[line.length-1];

		var insertPos = childs.length;
		if(element !== undefined) {
			// find element pos
			var elPos = -1;
			for(var i = 0; (elPos == -1) && (i < childs.length); i++) {
				if(childs[i] == element)
					elPos = i;
			}
			if(point.x < element.getLayoutX()+element.getLayoutWidth()/2)
				insertPos = elPos;
			else
				insertPos = elPos+1;
		}		
		return insertPos;
	},

	findPositionVertical: function(point) {
		var childs = this.container.getChildren();
		
		var element = undefined;
		var dist = Number.MAX_VALUE;
		for(var i = 0; i < childs.length; i++) {
			var cy = childs[i].getLayoutY() + ((childs[i].getLayoutHeight())/2);
			var d = Math.abs(point.y - cy);
			if(d < dist) {
				dist = d;
				element = childs[i];
			}
		}
		if((element === undefined) && (childs.length > 0))
			element = childs[childs.length-1];

		var insertPos = childs.length;
		if(element !== undefined) {
			// find element pos
			var elPos = -1;
			for(var i = 0; (elPos === -1) && (i < childs.length); i++) {
				if(childs[i] === element)
					elPos = i;
			}
			if(point.y < element.getLayoutY()+element.getLayoutHeight()/2)
				insertPos = elPos;
			else
				insertPos = elPos+1;
		}
		return insertPos;
	},

	insertAt: function(element, pos) {
		this.container.insertAt(element, pos);
	},
	
	moveAt: function(element, pos) {
		this.container.moveAt(element, pos);
	},
	
	getLogicalChildren: function() {
		return this.container.getChildren();
	}

}, {
	setContent: function(content) {
		this.container.setContent(content);
	},

	clear: function() {
		this.container.clear();
	},

	append: function(item) {
		this.container.append(item);
	},

	remove: function(item) {
		this.container.remove(item);
	},

	onStyleChange: function() {
		var color = this.getStyleProperty('markerColor');
		var watchers = this.getWatchers();
		for(var i = 0; i < watchers.length; i++) {
			var marker = (watchers[i])["Ui.DropAtBox.marker"];
			marker.setFill(color);
		}
	},

	onDragOver: function(event) {
		// test if we already captured this dataTransfer
		var foundWatcher = undefined;
		for(var i = 0; (foundWatcher === undefined) && (i < this.getWatchers().length); i++)
			if(this.getWatchers()[i].getDataTransfer() === event.dataTransfer)
				foundWatcher = this.getWatchers()[i];

		// get allowed effect for the given dataTransfer
		var effect = this.onDragEffect(event.dataTransfer);

		if(foundWatcher !== undefined) {
			var equal = effect.length === foundWatcher.getEffectAllowed();
			for(var i = 0; equal && (i < effect.length); i++) {
				equal = effect[i] === foundWatcher.getEffectAllowed()[i];
			}
			if(!equal) {
				foundWatcher.release();
				foundWatcher = undefined;
			}
		}

		if((effect !== undefined) && (effect.length > 0) && (foundWatcher === undefined)) {
			// capture the dataTransfer
			var watcher = event.dataTransfer.capture(this, effect);
			this.watchers.push(watcher);
			this.connect(watcher, 'move', this.onWatcherMove);
			this.connect(watcher, 'drop', this.onWatcherDrop);
			this.connect(watcher, 'leave', this.onWatcherLeave);
			event.stopImmediatePropagation();

			this.onWatcherEnter(watcher);
		}
		// we are already interrested
		else if(foundWatcher !== undefined)
			event.stopImmediatePropagation();
	},

	onDragEffectFunction: function(dataTransfer, func) {
		var position = this.findPosition(this.pointFromWindow(dataTransfer.getPosition()));
		return func(dataTransfer.getData(), position);
	},

	onWatcherEnter: function(watcher) {
		Ui.DropAtBox.base.onWatcherEnter.apply(this, arguments);

		var marker = new Ui.Frame({ margin: 2, frameWidth: 2, width: 6, height: 6 });
		marker.setFill(this.getStyleProperty('markerColor'));
		marker.hide();
		this.fixed.append(marker);

		watcher["Ui.DropAtBox.marker"] = marker;
	},

	onWatcherMove: function(watcher) {
		Ui.DropAtBox.base.onWatcherMove.apply(this, arguments);

		var marker = watcher["Ui.DropAtBox.marker"];
		var position = this.findPosition(this.pointFromWindow(watcher.getPosition()));
		this.setMarkerPos(marker, position);
	},

	onDrop: function(dataTransfer, dropEffect, x, y) {
		var done = false;

		if(!Ui.DropAtBox.base.onDrop.apply(this, arguments)) {
			var point = new Ui.Point({ x: x, y: y });
			var position = this.findPosition(point);

			if(!this.fireEvent('dropat', this, dataTransfer.getData(), dropEffect, position, x, y)) {
				var data = dataTransfer.getData();
				if(Ui.DragNativeData.hasInstance(data) && data.hasFiles()) {
					var files = data.getFiles();
					var done = true;
					for(var i = 0; i < files.length; i++)
						done &= this.fireEvent('dropfileat', this, files[i], dropEffect, position, x, y);
				}
			}
			else
				done = true;
		}
		else
			done = true;
		return done;
	},

	onWatcherLeave: function(watcher) {
		Ui.DropAtBox.base.onWatcherLeave.apply(this, arguments);

		var marker = watcher["Ui.DropAtBox.marker"];
		this.fixed.remove(marker);
	}
}, {
	style: {
		markerColor: new Ui.Color({ r: 0.4, g: 0, b: 0.35, a: 0.8 })
	}
});

Ui.DropAtBox.extend('Ui.FlowDropBox', {
	constructor: function(config) {
		this.setContainer(new Ui.Flow());
		this.setMarkerOrientation('horizontal');
	},

	setUniform: function(uniform) {
		this.getContainer().setUniform(uniform);
	},

	setSpacing: function(spacing) {
		this.getContainer().setSpacing(spacing);
	}
});

Ui.DropAtBox.extend('Ui.SFlowDropBox', {
	constructor: function(config) {
		this.setContainer(new Ui.SFlow());
		this.setMarkerOrientation('horizontal');
	},

	setStretchMaxRatio: function(ratio) {
		this.getContainer().setStretchMaxRatio(ratio);		
	},

	setUniform: function(uniform) {
		this.getContainer().setUniform(uniform);
	},

	setItemAlign: function(align) {
		this.getContainer().setItemAlign(align);
	},

	setSpacing: function(spacing) {
		this.getContainer().setSpacing(spacing);
	}
});

Ui.DropAtBox.extend('Ui.VDropBox', {
	constructor: function(config) {
		this.setContainer(new Ui.VBox());
		this.setMarkerOrientation('vertical');
	},

	setUniform: function(uniform) {
		this.getContainer().setUniform(uniform);
	},

	setSpacing: function(spacing) {
		this.getContainer().setSpacing(spacing);
	}
});

Ui.DropAtBox.extend('Ui.HDropBox', {
	constructor: function(config) {
		this.setContainer(new Ui.HBox());
		this.setMarkerOrientation('horizontal');
	},

	setUniform: function(uniform) {
		this.getContainer().setUniform(uniform);
	},

	setSpacing: function(spacing) {
		this.getContainer().setSpacing(spacing);
	}
});