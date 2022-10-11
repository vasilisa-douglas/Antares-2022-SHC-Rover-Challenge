#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include "Adafruit_BMP3XX.h"

#define LED_PIN 25

#define BMP_SCK 7       //also same as SCL
#define BMP_SDA 6
#define BMP_SDO 4

#define SEALEVELPRESSURE_HPA (1013.25)

Adafruit_BMP3XX bmp;

void setup() {
  // Initialize LED_PIN as an output
  pinMode(LED_PIN, OUTPUT);
  // Turn LED on for initialization
  digitalWrite(LED_PIN, HIGH);

  // Configure serial transport
  Serial.begin(115200);
  delay(100);

  // Turn LED off after serial initialization
  digitalWrite(LED_PIN, LOW);

  while (!Serial);
  Serial.println("Adafruit BMP388 / BMP390 test");
  
  if (!bmp.begin_I2C()) 
  {   
    Serial.println("Could not find a valid BMP3 sensor, check wiring!");
    while (1);
  }

  // Set up oversampling and filter initialization
  bmp.setTemperatureOversampling(BMP3_OVERSAMPLING_8X);
  bmp.setPressureOversampling(BMP3_OVERSAMPLING_4X);
  bmp.setIIRFilterCoeff(BMP3_IIR_FILTER_COEFF_3);
  bmp.setOutputDataRate(BMP3_ODR_50_HZ);

}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "led_on") {
      digitalWrite(LED_PIN, HIGH);
    } else if (command == "led_off") {
      digitalWrite(LED_PIN, LOW);
    } else if (command == "ping") {
      Serial.println("pong");
    } else if (command == "time") {
      Serial.println(millis());
    }
  }

  if (! bmp.performReading()) {
    Serial.println("Failed to perform reading :(");
    return;
  }

  Serial.print(bmp.temperature);    //temp
  Serial.print(", \t");

  Serial.print(bmp.pressure / 100.0);   //pressure
  Serial.print(", \t");

  Serial.print(bmp.readAltitude(SEALEVELPRESSURE_HPA));   //approx altitude
  Serial.print(", \t");

  Serial.println();
  delay(2000);
}