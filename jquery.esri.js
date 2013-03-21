(function( $, dojo  ) {
  /* http://blog.frankgarofalo.com
   Countdown for jQuery v1.3.1. and ArcGIS API for Javascript 3.1
   Written by Frank Garofalo October 2012.
   jQuery.esri Plugin by Frank Garofalo is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License. 
   Please attribute the author if you use it. */
  
	// Set pluign defaults
	var defaults = {
		arcgis_api: 			3.1,
		arcgis_url: 			'serverapi.arcgisonline.com/jsapi/arcgis/',
		arcgis_styles: 			'serverapi.arcgisonline.com/jsapi/arcgis/3.1/js/dojo/dijit/themes/claro/claro.css',
		initBasemap_url: 		'server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer',
		ssl: 					false,
		mapNav: 				false,
		webMapId: 				null,
		wrapAround180: 			true,
		overviewMap: 			null,
		basemapGallery: 		null,
		showArcGISBasemaps: 	true,
		basemaps: 				null,
		mapLegend: 				null,
		sliderStyle: 			'small',
		scalebarUnit: 			'english',
		geoService: 			null,
		bingMapsKey: 			null,
		infoTemplate: 			null,
		crossDomain_proxyURL: 	'/arcgisserver/apis/javascript/proxy/proxy.ashx',
		crossDomain_corsURL: 	'servicesbeta.esri.com'
	};
	
	var options = {};
	//var dojo = {};
	
	var variables = {
		plugin_version:			0.1,
		elem_destination: 		{},
		elem_destination_id: 	'',
		obj_esri: 				{},
		layerList: 				new Array(),
		map: 					{},
		geoLocateWatchID: 		{},
		graphic: 				{},
		geoServiceURLs: {
			GEOCODE: 			"http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
			ROUTE: 				"http://tasks.arcgisonline.com/ArcGIS/rest/services/NetworkAnalysis/ESRI_Route_NA/NAServer/Route",
			GEOMETRY: 			"http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
		}
	};
		
  	var methods = {
	  
    	init : function( arguments ) { 
			
//console.log ("TEST - init");
	
			options = $.extend(defaults, arguments); 
				
			// Get Element ID
			variables.elem_destination_id = this.attr("id"); //"mapDiv";
						
			var str_api = "";						
			// Functions
			//return this.each(function(i, e) {
				//var $e = $(e);
				var s = '';
	
				// Check for SSL protocol
				if (options.ssl) s = 's';
				
				// Add feed class to user div
				//if (!$e.hasClass('rssFeed')) $e.addClass('rssFeed');
				
				// Check for valid url
				//if(url == null) return false;
				
				// Create API address
				//str_api = "http"+ s +"://"+ options.arcgis_url +"?v="+ options.arcgis_api; //+ encodeURIComponent(url);
				//if (options.limit != null) str_api += "&num=" + options.limit;
				//if (options.key != null) str_api += "&key=" + options.key;
				//str_api += "&output=script"; //json_xml"				
				//console.log ("TEST - api: "+ str_api);
	
				var elem_documentHead = $("head");

				// ArcGIS API Stylesheet
				var stlyes_api = '<link rel="stylesheet" type="text/css" href="http'+ s +'://'+ options.arcgis_styles +'" />';
				elem_documentHead.append(stlyes_api);
				/*
					var script_djConfig = '<script type="text/javascript">var djConfig = {parseOnLoad: true};</script>';
					elem_documentHead.append(script_djConfig);
						
					var script_api = document.createElement('script');
					script_api.src = api;
					script_api.id = "arcgis_js_api";
					script_api.type = 'text/javascript';
					elem_documentHead.append(script_api);
				*/			
				
				// Initial Basemap URL
				options.initBasemap_url = 'http'+ s +'://'+ options.initBasemap_url;
			
				methods._prepareDojo( options );
			//});
			
		},
		getGeoLocate : function () {
			methods._geoLocate();
		},
		setLocate : function ( address ) {
			
			// If GeoCode/Locator, add required dijit
			if (options.geoService == null || options.geoService == false) {
				options.geoService = true;
				dojo.require("esri.tasks.locator");
			}
			
			//variables.geoServiceUrls
            //variables.geocodeService = new esri.tasks.Locator(variables.geoServiceURLs.GEOCODE); 
			
			//methods._findPlaces( address, null, null, null );
			
			var infoTemplate;
			var locator = new esri.tasks.Locator("http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/TA_Address_NA_10/GeocodeServer");
		
			if (options.infoTemplate != null && options.infoTemplate != false) {
				infoTemplate = new esri.InfoTemplate(options.infoTemplate.title, options.infoTemplate.layout);
				//var infoTemplate = new esri.InfoTemplate("Location", "Street: ${Address}<br />City: ${City}<br />State: ${State}<br />Zip: ${Zip}");
			} else {
				infoTemplate = null;
			}
			
			var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 15, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,255]), 2), new dojo.Color([0,0,255]));
	
			dojo.connect(locator, "onLocationToAddressComplete", function(candidate) {
				var obj_map = variables.map;
			  if (candidate.address) {
				//this service returns geocoding results in geographic - convert to web mercator to display on map
				var location = esri.geometry.geographicToWebMercator(candidate.location);
				var graphic = new esri.Graphic(location, symbol, candidate.address, infoTemplate);
				obj_map.graphics.add(graphic);
				
				obj_map.infoWindow.setTitle(graphic.getTitle());
				obj_map.infoWindow.setContent(graphic.getContent());
				
				//display the info window with the address information
				var screenPnt = obj_map.toScreen(location);
				obj_map.infoWindow.resize(200,100);
				obj_map.infoWindow.show(screenPnt, obj_map.getInfoWindowAnchor(screenPnt));
			  }
			});
	
			dojo.connect(variables.map, "onClick", function(evt) {
			  variables.map.graphics.clear();
			  locator.locationToAddress(esri.geometry.webMercatorToGeographic(evt.mapPoint), 100);
			});
			
		},
		setMapLayer : function ( settings ) {
//console.log ("TEST - getMapLayer ");
console.log ("TEST - getMapLayer url : "+ settings.url);
console.log ("TEST - getMapLayer type : "+ settings.type);
console.log ("TEST - getMapLayer id : "+ settings.id);

			methods._addMapLayer(settings.url, settings.type, settings.id, settings.params);
		},
		// -------------------------------------------------------------------------------------------------------
		// INTERNAL FUNCTIONS ------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------------------------
		_resizeMap : function( ) {
//console.log ("TEST - _resizeMap ");
			
			var elem_map = $("#"+ variables.elem_destination_id);
			var elem_map_parent = elem_map.parent();
			
//console.log( "TEST -  variables.elem_destination_id: "+ variables.elem_destination_id );
//console.log( "TEST -  elem_map: "+ elem_map.attr("id") );
//console.log( "TEST -  elem_map_parent: "+ elem_map_parent.attr("id") );
						
			if (variables.map != null) {
				var resizeTimer;
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function () {
					// measure the dimensions of the "parent" div that contains the "map" div
					elem_map.width( elem_map_parent.width() );
					elem_map.height( elem_map_parent.height() );
					
					//variables.map.resize();
					variables.map.reposition();
				}, 200);
			}
		},
		_addGraphic : function(pt){
			var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, 
			  new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
			  new dojo.Color([210, 105, 30, 0.5]), 8), 
			  new dojo.Color([210, 105, 30, 0.9])
			);
			variables.graphic = new esri.Graphic(pt, symbol);
			
			variables.map.graphics.add(variables.graphic);
		},
		_showLocation : function(location) {
			//zoom to the users location and add a graphic
			var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
			if (!variables.graphic) {
			  methods._addGraphic(pt);
			}
			else { //move the graphic if it already exists
			  variables.graphic.setGeometry(pt);
			}
			variables.map.centerAt(pt);
		},
		_zoomToLocation : function(location) {
			var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
			methods._addGraphic(pt);    
	
			variables.map.centerAndZoom(pt, 12);
		},
		// Geo Location Error
		_locationError : function (error) {
			//error occurred so stop watchPosition
			if(navigator.geolocation){
			  navigator.geolocation.clearWatch(variables.geoLocateWatchID);
			}
			switch (error.code) {
			case error.PERMISSION_DENIED:
			  alert("Location not provided");
			  break;
	
			case error.POSITION_UNAVAILABLE:
			  alert("Current location not available");
			  break;
	
			case error.TIMEOUT:
			  alert("Timeout");
			  break;
	
			default:
			  alert("unknown error");
			  break;
			}
		},
		_geoLocate : function () {
			if(navigator.geolocation){  
			  navigator.geolocation.getCurrentPosition(methods._zoomToLocation, methods._locationError);
			  variables.geoLocateWatchID = navigator.geolocation.watchPosition(methods._showLocation, methods._locationError);
			}
			else{
			  alert("Browser doesn't support Geolocation. Visit http://caniuse.com to discover browser support for the Geolocation API.");
			}
		},
		/*
        // Standard Geocode
		_findPlaces : function (address, optionalExtent, callbackHandler, errorHandler) {
console.log ("TEST - _findPlaces ");
console.log ("TEST - _findPlaces address: "+ address);
            var geocodeResultsFunction = function (geocodeResults) {
                var results = [];

                dojo.forEach(geocodeResults, function (candidate) {
                    results.push({
                        rawAddress: candidate,
                        address: candidate.address,
                        score: candidate.score,
                        point: candidate.location
                    });
                });
				console.log("GeoCode result count: "+ results.length);
                callbackHandler(results);
            };

            var addressPackage = { "SingleLine": address };
            var geoOptions = {
                address: addressPackage,
                outFields: ["Loc_name","Addr_Type","Type"],
                searchExtent: optionalExtent
            };

            // TODO - is this really mapping to the geocodeService.findPlaces service endpoint?
            //this._geocodeService.addressToLocations(geoOptions, geocodeResultsFunction, errorHandler);

        },
		*/
		/*
        // Reverse geocode
		_findAddressFromPoint : function (mapPoint, callbackHandler, errorHandler) {
            var geocodeResultsFunction = function (geocodeResults) {
                var results = [];

                // Standardize address before returning results
                function formatAddress(addressIn) {
                    var address = addressIn.Address;
                    var city = addressIn.Admin1;
                    var state = addressIn.Admin2;
                    //var country = addressIn.Admin3;
                    var zip = addressIn.Postal;
                    var country = addressIn.CountryCode;

                    var str = "";
                    if (address)
                        str = address;
                    if (city)
                        str = str + (address ? ", " : "") + city;
                    if (state)
                        str = str + (city ? ", " : "") + state;
                    if (zip)
                        str = str + (state ? ", " : "") + zip;
                    if (country)
                        str = str + (zip ? ", " : "") + country;

                    return str;
                }

                // We only get one result back ever
                if (geocodeResults.constructor == Array) {
                    dojo.forEach(geocodeResults, function (candidate) {  
                        results.push({
                            rawAddress: address,
                            address: formatAddress(candidate.address),
                            score: candidate.score,
                            point: candidate.location
                        });
                    });
                } else {
                    results.push({
                        address: formatAddress(geocodeResults.address),
                        score: geocodeResults.score,
                        point: geocodeResults.location
                    });
                }

                callbackHandler(results);
            }

            var convertFunc = function (address) {
                return address.Address + " " + address.City + " " + address.Country + " " + address.State + " " + address.Zip4;
            }

            this._geocodeService.locationToAddress(mapPoint, 100, geocodeResultsFunction, errorHandler);
        },
		*/
		_addBasemapGallery : function ( elem_destination ) {
console.log ("TEST - options.basemaps : "+ options.basemaps);
console.log ("TEST - options.bingMapsKey : "+ options.bingMapsKey);
			
			var basemapGallery;
			if (options.basemaps != null) {
				var array_basemaps = new Array();
				var basemap_newLayer, basemap_newBasemap;
				$.each(options.basemaps, function(i, e) {
					basemap_newLayer = new esri.dijit.BasemapLayer({
						url: 	e.url
					});
					basemap_newBasemap = new esri.dijit.Basemap({
						layers:			[basemap_newLayer],
						title: 			e.title,
						thumbnailUrl: 	e.thumbnail
					});
					array_basemaps.push(basemap_newBasemap);
				});
				
				basemapGallery = new esri.dijit.BasemapGallery({
				  showArcGISBasemaps: options.showArcGISBasemaps,
				  basemaps: array_basemaps,
				  bingMapsKey: options.bingMapsKey,
				  map: variables.map
				}, elem_destination);
			} else {
				basemapGallery = new esri.dijit.BasemapGallery({
				  showArcGISBasemaps: options.showArcGISBasemaps,
				  bingMapsKey: options.bingMapsKey,
				  map: variables.map
				}, elem_destination);
			}
			
			basemapGallery.startup();
			
			dojo.connect(basemapGallery, "onError", function(msg) {console.log(msg)});
		},
		_addMapLayer : function( url, type, id, params ) { 
			
			if (typeof esri == "undefined" ) { //|| esri == null
//console.log ("TEST - add esri.map from dojo.require");
				esri = variables.obj_esri;
				//dojo.require("esri.map");  
				//dojo.require("esri.utils");
//console.log ("TEST - typeof esri (added) "+ typeof esri);
			}
//console.log ("TEST - _addMapLayer url : "+ url);
//console.log ("TEST - _addMapLayer type : "+ type);
//console.log ("TEST - _addMapLayer id : "+ id);

			//var obj_map = variables.map;
			var layer;
			switch (type) {
				case "MapServer":
				case "MapService":
				case "TiledMapService":
				case "ArcGISTiledMapServiceLayer":
					layer = new esri.layers.ArcGISTiledMapServiceLayer( url ); //, {"id":id});
					break;
				case "ImageServer":
				case "ImageService":
				case "ImageServiceLayer":
				case "ArcGISImageServiceLayer":
					layer = new esri.layers.ArcGISImageServiceLayer( url );
					//var params = new esri.layers.ImageServiceParameters();
					//params.noData = 0;
					//layer =  new esri.layers.ArcGISImageServiceLayer(url, {
					  	//imageServiceParameters: params
					//});
					break;
				case "DynamicMapServer":
				case "DynamicMapService":
				case "ArcGISDynamicMapServiceLayer":
					var imageParameters = new esri.layers.ImageParameters();
					imageParameters.format = "png32";  //set the image type to PNG24, note default is PNG8.
					layer = new esri.layers.ArcGISDynamicMapServiceLayer( url, { "opacity": 1, "imageParameters": imageParameters });
					break;
				case "FeatureServer":
				case "FeatureService":
				case "FeatureLayer":
					//var dataSource = new esri.layers.TableDataSource();
					//  dataSource.workspaceId = "MyDatabaseWorkspaceIDSSR2";
					//  dataSource.dataSourceName = "ss6.gdb.Lakes";
					//var layerSource = new esri.layers.LayerDataSource();
					//  layerSource.dataSource = dataSource;
					
console.log ("TEST - FeatureServer url: "+ url);
console.log ("TEST - FeatureServer params.mode: "+ params.mode);
console.log ("TEST - FeatureServer params.outfields: "+ params.outfields);
					
					layer = new esri.layers.FeatureLayer( url, {
						mode : params.mode,
						outFields : params.outfields
					});
					  //dojo.connect(layer, "onLoad", function (layer) {
						//var gs = esri.config.defaults.geometryService;
						//var extent = layer.fullExtent;
						//if (extent.spatialReference.wkid === map.spatialReference.wkid) {
						//  obj_map.setExtent(extent);
						//} else {
						//  gs.project([extent], map.spatialReference).then(function (results) {
						//	obj_map.setExtent(results[0]);
						//  });
						//}
					  //});
				
					//var renderer = new esri.renderer.SimpleRenderer(
						//new esri.symbol.SimpleFillSymbol("solid", null, new dojo.Color([255, 0, 255, 0.75]) // fuschia lakes!
					  //));
				
					//layer.setRenderer(renderer);
					break;
				default:
					layer = null;
					break;
			}
			if (layer != null) {
				console.log ("TEST - add layer to map / url: "+ url);
				//obj_map.addLayer(layer); 
				
				return layer;
				//.addLayers(arrDynMapservices);
			} else {
				console.log ("TEST - add layer to map NULL");		
				return null;		
			}
		},
		_loadMapLegend : function ( layers ) {
console.log ("TEST - _loadMapLegend ");
			
			var layerInfo = dojo.map(layers, function(layer,index){
					return {layer:layer.layer,title:layer.layer.name};
				});
			if(layerInfo.length > 0){
				//console.log ("TEST - legendDijit");
				var legendDijit = new esri.dijit.Legend({
					  map: variables.map,
					  layerInfos: layerInfo
					}, options.mapLegend );
				legendDijit.startup();
			}
			/*
				//add a legend
				var layerInfo = dojo.map(layers, function(layer,index){
				  return {layer:layer.layerObject,title:layer.title};
				});
				if(layerInfo.length > 0){
				  var legendDijit = new esri.dijit.Legend({
					map:map,
					layerInfos:layerInfo
				  },"legend");
		
				  legendDijit.startup();
				}
				else{
				  dojo.byId('legend').innerHTML = 'No operational layers';
				}
			*/
		},
		_loadMap : function( ) {
			
        	// specify CORS enabled server and proxy for fallback
        	esri.config.defaults.io.corsEnabledServers.push( options.crossDomain_corsURL );
            esri.config.defaults.io.proxyUrl = options.crossDomain_proxyURL;
			
//console.log ("TEST - options.crossDomain_corsURL : "+ options.crossDomain_corsURL);
//console.log ("TEST - options.crossDomain_proxyURL : "+ options.crossDomain_proxyURL);
			
			//obj_esri
			//console.log ("TEST - typeof esri (3)"+ typeof(esri));
			
			// Once Map Loaded
			dojo.connect(variables.map, 'onLoad', function () {
				
				// Scale Bar
				if (options.scalebarUnit != null) {
					var scalebar = new esri.dijit.Scalebar({
						map: 			variables.map,
						scalebarUnit: 	options.scalebarUnit
					  });
				}
				
				// Overview Map
				if (options.overviewMap != null) {
				  var overviewMap = new esri.dijit.OverviewMap({map: variables.map},dojo.byId(options.overviewMap));
				  overviewMap.startup();
				}
				
				// Basemap Gallery
				if (options.basemapGallery != null) {
					methods._addBasemapGallery( options.basemapGallery );
				}
		  
			    //resize the map when the browser resizes
				dojo.connect(variables.map, 'resize', methods._resizeMap);
				methods._resizeMap();
				
			});	
			
			if (options.geoLocateMe == true) {
				methods._geoLocate();	
			}
		},
		_initDojo : function( options ) {
//console.log ("TEST - _initDojo ");
//console.log ("TEST - elem_destination_id: "+ variables.elem_destination_id);
			
			var obj_mapExtent = {}
			if (options.mapExtent != null) {
				//console.log ("TEST - options.mapExtent.wkid: "+ options.mapExtent.wkid);
				
				// Spacial Reference
				var WMRef = new esri.SpatialReference({
					wkid: options.mapExtent.wkid
				});
				// Extent
				obj_mapExtent = new esri.geometry.Extent({
					xmax: options.mapExtent.xmax, //-13155592.58,
					xmin: options.mapExtent.xmin, //-13168969.06,
					ymax: options.mapExtent.ymax, //4000165.32,
					ymin: options.mapExtent.ymin, //3990610.69,
					spatialReference:{wkid:WMRef}
				}); 
			} else {
				obj_mapExtent = null;
			}
			//console.log ("TEST - obj_mapExtent: "+ obj_mapExtent);
			
			
			if (options.webMapId != null && options.webMapId != false) {
				
				// -----------------------------------------------------------------------------------------
				// WEB MAP
				// -----------------------------------------------------------------------------------------
				var mapDeferred = esri.arcgis.utils.createMap(options.webMapId, variables.elem_destination_id, {
				  mapOptions: {
					slider: true,
					nav: options.mapNav,
					extent: obj_mapExtent,
					wrapAround180: options.wrapAround180,
					sliderStyle: options.sliderStyle
				  }
				});
				var obj_response_map;
				var obj_response_layers;
				mapDeferred.then(function(response) {
				  
				  //dojo.byId("title").innerHTML = response.itemInfo.item.title;
				  //dojo.byId("subtitle").innerHTML = response.itemInfo.item.snippet;
				  
				  obj_response_map = response.map;
				  
				  obj_response_layers = response.itemInfo.itemData.operationalLayers;   
//console.log ("TEST - obj_response_layers count: "+ obj_response_layers.length);
				  
				  //resize the map when the browser resizes
				 	 //dojo.connect(dijit.byId('map'), 'resize', variables.map, variables.map.resize);
				  //add the legend
				  //var layers = response.itemInfo.itemData.operationalLayers;   
					 // if(obj_response_map.loaded){
					//	methods._loadMapLegend(obj_response_layers);
					 // } else{
					//	  dojo.connect(obj_response_map,"onLoad",function(){
					//		methods._loadMapLegend(obj_response_layers);
					//	  });
					 // }
				},function(error){
					console.log("Map creation failed: ", dojo.toJson(error));        
				});
				
				variables.map = obj_response_map;
				options.mapLayers = obj_response_layers;

			} else {
			
				// -----------------------------------------------------------------------------------------
				// MAP
				// -----------------------------------------------------------------------------------------
				variables.map = new esri.Map( variables.elem_destination_id, { 
					extent: obj_mapExtent,
					nav: options.mapNav,
					wrapAround180: options.wrapAround180,
					sliderStyle: options.sliderStyle
				});
								
				// Add Initial Basemap Layer
//console.log ("TEST - options.initBasemap_url : "+ options.initBasemap_url);
				var initBasemap = new esri.layers.ArcGISTiledMapServiceLayer( options.initBasemap_url );
				variables.map.addLayer(initBasemap);
			
				if (options.mapLegend != null) {
//console.log ("TEST - options.mapLegend : "+ options.mapLegend);
					//add the legend
					dojo.connect(variables.map,'onLayersAddResult',function(results){
//console.log ("TEST - onLayersAddResult");
						methods._loadMapLegend(results);
					});
				}
				
				// Add Map Layers
				//var array_mapLayers = options.mapLayers;
				var array_addedLayers = new Array();
				var temp_addedLayer = null;
				
				if (options.mapLayers.length > 0) {
					$.each(options.mapLayers, function(i, e) { 
						//methods._addMapLayer(e.url, e.type, e.id, e.params);
						
						temp_addedLayer = methods._addMapLayer(e.url, e.type, e.id, e.params);
						//variables.map.addLayer(temp_addedLayer);
						array_addedLayers.push(temp_addedLayer);
						temp_addedLayer = null;
					});
					
					variables.map.addLayers(array_addedLayers);
				}
			}
			// -----------------------------------------------------------------------------------------

			// Store an instance of "esri" object
			variables.obj_esri = esri;
			
			
			// Start to load the map
			methods._loadMap();

		},
		_prepareDojo : function( options ) {
//console.log ("TEST - _prepareDojo ");

			dojo.require("esri.map");
			dojo.require("dijit.dijit");
        	dojo.require("dojo.parser");
       		dojo.require("esri.arcgis.utils");
    		dojo.require("esri.layers.FeatureLayer");
      		dojo.require("esri.dijit.Popup");
     		dojo.require("esri.tasks.geometry");
			//dojo.require("dijit.layout.BorderContainer"); // NOT NEEDED
			//dojo.require("dijit.layout.ContentPane"); // NOT NEEDED
			
			// If Scalebar, add required dijit
			if (options.scalebarUnit != null && options.scalebarUnit != false) {
				dojo.require("esri.dijit.Scalebar");
			}
			// If OverviewMap, add required dijit
			if (options.overviewMap != null && options.overviewMap != false) {
    			dojo.require("esri.dijit.OverviewMap");
			}
			// If BasemapGallery, add required dijit
			if (options.basemapGallery != null && options.basemapGallery != false) {
    			dojo.require("esri.dijit.BasemapGallery");
			}
			// If Legend, add required dijit
			if (options.mapLegend != null && options.mapLegend != false) {
				dojo.require("esri.dijit.Legend");
			}
			// If GeoCode/Locator, add required dijit
			if (options.geoService != null && options.geoService != false) {
				dojo.require("esri.tasks.locator");
			}
			
			// Once DoJo is loaded, start to initialize the map
			dojo.addOnLoad( function () {
					methods._initDojo( options );
				} );
				
			$(document).ajaxError(function (event, request, settings) {
				console.log("Error loading from: " + settings.url);
			});
		},
		show : function( ) {
			// Show Map
		  	if( variables.elem_destination_id != null) {
		  		$("#"+ variables.elem_destination_id).parent().show();
			} else if (this != null) {
			  this.show();
			}
			
			if (variables.map != null) {
				methods._resizeMap();
			}
		},
		hide : function( ) {
			//Hide Map
		  	if( variables.elem_destination_id != null) {
		  		$("#"+ variables.elem_destination_id).parent().hide();
			} else if (this != null) {
			  this.hide();
			}
		}
		//,
		//update : function( content ) { 
		//  // !!! 
		//}
	  };

  $.fn.esri = function( method ) {
	  	  
//console.log ("TEST - .esri");
		
		// Get Element ID
		//variables.elem_destination_id = this.attr("id"); //"mapDiv";
    
		// Method calling logic
		if ( methods[method] ) {
		  return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
		  return methods.init.apply( this, arguments );
		} else {
		  $.error( 'Method ' +  method + ' does not exist on jQuery.esri' );
		}    
		
  
  };

})( jQuery, dojo );
