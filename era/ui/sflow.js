
Core.Object.extend('Ui.SFlowState', {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	xpos: 0,
	ypos: 0,
	zones: undefined,
	currentZone: undefined,
	boxes: undefined,
	lineHeight: 0,
	drawCount: 0,
	drawCmd: undefined,
	drawWidth: 0,
	drawSpaceWidth: 0,
	render: false,
	centerstatus: false,
	spacing: 0,
	align: 'left',

	constructor: function(config) {
		this.width = config.width;
		delete(config.width);
		this.render = config.render;
		delete(config.render);
		if('spacing' in config) {
			this.spacing = config.spacing;
			delete(config.spacing);
		}
		if('align' in config) {
			this.align = config.align;
			delete(config.align);
		}
		this.zones = [ { xstart: 0, xend: this.width }];
		this.currentZone = 0;
		this.boxes = [];
		this.drawCmd = [];
	},

	getSize: function() {
		this.flush();
		return { width: this.width, height: this.ypos };
	},

	append: function(el) {
		var floatVal = Ui.SFlow.getFloat(el);
//		console.log(this+'.append('+el+') float: '+float);
		var	size = el.measure(this.width, 0);
		if(floatVal === 'none') {
			while(true) {
				var zone = this.zones[this.currentZone];
				var isstart = false;
				if(zone.xstart === this.xpos) isstart = true;
//				console.log('test xpos: '+this.xpos+', width: '+size.width+', xend: '+zone.xend);
				if(this.xpos + size.width + ((isstart)?0:this.spacing) <= zone.xend) {
					this.pushDraw({ width: size.width, height: size.height, spaceWidth: isstart?0:this.spacing, el: el });
					if(!isstart) this.xpos += this.spacing; 
					this.xpos += size.width;
					// enlarge line height if needed
					if(size.height > this.lineHeight) {
						this.lineHeight = size.height;
//						console.log('enlarge lineHeight: '+this.lineHeight);
					}
					break;
				}
				else {
//					console.log('not enought space, nextZone');
					this.nextZone();
				}
			}
		}
		// insert in the nearest free left part of the screen
		else if(floatVal === 'left') {
			while(true) {
				var zone = this.zones[this.currentZone];
				var isstartline = false;
				if(this.xpos === 0) isstartline = true; 
				if(isstartline && (size.width <= zone.xend - this.xpos)) {
					// draw
					if(this.render)
						el.arrange(this.xpos, this.ypos, size.width, size.height);
					// insert a box to reserve space
					this.insertBox({ x: this.xpos, y: this.ypos, width: size.width, height: size.height });
					break;
				}
				else
					this.nextZone();
			}
		}
		// insert in the nearest free right part of the screen
		else if(floatVal === 'right') {
			while(true) {
				var zone = this.zones[this.currentZone];
				var isendline = false;
				if(this.width == zone.xend) isendline = true;
				if(isendline && (size.width <= zone.xend - this.xpos)) {
					// draw
					if(this.render)
						el.arrange(zone.xend-size.width, this.ypos, size.width, size.height);
					// insert a box to reserve space
					this.insertBox({ x: zone.xend-size.width, y: this.ypos, width: size.width, height: size.height });
					break;
				}
				else
					this.nextZone();
			}
		} else if(DEBUG)
			throw('Invalid Ui.SFlow float policy ('+floatVal+')');
	},

	flushDraw: function() {
//		console.log('flushDraw currentZone: '+this.currentZone);
//		console.log(this.zones);
		if(this.render && (this.drawCmd.length > 0)) {
			var zone = this.zones[this.currentZone];
			var xpos = zone.xstart;
			var widthBonus = 0;
			
			if(this.align === 'right')
				xpos += (zone.xend - zone.xstart)-(this.drawWidth+this.drawSpaceWidth);
			else if(this.align === 'center')
				xpos += ((zone.xend - zone.xstart)-(this.drawWidth+this.drawSpaceWidth))/2;
			else if(this.align === 'stretch')
				widthBonus = ((zone.xend - zone.xstart)-(this.drawWidth+this.drawSpaceWidth))/this.drawCmd.length;
			
			for(var i = 0; i < this.drawCmd.length; i++) {
				var cmd = this.drawCmd[i];
//				console.log('flushDraw el '+(xpos+cmd.spaceWidth)+', '+this.ypos+', '+cmd.width+', '+cmd.height);
				cmd.el.arrange(xpos+cmd.spaceWidth, this.ypos, cmd.width+widthBonus, this.lineHeight);
				xpos += cmd.width + cmd.spaceWidth + widthBonus;
			}
		}
		this.drawCmd = [];
		this.drawWidth = 0;
		this.drawCount = 0;
		this.drawSpaceWidth = 0;
	},

	pushDraw: function(cmd) {
//		console.log('pushDraw');
//		console.log(cmd);
		this.drawCmd.push(cmd);
		this.drawCount++;
		this.drawWidth += cmd.width;
		this.drawSpaceWidth += cmd.spaceWidth;
	},

	insertBox: function(box) {
		this.boxes.push(box);
		this.calculZone();
	},

	calculZone: function() {
		this.zones = [{ xstart: 0, xend: this.width }];
		for(var i2 = 0; i2 < this.boxes.length; i2++) {
			var box = this.boxes[i2];
			// check if y match
			if((this.ypos+this.lineHeight < box.y) || (this.ypos >= box.y+box.height)) {
				continue;
			}
			var tmpZones = [];
			for(var i = 0; i < this.zones.length; i++) {
				var zone = this.zones[i];
				// check different x split
				if((box.x <= zone.xstart) && (box.x+box.width < zone.xend))
					tmpZones.push({ xstart: box.x+box.width, xend: zone.xend });
				else if((box.x < zone.xend) && (box.x+box.width >= zone.xend))
					tmpZones.push({ xstart: zone.xstart, xend: box.x });
				else if((box.x > zone.xstart) && (box.x+box.width < zone.xend)) {
					tmpZones.push({ xstart: zone.xstart, xend: box.x });
					tmpZones.push({ xstart: box.x+box.width, xend: zone.xend });
				}
				else if((box.x <= zone.xstart) && (box.x+box.width >= zone.xend)) {
					// no resulting zone
				}
				else {
					// zone not changed by the box
					tmpZones.push({ xstart: zone.xstart, xend: zone.xend });
				}
			}
			this.zones = tmpZones;
		}
		// search the zone we are in now
		for(this.currentZone = 0; this.currentZone < this.zones.length; this.currentZone++) {
			var zone = this.zones[this.currentZone];
			if((this.xpos >= zone.xstart) && (this.xpos <= zone.xend)) {
				break;
			}
		}
		// we are in no zone
		if(this.currentZone >= this.zones.length) {
			this.currentZone = -1;
			// look for the first available zone after xpos
			for(this.currentZone = 0; this.currentZone < this.zones.length; this.currentZone++) {
				var zone = this.zones[this.currentZone];
				if(zone.xstart >= this.xpos) {
					this.xpos = zone.xstart;
					break;
				}
			}
			// we dont found a correct zone, jump to next line
			if(this.currentZone >= this.zones.length) {
				this.nextLine();
			}
		}
	},

	flush: function() {
//		console.log('flush');
		// if some draw command have not been done, flush the current line
		if(this.drawCount != 0) this.nextLine();
		while(true) {
			var zone = this.zones[this.currentZone];
			if((zone.xstart == this.xpos) &&  (zone.xend == this.xpos+this.width)) {
//				console.log('flush free zone found');
				break;
			}
			else {
//				console.log('flush nextZone xstart: '+zone.xstart+', xend: '+zone.xend);
				this.nextZone();
			}
		}
	},

	nextLine: function() {
//		console.log('nextLine lineHeight: '+this.lineHeight);
//		return;
		this.flushDraw();
		do {
			// start by ending this line
			if(this.lineHeight > 0) {
				this.ypos += this.lineHeight + this.spacing;
				this.lineHeight = 0;
				this.calculZone();
			}
			// find the next position that is going
			// to provide a new set of zones
			else if(this.boxes.length > 0) {
//				console.log('nextLine lineHeight == 0');
			
				var nexty = Number.MAX_VALUE;
				for(var i = 0; i < this.boxes.length; i++) {
					var box = this.boxes[i];
					if((this.ypos < box.y + box.height) && (nexty > box.y + box.height))
						nexty = box.y + box.height;
				}
				if(nexty !== Number.MAX_VALUE)
					this.ypos = nexty + this.spacing;
//				else
//					this.ypos += 10;
				this.calculZone();
//				console.log('nexty: '+nexty+', zone count: '+this.zones.length);
//				console.log(this.zones);
//				throw('break');
			}
		} while(this.zones.length == 0);
		this.currentZone = 0;
		this.xpos = this.zones[0].xstart;
	},
		
	nextZone: function() {
		this.flushDraw();
		// last zone, go next line
		if(this.currentZone >= this.zones.length-1) {
//			console.log('nextZone will call nextLine');
			this.nextLine();
		}
		else {
			this.currentZone++;
			this.xpos = this.zones[this.currentZone].xstart;
		}
	}
});

Ui.Container.extend('Ui.SFlow', 
/**@lends Ui.SFlow#*/
{
	uniform: false,
	uniformWidth: undefined,
	uniformHeight: undefined,
	itemAlign: 'left',
	spacing: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */	
	constructor: function(config) {
	},

	/*
	 * Replace all item by the given one or the
	 * array of given items
	 */
	setContent: function(content) {
		while(this.getFirstChild() != undefined)
			this.removeChild(this.getFirstChild());
		if((content !== undefined) && (typeof(content) == 'object')) {
			if(content.constructor == Array) {
				for(var i = 0; i < content.length; i++)
					this.appendChild(Ui.Element.create(content[i]));
			}
			else
				this.appendChild(Ui.Element.create(content));
		}
	},
	
	/*
	 * Return the space between each item and each line
	 */
	getSpacing: function() {
		return this.spacing;
	},
	
	/*
	 * Set the space between each item and each line
	 */
	setSpacing: function(spacing) {
		if(this.spacing != spacing) {
			this.spacing = spacing;
			this.invalidateMeasure();
			this.invalidateArrange();
		}
	},
	
	/*
	 * Return item horizontal alignment [left|right|center|stretch]
	 */
	getItemAlign: function() {
		return this.itemAlign;
	},
	
	/*
	 * Choose howto horizontaly align items [left|right|center|stretch]
	 */
	setItemAlign: function(itemAlign) {
		if(itemAlign != this.itemAlign) {
			this.itemAlign = itemAlign;
			this.invalidateMeasure();
			this.invalidateArrange();
		}
	},

	/**
	 * true if all children will be arrange to have the
	 * same width and height
	 */
	getUniform: function() {
		return this.uniform;
	},

	/**
	 * Set true to force children arrangement to have the
	 * same width and height
	 */
	setUniform: function(uniform) {
		if(this.uniform != uniform) {
			this.uniform = uniform;
			this.invalidateMeasure();
		}
	},

	/**
	 * Append a child at the end of the flow
	 */
	append: function(child, floatVal) {
		this.appendChild(child);
		if(floatVal)
			Ui.SFlow.setFloat(child, floatVal);
	},

	/**
	 * Append a child at the begining of the flow
	 */
	prepend: function(child, floatVal) {
		this.prependChild(child);
		if(floatVal)
			Ui.SFlow.setFloat(child, floatVal);
	},

	/**
	 * Append a child at the given position
	 */
	insertAt: function(child, position, floatVal) {
		this.insertChildAt(child, position);
		if(floatVal)
			Ui.SFlow.setFloat(child, floatVal);
	},

	/*
	 * Move a given item from its current position to
	 * the given one
	 */
	moveAt: function(child, position) {
		this.moveChildAt(child, position);
	},

	/**
	 * Remove a child from the flow
	 */
	remove: function(child) {
		this.removeChild(child);
	},

	/**#@+
	 * @private
	 */

	measureChildrenNonUniform: function(width, height) {
		var line = { pos: 0, y: 0, width: 0, height: 0 };
		var ctx = { lineX: 0, lineY: 0, lineCount: 0, lineHeight: 0, minWidth: 0 };

		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height);
			if((ctx.lineX != 0) && (ctx.lineX + size.width > width)) {
				line.width = ctx.lineX - this.spacing;
				line.height = ctx.lineHeight;
				ctx.lineX = 0;
				ctx.lineY += ctx.lineHeight + this.spacing;
				ctx.lineHeight = 0;

				ctx.lineCount++;
				line = { pos: ctx.lineCount, y: ctx.lineY, width: 0, height: 0 };
			}
			child.flowLine = line;
			child.flowLineX = ctx.lineX;
			ctx.lineX += size.width + this.spacing;
			if(size.height > ctx.lineHeight)
				ctx.lineHeight = size.height;
			if(ctx.lineX > ctx.minWidth)
				ctx.minWidth = ctx.lineX;
		}
		ctx.lineY += ctx.lineHeight;
		line.width = ctx.lineX;
		line.height = ctx.lineHeight;

		return { width: ctx.minWidth, height: ctx.lineY };
	},

	measureChildrenUniform: function(width, height) {
		var maxWidth = 0;
		var maxHeight = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height);
			if(size.width > maxWidth)
				maxWidth = size.width;
			if(size.height > maxHeight)
				maxHeight = size.height;
		}
		var countPerLine = Math.max(Math.floor((width+this.spacing)/(maxWidth+this.spacing)), 1);
		
		var nbLine = Math.ceil(this.getChildren().length / countPerLine);

		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(maxWidth, maxHeight);
		this.uniformWidth = maxWidth;
		this.uniformHeight = maxHeight;
		return {
			width: maxWidth*countPerLine + (countPerLine-1)*this.spacing,
			height: nbLine*maxHeight + (nbLine-1)*this.spacing
		};
	}
	/**#@-*/
}, 
/**@lends Ui.SFlow#*/
{
	measureCore: function(width, height) {
//		console.log(this+'.measureCore('+width+','+height+')');

		if(this.getChildren().length == 0)
			return { width: 0, height: 0 };

		var state = new Ui.SFlowState({ width: width, render: false, spacing: this.spacing, align: this.itemAlign });
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			state.append(child);
		}
		var size = state.getSize();
//		console.log(this+'.measureCore('+width+','+height+') => '+size.width+'x'+size.height);
		return size;
//		return state.getSize();
	},

	arrangeCore: function(width, height) {
		var state = new Ui.SFlowState({ width: width, render: true, spacing: this.spacing, align: this.itemAlign });
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			state.append(child);
		}
		state.getSize();
	}
}, {
	getFloat: function(child) {
		return child['Ui.SFlow.float']?child['Ui.SFlow.float']:'none';
	},

	setFloat: function(child, floatVal) {
		if(Ui.SFlow.getFloat(child) != floatVal) {
			child['Ui.SFlow.float'] = floatVal;
			child.invalidateMeasure();
		}
	}
});

