
Ui.Fold.extend('Laclasse.HomeBar', {
	appLauncher: undefined,
	logo: undefined,
	offset: 0,
	isOpen: false,
	openClock: undefined,

	constructor: function(config) {
		this.setOrientation('horizontal');
		this.setOver(true);
		this.setMode('slide');

		var lbox = new Ui.LBox({ width: 120 });
		lbox.appendChild(new Ui.Rectangle({ fill: '#f9f9f9' }));
		var vbox = new Ui.VBox({ width: 120 });
		lbox.appendChild(vbox);
		this.setHeader(lbox);

		this.logo = new Ui.Image({ margin: 10, width: 100, height: 100, horizontalAlign: 'center', verticalAlign: 'center' });
		vbox.appendChild(this.logo);

		lbox = new Ui.LBox();
		lbox.appendChild(new Ui.Rectangle({ fill: '#f9f9f9' }));
		this.appLauncher = new Laclasse.AppLauncher();
		lbox.appendChild(this.appLauncher);		
		this.setContent(lbox);

		this.connect(this.appLauncher, 'launch', this.onAppLaunch);

		if(config.logo != undefined)
			this.setLogo(config.logo);

		this.addEvents('launch');
	},

	onAppLaunch: function(appLocation) {
		this.fireEvent('launch', appLocation);
		this.fold();
	},

	getApplicationByMimetype: function(mimetype) {
		return this.appLauncher.getApplicationByMimetype(mimetype);
	},

	setLogo: function(logo) {
		this.logo.setSrc(logo);
	},
});
