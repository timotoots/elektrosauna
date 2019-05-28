////////////////////////////////////////////////////////////////////////////////////////////////////

// Elektrosauna server

'use strict';

const spawn = require( 'child_process' );

var fs = require('fs');
var colors = require('colors');

var request = require('request');

////////////////////////////////////////////////////////////////////////////////////////////////////

const csv = require('csv-parser');  

////////////////////////////////////////////////////////////////////////////////////////////////////
// Web server

const express = require('express')
const app = express()
const port = 3000


app.listen(port, () => console.log(`Listening commands on port ${port}!`))

app.get('/change_pin', function (req, res) {
  res.send('Pin changed!')
  console.log(req.query.test);
  test();
})

app.get('/get_mapping', function (req, res) {
  updateDeviceMapping();
  res.send(mapping)
})

app.get('/change_all_pins', function (req, res) {
  res.send(req.query);
  changeAllPins(req.query);
})


app.use(express.static('html'))

////////////////////////////////////////////////////////////////////////////////////////////////////
// csv config

var mapping = [];
var new_mapping = [];
var new_mapping2 = {};

var pins_state = {"dmx":[],"dim":[],"dim_time":[],"rel":[]};

for(var i=0;i<=30;i++){
	pins_state.dmx.push(0);
}

for(var i=0;i<=15;i++){
	pins_state.rel.push(0);
}

var lastDims = [];

for(var i=0;i<8;i++){
	pins_state.dim.push(0);
	pins_state.dim_time.push(1);
	lastDims.push(0);
}

function updateDeviceMapping(){

	new_mapping = [];

	fs.createReadStream('device_mapping.csv')  
	  .pipe(csv())
	  .on('data', (data) => new_mapping.push(data))
	  .on('end', () => {
	    console.log('CSV file successfully processed');
	    for(var key in new_mapping){
	    	new_mapping[key].uid = new_mapping[key].id + "_" + new_mapping[key].side + "_" + new_mapping[key].panel;
	    	new_mapping[key].min = parseInt(new_mapping[key].min);
	    	new_mapping[key].max = parseInt(new_mapping[key].max);

	    	new_mapping2[new_mapping[key].uid] = new_mapping[key];
	    	// if(new_mapping[key].interface=="dmx" && new_mapping[key].dmx_id > 0){
	    	// 	pins_used.dmx[new_mapping[key].dmx_id] = true;
	    	// }

	    }
	    mapping = new_mapping2;
	    // console.log(mapping);
	  });


}

 updateDeviceMapping();


////////////////////////////////////////////////////////////////////////////////////////////////////
// Serial

var SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

try{
	var serialport = new SerialPort("/dev/ttyUSB0", {
	  baudRate: 115200
	});

} catch(e){
  console.log("No Arduino connected to /dev/ttyUSB0");
  process.exit();
}

serialport.on('open', function(){
  console.log('Serial Port Opened');
  // writeToSerial();

 
});


const parser = new Readline({delimiter: '\n'});
serialport.pipe(parser);

console.log('parser setup');



//////////////////////////////////

 parser.on('data', function(data){

   // DEBUG

    if(trim(data)=="READY"){
    	console.log("Serial port Ready");
    	// writeToSerial();
    	

    } else {
    	console.log('data received:', data);

    }

    });

//////////////////////////////////

function trim(str){

  str = str.replace(/^\s+|\s+$/g,'');
  return str;

}

//////////////////////////////////

function test(){

	// console.log("test");
	// 	changePin("REL",0,100);
	// 	changePin("DIM",4,100,5);
 //    	setTimeout(function(){
 //    		changePin("REL",0,0);
 //    		changePin("DIM",4,0,1);
 //    	},5000)

// 		serialport.write("4 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1\n");

// 	setTimeout(function(){
// 				serialport.write("4 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n");

// },5000)

// 		setTimeout(function(){
// 				serialport.write("4 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n");

// },10000)

}

//////////////////////////////////

function changePin(type, id, value, time = 0){

	if(type!="REL" && type!="DIM"){
		console.log("not correct type");
		return false;
	}

	if(type=="REL"){
		cmd = '1 ' + id + ' ' + value + ' 0\n';
		serialport.write(cmd);
		console.log(cmd);

	} else if(type=="DIM"){
		var cmd = '2 ' + id + ' ' + value + " " + time + '\n';
		serialport.write(cmd);
		
	}




}

/////////////////////////////////////////////////

function mapValues(value,in_min, in_max, out_min, out_max) {
  return Math.round((value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

var lastRelCmd = "";

/////////////////////////////////////////////////

function changeRel(values){

	if(values.length!=16){
		console.log("channel number does not match!")
		return false;
	}

	var cmd = "4";
	for(var i=0;i<16 ; i++){

		cmd = cmd + " " + values[i];

	}
	cmd = cmd + "\n";
	if(lastRelCmd!=cmd){
		serialport.write(cmd);
		console.log(cmd.green);
		lastRelCmd = cmd;
	} 
	


}

/////////////////////////////////////////////////

var statusDmx = 0;

var lastDmxCmd = "";
var currentDmxCmd = "";
var activeDmxCmd = "";

function checkAndsendDMX(){

	// console.log("sendDMX");
	if(currentDmxCmd!=lastDmxCmd && statusDmx==0){

		activeDmxCmd = currentDmxCmd;
		statusDmx = 1;
		const exec = require('child_process').exec;
		console.log(activeDmxCmd);
		exec(activeDmxCmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
			// console.log(stdout.blue);
			lastDmxCmd = activeDmxCmd;
			statusDmx = 0;
			checkAndsendDMX();
		});

	} else {
		setTimeout(function(){
			checkAndsendDMX();
		},500);
		
	}

}

checkAndsendDMX();

/////////////////////////////////////////////////

function changeDmx(values){

	if(values.length!=31){
		console.log("channel number does not match!")
		return false;
	}

	var cmd = "/opt/elektrosaun/uDMX-linux/uDMX 1 ";
	for(var i=1;i<=30 ; i++){
		cmd = cmd + " " + values[i];
	}

	currentDmxCmd = cmd;

}

/////////////////////////////////////////////////

function checkAndChangeDims(){

	var changed = 0;

	var activeDims = pins_state.dim;

	for (var i = 0; i < activeDims.length; i++) {
		if(activeDims[i]!=lastDims[i]){
			var cmd = '2 ' + i + ' ' + activeDims[i] + " " + pins_state.dim_time[i] + '\n';
			console.log("To DIM: " + cmd);
			serialport.write(cmd);
			lastDims[i] = activeDims[i];
			changed = 1;
		}
	}

	setTimeout(function(){
		checkAndChangeDims();
	},1000);


}

checkAndChangeDims();

/////////////////////////////////////////////////

function changeAllPins(state){

	for(var key in mapping){

		// console.log(mapping);

		if(mapping[key].interface=="dmx" && mapping[key].dmx_id > 0 && typeof state[key] !== "undefined" ){

			if(typeof pins_state.dmx[mapping[key].dmx_id] !== "undefined"){
				
				if(state[key]==0){
					pins_state.dmx[mapping[key].dmx_id] = 0;
				} else {

					if(mapping[key].max){
						state[key] = mapValues(state[key],0, 100, mapping[key].min, mapping[key].max);
					}
					
					// percent to dmx
					pins_state.dmx[mapping[key].dmx_id] = mapValues(state[key],0, 100, 0, 255);
				}

				
			}

		} else if(mapping[key].interface=="rel" && mapping[key].rel_id != ""  && mapping[key].rel_id != "x" && typeof state[key] !== "undefined" ){

			if(typeof pins_state.rel[mapping[key].rel_id] !== "undefined"){
				if(state[key]==100){
					pins_state.rel[mapping[key].rel_id] = 1;
				} else {
					pins_state.rel[mapping[key].rel_id] = 0;
				}

			}


		} else if(mapping[key].interface=="dim" && mapping[key].dim_id != ""  && mapping[key].dim_id != "x" && typeof state[key] !== "undefined" ){

			if(typeof pins_state.dim[mapping[key].dim_id] !== "undefined"){
				
				if(state[key]==0){
					pins_state.dim[mapping[key].dim_id] = 0;
				} else {
					if(mapping[key].max){
						pins_state.dim[mapping[key].dim_id] = mapValues(state[key],0, 100, mapping[key].min, mapping[key].max);
					}
				}

				
			}
		}

	}

	changeDmx(pins_state.dmx);
	changeRel(pins_state.rel);
	// console.log(pins_state.dim);



}

//////////////////////////////////

function writeToSerial(){

	for (var i = 0; i < 16; i++) {
		serialport.write('2 '+ i +' 100\n');
	}

	
}


//////////////////////////////////