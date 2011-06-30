Ui.Element.extend('Extras.Ui.Google.Map', {
	latlng: undefined,
	map: undefined,
	zoom: 10,
	/*		panControl: false,
			zoomControl: false,
			mapTypeControl: false;
	*/

	constructor: function(config) {
		if(('latitude' in config) && ('longitude' in config))
			this.setLatLng(config.latitude, config.longitude);
		if('zoom' in config)
			this.setZoom(config.zoom);
		if('maptype' in config)
			this.setMapType(config.maptype)
		
		var myOptions = 
			{
				zoom: this.zoom,
				center: this.latlng,
				mapTypeId: this.maptype,
				noClear: true,
			};
		this.map = new google.maps.Map(this.getDrawing(), myOptions);
		
				// We don't have a copy of these, so we set them only
		// when the map	 object is alive
		if ('panControl' in config)
			this.showPanControl(config.panControl);
		if ('zoomControl' in config)
			this.showZoomControl(config.zoomControl);
		if ('mapTypeControl' in config)
			this.showMapTypeControl(config.mapTypeControl);
		if ('streetViewControl' in config)
			this.showStreetViewControl(config.streetViewControl);
	},
	
	showPanControl: function(val) {
		this.map.panControl = val;
	},
	
	showZoomControl: function(val) {
		this.map.zoomControl = val;
	},
	
	showMapTypeControl: function(val) {
				this.map.mapTypeControl = val;
	},
	
	showStreetViewControl: function(val) {
		this.map.streetViewControl = val;
	},
	
	setLatLng: function(latitude, longitude) {
		this.latlng = new google.maps.LatLng(latitude, longitude);	
		if (this.map)
			this.map.panTo(this.latlng);
		// setCenter(latlng:LatLng) ??
	},
	
	setZoom: function(zoom) {
		if ((zoom > 18) || (zoom < 0))
			return;
		this.zoom = zoom;

		if (this.map)
			this.map.setZoom(this.zoom);
	},
	
	getZoom: function() {
		return this.zoom;
	},
	
	setMapType: function(type) {
		this.maptype = type;
		if (this.map)
			this.map.setMapTypeId(this.maptype);
	},
	
	getMap: function() {
		return this.map;
	}
});
