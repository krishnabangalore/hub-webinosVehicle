webinos-hub-webinosVehicle
==============================

webinosVehicle Hub with functionality to provide 
- Live data of OBD parameters
- Historical Charts of OBD parameters
- Definition of trigger points from OBD parameters
- Sharing of data 

Hardware: 
- OBD-II
- Raspberry Pi
- Display
- Keyboard and Mouse
- Cables for Connectivity

Links:

Github link - https://github.com/webinos/hub-webinosVehicle
Developer site - https://developer.webinos.org/vehicle-hub

Instructions to Run:

To run the OBD Simulator - To Install onyour terminal
•        apt-cache search obd
•        sudo apt-get install obdgpslogger
To Run
•        obdsim or obdsim –o

Note: Port number obdsim and in webinos-driver-obd2/config.json should be the same

You need-> IOT API in IOT node modules clone drivers for OBD, device Orientation and Geolocation API needs to be installed as well.

Git clone https://github.com/webinos/webinos-api-deviceOrientation
Git clone https://github.com/webinos/webinos-api-geolocation
Git clone https://github.com/webinos/webinos-api-iot
in IOT node_modules  ->  git clone
https://github.com/webinos/webinos-driver-obd2 then npm install

Run a node webinos_pzp.js

App Code, place it in web_root
Git clone https://github.com/webinos/hub-webinosVehicle/

Path on browser: 
localhost:8080/hub-webinosVehicle/autoview/obd-manager/tripcomputer_obdreview/autoview.html
