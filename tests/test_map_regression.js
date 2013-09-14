/*global casper:false */
/*functional testing for map regression with img evaluating.
 
 runs with casperjs test filename (or casperjs.bat on windows)
*/
//Some setup //TODO: move this to a global casper config
var url = '../index.html';
var casper = require('casper').create({
	viewportSize: {
		width: 1024,
		height: 768
	},
    	verbose:true,
	logLevel:"debug",
    	waitTimeout:12000
});

//initializing phantomcss

var phantomcss = require('./PhantomCSS/phantomcss.js');
phantomcss.init({
	libraryRoot:'./PhantomCSS',
	screenshotRoot:'./img',
	failedComparisonsRoot:'./fail_img'
});
var delay =10;
casper.start(url).then(function(){
	phantomcss.screenshot('#map.leaflet-container.leaflet-fade-anim','full_map.png');
});

casper.then(function now_check_the_screenshot(){
	phantomcss.compareAll();
}).
run(function end_it(){
	console.log('ending the phantomcss test');
	phantom.exit(phantomcss.getExitStatus());
});
