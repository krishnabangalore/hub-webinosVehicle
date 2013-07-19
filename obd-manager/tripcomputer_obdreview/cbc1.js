var centerPoint = new google.maps.LatLng(41.38765942141657, 2.1694680888855373);
var markerPoint = new google.maps.LatLng(41.38765942141657, 2.1694680888855373);
var marker;
var position;
var map;
var geocoder;
var mapBounds;
var allServices = {};
var vehicle;
var geolocation;
var deviceorientation;
var ps;

var gear;


var active = '#drive';

var selecterOn = false;
var pdcEnabled = false;

var currentCustomField = '';



dataModel = [{id: 'selecter-gear', desc:'Gear' , unit: '', defaultV:'10', customField: 'customfield1'}, 
{id: 'selecter-speed', desc:'Speed' , unit: 'kmph', defaultV:'0.0', customField: 'customfield2'}, 
{id: 'selecter-heading', desc:'Heading' , unit: '&deg;', defaultV:'90', customField: null},
{id: 'selecter-lateral', desc:'Lateral Acceleration' , unit: 'm/s<sup>2</sup>', defaultV:'00.0', customField: null}, 
{id: 'selecter-longitudinal', desc:'Longitudinal Acceleration' , unit: 'm/s<sup>2</sup>', defaultV:'00.0', customField: null}, 
{id: 'selecter-lat', desc:'Latitude' , unit: '&deg;', defaultV:'41.387659', customField: 'customfield3'},
{id: 'selecter-lng', desc:'Longitude' , unit: '&deg;', defaultV:'2.169468', customField: 'customfield4'},
{id: 'selecter-alt', desc:'Altitude' , unit: 'm', defaultV:'0', customField: 'customfield5'},
{id: 'selecter-vss', desc:'Speed' , unit: 'l/100km', defaultV:'5.4', customField: null},
{id: 'selecter-rpm', desc:'RPM' , unit: 'kmh', defaultV:'47.5', customField: null},
{id: 'selecter-load_pct', desc:'Load_PCT' , unit: 'km', defaultV:'4351', customField: null},
{id: 'selecter-temp', desc:'Temp' , unit: 'km', defaultV:'33.3', customField: null},
{id: 'selecter-frp', desc:'frp' , unit: 'km', defaultV:'547', customField: null}];


function initializeMap() {
    var mapOptions = {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: centerPoint,
      scaleControl: false,
      streetViewControl: false,
      navigationControl: false,
      mapTypeControl: false
      
    };

    map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
    geocoder = new google.maps.Geocoder();
    marker = new google.maps.Marker({
      map:map,
      animation: google.maps.Animation.DROP,
      position: markerPoint
    });
    
   mapBounds = map.getBounds();
}

function updateStatus(text){
	$('#loadingstatus').html(text);
}


function getLinkObj(hash){
	switch(hash){
		case '#drive':
			return '#nav1';
			break;
		case '#diagnostics':
			return '#nav2';
			break;
		case '#check':
			return '#nav3';
			break;
		case '#geek':
			return '#nav4';
			break;
	}
}



function logMessage(msg) {
	if (msg) {
		$('#message').append('<li>' + msg + '</li>');
	}
}	

function handleHashChange(){
//	if((window.location.hash == '#drive' || window.location.hash == '#diagnostics' || window.location.hash == '#check' || window.location.hash == '#geek') && active != window.location.hash){

        if((window.location.hash == '#drive' || window.location.hash == '#diagnostics' && active != window.location.hash){
		
		$(active).addClass('disabled');
		$(getLinkObj(active)).removeClass('active');
		active = window.location.hash;
		$(active).removeClass('disabled');
		$(getLinkObj(active)).addClass('active');
		switch(active){
			case "#drive":
				$('#nav1').focus();
				break;
			case "#diagnostics":
				$('#nav2').focus();
				break;
			case "#check":
				$('#nav3').focus();
				break;
			case "#geek":
				$('#nav4').focus();  												
				break;
			default:
				break;
		}
	}

	if(window.location.hash == '#geek' && selecterOn){
		selecterOn = false;
		$('#selection').addClass('disabled');
		$('#'+currentCustomField).focus();
	}
}
		
function startUp(){
	updateStatus('Registering application at PZP');
    if(webinos.session.getSessionId()!=null){ //If the webinos has already started, force the registerBrowser event
        webinos.session.message_send({type: 'prop', payload: {status:'registerBrowser'}});
    }
}

function findVehicle(){
	updateStatus('Looking for vehicle data provider');
	allServices = {};
	vehicle = null;
	webinos.discovery.findServices( 
		new ServiceType('http://webinos.org/api/vehicle'),{onFound: function (service) {
			updateStatus('Vehicle found');
			vehicle = service;
			bindToVehicle();        		
		
		}}
	);
}


function findGeolocation(){
	updateStatus('Looking for a geolocation provider');
	allServices = {};
	geolocation = null;
	
	webinos.discovery.findServices( 
	//new ServiceType('http://webinos.org/api/w3c/geolocation'),
 	new ServiceType('http://www.w3.org/ns/api-perms/geolocation'),
 	{onFound: function (service) {
		updateStatus('geolocation service found');
		geolocation = service;
		bindToGeolocation();
	}});
}

function findDeviceOrientation(){
	updateStatus('Looking for a Deviceorientation provider');
	allServices = {};
	deviceorientation = null;
	
	webinos.discovery.findServices( 
	new ServiceType('http://webinos.org/api/deviceorientation'),                         
	{onFound: function (service) {
		updateStatus('deviceorientation service found');
		deviceorientation = service;
		bindToDeviceOrientation();
		
	}});
}
function bindToVehicle(){
	updateStatus('Binding to Vehicle');
	vehicle.bindService({onBind:function(service) {
		updateStatus('Bound to Vehicle');
		registerVehicleListeners();
	}});
}

function bindToGeolocation(){
	updateStatus('Binding to Geolocation');
	geolocation.bindService({onBind:function(service) {
		updateStatus('Bound to Geolocation service');
		registerGeoListener();
		findDeviceOrientation();
	}});
}
function bindToDeviceOrientation(){
	updateStatus('Binding to Deviceorientation');
	deviceorientation.bindService({onBind:function(service) {
		updateStatus('Bound to Deviceorientation service');
		registerDoListener();
		$('#loading').addClass('disabled');
	}});
}

function registerVehicleListeners(){
	updateStatus('Adding Listener Vehicle API');
	vehicle.get('gear', handleGear, errorCB);
	vehicle.addEventListener('gear', handleGear, false);
	updateStatus('Vehicle listeners registered.');
	vehicle.get('tripcomputer', handleAverageData, errorCB);
	vehicle.addEventListener('tripcomputer', handleAverageData, false);
	findGeolocation();
}

function registerGeoListener(){
	var params = {};
	geolocation.getCurrentPosition(handlePosition, errorCB, params);
	ps = geolocation.watchPosition(handlePosition,errorCB, params);
}

function registerDoListener(){
	var params = {}
	deviceorientation.addEventListener('devicemotion',handleDeviceMotion, false);
}


function updatePZAddrs(data) {
	if(typeof data.payload.message.pzp !== "undefined") {
		logMessage('new pzp ' + data.payload.message.pzp);
	} else {
		logMessage('new pzh ' + data.payload.message.pzh);
	}
}

function fillPZAddrs(data) {
	var pzpId = data.from;
	var pzhId, connectedPzh , connectedPzp;
	if (pzpId !== "virgin_pzp") {
	  pzhId = data.payload.message.pzhId;                                     
	  connectedPzp = data.payload.message.connectedPzp; // all connected pzp
	  connectedPzh = data.payload.message.connectedPzh; // all connected pzh
		findVehicle();
		//findGeolocation();
	}
}

$(document).ready(function() {
	$('#nav1').focus();
	//HELPERS FOR OVERSCROLLING SELECTION LIST
	$('#selection-start').bind('focus', function(){
		$('#selecter-range').focus();
	});

	$('#selection-end').bind('focus', function(){
		$('#selecter-speed').focus();
	});
	
	$('#n-start').bind('focus', function(){
		$('#nav1').focus();
	});
	
	$('#n-end').bind('focus', function(){
		if(active != '#geek'){
			$('#nav4').focus();
		}else{
			$('#customfield1').focus();
		}
	});
	$('#geek-start').bind('focus', function(){
		$('#nav4').focus();
	});
	
	
	
	$('#geek-end').bind('focus', function(){
		$('#customfield5').focus();
	});
	$('a[id*="selecter-"]').bind('click', function(){
		/*when click on a tab (es Speed or Gear) in the popup "please select a property" add a class disabled means that 
		the view "please select a property" became invisible (display=none)*/
 	if ($('#'+this.id).attr("class")!="hidden")
 	{	 
 		$('#selection').addClass('disabled');
		console.log(this.id);
 
  		for(var i = 0; i < dataModel.length; i++){
 			//initially currentCustomField is empty and customfield are the first chosen by the programmer
			if(dataModel[i].customField == currentCustomField){
				dataModel[i].customField = null;
			}
			//this.id give id of the object where I've clicked, es. "selecter-heading" if I click on heading
			if(this.id == dataModel[i].id){
				//SETTING NEW DATA ON FIELD;
				$('#'+currentCustomField).find(".unit").html(dataModel[i].unit);
				$('#'+currentCustomField).find(".value").html(dataModel[i].defaultV);
				$('#'+currentCustomField).find(".description").html(dataModel[i].desc);
				dataModel[i].customField = currentCustomField;
				//break;
			}
		}
		$('#'+currentCustomField).focus();
	}
 	});
	
	$('a[id*="customfield"]').bind('click', function(){
	
		
		/*  set the currentCustomField to the current fields that are:
		 *  customField1
		 *  customField2
		 *  customField3
		 *  customField4
		 *  customField5
		*/
		
	        //set the variable currentCustomField with the id of the field in which I've clicked
		currentCustomField = this.id;
		selecterOn = true;
		// remove in every field the classes "selected" and "hidden"
		$('a[id*="selecter-"]').removeClass('selected');
		$('a[id*="selecter-"]').removeClass('hidden');
		
		var selected = 0;
  		//this block of code is to marked as SELECTED (with some graphic effect) the field where I've clicked on myView
		for(var i = 0; i < dataModel.length; i++){
			if(dataModel[i].customField == this.id){
 				$('#' + dataModel[i].id).attr("href","#geek");
				$('#' + dataModel[i].id).addClass('selected');
  				selected = i;
			}
			/*this block is to mark as HIDDEN (with some graphic effect) the field which are already present in the previous 
			myView window */
			else if(dataModel[i].customField != null){
				$('#' + dataModel[i].id).removeAttr("href");
				$('#' + dataModel[i].id).addClass('hidden');
			}
		}
		//to show the view "please select properties"
		$('#selection').removeClass('disabled');
		//to give the focus to the field from where I came from
		$('#' + dataModel[selected].id).focus();
	});

	$(window).bind('hashchange', function() {
			handleHashChange();
	});

	initializeMap();
	webinos.session.addListener('registeredBrowser', fillPZAddrs);
	webinos.session.addListener('update', updatePZAddrs);
	startUp();
	handleHashChange();
});


function errorCB(error){
	logMessage('error', "ERROR:" + error.message);
	console.log('error' + error.message);
}


function handleGear(data){
	pdcAppHandler(data);

	
	switch(parseInt(data.gear)){
		//Neutral 11, Parking 10; Rear 0
		case 0:
			gear = 'R';
			break;
		case 10:
			gear = 'P';
			break;
		case 11:
			gear = 'N';
			break;
		default:
			gear = data.gear;
			break;
	}
		$('#v-gear').html(gear);
		dataModel[0].defaultV = gear;
	if(dataModel[0].customField != null){
		$('#' + dataModel[0].customField).find('.value').html(gear);
	}
}

function handleAverageData(data){

	$('#v-avg-speed').html(data.averageSpeed);
	$('#v-consumption').html(data.averageConsumption);
	$('#v-distance').html(data.tripDistance);
	$('#v-range').html(data.range);
	$('#v-mileage').html(data.mileage);
	
	dataModel[8].defaultV = data.averageConsumption;
	dataModel[9].defaultV =data.averageSpeed;
	dataModel[10].defaultV =data.mileage;
	dataModel[11].defaultV =data.tripDistance;
	dataModel[12].defaultV =data.range;
	
	if(dataModel[8].customField != null){
		$('#' + dataModel[8].customField).find('.value').html(data.averageConsumption);
		
	}
	if(dataModel[9].customField != null){
		$('#' + dataModel[9].customField).find('.value').html(data.averageSpeed);
		
	}
	if(dataModel[10].customField != null){
		$('#' + dataModel[10].customField).find('.value').html(data.mileage);
		
	}
	if(dataModel[11].customField != null){
		$('#' + dataModel[11].customField).find('.value').html(data.tripDistance);
		
	}
	if(dataModel[12].customField != null){
		$('#' + dataModel[12].customField).find('.value').html(data.range);
		
	}

}


function handlePosition(data){
	//logMessage(data.coords.latitude + ' - ' + data.coords.longitude);
	var uPos = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
	marker.setPosition(uPos);
	
	if(!map.getBounds().contains(uPos)){
		map.setCenter(uPos);
	}
	$('#v-lat').html(Math.floor(data.coords.latitude * 10000)/10000);
	$('#v-lng').html(Math.floor(data.coords.longitude * 10000)/10000);
	$('#v-alt').html(data.coords.altitude);
	$('#v-heading').html(data.coords.heading);
	$('#v-heading2').html(data.coords.heading);
	$('#v-speed').html(data.coords.speed);
	$('#v-speed2').html(data.coords.speed);
	
	
	dataModel[5].defaultV = Math.floor(data.coords.latitude * 10000)/10000;
	dataModel[6].defaultV = Math.floor(data.coords.longitude * 10000)/10000;
	dataModel[7].defaultV = data.coords.altitude;
	dataModel[2].defaultV = data.coords.heading;
	dataModel[1].defaultV = data.coords.speed;
	
	if(dataModel[5].customField != null){
		$('#' + dataModel[5].customField).find('.value').html(Math.floor(data.coords.latitude * 10000)/10000);
		
	}

	if(dataModel[6].customField != null){
		$('#' + dataModel[6].customField).find('.value').html(Math.floor(data.coords.longitude * 10000)/10000);
	}

	if(dataModel[7].customField != null){
		$('#' + dataModel[7].customField).find('.value').html(data.coords.altitude);
	}
	if(dataModel[2].customField != null){
		$('#' + dataModel[2].customField).find('.value').html(data.coords.heading);
	}
	if(dataModel[1].customField != null){
		$('#' + dataModel[1].customField).find('.value').html(data.coords.speed);
	}
}

function handleDeviceMotion(data){
	$('#v-lat-acc').html(data.acceleration.x);
	$('#v-lng-acc').html(data.acceleration.y);
	
	//Lateral
	if(dataModel[3].customField != null){
		$('#' + dataModel[3].customField).find('.value').html(data.acceleration.x);
	}
	//Longitudinal
	if(dataModel[4].customField != null){
		$('#' + dataModel[4].customField).find('.value').html(data.acceleration.y);
	}
}

function handleError(error){
	//logMessage(error)
}


function drawPdcBase(position){
	if(position == "parksensors-front"){
		canvas = $('#pdcFront');
		centerX =  200;
		centerY =  75;
		start = 250;
		end = 290;
		radius = 154;
		width = 88;
		
	
	}else if(position == "parksensors-rear"){
		canvas = $('#pdcRear');
		centerX = -100;
		centerY = 75; 
		start = 70;
		end = 110;
		radius = 154;
		width = 88;
	}
	canvas.clearCanvas();
	
	canvas.drawArc({
		strokeStyle: "#6C8080",
		opacity: 0.4,
		strokeWidth: width,
		x: centerX, y: centerY,
		radius: radius,
		start: start, end: end
	});
}
				
				
function drawPdcObstacles(params){
	position = params.position;
	left = params.left;
	midLeft = params.midLeft;
	midRight = params.midRight;
	right = params.right;
	
	widthRed = 10;
	widthYellow = 14;
	widthGreen = 20;
	
	radiusGreen1 = 188;
	radiusGreen2 = 168;
	
	radiusYellow1 = 151;
	radiusYellow2 = 137;
	
	radiusRed1 = 125;
	radiusRed2 = 115;
	
	green = "#51FF19"
	yellow = "#F3FF17";
	red = "#FF3E00";
	
	
	if(position == "parksensors-front"){
		canvas = $('#pdcFront');
		centerX =  200;
		centerY =  75;
		
		//250 -- 290					
		leftStart = 250;
		leftEnd = 260;
	
		midLeftStart = 260;
		midLeftEnd = 270;
	
		midRightStart = 270;
		midRightEnd = 280;
	
		rightStart = 280;
		rightEnd = 290;

	
	
	}else if(position == "parksensors-rear"){
		canvas = $('#pdcRear');
		centerX = -100;
		centerY = 75; 

		//70 -- 110					
		leftStart = 70;
		leftEnd = 80;
	
		midLeftStart = 80;
		midLeftEnd = 90;
	
		midRightStart = 90;
		midRightEnd = 100;
	
		rightStart = 100;
		rightEnd = 110;



	}
	drawPdcBase(position);
	
	
	//250 185  120 80 40 20
	
	//GREEN  ONE
	///LEFT
	if(left < 250){
		canvas.drawArc({
			strokeStyle: green,
			strokeWidth: widthGreen,
			x: centerX, y: centerY,
			radius: radiusGreen1,
			start: leftStart, end: leftEnd
		});
	}
	///MIDLEFT
	if(midLeft < 250){
	canvas.drawArc({
		strokeStyle: green,
		strokeWidth: widthGreen,
		x: centerX, y: centerY,
		radius: radiusGreen1,
		start: midLeftStart, end: midLeftEnd
	});	
	}
	if(midRight < 250){
	///MIDRIGHT
	canvas.drawArc({
		strokeStyle: green,
		strokeWidth: widthGreen,
		x: centerX, y: centerY,
		radius: radiusGreen1,
		start: midRightStart, end: midRightEnd
	});
	}
	///RIGHT
	if(right < 250){
	canvas.drawArc({
		strokeStyle: green,
		strokeWidth: widthGreen,
		x: centerX, y: centerY,
		radius: radiusGreen1,
		start: rightStart, end: rightEnd
	});
	}
	//GREEN TWO
	///LEFT
	//250 185  120 80 40 20
	if(left < 185){
	canvas.drawArc({
		strokeStyle: green,
		strokeWidth: widthGreen,
		x: centerX, y: centerY,
		radius: radiusGreen2,
		start: leftStart, end: leftEnd
	});
	}
	///MIDLEFT
	if(midLeft < 185){
	canvas.drawArc({
		strokeStyle: green,
		strokeWidth: widthGreen,
		x: centerX, y: centerY,
		radius: radiusGreen2,
		start: midLeftStart, end: midLeftEnd
	});		
	}
	///MIDRIGHT
	if(midRight < 185){
	canvas.drawArc({
		strokeStyle: green,
		strokeWidth: widthGreen,
		x: centerX, y: centerY,
		radius: radiusGreen2,
		start: midRightStart, end: midRightEnd
	});					
	}
	///RIGHT
	if(right < 185){					
	canvas.drawArc({
		strokeStyle: green,
		strokeWidth: widthGreen,
		x: centerX, y: centerY,
		radius: radiusGreen2,
		start: rightStart, end: rightEnd
	});
	}
	//YELLOW ONE
	///LEFT
	if(left < 120){
	canvas.drawArc({
		strokeStyle: yellow,
		strokeWidth: widthYellow,
		x: centerX, y: centerY,
		radius: radiusYellow1,
		start: leftStart, end: leftEnd
	});
	}
	///MIDLEFT
	if(midLeft < 120){
	canvas.drawArc({
		strokeStyle: yellow,
		strokeWidth: widthYellow,
		x: centerX, y: centerY,
		radius: radiusYellow1,
		start: midLeftStart, end: midLeftEnd
	});		
	}
	///MIDRIGHT
	if(midRight < 120){
	canvas.drawArc({
		strokeStyle: yellow,
		strokeWidth: widthYellow,
		x: centerX, y: centerY,
		radius: radiusYellow1,
		start: midRightStart, end: midRightEnd
	});			
	}
	if(right < 120){
	///RIGHT
	canvas.drawArc({
		strokeStyle: yellow,
		strokeWidth: widthYellow,
		x: centerX, y: centerY,
		radius: radiusYellow1,
		start: rightStart, end: rightEnd
	});		
	}
	//YELLOW TWO
	///LEFT
	if(left < 80){
	canvas.drawArc({
		strokeStyle: yellow,
		strokeWidth: widthYellow,
		x: centerX, y: centerY,
		radius: radiusYellow2,
		start: leftStart, end: leftEnd
	});
	}
	///MIDLEFT
	if(midLeft < 80){
	canvas.drawArc({
		strokeStyle: yellow,
		strokeWidth: widthYellow,
		x: centerX, y: centerY,
		radius: radiusYellow2,
		start: midLeftStart, end: midLeftEnd
	});		
	}
	///MIDRIGHT
	if(midRight < 80){
	canvas.drawArc({
		strokeStyle: yellow,
		strokeWidth: widthYellow,
		x: centerX, y: centerY,
		radius: radiusYellow2,
		start: midRightStart, end: midRightEnd
	});			
	}
	///RIGHT
	if(right < 80){
	canvas.drawArc({
		strokeStyle: yellow,
		strokeWidth: widthYellow,
		x: centerX, y: centerY,
		radius: radiusYellow2,
		start: rightStart, end: rightEnd
	});	
	}
	//RED ONE
	///LEFT
	if(left < 40){
	canvas.drawArc({
		strokeStyle: red,
		strokeWidth: widthRed,
		x: centerX, y: centerY,
		radius: radiusRed1,
		start: leftStart, end: leftEnd
	});
	}
	
	///MIDLEFT
	if(midLeft < 40){
	canvas.drawArc({
		strokeStyle: red,
		strokeWidth: widthRed,
		x: centerX, y: centerY,
		radius: radiusRed1,
		start: midLeftStart, end: midLeftEnd
	});		
	}
	///MIDRIGHT
	if(midRight < 40){
	canvas.drawArc({
		strokeStyle: red,
		strokeWidth: widthRed,
		x: centerX, y: centerY,
		radius: radiusRed1,
		start: midRightStart, end: midRightEnd
	});			
	}
	///RIGHT
	if(right < 40){
	canvas.drawArc({
		strokeStyle: red,
		strokeWidth: widthRed,
		x: centerX, y: centerY,
		radius: radiusRed1,
		start: rightStart, end: rightEnd
	});		
	}
	//RED TWO
	///LEFT
	if(left < 20){
	canvas.drawArc({
		strokeStyle: red,
		strokeWidth: widthRed,
		x: centerX, y: centerY,
		radius: radiusRed2,
		start: leftStart, end: leftEnd
	});
	}
	///MIDLEFT
	if(midLeft < 20){
	canvas.drawArc({
		strokeStyle: red,
		strokeWidth: widthRed,
		x: centerX, y: centerY,
		radius: radiusRed2,
		start: midLeftStart, end: midLeftEnd
	});				
	}
	///MIDRIGHT
	if(midRight < 20){
	canvas.drawArc({
		strokeStyle: red,
		strokeWidth: widthRed,
		x: centerX, y: centerY,
		radius: radiusRed2,
		start: midRightStart, end: midRightEnd
	});			
	}
	///RIGHT
	if(right < 20){
	canvas.drawArc({
		strokeStyle: red,
		strokeWidth: widthRed,
		x: centerX, y: centerY,
		radius: radiusRed2,
		start: rightStart, end: rightEnd
	});		
	}
}


function pdcAppHandler(event){
	//Neutral 11, Parking 10; Rear 0
	if(event.gear == 0){
		enablePdc();
	}
	else if(event.gear >= 2){
		disablePdc();
		
	}
	
}
function enablePdc(){
	pdcEnabled = true;
	$("#pdc").fadeIn(500);
	drawPdcBase("parksensors-front");
	drawPdcBase("parksensors-rear");
	vehicle.addEventListener('parksensors-front',drawPdcObstacles,false);
	vehicle.addEventListener('parksensors-rear',drawPdcObstacles,false);
}

function disablePdc(){
	pdcEnabled = false;
	$("#pdc").fadeOut(500);
	vehicle.removeEventListener('parksensors-front',drawPdcObstacles,false);
	vehicle.removeEventListener('parksensors-rear',drawPdcObstacles,false);
}
