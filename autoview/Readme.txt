Steps to run webinos Vehicle Hub using OBD on Modularized Codebase:
 
1.     Clone the hub-webinosVehicle repo from the github link - https://github.com/webinos/hub-webinosVehicle inside the web_root folder of the webinos-pzp Or Copy the content of the hub-webinosVehicle folder into the web_root folder in webinos-pzp. The demo works on above webinos 0.8 vesion. The demo should be executed using firefox/Chrome.

2.     Change settings in config.json in webinos-api-vehicle
Set the connector parameter for the Vehicle to OBD and Geolocation API to simulator. In case you want to use the Vehicle Simulator then you can access it on localhost:9898/simulator/vehicle.html

OBD:
Starting OBD Simulator - install the OBD Simulator on to the Linux machine and can start with the command - obdsim according to this change the /dev/pts/(Port Number) in config.json in webinos-api-vehicle
Or 
Connect OBD (Car - Real Time Values - Bluetooth/Serial) - Once all the Connection is done it runs on /dev/USB0 for serial and for bluetooth change the parameters in the OBD params settings in the config.json in webinos-api-vehicle. 

3.     Change the behavior of the backspace key in firefox to handle backspace as, go back a page in the session history (only on linux). This can be changed using about:config. The relevant parameter is browser.backspace_action and the value needs to be 0. This change is relevant, if you want to demonstrate the applications using only keys.  The relevant keys to control the automotive view of the applications are the following:
a.     TAB: focus the next element (focusing the next element in a list)
b.     TAB+SHIFT: focus the previous element
c.     ENTER: Select an element
d.    ESC: Opens the app switcher between webinos hub features and OBD Manager

Depending on what you show want to show the following URLs are important for you:
·         Desktop-View of webinos Vehicle Hub: http://localhost:8080/hub-webinosVehicle/obd-manager/tripcomputer_obdreview/tripcomputer.html#travel
·         Smartphone-View of webinos travel (screen size of a Galaxy S3): http://localhost:8080/hub-webinosVehicle/obd-manager/tripcomputer_obdreview/tripcomputer.html#travel
·         Automotive View (in-vehicle display): http://localhost:8080/hub-webinosVehicle/obd-manager/tripcomputer_obdreview/tripcomputer.html#travel
This part of the application can be controlled using only key inputs. You can switch between applications, when you press ESC

APIs that webinos Vehicle Hub Uses:

Vehicle API - OBD
Events
File
Device Orientation
Geolocation
  
Regards,
Krishna
