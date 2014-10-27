/*global casper:false */
/*functional testing for the basic functionality of opentaba home page (without specific plan displaying)
 
 runs with casperjs test filename (or casperjs.bat on windows)
*/
//Some setup //TODO: move this to a global casper config
var url = '../index.html';
casper.options.clientScripts.push('./sinon-1.7.3.js');
casper.options.clientScripts.push('./fixture.js');
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {width:1024, height:768};
//initializing phantomcss

//Starting the tests
casper.test.begin('Basic index.html elements test',39, function suite(test){

	casper.on('page.init',initMock).
	on('remote.message',log).
	start(url, function(){

		//casper.options.clientScripts.push('../testlibs/sinon-1.7.3.js');
		test.assertTitle('תב"ע פתוחה: ירושלים',"The title is what we expected");
		test.assertExists('form[id="search-form"]', 'The search form exists');
		test.assertExists('#right-bar','The right bar exists');
		test.assertVisible('#right-bar');
		test.assertExists('#header', 'The header div exists');
		test.assertVisible('#header');
		test.assertExists('#info', 'The info div exists');
		test.assertVisible('#info');
        test.assertExists('#info-modal','The info modal exists');
		test.assertNotVisible('#info-modal');
		//this.wait(5000);
		test.assertExists('#map.leaflet-container.leaflet-fade-anim','The map div exists with leaflet class');
		test.assertExists('.icon-twitter', 'The twitter icon exists');
		test.assertVisible('.icon-twitter');
		test.assertExists('.icon-facebook', 'The facebook icon exists');
        test.assertVisible('.icon-facebook');
        test.assertExists('.icon-rss', 'The rss icon exists');
        test.assertVisible('.icon-rss');
		//very tied to implentation should think about this
		//test.assertResourceExists('lib/pdfobject.js');
		test.assertResourceExists('lib/path.js');
        test.assertResourceExists('munis.js');
		test.assertResourceExists('jerusalem.topojson');
		test.assertResourceExists('app.js');
		test.assertResourceExists('lib/bootstrap/js/bootstrap.min.js');
        test.assertResourceExists('handlebars.min.js');
        test.assertResourceExists('lib/template-renderer.js');
		
		// make sure the toggle button exists and is not visible
		test.assertExists('#toggle-button', 'The toggle button exists');
		test.assertNotVisible('#toggle-button', 'The toggle button is not visible');

        // search note should be hidden until a search is successfuly made
        test.assertNotVisible('#search-note-p');
		
		//TODO: phantomcss check map rendering
	});
    
    casper.thenClick('a[href="#info-modal"]',function(){
		this.echo('clicked info-modal');
		this.waitUntilVisible('#info-modal');
	});
    
    casper.then(function(){
        test.assertVisible('#info-modal');
    });
    
    casper.then(function(){
		this.click('button[id="close-info-modal"]');
		this.echo('clicked to close info-modal');
	});

	casper.then(function(){
		test.assertNotVisible('info-modal');
	});
	
	// Address search tests
	casper.then(function(){
		// make sure an invalid address returns an error
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : 'רחובשלאקיים'
			}, true);
			return true;
		}, function then() {
			this.wait(3000, function() {
				test.assertSelectorHasText('#search-error-p', 'כתובת שגויה או שלא נמצאו נתונים', 'Search for an invalid address');
                test.assertNotVisible('#search-note-p');
			});
		});

		// make sure an address found in a different city (not in the current gushim file) displays the right message
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : 'שדרות מוריה חיפה'
			}, true);
			return true;
		}, function then() {
			this.wait(3000, function() {
				test.assertSelectorHasText('#search-error-p', 'לא נמצא גוש התואם לכתובת', 'Search for an address in a differenct city (no gush will be found)');
                test.assertNotVisible('#search-note-p');
			});
		});

		// make sure we do find a good jerusalem address
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : 'ברנר 9'
			}, true);
			return true;
		}, function then() {
			this.wait(3000, function() {
				test.assertSelectorDoesntHaveText('#search-error-p', 'כתובת', 'Search for a good address');
                test.assertVisible('#search-note-p');
			});
		});
	});
	
	// Gush number search test
	casper.then(function(){
		// make sure a non-existing gush number returns an error
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : '1'
			}, true);
			return true;
		}, function then() {
			this.wait(1000, function() {
				test.assertSelectorHasText('#search-error-p', 'גוש מספר 1 לא נמצא במפה', 'Search for an invalid gush number');
                test.assertNotVisible('#search-note-p');
			});
		});

		// make sure we do find a good gush number
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : '30035'
			}, true);
			return true;
		}, function then() {
			this.wait(1000, function() {
				test.assertSelectorDoesntHaveText('#search-error-p', 'גוש', 'Search for a good gush number');
                test.assertNotVisible('#search-note-p');
			});
		});
	});

	//TODO: basic form testing (needs sinon injections and mocking
	casper.run(function(){
		this.echo(phantom.casperEngine,'debug');
		test.done();
	});
});

function initMock(){
	casper.evaluate(function(){
		var server = sinon.fakeServer.create(); server.autoRespond = true;
		console.log(planFixture_30338.length);
		var answer = JSON.stringify(planFixture_30338);
		var get_30338 = 'http://0.0.0.0:5000/gush/30338/plans';
		var content = {"content-type":"application/json"};
		//TODO: change the response for address locating
		server.respondWith('GET',get_30338 ,
			[200, content , answer]);
		server.respond();
		console.log('injected sinon');
		//console.log(server);
		//return server;

	});
	casper.log('injected sinon fakeserver now', 'debug');
}

function log(msg){
	console.log(msg);
}

