
Ui.Pressable.extend('Laclasse.AppLauncherItem', {
	fileRequest: undefined,
	location: undefined,
	label: undefined,
	mimetypes: undefined,

	constructor: function(config) {
		this.setWidth(56);
		this.setMargin(10);

		this.location = config.location;

		var vbox = new Ui.VBox();
		this.appendChild(vbox);
	
		var image = new Ui.Image({ src: this.location+'/icon.png', width: 48, height: 48, horizontalAlign: 'center', verticalAlign: 'center' });
		vbox.appendChild(image);
		this.label = new Ui.Text({ text: '', width: 56, horizontalAlign: 'center' });
		vbox.appendChild(this.label);

		this.fileRequest = new Core.HttpRequest({ url: this.location+'/desc.js' });
		this.connect(this.fileRequest, 'done', this.onDescDone);
		this.fileRequest.send();
	},

	getLocation: function() {
		return this.location;
	},

	getMimetypes: function() {
		return this.mimetypes;
	},

	onDescDone: function() {
		var desc = this.fileRequest.getResponseJSON();
		this.label.setText(desc.name);
		this.mimetypes = desc.mimetypes;
		this.fileRequest = undefined;
	},

});


Ui.ScrollingArea.extend('Laclasse.AppLauncher', {
	applicationsRequest: undefined,
	apps: undefined,

	constructor: function(config) {
		// disable horizontal scrolling
		this.setScrollHorizontal(false);

		this.applicationsRequest = new Core.HttpRequest({ url: 'getApplications.php' });
		this.connect(this.applicationsRequest, 'done', this.onApplicationsDone);
		this.applicationsRequest.send();
		this.addEvents('launch');
	},

	onApplicationsDone: function() {
		var apps = this.applicationsRequest.getResponseJSON().applications;
		var rows = '';
		for(var i = 0; i < Math.ceil(apps.length/2); i++) {
			if(rows != '')
				rows += ',';
			rows += 'auto';
		}
		var grid = new Ui.Grid({ cols: 'auto,auto', rows: rows });
		this.setContent(grid);
	
		this.apps = [];

		for(var i = 0; i < apps.length; i++) {
			console.log('app: '+apps[i]);
			var appItem = new Laclasse.AppLauncherItem({ location: apps[i] });

/*			var button = new Ui.Button({ width: 56, decoration: false, margin: 10 });
			var buttonVBox = new Ui.VBox();
			button.appendChild(buttonVBox);
	
			var image = new Ui.Image({ src: apps[i]+'/icon.png', width: 48, height: 48, horizontalAlign: 'center', verticalAlign: 'center' });
			buttonVBox.appendChild(image);
			var label = new Ui.Text({ text: apps[i].substring(13), width: 56, horizontalAlign: 'center' });
			buttonVBox.appendChild(label);
			button.appLauncher = apps[i];*/
	
			grid.attach(appItem, i%2, Math.floor(i/2));
	
			this.connect(appItem, 'press', this.onApplicationSelect);
			this.apps.push(appItem);
		}
	},

	onApplicationSelect: function(appItem) {
		this.fireEvent('launch', appItem.getLocation());
	},

	getApplicationByMimetype: function(mimetype) {
		for(var i = 0; i < this.apps.length; i++) {
			var app = this.apps[i];
			var mimetypes = app.getMimetypes();
			if(mimetypes != undefined) {
				for(var i2 = 0; i2 < mimetypes.length; i2++) {
					if(mimetypes[i2] == mimetype)
						return app.getLocation();
				}
			}
		}
		return undefined;
	},
}, {});

