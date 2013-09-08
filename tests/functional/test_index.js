//var casper = require('casper').create();

url = '../../index.html'

/*casper.start(url, function(){
	this.echo(this.getTitle());
});
*/
casper.test.begin('Basic index.html elements test',13, function suite(test){
	casper.start(url, function(){
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
	test.assertExists('#faqModal','THe faq modal exists');
	test.assertNotVisible('#faqModal');
	});

	casper.run(function(){
		test.done()
	});
});

