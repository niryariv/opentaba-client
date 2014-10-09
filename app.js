 // deprecating, replacing with serverless mode
var RUNNING_LOCAL = (document.location.host.indexOf('localhost') > -1 || document.location.host.indexOf('127.0.0.1') > -1 || document.location.protocol == 'file:');

// get the requested url. we do this because the subdomains will just be frames redirecting to the main domain, and since we
// can't do cross-site with them we can't just use parent.location
url = (window.location != window.parent.location) ? document.referrer: document.location.toString();
url = url.replace('http://', '').replace('https://', '');

var DEFAULT_MUNI = 'jerusalem';

// get the wanted municipality (the subsomain)
var muni_name = url.substr(0, url.indexOf('opentaba.info') - 1);
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

var API_URL = RUNNING_LOCAL ? 'http://0.0.0.0:5000/' : (muni.server == undefined) ? 'http://opentaba-server-' + muni_name + '.herokuapp.com/' : muni.server;

var gushim;
var gushimLayer;
leafletPip.bassackwards = true;

// use delegation to allow the big gushim json to be loaded asynchronously while still supporting our #/gush/:gush_id address mapping
var got_gushim_delegate;
var got_gushim_delegate_param;

var DEFAULT_ZOOM = 13;
var highlit = [];
var recently_active_gushim = []
var ACTIVE_GUSH_COLOR = '#900';


// Utility endsWith function
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


function get_gush(gush_id) {
	// console.log("get_gush: " + API_URL + 'gush/' + gush_id + '/plans')
	clear_all_highlit();
	highlight_gush(gush_id);
	location.hash = "#/gush/" + gush_id;
	
	$.getJSON(
		API_URL + 'gush/' + gush_id + '/plans.json',
		function(d) { 
			var rendered_gush = render('plans', {plans: d, base_api_url: API_URL, gush_id: gush_id});
			$("#info").html(rendered_gush);
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


// get a gush by street address
function get_gush_by_addr(addr) {
	// add the city name if it is not in the search string
	if (addr.indexOf(muni.display) == -1) {
		addr = addr + " " + muni.display;
	}
	
	// Use Google api to find a gush by address
	$.getJSON(
		'https://maps.googleapis.com/maps/api/geocode/json?address='+addr+'&sensor=false',
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
					$('#search-error-p').html('כתובת שגויה או שלא נמצאו נתונים');
				}
				else {
					var lat = r['results'][0]['geometry']['location']['lat'];
					var lon = r['results'][0]['geometry']['location']['lng'];
					console.log('got lon: ' + lon + ', lat: ' + lat);
      
					// Using leafletpip we try to find an object in the gushim layer with the coordinate we got
					var gid = leafletPip.pointInLayer([lat, lon], gushimLayer, true);
					if (gid && gid.length > 0) {
						get_gush(gid[0].gushid);
						var pp = L.popup().setLatLng([lat, lon]).setContent('<b>' + addr + '</b>').openOn(map);
                        
                        // show search note after a successful search
                        $('#search-note-p').show();
					} else {
						$('#search-error-p').html('לא נמצא גוש התואם לכתובת'); // TODO: when enabling multiple cities change the message to point users to try a differenct city
					}
				}
			}
			else if (r['status'] == 'ZERO_RESULTS') {
				$('#search-error-p').html('כתובת שגויה או שלא נמצאו נתונים');
			}
			else {
				$('#search-error-p').html('חלה שגיאה בחיפוש הכתובת, אנא נסו שנית מאוחר יותר');
			}
		}
	)
   .fail(
   		function(){
   			$('#scrobber').hide(); 
   			$('#search-error-p').html('חלה שגיאה בחיפוש הכתובת, אנא נסו שנית מאוחר יותר');
   		}
   	);
}


function color_gush(id, color, opacity) {
	map._layers['gush_' + id].setStyle({opacity: opacity , color: color});
}

function highlight_gush(id) {
	map.fitBounds(map._layers['gush_' + id].getBounds());
	color_gush(id, "#0aa", 0.2)
	highlit.push(id);
}


function clear_highlight(id) {
	gush = 'gush_' + id;
	color_gush(id, "#888", 0.05)
	highlit.splice(highlit.indexOf(id), 1);
}


function clear_all_highlit() {
	while (highlit.length > 0) {
		clear_highlight(highlit[0]);
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
					get_gush(feature.id);
				}
			});
	layer["gushid"] = feature.id;
	layer._leaflet_id = 'gush_' + feature.id;

	if (recently_active_gushim.indexOf(feature.id) > -1) {
		layer.options.color = ACTIVE_GUSH_COLOR;
	}
}


// add markers for other munis
function mark_munis(){
	console.log
	var ms = municipalities;
	delete ms[muni_name]; // don't label current muni

	$.each(ms, function(k) {
		m = ms[k];
		var muni_icon = L.divIcon({
			className: 'muni-marker'
			,html: '<a href="//' + k + '.opentaba.info/">תב״ע פתוחה: ' + m.display + '</a>'
			,iconSize: null
		});
		L.marker(m.center, {icon: muni_icon}).addTo(map);
	});
}

function mark_active_gushim(){

}

// START HERE
$(document).ready(function(){
	
	// setup a path.js router to allow distinct URLs for each block
	Path.map("#/gush/:gush_id").to(
		function(){ 			
			if (gushim) {
				get_gush(this.params['gush_id'].split('?')[0]); // remove '?params' if exists
			} else {
				// use a delegate because this script will definetly run before we finish loading the big gushim json
				got_gushim_delegate_param = this.params['gush_id'].split('?')[0];
				got_gushim_delegate = get_gush;
			}
		}
	);

	Path.map("#/").to(
		function(){
			clear_all_highlit();
			map.setView(muni.center, DEFAULT_ZOOM);

			// get the most recent plans to show on the homepage
			$.getJSON(API_URL + 'recent.json', function(res){
                // render template and set info div's content
                var rendered_recents = render('plans', {plans: res, base_api_url: API_URL});
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
			
			var search_val = $('#search-text').val();
			
			// if it's a number search for a gush with that number, oterwise do address search
			if (!isNaN(search_val)) {
				console.log('Trying to find gush #' + search_val);
				var result = find_gush(parseInt(search_val));
				if (result)
					get_gush(parseInt(search_val));
                else
					$('#search-error-p').html('גוש מספר ' + search_val + ' לא נמצא במפה');
				
				$('#scrobber').hide(); 
			} else {
				console.log('Getting gush for address "' + search_val + '"');
				get_gush_by_addr(search_val);
			}
			
			return false;
		}
	);
	
	
	// append municipality's hebrew name
	$('#muni-text').append(' ב' + muni.display + ':');
	$('#search-text').attr('placeholder', 'הכניסו כתובת או מספר גוש ב' + muni.display);
	$("#top-title").append(": " + muni.display);
	$("title").append(": " + muni.display)

    
    // set links according to municipality

	if (muni.fb_link) {
		$('#fb-link').attr('href', muni.fb_link);
		$('#fb-link').css('visibility', 'visible');
	}

	if (muni.twitter_link) {
		$('#twitter-link').attr('href', muni.twitter_link);
		$('#twitter-link').css('visibility', 'visible');
	}

	$('#rss-link').attr('href', API_URL + '/plans.atom');
	$('#rss-link').css('visibility', 'visible');



	$('[data-toggle=offcanvas]').click(function() {
		$('.row-offcanvas').toggleClass('active');
		$('.navbar-toggle').toggleClass('active');
	});
    

    // load the municipality's unique css file if it was set
    if (muni.css != undefined)
        $("head").append($('<link rel="stylesheet" media="screen" />').attr('href', muni.css));
});


// setup map
var map = L.map('map', { scrollWheelZoom: true, attributionControl: false });

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


// load gushim topojson 
$.ajax({
	url: (muni.file == undefined) ? 'https://api.github.com/repos/niryariv/israel_gushim/contents/' + muni_name + '.topojson' : muni.file,
    headers: { Accept: 'application/vnd.github.raw' },
	dataType: 'json'
}).done(function(res) {
	gushim = topojson.feature(res, res.objects[muni_name]).features;
	
	gushimLayer = L.geoJson(gushim,
		{
			onEachFeature: onEachFeature,
			style : {
				"color" : "#888",
				"weight": 1,
				"opacity": 0.7
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

 	
    // mark other supported municipalities on the map
	mark_munis();
	

	// if the direct gush address mapping was used go ahead and jump to the wanted gush
	if (got_gushim_delegate) {
		got_gushim_delegate(got_gushim_delegate_param);
		map._onResize();
	}
});
