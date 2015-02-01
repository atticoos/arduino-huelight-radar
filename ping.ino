const int pingPin = 7;
const int baudRate = 9600;
unsigned int duration, inches;

void setup () {
  Serial.begin(baudRate);
}

void loop () {
  pinMode(pingPin, OUTPUT);
  digitalWrite(pingPin, LOW);
  delayMicroseconds(2);
  digitalWrite(pingPin, HIGH);
  delayMicroseconds(5);
  digitalWrite(pingPin, LOW);
  pinMode(pingPin, INPUT);
  duration = pulseIn(pingPin, HIGH);
  inches = duration / 74 / 2;
  Serial.println(inches);
  delay(50);
}
