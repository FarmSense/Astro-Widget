/**
*
* astro_widget.js
* a configurable widget you can use to present day length and moon phase data about your location
*
* @inputs script tag accepts location name, lat & lon values
*
* @author Mark Thompson <mark@smithandthompson.net>
* @copyright Smith & Thompson, Inc. 2011
*
* Smith & Thompson, Inc.
* http://www.smithandthompson.net
* 
* Thanks to: 
*	Kent Brewster for his clear and inspiring examples <http://kentbrewster.com/case-hardened-javascript/>
* 	Eric Miraglia for the Javascript Module Pattern <http://yuiblog.com/blog/2007/06/12/module-pattern/>
* 	Dustin Diaz for the excellent JSON article <http://www.dustindiaz.com/json-for-the-masses/>
*	and James Edwards for his generic onload pattern <http://www.brothercake.com/site/resources/scripts/onload/>	
*
**/

// wrap everything in an anonymous function
( function() {

	// create a random character name to protect our root global namespace
	var randName = '';
	for (var i = 0; i < 16; i++) {
		randName += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
	}
	
	// create our namespace object
	window.randName= {};
	//var window.randName = window.randName;
	
	window.randName.f = function() {
			return {
				
				// inititialize everything
				init : function(target) {
					var theScripts = document.getElementsByTagName('SCRIPT');
					for (var i = 0; i < theScripts.length; i++) {
						if (theScripts[i].src.match(target)) {
							window.randName.w = document.createElement('DIV');
							window.randName.w.setAttribute("id", "fs_astro_widget");
							
							// parse the script tag for params in json format
							window.randName.a = {};
							if (theScripts[i].innerHTML) {
								window.randName.a = window.randName.f.parseJson(theScripts[i].innerHTML);
							}
							
							if (window.randName.a.err) {
								alert('bad json!');
							}
							
							// set defaults & assign params where set
		
							// location name
							window.randName.f.locname = "My Moon Badge";
							if( typeof window.randName.a.location == "string"){
								window.randName.f.locname = window.randName.a.location;
							}
							
							// latitude
							window.randName.f.lat = 0.0;
							if( typeof window.randName.a.lat == "number"){
								window.randName.f.lat = window.randName.a.lat;
							}
							
							// longitude
							window.randName.f.lon = 0.0;
							if( typeof window.randName.a.lon == "number"){
								window.randName.f.lon = window.randName.a.lon;
							}
														
							// timezone
							window.randName.f.timezone = 'America%2FNew_York';
							if( typeof window.randName.a.timezone == "string"){
								window.randName.f.timezone = window.randName.a.timezone;
							}
							
							
							// font
							window.randName.f.fontFamily = "Arial, Helvetica, sans-serif";
							if( typeof window.randName.a.font == "string"){
								window.randName.f.fontFamily = window.randName.a.font;
							}
							
							// background color
							window.randName.f.backgroundColor = "#fff";
							if( typeof window.randName.a.bgcolor == "string"){
								//window.randName.w.style.backgroundColor = $.a.bgcolor;
								window.randName.f.backgroundColor = window.randName.a.bgcolor;
							}
							
							
							// theme
							window.randName.f.theme = "default";
							if( typeof window.randName.a.theme == "string"){
								window.randName.f.theme = window.randName.a.theme;
							}
						
							window.randName.f.date = new Date();
							window.randName.f.dayLength.getDayLength(window.randName.f.date,window.randName.f.lat,window.randName.f.lon,window.randName.f.timezone);
							
							// set & clear script
							theScripts[i].parentNode.insertBefore(window.randName.w, theScripts[i]);
							theScripts[i].parentNode.removeChild(theScripts[i]);
							break;
						}
					}
				},
				

				
				// parse the json script tag parameters
				parseJson : function(json) {
					this.parseJson.data = json;
					if ( typeof json !== 'string') {
						return {"err":"trying to parse a non-string JSON object"};
					}
					try {
						var f = Function(['var document,top,self,window,parent,Number,Date,Object,Function,',
								'Array,String,Math,RegExp,Image,ActiveXObject;',
								'return (' , json.replace(/<\!--.+-->/gim,'').replace(/\bfunction\b/g,'function�') , ');'].join(''));
						return f();
					} catch (e) {
						return {"err":"trouble parsing JSON object"};
					}
				},
				
				dayLength : {
					
					getDayLength : function(dt,lat,lon,tz){
						var date = Number(dt)/1000|0;
					
						// the url of the script we're calling
						var url = "http://api.farmsense.net/v1/daylengths/?d="+date+"&lat="+lat+"&lon="+lon+"&tz="+tz.replace('/','%2F')+"&callback=window.randName.f.dayLength.parseRequest";
						
						//alert(url);
						
						// create a new script element
						var script = document.createElement('script');
						// set the src attribute to that url
						script.setAttribute('src', url);
						// insert the script in out page
						window.randName.w.appendChild(script);
					},
 
					// parse responses
					parseRequest: function(data){
					
						var d = data;
						
						//console.log(d[0]);
						
						if(d[0].Error){
							alert(d[0].Error + ' : ' + d.ErrorMessage);
						} else {
							var dl = '';
							var dd = null;
							if(d[0].day != undefined){
								dl = 'Hours until Dusk';
								dd = d[0].day;
							} else if(d[0].night != undefined){
								dl = 'Hours Until Dawn';
								dd = d[0].night;
							} else {
								alert(dl + ' is undefined.');
							}
																			
							/* build the day object */
						
							window.randName.f.dawn = d[0].Dawn;
							window.randName.f.dusk = d[0].Dusk;
							window.randName.f.sunrise = d[0].Sunrise;
							window.randName.f.sunset = d[0].Sunset;
							window.randName.f.zenith = d[0].Zenith;
							window.randName.f.dayLength = d[0].Daylength;
							window.randName.f.dl = dl;
							window.randName.f.dd = dd;
						}
						
						try {// try to output this to the javascript console
							//console.log(data);
						} catch(an_exception) {// alert for the users that don't have a javascript console
							//alert(data);
						}
						
						// get the moonphase
						window.randName.f.moonPhase.getMoonPhase(window.randName.f.date);
					}
				},
				

				moonPhase : {
					// give it a random id so we can clean it up later
					id: ((new Date()).getTime() + "" + Math.floor(Math.random()*1000000)).substr(0,18),
					
					getMoonPhase : function(dt){
						var date = Number(dt)/1000|0;
					
						// the url of the script we're calling
						var url = "http://api.farmsense.net/v1/moonphases/?d="+date+"&callback=window.randName.f.moonPhase.parseRequest";
						
						//alert(url);
						
						// create a new script element
						var script = document.createElement('script');
						// set the id attribute to something random so we can clean up later without worrying
						script.setAttribute('id', this.id);
						// set the src attribute to that url
						script.setAttribute('src', url);
						// insert the script in out page
						window.randName.w.appendChild(script);
					},
 
					// parse responses
					parseRequest: function(data){
					
						var d = data;
						
						if(d.Error){
							alert(d[0].Error + ' : ' + d.ErrorMessage);
						} else {
							window.randName.f.phase = d[0].Phase;
							window.randName.f.moon = d[0].Moon;
							window.randName.f.index = d[0].Index;
							window.randName.f.illumination = d[0].Illumination;
							
							window.randName.f.drawWidget();
						}
					
						try {// try to output this to the javascript console
							//console.log(d);
						} catch(an_exception) {// alert for the users that don't have a javascript console
							//alert(data);
						}
						
						// delete the dynamic script tag to clean up
						element = document.getElementById(this.id);
						element.parentNode.removeChild(element);
					}
				},
								
				drawWidget : function(){
					// widget body
					var w = window.randName.w;
					
					// widget header
					w.td = document.createElement('DIV');
					w.td.setAttribute("class", "fs_header");
					w.appendChild(window.randName.w.td);

					// header h1
					w.td.t = document.createElement('H1');
					w.td.t.appendChild(document.createTextNode(window.randName.f.locname));
					w.td.appendChild(window.randName.w.td.t);
					
					// data table
				    w.tbl = document.createElement("table");
				    w.tbl.setAttribute("class", "fs_calender_day");
				    
				    w.tblB = document.createElement("tbody");

				    // creating all cells
				    for (var j = 0; j < 4; j++) {
				        w.row = document.createElement("tr");
				        
				        if(j==0){ // header
				        	w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_day");
				        	w.cell.setAttribute("colspan", "3");
							w.cell.innerHTML = '<h2 style="font-size:12px; text-align:center;">'+window.randName.f.date.toDateString()+'</h2>';
				        	
				        	//w.txtCell = document.createTextNode( window.randName.f.date.toDateString());
				        	//w.cell.appendChild(w.txtCell);
				        	
				        	w.row.appendChild(w.cell);
				        	
				        } else if(j==1){ // sunrise/moonphase/sunset
				        	w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_dawn");
				        	//w.txtCell = document.createTextNode('Dawn: ' + window.randName.f.dawn);
				        	//w.cell.appendChild(w.txtCell);
							w.cell.innerHTML = '<h3 style="font-size:12px;">Dawn</h3><p>'+window.randName.f.dawn+'</p>';
				        	w.row.appendChild(w.cell);
				        	
							w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_moonphase");
				        	w.cell.setAttribute("rowspan", "2");
				        	w.cell.innerHTML = '<h2 style="font-size:16px;">Moon Phase</h2><p>'
																+window.randName.f.phase+' in '
																+window.randName.f.moon+'</p><img src="http://www.farmsense.net/demos/images/moonphases/'
																+window.randName.f.index+'.png" />'
																+'<p>'+(Math.round(window.randName.f.illumination*100))+'% of Full</p>'; //= document.createTextNode('Moon Phase: ' + window.randName.f.phase);
				        	//w.cell.appendChild(w.txtCell);
				        	w.row.appendChild(w.cell);
				        	
				          	w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_dusk");
				        	//w.txtCell = document.createTextNode('Dusk: ' + window.randName.f.dusk);
				        	//w.cell.appendChild(w.txtCell);
							w.cell.innerHTML = '<h3 style="font-size:12px;">Dusk</h3><p>'+window.randName.f.dusk+'</p>';
				        	w.row.appendChild(w.cell);
							
				        	
				        } else if(j==2){ // dawn/moonphase/dusk
				        	w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_sunrise");
				        	//w.txtCell = document.createTextNode('Sunrise: ' + window.randName.f.sunrise);
				        	//w.cell.appendChild(w.txtCell);
							w.cell.innerHTML = '<h3 style="font-size:12px;">Sunrise</h3><p>'+window.randName.f.sunrise+'</p>';
				        	w.row.appendChild(w.cell);
				        	
				        	w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_sunset");
				        	//w.txtCell = document.createTextNode('Sunset: ' + window.randName.f.sunset);
				        	//w.cell.appendChild(w.txtCell);
							w.cell.innerHTML = '<h3 style="font-size:12px;">Sunset</h3><p>'+window.randName.f.sunset+'</p>';
				        	w.row.appendChild(w.cell);
				        	
				        } else if(j==3){ // zenith/day length/daylight remaining
				        	w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_zenith");
				        	//w.txtCell = document.createTextNode('Zenith: ' + window.randName.f.zenith);
				        	//.cell.appendChild(w.txtCell);
							w.cell.innerHTML = '<h3 style="font-size:12px;">Zenith</h3><p>'+window.randName.f.zenith+'</p>';
				        	w.row.appendChild(w.cell);
				        	
				        	w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_daylength");
				        	w.cell.setAttribute("rowspan", "2");
				        	//w.txtCell = document.createTextNode('Day Length: ' +window.randName.f.dayLength);
				        	//w.cell.appendChild(w.txtCell);
							w.cell.innerHTML = '<h2 style="font-size:16px;">Day Length</h2><p>'+window.randName.f.dayLength+'</p>';
				        	w.row.appendChild(w.cell);
				        	
				        	w.cell = document.createElement("td");
				        	w.cell.setAttribute("id", "fs_remaining");
				        	//w.txtCell = document.createTextNode( window.randName.f.dl + ': ' + window.randName.f.dd );
				        	//w.cell.appendChild(w.txtCell);
							w.cell.innerHTML = '<h3 style="font-size:12px;">'+window.randName.f.dl+'</h3>'+window.randName.f.dd;
				        	w.row.appendChild(w.cell);     
				     
				        }
				        
				        w.tblB.appendChild(w.row);
					}
				    
				    w.tbl.appendChild(w.tblB);
					w.appendChild(w.tbl);
					
					// table styles
					
					
					// set the copyright & linkback
					w.cd = document.createElement('DIV');
					w.cd.innerHTML = '<a style="font-size:x-small;" href="http://www.smithandthompson.net" title="See more widgets by S & T">Widget by S & T, 2011</a>';
					w.appendChild(window.randName.w.cd);
					//w.cd.c = document.createElement('A');
					//w.cd.c.setAttribute("href", "http://www.smithandthompson.net");
					//w.cd.c.setAttribute("title", "See more widgets by S & T");
					//w.cd.c.appendChild(document.createTextNode("Widget by S & T, 2011"));
					//w.cd.appendChild(window.randName.w.cd.c);
					
					window.randName.f.setTheme();
				},
				
				// set the theme (styles)
				setTheme : function(){
					var w = window.randName.w;
					
					switch(window.randName.f.theme){
						case 'none':
							break;
						default: 
					
							// widget body styles
							// font
							w.style.fontFamily = window.randName.f.fontFamily;
							// border
							w.style.border = '1px solid #000';
							// width
							w.style.width = "300px";		
							// height
							//w.style.height = "250px";		
							// padding
							w.style.padding = "10px";							
							// margin
							w.style.margin = "10px";							
							// background color
							w.style.backgroundColor = window.randName.f.backgroundColor;		
														
							// header styles
							w.td.style.textAlign = "center";
							
							// h1 styles
							w.td.t.style.fontSize = "18px";
							w.td.t.style.fontWeight = "bold";
							w.td.t.style.margin = "0 0 10px 0";
							w.td.t.style.padding = "0";	

							var e = w.getElementsByTagName('td');
							e[0].style.textAlign = "center";
							e[0].style.fontStyle = "italic";
							
							for(var i = 1; i< e.length; i++){
								e[i].style.fontSize = 'small';
								e[i].style.textAlign = 'center';
							}
							
							
							// footer
							w.cd.style.textAlign = "left";
							w.cd.style.margin = "10px 0 0 0";
							//w.cd.c.style.fontSize = "9px";
							//w.cd.c.style.padding = "0";
						break;
					}
				},
			};
	}();
	
	var thisScript = /astro_widget.js/;
	
	if(typeof window.addEventListener != 'undefined') {
		window.addEventListener('load', window.randName.f.init(thisScript), false);
	} else if(typeof document.addEventListener != 'undefined') {
		// opera 
		document.addEventListener('load', window.randName.f.init(thisScript), false);
	} else if(typeof window.attachEvent != 'undefined') {
		//.. win/ie
		window.attachEvent('onload', window.randName.f.init(thisScript));
	}
	
})();
