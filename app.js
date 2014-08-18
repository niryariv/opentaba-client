 // deprecating, replacing with serverless mode
var RUNNING_LOCAL = (document.location.host.indexOf('localhost') > -1 || document.location.host.indexOf('127.0.0.1') > -1 || document.location.protocol == 'file:');
var API_URL = RUNNING_LOCAL ? 'http://0.0.0.0:5000/' : 'https://opentaba-server.herokuapp.com/'; 

// loaded municipality details
var muni;
var muni_name;

var gushim;
var gushimLayer;
leafletPip.bassackwards = true;

// use delegation to allow the big gushim json to be loaded asynchronously while still supporting our #/gush/:gush_id address mapping
var got_gushim_delegate;
var got_gushim_delegate_param;

var infoDiv;

var DEFAULT_ZOOM = 13;

// var API_URL = '/'; // serverless, bitches! just store the JSON in the directory and grab it from there.

var highlit = [];

// Utility endsWith function
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function show_data(url){
	if (url.indexOf('.pdf', url.length - 4) !== -1) { // endsWith('.pdf')?
		new PDFObject({ url: url }).embed("modal-doc");
	} else {
		$("#modal-doc").html('<iframe src="' + url + '"></iframe>');
	}

	$("#doc_new_window").attr("href", url);
	$("#docModal").modal().css({ width: '90%', height: '80%', 'margin-left': function () { return -($(this).width() / 2); } });
}

function render_plans(plans, gid) {
	//TODO: rewrite this DRY
	var out = '<h3 style="color: grey;">גוש ' + gid + '</h3>';

	// html brought to you courtsey of 1998
	out += "<table>";
	for (var i = 0 ; i<plans.length ; i++) {
		var p = plans[i];

		//plan_link = 'http://www.mmi.gov.il/IturTabot/taba2.asp?Gush=' + p.gush_id + '&MisTochnit=' + escape(p.number)
		//plan_link = 'http://mmi.gov.il/IturTabot/taba4.asp?kod=3000&MsTochnit=' + escape(p.number);
		plan_link = p.details_link;
		
		out+='<tr style="vertical-align:top" class="item">' +
			 '	<td><b>' + [p.day, p.month, p.year].join('/') + '</b></td>' +
			 '	<td>' + p.status  + '</td>'+
			 '	<td><b>' + p.essence + '</b></td>'+
			 '</tr>' +
			 '<tr class="details">' +
			 '	<td colspan="2">' +
			 '		<a href="' + plan_link + '" target="_blank" rel="tooltip" title="פתח באתר ממי">'+
			 '		תוכנית ' + p.number + '</a>' +
			 '	</td>' +
			 '	<td>';
		var j;
		for (j=0 ; j<p.tasrit_link.length ; j++)
			out += '<a href="'+ p.tasrit_link[j] + '" target="_blank" rel="tooltip" title="תשריט"><i class="icon-globe"></i></a>';

		for (j=0 ; j<p.takanon_link.length ; j++)
			out += '<a href="'+ p.takanon_link[j] + '" target="_blank" rel="tooltip" title="תקנון"><i class="icon-file"></i></a>';

		for (j=0 ; j<p.nispahim_link.length ; j++)
			out += '<a href="'+ p.nispahim_link[j] + '" target="_blank" rel="tooltip" title="נספחים"><i class="icon-folder-open"></i></a>';

		for (j=0 ; j<p.files_link.length ; j++)
			out += '<a href="http://mmi.gov.il' + p.files_link[j] + 
					'" rel="tooltip" title="קבצי ממג"><i class="icon-download-alt"></i></a>';
        
        // mavat link
        if (p.mavat_code != '')
            out += '<a href="' + API_URL + 'plan/' + p.plan_id + 
                '/mavat" target="_blank" rel="tooltip" title="מבא&quot;ת"><i class="icon-link"></i></a>';
        
		out+='	</td>'  +
			 '</tr>' 	+
			 '<tr style="height: 10px"><td colspan="3">&nbsp;</td></tr>';
	}
	out += '</table>';

	$("#info").html(out);

	// activate Boostrap tooltips on attachment icons
	$("[rel='tooltip']").tooltip({'placement' : 'bottom'});


	$(".item").hover(
			function () { $(this).css("background","#fff"); $(this).next(".details").css("background","#fff"); }, //#f7f7f9
			function () { $(this).css("background","")	  ; $(this).next(".details").css("background",""); }
	);

	$(".details").hover(
			function () { $(this).css("background","#fff"); $(this).prev(".item").css("background","#fff"); },
			function () { $(this).css("background","")	  ; $(this).prev(".item").css("background",""); }
	);

}

function get_gush(gush_id) {
	// console.log("get_gush: " + API_URL + 'gush/' + gush_id + '/plans')
	clear_all_highlit();
	highlight_gush(gush_id);
	//location.hash = "#/" + muni_name + "/gush/" + gush_id;
	
	$.getJSON(
		API_URL + 'gush/' + gush_id + '/plans.json',
		function(d) { 
			//console.log(d.length);
			render_plans(d, gush_id);
		}
		).fail(function() {
			$("#info").html("לא נמצאו תוכניות בגוש או שחלה שגיאה בשרת");
		});
	
	console.log('waiting for json');
	
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
	
	console.log("get_gush_by_addr: " + addr);
	
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


function highlight_gush(id) {
	gush = 'gush_' + id;
    console.log("highlight_gush ", gush);
    map.fitBounds(map._layers[gush].getBounds());
    map._layers[gush].setStyle({opacity: 0.2 , color: "#0aa"});
    highlit.push(id);
}

function clear_highlight(id) {
	gush = 'gush_' + id;
	map._layers[gush].setStyle({opacity: 0.05 , color: "#888"});
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
				'mouseover'	: function() { if (highlit.indexOf(this["gushid"]) < 0) { this.setStyle({ opacity: 0 	, color: "red" 	}) } } ,
				'mouseout'	: function() { if (highlit.indexOf(this["gushid"]) < 0) { this.setStyle({ opacity: 0.95, color: "#888" }) } },
				'click'		: function() { 
					$("#info").html("עוד מעט..."); 
					location.hash = "#/" + muni_name + "/gush/" + feature.id;
					get_gush(feature.id);
				}
			});
	layer["gushid"] = feature.id;
	layer._leaflet_id = 'gush_' + feature.id;
}

function initCity(city_name) {
    // get the wanted municipality
    muni = municipalities[city_name];
    if (muni == undefined) {
        // if not a valid municipality go to jerusalem
        location.hash = "#/jerusalem";
        return;
    }

    // append municipality's hebrew name
	$('#muni-text').text('בחרו גוש במפה כדי לצפות בתוכניות הבניה, או הקישו כתובת או מספר גוש ב' + muni.display + ':');
	$('#search-text').attr('placeholder', 'הכניסו כתובת או מספר גוש ב' + muni.display);

	$('[data-toggle=offcanvas]').click(function() {
		$('.row-offcanvas').toggleClass('active');
		$('.navbar-toggle').toggleClass('active');
	});
    
    // clear previous gushim map
    if (gushimLayer) {
        map.removeLayer(gushimLayer);
        gushimLayer.clearLayers();
    }
    
    // load the new gushim map
    $.ajax({
        url: muni.file,
        dataType: 'json'
    }).done(function(res) {
        gushim = topojson.feature(res, res.objects.gushim).features;
	
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
	
        map.setView(muni.center, DEFAULT_ZOOM);
        infoDiv = $("#info").clone(true);
        
        // if the direct gush address mapping was used go ahead and jump to the wanted gush
        if (got_gushim_delegate) {
            got_gushim_delegate(got_gushim_delegate_param);
            map._onResize();
            
            got_gushim_delegate = null;
        }
    });
}

// jQuery startup funcs
$(document).ready(function(){

	// comment out for serverless
	// wake up possibly-idling heroku dyno to make sure later requests aren't too slow
	$.getJSON( API_URL + "wakeup" , function(){
		// do nothing 
	});

	// setup a path.js router to allow distinct URLs for each block
	Path.map("#/:city_name/gush/:gush_id").to(
		function(){ 
			$("#docModal").modal('hide');
            
            if (muni_name != this.params['city_name']) {
                gushim = null;
                muni_name = this.params['city_name'];
                initCity(muni_name);
            }
			
			if (gushim) {
				get_gush(this.params['gush_id'].split('?')[0]); // remove '?params' if exists
			} else {
				// use a delegate because this script will definetly run before we finish loading the big gushim json
				got_gushim_delegate_param = this.params['gush_id'].split('?')[0];
				got_gushim_delegate = get_gush;
			}
		}
	);
    
    Path.map("#/:city_name").to(
        function(){
            $("#docModal").modal('hide');
            
            if (infoDiv) {
                // restore info div
                $('#info').replaceWith(infoDiv);
            }
            
            muni_name = this.params['city_name'];
            initCity(muni_name);
			clear_all_highlit();
        }
    );

    Path.root("#/jerusalem");

	Path.listen();

	$('#search-form').submit(
		function() {
			$('#scrobber').show();
			$('#search-error-p').html('');
			
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
});


var map = L.map('map', { scrollWheelZoom: true, attributionControl: false });

// tile_url = 'http://{s}.tile.cloudmade.com/424caca899ea4a53b055c5e3078524ca/997/256/{z}/{x}/{y}.png';
// tile_url = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
// tile_url = "http://{s}.tiles.mapbox.com/v3/niryariv.i6e92njd/{z}/{x}/{y}.png";
tile_url = "http://niryariv.github.io/israel_tiles/{z}/{x}/{y}.png";

L.tileLayer(tile_url, {
	maxZoom: 16,
	minZoom: 13
}).addTo(map);

// add 'locate me' button
L.control.locate({position: 'topleft', keepCurrentZoomLevel: true}).addTo(map);
