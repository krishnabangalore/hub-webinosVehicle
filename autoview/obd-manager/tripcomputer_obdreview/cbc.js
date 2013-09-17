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
{id: 'selecter-consumption', desc:'RPM' , unit: 'l/100km', defaultV:'5.4', customField: null},
{id: 'selecter-avg-speed', desc:'Speed' , unit: 'kmh', defaultV:'47.5', customField: null},
{id: 'selecter-mileage', desc:'Temp' , unit: 'km', defaultV:'4351', customField: null},
{id: 'selecter-distance', desc:'Load PCT' , unit: 'km', defaultV:'33.3', customField: null},
{id: 'selecter-range', desc:'FRP' , unit: 'km', defaultV:'547', customField: null}];


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
		case '#travel':
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
	if((window.location.hash == '#drive' || window.location.hash == '#travel' || window.location.hash == '#check' || window.location.hash == '#geek') && active != window.location.hash){
		
		$(active).addClass('disabled');
		$(getLinkObj(active)).removeClass('active');
		active = window.location.hash;
		$(active).removeClass('disabled');
		$(getLinkObj(active)).addClass('active');
		switch(active){
			case "#drive":
				$('#nav1').focus();
				break;
			case "#travel":
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
	updateStatus('Vehicle VSS listeners registered.');
        vehicle.get('vss', handleAverageData, errorCB);
	vehicle.addEventListener('vss', handleAverageData, false);
        updateStatus('Vehicle RPM listeners registered.');
        vehicle.get('rpm', handleAverageData, errorCB);
	vehicle.addEventListener('rpm', handleAverageData, false);
        updateStatus('Vehicle Load PCT listeners registered.');
        vehicle.get('load_pct', handleAverageData, errorCB);
	vehicle.addEventListener('load_pct', handleAverageData, false);
        updateStatus('Vehicle FRP listeners registered.');
        vehicle.get('frp', handleAverageData, errorCB);
	//vehicle.addEventListener('frp', handleAverageData, false);
        updateStatus('Vehicle Temp listeners registered.');
        vehicle.get('temp', handleAverageData, errorCB);
	//vehicle.addEventListener('temp', handleAverageData, false);
	/*updateStatus('Vehicle listeners registered.');
	vehicle.get('tripcomputer', handleAverageData, errorCB);
	vehicle.addEventListener('tripcomputer', handleAverageData, false);*/
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

	$('#v-avg-speed').html(data.vss);
	$('#v-consumption').html(data.rpm);
	$('#v-distance').html(data.load_pct);
	$('#v-range').html(data.frp);
	$('#v-mileage').html(data.temp);
	
	dataModel[8].defaultV = data.rpm;
	dataModel[9].defaultV =data.vss;
	dataModel[10].defaultV =data.temp;
	dataModel[11].defaultV =data.load_pct;
	dataModel[12].defaultV =data.frp;
	
	if(dataModel[8].customField != null){
		$('#' + dataModel[8].customField).find('.value').html(data.rpm);
		
	}
	if(dataModel[9].customField != null){
		$('#' + dataModel[9].customField).find('.value').html(data.vss);
		
	}
	if(dataModel[10].customField != null){
		$('#' + dataModel[10].customField).find('.value').html(data.temp);
		
	}
	if(dataModel[11].customField != null){
		$('#' + dataModel[11].customField).find('.value').html(data.load_pct);
		
	}
	if(dataModel[12].customField != null){
		$('#' + dataModel[12].customField).find('.value').html(data.frp);
		
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

