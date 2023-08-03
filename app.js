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
    res.sendFile(__dirname + "/Watering.html");
});

// Handle form submission on POST request
app.post("/output", function(req, res) {
    const pincode = req.body.pin;
    const city = req.body.city;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    let url;
    if(pincode === undefined) {
        url = `api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
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
            // console.log(pincode + " " + city + " " + averageRain);
            const selectedPlant = req.body.plantDropdown;
            console.log(selectedPlant);

            const wateringTechniques = {
                tulasi: {
                  indoor: 'Water every 2-3 days, keeping the soil evenly moist. Avoid overwatering.',
                  outdoor: 'Water every 3-4 days, providing deep watering sessions to encourage root growth.',
                },
                'aloe vera': {
                  indoor: 'Water sparingly, allowing the soil to dry out completely between waterings.',
                  outdoor: 'Water every 2 weeks, allowing the soil to dry out between waterings.',
                },
                hibiscus: {
                  indoor: 'Water thoroughly whenever the top inch of soil becomes dry.',
                  outdoor: 'Water deeply twice a week, especially during hot and dry weather.',
                },
                jasmine: {
                  indoor: 'Water regularly, keeping the soil consistently moist, but not soggy.',
                  outdoor: 'Water every 3-4 days, providing deep watering during the growing season.',
                },
                turmeric: {
                  indoor: 'Water moderately, allowing the top layer of soil to dry out between waterings.',
                  outdoor: 'Water consistently, keeping the soil moist, especially during active growth.',
                },
                ginger: {
                  indoor: 'Water frequently, keeping the soil moist but not waterlogged.',
                  outdoor: 'Water consistently, providing enough water to keep the soil evenly moist.',
                },
              };

            // Print the average rainfall for the first 12 elements
            // res.send(`Average rainfall for the next 5 days: ${averageRain} mm and ${averageRain} litres per square metre`);
            res.render("output.ejs", { selectedPlant: selectedPlant, averageRain: averageRain, wateringTechniques: wateringTechniques});
        });
    });
});

app.listen(3000, function() {
    console.log("Server is running");
});
