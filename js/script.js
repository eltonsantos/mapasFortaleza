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
var layerStComerciais;
var layerRedesAgua;
var layerHidrantes;
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
var popupConteudoStComerciais;
var popupConteudoRedesAgua;
var popupConteudoHidrantes;
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
			style: style_stComerciais,
			onEachFeature: onEachFeature_stComerciais
		}).addTo(map);


		redesAguaOverlay = L.geoJson(rede_agua, {
			style: function (feature) {
				return feature.properties && feature.properties.style;
			},
			onEachFeature: onEachFeature_redesAgua,
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
			filter: function (feature, layerHidrantes) {
				if (feature.properties) {
					return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
				}
				return false;
			},
			onEachFeature: onEachFeature_hidrantes
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
					'<i style="background:' + getColor_stComerciais(from + 1) + '"></i> ' +
					from + (to ? '&ndash;' + to : '+'));
			}

			div.innerHTML = labels.join('<br>');
			return div;
		};

		legend.addTo(map);	

		// pega cor de acordo com a condição estabelecida
		function getColor_stComerciais(d) {
			return  d > 70 ? '#800026' :
					d > 60 ? '#BD0026' :
					d > 50 ? '#E31A1C' :
					d > 40 ? '#FC4E2A' :
					d > 30 ? '#FD8D3C' :
					d > 20 ? '#FEB24C' :
					d > 10 ? '#FED976' :
							 '#FFEDA0' ;
		}

		function style_stComerciais(feature) {
			return {
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7,
				fillColor: getColor_stComerciais(feature.properties.sco_num_sc)
			};
		}

		function highlightFeature_stComerciais(e) {
			layerStComerciais = e.target;

			layerStComerciais.setStyle({
				weight: 5,
				color: '#666',
				dashArray: '',
				fillOpacity: 0.7
			});

			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
				layerStComerciais.bringToFront();
			}

			info.update(layerStComerciais.feature.properties);
		}

		function resetHighlight_stComerciais(e) {
			setoresComerciaisOverlay.resetStyle(e.target);
			info.update();
		}

		function zoomToFeature_stComerciais(e) {
			map.fitBounds(e.target.getBounds());
		}

		function onEachFeature_stComerciais(feature, layerStComerciais) {
			popupConteudoStComerciais = "<b>Setor Comercial: " + feature.properties.sco_num_sc + "</b><br /><b>Localidade:</b> " + feature.properties.sco_dsc_loc + "<br /><b>UN:</b> " + feature.properties.sco_dsc_un + "<br /><b>Set. de Abast.:</b> " + feature.properties.sco_dsc_sa + "<br /><b>Código do Set. de Abast.:</b> " + feature.properties.sco_cod_sa;

			if (feature.properties && feature.properties.popupConteudoStComerciais) {
				popupConteudoStComerciais += feature.properties.popupConteudoStComerciais;
			}
			
			layerStComerciais.bindPopup(popupConteudoStComerciais);

			layerStComerciais.on({
				mouseover: highlightFeature_stComerciais,
				mouseout: resetHighlight_stComerciais,
				click: zoomToFeature_stComerciais
			});

		}

		// Retornar um valor composto na busca
		function SearchControlToArrayString(sc){
			return sc.sco_num_sc + " - " + sc.sco_dsc_loc + " - " + sc.sco_dsc_un;
		}

	/***************************************************************************/
		
	// ****************** FUNÇÕES REDES DE ÁGUA
		function onEachFeature_redesAgua(feature, layerRedesAgua) {
			popupConteudoRedesAgua = "<b>Tipo de Rede: " + feature.properties.tra_tipo_rede + "</b><br /><b>Data de Cadastro:</b> " + feature.properties.data_cadastro + "<br /><b>Data de Atualização:</b> " + feature.properties.data_atualizacao + "<br /><b>Extensão Calculada:</b> " + feature.properties.extensao_calculada;

			if (feature.properties && feature.properties.popupConteudoRedesAgua) {
				popupConteudoRedesAgua += feature.properties.popupConteudoRedesAgua;
			}
			
			layerRedesAgua.bindPopup(popupConteudoRedesAgua);

			/*layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: zoomToFeature
			});*/

		}
	/***************************************************************************/

	// ****************** FUNÇÕES HIDRANTES
		function onEachFeature_hidrantes(feature, layerHidrantes) {
			popupConteudoHidrantes = "<b>Setor de Abastecimento: " + feature.properties.setor_abastecimento + "</b><br /><b>Endereço:</b> " + feature.properties.endereco + "<br /><b>UN:</b> " + feature.properties.unidade_negocio + "<br /><b>Entre Ruas:</b> " + feature.properties.entre_ruas + "<br /><b>Quadrícula:</b> " + feature.properties.quadricula + "<br /><b>Bairro:</b> " + feature.properties.bairro + "<br /><b>Observações:</b> " + feature.properties.observacoes;

			if (feature.properties && feature.properties.popupConteudoHidrantes) {
				popupConteudoHidrantes += feature.properties.popupConteudoHidrantes;
			}
			
			layerHidrantes.bindPopup(popupConteudoHidrantes);

		}
	/***************************************************************************/

	// ****************** OUTRAS FUNÇÕES
		function LatLngToArrayString(ll) {
			return "<b>X:</b> "+ ll.lat.toFixed(5)+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Y:</b> "+ll.lng.toFixed(5);
		}
	/***************************************************************************/

});