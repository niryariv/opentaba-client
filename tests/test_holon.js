var url = '../index.html#/holon-test';
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
				test.assertSelectorHasText('#search-error-p', 'לא נמצא גוש התואם לכתובת', 'Search for an address in a differenct city (no gush will be found)');
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

