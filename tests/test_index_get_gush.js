/*global casper:false */
/*functional testing for the basic functionality of opentaba home page - The part displayed when showing specific plan 
 
 Runs with casperjs test filename (or casperjs.bat on windows)
*/

//Some setup //TODO: move this to a global casper config

var url = '../index.html';
casper.options.clientScripts.push('./sinon-1.7.3.js');
casper.options.clientScripts.push('./fixture.js');
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {width:1024, height:768};

var phantomcss = require('./PhantomCSS/phantomcss.js');
phantomcss.init({
    libraryRoot:'./PhantomCSS',
    screenshotRoot:'./img',
    failedComparisonsRoot:'./fail_img',
    threshold: 0.08
});
//var delay = 10;
//Starting the tests
casper.test.begin('Testing a specific gush plans display',22, function suite(test){

    casper.on('page.init',initMock).
    on('remote.message',log).
    start(url, function(){
        
    });

    var hashpath = '/gush/30338';
    var gushurl = url +'#'+ hashpath;
    casper.thenOpen(gushurl).on('url.changed', initMock).wait(3000).
    then(function(){
        test.assertExists('#info h3','the info h3 exists now');
        test.assertSelectorHasText('#info h3','גוש 30338');
        //casper.log('The info h3 contains the expected text');
        test.assertElementCount('div#info div.item',31,"31 items exists in info div as expected");
        test.assertElementCount('div#info a',85, "85 'a' links should exists in info div");
        test.assertSelectorHasText('div#info', 'תוספת גלריית עזרת נשים בבית כנסת קיים','Info div has some sampled expected text');
        test.assertSelectorHasText('div#info', 'קביעת הוראות לאיחוד חלוקה חדשה','Info div has some sampled expected text');
        test.assertSelectorHasText('div#info', 'אחוד וחלוקה מחדש במורדות צפון מזרח השכונה','Info div has some sampled expected text');
        test.assertSelectorHasText('div#info', 'השלמ סעיף 3 שטח התוכנית ומקומה ע"י הוספת גושי','Info div has some sampled expected text');
        test.assertSelectorHasText('div#info', 'הפיכת השכונה ממגורים 1 למגורים 5','Info div has some sampled expected text');


    });

    casper.thenOpen(gushurl + '/plan/12345').on('url.changed', initMock).wait(10000)
    .then(function() {
        // make sure the page still behaves the same data-wise
        test.assertExists('#info h3','the info h3 exists now');
        test.assertSelectorHasText('#info h3','גוש 30338');
        test.assertElementCount('div#info div.item',31,"31 items exists in info div as expected");
        test.assertElementCount('div#info a',85, "85 'a' links should exists in info div");
        
        // make sure the plan was not found
        test.assertDoesntExist('#selected-plan', "no plan was selected");
        test.assertSelectorHasText('#search-error-p', 'לא נמצאה', 'got error for plan selection');
    });
    
    casper.thenOpen(gushurl + '/plan/9457').on('url.changed', initMock).wait(10000)
    .then(function() {
        // make sure the page still behaves the same data-wise
        test.assertExists('#info h3','the info h3 exists now');
        test.assertSelectorHasText('#info h3','גוש 30338');
        test.assertElementCount('div#info div.item',31,"31 items exists in info div as expected");
        test.assertElementCount('div#info a',85, "85 'a' links should exists in info div");
        // make sure the plan was found
        test.assertExists('#selected-plan', "the plan was selected");
        test.assertSelectorDoesntHaveText('#search-error-p', 'לא נמצאה', 'no error for plan selection');
    });
    
    casper.then(function(){
        phantomcss.screenshot("#map.leaflet-container.leaflet-fade-anim","mapon_gush_30338.png");
    });

    var href;
    casper.then(function(){
        href = casper.evaluate(function(){
        //implement a test for specific link href
        });
    });

    casper.then(function(){
        //implement a test for icons
    });

/*    casper.then(function(){

        phantomcss.screenshot('#info','info_div.png');
        //implement gush picture
    });

*/
    casper.then(function compare_map_gush(){
        phantomcss.compareMatched(".mapon_gush_30338");
    });

    casper.then(function check_phantomcss_map_gush(){
        test.assertEqual(phantomcss.getExitStatus(),0,'map gush div should look according to predefined pictures');
    });
//TODO: find out how to solve the font kerning problem failing this test
   /* casper.then(function check_info_screenshot(){
        phantomcss.compareMatched(".info_div");
    });

    casper.then(function check_phantomcss_info_div(){
        test.assertEqual(phantomcss.getExitStatus(),0,'info div should look according to predefined picture');});
*/
    
    casper.run(function(){
        test.done();
    });
});

function initMock(){
    // load the plans' template from file
    var fs = require('fs');
    var template = '';
    var f = null;
    try {
        f = fs.open('../templates/plans.html', 'r');
        template = f.read();
    } catch (e) {
        console.log(e);
    }
    if (f) {
        f.close();
    }
    
    casper.evaluate(function(template){
        var server = sinon.fakeServer.create();
        server.autoRespond = true;
        var gush_answer = JSON.stringify(planFixture_30338);
        server.respondWith('GET', 'http://0.0.0.0:5000/gush/30154,30159,30163,30164,30166,30167,30337,30338,30340,30540,30868/plans.json',
            [200, {'content-type':'application/json'}, gush_answer]);
        server.respondWith('GET', '/templates/plans.html',
            [200, {'content-type':'text/html'}, template]);
        server.respond();
        console.log('injected sinon with test fixture');

    }, { template: template });
    casper.log('injected sinon fakeserver now', 'debug');
}

function log(msg){
    console.log(msg);
}

