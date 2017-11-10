// Variáveis
var map;
var camadaMapa;
var info;
var geojson;
var legend;
var layer;
var div;
var grade;
var labels;
var from;
var to;
var searchControl;
var zoomSearch;
var altaOpacidade;
var baixaOpacidade;
var opacidade;
var buttonHome;
var escala;
var pan;
var medida;
var popupConteudo;
var zoomBar;

$(function(){

	map = L.map('map', function(){
		zoomControl: false
	}).setView([ -3.794,  -38.545], 12);
	//map = L.map('map', {center: [-3.794, -38.545], zoom: 12, zoomControl: false, attributionControl:false});

	$('#btnLocate').click(function(){
		map.setView([ -3.794,  -38.545], 12);
	});

	map.on('zoomend', function(){
		$('#zoom-level').html(map.getZoom());
	});
	/*
	map.on('moveend', function(){
		$('#map-center').html(LatLngToArrayString(map.getCenter()));
	});*/

	map.on('mousemove', function(e){
		$('#mouse-location').html(LatLngToArrayString(e.latlng));
	});

	camadaMapa = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		minZoom: 7,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.light'
	}).addTo(map);

	// Mostra os controles	
	pan = L.control.pan({
		position: 'topleft'
	}).addTo(map);

	// Mostrar escala
	escala = L.control.scale({
		position: 'bottomleft',
		imperial: false,
		maxWidth: 200
	}).addTo(map);

	// Mostrar medidas
	medida = L.control.polylineMeasure({
		clearMeasurementsOnStop: false,
		showMeasurementsClearControl: true
	}).addTo(map);
/*
	$("#polyline-measure-control").click(function(){
		map.removeControl(map.zoomControl);
	});
*/
	// Mostrar zoom
	zoomBar = new L.Control.ZoomBar().addTo(map);
	
	// Mostrar sua localização
/*
	buttonHome = L.easyButton('glyphicon-home', function(){
		map.setView([ -3.794,  -38.545], 12);
	}).addTo(map);
*/

	// Mostra as informações no mouse hover
	info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		this._div.innerHTML = '<h4>Setores Comerciais</h4><br />' +  (props ?
			'<b>Setor Comercial: ' + props.sco_num_sc + '</b><br /><b>Localidade:</b> ' + props.sco_dsc_loc + '<br /><b>UN:</b> ' + props.sco_dsc_un + '<br /><b>Set. de Abast.:</b> ' + props.sco_dsc_sa + '<br /><b>Código do Set. de Abast.:</b> ' + props.sco_cod_sa
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
/*
	map.on('mousemove', function(e){
		$('#mouse-location').html(LatLngToArrayString(e.latlng));
	});
*/

	searchControl = new L.Control.Search({
		container: 'buscar',
		layer: geojson,
		propertyName: 'sco_dsc_sa',
		marker: false,
		moveToLocation: function(latlng, title, map){
			zoomSearch = map.getBoundsZoom(latlng.layer.getBounds());
			map.setView(latlng, zoomSearch);
		}
	});

	searchControl.on('search:locationfound', function(e){
		e.layer.setStyle({
			weight: 7,
			color:'#f90'
		});
		if (e.layer._popup){
			e.layer.openPopup();
		}
	}).on('search:collapsed', function(e){
		geojson.eachLayer(function(layer){
			geojson.resetStyle(layer);
		});
	});

	map.addControl(searchControl);

	// 	OPACIDADE
    opacidade = new L.Control.opacitySlider({
    	position: 'topleft'
    });
    map.addControl(opacidade);

    opacidade.setOpacityLayer(camadaMapa);
    camadaMapa.setOpacity(0.5);
	
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
		popupConteudo = "<b>Setor Comercial: " + feature.properties.sco_num_sc + "</b><br /><b>Localidade:</b> " + feature.properties.sco_dsc_loc + "<br /><b>UN:</b> " + feature.properties.sco_dsc_un + "<br /><b>Set. de Abast.:</b> " + feature.properties.sco_dsc_sa + "<br /><b>Código do Set. de Abast.:</b> " + feature.properties.sco_cod_sa;

		if (feature.properties && feature.properties.popupConteudo) {
			popupConteudo += feature.properties.popupConteudo;
		}
		
		layer.bindPopup(popupConteudo);

		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});

	}

	function LatLngToArrayString(ll) {
		return "<b>X:</b> "+ ll.lat.toFixed(5)+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Y:</b> "+ll.lng.toFixed(5);
	}

	// Retornar um valor composto na busca
	function SearchControlToArrayString(sc){
		return sc.sco_num_sc + " - " + sc.sco_dsc_loc + " - " + sc.sco_dsc_un;
	}

});