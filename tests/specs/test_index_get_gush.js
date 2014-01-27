/*global casper:false */
/*functional testing for the basic functionality of opentaba home page - The part displayed when showing specific plan

 Runs with casperjs test filename (or casperjs.bat on windows)
*/

//Some setup //TODO: move this to a global casper config

var url = 'http://localhost:9001/';
casper.options.clientScripts.push('./tests/sinon-1.7.3.js');
casper.options.clientScripts.push('./tests/fixture.js');
casper.options.logLevel = "debug";
casper.options.verbose = true;
casper.options.viewportSize = {
    width: 1024,
    height: 768
};

var phantomcss = require('../PhantomCSS/phantomcss.js');
phantomcss.init({
    libraryRoot: './tests/PhantomCSS',
    screenshotRoot: './tests/img',
    failedComparisonsRoot: './tests/fail_img',
    threshold: 0.08
});
//var delay = 10;
//Starting the tests
casper.test.begin('Testing a specific gush plans display', 10, function suite(test) {

    casper.on('page.init', initMock).
    on('remote.message', log).
    start(url, function() {

    });

    var hashpath = '/gush/30338';
    var gushurl = url + '#' + hashpath;
    casper.thenOpen(gushurl).on('url.changed', initMock).wait(10000).
    then(function() {
        test.assertExists('#info h3', 'the info h3 exists now');
        test.assertSelectorHasText('#info h3', 'גוש 30338');
        //casper.log('The info h3 contains the expected text');
        test.assertElementCount('div#info tr.item', 31, "31 items exists in info div as expected");
        test.assertElementCount('div#info a', 85, "85 'a' links should exists in info div");
        test.assertSelectorHasText('div#info', 'תוספת גלריית עזרת נשים בבית כנסת קיים', 'Info div has some sampled expected text');
        test.assertSelectorHasText('div#info', 'קביעת הוראות לאיחוד חלוקה חדשה', 'Info div has some sampled expected text');
        test.assertSelectorHasText('div#info', 'אחוד וחלוקה מחדש במורדות צפון מזרח השכונה', 'Info div has some sampled expected text');
        test.assertSelectorHasText('div#info', 'השלמ סעיף 3 שטח התוכנית ומקומה ע"י הוספת גושי', 'Info div has some sampled expected text');
        test.assertSelectorHasText('div#info', 'הפיכת השכונה ממגורים 1 למגורים 5', 'Info div has some sampled expected text');


    });

    casper.then(function() {
        phantomcss.screenshot("#map.leaflet-container.leaflet-fade-anim", "mapon_gush_30338.png");
    });

    var href;
    casper.then(function() {
        href = casper.evaluate(function() {
            //implement a test for specific link href
        });
    });

    casper.then(function() {
        //implement a test for icons
    });

    /*    casper.then(function(){

        phantomcss.screenshot('#info','info_div.png');
        //implement gush picture
    });

*/
    casper.then(function compare_map_gush() {
        phantomcss.compareMatched(".mapon_gush_30338");
    });

    casper.then(function check_phantomcss_map_gush() {
        test.assertEqual(phantomcss.getExitStatus(), 0, 'map gush div should look according to predefined pictures');
    });

    casper.then(function searchAddress() {
        //fill "יד ושם" in search
    });

    casper.then(function() {
        //assert url 30348

    });


    casper.then(function() {
        //assert page elements
    })
    //TODO: find out how to solve the font kerning problem failing this test
    /* casper.then(function check_info_screenshot(){
        phantomcss.compareMatched(".info_div");
    });

    casper.then(function check_phantomcss_info_div(){
        test.assertEqual(phantomcss.getExitStatus(),0,'info div should look according to predefined picture');});
*/
    casper.run(function() {
        test.done();
    });
});

function initMock() {
    casper.evaluate(function() {
        var server = sinon.fakeServer.create();
        server.autoRespond = true;
        var answer = JSON.stringify(planFixture_30338); //from
        var geocode = JSON.stringfy(mockGeoCode);
        var searchAnswer = JSON.stringfy(planFixture_30348);
        server.respondWith('GET', 'http://0.0.0.0:5000/gush/30338/plans.json', [200, {
                "content-type": "application/json"
            },
            answer //from fixture
        ]);
        server.respondWith('GET', 'https://opentaba-server.herokuapp.com/gush/30338/plans.json', [200, {
                "content-type": "application/json"
            },
            answer //from fixtrure
        ]);
        server.respondWith('GET', 'https://opentaba-dev-server.herokuapp.com/gush/30338/plans.json', [200, {
                "content-type": "application/json"
            },
            answer
        ]);

        server.respondWith('GET', 'https://maps.googleapis.com/maps/api/geocode/json?sensor=^false$&address=^\×\\×\\ \×\\×\©\×\\ \×\\×\¨\×\\×\©\×\\×\\×\$', [200, {
                "content-type": "application/json"
            },
            geocode
        ]);

        server.respondWith('GET', 'https://opentaba-server.herokuapp.com/gush/30348/plans.json', [200, {
                "content-type": "application/json"
            },
            searchAnswer
        ]);

        server.respond();
        console.log('injected sinon with test fixture');

    });
    casper.log('injected sinon fakeserver now', 'debug');
}

function log(msg) {
    console.log(msg);
}