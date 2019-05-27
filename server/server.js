////////////////////////////////////////////////////////////////////////////////////////////////////

// Elektrosauna server

'use strict';

const spawn = require( 'child_process' );

var fs = require('fs');
var colors = require('colors');

var request = require('request');

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

app.use(express.static('html'))

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

	console.log("test");
		changePin("REL",0,100);
		changePin("DIM",4,100,5);
    	setTimeout(function(){
    		changePin("REL",0,0);
    		changePin("DIM",4,0,1);
    	},5000)

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

//////////////////////////////////

function writeToSerial(){

	for (var i = 0; i < 16; i++) {
		serialport.write('2 '+ i +' 100\n');
	}

	
}


//////////////////////////////////