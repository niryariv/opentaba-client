var subscribe = function () {
    var targetUrl = get_url();

    hn.subscribe(targetUrl, '', '', '', '',
        function (key) {
            console.log('logged in! key:', key);
        }, function (subscribeUrl) {
            console.log('Not logged in, logging url:', subscribeUrl);
            registerUser(subscribeUrl, targetUrl);

        });
};

var registerUser = function (subscribeUrl, targetUrl) {
    window.open(subscribeUrl, 'Registering', 'height=400, width=640, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, directories=no, status=no');
    //retry once to subscribe

    hn.subscribe(targetUrl, '', '', '', '',
        function (key) {
            console.log('logged in! key:', key);
        }, function (subscribeUrl) {
            console.log('user still not logged in', subscribeUrl);
        });
};

var get_url = function () {

    baseUrl = API_URL + "feed/gush/"

    if (currentGush) {
        return baseUrl + currentGush + '.atom'
    } else {
        return API_URL + '/plans.atom'
    }
};

var fb_share = function () {
    window.open(
        'http://www.facebook.com/sharer.php?s=100&p[url]=http://opentaba.info&p[images][0]=http://jnul.huji.ac.il/dl/maps/jer/images/jer010/Jer010_b.jpg&p[title]=תב"ע+פתוחה&p[summary]=',
        'facebook_share',
        'height=320, width=640, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, directories=no, status=no'
    );
};