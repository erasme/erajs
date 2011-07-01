
Ui.Fixed.extend('Extras.Ui.IGN.Geoportal', {
	latlng: undefined,
	map: undefined,
	zoom: 10,
	waitGeoportal: undefined,
	viewer: undefined,
    kx: 4390419.7883516,
    ky: 6378137.0,

	constructor: function(config) {
		this.waitForGeoportal();
	},

	setLatLng: function(latitude, longitude) {
		this.viewer.getMap().setCenterAtLonLat(longitude, latitude);
	},

	getLatLng: function() {
        var xt = this.viewer.getMap().getExtent();
        var ll = xt.getCenterLonLat();
        var lat = 180 * ll.lat / (this.ky * Math.PI);
        var lon = 180 * ll.lon / (this.kx * Math.PI);

        return [lat, lon];
	},

 	getZoom: function() {
		return this.viewer.getMap().getZoom();
	},

	setZoom: function(zoom) {
        var ll = this.getLatLng();
		this.viewer.getMap().setCenterAtLonLat(ll[1], ll[0], zoom);
	},

    showAllTools: function(val) {
        console.log('showAllTools :' + val);
        this.viewer.setToolsPanelVisibility(val);
        this.viewer.setInformationPanelVisibility(val);
    },

    showMapTypeControl: function(val) {
        console.log('showMapTypeControl :' + val);
		this.viewer.setLayersPanelVisibility(val);
	},


    // Private
    completeInitialization: function() {
		// Default viewer (one could use Geoportal.Viewer.Standard)
		this.viewer = new Geoportal.Viewer.Default(
			this.getDrawing(),
			OpenLayers.Util.extend({ mode:'normal',
                                     territory:'FXX',
                                     projection: 'IGNF:GEOPORTALFXX',
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
        this.viewer.addGeoportalLayer('ELEVATION.SLOPS', {});

		this.viewer.getMap().setCenter(this.viewer.viewerOptions.defaultCenter, this.viewer.viewerOptions.defaultZoom);

		this.connect(this, 'load', this.updateSize);
		this.connect(this, 'resize', this.updateSize);
		this.connect(this, 'visible', this.updateSize);
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
},
{},
{
	Key: '1244054277973706333',

	constructor: function() {
		document.write("<script type='text/javascript' src='http://api.ign.fr/geoportail/api?v=1.2&key="+Extras.Ui.IGN.Geoportal.Key+"&'></script>");
	}
});
