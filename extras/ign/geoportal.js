
Ui.Fixed.extend('Extras.Ui.IGN.Geoportal', {
	latlng: undefined,
	map: undefined,
	zoom: 10,
	waitGeoportal: undefined,
	viewer: undefined,

	constructor: function(config) {
		this.waitForGeoportal();
	},

    // Private
    completeInitialization: function() {
		// Default viewer (one could use Geoportal.Viewer.Standard)
		this.viewer = new Geoportal.Viewer.Default(
			this.getDrawing(),
			OpenLayers.Util.extend({ mode:'normal',
                                     territory:'FXX',
                                     projection:'IGNF:GEOPORTALFXX',
                                     displayProjection:'IGNF:RGF93G',
                                     nameInstance:'viewer'},
                                   gGEOPORTALRIGHTSMANAGEMENT          // API configuration with regard to the API key
			)
		);    
        this.viewer.addGeoportalLayers(
			[ 'ORTHOIMAGERY.ORTHOPHOTOS:WMSC',
			  'GEOGRAPHICALGRIDSYSTEMS.MAPS:WMSC'],
            {}
		);
		this.viewer.getMap().setCenter(this.viewer.viewerOptions.defaultCenter, this.viewer.viewerOptions.defaultZoom);

		this.connect(this, 'load', this.updateSize);
		this.connect(this, 'resize', this.updateSize);
		this.connect(this, 'visible', this.updateSize);

		console.log(this.viewer);
    },

    waitForGeoportal: function() {
		if((typeof(OpenLayers) == 'undefined') || (typeof(Geoportal) == 'undefined') ||
			(typeof(Geoportal.Viewer) == 'undefined') || (typeof(Geoportal.Viewer.Default) == 'undefined'))
			this.waitGeoportal = new Core.DelayedTask({	delay: 0.3, scope: this, callback: this.waitForGeoportal });
		else
			this.completeInitialization();
    },

	updateSize: function() {
		this.viewer.render(this.getDrawing());
	}
}, {}, {
	Key: '1244054277973706333',

	constructor: function() {
		document.write("<script type='text/javascript' src='http://api.ign.fr/geoportail/api?v=1.2&key="+Extras.Ui.IGN.Geoportal.Key+"&'></script>");
	}
});
