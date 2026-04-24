const express = require("express");
const mqtt = require("mqtt");
const cors = require("cors");
const http = require("http");
const {Server} = require("socket.io");
const axios = require('axios');

// app
const app = express();
app.use(cors());


// create a socket server for this
const server = http.createServer(app)

let rawData = {};

const client = mqtt.connect(process.env.MQTT_URL || "mqtt://mqtt:1883");

// create websocket
const io = new Server(server,{
  cors: {origin: "*"}
});

// connection throgh mqtt >> backend with publisher
client.on("connect", () => {
  console.log("Connected to MQTT");
  client.subscribe("iot/sensor");
});


// add to list when msg received
client.on("message", async (topic, message) => {

  // verify topic
  if (topic== "iot/sensor"){
    try {
      rawData = JSON.parse(message.toString());

      // model to redictt anomaly
      const response = await axios.post('http://ai-brain:5001/predict',{
          temp: rawData.temperature,
          hum: rawData.humidity
      });

      const { anomaly } = response.data;

      console.log(`Temp: ${rawData.temperature} | Anomaly: ${anomaly}`);

      // real time data push to frontend
      io.emit("sensor-data", {
        ...rawData,
        anomaly: anomaly
      });

    } catch (err) {
      console.error("AI Brain Error:", err.message);
    }

  }
});



server.listen(5000, () => {
  console.log("Server running on port 5000");
});