// Variáveis
var map;
var info;
var geojson;
var legend;
var layer;
var div;
var grade;
var labels;
var from;
var to;
var search;

$(function(){

	map = L.map('map').setView([ -3.794,  -38.545], 12);

	map.on('zoomend', function(){
		$('#zoom-level').html(map.getZoom());
	});

	map.on('moveend', function(){
		$('#map-center').html(LatLngToArrayString(map.getCenter()));
	});

	map.on('mousemove', function(e){
		$('#mouse-location').html(LatLngToArrayString(e.latlng));
	});


	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 50,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.light'
	}).addTo(map);

	// Mostra as informações no mouse hover
	info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		this._div.innerHTML = '<h4>Setores Comerciais</h4><br />' +  (props ?
			'<b>Setor Comercial: ' + props.sco_num_sc + '</b><br /><b>Localidade:</b> ' + props.sco_dsc_loc + '<br /><b>UN:</b> ' + props.sco_dsc_un + '<br /><b>Set. de Abast.:</b> ' + props.sco_dsc_sa
			: 'Passe o mouse');
	};

	info.addTo(map);

	geojson = L.geoJson(statesData, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);

	map.attributionControl.addAttribution('Setores Comerciais &copy; <a href="http://www.cagece.com.br/">CAGECE</a>');

	legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {
		div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 10, 20, 30, 40, 50, 60, 70],
			labels = ["<small>Nº Setores Comerciais</small><br />"],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(map);


	// BUSCA
	search = new L.Control.Search({
		position:'bottomleft',		
		layer: statesData,
		initial: false,
		zoom: 12,
		marker: false
	});

	map.addTo(search);

	// FUNÇÕES

	// pega cor de acordo com a condição estabelecida
	function getColor(d) {
		return  d > 70 ? '#800026' :
				d > 60 ? '#BD0026' :
				d > 50 ? '#E31A1C' :
				d > 40 ? '#FC4E2A' :
				d > 30 ? '#FD8D3C' :
				d > 20 ? '#FEB24C' :
				d > 10 ? '#FED976' :
						 '#FFEDA0' ;
	}


	function style(feature) {
		return {
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 0.7,
			fillColor: getColor(feature.properties.sco_num_sc)
		};
	}


	function highlightFeature(e) {
		layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

	function resetHighlight(e) {
		geojson.resetStyle(e.target);
		info.update();
	}

	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}

	function LatLngToArrayString(ll) {
		return "["+ ll.lat.toFixed(5)+", "+ll.lng.toFixed(5)+"]";
	}

});