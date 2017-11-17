// Variáveis
var map;
var camadaMapa;
var camadaTopo;
var camadaImagery;
var controleCamadas;
var objBasemaps;
var objSobrecamadas;
var info;
var setoresComerciaisOverlay;
var hidrantesOverlay;
var redesAguaOverlay;
var legend;
var layer;
var div;
var grade;
var labels;
var from;
var to;
var searchControl;
var zoomSearch;
var opacidade;
var buttonHome;
var escala;
var pan;
var medida;
var popupConteudo;
var zoomBar;
var posicaoMouse;

$(function(){
	
	// ****************** FUNÇÕES GERAIS
		map = L.map('map', {
			center: [-3.794, -38.545],
			zoom: 12,
			maxZoom: 18,
			minZoom: 7,
			zoomControl: false
		});

		$('#btnLocate').click(function(){
			map.setView([ -3.794,  -38.545], 12);
		});

		map.on('zoomend', function(){
			$('#zoom-level').html(map.getZoom());
		});

		camadaMapa = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			id: 'mapbox.light',
			attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
		});

		camadaTopo = L.tileLayer.provider('OpenTopoMap', {
			attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
		});

		camadaImagery = L.tileLayer.provider('Esri.WorldImagery');

		map.addLayer(camadaMapa);

		// Overlayer
		setoresComerciaisOverlay = L.geoJson(setoresComerciais, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);


		redesAguaOverlay = L.geoJson(rede_agua, {
			style: function (feature) {
				return feature.properties && feature.properties.style;
			},
			onEachFeature: onEachFeature,
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, {
					radius: 8,
					fillColor: "#ff7800",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});
			}
		}).addTo(map);


		hidrantesOverlay = L.geoJSON(hidrantes, {
			filter: function (feature, layer) {
				if (feature.properties) {
					// If the property "underConstruction" exists and is true, return false (don't render features under construction)
					return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
				}
				return false;
			},
			onEachFeature: onEachFeature
		}).addTo(map);


		objBasemaps = {
			"Mapa tradicional": camadaMapa,
			"OpenTopoMap": camadaTopo,
			"Satélite": camadaImagery
		};

		objSobrecamadas = {
			'Setores Comerciais': setoresComerciaisOverlay,
			'Redes de Água': redesAguaOverlay,
			'Hidrantes': hidrantesOverlay
		};

		controleCamadas = L.control.layers(objBasemaps, objSobrecamadas).addTo(map);

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

		// Posição do mouse
		posicaoMouse = L.control.mousePosition().addTo(map);

		// Mostrar medidas
		medida = L.control.polylineMeasure({
			clearMeasurementsOnStop: false,
			showMeasurementsClearControl: true
		}).addTo(map);

		// Mostrar zoom
		zoomBar = new L.Control.ZoomBar().addTo(map);

		// 	OPACIDADE
		$('#sldOpacity').on('change', function(){
			$('#image-opacity').html(this.value);
			console.log(typeof(setoresComerciaisOverlay));
			setoresComerciaisOverlay.setStyle({ opacity: this.value, fillOpacity: this.value})	
		});

		// BUSCA
		searchControl = new L.Control.Search({
			container: 'buscar',
			layer: setoresComerciaisOverlay,
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
			setoresComerciaisOverlay.eachLayer(function(layer){
				setoresComerciaisOverlay.resetStyle(layer);
			});
		});

		map.addControl(searchControl);

	/***************************************************************************/

	// ****************** FUNÇÕES SETORES COMERCIAIS

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
			setoresComerciaisOverlay.resetStyle(e.target);
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

		// Retornar um valor composto na busca
		function SearchControlToArrayString(sc){
			return sc.sco_num_sc + " - " + sc.sco_dsc_loc + " - " + sc.sco_dsc_un;
		}

	/***************************************************************************/
		
	// ****************** FUNÇÕES COLETORES
	/***************************************************************************/

	// ****************** FUNÇÕES HIDRANTES
	/***************************************************************************/

	// ****************** OUTRAS FUNÇÕES
		function LatLngToArrayString(ll) {
			return "<b>X:</b> "+ ll.lat.toFixed(5)+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Y:</b> "+ll.lng.toFixed(5);
		}
	/***************************************************************************/

});