// functional testing for the basic functionality of opentaba home page on small screens (without specific plan displaying)
var url = '../index.html';
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {width:252, height:800}; // this produces a 480x800 resolution like my phone. why? who the fuck knows

//Starting the tests
casper.test.begin('Mobile index.html elements test',24, function suite(test){

	casper.start(url, function(){
		test.assertTitle('תב"ע פתוחה',"The title is what we expected");
		test.assertExists('form[id="search-form"]', 'The search form exists');
		test.assertExists('#right-bar','The right bar exists');
		test.assertVisible('#right-bar');
		test.assertExists('#header', 'The header div exists');
		test.assertVisible('#header');
		test.assertExists('#info', 'The info div exists');
		test.assertVisible('#info');
		test.assertExists('#map.leaflet-container.leaflet-fade-anim','The map div exists with leaflet class');
		test.assertExists('#faqModal','The faq modal exists');
		test.assertNotVisible('#faqModal');
		test.assertExists('.icon-twitter', 'The twitter icon exists');
		test.assertVisible('.icon-twitter');
		test.assertExists('.icon-facebook', 'The facebook icon exists');
		test.assertVisible('.icon-facebook');
		//very tied to implentation should think about this
		//test.assertResourceExists('lib/pdfobject.js');
		test.assertResourceExists('lib/path.js');
		test.assertResourceExists('data/jerusalem.js');
		test.assertResourceExists('app.js');
		test.assertResourceExists('lib/bootstrap/js/bootstrap.min.js');
		
		// make sure the toggle button exists and is visible
		test.assertExists('#toggle-button', 'The toggle button exists');
		test.assertVisible('#toggle-button', 'The toggle button is visible');
		
		test.assertDoesntExist('.row-offcanvas-right.active', 'Sidebar is not active');
	});
	
	// expand sidebar
	casper.thenClick('#toggle-button',function(){
		this.echo('clicked toggle-button. info div should be on screen now');
		this.wait(1000, function () {
			test.assertExists('.row-offcanvas-right.active', 'Sidebar is active');
		});
	});
	
	// collapse sidebar again
	casper.thenClick('#toggle-button',function(){
		this.echo('clicked toggle-button. info div should be back off-screen');
		this.wait(1000, function () {
			test.assertDoesntExist('.row-offcanvas-right.active', 'Sidebar is active');
		});
	});
	
	casper.run(function(){
		this.echo(phantom.casperEngine,'debug');
		test.done();
	});
});
