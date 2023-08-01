const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const { dirname } = require("path");
require('dotenv').config();

const app = express();

// Parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


// Serve the HTML file on GET request
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/Watering.html");
});

// Handle form submission on POST request
app.post("/", function(req, res) {
    const pincode = req.body.pin;
    const city = req.body.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    let url;
    if(pincode === undefined) {
        url = `api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}`;
    }
    else if(city === undefined){
        url = `https://api.openweathermap.org/data/2.5/forecast?zip=${pincode},IN&appid=${apiKey}`;
    }
    else{
        res.send("Please enter either valid city or pincode");
    }
    https.get(url, function(response) {
        let data = "";
        response.on("data", function(chunk) {
            data += chunk;
        });
        response.on("end", function() {
            const weatherData = JSON.parse(data);
            // console.log(weatherData);
            // Make sure weatherData.list is an array before filtering and mapping
            const weatherList = Array.isArray(weatherData.list) ? weatherData.list : [];

            const rainValues = weatherList.filter(period => period.pop > 0).map(period => (period.rain && period.rain["3h"]) ? period.rain["3h"] : 0);


            const averageRain = rainValues.reduce((sum, value) => sum + value, 0) / rainValues.length;
            console.log(pincode + " " + city);

            // Print the average rainfall for the first 12 elements
            // res.send(`Average rainfall for the next 5 days: ${averageRain} mm and ${averageRain} litres per square metre`);
            res.send(`Average rainfall for the next 5 days: ${averageRain} mm and ${averageRain} litres per square metre`);
        });
    });
});

app.listen(3000, function() {
    console.log("Server is running");
});
