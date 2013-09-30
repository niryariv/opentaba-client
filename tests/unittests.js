/*global casper:false */
/* runs unit tests on various app.js functions
 
 runs with casperjs test filename (or casperjs.bat on windows)
*/
//Some setup //TODO: move this to a global casper config
var url = '../index.html';
casper.options.clientScripts.push('./node_modules/sinon/lib/sinon.js');
casper.options.clientScripts.push('./fixture.js');
casper.options.logLevel = "debug";
casper.options.verbose = true;

