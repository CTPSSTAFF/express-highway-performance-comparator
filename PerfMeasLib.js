/**
 * JS library written specifically for CMP_Comparator_App.
 *
 * Call "lookupPerfMeas" on click, and pass in year, measure, and data values.
 * When called, "lookupPerfMeas" returns values that allow for updates to:
 * 			yScale.domain,
 *			color palette for the bar chart and corresponding legend, 
 * 			tip.html and tipDiffer.html text,
 *			y-Axis label
 *
 * Example usage:
 *			var year = 2015,		
 *	 			dataStore = [ { AVG_SP : 52.782,
 * 								AVTT_IX : 1.118,
 * 								COMMUNITY : "CHELMSFORD",
 * 								CONG_MN : 0.000,
 * 								DEL_MI : 7.188,
 * 								DISTANCE : 0.605,
 * 								FROM_MEAS : 0,
 * 								LANES : 2,
 * 								SEG_BEGIN : "US-3",
 * 								SEG_END : "I-495",
 * 								SPD_IX : 0.960,
 * 								SPD_LIMIT : 55,
 * 								START_DISTANCE : 0,
 * 								TMC : "129+04268",
 * 								TO_MEAS : 1015.2825425 }
 * 							],
 *	 			measure = "AVG_SP";
 *			var u = lookupPerfMeas(year, dataStore, measure);
 *			var yScale = d3.scaleLinear()
 *						   .domain(u.yScaleDomain)
 *						   .range([400, 0]);
 *			var tip = d3.tip()
 *						.attr('class', 'd3-tip')
 *						.offset([-5, 0])
 *						.html(function(d) { return "Segment Begin: " + d.SEG_BEGIN + 
 *										 		   "<br>Segment End: " + d.SEG_END + 
 *										 		   "<br><br>" + u.tipHTML + parseFloat((+d[measure]).toFixed(2)) + "</strong>"; });
 *			var palette = u.palette;
 *
 *
 *  - EKE 5/3/17
 *
 */
 
(function() {
	
	var DIFF = 1215;
	
	return lookupPerfMeas = function(year, dataStore, measure) {
		switch(year) {
			case DIFF:
				switch(measure) {
					case "SPD_IX":
						return {
							"yScaleDomain" : [d3.min(dataStore, function(d) { return +d.SPD_IX; }),
											  d3.max(dataStore, function(d) { return +d.SPD_IX; })],
							"tipHTML" : "Change in Speed Index from 2012 to 2015: ",
							"tipDifferHTML" : "Speed Index: ",
							"palette" : d3.scaleThreshold()
											.domain([(-0.2),(-0.1),(-0.05),0,0.05])
											.range(["#00441b","#5aae61","#d9f0d3","#e7d4e8","#9970ab","#40004b"]),
							"yAxisLabel" : "Change in Speed Index" //(Average Speed/Posted Speed Limit)
						};
						break;
					case "CONG_MN":
						return {
							"yScaleDomain" : [d3.min(dataStore, function(d) { return +d.CONG_MN; }),
											  d3.max(dataStore, function(d) { return +d.CONG_MN; })],
							"tipHTML" : "Change in Congested Minutes from 2012 to 2015: ",
							"tipDifferHTML" : "Congested Minutes: ",
							"palette" : d3.scaleThreshold()
											.domain([(-30), (-15), 0, 15, 30])
											.range(["#00441b","#5aae61","#d9f0d3","#e7d4e8","#9970ab","#40004b"]),
							"yAxisLabel" : "Change in Congested Minutes" //(Minutes per Peak Period Hour Under 35mph)
						};
						break;
					case "DEL_MI":
						return {
							"yScaleDomain" : [d3.min(dataStore, function(d) { return +d.DEL_MI; }),
											  d3.max(dataStore, function(d) { return +d.DEL_MI; })],
							"tipHTML" : "Change in Delay per Mile from 2012 to 2015: ",
							"tipDifferHTML" : "Delay per Mile: ",
							"palette" : d3.scaleThreshold()
											.domain([(-30),(-15),0,(15),(30)])
											.range(["#00441b","#5aae61","#d9f0d3","#e7d4e8","#9970ab","#40004b"]),
							"yAxisLabel" : "Change in Delay per Mile"	//(Seconds per Mile)
						};
						break;
					case "AVTT_IX":
						return {
							"yScaleDomain" : [d3.min(dataStore, function(d) { return +d.AVTT_IX; }),
											  d3.max(dataStore, function(d) { return +d.AVTT_IX; })],
							"tipHTML" : "Change in Average Travel Time from 2012 to 2015: ",
							"tipDifferHTML" : "Average Travel Time Index: ",
							"palette" : d3.scaleThreshold()
											.domain([(-0.1),(-0.05),0,0.05,0.1])
											.range(["#00441b","#5aae61","#d9f0d3","#e7d4e8","#9970ab","#40004b"]),
							"yAxisLabel" : "Change in Average Travel Time Index" //(Peak-Period Travel Time/Free-Flow Travel Time)
						};
						break;
					default: //aka (case "AVG_SP":)
						return {
							"yScaleDomain" : [d3.min(dataStore, function(d) { return +d.AVG_SP; }),
											  d3.max(dataStore, function(d) { return +d.AVG_SP; })],
							"tipHTML" : "Change in Average Speed from 2012 to 2015: ",
							"tipDifferHTML" : "Average Speed: ",
							"palette" : d3.scaleThreshold()
											.domain([(-10), (-5), 0, 5, 10])
											.range(["#00441b","#5aae61","#d9f0d3","#e7d4e8","#9970ab","#40004b"]),
							"yAxisLabel" : "Change in Speed (mph)"
						};
						break;
				};
				break;
			default: // aka (case 2012:) and (case 2015:)
				switch(measure) {
					case "SPD_IX":
						return {
							"yScaleDomain" : [0,2.2],
							"tipHTML" : "Speed Index: ",
							"tipDifferHTML" : "",
							"palette" : d3.scaleThreshold()
											.domain([0.4, 0.5, 0.7, 0.9])
											.range(["#d33194", "#894b9e","#3f6db5", "#80aedd", "#c2d1eb"]),
							"yAxisLabel" : "Speed Index" //(Average Speed/Posted Speed Limit)
						};
						break;
					case "CONG_MN":
						return {
							"yScaleDomain" : [0, d3.max(dataStore, function(d) { return +d.CONG_MN; })],
							"tipHTML" : "Congested Minutes: ",
							"tipDifferHTML" : "",
							"palette" : d3.scaleThreshold()
											.domain([15,30,45])
											.range(["#b3dbb5", "#68a695", "#cd8aab", "#893d97"]),
							"yAxisLabel" : "Congested Minutes" //(Minutes per Peak Period Hour Under 35mph)
						};
						break;
					case "DEL_MI":
						return {
							"yScaleDomain" : [0, d3.max(dataStore, function(d) { return +d.DEL_MI; })],
							"tipHTML" : "Delay per Mile: ",
							"tipDifferHTML" : "",
							"palette" : d3.scaleThreshold()
											.domain([15,45,90])
											.range(["#bf812d", "#f6e8c3", "#80cdc1", "#01665e"]),
							"yAxisLabel" : "Delay per Mile" //(Seconds per Mile)
						};
						break;
					case "AVTT_IX":
						return {
							"yScaleDomain" : [0, d3.max(dataStore, function(d) { return +d.AVTT_IX; })],
							"tipHTML" : "Average Travel Time: ",
							"tipDifferHTML" : "",
							"palette" : d3.scaleThreshold()
											.domain([1,1.3,2])
											.range(["#b3dbb5", "#68a695", "#cd8aab", "#893d97"]),
							"yAxisLabel" : "Average Travel Time Index" //(Peak-Period Travel Time/Free-Flow Travel Time)
						};
						break;
					default: //aka (case "AVG_SP":)
						return {
							"yScaleDomain" : [0,75],
							"tipHTML" : "Average Speed: ",
							"tipDifferHTML" : "",
							"palette" : d3.scaleThreshold()
											.domain([25,35,45,50,55])
											.range(["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"]),
							"yAxisLabel" : "Speed (mph)"
						};
						break;
				};
		};
	};
})();