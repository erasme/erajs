
Era.ModalDialog = Era.extend('modaldialog', Era.VBox, {
	autoclose: false,

	constructor: function(config) {
		if(config == undefined)
			config = {};
		this.superConstructor(config);
		if(config.autoclose)
			this.autoclose = true;

		this.addClass('modaldialog');
		this.addClass('hidden');
		this.ui.style.overflow = 'visible';

		this.addEvents('closed');
	},

	virtualShow: function(anim) {
		this.openAnim = anim;

		if(this.showAnim != undefined) {
			this.showAnim.abort();
			this.showAnim = undefined;
		}

		this.ui.style.pointerEvents = '';

		this.container = new Era.VBox({ baseCls: 'modaldialogcontainer', resizable: true, align: 'center', pack: 'center', left: 0, right: 0, top: 0, bottom: 0 });
		this.container.add(this);
		Era.currentApp.add(this.container);

		if(this.autoclose) {
			this.connect(this.container, 'mousedown', function(mouse, button) {
				if(button != 0)
					return;
				mouse.capture(this.container);
				this.connect(this.container, 'mouseup', function(mouse, button) {
					if(button != 0)
						return;
					mouse.release();
					this.disconnect(this.container, 'mouseup');
					this.onContainerPressed();
				});
			});
			this.connect(this.container, 'touchend', function(event) {
				this.onContainerPressed();
			});

			this.connect(this, 'mousedown', function(mouse, button) {});
			this.connect(this, 'touchend', function(event) {});
		}

		if(anim != undefined) {
			anim = Era.create(anim);
			anim.setMode('in');

			this.showAnim = anim;
			this.connect(anim, 'done', function() {
				this.showAnim = undefined;
			});
			anim.run(this.container);
		}
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
				Era.currentApp.remove(this.container);
				this.fireEvent('closed');
			});
			anim.run(this.container);
		}
		else {
			Era.currentApp.remove(this.container);
			this.fireEvent('closed');
		}
	},

	onContainerPressed: function() {
		this.hide(this.openAnim);
	},
});

