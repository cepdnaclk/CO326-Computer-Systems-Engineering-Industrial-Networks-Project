import paho.mqtt.client as mqtt
import time
from simulation import simulate_data



# create publisher
client = mqtt.Client()
client.connect("mqtt", 1883, 60)   # service name

TOPIC = "iot/sensor"

# start loop
client.loop_start()

#loop
while True:
    try:
        payload = simulate_data()
        client.publish(TOPIC, payload)    # publish sensor data to mqtt broker
        time.sleep(2)

    except KeyboardInterrupt:
        print("Manually stopped the sensor")
        break