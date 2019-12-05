var express = require('express');
var app = express();
var sql = require('mysql');

// Create connection to SQL database
var connection = sql.createConnection ({
user:'user',
password:'istm622@41',
server:'localhost',
database:'CrimeDB'
});


// ------------------------ Part 1
// Finds the distance (miles) between the top 5 highest crime communities and the nearest police station, based on longitude and latitude.

app.get("/high_crime_community_distance_to_nearest_station/", function(req, res) {

	var Crime = req.params.crimeType;
	connection.query("SELECT ComID as 'Community ID', ((sqrt(station_latitude-com_latitude)*(station_latitude-com_latitude) + (station_longitude-com_longitude)*(station_longitude-com_longitude))*69)/6 as 'Distance in Miles' FROM Community_Station", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));
	});
});

// ----------------------- End Part 1

// ----------------------- Caluclate the Crime Intensity in Various Police Beats in aggregate 2001-2019 or by year. PART 2

// Get crime data of a specific beat for all years 2001-2019
app.get("/beat_crime_data/:beat", function(req, res) {

	var BeatNum = req.params.beat;
	connection.query("select Primary_Type as 'Crime Type', Count(Primary_Type) as 'Number of occurences' from Incidents where Beat=" + BeatNum + " group by Primary_Type", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));

	});
});

// Get crime data of a specific beat in for a specific year
app.get("/beat_crime_data/:beat/year/:year", function(req, res) {

	var BeatNum = req.params.beat;
	var Year = req.params.year;
	connection.query("select Primary_Type as 'Crime Type', Count(Primary_Type) as 'Number of occurences' from Incidents where Beat=" + BeatNum + " and Year=" + Year + " group by Primary_Type", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));

	});
});

// Get the top (LIMIT) beats with the most number of crimes reported across all years 2001-2019
app.get("/beat_crime_intensity/top/:limit", function(req, res) {

	var LimitRecords = req.params.limit;
	connection.query("select Beat as 'Beat Numer', count(Primary_Type) as 'Total Offenses' from Incidents where Beat!=0 group by Beat order by count(Primary_Type) DESC limit " + LimitRecords, function(err, result, fields) {
		if (err) throw(err);
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(result, null, 3));

		});
	});

// Get the top (LIMIT) beats with the most number of crimes reported in a specific year
	app.get("/beat_crime_intensity/top/:limit/year/:year", function(req, res) {

		var LimitRecords = req.params.limit;
		var Year = req.params.year;
		connection.query("select Beat as 'Beat Numer', count(Primary_Type) as 'Total Offenses' from Incidents where Year= " + Year + " and Beat!=0 group by Beat order by count(Primary_Type) DESC limit " + LimitRecords, function(err, result, fields) {
			if (err) throw(err);
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(result, null, 3));

			});
		});

// ------------ End Police Beat Caluclation PART 2


//------------- Geographic Crime Prevelance Part 3

// Get the crime data of a specific community for all years 2001-2019
app.get("/community_crime/:community", function(req, res) {

	var CommmunityNum = req.params.community;
	connection.query("select Primary_Type as 'Crime Type', Count(Primary_Type) as 'Number of occurences' from Incidents where Community_Area=" + CommmunityNum + " group by Primary_Type", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));
	});
});

// Get the crime data of a specific community for a specific year
app.get("/community_crime/:community/year/:year", function(req, res) {

	var CommmunityNum = req.params.community;
	var Year = req.params.year;
	connection.query("select Primary_Type as 'Crime Type', Count(Primary_Type) as 'Number of occurences' from Incidents where Community_Area=" + CommmunityNum + " and Year =" + Year + " group by Primary_Type", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));
	});
});

// Get a list of communities with the highest occurences of a specific crime across all years 2001-2019
app.get("/community_crime/highest/:crimeType", function(req, res) {

	var Crime = req.params.crimeType;
	connection.query("select Community_Area as 'Community', Count(Primary_Type) as 'has the # of " + Crime + " Occurences at' from Incidents where Primary_Type='" + Crime + "' and Community_Area !=0 group by Community_Area order by count(Primary_Type) DESC limit 1", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));
	});
});

// Get a list of communities with the highest occurences of a specific crime in a specific year
app.get("/community_crime/highest/:crimeType/year/:year", function(req, res) {

	var Crime = req.params.crimeType;
	var Year = req.params.year;
	connection.query("select Community_Area as 'Community', Count(Primary_Type) as 'has the # of " + Crime + " Occurences at' from Incidents where Primary_Type='" + Crime + "' and Year=" + Year + " and Community_Area !=0 group by Community_Area order by count(Primary_Type) DESC limit 1", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));
	});
});

//------------- End Geographic Crime Prevelance Part 3

//------------- Analyze Crimes on Specific Days Part 4

// Returns a list of all crime types and the number occurences of each on a specific day
app.get("/crime_on_day/:day", function(req, res) {

	var unformattedDay = req.params.day;
	var Day = unformattedDay.replace(/-/g,"/"); // Remove the '-' input by the user and replace with '/' to run in SQL query
	connection.query("select Primary_Type as 'Crime Type on " + Day + "', count(Primary_Type) as 'Number of Occurences' from Incidents where Date2='" + Day + "' group by Primary_Type", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));
	});
});

// Returns the number occurences of a specific crime type on a specific day
app.get("/crime_on_day/:day/type/:crimeType", function(req, res) {

	var unformattedDay = req.params.day;
	var Day = unformattedDay.replace(/-/g,"/"); // Remove the '-' input by the user and replace with '/'
	var Crime = req.params.crimeType;
	connection.query("select Primary_Type as 'Crime Type on " + Day + "', count(Primary_Type) as 'Number of Occurences' from Incidents where Date2='" + Day + "' and Primary_type='" + Crime + "' group by Primary_Type", function(err, result, fields) {
	if (err) throw(err);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(result, null, 3));
	});
});

// End part 4

//----------- Predict Daily Crime in a Future Year Part 5

// Uses linear regression on the daily occurences of crimes from (2001-2019) to project the daily occurences in a future year
app.get("/prob_in_year/:year/crime/:crimeType", function(req, res) {

	var Year = req.params.year-2000;
	var Crime = req.params.crimeType;
	connection.query("select @answer := (" + Year + ")*((19*SUM((Year-2000)*Annual_Prob) - SUM(Year-(2000))*SUM(Annual_Prob)) / (19*SUM((Year-2000)*(Year-2000)) - SUM(Year-(2000))*SUM(Year-(2000)))) + ((AVG(Annual_Prob) - ((19*SUM((Year-2000)*Annual_Prob) - SUM(Year-(2000))*SUM(Annual_Prob)) / (19*SUM((Year-2000)*(Year-2000)) - SUM(Year-(2000))*SUM(Year-(2000))))*AVG(Year-2000))) as 'Predicted Daily Occurences in Year " + Year + "' from Prediction where Primary_Type='" + Crime + "'", function(err, result, fields) {
		if (err) throw(err);
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(result, null, 3));
		});
	});

//---------- End Part 5

// Show the server is alive

var server = app.listen(8081, function () {
var host = server.address().address
var port = server.address().port

console.log("App listening at http://%s:%s", host, port)
});
