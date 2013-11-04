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
casper.test.begin('Basic index.html elements test',30, function suite(test){

	casper.on('page.init',initMock).
	on('remote.message',log).
	start(url, function(){

		//casper.options.clientScripts.push('../testlibs/sinon-1.7.3.js');
		test.assertTitle('תב"ע פתוחה',"The title is what we expected");
		test.assertExists('form[id="addr-form"]', 'The Address form exists');
		test.assertExists('#right-bar','The right bar exists');
		test.assertVisible('#right-bar');
		test.assertExists('#header', 'The header div exists');
		test.assertVisible('#header');
		test.assertExists('#info', 'The info div exists');
		test.assertVisible('#info');
		//this.wait(5000);
		test.assertExists('#map.leaflet-container.leaflet-fade-anim','The map div exists with leaflet class');
		test.assertExists('#docModal','The doc modal exists');
		test.assertNotVisible('#docModal');
		test.assertExists('#faqModal','The faq modal exists');
		test.assertNotVisible('#faqModal');
		test.assertExists('.icon-twitter', 'The twitter icon exists');
		test.assertVisible('.icon-twitter');
		test.assertExists('.icon-facebook', 'The facebook icon exists');
		//very tied to implentation should think about this
		test.assertResourceExists('lib/pdfobject.js');
		test.assertResourceExists('lib/path.js');
		test.assertResourceExists('data/cities.js');
		test.assertResourceExists('data/gushim/jerusalem.gush.js'); // The default city. need subdomains to load other ones
		test.assertResourceExists('app.js');
		test.assertResourceExists('lib/bootstrap/js/bootstrap.min.js');
		test.assertExists('#city-text');
		test.assertVisible('#city-text');
		test.assertSelectorHasText('#city-text', 'בירושלים:', 'City name correctly displayed'); // Default city again
		test.assertExists('#city-jump');
		test.assertVisible('#city-jump');
		test.assertElementCount('#city-jump option', 38, 'There are 34 loaded cities');
		
		//TODO: phantomcss check map rendering
	});

	casper.thenClick('a[href="#faqModal"]',function(){
		this.echo('clicked faqModal');
		this.waitUntilVisible('#faqModal');
	});

	casper.then(function(){
		test.assertVisible('#faqModal');
		this.click('button[class="close"]');
		this.echo('clicked to close faqModal');
	});

	casper.then(function(){
		test.assertNotVisible('faqModal');
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

