/*
Elektrosauna
2019 / Timo Toots
*/

#include "Dimmer.h"

// Define relay pins
int rels[16] = {  23,25,27,29,31,33,35,37,   39,41,43,45,47,49,51,53 };

// Define dimmer pins
int dims[8] = { 28,26,24,22,   36,34,32,30 }; //  38,40,42,44, 46,48,50,52

float time;

// Define dimmers
Dimmer dimmers[] = {
  Dimmer(dims[0], DIMMER_RAMP),
  Dimmer(dims[1], DIMMER_RAMP),
  Dimmer(dims[2], DIMMER_RAMP),
  Dimmer(dims[3], DIMMER_RAMP),
  Dimmer(dims[4], DIMMER_RAMP),
  Dimmer(dims[5], DIMMER_RAMP),
  Dimmer(dims[6], DIMMER_RAMP),
  Dimmer(dims[7], DIMMER_RAMP)
};


void setup() {

	// Start dimmers
	for(int i = 0; i < sizeof(dimmers) / sizeof(Dimmer); i++) {
		dimmers[i].begin();
	}

	shutdown();

	// Start serial
	Serial.begin(115200);
	delay(500);
	Serial.println("READY");
}

void loop() {

 
  while (Serial.available() > 0) {
  
    int type = Serial.parseInt();
    int id = Serial.parseInt();
    int value = Serial.parseInt();
    int value2 = Serial.parseInt();


    if (Serial.read() == '\n') {

      type = constrain(type, 0, 2);
      value = constrain(value, 0, 100);
      value2 = constrain(value2, 0, 30);

      ////////////////////////////////

      // // https://www.reddit.com/r/arduino/comments/6nmprg/reading_data_from_serial_and_parsing_it_into_an/

      if(type==1){
      	Serial.println("Type: REL");
        id = constrain(id, 0, 15);
        if(value>50){
        	digitalWrite(rels[id],HIGH);
        } else {
        	digitalWrite(rels[id],LOW);
        }
 
	  ////////////////////////////////
      
      } else if(type==2){
      	Serial.println("Type: DIM");
    	id = constrain(id, 0, 15);
    	if(value2 == 0){

    		time = 1;
    	} else {
    		time = (float)value2;
    	}
    	changeDim(id,value, time);


      } else if(type==0){
      	Serial.println("Type: COMMAND");
 
      }
    
      Serial.print(" ID:");
      Serial.print(id);
      Serial.print(" Value:");
      Serial.println(value);
       
     }
    
  } // while serial

  // delay(2);
}

void changeDim(int id, int value, int time){

	dimmers[id].setRampTime(time);
	dimmers[id].set(value);
        
}


void shutdown(){

	for(int i=0 ; i<sizeof(rels) ; i++){
		digitalWrite(rels[i],LOW);
	}

	for(int i = 0; i < sizeof(dimmers) / sizeof(Dimmer); i++) {
		dimmers[i].setRampTime(1);
		dimmers[i].set(0);
	}

  
}

void testAll(){

    // Test relays
    for(int i=0 ; i<sizeof(rels) ; i++){
        digitalWrite(rels[i],HIGH);
        delay(1000);
        digitalWrite(rels[i],LOW);
    }

    // Test dimmers
	for(int i = 0; i < sizeof(dimmers) / sizeof(Dimmer); i++) {
		dimmers[i].set(100);
	}
	delay(1500);

	for(int i = 0; i < sizeof(dimmers) / sizeof(Dimmer); i++) {
		dimmers[i].set(0);
	}
	delay(1500);
  
} // testAll