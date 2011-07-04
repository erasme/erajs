/**
 * @fileOverview Extras.Ui.IGN.Geoportal js file
 * @author Daniel Lacroix
 * @version 0.9
 */



Ui.Fixed.extend('Extras.Ui.IGN.Geoportal',
                /** @lends Extras.Ui.IGN.Geoportal# */	
{
undefined
    latitude: 45.750404,
    longitude: 4.426678,
	map: 'GEOGRAPHICALGRIDSYSTEMS.MAPS:WMSC',
	zoom: 10,
	waitGeoportal: undefined,
	viewer: undefined,
    
    /**
     * @description Kx factor for longitude conversion
     * @see The IGN <a href=http://api.ign.fr/geoportail/api/doc/fr/developpeur/wmsc.html>documentation</a>
     */
    kx: 4390419.7883516,

    /**
     * @description Ky factor for latitude conversion
     * @see The IGN <a href=http://api.ign.fr/geoportail/api/doc/fr/developpeur/wmsc.html>documentation</a>
     */
    ky: 6378137.0,

    /**
     * @constructs
     * @class Extras.Ui.IGN.Geoportal lets you embed a Geoportal map in an
     * application. You need to define {@link Extras.Ui.IGN.Geoportal.Key} before
     * creating an instance of this class.
     * @extends Ui.Fixed
     * @param {Object} config Configuration object, see fields breakout below
     * @param {Number} config.latitude Latitude of initial map center
     * @param {Number} config.longitude Longitude of initial map center
     * @param {Number} config.zoom Initial zoom level for map (0 to 20)
     * @param {Array} config.maptype Array of strings containing initial layers
     * (see IGN <a href="http://api.ign.fr/geoportail/api/doc/fr/webmaster/layers.html">documentation</a> 
     * for available layers, also depends on your IGN contract).
     */
	constructor: function(config) {
		if ('latitude' in config)
            this.latitude = config.latitude;
		if ('longitude' in config)
            this.longitude = config.longitude;
		if ('zoom' in config)
            this.zoom = Math.max(20,Math.min(0,config.zoom));
        if ('maptype' in config) 
            this.maptype = config.maptype;

		this.waitForGeoportal();
	},

	/**
	 * @description Get current map center coordinates.
     * @returns {Array} Array containing latitude and longitude in degrees.
     */    
	getLatLng: function() {
        var xt = this.viewer.getMap().getExtent();
        var ll = xt.getCenterLonLat();
        var lat = 180 * ll.lat / (this.ky * Math.PI);
        var lon = 180 * ll.lon / (this.kx * Math.PI);

        return [lat, lon];
	},

	/**
	 * @description Centers the map on coordinates.
     * @param {Number} latitude Latitude in degrees. Negative values are southbound.
     * @param {Number} longitude Longitude in degrees. Negative values are westbound.
     */
	setLatLng: function(latitude, longitude) {
		this.viewer.getMap().setCenterAtLonLat(longitude, latitude);
	},

	/**
	 * @description Get the current zoom level.
     * @returns {Number} Current map zoom level.
     */    
 	getZoom: function() {
		return this.viewer.getMap().getZoom();
	},

	setZoom: function(zoom) {
        var ll = this.getLatLng();
        zoom = Math.max(20,Math.min(0,zoom));
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


    /** 
     * @description Finish Geoportal initialization.
     * This method is called when all Geoportail API has loaded and
     * is ready
     * @private
     */
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

        if (this.maptype instanceof Array)
            this.viewer.addGeoportalLayers(this.maptype, {});
        else
            this.viewer.addGeoportalLayer(this.maptype, {});            
    
	    this.viewer.getMap().setCenterAtLonLat(this.longitude, this.latitude, this.zoom);

		this.connect(this, 'load', this.updateSize);
		this.connect(this, 'resize', this.updateSize);
		this.connect(this, 'visible', this.updateSize);
    },

    /** 
     * @description Wait for Geoportal to be loaded.
     * This method repeatedly calls itslef until all 
     * Geoportail API has loaded and is ready
     * @private
     */
    waitForGeoportal: function() {
		if((typeof(OpenLayers) == 'undefined') || (typeof(Geoportal) == 'undefined') ||
			(typeof(Geoportal.Viewer) == 'undefined') || (typeof(Geoportal.Viewer.Default) == 'undefined'))
			this.waitGeoportal = new Core.DelayedTask({	delay: 0.3, scope: this, callback: this.waitForGeoportal });
		else
			this.completeInitialization();
    },

    /** 
     * @description Warns Geoportal API of div changes.
     * This method is called when the div containing
     * the map changed (size, ...).
     * @private
     */
 	updateSize: function() {
		this.viewer.render(this.getDrawing());
	}
},
{},
/** @lends Extras.Ui.IGN.Geoportal */
{
    /** 
	 * @description Geoportal API key.
     * Override before creating an instance of this class.
     * e.g. : 
     * @example Extras.Ui.IGN.Geoportal.Key='0123456789012345678'
     * map=new Extras.Ui.IGN.Geoportal(...)
	 */
	Key: '1244054277973706333',

	constructor: function() {
		document.write("<script type='text/javascript' src='http://api.ign.fr/geoportail/api?v=1.2&key="+Extras.Ui.IGN.Geoportal.Key+"&'></script>");
	}
});
