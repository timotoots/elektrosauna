////////////////////////////////////////////////////////////////////////////////////////////////////

// Elektrosauna server

'use strict';

var colors = require('colors');

console.log('///////////////////////////////////////////////'.blue);
console.log('ELEKTROSAUNA START'.blue);
console.log('///////////////////////////////////////////////\n'.blue);

const spawn = require( 'child_process' );

var fs = require('fs');

var request = require('request');

////////////////////////////////////////////////////////////////////////////////////////////////////

const csv = require('csv-parser');  

// GPIO wiring:16

//    Physical pin 10
//    BCM pin 15
//    Wiring Pi pin 16

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

for(var i=0;i<=23;i++){
	pins_state.rel.push(0);
}

var lastDims = [];

for(var i=0;i<12;i++){
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
	    console.log('Device mapping CSV file successfully processed');
	    for(var key in new_mapping){
	    	new_mapping[key].uid = new_mapping[key].id + "_" + new_mapping[key].side + "_" + new_mapping[key].panel;
	    	new_mapping[key].uid = new_mapping[key].id;
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


/////////////////////////////////////

var composition;

var newComp;

function updateComp(){

	newComp = [];

	fs.createReadStream('composition.csv')  
	  .pipe(csv())
	  .on('data', (data) => newComp.push(data))
	  .on('end', () => {
	    console.log('Composition CSV file successfully processed');
	    for(var key in newComp){

	    	// new_mapping[key].uid = new_mapping[key].id + "_" + new_mapping[key].side + "_" + new_mapping[key].panel;
	    	// new_mapping[key].min = parseInt(new_mapping[key].min);
	    	// new_mapping[key].max = parseInt(new_mapping[key].max);

	    	// new_mapping2[new_mapping[key].uid] = new_mapping[key];
	    	// if(new_mapping[key].interface=="dmx" && new_mapping[key].dmx_id > 0){
	    	// 	pins_used.dmx[new_mapping[key].dmx_id] = true;
	    	// }

	    }
	    composition = newComp;
	    // console.log(mapping);
	  });


}

 updateDeviceMapping();
updateComp();

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
  console.log('Serial port opened'.green);
  // writeToSerial();

 
});


const parser = new Readline({delimiter: '\n'});
serialport.pipe(parser);

////////////////////////////////////////////////////////////////////////////////////////////////////

function checkSerialPort(){

	const exec = require('child_process').exec;
	exec("ls /dev/ttyUSB0",{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
		setTimeout(checkSerialPort,5000);
		
		if(trim(stdout)=="/dev/ttyUSB0"){
			// console.log("USB device alive".green);
		} else {
			console.log("Arduino device not connected! Please call Timo!".red);
		}

	});


}

checkSerialPort();

////////////////////////////////////////////////////////////////////////////////////////////////////

function checkUsbDmx(){

	const exec = require('child_process').exec;
	exec("lsusb",{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
		setTimeout(checkUsbDmx,5000);
				// console.log(stdout.blue);

		if(stdout.search("16c0:05dc")!=-1){
			// console.log("DMX USB device alive".green);
		} else {
			console.log("DMX USB device not connected! Please call Timo!".red);
		}

	});


}

checkUsbDmx();

////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////

 parser.on('data', function(data){

   // DEBUG

    if(trim(data)=="READY"){
    	console.log("Serial port READY".green);
    	setTimeout(silence, 5000);
    	// writeToSerial();
    	

    } else {
    	// console.log('data received:', data);

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
/*
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
*/
/////////////////////////////////////////////////

function mapValues(value,in_min, in_max, out_min, out_max) {
  return Math.round((value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

var lastRelCmd = "";

/////////////////////////////////////////////////

function changeRel(values){

	if(values.length!=24){
		console.log("channel number does not match!")
		return false;
	}

	var cmd = "4";
	for(var i=0;i<24 ; i++){

		cmd = cmd + " " + values[i];

	}
	cmd = cmd + "\n";
	if(lastRelCmd!=cmd){
		serialport.write(cmd);
		// console.log(cmd.green);
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
		// console.log(activeDmxCmd);
		exec(activeDmxCmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
			//console.log(stdout.blue);
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

	var cmd = "/usr/local/bin/uDMX 1 ";
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
			// console.log("To DIM: " + cmd);
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



function changeDevice(key, value, time){


	if(mapping[key]){

		var time_str = Math.round(time/1000);


		if(value==0){
			var dbg = time_str + "s / "+key+" : OFF";
			console.log(dbg.blue);
		} else if(value==1 || value==100){

			var dbg = time_str + "s / "+key+" : FULL";
			console.log(dbg.green);

		} else {
				var dbg = time_str + "s / "+key+ ": " +value + "%";
			console.log(dbg.green);

		}
		


		//////////////////////////////////////////

		if(mapping[key].interface=="dmx"){

			if(typeof pins_state.dmx[mapping[key].dmx_id] !== "undefined"){
				
				if(value==0){
					pins_state.dmx[mapping[key].dmx_id] = 0;
				} else {

					if(mapping[key].max){
						value = mapValues(value,0, 100, mapping[key].min, mapping[key].max);
					}
					// percent to dmx
					pins_state.dmx[mapping[key].dmx_id] = mapValues(value,0, 100, 0, 255);
				}

				changeDmx(pins_state.dmx);


			} else {
				console.log("wrong pin");
			}

		//////////////////////////////////////////


		} else if(mapping[key].interface=="rel"){

			if(typeof pins_state.rel[mapping[key].rel_id] !== "undefined"){
				if(value==100 || value==1){
					pins_state.rel[mapping[key].rel_id] = 1;
				} else {
					pins_state.rel[mapping[key].rel_id] = 0;
				}
					changeRel(pins_state.rel);


			}


		//////////////////////////////////////////

		} else if(mapping[key].interface=="sound"){

			playSound(key);


		//////////////////////////////////////////

		} else if(mapping[key].interface=="dim"){

			if(typeof pins_state.dim[mapping[key].dim_id] !== "undefined"){
				
				if(value==0){
					pins_state.dim[mapping[key].dim_id] = 0;
				} else {
					if(mapping[key].max){
						pins_state.dim[mapping[key].dim_id] = mapValues(value,0, 100, mapping[key].min, mapping[key].max);
					}
				}

				
			}

		}

	} else {
		console.log("wrong mapping in changeDevice("+key+", "+value+")".red);

	}


} // function changeDevice

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

////////////////////////////////////////////

// GPIO

var buttonStates = [];

var mainState = "not_active";

var gpio = require('rpi-gpio');

gpio.setup(10, gpio.DIR_IN);

var listenButton = true;


setInterval(function(){

	gpio.read(10,function(channel, value){
		// console.log('Channel ' + channel + ' value is now ' + value);
		if(value==true){
			buttonStates.push(0);
		} else {
			buttonStates.push(1);
		}
		if(buttonStates.length > 5){
			buttonStates.shift();
		}
		

		// console.log(buttonStates);

		var sum = 0;
		for( var i = 0; i < buttonStates.length; i++ ){
    		sum += parseInt( buttonStates[i], 10 ); //don't forget to add the base
		}
		var avg = sum/buttonStates.length;
		// console.log("Average: " + avg);

		if(avg<0.5 && (mainState=="active" || mainState=="ended") && listenButton==true){
			stopComp("not_active");
			listenButton = false;
			setTimeout(function(){ listenButton = true; },2000);
		} else if(avg>0.3 && mainState=="not_active" && listenButton == true){
			startComp();
			mainState = "active";
			listenButton = false;
			setTimeout(function(){ listenButton = true; },2000);
		} 

	

		
	});

},1000);

////////////////////////////////////////////

var thankYouPlayed = false;

function playThanks(){

	if(thankYouPlayed == false){

		setTimeout(function(){

		var cmd = "mpg123 /opt/elektrosauna/sound/thankyou.mp3";

		const exec = require('child_process').exec;
		// console.log(activeDmxCmd);
		exec(cmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
			// console.log(stdout.blue);
		});

		},5000);
		
		thankYouPlayed = true;

	}

}

////////////////////////////////////////////

function playSound(sound){



		var cmd = "mpg123 --loop -1 /opt/elektrosauna/sound/"+sound+".mp3";

		// console.log(cmd);

		const exec = require('child_process').exec;
		// console.log(activeDmxCmd);
		exec(cmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
			// console.log(stdout.blue);
		});

	

}

function stopAllSounds(){

		var cmd = "killall mpg123";

		const exec = require('child_process').exec;
		// console.log(activeDmxCmd);
		exec(cmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
			// console.log(stdout.blue);
		});
}

////////////////////////////////////////////

var compTimeouts = [];

function startComp(){

	console.log("Start Composition!");

	thankYouPlayed = false;

	//playSoundtrack();

	setTimeout(function(){

		var cmd = "mpg123 /opt/elektrosauna/sound/welcome.mp3";

		const exec = require('child_process').exec;
		// console.log(activeDmxCmd);
		exec(cmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
			// console.log(stdout.blue);
		});

	},2500);

	setTimeout(function(){

		var cmd = "mpg123 /opt/elektrosauna/sound/pleaseclose.mp3";

		const exec = require('child_process').exec;
		// console.log(activeDmxCmd);
		exec(cmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
			// console.log(stdout.blue);
		});

	},6500);


	setTimeout(function(){

		var cmd = "mpg123 /opt/elektrosauna/sound/sitdown.mp3";

		const exec = require('child_process').exec;
		// console.log(activeDmxCmd);
		exec(cmd,{maxBuffer:200*1024*1000},function(error,stdout,stderr){ 
			// console.log(stdout.blue);
		});

	},10500);

	
	var addToTime = 0;
	var lastTime = 0;
	
	for (var i = 0; i < composition.length; i++) {


		if(composition[i].time != "" || composition[i].on=="zero"){


			if(composition[i].on=="zero"){
				// console.log(lastTime);
				addToTime = lastTime;
			} else {

				 composition[i].time = parseInt(composition[i].time);


				// console.log(composition[i]);

				var timePass = composition[i].time*1000 + addToTime;

				if(composition[i].on!="" && mapping[composition[i].on]){

					if(composition[i].power){
						var power = parseInt(composition[i].power);
					} else {
						var power = 100;
					}
					compTimeouts[i] = setTimeout(changeDevice.bind(null,composition[i].on,power,timePass),timePass);
					lastTime = timePass;
				} else if(composition[i].off!="" && mapping[composition[i].off]){
					compTimeouts[i] = setTimeout(changeDevice.bind(null,composition[i].off,0,timePass),timePass);
					lastTime = timePass;
					// compTimeouts[i] = setTimeout(cmd,composition[i].time*1000);
				} else if(composition[i].off=="silence"){
					compTimeouts[i] = setTimeout(silence,timePass);
					lastTime = timePass;
				} else if(composition[i].off=="end"){
					// var cmd = "stopComp()";
					compTimeouts[i] = setTimeout(stopComp.bind(null, "ended"),timePass);
					lastTime = timePass;

				}

			}// if


		}

	} // for




} // function startComp

//////////////////////////////////

function silence(){
		
		console.log("Silence!");



		for (var i = 0; i < pins_state.dim.length; i++) {
			pins_state.dim[i] = 0;
		}

		for (var i = 0; i < pins_state.rel.length; i++) {
			pins_state.rel[i] = 0;
		}

		for (var i = 0; i < pins_state.dmx.length; i++) {
			pins_state.dmx[i] = 0;
		}

		changeDmx(pins_state.dmx);
		changeRel(pins_state.rel);


}

//////////////////////////////////

function stopComp(endState = "ended"){

	console.log("Stop composition:" + endState);

	stopAllSounds();

	playThanks();

	for (var i = 0; i < composition.length; i++) {
		clearTimeout(compTimeouts[i]);
	}

	silence();
	
	setTimeout(silence,1000);

	mainState = endState;

} 

//////////////////////////////////
// on start, do silence


//////////////////////////////////