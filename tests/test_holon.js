var url = '../index.html#/holon-test';
casper.options.clientScripts.push('./sinon-1.7.3.js');
casper.options.clientScripts.push('./fixture.js');
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {width:1024, height:768};

//Starting the tests
casper.test.begin('Different municipality index.html test (holon)',29, function suite(test){

	casper.start(url, function(){
		test.assertTitle('תב"ע פתוחה: חולון',"The title is what we expected");
		test.assertExists('form[id="search-form"]', 'The search form exists');
		test.assertExists('#right-bar','The right bar exists');
		test.assertVisible('#right-bar');
		test.assertExists('#header', 'The header div exists');
		test.assertVisible('#header');
		test.assertExists('#info', 'The info div exists');
		test.assertVisible('#info');
		test.assertExists('#map.leaflet-container.leaflet-fade-anim','The map div exists with leaflet class');
        
        // make sure the twitter and facebook links are not visible because holon (currently) doesn't have those pages
		test.assertExists('.icon-twitter', 'The twitter icon exists');
		test.assertNotVisible('.icon-twitter');
		test.assertExists('.icon-facebook', 'The facebook icon exists');
        test.assertNotVisible('.icon-facebook');
        test.assertExists('.icon-rss', 'The rss icon exists');
        test.assertVisible('.icon-rss');
        
		test.assertResourceExists('lib/path.js');
        test.assertResourceExists('munis.js');
		test.assertResourceExists('holon.topojson');
		test.assertResourceExists('app.js');
		test.assertResourceExists('lib/bootstrap/js/bootstrap.min.js');
        test.assertResourceExists('handlebars.min.js');
        test.assertResourceExists('lib/template-renderer.js');
		
		// make sure the toggle button exists and is not visible
		test.assertExists('#toggle-button', 'The toggle button exists');
		test.assertNotVisible('#toggle-button', 'The toggle button is not visible');

        // search note should be hidden until a search is successfuly made
        test.assertNotVisible('#search-note-p');
	});
    
    // init mocked data
    casper.then(function(){
        initMock();
    });
	
	// Address search tests
	casper.then(function(){
		// make sure a jerusalem address returns an error
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : 'ברנר 9 ירושלים'
			}, true);
			return true;
		}, function then() {
			this.wait(3000, function() {
				test.assertSelectorHasText('#search-error-p', 'לא נמצאו תוצאות עבור השאילתה', 'Search for an address in a differenct city (no gush will be found)');
                test.assertNotVisible('#search-note-p');
			});
		});

		// make sure we do find a good holon address
		casper.waitFor(function check() {
			this.fill("form#search-form", {
				'search-value' : 'גולדה מאיר 1'
			}, true);
			return true;
		}, function then() {
			this.wait(3000, function() {
				test.assertSelectorDoesntHaveText('#search-error-p', 'כתובת', 'Search for a good address');
                test.assertVisible('#search-note-p');
			});
		});
	});

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
        
        // bad search feedback
        server.respondWith('GET', 'http://0.0.0.0:5000/plans/search/%D7%91%D7%A8%D7%A0%D7%A8%209%20%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D',
            [200, {'content-type':'application/json'}, '[]']);
        
        server.respond();
		console.log('injected sinon');
	});
	casper.log('injected sinon fakeserver now', 'debug');
}

