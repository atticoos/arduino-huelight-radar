# Arduino motion sensor powered Hue Lights
This uses an Arduino board, Ping sensor, and Hue lights to set up a motion sensor powered lighting system.

### Breadboard
<img src="https://github.com/rwaldron/johnny-five/raw/master/docs/breadboard/ping.png" width="450" />

## How it works

1. The app samples the room for 100 sensor readings to determine the boundaries
2. The app opens an event stream on the sensor stream and starts capturing events
3. Depending on the event, certain API calls are made to the Hue lights
4. Certain events can also toggle back into sampling mode to reprogram the room boundaries (cover the sensor to reset)

## Stream Architecture

```
____________
|          |
| Ardunio  | Sensor does its shit
|  Sensor  |
____________
     ||
     ||
     \/
____________
|          |
|  Serial  |  Arduino pushes sensor data onto the serial connection to the PC
|   Port   |
____________
     ||
     ||
     \/
____________
|  NodeJS  |
|  Serial  |  Stream listens on the serial port for the feed of data, captures the buffer,
|  Stream  |  cleans the data, and then pipes it to the next adapter
____________
     ||
     ||
     \/
____________
|  NodeJS  |  This is piped from the NodeJS Serial Stream and takes in
|Aggregator|  the constant feed of sensor data and fills a buffer of 10
|  Stream  |  items at a time. Once filled, it aggregates the average and
____________  passes to the next stream
     ||
     ||
     \/
______________
|   NodeJS   | This is piped from the NodeJS Aggregator Stream and
|   Event    | is provided with the average of the last 10 sensor readings.
|Interpretter| It then creates an event object from the event factory based on
|   Stream   | conditions met by the data point provided
____________
     ||
     ||
     \/
_____________
|Interpretted| This listens for events coming in from the
|   Event    | NodeJS Event Interpretter stream and decides which endpoint
|  Handler   | to trigger on the Huelights API
______________
     ||
     ||
     \/
____________
|          |     Makes lights do shit!
| Hue Api  |
|          |
____________

```
