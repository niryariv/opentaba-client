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
casper.test.begin('Basic index.html elements test',48, function suite(test){

	casper.on('remote.message',log).
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
    
    // init mocked data
    casper.then(function(){
        initMock();
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
				test.assertSelectorHasText('#search-error-p', 'לא נמצאו תוצאות עבור השאילתה', 'Search for an invalid address');
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
				test.assertSelectorHasText('#search-error-p', 'לא נמצאו תוצאות עבור השאילתה', 'Search for an address in a differenct city (no gush will be found)');
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
				test.assertNotVisible('#search-error-p', 'Search for a good address');
                test.assertVisible('#search-note-p');
			});
		});
	});
	
	// Gush number search test
	casper.then(function(){
		// make sure a non-existing gush number returns an error
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : '11111'
			}, true);
			return true;
		}, function then() {
			this.wait(1000, function() {
				test.assertSelectorHasText('#search-error-p', 'לא נמצאו תוצאות עבור השאילתה', 'Search for an invalid gush number');
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
    
    // Plan number search test
	casper.then(function(){
		// make sure a non-existing plan number returns an error
		casper.waitFor(function check() {
            this.fill("form#search-form", {
				'search-value' : '12345'
			}, true);
			return true;
		}, function then() {
			this.wait(1000, function() {
                test.assertVisible('#search-error-p');
				test.assertSelectorHasText('#search-error-p', 'לא נמצאו תוצאות עבור השאילתה', 'Search for a non-existing plan number');
                test.assertNotVisible('#search-plan-suggestions');
			});
		});

		// make sure part of a number returns multiple suggestions
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : '12'
			}, true);
			return true;
		}, function then() {
			this.wait(1000, function() {
				test.assertNotVisible('#search-error-p');
                test.assertVisible('#search-plan-suggestions');
                test.assertSelectorHasText('#search-plan-suggestions', 'האם התכוונת ל:', 'Search for a partial plan number and get suggestions');
			});
		});
        
        // make sure an exact plan number takes us to it
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : '12222'
			}, true);
			return true;
		}, function then() {
			this.wait(1000, function() {
				test.assertNotVisible('#search-error-p');
                test.assertNotVisible('#search-plan-suggestions');
                test.assertEval(function() {
                    return location.hash === '#/gush/28107/plan/12222';
                });
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
		var server = sinon.fakeServer.create();
        server.autoRespond = true;
        
        // filter in only requests made to our server
        server.xhr.useFilters = true;
        server.xhr.addFilter(function(method, url) {
            // if we return true the request will not faked
            return !url.match(/0.0.0.0:5000/);
        });
        
        var answer_12345 = JSON.stringify(planSearchFixture_12345);
        var answer_12 = JSON.stringify(planSearchFixture_12);
        var answer_12222 = JSON.stringify(planSearchFixture_12222);
        
		var content = {'content-type':'application/json'};
        
        // good search feedbacks
		server.respondWith('GET', 'http://0.0.0.0:5000/plans/search/12345',
			[200, content, answer_12345]);
        server.respondWith('GET', 'http://0.0.0.0:5000/plans/search/12',
			[200, content, answer_12]);
        server.respondWith('GET', 'http://0.0.0.0:5000/plans/search/12222',
			[200, content, answer_12222]);
        
        // bad search feedbacks
        server.respondWith('GET', 'http://0.0.0.0:5000/plans/search/%D7%A8%D7%97%D7%95%D7%91%D7%A9%D7%9C%D7%90%D7%A7%D7%99%D7%99%D7%9D',
            [200, content, '[]']);
        server.respondWith('GET', 'http://0.0.0.0:5000/plans/search/%D7%A9%D7%93%D7%A8%D7%95%D7%AA%20%D7%9E%D7%95%D7%A8%D7%99%D7%94%20%D7%97%D7%99%D7%A4%D7%94',
            [200, content, '[]']);
        server.respondWith('GET', 'http://0.0.0.0:5000/plans/search/11111',
            [200, content, '[]']);
        
        server.respond();
		console.log('injected sinon');
	});
	casper.log('injected sinon fakeserver now', 'debug');
}

function log(msg){
	console.log(msg);
}

