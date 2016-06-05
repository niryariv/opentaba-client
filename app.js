var RUNNING_LOCAL = (document.location.host.indexOf('localhost') > -1 || document.location.host.indexOf('0.0.0.0') > -1 || document.location.protocol == 'file:');
var DOMAIN = 'opentaba.info';
var NOTIFIER_URL = "82.196.4.213";

// get the requested url. we do this because the subdomains will just be frames redirecting to the main domain, and since we
// can't do cross-site with them we can't just use parent.location
url = (window.location != window.parent.location) ? document.referrer : document.location.toString();
url = url.replace('http://', '').replace('https://', '');

var DEFAULT_MUNI = 'jerusalem';

// get the wanted municipality (the subsomain)
var muni_name = url.substr(0, url.indexOf(DOMAIN) - 1);
var muni = municipalities[muni_name];
if (muni == undefined) {
    if (RUNNING_LOCAL && location.hash == '#/holon-test') {
        // this is so we are able to test another municipality besides jerusalem without running a web-server, messing with hosts and stuff
        muni_name = 'holon';
        muni = municipalities['holon'];
    } else {
        // we now have all subdomains linking here, so undefined muni means we either browsed www.opentaba.info or opentaba.info or an unknown municipality
        muni_name = DEFAULT_MUNI;
        muni = municipalities[DEFAULT_MUNI];
    }
}

var API_URL = RUNNING_LOCAL ? 'http://0.0.0.0:5000/' : ('muni.server == undefined') ? 'http://opentaba-server-' + muni_name + '.herokuapp.com/' : muni.server;
var gushim;
var gushimLayer;
leafletPip.bassackwards = true;

// use delegation to allow the big gushim json to be loaded asynchronously while still supporting our #/gush/:gush_id address mapping
var got_gushim_delegate;
var got_gushim_delegate_gush_param;
var got_gushim_delegate_plan_param;

var DEFAULT_ZOOM = 13;
var recently_active_gushim = [];
var neighbour_gushim = [];
var selected_gush;
var INACTIVE_GUSH_COLOR = '#555';
var ACTIVE_GUSH_COLOR = '#d7191c';
var NEIGHBOUR_GUSH_COLOR = '#83a';
var SELECTED_GUSH_COLOR = '#0aa';


// Utility endsWith function
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


function get_gush(gush_id, plan_id) {
    selected_gush = gush_id;
    neighbour_gushim = find_neighbours(gush_id).map(function(g) { return g.id; });

    // clear current highlights and highlight the selected plan
    clear_all_highlight();
    highlight_gush(gush_id);

    // highlight neighbours
    $.each(neighbour_gushim, function(n) {
        // neighbours will contain the requested gush because it intersects with itself
        if (neighbour_gushim[n] != gush_id)
            color_gush(neighbour_gushim[n], NEIGHBOUR_GUSH_COLOR, 0.2);
    });

	$.getJSON(
		API_URL + 'gush/' + neighbour_gushim.join() + '/plans.json',
		function(d) {

			var rendered_gush = render('plans', {plans: d, base_api_url: API_URL, city_name: muni.display, gush_id: gush_id, notifier_url: NOTIFIER_URL, plan_id: decodeURIComponent(plan_id)});
			$("#info").html(rendered_gush);

            if (plan_id) {
                if ($('#selected-plan').length == 1) {
                    // scroll to 30px above the plan plan
                    $('#info-div').animate({ scrollTop: $('#selected-plan').offset().top - 70 }, 2000);
                    $('#search-error-p').html('');
                } else {
                    // scroll back to the top and show the user an error
                    $('#info-div').animate({ scrollTop: 0 }, 1);
                    $('#search-error-p').html('התוכנית המבוקשת לא נמצאה');
                }
            }
		}).fail(function() {
			$("#info").html("לא נמצאו תוכניות בגוש או שחלה שגיאה בשרת");
		});

    // if this is mobile-view and it's not open, automatically open the "side-menu" for plan details
    if ($('.row-offcanvas').css('position') == 'relative' && !$('.row-offcanvas').hasClass('active'))
        $('[data-toggle=offcanvas]').click();
}


// find a rendered gush based on ID
function find_gush(gush_id){
	g = gushim.filter(
		function(f){ return (f.id == gush_id); }
	);

    return g[0];
}


// find a gush by street address
function find_gush_by_addr(address) {
    var search_address = address;

	// add the city name if it is not in the search string
	if (search_address.indexOf(muni.display) == -1) {
		search_address = search_address + " " + muni.display;
	}

	// Use Google api to find a gush by address
	$.getJSON(
		'https://maps.googleapis.com/maps/api/geocode/json?address='+search_address+'&sensor=false',
		function (r) {
			$('#scrobber').hide();

			if (r['status'] == 'OK' && r['results'].length > 0) {
				// Here we have a case when Google api returns without an actual place (even a street),
				// so it only has a city. This happens because it didn't find the address, but we
				// did append the name of the current city at the end, and Google apparently thinks
				// 'better something than nothing'. We're trying to ignore this (should test though)
				if (r['results'][0]['types'].length == 2 &&
					$.inArray('locality', r['results'][0]['types']) > -1 &&
					$.inArray('political', r['results'][0]['types']) > -1) {
					find_plan(address);
				}
				else {
					var lat = r['results'][0]['geometry']['location']['lat'];
					var lon = r['results'][0]['geometry']['location']['lng'];
					console.log('got lon: ' + lon + ', lat: ' + lat);

					// Using leafletpip we try to find an object in the gushim layer with the coordinate we got
					var gid = leafletPip.pointInLayer([lat, lon], gushimLayer, true);
					if (gid && gid.length > 0) {
						get_gush(gid[0].gushid);
						var pp = L.popup().setLatLng([lat, lon]).setContent('<b>' + search_address + '</b>').openOn(map);

                        // show search note after a successful search
                        $('#search-note-p').show();
					} else {
						find_plan(address);
					}
				}
			}
			else if (r['status'] == 'ZERO_RESULTS') {
				find_plan(address);
			}
			else {
				$('#search-error-p').html('חלה שגיאה בחיפוש, אנא נסו שנית מאוחר יותר');
			}
		}
	)
   .fail(
   		function(){
   			$('#scrobber').hide();
   			$('#search-error-p').html('חלה שגיאה בחיפוש, אנא נסו שנית מאוחר יותר');
   		}
   	);
}


function find_plan(plan_name) {
    var encoded_plan = encodeURIComponent(plan_name);
    // ask our server if he knows
	$.getJSON(
		API_URL + 'plans/search/' + encoded_plan,
		function (res) {

			$('#scrobber').hide();

            // if no results tell the user. if there's one result jump directly to it. if more than one
            // show the user links for all
			if (res.length == 0) {
                $('#search-error-p').html('לא נמצאו תוצאות עבור השאילתה');
            } else if (res.length == 1) {
                location.hash = "#/gush/" + res[0]['gushim'][0] + '/plan/' + encodeURIComponent(res[0]['number']);
            } else {
                var plan_suggestions = $('#search-plan-suggestions');
                plan_suggestions.html('האם התכוונת ל: ');

                $.each(res, function(i) {
					plan_suggestions.append($('<a href="/#/gush/' + res[i]['gushim'][0] + '/plan/' +
                        encodeURIComponent(res[i]['number']) + '">' + res[i]['number'] + "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;      "));
				});

                plan_suggestions.show();
            }
		}

  )
   .fail(
   		function(){
   			$('#scrobber').hide();
   			$('#search-error-p').html('חלה שגיאה בחיפוש, אנא נסו שנית מאוחר יותר');
   		}
   	);
}


// get a list of neighbours for a gush
function find_neighbours(gush_id) {
    var gushBounds = map._layers['gush_' + gush_id].getBounds();

    // can extend the bounds by either a flat 10% or by 0.0005 degree (about fifty meters) in every direction
    //gushBounds = gushBounds.pad(0.1);
    var p = gushBounds.getSouthWest();
    p.lat = p.lat - 0.0005;
    p.lng = p.lng - 0.0005;
    gushBounds.extend(p);
    p = gushBounds.getSouthEast();
    p.lat = p.lat - 0.0005;
    p.lng = p.lng + 0.0005;
    gushBounds.extend(p);
    p = gushBounds.getNorthWest();
    p.lat = p.lat + 0.0005;
    p.lng = p.lng - 0.0005;
    gushBounds.extend(p);
    p = gushBounds.getNorthEast();
    p.lat = p.lat + 0.0005;
    p.lng = p.lng + 0.0005;
    gushBounds.extend(p);

    // filter the list of gushim to find intersecting ones with our enhanced bounds
    var neighbours = gushim.filter(function(g) {
        return (gushBounds.intersects(map._layers['gush_' + g.id].getBounds()));
    });

    return neighbours;
}


function color_gush(id, color, opacity) {
    try{
	    map._layers['gush_' + id].setStyle({opacity: opacity , color: color});
    }
    catch(err){
    console.log("color_gush error: ",err);
    }
    }

function highlight_gush(id) {
	map.fitBounds(map._layers['gush_' + id].getBounds());
	color_gush(id, "#0aa", 0.2)
}


function clear_highlight(id) {
	gush = 'gush_' + id;

    if (id == selected_gush)
        color_gush(id, SELECTED_GUSH_COLOR, 0.5);
    else if (neighbour_gushim.indexOf(id) > -1)
        color_gush(id, NEIGHBOUR_GUSH_COLOR, 0.5);
    else if (recently_active_gushim.indexOf(id) > -1)
        color_gush(id, ACTIVE_GUSH_COLOR, 0.5);
    else
        color_gush(id, INACTIVE_GUSH_COLOR, 0.5);
}


function clear_all_highlight() {
    if (gushim) {
        $.each(gushim, function(g) {
            clear_highlight(gushim[g].id);
        });
    }
}


function onEachFeature(feature, layer) {
	// layer.bindPopup(feature.properties.Name + " גוש ");
	layer.on({
				'mouseover'	: function() { this.setStyle({weight: 5}) },
				'mouseout'	: function() { this.setStyle({weight: 1}) },
				'click'		: function() {
					$("#info").html("עוד מעט...");
					location.hash = "#/gush/" + feature.id;
				}
			});
	layer["gushid"] = feature.id;
	layer._leaflet_id = 'gush_' + feature.id;

	if (recently_active_gushim.indexOf(feature.id) > -1) {
		layer.options.color = ACTIVE_GUSH_COLOR;
	}
}


// START HERE
$(document).ready(function(){

	// setup a path.js router to allow distinct URLs for each block
	Path.map("#/gush/:gush_id(/plan/:plan_id)").to(
		function(){
			if (gushim) {
                // remove '?params' if exists
				get_gush(this.params['gush_id'].split('?')[0], this.params['plan_id'] ? this.params['plan_id'].split('?')[0] : undefined);
			} else {
				// use a delegate because this script will definetly run before we finish loading the big gushim json
				got_gushim_delegate_gush_param = this.params['gush_id'].split('?')[0];
                got_gushim_delegate_plan_param = this.params['plan_id'] ? this.params['plan_id'].split('?')[0] : undefined;
				got_gushim_delegate = get_gush;
			}
		}
	);

	Path.map("#/").to(
		function(){
			clear_all_highlight();
			map.setView(muni.center, DEFAULT_ZOOM);

			// get the most recent plans to show on the homepage
			$.getJSON(API_URL + 'recent.json', function(res){
                // render template and set info div's content
                var rendered_recents = render('plans', {plans: res, base_api_url: API_URL, notifier_url: NOTIFIER_URL});
				$("#info").html(rendered_recents);

				$.each(res, function(r) {
					recently_active_gushim.push(res[r].gushim);
				});
				recently_active_gushim = [].concat.apply([], recently_active_gushim);

				if (map.hasLayer(gushimLayer)) { // gushim already loaded before the /recents - so paint them now
					$.each(recently_active_gushim, function(i){
						color_gush(recently_active_gushim[i], ACTIVE_GUSH_COLOR, 0.7);
					});
				}

			}).fail(function() {
                $("#info").html("חלה שגיאה בהורדת עדכונים אחרונים. אנא בחרו בגוש על המפה כדי לראות תוכניות הרלוונטיות אליו");
            });
		}
	);

	Path.root("#/");
	Path.listen();

	// setup search form
	$('#search-form').submit(
		function() {
			$('#scrobber').show();
			$('#search-error-p').html('');
            $('#search-note-p').hide();
            $('#search-plan-suggestions').hide();

			var search_val = $('#search-text').val();

			// if it's a number search for a gush with that number, oterwise
            // if it starts with a # search for plan, and if not do address search
			if (!isNaN(search_val)) {
                console.log('Trying to find gush #' + search_val);
                var result = find_gush(parseInt(search_val));
                if (result)
                    get_gush(parseInt(search_val));
                else
                    find_plan(search_val);

                $('#scrobber').hide();
            } else {
				console.log('Getting gush for address "' + search_val + '"');
				find_gush_by_addr(search_val);
			}

			return false;
		}
	);


	// append municipality's hebrew name
	$('#muni-text').append(' ב' + muni.display + ':');
	$('#search-text').attr('placeholder', 'הכניסו כתובת, מספר גוש או מספר תוכנית ב' + muni.display);
	$("#jump-to-title").prepend(muni.display + ' ');
	$(document).prop('title', 'תב"ע פתוחה: ' + muni.display);


    // set links according to municipality
	if (muni.fb_link) {
		$('#fb-link').attr('href', muni.fb_link);
		$('#fb-link').css('visibility', 'visible');
	}

	if (muni.twitter_link) {
		$('#twitter-link').attr('href', muni.twitter_link);
		$('#twitter-link').css('visibility', 'visible');
	}

	$('#rss-link').attr('href', API_URL + 'plans.atom');
	$('#rss-link').css('visibility', 'visible');

  // set notifier-general-link
  $('#notifier-general-link').attr('href', 'http://'+NOTIFIER_URL+ '/add/opentaba?city='+muni.display +'&link='+API_URL + 'plans.atom');
  $('#notifier-general-link').css('visibility', 'visible');
	$('#forum-link').css('visibility', 'visible');



	$('[data-toggle=offcanvas]').click(function() {
		$('.row-offcanvas').toggleClass('active');
		$('.navbar-toggle').toggleClass('active');
	});


    // load the municipality's unique css file if it was set
    if (muni.css != undefined)
        $("head").append($('<link rel="stylesheet" media="screen" />').attr('href', muni.css));
});


// setup map
var map = L.map('map', { scrollWheelZoom: true, attribution: {} });
map.attributionControl.setPrefix('Map Data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Survey of Israel');

tile_url = "http://niryariv.github.io/israel_tiles/{z}/{x}/{y}.png";

L.tileLayer(tile_url, {
	maxZoom: 16,
	minZoom: 13
}).addTo(map);


// add 'locate me' button
L.control.locate({position: 'topleft', keepCurrentZoomLevel: true, circleStyle: {
            color: '#136AEC',
            fillColor: '#136AEC',
            fillOpacity: 0.15,
            weight: 2,
            opacity: 0.5,
            clickable: false
        }, strings: {
            title: "הראה אותי",
            popup: "הנכם נמצאים בטווח של {distance} מטרים מנקודה זו",
            outsideMapBoundsMsg: "נראה שהנכם מחוץ לתחום המפה"
        }}).addTo(map);


// add control for seeing other munis
var legend = L.control({position: ($('html').is('.ie-8') || !$('#toggle-button').is(':visible')) ? 'topright' : 'bottomright'});
legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'more-munis legend');
	div.id = 'more-munis-button';

	// ie compatability (< 9) doesn't support svg
	var legendImage = $('html').is('.ie-8') ? '/img/israel.jpg' : '/img/israel.svg';
	div.innerHTML = '<h4><img src="' + legendImage + '" height="30px" />&nbsp;עוד רשויות</h4>';

	// sort munis by name
	ms = Object.keys(municipalities).sort(function(a,b){ return (municipalities[a].display > municipalities[b].display) ? 1 : -1 })

	mlist = '';
	for (var i=0 ; i < ms.length ; i++) {
		m = ms[i];
		if (!municipalities[m].hide) {
	    	mlist += '<a href="http://' + m + '.' + DOMAIN + '/">' + municipalities[m].display + '</a><br />';
	    }
	}

	div.innerHTML += '<div id="muni-list" style="display: none;">' + mlist + '</div>'
	return div;
};

legend.addTo(map);

// catch touchstart if possible, because click behaves weird on touch screens
$('#more-munis-button').on(('ontouchstart' in document.documentElement) ? 'touchstart' : 'click', function(){
    $('#muni-list').slideToggle(300);
});


// // add muni markers to map
// var muni_icon = L.divIcon({
// 	className: 'muni-marker'
// 	,html: '<a href="//' + k + '.' + DOMAIN + '/">תב״ע פתוחה: ' + m.display + '</a>'
// 	,iconSize: null
// });
// L.marker(m.center, {icon: muni_icon}).addTo(map);


// since github's api requires https and we don't run https, internet explorer up to and including version 9
// won't be able to make this request (because of restrictions set in the XDomainRequest object, more details at:
// http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx)
// so in those cases, we proxy the request through our server and remove the need for https
var mapUrl;
if (muni.file != undefined)
    mapUrl = muni.file;
else
    if ($('html').is('.ie-9') || $('html').is('.ie-8'))
        mapUrl = 'http://' + DOMAIN + '/maps/' + muni_name + '.topojson';
    else
        mapUrl = 'https://api.github.com/repos/niryariv/israel_gushim/contents/' + muni_name + '.topojson';

// load gushim topojson
$.ajax({
	url: mapUrl,
    headers: { Accept: 'application/vnd.github.raw' },
	dataType: 'json'
}).done(function(res) {
	gushim = topojson.feature(res, res.objects[muni_name]).features;

	gushimLayer = L.geoJson(gushim,
		{
			onEachFeature: onEachFeature,
			style : {
				"color" : INACTIVE_GUSH_COLOR,
				"weight": 1,
				"opacity": 0.5,
				"fillOpacity": 0.2
				// "fillColor": "#999"
			}
		}
	).addTo(map);


    // set map bounds. We want them a little larger than the actual area bounds, so users can see labels for other areas
	var bnds = L.latLngBounds(muni.bounds != undefined ? muni.bounds : gushimLayer.getBounds());
	map.setMaxBounds([
		[bnds.getSouth() - 0.05, bnds.getWest() - 0.05]
		,[bnds.getNorth() + 0.05, bnds.getEast() + 0.05]
	]);


    // set center and boundaries as defined in the munis.js file or according to the gushimLayer
    map.setView((muni.center == undefined) ? gushimLayer.getBounds().getCenter() : muni.center, DEFAULT_ZOOM);



	// if the direct gush address mapping was used go ahead and jump to the wanted gush
	if (got_gushim_delegate) {
		got_gushim_delegate(got_gushim_delegate_gush_param, got_gushim_delegate_plan_param);
		map._onResize();
	}

});
