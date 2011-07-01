document.write("<script type='text/javascript' src='http://api.ign.fr/geoportail/api?v=1.2&key=1244054277973706333&'></script>");

Ui.Element.extend('Extras.Ui.IGN.Geoportal', {
	latlng: undefined,
	map: undefined,
	zoom: 10,

	constructor: function(config) {
        this.waitForGeoportal();
	},

    // Private
    completeInitialization: function() {
        viewer = new Geoportal.Viewer.Default(           // Default viewer (one could use Geoportal.Viewer.Standard)
            this.getDrawing(),
            OpenLayers.Util.extend({ mode:'normal',
                                     territory:'FXX',
                                     projection:'IGNF:GEOPORTALFXX',
                                     displayProjection:'IGNF:RGF93G',

                                     nameInstance:'viewer'},
                                   gGEOPORTALRIGHTSMANAGEMENT          // API configuration with regard to the API key
                                  ));

        if (!viewer) {
            alert('failed loading viewer');
            return;
        }
    
        viewer.addGeoportalLayers(
            [ 'ORTHOIMAGERY.ORTHOPHOTOS:WMSC',
              'GEOGRAPHICALGRIDSYSTEMS.MAPS:WMSC'],
            {});
    
        viewer.getMap().setCenter(viewer.viewerOptions.defaultCenter,viewer.viewerOptions.defaultZoom);
    },

    waitForGeoportal: function() {
        if (__Geoportal$timer!=null) {
            window.clearTimeout(__Geoportal$timer);
            __Geoportal$timer= null;
        }
    
        if (typeof(OpenLayers)=='undefined'              ||
            typeof(Geoportal)=='undefined'               ||
            typeof(Geoportal.Viewer)=='undefined'        ||
            typeof(Geoportal.Viewer.Default)=='undefined') {
            __Geoportal$timer= window.setTimeout(this.waitForGeoportal(), 300);
            return;
        }

        this.completeInitialization();
    },
});
