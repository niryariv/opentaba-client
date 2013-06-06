 // deprecating, replacing with serverless mode
var RUNNING_LOCAL = (document.location.host == 'localhost' || document.location.host == '127.0.0.1' || document.location.protocol == 'file:');
var API_URL = RUNNING_LOCAL ? 'http://0.0.0.0:5000/' : 'http://opentaba-server.herokuapp.com/';


// var API_URL = '/'; // serverless, bitches! just store the JSON in the directory and grab it from there.

var highlit = [];

function show_data(url){
	if (url.indexOf('.pdf', url.length - 4) !== -1) { // endsWith('.pdf')?
		new PDFObject({ url: url }).embed("modal-doc");
	} else {
		$("#modal-doc").html('<iframe src="' + url + '"></iframe>');
	}

	$("#doc_new_window").attr("href", url);
	$("#docModal").modal().css({ width: '90%', height: '80%', 'margin-left': function () { return -($(this).width() / 2); } });
}

function render_plans(plans) {
	var out = '<h3 style="color: grey;">גוש ' + plans[0].gush_id + '</h3>';

	// html brought to you courtsey of 1998
	out += "<table>";
	for (var i = 0 ; i<plans.length ; i++) {
		p = plans[i];

		//plan_link = 'http://www.mmi.gov.il/IturTabot/taba2.asp?Gush=' + p.gush_id + '&MisTochnit=' + escape(p.number)
		plan_link = 'http://mmi.gov.il/IturTabot/taba4.asp?kod=3000&MsTochnit=' + escape(p.number)
		
		out+='<tr style="vertical-align:top" class="item">' +
			 '	<td><b>' + [p.day, p.month, p.year].join('/') + '</b></td>' +
			 '	<td>' + p.status  + '</td>'+
			 '	<td><b>' + p.essence + '</b></td>'+
			 '</tr>' +
			 '<tr class="details">' +
			 '	<td colspan="2">' +
			 '		<a href="' + plan_link + '" target="_blank" rel="tooltip" title="פתח באתר ממי"><!-- i class="icon-share"></i -->'+
			 '		תוכנית ' + p.number + '</a>' +
			 '	</td>' +
			 '	<td>';

		for (var j=0 ; j<p.tasrit_link.length ; j++)
			out += '<a onclick="show_data('+ "'" + p.tasrit_link[j] + "')" + 
					'" rel="tooltip" title="תשריט"><i class="icon-globe"></i></a>'

		for (var j=0 ; j<p.takanon_link.length ; j++)
			out += '<a onclick="show_data('+ "'" + p.takanon_link[j] + "')" + 
					'" rel="tooltip" title="תקנון"><i class="icon-file"></i></a>'

		for (var j=0 ; j<p.nispahim_link.length ; j++)
			out += '<a onclick="show_data('+ "'" + p.nispahim_link[j] + "')" + 
					'" rel="tooltip" title="נספחים"><i class="icon-folder-open"></i></a>'

		for (var j=0 ; j<p.files_link.length ; j++)
			out += '<a href="http://mmi.gov.il' + p.files_link[j] + 
					'" rel="tooltip" title="קבצי ממג"><i class="icon-download-alt"></i></a>'
			
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
	
	$.getJSON(
		API_URL + 'gush/' + gush_id + '/plans',
		function(d) { render_plans(d); }
	)
}

// find a rendered gush based on ID
function find_gush(gush_id){
	g = gushim.features.filter(
		function(f){ return (f.properties.Name == gush_id); }
	)
	return g[0];
}

function highlight_gush(id) {
	gush = 'gush_' + id;
	map._layers[gush].setStyle({opacity: 0 	, color: "red"});
	highlit.push(id);
}

function clear_highlight(id) {
	gush = 'gush_' + id;
	map._layers[gush].setStyle({opacity: 0.05 , color: "#777"});
	highlit.splice(highlit.indexOf(id), 1);
}

function clear_all_highlit() {
	while (highlit.length > 0) {
		clear_highlight(highlit[0]);
	}
}

function onEachFeature(feature, layer) {
	layer.bindPopup(feature.properties.Name + " גוש ");
	layer.on({
				'mouseover'	: function() { this.setStyle({ opacity: 0 	, color: "red" 	}) },
				'mouseout'	: function() { this.setStyle({ opacity: 0.95, color: "#777" }) },
				'click'		: function() { 
					$("#info").html("עוד מעט..."); 
					location.hash = "#/gush/" + feature.properties.Name;
					// get_gush(feature.properties.Name);
				}
			});
	layer._leaflet_id = 'gush_' + feature.properties.Name;
}

// jQuery startup funcs
$(document).ready(function(){

	// comment out for serverless
	// wake up possibly-idling heroku dyno to make sure later requests aren't too slow
	$.getJSON( API_URL + "wakeup" , function(){
		// do nothing 
	});

	// setup a path.js router to allow distinct URLs for each block
	Path.map("#/gush/:gush_id").to(
		function(){ 
			$("#docModal").modal('hide');
			get_gush(this.params['gush_id'].split('?')[0]);  // remove '?params' if exists
		}
	);
	Path.listen();
});

var map = L.map('map', { scrollWheelZoom: false }).setView([31.765, 35.17], 13);

tile_url = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png';
L.tileLayer(tile_url, {
	maxZoom: 18,
}).addTo(map);

L.geoJson(gushim,
	{
		onEachFeature: onEachFeature,
		style : {
			"color" : "#777",
			"weight": 1,
			"opacity": 0.9
		}
	}
).addTo(map);
