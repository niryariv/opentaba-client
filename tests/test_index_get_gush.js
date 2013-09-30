/*global casper:false */
/*functional testing for the basic functionality of opentaba home page - The part displayed when showing specific plan 
 
 runs with casperjs test filename (or casperjs.bat on windows)
*/

//Some setup //TODO: move this to a global casper config

var url = '../index.html';
casper.options.clientScripts.push('./sinon-1.7.3.js');
casper.options.clientScripts.push('./fixture.js');
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {width:1024, height:768};
//Starting the tests
casper.test.begin('Testing a specific gush plans display',4, function suite(test){

	casper.on('page.init',initMock).
	on('remote.message',log).
	start(url, function(){

	});
	
	var hashpath = '/gush/30338';
	var gushurl = url +'#'+ hashpath;
	casper.thenOpen(gushurl).on('url.changed', initMock).wait(10000).
	then(function(){
		test.assertExists('#info h3','the info h3 exists now');
		test.assertSelectorHasText('#info h3','גוש 30338');
		//casper.log('The info h3 contains the expected text');
		test.assertElementCount('div#info tr.item',31,"31 items exists in info div as expected");
		test.assertElementCount('div#info a',85, "85 a links should exists in info div");
	});

	var href;
	casper.then(function(){
		href = casper.evaluate(function(){
			//implent a test for specifc link href
		});
	});

	casper.then(function(){
		//implent a test for icons
	});

	casper.run(function(){
		test.done();
	});
});

function initMock(){
	casper.evaluate(function(){
		var server = sinon.fakeServer.create();
		server.autoRespond = true;
		var answer = JSON.stringify(planFixture_30338);
		server.respondWith('GET', 'http://0.0.0.0:5000/gush/30338/plans',
			[200, {"content-type":"application/json"}, answer]);
		server.respond();
		console.log('injected sinon with test fixture');

	});
	casper.log('injected sinon fakeserver now', 'debug');
}

function log(msg){
	console.log(msg);
}

