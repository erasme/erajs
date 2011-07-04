
Ui.Fixed.extend('Extras.Ui.Google.Map', {
	map: undefined,

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
//			this.showPanControl(config.panControl);
            myOptions.panControl = config.panControl;
		if ('zoomControl' in config)
//			this.showZoomControl(config.zoomControl);
            myOptions.zoomControl = config.zoomControl;
		if ('mapTypeControl' in config)
//			this.showMapTypeControl(config.mapTypeControl);$
            myOptions.mapTypeControl = config.mapTypeControl;
		if ('streetViewControl' in config)
//			this.showStreetViewControl(config.streetViewControl);
			myOptions.streetViewControl = config.streetViewControl;

		this.map = new google.maps.Map(this.getDrawing(), myOptions);

        // Connect some events to tell google that the div has to be repainted
		this.connect(this, 'load', this.updateSize);
		this.connect(this, 'resize', this.updateSize);
		this.connect(this, 'visible', this.updateSize);
	},

    showAllTools: function(val) {
        console.log('showallTools:' + val);
        this.showPanControl(val);
        this.showZoomControl(val);
        this.showStreetViewControl(val);
    },

	showPanControl: function(val) {
		this.map.setOptions({ panControl: val });
	},
	
	showZoomControl: function(val) {
		this.map.setOptions({ zoomControl: val});
	},
	
	showMapTypeControl: function(val) {
		this.map.setOptions({ mapTypeControl: val});
	},
	
	showStreetViewControl: function(val) {
		this.map.setOptions({ streetViewControl: val});
	},
	
	setLatLng: function(latitude, longitude) {
		this.map.setCenter(new google.maps.LatLng(latitude, longitude));
	},

	getLatLng: function() {
		var ll =  this.map.getCenter();
        console.log('googlemaps ll :' + ll.lat() + ',' + ll.lng());
        return [ll.lat(), ll.lng()];
	},

	setMapType: function(type) {
		this.maptype = type;
		if (this.map) {
            console.log('setting maptype to ' + this.maptype);
			this.map.setMapTypeId(this.maptype);
        }
	},
	
	getMap: function() {
		return this.map;
	},

	getZoom: function() {
		return this.map.getZoom();
	},

	setZoom: function(zoom) {
		this.map.setZoom(zoom);
	},

	updateSize: function() {
        var center = this.getMap().getCenter();
		google.maps.event.trigger(this.getMap(), 'resize');
        this.getMap().setCenter(center);
	}
}, {}, {
	constructor: function() {
		document.write("<script type='text/javascript' src='http://maps.google.com/maps/api/js?v=3.5&sensor=false'></script>"); // v=3 ?
	}
});




