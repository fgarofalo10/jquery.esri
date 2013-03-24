jquery.esri
===========

Load an Esri Map (using Dojo) through jQuery

This is just a demo / sample. There are no guarantees this code will work.
It should be thoroughly tested before used in a production environment.

[Demo](http://alaframboise.github.com/jquery.esri/index.html)

jQuery.esri Plugin by Frank Garofalo is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License.


Get Started
===========

Once you have initiated jQuery and loaded the jQuery.esri plugin. Then you can grab an HTML element 
(such as <div id="mapDiv"></div>) and call jQuery.esri() as shown below:

$("#mapDiv").esri( mapOptions );

The options passed into jQuery.esri() include:


  		var mapOptions = {
				//webMapId:		"085648dddb0e41baa898b5e0b3afc902",	// Not working yet
				initBasemap_url : 'server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer',
				mapNav: false,
				mapLayers: [
				  {
					id: "worldTemps1",
					type: "ImageServer",
					url: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/World/Temperature/ImageServer",
					params: null
				  },
				  {
					id: "recentEarthquakes",
					type: "ArcGISTiledMapServiceLayer",
					url: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Earthquakes/RecentEarthquakesRendered/MapServer/0",
					params: null
				  }
          /*,
				  {
					id: "CalTransTraffic1",
					type: "FeatureServer",
					url: "http://atlas.resources.ca.gov/ArcGIS/rest/services/Transportation/CA_Higway_Alerts/FeatureServer/0",
					params: {
							mode: "esri.layers.FeatureLayer.MODE_ONDEMAND",
							outfields: ["*"]
						}
				  }*/
				],
				mapExtent: {
					wkid: 102100, //3857,
					xmax: -13155592.58,
					xmin: -13168969.06,
					ymax: 4000165.32,
					ymin: 3990610.69
				 },
				wrapAround180: true,
				//overviewMap: "overviewDiv",
				geoLocateMe: false,
				geoService: true,
				basemapGallery: 'map_basemapGallery',
				mapLegend: 'map_legend',
				infoTemplate: {
					title: "Location",
					//layout: "Street: ${Address}<br />City: ${City}<br />State: ${State}<br />Zip: ${Zip}"	
					layout: "<table><tr><td style=\"padding-right:5px\">Street:</td><td>${Address}</td></tr><tr><td>City: </td><td>${City}</td></tr><tr><td>State:</td><td>${State}</td></tr><tr><td>Zip:</td><td>${Zip}</td></tr></table>"	
				}
			};


Other Interface elements:
=========================

// Hide / Show Map:
var elem_link_map_hide = jQuery("#link_map_hide");
var elem_link_map_show = jQuery("#link_map_show");
elem_link_map_show.hide();

// Hide Map link - Click event: 

elem_link_map_hide.click(function(e) {
	// Hide the "Hide Map" link
	elem_link_map_hide.hide();
	// Show the "Show Map" link
	elem_link_map_show.show();
	
	// Call to plugin to hide the <div> containing the map
	jQuery("#mapDiv").esri("hide");
	
	e.preventDefault();
});

// Show Map link - Click event: 

elem_link_map_show.click(function(e) {
	// Show the "Hide Map" link
	elem_link_map_hide.show();
	// Hide the "Show Map" link
	elem_link_map_show.hide();
	
	jQuery("#mapDiv").esri("show");
	
	e.preventDefault();
});


//GeoLocate link: 

jQuery("#link_map_geoLocate").click(function(e) {
	jQuery("#mapDiv").esri("getGeoLocate");
	
	e.preventDefault();
});
