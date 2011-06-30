var debug = true;

// find extras-debug.js base directory
var extrasBaseDirectory;

var scripts;
if(document.scripts != undefined)
	scripts = document.scripts;
else
	scripts = document.getElementsByTagName('script');

for(var i = 0; i < scripts.length; i++) {
	var pos = scripts[i].src.search(/extras-debug\.js$/);
	if(pos != -1) {
		extrasBaseDirectory = scripts[i].src.substring(0, pos);
		break;
	}
}

function include(fileName) {
	document.write("<script type='text/javascript' src='"+fileName+"'></script>");
}

//
// Includes 
//
include(extrasBaseDirectory+'google/maps.js');
//include(extrasBaseDirectory+'ign/geoportal.js');
