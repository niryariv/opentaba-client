// functional testing for the basic functionality of opentaba home page on small screens (without specific plan displaying)
var url = '../index.html';
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {width:480, height:800}; // same as my phone

//Starting the tests
casper.test.begin('Basic index.html elements test',25, function suite(test){

	casper.start(url, function(){

		test.assertTitle('תב"ע פתוחה',"The title is what we expected");
		test.assertExists('form[id="search-form"]', 'The search form exists');
		test.assertExists('#right-bar','The right bar exists');
		test.assertVisible('#right-bar');
		test.assertEval(function() {
			var rightbar = __utils__.findOne('#right-bar');
			return (rightbar.getAttribute('width') - rightbar.getAttribute('right')) <= 0;
		}, 'The right bar is off-screen');
		test.assertExists('#header', 'The header div exists');
		test.assertVisible('#header');
		test.assertExists('#info', 'The info div exists');
		test.assertVisible('#info');
		test.assertEval(function() {
			var info = __utils__.findOne('#info');
			return (info.getAttribute('width') - info.getAttribute('right')) <= 0;
		}, 'The info div is off-screen');
		test.assertExists('#map.leaflet-container.leaflet-fade-anim','The map div exists with leaflet class');
		test.assertExists('#faqModal','The faq modal exists');
		test.assertNotVisible('#faqModal');
		test.assertExists('.icon-twitter', 'The twitter icon exists');
		test.assertVisible('.icon-twitter');
		test.assertEval(function() {
			var twitter = __utils__.findOne('.icon-twitter');
			return (twitter.getAttribute('width') - twitter.getAttribute('right')) <= 0;
		}, 'The twitter icon is off-screen');
		test.assertExists('.icon-facebook', 'The facebook icon exists');
		test.assertVisible('.icon-facebook');
		test.assertEval(function() {
			var fb = __utils__.findOne('.icon-facebook');
			return (fb.getAttribute('width') - fb.getAttribute('right')) <= 0;
		}, 'The facebook icon is off-screen');
		//very tied to implentation should think about this
		//test.assertResourceExists('lib/pdfobject.js');
		test.assertResourceExists('lib/path.js');
		test.assertResourceExists('data/gushim.min.topojson');
		test.assertResourceExists('app.js');
		test.assertResourceExists('lib/bootstrap/js/bootstrap.min.js');
		
		// make sure the toggle button exists and is visible
		test.assertExists('#toggle-button', 'The toggle button exists');
		test.assertVisible('#toggle-button', 'The toggle button is visible');
	});
	
	/*casper.thenClick('#toggle-button',function(){
		this.echo('clicked toggle-button. info div should be on screen now');
		
		test.assertEval(function() {
			var rightbar = __utils__.findOne('#right-bar');
			return (rightbar.getAttribute('width') - rightbar.getAttribute('right')) > 0;
		}, 'The right bar is on-screen');
		test.assertEval(function() {
			var info = __utils__.findOne('#info');
			this.echo('sssssssss');
			return (info.getAttribute('width') - info.getAttribute('right')) > 0;
		}, 'The info div is on-screen');
		test.assertEval(function() {
			var twitter = __utils__.findOne('.icon-twitter');
			return (twitter.getAttribute('width') - twitter.getAttribute('right')) > 0;
		}, 'The twitter icon is on-screen');
		test.assertEval(function() {
			var fb = __utils__.findOne('.icon-facebook');
			return (fb.getAttribute('width') - fb.getAttribute('right')) > 0;
		}, 'The facebook icon is on-screen');
	});
	
	casper.thenClick('#toggle-button',function(){
		this.echo('clicked toggle-button. info div should be back off-screen');
		
		test.assertEval(function() {
			var rightbar = __utils__.findOne('#right-bar');
			return (rightbar.getAttribute('width') - rightbar.getAttribute('right')) <= 0;
		}, 'The right bar is off-screen');
		test.assertEval(function() {
			var info = __utils__.findOne('#info');
			return (info.getAttribute('width') - info.getAttribute('right')) <= 0;
		}, 'The info div is off-screen');
		test.assertEval(function() {
			var twitter = __utils__.findOne('.icon-twitter');
			return (twitter.getAttribute('width') - twitter.getAttribute('right')) <= 0;
		}, 'The twitter icon is off-screen');
		test.assertEval(function() {
			var fb = __utils__.findOne('.icon-facebook');
			return (fb.getAttribute('width') - fb.getAttribute('right')) <= 0;
		}, 'The facebook icon is off-screen');
	});*/
	
	casper.run(function(){
		this.echo(phantom.casperEngine,'debug');
		test.done();
	});
});
