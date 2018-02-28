// Variáveis
var map;
var camadaMapa;
var camadaMapa2;
var camadaTopo;
var camadaImagery;
var googleTerrain;
var googleStreet;
var googleHybrid;
var googleSatellite;
var controleCamadas;
var objBasemaps;
var objSobrecamadas;

var setoresComerciaisOverlay;
var vazamentosOverlay;
var hidrantesOverlay;
var redesAguaOverlay;
var bairrosOverlayer;
var municipiosOverlayer;
var unidadesOverlayer;
var quadrasOverlay;

var layerStComerciais;
var layerRedesAgua;
var layerHidrantes;
var layerVazamentos;
var layerBairros;
var layerMunicipios;
var layerUnidades;
var layerQuadras;

var popupConteudoStComerciais;
var popupConteudoRedesAgua;
var popupConteudoHidrantes;
var popupConteudoVazamentos;
var popupConteudoBairros;
var popupConteudoMunicipios;
var popupConteudoUnidades;
var popupQuadras;

var info;
var legend;
var div;
var grades;
var labels;
var from;
var to;
var ctlZoomslider;
var opacidade;
var escala;
var ctlPan;
var medida;

var zoomBar;
var posicaoMouse;
var ctlMinimap;
var ctlSearch;
var ctlPrint;
var ctlHidrantes;
var ctlVazamentos;
var ctlMeasure;

var hidranteIcon;
var vazamentoIcon;

$(function(){
	
	// ****************** FUNÇÕES GERAIS
		map = L.map('map', {
			center: [-5.321, -39.367],
			zoom: 8,
			maxZoom: 20,
			minZoom: 7,
			zoomControl: false
		});

		$('#btnLocate').click(function(){
			map.setView([ -5.321, -39.367], 8);
		});

		map.on('zoomend', function(){
			$('#zoom-level').html(map.getZoom());
		});
		// id : 'mapbox.light' -- PARA MAPA PRETO E BRANCO
		camadaMapa = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			id: 'mapbox.streets',
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>'
		});

		camadaTopo = L.tileLayer.provider('OpenTopoMap', {
			attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
		});

		camadaImagery = L.tileLayer.provider('Esri.WorldImagery');

		googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
		    maxZoom: 20,
		    subdomains:['mt0','mt1','mt2','mt3']
		});
		
		googleStreet = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
		    maxZoom: 20,
		    subdomains:['mt0','mt1','mt2','mt3']
		});

		googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
		    maxZoom: 20,
		    subdomains:['mt0','mt1','mt2','mt3']
		});

		googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
		    maxZoom: 20,
		    subdomains:['mt0','mt1','mt2','mt3']
		});

		map.addLayer(camadaMapa);


		// Overlayer

			/** REDE DE ÁGUA */
			redesAguaOverlay = L.geoJson(rede_agua, {
				style: function (feature) {
					return feature.properties && feature.properties.style;
				},
				onEachFeature: onEachFeature_redesAgua
			});
			/*********************/


			/** QUADRAS */
			quadrasOverlay = L.tileLayer.wms("http://172.25.131.53:8080/geoserver/wms/", {
		        layers: 'IGEO:quadras_mapeadas',
		        format: 'image/png',
		        transparent: true,
		        attribution: "Algum texto de teste"
		    });
			/*quadrasOverlay = L.geoJson(quadras, {
				style: function (feature) {
					return feature.properties && feature.properties.style;
				},
				onEachFeature: onEachFeature_quadras
			});*/
			/*********************/


			/** HIDRANTES */
			hidranteIcon = new L.Icon({
		        iconUrl: 'images/hidrante.png',
		        iconSize: [24, 36]
		    });

			ctlHidrantes = L.markerClusterGroup();

			hidrantesOverlay = L.geoJSON(hidrantes, {
				filter: function (feature, layerHidrantes) {
					if (feature.properties) {
						return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
					}
					return false;
				},
				onEachFeature: onEachFeature_hidrantes,

				pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {
						icon: hidranteIcon
						/*icon: L.AwesomeMarkers.icon({
						    icon: 'fire',
						    prefix: 'fa',
						    markerColor: 'blue'
						})*/
					});
				}
			});
			/*********************/


			/** BAIRROS */
			bairrosOverlayer = L.geoJSON(bairros, {
				style: function(feature){
					return {
						color: "#999",
						fillColor: "#f90"
					};
				},
				onEachFeature: onEachFeature_bai
			});
			/*********************/


			/** UNIDADES */
			unidadesOverlayer = L.geoJSON(unidades, {
				style: function(feature){
					return {
						color: "#00CED1"
					};
				},
				onEachFeature: onEachFeature_un
			});
			/*********************/


			/** MUNICIPIOS */
			municipiosOverlayer = L.geoJSON(municipios, {
				style: function(feature){
					return {
						color: "#091",
						fillColor: "#aa9"
					};
				},
				onEachFeature: onEachFeature_mun
			});
			/*********************/
			

			/** ST COMERCIAIS */
			setoresComerciaisOverlay = L.geoJson(setoresComerciais, {
				style: function(feature){
					return {
						color: "#1B6D9F",
						fillColor: "#5fb5e6"
					};
				},
				onEachFeature: onEachFeature_stComerciais
			});


			/** VAZAMENTOS */
			vazamentoIcon = new L.Icon({
		        iconUrl: 'images/vazamento4.png',
		        iconSize: [38, 36]
		    });

			ctlVazamentos = L.markerClusterGroup();

			vazamentosOverlay = L.geoJSON(vazamentos, {
				filter: function (feature, layerVazamentos) {
					if (feature.properties) {
						return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
					}
					return false;
				},
				onEachFeature: onEachFeature_vazamentos,

				pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {
						icon: vazamentoIcon
						/*icon: L.AwesomeMarkers.icon({
						    icon: 'tint',
						    markerColor: 'red',
						    prefix: 'fa',
						    extraClasses: 'someClass'
						})*/
					});
				}
			});
			/*********************/


			/** CLUSTER HIDRANTES */
			ctlHidrantes.addLayer(hidrantesOverlay);
			//map.addLayer(ctlHidrantes);
			map.fitBounds(ctlHidrantes.getBounds());


			/** CLUSTER VAZAMENTOS */
			ctlVazamentos.addLayer(vazamentosOverlay);
			//map.addLayer(ctlVazamentos);
			map.fitBounds(ctlVazamentos.getBounds());


			/** OVERLAYERS */
			objBasemaps = {
				"Mapa tradicional": camadaMapa,
				"OpenTopoMap": camadaTopo,
				"Satélite": camadaImagery,
				"Google (Terreno)": googleTerrain, 
				"Google (Ruas)": googleStreet,
				"Google (Híbrido)": googleHybrid,
				"Google (Satélite)": googleSatellite
			};

			objSobrecamadas = {
				'Setores Comerciais': setoresComerciaisOverlay,
				'Redes de Água': redesAguaOverlay,
				'Municípios': municipiosOverlayer,
				'Unidades': unidadesOverlayer,
				'Bairros': bairrosOverlayer,
				'Hidrantes': ctlHidrantes,
				'Vazamentos': ctlVazamentos,
				'Quadras': quadrasOverlay 
			};

			controleCamadas = L.control.layers(objBasemaps, objSobrecamadas).addTo(map);

		// Mostra o slide do zoom
		//ctlZoomslider = L.control.zoomslider().addTo(map);

		// Mostra os controles
		ctlPan = L.control.pan({
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

		// Mostrar o botão do zoom
		zoomBar = new L.Control.ZoomBar().addTo(map);

		// 	OPACIDADE
		$('#sldOpacity').on('change', function(){
			$('#image-opacity').html(this.value);
			//console.log(typeof(setoresComerciaisOverlay));
			setoresComerciaisOverlay.setStyle({ fillOpacity: this.value })	
		});

		// MiniMap
		camadaMapa2 = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			zoomControl: false
		});

		ctlMinimap = new L.Control.MiniMap(camadaMapa2, {
			toggleDisplay: true
		}).addTo(map);

		// Mostrar norte
		var setaNorte = L.control({
			position: "topright"
		});
		setaNorte.onAdd = function(map) {
		    var divi = L.DomUtil.create("div", "info legend");
		    divi.innerHTML = '<img src="images/seta-norte.svg" width="48" height="48" />';
		    return divi;
		}
		setaNorte.addTo(map);

		// BUSCAR POR RUAS
		ctlSearch = L.Control.openCageSearch({
			position: 'topleft',
			placeholder: 'Buscar por ruas...',
			errorMessage: 'Nenhuma localidade encontrada',
			showResultIcons: false,
			key: '3c38d15e76c02545181b07d3f8cfccf0',
			limit: 5
		}).addTo(map);

		// PRINT
		ctlPrint = L.browserPrint({
			closePopupsOnPrint: false,      
			printModesNames: {Portrait:"Retrato", Landscape:"Paisagem", Auto:"Auto", Custom:"Selecione a área"}
		}).addTo(map);

		map.on("browser-print-start", function(e){
			L.control.scale({
				position: 'topleft',
				imperial: false,
				maxWidth: 200
			}).addTo(e.printMap);
		});

	/***************************************************************************/


	// ****************** BUSCA ANINHADAS

	//Agrupa Unidades
	//console.log(setoresComerciais.features[0].properties)
	var groupsUnidade = [];
	var uniqueUnidade = [];

	//$('#unSearch').append('<option value="">Selecione</option>');
	console.log(groupsUnidade)
	setoresComerciais.features.map(function(prop) {
		groupsUnidade.push(prop.properties.sco_dsc_un);
	});

	uniqueUnidade = Array.from(new Set(groupsUnidade)); // [1,2,3,4,5]

	uniqueUnidade.map(function(value) {
	  $('#unSearch').append($('<option/>', {
	      value: value,
	      text: value
	  }));
	});

	//Get Localidades ao alterar UNIDADE
	$('#unSearch').on('change', function() {
		var value = $(this).find(':selected').val();
		var groupsLocalidade = [];
		var uniqueLocalidade = [];

		setoresComerciais.features.filter(function(prop) {
		    if (prop.properties.sco_dsc_un.toLowerCase().trim() === value.toLowerCase().trim()) {
		    	groupsLocalidade.push(prop.properties.sco_dsc_loc);
		    }
		});

		console.log(groupsLocalidade)
		groupsLocalidade = Array.from(new Set(groupsLocalidade)); // [1,2,3,4,5]
		console.log('Unique: ' + groupsLocalidade)

		groupsLocalidade.sort(function(a, b){
			return a-b;
		});

		$('#locSearch').empty();
		$('#numSearch').empty();
		$('#locSearch').append('<option value="">Buscar por Localidade</option>');
		$('#numSearch').append('<option value="">Buscar por Nº do Setor Comercial</option>');
		
		groupsLocalidade.map(function(prop) {
			$('#locSearch').append($('<option />', {
				value: prop,
				text: prop
			}));
		});

	});

	//Get SetorComercial ao alterar LOCALIDADE
	$('#locSearch').on('change', function() {
	  var value = $(this).find(':selected').val();
	  var groupsSetorComercial = [];
	  var uniqueLocalidade = [];

	  setoresComerciais.features.filter(function(prop) {
	      if (prop.properties.sco_dsc_loc.toLowerCase().trim() === value.toLowerCase().trim()) {
	      	groupsSetorComercial.push(prop.properties.sco_num_sc);
	      }
	  });

	  console.log(groupsSetorComercial)
	  groupsSetorComercial = Array.from(new Set(groupsSetorComercial)); // [1,2,3,4,5]
	  console.log('Unique SC: ' + groupsSetorComercial)

			groupsSetorComercial.sort(function(a, b){
				return a-b;
			});

	  $('#numSearch').sort().empty();
			$('#numSearch').append('<option value="">Buscar por Nº do Setor Comercial</option>');
	  groupsSetorComercial.map(function(prop) {
	      $('#numSearch').append($('<option />', {
		      value: prop,
		      text: prop
	      }));

	  });

	});

	var leafletIdJsonProperty = {}

	$("#numSearch").on('change', function(e) {
		var value = $(this).find(':selected').val();
		var boundArea = parseInt(value);
		map.fitBounds(setoresComerciaisOverlay._layers[leafletIdJsonProperty[boundArea]]._bounds);
	});

	function MatchJSONProperty(jsonData, leafletLayer) {
	    for (feature in leafletLayer._layers) {
	        //A JS Object consisting of GeoJSON ID, Leaflet Layer ID
	        leafletIdJsonProperty[leafletLayer._layers[feature].feature.properties.sco_num_sc] = parseInt(feature)
	    }
	}

	MatchJSONProperty(setoresComerciais, setoresComerciaisOverlay)
	/***************************************************************************/


	// ****************** FUNÇÕES SETORES COMERCIAIS

		// Mostra as informações no mouse hover
		/*
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
		*/
		//info.addTo(map);

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

		//legend.addTo(map);

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
				fillColor: getColor_stComerciais(feature.properties.sco_num_sc)
			};
		}

		function highlightFeature_stComerciais(e) {
			layerStComerciais = e.target;
			
			layerStComerciais.setStyle({
				weight: 5,
				color: '#666',
				dashArray: ''
			});
			
			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
				layerStComerciais.bringToFront();
			}

			//info.update(layerStComerciais.feature.properties);
		}

		function resetHighlight_stComerciais(e) {
			setoresComerciaisOverlay.resetStyle(e.target);
			//info.update();
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

		$("#scBusca").autocomplete({
			source: setoresComerciais.features.map(function(d, i){
				return { 
					label: d.properties.sco_num_sc + " - " + d.properties.sco_dsc_loc,
					id: i
				}
			}),
			select: function(event, ui){
				var featureLayer = L.geoJSON(setoresComerciais.features[ui.item.id]);
				map.fitBounds(featureLayer.getBounds());				
			} 
		});
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

		$("#raBusca").autocomplete({
			source: rede_agua.features.map(function(d, i){
				return { 
					label: d.properties.data_cadastro + " - " + d.properties.tra_tipo_rede,
					id: i
				}
			}),
			select: function(event, ui){
				var featureLayer = L.geoJSON(rede_agua.features[ui.item.id]);
				map.fitBounds(featureLayer.getBounds());				
			} 
		});
	/***************************************************************************/


	// ****************** FUNÇÕES HIDRANTES
		function zoomToFeature_hidrantes(e) {
			map.setView(e.latlng, 13);
		}

		function onEachFeature_hidrantes(feature, layerHidrantes) {
			popupConteudoHidrantes = "<b>Setor de Abastecimento: " + feature.properties.setor_abastecimento + "</b><br /><b>Endereço:</b> " + feature.properties.endereco + "<br /><b>UN:</b> " + feature.properties.unidade_negocio + "<br /><b>Entre Ruas:</b> " + feature.properties.entre_ruas + "<br /><b>Quadrícula:</b> " + feature.properties.quadricula + "<br /><b>Bairro:</b> " + feature.properties.bairro + "<br /><b>Observações:</b> " + feature.properties.observacoes;

			if (feature.properties && feature.properties.popupConteudoHidrantes) {
				popupConteudoHidrantes += feature.properties.popupConteudoHidrantes;
			}
			
			/*layerHidrantes.bindPopup(popupConteudoHidrantes).on('click', function(e){
				 map.setView(e.latlng, 13);
			});*/
			layerHidrantes.bindPopup(popupConteudoHidrantes);

			layerHidrantes.on({
				//click: zoomToFeature_hidrantes
			});

		}

		$("#hiBusca").autocomplete({
			source: hidrantes.features.map(function(d, i){
				return { 
					label: d.properties.unidade_negocio + " - " + d.properties.setor_abastecimento + " - " + d.properties.quadricula + " - " + d.properties.bairro,
					id: i
				}
			}),
			select: function(event, ui){
				var featureLayer = L.geoJSON(hidrantes.features[ui.item.id]);
				map.fitBounds(featureLayer.getBounds());				
			} 
		});


	/***************************************************************************/


	// ****************** FUNÇÕES VAZAMENTOS
		function onEachFeature_vazamentos(feature, layerVazamentos) {
			popupConteudoVazamentos = "<b>STATUS: " + feature.properties.sta_nom_status_atendimento + "<br /><b>UN:</b> " + feature.properties.uad_sgl_unidade_administrativa + "<br /><b>Serviço:</b> " + feature.properties.ser_nom_servico + "<br /><b>Bairro:</b> " + feature.properties.bai_dsc_bairro + "<br /><b>Data da solicitação:</b> " + feature.properties.iss_dat_solicitacao_servico;

			if (feature.properties && feature.properties.popupConteudoVazamentos) {
				popupConteudoVazamentos += feature.properties.popupConteudoVazamentos;
			}
			
			/*layerVazamentos.bindPopup(popupConteudoVazamentos).on('click', function(e){
				 map.setView(e.latlng, 13);
			});*/
			layerVazamentos.bindPopup(popupConteudoVazamentos);

			layerVazamentos.on({
				//click: zoomToFeature_vazamentos
			});

		}
	/***************************************************************************/


	// ****************** FUNÇÕES BAIRROS
		function onEachFeature_bai(feature, layerBairros){
			popupBairros = "<b>Nome do bairro: </b>" +feature.properties.bai_nome;
			layerBairros.bindPopup(popupBairros);
			layerBairros.on({
				click: zoomBairro
			});
		}

		function zoomBairro(e){
			map.fitBounds(e.target.getBounds());
		}			
	/***************************************************************************/


	// ****************** FUNÇÕES MUNICÍPIOS
		function onEachFeature_mun(feature, layerMunicipios){
			popupMunicipios = "<b>Nome do Municípios: </b>" +feature.properties.mun_toponimia;
			layerMunicipios.bindPopup(popupMunicipios);
			layerMunicipios.on({
				click: zoomMunicipio
			});
		}

		function zoomMunicipio(e){
			map.fitBounds(e.target.getBounds());
		}
	/***************************************************************************/


	// ****************** FUNÇÕES QUADRAS
		function onEachFeature_quadras(feature, layerQuadras){
			popupQuadras = "<b>Número da Quadra: </b>" +feature.properties.num_quadra;
			layerQuadras.bindPopup(popupQuadras);
			layerQuadras.on({
				click: zoomQuadra
			});
		}

		function zoomQuadra(e){
			map.fitBounds(e.target.getBounds());
		}
	/***************************************************************************/


	// ****************** FUNÇÕES UNIDADES
		function onEachFeature_un(feature, layerUnidades){
			popupUnidades = "<b>Nome da Unidade: </b>" +feature.properties.uni_sgl_unidade_negocio;
			layerUnidades.bindPopup(popupUnidades);
			layerUnidades.on({
				click: zoomUnidade
			});
		}

		function zoomUnidade(e){
			map.fitBounds(e.target.getBounds());
		}
	/***************************************************************************/


	// ****************** OUTRAS FUNÇÕES
		function LatLngToArrayString(ll) {
			return "<b>X:</b> "+ ll.lat.toFixed(5)+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Y:</b> "+ll.lng.toFixed(5);
		}

		map.on('zoomend', function() {
			if (map.getZoom() < 12) {
				if (map.hasLayer(setoresComerciaisOverlay)) {
					map.removeLayer(setoresComerciaisOverlay);
				}
			}
			if (map.getZoom() >= 12) {
				if (map.hasLayer(setoresComerciaisOverlay)) {

				}
				else {
					map.addLayer(setoresComerciaisOverlay);
				}
			}

			if (map.getZoom() < 15) {
				if (map.hasLayer(quadrasOverlay)) {
					map.removeLayer(quadrasOverlay);
				}
			}
			if (map.getZoom() >= 15) {
				if (map.hasLayer(quadrasOverlay)) {

				}
				else {
					map.addLayer(quadrasOverlay);
				}
			}

		});

		ctlMeasure = L.control.measure({
			position: 'topleft',
			primaryLengthUnit: 'meters',
			secondaryLengthUnit: 'kilometers',
			meters: {
				display: "metros"
			},
			kilometers: {
				display: "quilômetros"
			}
		});
		ctlMeasure.addTo(map);
	/***************************************************************************/

});

function imprimirMapa() {
	window.print();
}