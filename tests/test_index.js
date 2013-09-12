//var casper = require('casper').create();

//Some setup
var url = '../index.html';
casper.options.clientScripts.push('./node_modules/sinon/lib/sinon.js');
casper.options.clientScripts.push('./fixture.js');
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {width:1024, height:768};
//Starting the tests
casper.test.begin('Basic index.html elements test',23, function suite(test){

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
		test.assertResourceExists('data/gushim.min.js');
		test.assertResourceExists('app.js');
		test.assertResourceExists('lib/bootstrap/js/bootstrap.min.js');
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
	var hashpath = '/gush/30338';
	var gushurl = url +'#'+ hashpath;

	casper.thenOpen(gushurl).on('url.changed', initMock).wait(5000)
		
	casper.then(function(){
		//test.assertSelectorHasText('#info','עוד מעט');
		this.waitForText('30338');	
		test.assertSelectorHasText('#info','גוש 30338');

		/*this.waitForText('42',function(){
			//this.echo(this.getHTML());
			test.assertTextExists('42', 'the answer is 42');
		});
		test.assertHttpStatus('200','ajax is returning something');*/
	});

	casper.run(function(){
		test.done()
	});
});

function initMock(){
	casper.evaluate(function(){
		var server = sinon.fakeServer.create(); server.autoRespond = true;
		console.log(planFixture_30338.length);
		var answer = planFixture_30338;
		server.respondWith('GET', 'http://0.0.0.0:5000/gush/30338/plans',
			[200, {"content-type":"application/json"}, answer]);
		server.respond();
		console.log('injected sinon');
		//console.log(server);
		//return server;

	});
	casper.log('injected sinon fakeserver now', 'debug');
};

function log(msg){
	console.log(msg);
};

