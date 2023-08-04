const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const { dirname } = require("path");
require('dotenv').config();

const app = express();

// Set the views directory
app.set("views", __dirname + "/views");

// set EJS as the view engine
app.set("view engine", "ejs");

// Parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


// Serve the HTML file on GET request
app.get("/", function(req, res) {
    res.sendFile("Watering.html", { root: __dirname, protocol: 'https' });
});

// Handle form submission on POST request
app.post("/output", function(req, res) {
    const pincode = req.body.pin;
    const city = req.body.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    console.log(city);
    if (!apiKey) {
        res.send("API key is missing. Please provide a valid API key.");
        return;
    }

    let url;

    if (pincode === undefined && city === undefined) {
        res.send("Please enter either a valid city or pincode");
        return;
    }

    if (pincode === undefined) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    } else if (city === undefined) {
        url = `https://api.openweathermap.org/data/2.5/forecast?zip=${pincode},IN&appid=${apiKey}`;
    } else {
        res.send("Please enter either a valid city or pincode");
        return;
    }

    https.get(url, function(response) {
        let data = "";

        response.on("data", function(chunk) {
            data += chunk;
        });

        response.on("end", function() {
            try {
                const weatherData = JSON.parse(data);
                const weatherList = Array.isArray(weatherData.list) ? weatherData.list : [];
                const threeDayList = weatherList.slice(0, 24);

                const rainValues = threeDayList.filter(period => period.pop > 0).map(period => (period.rain && period.rain["3h"]) ? period.rain["3h"] : 0);

                const averageRain = rainValues.length > 0 ? rainValues.reduce((sum, value) => sum + value, 0) / rainValues.length : 0;

                const selectedPlant = req.body.plantDropdown;

                res.render("output.ejs", { selectedPlant: selectedPlant, averageRain: averageRain });
            } catch (error) {
                res.send("An error occurred while fetching weather data. Please try again later.");
            }
        });
    }).on('error', function(error) {
        res.send("An error occurred while fetching weather data. Please try again later.");
    });
});

app.listen(3000, function() {
    console.log("Server is running");
});
