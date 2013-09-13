/*global casper:false */
/*functional testing for the basic functionality of opentaba home page - The part displayed when showing specific plan 
 
 runs with casperjs test filename (or casperjs.bat on windows)
*/

//Some setup //TODO: move this to a global casper config

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

	});
	
	var hashpath = '/gush/30338';
	var gushurl = url +'#'+ hashpath;

	casper.thenOpen(gushurl).on('url.changed', initMock).wait(5000);
		
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
		test.done();
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
}

function log(msg){
	console.log(msg);
}

