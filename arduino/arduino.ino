/*
Elektrosauna
2019 / Timo Toots
*/

#include "Dimmer.h"

// Define relay pins
int rels[24] = {  23,25,27,29,31,33,35,37,   39,41,43,45,47,49,51,53,   A2,A1,A5,A4,  A3,A0,A6,A7 }; // 16,17,18,19,20,

// Define dimmer pins
int dims[12] = { 28,26,24,22,   36,34,32,30,  38,40,42,44   }; //   DIM4: 46,48,50,52

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
  Dimmer(dims[7], DIMMER_RAMP),
  Dimmer(dims[8], DIMMER_RAMP),
  Dimmer(dims[9], DIMMER_RAMP),
  Dimmer(dims[10], DIMMER_RAMP),
  Dimmer(dims[11], DIMMER_RAMP)
};


void setup() {

	// Start dimmers
	for(int i = 0; i < sizeof(dims); i++) {
		dimmers[i].begin();
	}

  // Set rel pins
  for(int i = 0; i < sizeof(rels); i++) {
      pinMode(rels[i], OUTPUT);
       if(i>15){
            digitalWrite(rels[i],HIGH);
         }
  }


	shutdown();


	// Start serial
	Serial.begin(115200);
	delay(500);
	Serial.println("READY");


}

void loop() {


	if(1==2){
		test();
	} else {

 
  while (Serial.available() > 0) {
  
    int type = Serial.parseInt();

    ///////////////////////////////////////////

    if(type==4){

      Serial.println("Type: REL BATCHER");
    
      for (int i = 0; i < 24; ++i){
        int value = Serial.parseInt();
        changeRel(i,value);
      }

      if (Serial.read() == '\n') {
        Serial.println("batch done");
      }

    ///////////////////////////////////////////

    } else {


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
      	
      	Serial.println("Type: REL SOLO");
        id = constrain(id, 0, 15);
        value = constrain(value, 0, 1);
        changeRel(id,value);
 
	  ////////////////////////////////
      
      } else if(type==2){
      	Serial.println("Type: DIM");
    	id = constrain(id, 0, 19);

      Serial.println(dims[id]);

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

         } // else



  } // while serial

	} // if test

  // delay(2);
}

void changeDim(int id, int value, int time){

	dimmers[id].setRampTime(time);
	dimmers[id].set(value);
        
}

////////////////////////////////////////////

void changeRel(int i, int value){

	if(value==1){
		    Serial.print("changeRel id:");
            Serial.print(i);
            Serial.println(" on");
	} else {
		    Serial.print("changeRel");
            Serial.print(i);
            Serial.println(" off");		
	}

 	if(i>15){
      if(value==1){
        digitalWrite(rels[i],LOW);
      } else {
        digitalWrite(rels[i],HIGH);
      }

    } else {
        if(value==1){
        	digitalWrite(rels[i],HIGH);
	    } else {
	        digitalWrite(rels[i],LOW);
	    }
    }


} // changeRel


void shutdown(){
/*
	for(int i=0 ; i<sizeof(rels) ; i++){
		digitalWrite(rels[i],LOW);
	}

	for(int i = 0; i < sizeof(dimmers) / sizeof(Dimmer); i++) {
		dimmers[i].setRampTime(1);
		dimmers[i].set(0);
	}

  */
}

void test(){



 	//  for(int i=0 ; i<16 ; i++){
		// Serial.print("pin on:");
 	// 	Serial.println(i);
  //       digitalWrite(rels[i],HIGH);
  //       delay(3000);
  //      	Serial.print("pin off:");
 	// 	Serial.println(i);
  //       digitalWrite(rels[i],LOW);

  //   }

    for(int i=16 ; i<16+8 ; i++){
		Serial.print("pin on:");
 		Serial.println(i);
        digitalWrite(rels[i],LOW);
        delay(3000);
       	Serial.print("pin off:");
 		Serial.println(i);
        digitalWrite(rels[i],HIGH);

    }
	/*

 	for(int i=0 ; i<4+4+2 ; i++){
		Serial.print("dim on:");
 		Serial.println(i);
        changeDim(i, 100, 1);
        delay(3000);
       	Serial.print("dim off:");
 		Serial.println(i);
        changeDim(i, 0, 1);

    }
    */


}

void testAll(){
/*
    // Test relays
    for(int i=0 ; i<sizeof(rels) ; i++){
        digitalWrite(rels[i],HIGH);
        delay(1000);
        digitalWrite(rels[i],LOW);
    }

    // Test dimmers
	for(int i = 0; i < sizeof(dimmers) / sizeof(Dimmer); i++) {
	//	dimmers[i].set(100);
	}
	delay(1500);

	for(int i = 0; i < sizeof(dimmers) / sizeof(Dimmer); i++) {
	//	dimmers[i].set(0);
	}
	delay(1500);
  */
} // testAll
