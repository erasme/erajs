
Ui.Transformable.extend('Extra.OpenStreetMap', {
	canvas: undefined,
	tileSize: 256,

	latitude: undefined,
	longitude: undefined,
	zoom: undefined,

	constructor: function(config) {
		this.setInertia(true);
		this.setTransformOrigin(0, 0);
		this.setAllowScale(true);
		this.setMinScale(4);
		this.setMaxScale(Math.pow(2, 19));
		this.setAllowRotate(false);
		this.canvas = new Extra.OpenStreetMapCanvas();
		this.append(this.canvas);
	},

	setView: function(lat, long, zoom) {
		// if arrange is not done, delay the setView because we want
		// the coordinate in the center
		if(this.getLayoutWidth() === 0) {
			this.latitude = lat;
			this.longitude = long;
			this.zoom = zoom;
		}
		else {
			var scale = Math.pow(2, zoom);
			var topLeftX = (long + 180) / 360 * scale;
			topLeftX *= this.tileSize;
			topLeftX -= (this.getLayoutWidth() / 2);

			var topLeftY = (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 * scale;
			topLeftY *= this.tileSize;
			topLeftY -= (this.getLayoutHeight() / 2);

			this.setContentTransform(-topLeftX, -topLeftY, scale, 0);
		}
	},

	getLatitude: function() {
		var n = Math.PI - 2 * Math.PI * (((-this.getTranslateY() + this.getLayoutHeight() / 2) / this.tileSize) / this.getScale());
		return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
	},

	getLongitude: function() {
		return (((-this.getTranslateX() + this.getLayoutWidth()/2) / this.tileSize) / this.getScale()) * 360 - 180;
	},

	setTilesSource: function(source) {
		this.canvas.setTilesSource(source);
	},

	getZoom: function() {
		return Math.log(this.getScale()) / Math.log(2);
	},

	setZoom: function(zoom) {
		this.setView(this.getLatitude(), this.getLongitude(), zoom);
	}
}, {
	onContentTransform: function(testOnly) {
		this.canvas.setViewMatrix(this.getMatrix());
	},

	measureCore: function(width, height)  {
		return Extra.OpenStreetMap.base.measureCore.apply(this, arguments);
	},

	arrangeCore: function(width, height) {
		if(this.latitude !== undefined) {
			this.setView(this.latitude, this.longitude, this.zoom);
			this.latitude = undefined;
			this.longitude = undefined;
			this.zoom = undefined;
		}
		Extra.OpenStreetMap.base.arrangeCore.apply(this, arguments);
	}
});

Ui.CanvasElement.extend('Extra.OpenStreetMapCanvas', {
	tilesSource: undefined,
	tileSize: 256,
	tiles: undefined,
	viewMatrix: undefined,

	constructor: function(config) {
		this.tilesSource = Extra.OpenStreetMapCanvas.tilesSources[0];
		console.log(this.tilesSource);
		this.tiles = [];
		this.viewMatrix = new Ui.Matrix();
	},

	setViewMatrix: function(matrix) {
		this.viewMatrix = matrix;
		this.updateTiles();
		this.invalidateDraw();
	},

	setTilesSource: function(src) {
		if(typeof(src) === 'string') {
			var found = undefined;
			for(var i = 0; (found === undefined) && (i < Extra.OpenStreetMapCanvas.tilesSources.length); i++) {
				if(Extra.OpenStreetMapCanvas.tilesSources[i].key === src)
					found = Extra.OpenStreetMapCanvas.tilesSources[i];
			}
			if(found !== undefined)
				src = found;
			else
				src = { url: src };
		}
		if(src.key === undefined)
			src.key = 'custom';
		if(src.minZoom === undefined)
			src.minZoom = 1;
		if(src.maxZoom === undefined)
			src.maxZoom = 18;
		if(src.name === undefined)
			src.name = src.key;
		if(src.subdomains === undefined)
			src.subdomains = 'abc';
		this.tilesSource = src;
		this.invalidateTiles();
		this.updateTiles();
		this.invalidateDraw();
	},

	invalidateTiles: function() {
		for(var i = 0; i < this.tiles.length; i++) {
			this.disconnect(this.tiles[i], 'ready', this.invalidateDraw);
			this.removeChild(this.tiles[i]);
		}
		this.tiles = [];
	},

	updateTiles: function() {

		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		var n0 = (new Ui.Point({ x: 0, y: 0 })).multiply(this.viewMatrix);
		var n1 = (new Ui.Point({ x: 1, y: 1 })).multiply(this.viewMatrix);
		var scale = n1.substract(n0).getLength()/Math.sqrt(2);
		var zoom = Math.min(this.tilesSource.maxZoom, Math.max(this.tilesSource.minZoom, Math.floor(Math.log(scale) / Math.log(2))));
		var scaleZoom = Math.pow(2, zoom);
		var tileScale = scale / scaleZoom;
		
		var invMatrix = this.viewMatrix.inverse();

		var p0 = (new Ui.Point({ x: 0, y: 0 })).multiply(invMatrix).divide(this.tileSize).multiply(scaleZoom);
		var p1 = (new Ui.Point({ x: w, y: h })).multiply(invMatrix).divide(this.tileSize).multiply(scaleZoom);

		var tiles = [];

		for(var y = Math.floor(p0.getY()); y < Math.ceil(p1.getY()); y++) {
			var tileY = Math.max(0, Math.min(scaleZoom-1, y));
			for(var x = Math.floor(p0.getX()); x < Math.ceil(p1.getX()); x++) {
				var tileX = Math.max(0, Math.min(scaleZoom-1, x));

				var tile = undefined;
				for(var i = 0; (tile === undefined) && (i < tiles.length); i++) {
					if((tiles[i].tileX === tileX) && (tiles[i].tileY === tileY) && (tiles[i].tileZ === zoom))
						tile = tiles[i];
				}
				if(tile === undefined) {
					for(var i = 0; (tile === undefined) && (i < this.tiles.length); i++) {
						if((this.tiles[i].tileX === tileX) && (this.tiles[i].tileY === tileY) && (this.tiles[i].tileZ === zoom))
							tile = this.tiles[i];
					}
					if(tile === undefined) {
						var tilesUrl = this.tilesSource.url.replace('{z}', zoom).
							replace('{x}', tileX).
							replace('{y}', tileY).
							replace('{s}', this.tilesSource.subdomains[Math.floor(Math.random()*this.tilesSource.subdomains.length)]);
						tile = new Ui.Image({ src: tilesUrl });
						this.connect(tile, 'ready', this.invalidateDraw);
						tile.tileX = tileX;
						tile.tileY = tileY;
						tile.tileZ = zoom;
						this.appendChild(tile);
					}
					tiles.push(tile);
				}
			}
		}
		
		// removed unneeded tiles
		for(var i = 0; i < this.tiles.length; i++) {
			var found = false;
			for(var i2 = 0; (found === false) && (i2 < tiles.length); i2++) {
				found = this.tiles[i] === tiles[i2];
			}
			if(!found) {
				this.disconnect(this.tiles[i], 'ready', this.invalidateDraw);
				this.removeChild(this.tiles[i]);
			}
		}
		this.tiles = tiles;
	}
}, {
	
	updateCanvas: function(ctx) {
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		var n0 = (new Ui.Point({ x: 0, y: 0 })).multiply(this.viewMatrix);
		var n1 = (new Ui.Point({ x: 1, y: 1 })).multiply(this.viewMatrix);
		var scale = n1.substract(n0).getLength()/Math.sqrt(2);
		
		for(var i = 0; i < this.tiles.length; i++) {
			var tile = this.tiles[i];
			var scaleZoom = Math.pow(2, tile.tileZ);
			var tileScale = scale / scaleZoom;
			var p0 = (new Ui.Point({
				x: tile.tileX * this.tileSize / scaleZoom,
				y: tile.tileY * this.tileSize / scaleZoom
			})).multiply(this.viewMatrix);
			ctx.drawImage(tile.getDrawing(), p0.getX(), p0.getY(), tileScale * this.tileSize, tileScale * this.tileSize);
		}
	},
	
	arrangeCore: function(w, h) {
		Extra.OpenStreetMapCanvas.base.arrangeCore.apply(this, arguments);
		this.updateTiles();
		this.invalidateDraw();
	}
}, {
	tilesSources: [
		{
			key: 'osm', minZoom: 1, maxZoom: 19,
			name: 'OpenStreetMap',
			url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			subdomains: 'abc'
		},
		{
			key: 'cyclemap', minZoom: 1, maxZoom: 18,
			name: 'OpenCycleMap', 
			url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
			subdomains: 'abc'
		},
		{
			key: 'mapquestaerial', minZoom: 1, maxZoom: 11,
			name: 'MapQuest Open Aerial',
			url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg',
			subdomains: '1234'
		},
		{
			key: 'mapboxsatellite', minZoom: 1, maxZoom: 18,
			name: 'Mapbox labelled Satellite', 
			url: 'https://{s}.tiles.mapbox.com/v3/dennisl.map-6g3jtnzm/{z}/{x}/{y}.png',
			subdomains: 'abc'
		},
		{
			key: 'googleroadmap', minZoom: 1, maxZoom: 19,
			name: 'Google Map Road', 
			url: 'http://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
			subdomains: '123'
		},
		{
			key: 'googlesatmap', minZoom: 1, maxZoom: 19,
			name: 'Google Map Satelitte', 
			url: 'http://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
			subdomains: '123'
		},
		{
			key: 'googletraficmap', minZoom: 5, maxZoom: 19,
			name: 'Google Map Trafic', 
			url: 'http://mt{s}.google.com/mapstt?zoom={z}&x={x}&y={y}&client=google',
			subdomains: '123'
		}
	]
});

