var appswitcher_visible;
var focusedElement = null;
var switchOpen = false;
document.onkeydown = function(e){ 
          if (e == null) { // ie 
            keycode = event.keyCode; 
          } else { // mozilla 
            keycode = e.which; 
          } 
          if(keycode == 27){  
              if(switchOpen){
              	
              	hideSwitcher();
              }else{
              	displaySwitcher();
              }
	} 
};

$(document).ready(function() {
	$('body').append('<div id="appswitcher-outer" class="SwitcherDisabled"></div>');
	$('body').append('<div id="appswitcher-inner" class="SwitcherDisabled"></div>');
	$('#appswitcher-inner').append('<a  tabindex="1" id="appswitcher-start"/></a>');
	createAppEntry(1, 'webinos Insurance', '../../obd-manager/general/images/icon.png', '../../obd-manager/automotive/index.html');
	createAppEntry(2, 'OBD Manager', '../../obd-manager/tripcomputer_obdreview/icon.png', '../../obd-manager/tripcomputer_obdreview/tripcomputer.html');
	
	$('#appswitcher-inner').append('<a  tabindex="1" id="appswitcher-end"/></a>');
	$('#appswitcher-start').bind('focus', function(){
		$('#app1').focus();
	});
	
	$('#appswitcher-end').bind('focus', function(){
		$('#app2').focus();
	});

});

function displaySwitcher(){
	$('#appswitcher-inner').removeClass('SwitcherDisabled');
	$('#appswitcher-outer').removeClass('SwitcherDisabled');
	focusedElement = document.activeElement.id;
	$('#app1').focus();
    switchOpen = true;
    
}

function hideSwitcher(){
	$('#appswitcher-inner').addClass('SwitcherDisabled');
	$('#appswitcher-outer').addClass('SwitcherDisabled');
	$('#'+focusedElement).focus();
    switchOpen = false;
}

function createAppEntry(id,name, icon, url){
	if(window.location.href.indexOf(url) != -1){
		url = "javascript:hideSwitcher();";
	}
	
	$('#appswitcher-inner').append('<div class="appbox"><div class="app-icon"><ul><li><a href="'+url+'" id="app'+id+'" tabindex="1"><img src="'+icon+'" height="90" width="90"></a></li></ul></div><div class="app-desc">'+name+'</div></div>');

}
