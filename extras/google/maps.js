/**
 * @fileOverview Extras.Ui.Google.Map js file
 * @author Daniel Lacroix
 * @version 0.9
 */

/**
 * @name Extras
 * @namespace Namespace for all things that are outside the scope of the Era framework core but use it
 */

/**
 * @name Extras.Ui
 * @namespace Namespace for all Ui elements that are outside the scope of the Era framework core but use it
 */

/**
 * @name Extras.Ui.Google
 * @namespace Namespace for all the Google element that are bind with Era
 */

Ui.Fixed.extend('Extras.Ui.Google.Map',  
                /** @lends Extras.Ui.Google.Map# */
{
	map: undefined,

    /**
     * @constructs
     * @class Extras.Ui.Google.Map lets you embed a GoogleMap in an
     * application.
     * @extends Ui.Fixed
     * @param {Object} config Configuration object, see fields breakout below
     * @param {Number} config.latitude Latitude of initial map center
     * @param {Number} config.longitude Longitude of initial map center
     * @param {Number} config.zoom Initial zoom level for map (0 to 20)
     * @param {Number} config.maptype Initial map type (e.g. google.maps.MapTypeId.ROADMAP); 
     * (see GoogleMaps <a href="http://code.google.com/intl/fr/apis/maps/documentation/javascript/reference.html#MapTypeId">API reference</a> 
     * for available mapTypes).
     * @param {Boolean} config.panControl Whether to show the pan tool
     * @param {Boolean} config.zoomControl Whether to show the zoom tool
     * @param {Boolean} config.mapTypeControl Whether to show the map type selection tool
     * @param {Boolean} config.streetViewControl Whether to show the streetview control tool
     */
	constructor: function(config) {
		var latlng = new google.maps.LatLng(0, 0);
		var zoom = 10;
        var maptype = google.maps.MapTypeId.ROADMAP;

		if(('latitude' in config) && ('longitude' in config))
			latlng = new google.maps.LatLng(config.latitude, config.longitude);
		if('zoom' in config)
			zoom = config.zoom;
		if('maptype' in config)
            maptype =  config.maptype;

		var myOptions = {
			zoom: zoom,
			center: latlng,
			mapTypeId: maptype,
		};

		// when the map object is alive
		if ('panControl' in config)
            myOptions.panControl = config.panControl;
		if ('zoomControl' in config)
            myOptions.zoomControl = config.zoomControl;
		if ('mapTypeControl' in config)
            myOptions.mapTypeControl = config.mapTypeControl;
		if ('streetViewControl' in config)
			myOptions.streetViewControl = config.streetViewControl;

		this.map = new google.maps.Map(this.getDrawing(), myOptions);

        // Connect some events to tell google that the div has to be repainted
		this.connect(this, 'load', this.updateSize);
		this.connect(this, 'resize', this.updateSize);
		this.connect(this, 'visible', this.updateSize);
	},


    /**
     * @description Show/hide all available tools
     * @param {Boolean} val Set to true to show tool, false to hide.
     */
    showAllTools: function(val) {
        console.log('showallTools:' + val);
        this.showPanControl(val);
        this.showZoomControl(val);
        this.showStreetViewControl(val);
    },

    /**
     * @description Show/hide pan control tool
     * @param {Boolean} val Set to true to show tool, false to hide.
     */
	showPanControl: function(val) {
		this.map.setOptions({ panControl: val });
	},
	
    /**
     * @description Show/hide zoom tool
     * @param {Boolean} val Set to true to show tool, false to hide.
     */
	showZoomControl: function(val) {
		this.map.setOptions({ zoomControl: val});
	},
	
    /**
     * @description Show/hide map type selection tool
     * @param {Boolean} val Set to true to show tool, false to hide.
     */
	showMapTypeControl: function(val) {
		this.map.setOptions({ mapTypeControl: val});
	},
	
    /**
     * @description Show/hide street view buddy icon
     * @param {Boolean} val Set to true to show tool, false to hide.
     */
	showStreetViewControl: function(val) {
		this.map.setOptions({ streetViewControl: val});
	},
	
	/**
	 * @description Centers the map on coordinates.
     * @param {Number} latitude Latitude in degrees. Negative values are southbound.
     * @param {Number} longitude Longitude in degrees. Negative values are westbound.
     */
	setLatLng: function(latitude, longitude) {
		this.map.setCenter(new google.maps.LatLng(latitude, longitude));
	},

	/**
	 * @description Get current map center coordinates.
     * @returns {Array} Array containing latitude and longitude in degrees.
     */    
	getLatLng: function() {
		var ll =  this.map.getCenter();
        console.log('googlemaps ll :' + ll.lat() + ',' + ll.lng());
        return [ll.lat(), ll.lng()];
	},

	/**
	 * @description Sets the map type to display
     * @param {Number} type Map type (e.g. google.maps.MapTypeId.ROADMAP); 
     * (see GoogleMaps <a href="http://code.google.com/intl/fr/apis/maps/documentation/javascript/reference.html#MapTypeId">API reference</a> 
     * for available mapTypes).
     */    
	setMapType: function(type) {
		this.maptype = type;
		if (this.map) {
            console.log('setting maptype to ' + this.maptype);
			this.map.setMapTypeId(this.maptype);
        }
	},
	
	/**
	 * @description Get the google maps object
     * @returns {Number} GoogleMap map object
     */    
	getMap: function() {
		return this.map;
	},

	/**
	 * @description Get the current zoom level.
     * @returns {Number} Current map zoom level.
     */    
	getZoom: function() {
		return this.map.getZoom();
	},

	/**
	 * @description Sets the current zoom level.
     * @returns {Number} zoom Required map zoom level.
     */    
	setZoom: function(zoom) {
		this.map.setZoom(zoom);
	},

    /** 
     * @description Warns Geoportal API of div changes.
     * This method is called when the div containing
     * the map changed (size, ...).
     * @private
     */
	updateSize: function() {
        var center = this.getMap().getCenter();
		google.maps.event.trigger(this.getMap(), 'resize');
        this.getMap().setCenter(center);
	}
}, 
{},
/** @lends Extras.Ui.Google.Map*/
{
    /** 
	 * @description Static constructor, called after this js file has been loaded
	 */
	constructor: function() {
		document.write("<script type='text/javascript' src='http://maps.google.com/maps/api/js?v=3.5&sensor=false'></script>"); // v=3 ?
	}
});




