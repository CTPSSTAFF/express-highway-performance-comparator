///////////////////////////////////////////////////////////////////////////////////////////////////
//*** App Initialization ***///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

var CTPS = {};
CTPS.INRIX = {};

CTPS.INRIX.init = function() {
	
	// Test for browser SVG support.
	var szMsg =
	  "Your web browser does not support W3C standard SVG graphics, which is required for the charts rendered by this application"  +
	  "This application will run, but charts will not be displayed." +
	  "All of the following browsers provide the necessary SVG support:" +
	 "    Internet Explorer (version 9 and higher), Firefox, Chrome, Safari, and Opera.";
	if (Modernizr.svg !== true) {
		alert(szMsg);
	};
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** Local Constants and DOM Initialization***////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	var i;
	var chartMargin = {top: 20, right: 60, bottom: 60, left: 60};
	var w = parseInt(d3.select('.columnRight').style('width'), 10);
	w = w - chartMargin.left - chartMargin.right;
	var h = 300;
	var legend_w = parseInt(d3.select('.chartLegend').style('width'), 10);
	var oMap, oHighlightLayer;
	var DIFF = 1215;
	var FirstTime = true;
	
	// Highlight "2015", "AM", "Average Speed", "I-90", "EB" buttons
	// This is what is shown on load, but can be changed to any other route
	$("#AM").addClass("clicked");
	$("#1215").addClass("clicked");
	$("#AVG_SP").addClass("clicked");
	$("#I-90-button").addClass("clicked");
	$("#NB-EB").addClass("clicked");
	
	//Define tooltips
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-5, 0]);
	var tipSpeedLimit = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-5, 0])
		.html(function(d) {
			return "<strong>Segment Begin: &nbsp;&nbsp;" + d.SEG_BEGIN + 
					"<br>Segment End: &nbsp;&nbsp;&nbsp;&nbsp;" + d.SEG_END + 
					"<br><br>Speed Limit: " + (+d.SPD_LIMIT) + " mph</strong>";
		});
	var tipDiffer = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-5, 0]);
	
	//Define Scales and Axes
	var xScale = d3.scaleLinear()
		.range([0, w]);
	var yScale = d3.scaleLinear()
		.range([h, 0]);
	var xAxis = d3.axisBottom(xScale);
	var xAxisTop = d3.axisTop(xScale)
		.ticks(0)
		.tickSize(0);
	var yAxis = d3.axisLeft(yScale)
		.tickFormat(d3.format(",.2r"));
	var yAxisRight = d3.axisRight(yScale)
		.tickFormat(d3.format(",.2r"));
	var yAxisLines = d3.axisLeft(yScale)
		.tickSizeInner(-w)
		.tickPadding(9);
	
	
	//Create SVG elements
	var svg = d3.select("#chartDisplay")
		.append("svg")
			.attr("id", "barChart")
			.attr("width", w + chartMargin.left + chartMargin.right)
			.attr("height", h + chartMargin.top + chartMargin.bottom);
	var chart = svg.append("g")
			.attr("transform",  "translate(" + chartMargin.left + "," + chartMargin.top + ")")
			.call(tip)
			.call(tipSpeedLimit);
	var differChart = d3.select("#chartDifferDisplay")
		.append("svg")
			.attr("id", "differChart")
			.attr("width", w + chartMargin.left + chartMargin.right)
			.attr("height", h + chartMargin.top + chartMargin.bottom)
		.append("g")
			.attr("transform",  "translate(" + chartMargin.left + "," + chartMargin.top + ")")
			.call(tipDiffer)
			.call(tipSpeedLimit);
	var svgLegend = d3.select(".chartLegend")
		.append("svg")
			.attr("id", "chartLegend")
			.attr("width", $(".chartLegend").width())
			.attr("height", 45);
	var legend = svgLegend.append("g")
		.attr("id", "legend")
		.attr("transform", function(d, i) {
			return "translate(0, 0)"; 
		});
	var spdLmtLegend = d3.select(".chartLegend")
		.append("svg")
			.attr("id", "speedLimitLegend")
			.attr("width", $(".chartLegend").width())
			.attr("height", 35);
	var diffLegend = d3.select(".chartLegend")
		.append("svg")
			.attr("id", "differLegend")
			.attr("width", $(".chartLegend").width())
			.attr("height", 45);

	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** Lookup Tables ***////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	//Set RID and routeName based on selected route
	var lookupRouteRID = { 	"I290_EB": { rid : 1, 
										routeName : "I-290 Eastbound" },
							"I290_WB": { rid : 2, 
										routeName : "I-290 Westbound" },
							"I495_NB": { rid : 3, 
										routeName : "I-495 Northbound" },
							"I495_SB": { rid : 4, 
										routeName : "I-495 Southbound" },
							"I90_EB": { rid : 5, 
										routeName : "I-90 Eastbound" },
							"I90_WB": { rid : 6, 
										routeName : "I-90 Eastbound" },
							"I93_NB": { rid : 7, 
										routeName : "I-93 Northbound" },
							"I93_SB": { rid : 8, 
										routeName : "I-93 Southbound" },
							"I95_NB": { rid : 9, 
										routeName : "I-95 Northbound" },
							"I95_SB": { rid : 10,
										routeName : "I-95 Southbound" }, 
							"MA128_NB": { rid : 11,
										routeName : "MA-128 Northbound" },
							"MA128_SB": { rid : 12, 
										routeName : "MA-128 Southbound" }, 
							"MA2_EB": { rid : 13, 
										routeName : "MA-2 Eastbound" },
							"MA2_WB": { rid : 14, 
										routeName : "MA-2 Westbound" },
							"MA24_NB": { rid : 15, 
										routeName : "MA-24 Northbound" },
							"MA24_SB": { rid : 16, 
										routeName : "MA-24 Southbound" },
							"MA3_NB": { rid : 17, 
										routeName : "MA-3 Northbound" },
							"MA3_SB": { rid : 18, 
										routeName : "MA-3 Southbound" },
							"US1_NB": { rid : 19, 
										routeName : "US-1 Northbound" },
							"US1_SB": { rid : 20, 
										routeName : "US-1 Southbound" },
							"US3_NB": { rid : 21, 
										routeName : "US-3 Northbound" },
							"US3_SB": { rid : 22, 
										routeName : "US-3 Southbound" },
							"MA213_EB": { rid : 23, 
										routeName : "MA213 Eastbound" },
							"MA213_WB": { rid : 24, 
										routeName : "MA-213 Westbound" },
							"LowellConnector_NB": { rid : 25, 
													routeName : "Lowell Connector Northbound" },
							"LowellConnector_SB": { rid : 26, 
													routeName : "Lowell Connector Southbound" },
							"MA140_EB": { rid : 27, 
										routeName : "MA-140 Eastbound" },
							"MA140_WB": { rid : 28, 
										routeName : "MA-140 Westbound" },
							"MA146_NB": { rid : 29, 
										routeName : "MA-146 Northbound" },
							"MA146_SB": { rid : 30,
										routeName : "MA-146 Southbound" },
							"US44_EB": { rid : 31, 
										routeName : "US-44 Eastbound" },
							"US44_WB": { rid : 32,
										routeName : "US-44 Westbound" }
						};
						
	//IDs for selector buttons
	var buttonIDs = [	"#2012", "#2015", "#1215",
						"#AM", "#PM",
						"#AVG_SP","#CONG_MN", "#DEL_MI", "#AVTT_IX", "#SPD_IX",
						"#I-290-button", "#I-495-button", "#I-90-button", "#I-93-button", "#I-95-button", 
						"#MA-128-button", "#MA-2-button", "#MA-24-button", "#MA-3-button", "#US-1-button", "#US-3-button",
						"#MA-213-button", "#Lowell-Connector-button", "#MA-140-button", "#MA-146-button", "#US-44-button",
						"#NB-EB", "#SB-WB"
					];
	
	//Full Performance Measure Names
	var perfMeasName = 	{ 	"AVG_SP": "Average Speed", 
							"CONG_MN": "Congested Time", 
							"DEL_MI": "Delay per Mile", 
							"AVTT_IX": "Average Travel Time Index", 
							"SPD_IX": "Speed Index"
						};
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** WMS/WFS Setup and Handler Functions ***//////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	var szServerRoot = 'http://www.ctps.org:8080/geoserver/'; 
	szWMSserverRoot = szServerRoot + '/wms'; 
	szWFSserverRoot = szServerRoot + '/wfs';
	
	//Event Handler for route selection 
	function routeSelector(load) {
		//Collect "clicked" elements
		var c = collectClicked();

		//Collect RID
		var routeID = lookupRouteRID[c.routeFull];
		
		//  Submit WFS request to get data for route, and zoom map to it.	
		var cqlFilter = 'rid==' + routeID.rid.toLocaleString();
		var typename;		
		switch(c.year) {
			case 2012:
				typename = 'postgis:ctps_cmp_2014_exp_routes_ext';
				break;
			case 2015:
				typename = 'postgis:ctps_cmp_2015_exp_routes_ext';
				break;
			case DIFF:
				typename = 'postgis:ctps_cmp_201215_diff_exp_rtes';
				break;
			default:
				typename = 'postgis:ctps_cmp_2015_exp_routes_ext';
		};		
		var szUrl = szWFSserverRoot + '?';
		szUrl += '&service=wfs';
		szUrl += '&version=1.0.0';
		szUrl += '&request=getfeature';
		szUrl += '&srsname=EPSG:26986';
		szUrl += '&outputformat=json';
		
		$.ajax({ url		: szUrl + '&typename=' + typename + '&cql_filter=' + cqlFilter,
				 type		: 'GET',
				 dataType	: 'json',
				 success	: 	function (data, textStatus, jqXHR) {	
									var reader = new ol.format.GeoJSON();
									var aFeatures = reader.readFeatures(jqXHR.responseText);
									
									//Clear any existing layers
									CTPS.INRIX.oHighlightLayer.getSource().clear(); 
									CTPS.INRIX.oTMCHighlightLayer.getSource().clear(); 
									
									//Populate "dataStore", order data by "FROM_MEAS" and add the "START_DISTANCE" attribute to each record.
									var dataStore = orderData(aFeatures, c.time);
									CTPS.INRIX.dataStore = dataStore;

									// Set up animation
									var oBounds = { minx: [],
													miny: [],
													maxx: [],
													maxy: [] };
									for (i=0; i<aFeatures.length; i++) {
										oBounds.minx.push(aFeatures[i].getGeometry().getExtent()[0]);
										oBounds.miny.push(aFeatures[i].getGeometry().getExtent()[1]);
										oBounds.maxx.push(aFeatures[i].getGeometry().getExtent()[2]);
										oBounds.maxy.push(aFeatures[i].getGeometry().getExtent()[3]);
									};
									var oBoundsRoute = 	[	Math.min.apply(null,oBounds.minx),
															Math.min.apply(null,oBounds.miny),
															Math.max.apply(null,oBounds.maxx),
															Math.max.apply(null,oBounds.maxy)	];								
									
									// Animated transition + d3 render
									if (FirstTime === true) {
										oMap.getView().fit(
											oBoundsRoute, 
											{ size: oMap.getSize(),
											  duration: 2000 }
										);

										//Create Chart Axes Lines
										chart.append("g")
											.attr("class", "axis y-axis-lines")
											.attr("stroke-dasharray", "2,2")
											.call(yAxisLines);
										chart.selectAll(".y-axis-lines .tick text").remove();
										differChart.append("g")
											.attr("class", "axis y-axis-lines")
											.attr("stroke-dasharray", "2,2")
											.call(yAxisLines);
										differChart.selectAll(".y-axis-lines .tick text").remove();
										
										//Update Chart(s) and Legend(s)
										displayChart(dataStore, c.year, c.time, c.measure, c.perfMeas, routeID.routeName);
									
										//Create Chart Axes 
										createChartAxes();
										createCompareChart(dataStore);
										updateAxes();
										
										//Create and Show/Hide Additional Legends
										additionalLegends();
										showhideLegends(c.year, c.measure, dataStore);
										//$("#differChart").hide();
										
										FirstTime = false;
									} else {
										oMap.getView().fit(
											oBoundsRoute, 
											{ size: oMap.getSize(),
											  duration: 2000 }
										);
										
										//Update Chart(s) and Legend(s)
										displayChart(dataStore, c.year, c.time, c.measure, c.perfMeas, routeID.routeName);
										
										//Update Axes
										updateAxes();
										
										//Show or Hide Legends and Speed Limit
										showhideLegends(c.year, c.measure, dataStore);
										
									};
									
									// Add features to vector layer.
									var vSource = CTPS.INRIX.oHighlightLayer.getSource();
									for (i=0; i<aFeatures.length; i++) {
										attr = aFeatures[i].getProperties();
										var newFeature = new ol.Feature(attr);
										vSource.addFeature(newFeature);
									};
									CTPS.INRIX.oHighlightLayer.setSource(vSource);
									
									//Render Table
									//var tableTitle = routeID.routeName + ", " + c.time + " " + perfMeasName[c.measure] + ", " + $("#"+c.year.toLocaleString()).text();
									renderTable(dataStore);
										
								},
				 error		: 	function (qXHR, textStatus, errorThrown ) {
									alert('WFS request in routeSelector()  failed.\n' +
											'Status: ' + textStatus + '\n' +
											'Error:  ' + errorThrown);
								}
		});
		
		//Style layer
		var oStyle = lookupMapStyle(c.year, c.measure, c.time);
		CTPS.INRIX.oHighlightLayer.setStyle(oStyle);
		
	};
	
	//WFS requests for Differ Line Chart
	function differDataSelector() {
		//Collect "clicked" elements
		var c = collectClicked();
		
		//Collect RID
		var routeID = lookupRouteRID[c.routeFull];
		
		// Define WFS request parameters
		var cqlFilter = 'rid==' + routeID.rid.toLocaleString();
		var typename = { 12: 'postgis:ctps_cmp_2014_exp_routes_ext',
						 15: 'postgis:ctps_cmp_2015_exp_routes_ext'	};
		var differFill = { 12: "#f16913", 
						   15: "#1f78b4" };		
		var szUrl = szWFSserverRoot + '?';
		szUrl += '&service=wfs';
		szUrl += '&version=1.0.0';
		szUrl += '&request=getfeature';
		szUrl += '&srsname=EPSG:26986';
		szUrl += '&outputformat=json';
		
		// Submit WFS request to get data for route for 2012
		$.ajax({ url		: szUrl + '&typename=' + typename[12] + '&cql_filter=' + cqlFilter,
				 type		: 'GET',
				 dataType	: 'json',
				 success	: 	function (data, textStatus, jqXHR) {	
									var reader = new ol.format.GeoJSON();
									var aFeatures = reader.readFeatures(jqXHR.responseText);
									
									//Populate "dataStore", order data by "FROM_MEAS" and add the "START_DISTANCE" attribute to each record.
									var dataStore = orderData(aFeatures, c.time);
									var storeDiffer2012 = dataStore;
									
									// Submit WFS request to get data for route for 2015
									$.ajax({ url		: szUrl + '&typename=' + typename[15] + '&cql_filter=' + cqlFilter,
											 type		: 'GET',
											 dataType	: 'json',
											 success	: 	function (data, textStatus, jqXHR) {	
																var reader = new ol.format.GeoJSON();
																var aFeatures = reader.readFeatures(jqXHR.responseText);
																
																//Populate "dataStore", order data by "FROM_MEAS" and add the "START_DISTANCE" attribute to each record.
																var dataStore = orderData(aFeatures, c.time);
																var storeDiffer2015 = dataStore;

																//Update yScale and xScale
																var max12 = d3.max(storeDiffer2012, function(d) { return +d[c.measure]; });
																var max15 = d3.max(storeDiffer2015, function(d) { return +d[c.measure]; });
																var y;
																if (max12 >= max15) {
																	y = lookupPerfMeas("", storeDiffer2012, c.measure);
																	xScale.domain([0, d3.max(storeDiffer2012, function(d) { 
																		return ((+d.START_DISTANCE)+(+d.DISTANCE)); 
																	})]);
																} else {
																	y = lookupPerfMeas("", storeDiffer2015, c.measure);
																	xScale.domain([0, d3.max(storeDiffer2015, function(d) { 
																		return ((+d.START_DISTANCE)+(+d.DISTANCE)); 
																	})]);
																};
																yScale.domain(y.yScaleDomain);
																
																//Render Differ for 2012 data
																renderDiffer.measure(c.measure)
																	.fill(differFill[12])
																	.differYear("12")
																	.data(storeDiffer2012);
																renderDiffer();
																
																//Render Differ for 2015 data
																renderDiffer.measure(c.measure)
																	.fill(differFill[15])
																	.differYear("15")
																	.data(storeDiffer2015);
																renderDiffer();
																
																//Add Speed Limit Line if measure === "AVG_SP"
																if (c.measure === "AVG_SP") {
																	renderSpeedLimit.data(storeDiffer2015)
																		.type("differ");
																	renderSpeedLimit();
																};
																
																//Update Differ Axes
																updateAxes(DIFF);
																
															},
											 error		: 	function (qXHR, textStatus, errorThrown ) {
																alert('WFS request in timerFunc failed.\n' +
																		'Status: ' + textStatus + '\n' +
																		'Error:  ' + errorThrown);
															}
									});
								},
				 error		: 	function (qXHR, textStatus, errorThrown ) {
									alert('WFS request in differDataSelector()  failed.\n' +
											'Status: ' + textStatus + '\n' +
											'Error:  ' + errorThrown);
								}
		});
	};
													
	//Event Handler for route selection 
	function highlightSelector(TMC) {
		//Collect "clicked" elements
		var c = collectClicked();
		
		// Slice TMC to properly encode in URL
		// (Workaround to "+" being interpreted as " " in some browsers)
		var tmcURL;
		if (TMC !== undefined) {
			switch (TMC.slice(3,4)) {
				case "+":
					tmcURL = TMC.slice(0,3) + "%2B" + TMC.slice(4);
					break;
				case "-":
					tmcURL = TMC.slice(0,3) + "%2D" + TMC.slice(4);
					break;
				default:
					tmcURL = TMC;
			};
		} else {
			//Clearing data on route type switch
			return;
		};
		
		// Submit WFS request to get data for route, and zoom map to it.	
		var cqlFilter = "tmc=='" + tmcURL + "'";
		var typename;
		switch(c.year) {
			case 2012:
				typename = 'postgis:ctps_cmp_2014_exp_routes_ext';
				break;
			case 2015:
				typename = 'postgis:ctps_cmp_2015_exp_routes_ext';
				break;
			case DIFF:
				typename = 'postgis:ctps_cmp_201215_diff_exp_rtes';
				break;
			default:
				typename = 'postgis:ctps_cmp_2015_exp_routes_ext';
		};	
		var szUrl = szWFSserverRoot + '?';
		szUrl += '&service=wfs';
		szUrl += '&version=1.0.0';
		szUrl += '&request=getfeature';
		szUrl += '&srsname=EPSG:26986';
		szUrl += '&outputformat=json';
		
		$.ajax({ url		: szUrl + '&typename=' + typename + '&cql_filter=' + cqlFilter,
				 type		: 'GET',
				 dataType	: 'json',
				 success	: 	function (data, textStatus, jqXHR) {	
									var reader = new ol.format.GeoJSON();
									var aFeatures = reader.readFeatures(jqXHR.responseText);
									if (aFeatures.length === 0) {
										//TMCs did not match
										console.log('WFS request returned no features -- TMCs did not match');
										return;
									};
									
									//Clear any existing features in layer
									CTPS.INRIX.oTMCHighlightLayer.getSource().clear(); 
									
									//Populate "dataStore", order data by "FROM_MEAS" and add the "START_DISTANCE" attribute to each record.
									var dataStore = orderData(aFeatures, c.time);
		
									// Add features to vector layer.
									var vSource = CTPS.INRIX.oTMCHighlightLayer.getSource();
									for (i=0; i<aFeatures.length; i++) {
										attr = aFeatures[i].getProperties();
										var newFeature = new ol.Feature(attr);
										vSource.addFeature(newFeature);
									};
									CTPS.INRIX.oTMCHighlightLayer.setSource(vSource);
									
									//Pan to feature in layer
									var geometry = aFeatures[0].getGeometry();
									var oBoundsRoute = geometry.getExtent();	
									var aCenter = boundsToCenter(oBoundsRoute);
									oMap.getView().animate({
										center	: aCenter,
										zoom	: 6
									});
									
								},
				 error		: 	function (qXHR, textStatus, errorThrown ) {
									alert('WFS request in  highlightSelector() failed.\n' +
											'Status: ' + textStatus + '\n' +
											'Error:  ' + errorThrown);
								}
		});
									
		//Style layer
		var oStyle = function(feature) {
						return [new ol.style.Style({
							fill	: new ol.style.Fill({ 
										color: 'rgba(255,255,255,0.0)' 
									}), 
							stroke 	: new ol.style.Stroke({ 
										color: "brown",
										width: 20.0,
										lineCap: "butt"
									})
						})];
					};
		CTPS.INRIX.oTMCHighlightLayer.setStyle(oStyle);						
	};

	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** Menu Display Functions ***///////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	//Function to highlight "clicked" menu buttons (and update direction label if needed)
	function highlight() {
		//Highlight "clicked" buttons
		for (i=0; i<buttonIDs.length; i++) {
			if ($(buttonIDs[i]).hasClass("clicked")) {
				$(buttonIDs[i]).parent().children().css("background-color", "#333");
				$(buttonIDs[i]).parent().children().css("color", "#f2f2f2");
				$(buttonIDs[i]).css("background-color", "#4CAF50");
				$(buttonIDs[i]).css("color", "#fff");
			};
		};
		//Update Direction Label
		if ($("#I-290-button").hasClass("clicked") ||
			$("#I-90-button").hasClass("clicked") ||
			$("#MA-2-button").hasClass("clicked") ||
			$("#MA-213-button").hasClass("clicked") ||
			$("#MA-140-button").hasClass("clicked") ||
			$("#US-44-button").hasClass("clicked")) 
		{
			$("#NB-EB").text("Eastbound");
			$("#NB-EB").attr("value", "EB");
			$("#SB-WB").text("Westbound");
			$("#SB-WB").attr("value", "WB");
		} else {
			$("#NB-EB").text("Northbound");
			$("#NB-EB").attr("value", "NB");
			$("#SB-WB").text("Southbound");
			$("#SB-WB").attr("value", "SB");
		};
	};
	
	//Reusable Bar Chart Legend:
	function barChartLegend() {
		var year = 2015,
			measure = "AVG_SP",
			palette = d3.scaleThreshold()
						.domain([25,35,45,50,55])
						.range(["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"]);

		function barLegend() {	
			//Gather color palette data
			var paletteData = palette.range().map(function(color) {
				var d = palette.invertExtent(color);
					if (d[0] == null) d[0] = palette.domain()[0]-0.0000001;
					if (d[1] == null) d[1] = palette.domain()[palette.domain().length - 1]+0.0000001;
				return d;
			});
			var legendWidth = $(".chartLegend").width()/paletteData.length;
			
			//Update Legend Rects
			//Threshold Key: https://bl.ocks.org/mbostock/4573883
			var legendRects = legend.selectAll(".legendRect")
				.data(paletteData);
			legendRects.exit()
					.style("fill", "none")
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", w+100)
					.style("fill-opacity", 1e-6)
					.remove();
			legendRects.style("fill-opacity", 1)
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", function(d, i) { return i*legendWidth; })
					.attr("width", legendWidth)
					.attr("height", 20)
					.attr("fill", function(d) { 
						return palette(d[0]);
					});
			legendRects.enter()
				.append("rect")
					.attr("class", "legendRect")
					.attr("x", function(d, i) { return i*legendWidth; })
					.attr("width", legendWidth)
					.attr("height", 20)
				.transition().duration(500).ease(d3.easeLinear)
					.style("fill-opacity", 1)
					.attr("fill", function(d) { 
						return palette(d[0]);
					});
			
			//Update Legend Ticks
			var legendTicks = legend.selectAll(".legendTick")
				.data(paletteData);
			legendTicks.exit()
					.style("fill", "none")
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", w+100)
					.style("fill-opacity", 1e-6)
					.remove();
			legendTicks.style("fill-opacity", 1)
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", function(d, i) { return i*legendWidth; })
					.attr("width", function(d, i) { 
						var firstValue = paletteData[0][1];
						return (d[1] == firstValue) ? 0 : 1;
					});
			legendTicks.enter()
				.append("rect")
					.attr("class", "legendTick")
					.attr("x", function(d, i) { return i*legendWidth; })
					.attr("width", function(d, i) { 
						var firstValue = paletteData[0][1];
						return (d[1] == firstValue) ? 0 : 1;
					})
				.transition().duration(500).ease(d3.easeLinear)
					.style("fill-opacity", 1)
					.attr("height", 25)
					.attr("fill", "black");
				
			//Update Legend Text
			var legendDescrip = legend.selectAll("#legend text")
				.data(paletteData);
			legendDescrip.exit()
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", w+100)
					.style("fill-opacity", 1e-6)
					.remove();
			legendDescrip.style("fill-opacity", 1)
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", function(d, i) { return legendWidth+(i*legendWidth); })
					.attr("y", 37.5)
					.text(function(d, i) { 
						var lastValue = paletteData[paletteData.length-1][0];
						var lastlastValue = paletteData[paletteData.length-1][1];
						return (measure === "AVG_SP" && d[1] == lastValue) ? d[1] + "mph" : 
							   (measure === "CONG_MN" && d[1] == lastValue) ? d[1] + " minutes" : 
							   (measure === "DEL_MI" && d[1] == lastValue) ? d[1] + " seconds" :
							   (d[1] != lastlastValue) ? d[1] : "";
					})
			legendDescrip.enter()
				.append("text")
					.attr("x", function(d, i) { return legendWidth+(i*legendWidth); })
					.attr("y", 37.5)
					.text(function(d, i) { 
						var lastValue = paletteData[paletteData.length-1][0];
						var lastlastValue = paletteData[paletteData.length-1][1];
						return (measure === "AVG_SP" && d[1] == lastValue) ? d[1] + "mph" : 
							   (measure === "CONG_MN" && d[1] == lastValue) ? d[1] + " minutes" : 
							   (measure === "DEL_MI" && d[1] == lastValue) ? d[1] + " seconds" :
							   (d[1] != lastlastValue) ? d[1] : "";
					})
				.transition().duration(500).ease(d3.easeLinear)
					.style("fill-opacity", 1)
					.attr("fill", "#000")
					.attr("text-anchor", "middle");
			
		};
		
		barLegend.year = function(value) {
			if (!arguments.length) return year;
			year = value;
			return barLegend;
		};
		
		barLegend.measure = function(value) {
			if (!arguments.length) return measure;
			measure = value;
			return barLegend;
		};
		
		barLegend.palette = function(value) {
			if (!arguments.length) return palette;
			palette = value;
			return barLegend;
		};
		
		return barLegend;
	};
	var renderBarLegend = barChartLegend();
	
	//Function to Create Speed Limit Line and Differ Line Legends
	function additionalLegends() {
		//Speed Limit Line Legend
		var speedLimitLegend = spdLmtLegend.selectAll("#speedLimitLegend")
			.data([0])
			.enter();
		speedLimitLegend.append("rect")
			.attr("class", "legendRect")
			.attr("x", 115)
			.attr("y", 12)
			.attr("width", (legend_w - 115))
			.attr("height", 5)
			.attr("fill", "#000");
		speedLimitLegend.append("text")
			.attr("fill", "#000")
			.attr("text-anchor", "start")
			.attr("x", 0)
			.attr("y", 18)
			.text("Speed Limit Line:");
			
		//Differ Line Legend
		var differLegend = diffLegend.selectAll("#differLegend")
			.data([0])
			.enter();
		//2012
		differLegend.append("text")
			.attr("class", "differLegendText12")
			.attr("fill", "#000")
			.attr("text-anchor", "start")
			.attr("x", 0)
			.attr("y", 18)
			.text("2012 Average Speed:");
		differLegend.append("rect")
			.attr("class", "differLegendRect12")
			.attr("x", $("#diffLegendTest").width())
			.attr("y", 12)
			.attr("width", (legend_w - $("#diffLegendTest").width()))
			.attr("height", 5)
			.attr("fill", "#fdae6b");
		differLegend.append("circle")
			.attr("class", "legendCircle legendCircle12")
			.attr("r", 5)
			.attr("cx", (legend_w + $("#diffLegendTest").width())/2)
			.attr("cy", 14)
			.style("fill", "#f16913");
		
		//2015
		differLegend.append("text")
			.attr("class", "differLegendText15")
			.attr("fill", "#000")
			.attr("text-anchor", "start")
			.attr("x", 0)
			.attr("y", 36)
			.text("2015 Average Speed:");
		differLegend.append("rect")
			.attr("class", "differLegendRect15")
			.attr("x", $(".differLegendText15").width())
			.attr("y", 30)
			.attr("width", (legend_w - $("#diffLegendTest").width()))
			.attr("height", 5)
			.attr("fill", "#a6cee3");
		differLegend.append("circle")
			.attr("class", "legendCircle legendCircle15")
			.attr("r", 5)
			.attr("cx", (legend_w + $("#diffLegendTest").width())/2)
			.attr("cy", 32)
			.style("fill", "#1f78b4");
		
	};
	
	//Function to hide Speed Limit Line and Differ Line Legends when not on display
	function showhideLegends(year, measure, dataStore) {
		//Update Legend Labels and Visibility of Speed Limit Line
		switch(year) {
			case DIFF:
				switch(measure) {
					case "AVG_SP":
						$(".differLegendText12").text("2012 Average Speed:");
						$(".differLegendText15").text("2015 Average Speed:");
						$("#diffLegendTest").text("2015 Average Speed:");
						//
						$(".speedLimitDiffer").removeAttr("id");
						$("#speedLimitLegend").css('opacity','1');
						break;
					case "SPD_IX":
						$(".differLegendText12").text("2012 Speed Index:");
						$(".differLegendText15").text("2015 Speed Index:");
						$("#diffLegendTest").text("2015 Speed Index:");
						//
						$(".speedLimitDiffer").attr("id", "hidden");
						$("#speedLimitLegend").css('opacity','0');
						break;
					case "CONG_MN":
						$(".differLegendText12").text("2012 Congested Minutes:");
						$(".differLegendText15").text("2015 Congested Minutes:");
						$("#diffLegendTest").text("2015 Congested Minutes:");
						//
						$(".speedLimitDiffer").attr("id", "hidden");
						$("#speedLimitLegend").css('opacity','0');
						break;
					case "DEL_MI":
						$(".differLegendText12").text("2012 Delay Per Mile:");
						$(".differLegendText15").text("2015 Delay Per Mile:");
						$("#diffLegendTest").text("2015 Delay Per Mile:");
						//
						$(".speedLimitDiffer").attr("id", "hidden");
						$("#speedLimitLegend").css('opacity','0');
						break;
					case "AVTT_IX":
						$(".differLegendText12").text("2012 Average Travel Time Index:");
						$(".differLegendText15").text("2015 Average Travel Time Index:");
						$("#diffLegendTest").text("2015 Average Travel Time Index:");
						//
						$(".speedLimitDiffer").attr("id", "hidden");
						$("#speedLimitLegend").css('opacity','0');
						break;
					default:
						//
						$(".speedLimitDiffer").attr("id", "hidden");
						$("#speedLimitLegend").css('opacity','0');
				};
				$(".speedLimit").attr("id", "hidden");
				$("#differLegend").css('opacity','1');
				break;
			default:
				switch(measure) {
					case "AVG_SP":
						$(".speedLimit").removeAttr("id");
						$("#speedLimitLegend").css('opacity','1');
						renderSpeedLimit.data(dataStore)
							.type("normal");
						d3.select("chart")
							.call(renderSpeedLimit);
						break;
					default:
						$(".speedLimit").attr("id", "hidden");
						$(".speedLimitDiffer").attr("id", "hidden");
						$("#speedLimitLegend").css('opacity','0');
				};
				$("#differLegend").css('opacity','0');
		};
	
		//Update Width/Display of Legends based on label, page size
		spdLmtLegend.selectAll("rect")
			.attr("width", Math.abs(legend_w - 115));		
		
		diffLegend.selectAll("rect")
			.attr("x", $("#diffLegendTest").width())
			.attr("width", Math.abs(legend_w - $("#diffLegendTest").width()));
		diffLegend.selectAll("circle")
			.attr("cx", Math.abs(legend_w + $("#diffLegendTest").width())/2);
		
	};
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** Chart Display Functions ***//////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	//Function to create chart Axes
	function createChartAxes() {
		//Chart X-Axis:
		chart.append("g")
			.attr("class", "axis x-axis")
			.attr("transform", "translate(0," + h + ")")
			.call(xAxis)
			.append("text")
				.attr("class", "x-axis-Label")
				.attr("fill", "#000")
				.attr("x", w/2)
				.attr("y", 40)
				.attr("dx", "0.71em")
				.attr("text-anchor", "middle")
				.text("Miles Along Route");
		chart.append("g")
			.attr("class", "axis x-axis-top")
			.call(xAxisTop);
		
		//Chart Y_Axis:
		chart.append("g")
			.attr("class", "axis y-axis")
			.call(yAxis)
			.append("text")
				.attr("class", "y-axis-Label")
				.attr("fill", "#000")
				.attr("transform", "rotate(-90)")
				.attr("x", -h/2)
				.attr("y", -57)
				.attr("dy", "0.71em")
				.attr("text-anchor", "middle")
				.text("Change in Speed (mph)");
		chart.append("g")
			.attr("class", "axis y-axis-right")
			.attr("transform", "translate(" + w + ",0)")
			.call(yAxisRight);
	};

	//Functions to update Axes
	function updateAxes(differ) {
		var chartName;
		(differ) ? chartName = differChart : chartName = chart;		
		chartName.select(".x-axis")
			.transition()
				.duration(500)
				.ease(d3.easeLinear)
				.call(xAxis);
		chartName.select(".y-axis")
			.transition()
				.duration(500)
				.ease(d3.easeLinear)
				.call(yAxis);
		chartName.select(".y-axis-right")
			.transition()
				.duration(500)
				.ease(d3.easeLinear)
				.call(yAxisRight);
		chartName.select(".y-axis-lines")
			.transition()
				.duration(500)
				.ease(d3.easeLinear)
				.call(yAxisLines);
		chartName.selectAll(".y-axis-lines .tick text").remove();
	};
	
	//Reusable Bar Chart:
	function barChart() {
		var data = CTPS.INRIX.store,
			year = 2015,
			measure = "AVG_SP",
			palette = d3.scaleThreshold()
						.domain([25,35,45,50,55])
						.range(["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"]);
		
		function bar() {			
			var bars = chart.selectAll(".speedBars")
				.data(data);
			bars.exit()
					.style("fill", "none")
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", w+100)
					.style("fill-opacity", 1e-6)
					.remove();
			bars.style("fill-opacity", 1)
					.attr("TMC", function(d) { return d.TMC })
					.on("mouseleave", function(d) { 
						tip.hide(d);
						d3.select(this).style("fill", function(d) {
							return palette(+d[measure]);
						});
					})
					.on("click", function(d) {
						highlightBar(d);
					})
				.transition().duration(500).ease(d3.easeLinear)
					.attr("width", function(d) { 
						return xScale(+d.DISTANCE); ;
					})
					.attr("height", function(d) {
						return (+year === DIFF) ? Math.abs(yScale(+d[measure]) - yScale(0)) : h - yScale(+d[measure]);
					})
					.attr("x", function(d) {
						return xScale(+d.START_DISTANCE);
					})
					.attr("y", function(d) {
						return (+d[measure] > 0 || year != DIFF) ? yScale(+d[measure]) : yScale(0);
					})
					.style("fill", function(d) {
						return palette(+d[measure]);
					});
			bars.enter()
				.append("rect")
					.attr("class", "speedBars")
					.attr("TMC", function(d) { return d.TMC })
					.attr("width", function(d) { 
						return xScale(+d.DISTANCE); ;
					})
					.attr("height", function(d) {
						return (+year === DIFF) ? Math.abs(yScale(+d[measure]) - yScale(0)) : h - yScale(+d[measure]);
					})
					.attr("x", function(d) {
						return xScale(+d.START_DISTANCE);
					})
					.attr("y", function(d) {
						return (+d[measure] > 0 || year != DIFF) ? yScale(+d[measure]) : yScale(0);
					})
					.style("fill", "none")
					.style("fill-opacity", 1e-6)
					.on("mouseenter", function(d) { 
						tip.show(d);
						d3.select(this).style("fill", "brown");
					})
					.on("mouseleave", function(d) { 
						tip.hide(d);
						d3.select(this).style("fill", function(d) {
							return palette(+d[measure]);
						});
					})
					.on("click", function(d) {
						highlightBar(d);
					})
				.transition().duration(500).ease(d3.easeLinear)
					.style("fill-opacity", 1)
					.style("fill", function(d) {
						return palette(+d[measure]);
					});
		};
		
		bar.data = function(value) {
			if (!arguments.length) return data;
			data = value;
			return bar;
		};
		
		bar.year = function(value) {
			if (!arguments.length) return year;
			year = value;
			return bar;
		};
		
		bar.measure = function(value) {
			if (!arguments.length) return measure;
			measure = value;
			return bar;
		};
		
		bar.palette = function(value) {
			if (!arguments.length) return palette;
			palette = value;
			return bar;
		};
		
		return bar;
	};
	var renderChart = barChart();
	
	//Reusable Speed Limit Line:
	function speedlineChart() {		
		var data = CTPS.INRIX.store,
			type = "";
		
		function speedLine() {
			var line;
			(type === "differ") ?
				line = differChart.selectAll(".speedLimitDiffer")
					.data(data) :
				line = chart.selectAll(".speedLimit")
					.data(data);
			line.exit()
					.style("fill", "none")
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", w+100)
					.style("fill-opacity", 1e-6)
					.remove();
			line.style("fill-opacity", 1)
					.on("mouseleave", function(d) { 
						tipSpeedLimit.hide(d);
						d3.select(this).style("fill", "#000");
					})
				.transition().duration(500).ease(d3.easeLinear)
					.attr("width", function(d) { 
						return xScale(+d.DISTANCE);
					})
					.attr("x", function(d) {
						return xScale(+d.START_DISTANCE);
					})
					.attr("y", function(d) { 
						return yScale(+d.SPD_LIMIT)-2.5; 
					});	
			line.enter()
				.append("rect")
					.attr("class", function(d) {
						return (type === "differ") ? "speedLimitDiffer" : "speedLimit";
					})
					.attr("width", function(d) { 
						return xScale(+d.DISTANCE);
					})
					.attr("height", 5)
					.attr("x", function(d) {
						return xScale(+d.START_DISTANCE);
					})
					.attr("y", function(d) { 
						return yScale(+d.SPD_LIMIT)-2.5; 
					})
					.on("mouseenter", function(d) { 
						tipSpeedLimit.show(d);
						d3.select(this).style("fill", "brown");
					})
					.on("mouseleave", function(d) { 
						tipSpeedLimit.hide(d);
						d3.select(this).style("fill", "#000");
					})
				.transition().duration(500).ease(d3.easeLinear)
					.style("fill-opacity", 1)
					.style("fill", "#000");	
		};		
		
		speedLine.data = function(value) {
			if (!arguments.length) return data;
			data = value;
			return speedLine;
		};
		
		speedLine.type = function(value) {
			if (!arguments.length) return type;
			type = value;
			return speedLine;
		};
		
		return speedLine;
	};
	var renderSpeedLimit = speedlineChart();
	
	//Function to create Differ Chart Lines and Axes
	function createCompareChart(dataStore) {
		//Define Line
		var measure = "AVG_SP";
		var diffLine = d3.line()
			.x(function(d) { return xScale((+d.START_DISTANCE)+(+d.DISTANCE)-((+d.DISTANCE)/2)); })
			.y(function(d) { return yScale(d[measure]); });
		
		//Differ 2012 Line
		differChart.append("path")
			.datum(dataStore)
			.attr("class", "differLine12")
			.attr("d", diffLine)
			.style("fill", "none")
			.style("stroke", "#fdae6b")
			.style("stroke-width", "5px");
			
		//Differ 2015 Line
		differChart.append("path")
			.datum(dataStore)
			.attr("class", "differLine15")
			.attr("d", diffLine)
			.style("fill", "none")
			.style("stroke", "#a6cee3")
			.style("stroke-width", "5px");

		//Differ X-Axis:
		differChart.append("g")
			.attr("class", "axis x-axis")
			.attr("transform", "translate(0," + h + ")")
			.call(xAxis)
			.append("text")
				.attr("class", "x-axis-Label")
				.attr("fill", "#000")
				.attr("x", w/2)
				.attr("y", 40)
				.attr("dx", "0.71em")
				.attr("text-anchor", "end")
				.text("Miles Along Route");
		differChart.append("g")
			.attr("class", "axis x-axis-top")
			.call(xAxisTop);
		
		//Differ Y_Axis:
		differChart.append("g")
			.attr("class", "axis y-axis")
			.call(yAxis)
			.append("text")
				.attr("class", "y-axis-Label")
				.attr("fill", "#000")
				.attr("transform", "rotate(-90)")
				.attr("x", -h/2)
				.attr("y", -57)
				.attr("dy", "0.71em")
				.attr("text-anchor", "middle")
				.text("Speed (mph)");
		differChart.append("g")
			.attr("class", "axis y-axis-right")
			.attr("transform", "translate(" + w + ",0)")
			.call(yAxisRight);
	};
	
	//Update Comparison Line Chart
	function differChartRender() {
		var measure = "AVG_SP",
			fill = "#f16913",
			differYear = "12",
			data = CTPS.INRIX.storeDiffer;
		
		function differ() {
			var diffLine = d3.line()
				.x(function(d) { return xScale((+d.START_DISTANCE)+(+d.DISTANCE)-((+d.DISTANCE)/2)); })
				.y(function(d) { return yScale(d[measure]); });
			
			//Update line on differ chart
			var line = differChart.selectAll(".differLine"+differYear)
				.datum(data)
				.transition().duration(500).ease(d3.easeLinear)
					.attr("d", diffLine);
			
			//Update dots on differ chart
			var dots = differChart.selectAll(".dot"+differYear)
				.data(data);
			dots.exit()
					.style("fill", "none")
				.transition().duration(500).ease(d3.easeLinear)
					.attr("x", w+100)
					.style("fill-opacity", 1e-6)
					.remove();
			dots.style("fill-opacity", 1)
					.attr("TMC", function(d) { return d.TMC })
					.style("fill", fill)
					.on("mouseleave", function(d) { 
						tipDiffer.hide(d);
						d3.select(this).attr("r", 5);
							//.style("fill", fill);
					})
					.on("click", function(d) {
						highlightBar(d);
					})
				.transition().duration(500).ease(d3.easeLinear)
					.attr("r", 5)
					.attr("cx", function(d) { 
						return xScale((+d.START_DISTANCE)+(+d.DISTANCE)-((+d.DISTANCE)/2)); 
					})
					.attr("cy", function(d) { return yScale(d[measure]); });				
			dots.enter()
				.append("circle")
					.attr("class", "dot"+differYear)
					.attr("TMC", function(d) { return d.TMC })
					.attr("r", 5)
					.attr("cx", function(d) { 
						return xScale((+d.START_DISTANCE)+(+d.DISTANCE)-((+d.DISTANCE)/2));
					})
					.attr("cy", function(d) { return yScale(d[measure]); })
					.on("mouseenter", function(d) { 
						tipDiffer.show(d); 
						d3.select(this).attr("r", 10);
							//.style("fill", "brown");
					})
					.on("mouseleave", function(d) { 
						tipDiffer.hide(d);
						d3.select(this).attr("r", 5);
							//.style("fill", fill);
					})
					.on("click", function(d) {
						highlightBar(d);
					})
				.transition().duration(500).ease(d3.easeLinear)
					.style("fill-opacity", 1)
					.style("fill", fill);
		};
		
		differ.measure = function(value) {
			if (!arguments.length) return measure;
			measure = value;
			return differ;
		};
		
		differ.fill = function(value) {
			if (!arguments.length) return fill;
			fill = value;
			return differ;
		};
		
		differ.differYear = function(value) {
			if (!arguments.length) return differYear;
			differYear = value;
			return differ;
		};
		
		differ.data = function(value) {
			if (!arguments.length) return data;
			data = value;
			return differ;
		};
		
		return differ;
		
	};
	var renderDiffer = differChartRender();
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** Accessible Table ***/////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////

	function renderTable(dataStore) {
		// Clear out previous table (if any).
		$('#table').empty();
		
		// Column descriptors for table.
		var columnDesc =  [ //TMC descriptors
							{ header : 	'Community', dataIndex : 'COMMUNITY', colHeaderClass : 'community_cols' },
							{ header : 	'Beginning at',	dataIndex : 'SEG_BEGIN', colHeaderClass : 'begin_end_cols' },
							{ header : 	'Ending at', dataIndex : 'SEG_END', colHeaderClass : 'begin_end_cols' },    
							{ header : 	'Length (mi)', dataIndex : 'DISTANCE', colHeaderClass: 'distance_cols' },
							{ header :	'Number of Lanes', dataIndex: 'LANES', colHeaderClass: 'lanes_cols' },
							{ header : 	'Speed Limit (mph)', dataIndex: 'SPD_LIMIT', colHeaderClass: 'spd_limit_cols' },
							// Stats
							{ header : 	'Average Speed (mph)', dataIndex : 'AVG_SP', colHeaderClass: 'avg_sp_cols' },
							{ header : 	'Speed Index',	dataIndex : 'SPD_IX', colHeaderClass: 'spd_ix_cols' },
							{ header : 	'Congested Time (minutes)',	dataIndex : 'CONG_MN', colHeaderClass: 'cong_mn_cols' },						
							{ header : 	'Delay Per Mile (seconds)',	dataIndex : 'DEL_MI', colHeaderClass: 'del_mi_cols' },
							{ header : 	'Average Travel-Time Index', dataIndex : 'AVTT_IX', colHeaderClass: 'avtt_ix_cols' }
						];

		var szSummary = 'Columns are: community, beginning location, ending location, ';
		szSummary += 'length (mi), number of lanes, speed limit (mph), ';
		szSummary += 'AM average speed (mph), AM speed index, AM delay per mile (sec), AM congested time (min), AM average travel-time index, ';
		szSummary += 'PM average speed (mph), PM speed index, PM delay per mile (sec), PM congested time (min), and PM average travel-time index. ';
		
		var speedGrid = new AccessibleGrid(  { divId 	:	'table',
													  tableId 	:	't1',
													  summary	: 	szSummary,
													  caption	:	'',
													  colDesc	: 	columnDesc } );	
		speedGrid.loadArrayData(dataStore); 

		//Add TMC-based classes to <tr>
		//Needed in order to do on.click/on.hover across divs (b/c is based on TMC)
		var dataStoreTMC = [];
		for (i=0; i<dataStore.length; i++) {
			dataStoreTMC.push(dataStore[i].TMC);
		};
		for (i=1; i<dataStoreTMC.length; i++) {
			var row = document.getElementById("t1_r_"+i.toLocaleString())
			row.parentElement.className += dataStoreTMC[i-1];
		};	
			
		//On-Click Handler for Table
		$("td").on("click", function(e) { 
			var tmc = [];
			tmc.TMC = this.parentNode.className;
			highlightBar(tmc);
		});
		
		//Hover Event Handler for Table
		$("tr").on("mouseenter", function(e) {
			this.style.backgroundColor = "#4CAF50";
		});
		$("tr").on("mouseleave", function(e) {
			($(this).is(":nth-child(even)")) ? this.style.backgroundColor = "#f2f2f2" : this.style.backgroundColor = "#fff";
		});
	};
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** Data Bind and Access Functions ***///////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	//Function to collect "clicked" elements
	function collectClicked() {
		var clicked = [];
		for (i=0; i<buttonIDs.length; i++) {
			if ($(buttonIDs[i]).hasClass("clicked")) {
				clicked.push($(buttonIDs[i]).attr("value"));
			};
		};
		
		//Debug - clicked = [year, time, measure, route, direction]
		//console.log(clicked);
		
		return	{	"year" : +clicked[0],
					"time" : clicked[1],
					"measure" : clicked[2],
					"route" : clicked[3],
					"direction" : clicked[4],
					"routeFull" : clicked[3] + "_" + clicked[4],
					"perfMeas" : clicked[1] + "_" + clicked[2] 
				};
	};
	
	//Function to Register and Bind "clicked" data for Chart and Legend
	function displayChart(dataStore, year, time, measure, perfMeas, routeName) {
		//Hide or Show/Render Differ Chart
		switch(year) { 
			case DIFF:
				//Collect data from 2012 and 2015 and render Differ Chart
				differDataSelector();
				$("#differChart").show();
				break;
			default:
				$("#differChart").hide();
		};
		
		//Update y-axis label, scales, tip, palette
		var u = lookupPerfMeas(year, dataStore, measure);
		var yScaleDomain;
		if (u.yScaleDomain[0] < 0 && u.yScaleDomain[1] < 0) {
			yScaleDomain = [Math.min.apply(null, u.yScaleDomain), 0];
		} else if (u.yScaleDomain[0] > 0 && u.yScaleDomain[1] > 0) {
			yScaleDomain = [0, Math.max.apply(null, u.yScaleDomain)];
		} else {
			yScaleDomain = u.yScaleDomain;
		};
		yScale.domain(yScaleDomain);
		xScale.domain([0, d3.max(dataStore, function(d) { 
			return ((+d.START_DISTANCE)+(+d.DISTANCE)); 
		})]);
		var end_perf = "";
		if (measure === "AVG_SP") { 
			end_perf = " mph";
		} else if (measure === "CONG_MN") { 
			end_perf = " minutes";
		} else if (measure === "DEL_MI") {
			end_perf = " seconds";
		};
		tip.html(function(d) { return "<strong>Segment Begin: " + d.SEG_BEGIN + 
									  "<br>Segment End: " + d.SEG_END + 
									  //"<br>TMC: " + d.TMC +
									  "<br><br>" + u.tipHTML + parseFloat((+d[measure]).toFixed(3)) + end_perf + "</strong>"; });
		tipDiffer.html(function(d) { return "<strong>Segment Begin: " + d.SEG_BEGIN + 
											"<br>Segment End: " + d.SEG_END + 
											//"<br>TMC: " + d.TMC +
											 "<br><br>" + u.tipDifferHTML + parseFloat((+d[measure]).toFixed(3)) + end_perf + "</strong>"; });
		$(".y-axis-Label").text(function() { return u.yAxisLabel });
		
		//Update, Select and Call chart functions
		renderChart.data(dataStore)
			.year(year)
			.measure(measure)
			.palette(u.palette);
		renderBarLegend.year(year)
			.measure(measure)
			.palette(u.palette);
			
		//Update Chart
		d3.select("chart").call(renderChart);
		
		//Update Legend
		d3.select("legend").call(renderBarLegend);
		
		//Update Title
		//Example: "I495 Northbound, AM Average Speed, 2015"
		$("#title").html(routeName + "<br>" + time + " " + perfMeasName[measure] + "<br>" + $("#"+year).text());
		
	};				
	
	//Function to order data returned from Geoserver based on "FROM_MEAS", "DISTANCE"
	function orderData(aFeaturesGeo, time) {
		dataStore = [];
		var attrs = [];
		for (i=0; i<aFeaturesGeo.length; i++) {
			attrs = aFeaturesGeo[i].getProperties();
			if (time === "AM") {
				dataStore[i] = { //TMC selectors 
										'TMC'			: attrs.tmc,
										'FROM_MEAS'		: attrs.from_meas,
										'TO_MEAS'		: attrs.to_meas,
											//'ROUTE_NUM'		: attrs.route_num,
										'COMMUNITY'		: attrs.community,
										'SEG_BEGIN'		: attrs.seg_begin,
										'SEG_END'		: attrs.seg_end, 
										'DISTANCE'      : attrs.distance.toFixed(3),
										'LANES'			: attrs.lanes,
										'SPD_LIMIT'		: attrs.spd_limit,
										// AM stats
										'AVG_SP'		: attrs.am_avg_sp.toFixed(3), 
										'SPD_IX'		: attrs.am_spd_ix.toFixed(3),
										'CONG_MN'		: attrs.am_cong_mn.toFixed(3),
										'DEL_MI'		: (attrs.am_del_mi*60).toFixed(3),
										'AVTT_IX'		: attrs.am_avtt_ix.toFixed(3),												
				};
			} else if (time === "PM") {
				dataStore[i] = { //TMC selectors 
										'TMC'			: attrs.tmc,
										'FROM_MEAS'		: attrs.from_meas,
										'TO_MEAS'		: attrs.to_meas,
											//'ROUTE_NUM'		: attrs.route_num,
										'COMMUNITY'		: attrs.community,
										'SEG_BEGIN'		: attrs.seg_begin,
										'SEG_END'		: attrs.seg_end, 
										'DISTANCE'      : attrs.distance.toFixed(3),
										'LANES'			: attrs.lanes,
										'SPD_LIMIT'		: attrs.spd_limit,											
										// PM stats
										'AVG_SP'		: attrs.pm_avg_sp.toFixed(3), 
										'SPD_IX'		: attrs.pm_spd_ix.toFixed(3),
										'CONG_MN'		: attrs.pm_cong_mn.toFixed(3),
										'DEL_MI'		: (attrs.pm_del_mi*60).toFixed(3),
										'AVTT_IX'		: attrs.pm_avtt_ix.toFixed(3)
				};
			};
		};
		// Order Data by "FROM_MEAS"
		//  Legacy comment from Mary McShane:
		//  Sort JS array by Town (source -- www.devcurry.com/2010/05/sorting-json-array.html)
		//  For some reason, this is not picking up the minus sign on the sort keys--ergo, 2 versions:
		function SortByFmeas(x,y) {            
			if(x.FROM_MEAS<0){                                   
					return ((y.FROM_MEAS == x.FROM_MEAS) ? 0 : ((y.FROM_MEAS > x.FROM_MEAS) ? 1 : -1 ));
			} else {
					return ((y.FROM_MEAS == x.FROM_MEAS) ? 0 : ((y.FROM_MEAS < x.FROM_MEAS) ? 1 : -1 ));
			}
		}; 
		dataStore.sort(SortByFmeas); 
		
		// Add the START_DISTANCE attribute to each record.
		// The addition of this attribute simplifies chart generation.
		var dCumDistance = 0; 
		for (i = 0; i < dataStore.length; i = i + 1) {
			dataStore[i].START_DISTANCE = dCumDistance;
			dCumDistance = dCumDistance + parseFloat(dataStore[i].DISTANCE);
		};
		
		return dataStore;
	}
	
	// Function to find center from bbox (from Ben K.)
	var boundsToCenter = function(oExtent) {
		// The Open Layers extent 'object' is an array consisting of:  minx, miny, maxx, maxy.
		var x = oExtent[0] + ((oExtent[2] - oExtent[0]) / 2);
		var y = oExtent[1] + ((oExtent[3] - oExtent[1]) / 2);
		return [x,y];
		// console.log('center: x = ' + x + ', y = ' + y);
	};
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** Generate Map ***/////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	function generateMap() {
		// Define Bounding Box and Centroid (projection	: 'EPSG:900913')
		//var oBounds = [-7977227.44431552, 5161339.777165381, -7856138.528599141, 5272334.418244198];
		//var oCenter = [-7916682.986457331, 5216837.09770479];
		var oExtent = [32300,785600,331000,960100];
		var oCenter = [182247,872580];
		
		var oBaseLayer = new ol.layer.Tile({	
			source: new ol.source.TileWMS({
				url		: szWMSserverRoot,
				params	: {
					'LAYERS': [	'postgis:ctps_oceanmask_poly_small',
								'postgis:mgis_nemask_poly',
								'postgis:mgis_townssurvey_polym',
								'postgis:ctps_ma_wo_model_area'	],
					'STYLES': [	'oceanmask_poly',
								'ne_states',
								'towns_blank',
								'non_boston_mpo_gray_mask'	]
				}
			})
		});
		
		var oExpRoutes = new ol.layer.Tile({	
			source: new ol.source.TileWMS({
				url		: szWMSserverRoot,
				params	: {
					'LAYERS': 'postgis:ctps_cmp_2015_exp_routes_ext',
					'STYLES': 'line'
				}
			})
		});
		
		var oArtRoutes = new ol.layer.Tile({	
			source: new ol.source.TileWMS({
				url		: szWMSserverRoot,
				params	: {
					'LAYERS': 'postgis:ctps_cmp_2015_art_routes_ext',
					'STYLES': ['line']
				}
			})
		});
		
		CTPS.INRIX.oHighlightLayer = new ol.layer.Vector({
			source	: new ol.source.Vector({
				wrapX: false 
			})
		});
		
		CTPS.INRIX.oTMCHighlightLayer = new ol.layer.Vector({
			source	: new ol.source.Vector({
				wrapX: false 
			})
		});
		
		var projection = new ol.proj.Projection({
			code: 'EPSG:26986',
			extent: [33861.26,777514.31,330846.09,959747.44],
			units: 'm'
		});
		ol.proj.addProjection(projection);
		var MaStatePlane = '+proj=lcc +lat_1=42.68333333333333 +lat_2=41.71666666666667 +lat_0=41 +lon_0=-71.5 +x_0=200000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
		ol.proj.addCoordinateTransforms(
			'EPSG:4326',
			projection,
			function(coordinate){
				var WGS_to_MAState = proj4(MaStatePlane).forward(coordinate);
				return WGS_to_MAState;
			},
			function(coordinate){
				var MAState_to_WGS = proj4(MaStatePlane).inverse(coordinate);
				return MAState_to_WGS;
			}
		);
		
		//Create Map <div id="mapDisplay"></div>
		oMap = new ol.Map({
			target	: 'mapDisplay',
			controls: ol.control.defaults().extend([
				new ol.control.ScaleLine({
					units	: 'us'
				})
			]),
			layers	: [	oBaseLayer, 
						oExpRoutes, 
						oArtRoutes,
						CTPS.INRIX.oTMCHighlightLayer,
						CTPS.INRIX.oHighlightLayer],
			view	: new ol.View({
				projection: projection,
				center	: [232908.27147578463, 902215.0940791398],
				//center	: ol.proj.transform([-71.147, 42.472], 'EPSG:4326', 'EPSG:26986'),
				zoom	: 3.0,
				minZoom	: 1.0,
				maxZoom	: 8.0
			})
		});	
				
		///////////////////////////////////////////////////////////////////////////////////////////////
		//*** Render OpenLayers Map and Generate Charts ***/////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////
		routeSelector(true);
		
	};
	
	///////////////////////////////////////////////////////////////////////////////////////
	//*** Event Handlers ***///////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////
	
	//Update App on Menu click
	function menuClick() {	
		$(".sublist a").click(function() {
			//Change button colors
			$(this).parent().children().removeClass("clicked");
			$(this).addClass("clicked");
			highlight();
			
			//Render Open Layer selected route and update Charts (conditional of OL success)
			routeSelector();
			
			//Remove highlighted elements by submitting empty array into highlight function
			highlightBar([]);

		});
	};
	
	// oMap onPointerMove, Popup, and onClick Handlers
	var mapEventHandle = function() {
		// Pointermove
		var hoverSelect = new ol.interaction.Select({
		  condition	: ol.events.condition.pointerMove,
		  layers	: [CTPS.INRIX.oHighlightLayer],
		  style		: new ol.style.Style({
						fill	: new ol.style.Fill({ 
									color: 'rgba(255,255,255,0.0)' 
								}), 
						stroke 	: new ol.style.Stroke({ 
									color: "brown",
									width: 10.0,
									lineCap: "butt"
								})
					})
		});
		oMap.addInteraction(hoverSelect);
		
		// Popup
		var popup = new ol.Overlay({
			element: document.getElementById('popup')
		});
		oMap.addOverlay(popup);
		
		var selectedFeatures = hoverSelect.getFeatures();
		selectedFeatures.on('add', function(e) {
			var pElement = popup.getElement();
			var feat = e.target.item(0);
			var tGeo = feat.getGeometry();
			var tCoord = tGeo.getCoordinates();
			popup.setPosition(tCoord[0][parseInt(tCoord[0].length/2)]);
			
			//http://stackoverflow.com/questions/2057682/determine-pixel-length-of-string-in-javascript-jquery
			var popupHTML_begin = "Segment Begin: " + feat.getProperties().seg_begin;
			var popupHTML_end = "Segment End: " + feat.getProperties().seg_end;
			c = collectClicked();
			var end_perf;
			if (c.measure === "AVG_SP") { 
				end_perf = ((+feat.getProperties()[c.perfMeas.toLowerCase()]).toFixed(3)).toLocaleString() + " mph";
			} else if (c.measure === "CONG_MN") { 
				end_perf = ((+feat.getProperties()[c.perfMeas.toLowerCase()]).toFixed(3)).toLocaleString() + " minutes";
			} else if (c.measure === "DEL_MI") {
				end_perf = ((+feat.getProperties()[c.perfMeas.toLowerCase()]*60).toFixed(3)).toLocaleString(); + " seconds";
			} else {
				end_perf = ((+feat.getProperties()[c.perfMeas.toLowerCase()]).toFixed(3)).toLocaleString();
			};
			var popupHTML_meas = c.time + " " + perfMeasName[c.measure] + ": " + end_perf;
			var popupHTML_length = Math.max(popupHTML_begin.length, popupHTML_end.length, popupHTML_meas.length);
			$("#popupTest").text(Array(popupHTML_length+1).join("e"));
			var popup_width = $("#popupTest").width();
			$("#popup").width(popup_width);
			
			pElement.innerHTML = "<strong>" + popupHTML_begin + 
								"<br>" + popupHTML_end + 
								//"<br>TMC: " + feat.getProperties().TMC +
								"<br><br>" + popupHTML_meas + "</strong>";
			$("#popup").show();
		});
		selectedFeatures.on('remove', function(e) {
			var pElement = popup.getElement();
			$("#popup").hide();
		});

		// Click
		oMap.on("click", function(e) {
			oMap.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
				//console.log(feature.getProperties().TMC);
				highlightBar(feature.getProperties());
			});	
		});
		
	};
	
	//Highlight matching TMCs on Click
	function highlightBar(d) {
		//Collect TMC
		var clickTMC = d.TMC;
		//console.log(clickTMC);
		
		//Highlight Bar Chart
		$(".speedBars").each(function(i) {
			if ( this.__data__.TMC === clickTMC ) {
				this.style.stroke = "brown";
				this.style.strokeWidth = "3px";
				this.style.zIndex = 10;
			} else {
				this.style.stroke = "none";
				this.style.zIndex = 1;
			};
		});
		
		//Highlight Line Chart (only shown for differ viz) 
		$(".dot12").each(function(i) {
			if ( this.__data__.TMC === clickTMC ) {
			  this.style.stroke = "brown";
			  this.style.strokeWidth = "3px"
			} else {
			  this.style.stroke = "none";
			  this.style.fill = "#f16913";
			};
		});
		$(".dot15").each(function(i) {
			if ( this.__data__.TMC === clickTMC ) {
			  this.style.stroke = "brown";
			  this.style.strokeWidth = "3px"
			} else {
			  this.style.stroke = "none";
			  this.style.fill = "#1f78b4";
			};
		});	
		
		//Highlight Table
		$("tr").each(function(i) {
			if ( this.className === clickTMC ) {
				this.style.border = "3px solid brown";
			} else {
				this.style.border = "none";
			};
		});
		
		//Highlight Map
		highlightSelector(clickTMC);
		
	};
		
	//Reset scales and svgs when window resizes
	//http://eyeseast.github.io/visible-data/2013/08/28/responsive-charts-with-d3/
	function resizeSVGs() {
		//Update width(s)
		w = Math.abs(parseInt(d3.select('.columnRight').style('width'), 10));
		w = w - chartMargin.left - chartMargin.right;
		legend_w = Math.abs(parseInt(d3.select('.chartLegend').style('width'), 10));
		
		//Update xScale Range, yAxisLines length
		 xScale.range([0, w]);
		 yAxisLines.tickSizeInner(-w)
		 
		//Map automatically resizes thanks to OpenLayers, therefore not included here
		
		//Resize Axes
		xAxis.scale(xScale);
		chart.select(".x-axis")
			.call(xAxis);
		chart.select(".x-axis-top")
			.call(xAxisTop);
		chart.select(".x-axis-Label")
			.attr("x", w/2);	
		chart.select(".y-axis-right")
			.attr("transform", "translate(" + w + ",0)");
		
		differChart.select(".x-axis")
			.call(xAxis);
		differChart.select(".x-axis-top")
			.call(xAxisTop);
		differChart.select(".x-axis-Label")
			.attr("x", w/2);
		differChart.select(".y-axis-lines")
			.call(yAxisLines);
		differChart.select(".y-axis-right")
			.attr("transform", "translate(" + w + ",0)");
		
		//Resize the Bar Chart
		d3.select("#barChart")
			.attr('width', (w + chartMargin.left + chartMargin.right) + 'px');
		
		chart.selectAll('rect')
			.attr("width", function(d) { 
				return xScale(+d.DISTANCE);
			})
			.attr("x", function(d) {
				return xScale(+d.START_DISTANCE);
			});
		
		//Resize SVG, Circles, Rects on Differ Line Chart
		d3.select("#differChart")
			.attr('width', (w + chartMargin.left + chartMargin.right) + 'px');
		
		differChart.selectAll("circle")
			.attr("cx", function(d) { 
				return xScale((+d.START_DISTANCE)+(+d.DISTANCE)-((+d.DISTANCE)/2)); 
			});
		differChart.selectAll("rect")
			.attr("width", function(d) { 
				return xScale(+d.DISTANCE);
			})
			.attr("x", function(d) {
				return xScale(+d.START_DISTANCE);
			});
		
		//Resize Line on Differ Line Chart
		differDataSelector();
		
		//Resize the Bar Chart Legend
		d3.select("#chartLegend")
			.attr('width', legend_w);
		
		var c = collectClicked();
		var paletteLength;
		switch(c.year) {
			case DIFF:
				paletteLength = 6;
				break;
			default:
				switch(c.measure) {
					case "AVG_SP":
						paletteLength = 6;
						break;
					case "SPD_IX":
						paletteLength = 5;
						break;
					default:
						paletteLength = 4;					
				};
		};
		var legendWidth = legend_w/paletteLength;

		legend.selectAll(".legendRect")
				.attr("x", function(d, i) { return i*legendWidth; })
				.attr("width", legendWidth);
		legend.selectAll(".legendTick")
			.attr("x", function(d, i) { return i*legendWidth; });
		legend.selectAll("#legend text")
			.attr("x", function(d, i) { return legendWidth+(i*legendWidth); });
		
		//Resize the Speed Limit and Comparator Legends
		d3.select("#speedLimitLegend")
			.attr('width', legend_w);
		spdLmtLegend.selectAll("rect")
			.attr("width", Math.abs(legend_w - 115));		

		d3.select("#differLegend")
			.attr('width', legend_w);
		diffLegend.selectAll("rect")
			.attr("x", $("#diffLegendTest").width())
			.attr("width", Math.abs(legend_w - $("#diffLegendTest").width()));
		diffLegend.selectAll("circle")
			.attr("cx", Math.abs(legend_w + $("#diffLegendTest").width())/2);
		
		$('.sublist').width(
			$('.columnLeft').width()*0.5
		);
		
		//Update YScale and yAxisLines
		var c = collectClicked();
		var u = lookupPerfMeas(c.year, CTPS.INRIX.dataStore, c.measure);
		var yScaleDomain;
		if (u.yScaleDomain[0] < 0 && u.yScaleDomain[1] < 0) {
			yScaleDomain = [Math.min.apply(null, u.yScaleDomain), 0];
		} else if (u.yScaleDomain[0] > 0 && u.yScaleDomain[1] > 0) {
			yScaleDomain = [0, Math.max.apply(null, u.yScaleDomain)];
		} else {
			yScaleDomain = u.yScaleDomain;
		};
		yScale.domain(yScaleDomain);
		yAxisLines.tickSizeInner(-w)
		chart.select(".y-axis-lines")
			.call(yAxisLines);
	};
	
	//Reset Application Button
	$("#reset_button").on("click", function() {
		location.reload();
	});
	
	//Download Data Button
	var initDownloadButton = function() {
		$('.spanForButtonWithLink').each(function() { 
			$(this).click(function() {
				location = $(this).find('a').attr('href');
			});	
		}); // end each()
		
		var szUrl = szWFSserverRoot + '?';  
		szUrl += "&service=wfs";
		szUrl += "&version=1.0.0";
		szUrl += "&typename=postgis:ctps_cmp_2014_exp_routes_ext";
		szUrl += "&request=getfeature";
		szUrl += "&outputFormat=csv";
		szUrl += "&propertyname=route_num,direction,community,seg_begin,seg_end,distance,lanes,spd_limit,";
		szUrl += "am_cong_sp,am_avg_sp,am_spd_ix,am_avtt_ix,am_5ptt_ix,am_del_mi,am_cong_mn,";
		szUrl += "pm_cong_sp,pm_avg_sp,pm_spd_ix,pm_avtt_ix,pm_5ptt_ix,pm_del_mi,pm_cong_mn"; 

		$("#downloadAnchorTag_2012").attr("href", szUrl);
		
		var szUrl = szWFSserverRoot + '?';  	
		szUrl += "&service=wfs";
		szUrl += "&version=1.0.0";
		szUrl += "&typename=postgis:ctps_cmp_2015_exp_routes_ext";
		szUrl += "&request=getfeature";
		szUrl += "&outputFormat=csv";
		szUrl += "&propertyname=route_num,direction,community,seg_begin,seg_end,distance,lanes,spd_limit,";
		szUrl += "am_cong_sp,am_avg_sp,am_spd_ix,am_avtt_ix,am_5ptt_ix,am_del_mi,am_cong_mn,";
		szUrl += "pm_cong_sp,pm_avg_sp,pm_spd_ix,pm_avtt_ix,pm_5ptt_ix,pm_del_mi,pm_cong_mn"; 
		
		$("#downloadAnchorTag_2015").attr("href", szUrl);
	};
	
	// Help Button
	//$("#help_button").on("click", function() {
		//url = 'HelpText.html'
		//window.open(url,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes')
	//});
	
	// Background Button
	$("#background_button").on("click", function() {
		url = 'Background.html'
		window.open(url,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes')
	});
	
	// Using the Application Button
	$("#usingApp_button").on("click", function() {
		url = 'UsingTheApplication.html'
		window.open(url,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes')
	});
	
	///////////////////////////////////////////////////////////////////////////////////////////////
	//*** Data Load ***////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////
	
	//Bind data, Generate Map, Charts, Legends
	generateMap();
	
	//Update Map, Charts, Legends on Menu click
	menuClick();
	
	//Bind oMap event handlers
	mapEventHandle();
	
	//Register Event Handlers for Download Buttons
	initDownloadButton();
	
	//Reset scales and svgs when window resizes
	d3.select(window).on("resize", function() {
		resizeSVGs();
	});
	
};
