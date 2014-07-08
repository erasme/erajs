
(function() {
// find era-debug.js base directory
var eraBaseDirectory;

var scripts;
if(document.scripts !== undefined)
	scripts = document.scripts;
else
	scripts = document.getElementsByTagName('script');

for(var i = 0; i < scripts.length; i++) {
	var pos = scripts[i].src.search(/era-debug\.js$/);
	if(pos != -1) {
		eraBaseDirectory = scripts[i].src.substring(0, pos);
		break;
	}
}

function include(fileName) {
    document.write("<script type='text/javascript' src='"+fileName+"'></script>");
}

//
// Emulated canvas for IE < 9
//
include(eraBaseDirectory+'excanvas/excanvas.js');

//
// Core functions
//
include(eraBaseDirectory+'core/util.js');
include(eraBaseDirectory+'core/object.js');
include(eraBaseDirectory+'core/uri.js');
include(eraBaseDirectory+'core/event.js');
include(eraBaseDirectory+'core/mouseevent.js');
include(eraBaseDirectory+'core/pointerevent.js');
include(eraBaseDirectory+'core/delayedtask.js');
include(eraBaseDirectory+'core/timer.js');
include(eraBaseDirectory+'core/httprequest.js');
include(eraBaseDirectory+'core/socket.js');
include(eraBaseDirectory+'core/file.js');
include(eraBaseDirectory+'core/filepostuploader.js');
include(eraBaseDirectory+'core/media.js');
include(eraBaseDirectory+'core/rtc.js');
include(eraBaseDirectory+'core/remotedebug.js');

//
// Animations
//
include(eraBaseDirectory+'anim/timemanager.js');
include(eraBaseDirectory+'anim/animationmanager.js');
include(eraBaseDirectory+'anim/easingfunction.js');
include(eraBaseDirectory+'anim/linearease.js');
include(eraBaseDirectory+'anim/powerease.js');
include(eraBaseDirectory+'anim/elasticease.js');
include(eraBaseDirectory+'anim/bounceease.js');
include(eraBaseDirectory+'anim/clock.js');
include(eraBaseDirectory+'anim/clockgroup.js');

//
// Ui base
//
include(eraBaseDirectory+'ui/matrix.js');
include(eraBaseDirectory+'ui/point.js');
include(eraBaseDirectory+'ui/color.js');
include(eraBaseDirectory+'ui/lineargradient.js');
include(eraBaseDirectory+'ui/element.js');
include(eraBaseDirectory+'ui/container.js');
include(eraBaseDirectory+'ui/svgparser.js');
include(eraBaseDirectory+'ui/svgelement.js');
include(eraBaseDirectory+'ui/canvaselement.js');
include(eraBaseDirectory+'ui/shape.js');

//
// Ui Layout
//
include(eraBaseDirectory+'ui/lbox.js');
include(eraBaseDirectory+'ui/box.js');
include(eraBaseDirectory+'ui/flow.js');
include(eraBaseDirectory+'ui/sflow.js');
include(eraBaseDirectory+'ui/grid.js');
include(eraBaseDirectory+'ui/fixed.js');
include(eraBaseDirectory+'ui/fold.js');
include(eraBaseDirectory+'ui/accordeonable.js');

//
// Ui drawing
//
include(eraBaseDirectory+'ui/spacer.js');
include(eraBaseDirectory+'ui/rectangle.js');
include(eraBaseDirectory+'ui/frame.js');
include(eraBaseDirectory+'ui/shadow.js');
include(eraBaseDirectory+'ui/icon.js');
include(eraBaseDirectory+'ui/dualicon.js');
include(eraBaseDirectory+'ui/buttongraphic.js');

//
// Core functions
//
include(eraBaseDirectory+'core/dragevent.js');

//
// Ui text
//
include(eraBaseDirectory+'ui/html.js');
include(eraBaseDirectory+'ui/label.js');
include(eraBaseDirectory+'ui/text.js');
include(eraBaseDirectory+'ui/compactlabel.js');
include(eraBaseDirectory+'ui/contenteditable.js');

//
// Ui media
//
include(eraBaseDirectory+'ui/image.js');
include(eraBaseDirectory+'ui/audio.js');
include(eraBaseDirectory+'ui/video.js');


//
// Ui logic
//
include(eraBaseDirectory+'ui/overable.js');
include(eraBaseDirectory+'ui/pressable.js');
include(eraBaseDirectory+'ui/uploadable.js');
include(eraBaseDirectory+'ui/movablebase.js');
include(eraBaseDirectory+'ui/movable.js');
include(eraBaseDirectory+'ui/transformable.js');
include(eraBaseDirectory+'ui/scrollable.js');
include(eraBaseDirectory+'ui/draggable.js');
include(eraBaseDirectory+'ui/dropbox.js');
include(eraBaseDirectory+'ui/iframe.js');
include(eraBaseDirectory+'ui/carouselable.js');
include(eraBaseDirectory+'ui/carouselable2.js');
include(eraBaseDirectory+'ui/form.js');
include(eraBaseDirectory+'ui/selection.js');
include(eraBaseDirectory+'ui/selectionable.js');

//
// Ui high level element (= drawing + logic + style)
//
include(eraBaseDirectory+'ui/separator.js');
include(eraBaseDirectory+'ui/entry.js');
include(eraBaseDirectory+'ui/textarea.js');
include(eraBaseDirectory+'ui/button.js');
include(eraBaseDirectory+'ui/togglebutton.js');
include(eraBaseDirectory+'ui/uploadbutton.js');
include(eraBaseDirectory+'ui/linkbutton.js');
include(eraBaseDirectory+'ui/downloadbutton.js');
include(eraBaseDirectory+'ui/actionbutton.js');
include(eraBaseDirectory+'ui/checkboxgraphic.js');
include(eraBaseDirectory+'ui/checkbox.js');
include(eraBaseDirectory+'ui/contextbar.js');
include(eraBaseDirectory+'ui/popup.js');
include(eraBaseDirectory+'ui/combo.js');
include(eraBaseDirectory+'ui/dialog.js');
include(eraBaseDirectory+'ui/toolbar.js');
include(eraBaseDirectory+'ui/scrollingarea.js');
include(eraBaseDirectory+'ui/slider.js');
include(eraBaseDirectory+'ui/progressbar.js');
include(eraBaseDirectory+'ui/loading.js');
include(eraBaseDirectory+'ui/locator.js');
include(eraBaseDirectory+'ui/textbggraphic.js');
include(eraBaseDirectory+'ui/textfield.js');
include(eraBaseDirectory+'ui/textbuttonfield.js');
include(eraBaseDirectory+'ui/textareafield.js');
include(eraBaseDirectory+'ui/listview.js');
include(eraBaseDirectory+'ui/program.js');
include(eraBaseDirectory+'ui/transition.js');
include(eraBaseDirectory+'ui/fade.js');
include(eraBaseDirectory+'ui/flip.js');
include(eraBaseDirectory+'ui/slide.js');
include(eraBaseDirectory+'ui/transitionbox.js');
include(eraBaseDirectory+'ui/accordeon.js');
include(eraBaseDirectory+'ui/carousel.js');
include(eraBaseDirectory+'ui/switch.js');
include(eraBaseDirectory+'ui/embed.js');
include(eraBaseDirectory+'ui/monthcalendar.js');
include(eraBaseDirectory+'ui/datepicker.js');
include(eraBaseDirectory+'ui/notebook.js');
include(eraBaseDirectory+'ui/menu.js');
include(eraBaseDirectory+'ui/segmentbar.js');
include(eraBaseDirectory+'ui/paned.js');
include(eraBaseDirectory+'ui/menutoolbar.js');
include(eraBaseDirectory+'ui/app.js');

//
// Ui styles
//
include(eraBaseDirectory+'ui/styles.js');

})();