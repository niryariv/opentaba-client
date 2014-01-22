/*global casper:false */
/*functional testing for map regression with img evaluating.

 runs with casperjs test filename (or casperjs.bat on windows)
*/
//Some setup //TODO: move this to a global casper config
var url = 'http://localhost:9001/';
// var casper = require('casper').create({
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {width:1024, height:768};

//initializing phantomcss

var phantomcss = require('../PhantomCSS/phantomcss.js');
phantomcss.init({
    libraryRoot:'./tests/PhantomCSS',
    screenshotRoot:'./tests/img',
    failedComparisonsRoot:'./tests/fail_img',
    threshold:0.08
});
var delay = 10;
casper.test.begin('Testing map regression',1,function suite(test){

  casper.start(url).then(function(){
      phantomcss.screenshot('#map.leaflet-container.leaflet-fade-anim','full_map.png');
  });

  casper.then(function now_check_the_screenshot(){
      phantomcss.compareMatched(".full_map");
  })
  casper.then(function check_phantomcss_full_map(){
        test.assertEqual(phantomcss.getExitStatus(),0,'full map div should look according to predefined pictures');
    });

  // run(function end_it(){
  //     console.log('ending the phantomcss test');
  //     test.done(phantomcss.getExitStatus())
  //     // phantom.exit(phantomcss.getExitStatus());
  // });
// casper.then(function(){
//         casper.test.done();
//     })

//   casper.run(function(){
//           console.log('ending the phantomcss test');
//         phantom.exit(phantomcss.getExitStatus());
//     });
    casper.run(function(){
        test.done();
    });
});
