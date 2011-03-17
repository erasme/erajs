
Era.Dialog = Era.extend('dialog', Era.VBox, {
	popupElement: undefined,
	modal: false,
	autoclose: false,

	constructor: function(config) {
		if(config == undefined)
			config = {};
		this.superConstructor(config);
		if(config.modal)
			this.modal = true;
		if(config.autoclose)
			this.autoclose = true;

		this.addClass('dialog');
		this.addClass('hidden');
		this.ui.style.overflow = 'visible';

		this.anchor = new Era.DialogAnchorBox();
		this.anchor.add(new Era.DialogAnchor());
		this.anchor.setPosition(0, 0);
		this.add(this.anchor);
		this.connect(Era.currentApp, 'resized', this.updatePosition);
		this.connect(this.ui, 'DOMSubtreeModified', this.updatePosition);

		this.addEvents('closed');
	},

	updatePosition: function() {
		if(!this.checkClass('hidden')) {
			var appSize = Era.currentApp.getSize();
			var size = this.getSize();

			if(this.popupElement == undefined) {
				if(!this.getResizable())
					this.setPosition((appSize.width - size.width)/2, (appSize.height - size.height)/2);
			}
			else {
				var pagePoint = this.popupElement.pointToPage({ x: (this.popupElement.getWidth()/2), y: this.popupElement.getHeight() });
				var x = pagePoint.x - 30;
				// correct x to avoid offscreen
				if(pagePoint.x - 30 + size.width > appSize.width)
					x = appSize.width - (size.width + 10);

				if(this.getResizable()) {
					this.setPosition(undefined, undefined);
					this.setTop(pagePoint.y);
					this.setLeft(0);
					this.setRight(0);
					this.setBottom(0);
				}
				else
					this.setPosition(x, pagePoint.y);
				this.anchor.setPosition(pagePoint.x - x, -10);
			}
		}
	},

	virtualShow: function() {
		var element = undefined;
		var anim = undefined;
		if(arguments.length == 2) {
			element = arguments[0];
			anim = arguments[1];
		}
		else if(arguments.length == 1) {
			if(Era.isObject(arguments[0]) && arguments[0].isSubclass(Era.Element))
				element = arguments[0];
			else
				anim = arguments[0];
		}

		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}

		this.ui.style.pointerEvents = '';
		this.ui.style.opacity = 1;

		this.popupElement = element;

		if(this.modal || (this.popupElement != undefined)) {
			this.eventcatcher = new Era.DialogEventCatcher();
			Era.currentApp.add(this.eventcatcher);
			this.connect(this.eventcatcher, 'pressed', function() {
				if((this.popupElement != undefined) || (this.modal && this.autoclose))
					this.hide();
			});
		}
		// set the content in the body
		Era.currentApp.add(this);

		// popup
		if(this.popupElement != undefined) {
			this.updatePosition();
			this.anchor.show(undefined);
		}
		// center screen position
		else {
			this.anchor.hide(undefined);

			if(this.getResizable()) {
				this.setPosition(undefined, undefined);
				this.setLeft(0);
				this.setRight(0);
				this.setTop(0);
				this.setBottom(0);
			}
			else
				this.updatePosition();
		}

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('in');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
			});
			anim.run(this);
		}

		Era.util.delayedcall(0, this.updatePosition, this);
	},

	virtualHide: function(anim) {
		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}

		this.ui.style.pointerEvents = 'none';

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('out');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
				if(this.eventcatcher != undefined) {
					Era.currentApp.remove(this.eventcatcher);
					this.eventcatcher = undefined;
				}
				Era.currentApp.remove(this);
				this.fireEvent('closed');
			});
			anim.run(this);
		}
		else {
			if(this.eventcatcher != undefined) {
				Era.currentApp.remove(this.eventcatcher);
				this.eventcatcher = undefined;
			}
			Era.currentApp.remove(this);
			this.fireEvent('closed');
		}
	},
});

Era.DialogAnchorBox = Era.extend('dialoganchorbox', Era.VBox, {
	constructor: function(config) {
		this.superConstructor(config);
		this.ui.style.overflow = 'visible';
	},
});

Era.DialogAnchor = Era.extend('dialoganchor', Era.Element, {
	constructor: function(config) {
		this.superConstructor(config);
	},
});

Era.DialogEventCatcher = Era.extend('dialogeventcatcher', Era.Button, {
	constructor: function(config) {
		this.superConstructor(config);
		this.ui.style.position = 'absolute';
		this.ui.style.left = '0px';
		this.ui.style.right = '0px';
		this.ui.style.top = '0px';
		this.ui.style.bottom = '0px';
	},
});
