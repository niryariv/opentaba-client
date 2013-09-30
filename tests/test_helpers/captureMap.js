var casper = require('casper').create({
	verbose: true,
    	logLevel: "debug",
    	viewportSize: {width:1024, height:768}
});
	
casper.start('../index.html');

casper.then(function(){
	this.captureSelector('./original_map.png','#map.leaflet-container.leaflet-fade-anim');
});

casper.run();
