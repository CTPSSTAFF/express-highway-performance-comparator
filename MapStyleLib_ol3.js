/**
 * JS library written specifically for CMP_Comparator_App.
 *
 * IMPORTANT --> Use of this library requires OpenLayers 3 or 4
 *
 * Call "lookupMapStyle" to return an OpenLayers StyleMap that can be used
 * to render the requested route based on the selected:
 * 			year (2012, 2015, or "DIFF"=1215),
 * 			measure ("AVG_SP", "SPD_IX", "CONG_MN", "DEL_MI", "AVTT_IX"),
 *			CMP time ("AM" or "PM")
 *
 * Example usage:
 *			var year = 2015,
 *	 			measure = "AVG_SP",
 *				time = "AM";
 *			var oStyle = lookupMapStyle(year, measure, time);
 *			oHighlightLayer.styleMap = oStyle;
 *
 *  - EKE 5/3/17
 * 
 * Code re-factored. 10/25/2017 -- BK
 *
 */
 
(function() {
	
	return lookupMapStyle = function (year, measure, time) {
		
		// Get attribute name: map (time, measure) into attribute name.
		// In the ArcSDE/Oracle world this is - I think - just the identity function.
		// In the PostGIS/PostgreSQL world, attribute names are in lower case.
		// I could have simply down-cased <time> + '_' + <measure>, but have chosen
		// to use a set of key/value pairs to perform the mapping in case it turns
		// out that the mapping is more complex/subtle in some cases in future.
		var oAttrNames = {
			'AM_AVG_SP'  : 'am_avg_sp',
			'PM_AVG_SP'  : 'pm_avg_sp',
			'AM_SPD_IX'  : 'am_spd_ix',
			'PM_SPD_IX'  : 'pm_spd_ix',
			'AM_CONG_MN' : 'am_cong_mn',
			'PM_CONG_MN' : 'pm_cong_mn',
			'AM_DEL_MI'  : 'am_del_mi',
			'PM_DEL_MI'  : 'pm_del_mi',
			'AM_AVTT_IX' : 'am_avtt_ix',
			'PM_AVTT_IX' : 'pm_avtt_ix'
		};
		var attrName = oAttrNames[time + '_' + measure];
		
		// Map <measure> into appropriate threshold scale.
		// There are two sets of such mappings: one for "real" annual data, and one for comparative ("diff") data.
		// The scales for comparative data all share a common range.
		var diffRange = ["#00441b", "#5aae61", "#d9f0d3", "#e7d4e8", "#9970ab", "#40004b"];
		var oScales = {
			'annual' 	: {	'AVG_SP'  : d3.scaleThreshold().domain([25, 35, 45, 55, 65, Infinity])
														   .range(["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#4575b4", "#91bfdb"]),
							'SPD_IX'  : d3.scaleThreshold().domain([0.400, 0.500, 0.700, 0.900, Infinity])
														   .range(["#d33194", "#894b9e", "#3f6db5", "#80aedd", "#c2d1eb"]),
							'CONG_MN' : d3.scaleThreshold().domain([15, 30, 45, Infinity])
														   .range(["#b3dbb5", "#68a695", "#cd8aab", "#893d97"]),
							'DEL_MI'  : d3.scaleThreshold().domain([0.250, 0.750, 1.500, Infinity])
														   .range(["#bf812d", "#f6e8c3", "#80cdc1", "#01665e"]),
							'AVTT_IX' : d3.scaleThreshold().domain([1.150, 1.300, 2.000, Infinity])
														   .range(["#b3dbb5", "#68a695", "#cd8aab", "#893d97"])								   
						},
			'diff'		: {	'AVG_SP'  : d3.scaleThreshold().domain([-10, -5, 0, 5, 10, Infinity])
														   .range(diffRange),
							'SPD_IX'  : d3.scaleThreshold().domain([-0.2, -0.1, -0.05, 0, 0.05, Infinity])
														   .range(diffRange),
							'CONG_MN' : d3.scaleThreshold().domain([-30, -15, 0, 15, 30, Infinity])
														   .range(diffRange),
							'DEL_MI'  : d3.scaleThreshold().domain([(-1/6), (-1/12), 0, (1/12), (1/6)])
														   .range(diffRange),
							'AVTT_IX' : d3.scaleThreshold().domain([(-0.1), (-0.05), 0, 0.05, 0.1, Infinity])
														   .range(diffRange)
						}
		};
		
		oScaleType =  {
			'2012'	: 'annual',
			'2015'	: 'annual',
			'1215'	: 'diff'
		};
		
		var scale = oScales[oScaleType[year.toString()]][measure];
		
		return 	function(feature) {
					var val = feature.get(attrName);
					var strokeColor = scale(val);
					return [new ol.style.Style({ fill	: new ol.style.Fill({ color: 'rgba(255,255,255,0.0)' }), 
												 stroke : new ol.style.Stroke({ color: 	strokeColor,
																						width: 10.0,
																						lineCap: "butt" })
											})];	
				};
		
	} /* lookupMapStyle() */
	 
})();
 
 
