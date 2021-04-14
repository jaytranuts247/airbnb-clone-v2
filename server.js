const express = require("express");
const urlMake = require("./modules/urlMake");
const ListingScrapper = require("./modules/ListingScrapper");

const app = express();
// const url =
// 	"https://www.airbnb.com/s/Las-Vegas-Strip--Las-Vegas--United-States/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_dates%5B%5D=april&flexible_trip_dates%5B%5D=may&flexible_trip_lengths%5B%5D=weekend_trip&date_picker_type=calendar&query=Las%20Vegas%20Strip%2C%20Las%20Vegas%2C%20United%20States&place_id=ChIJ69QoNDjEyIARTIMmDF0Z4kM&checkin=2021-09-05&checkout=2021-09-11&adults=5&source=structured_search_input_header&search_type=autocomplete_click";

// Middlewares
// app.use(express.urlencoded());
app.use(express.json({ extended: false }));

app.use("/api/listings", require("./routes/listings"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// req.body
/*
	{
		pagination: 
		orderInput: {
			adults: 
			children: 
			infants:
			checkIn:
			checkOut: 
		}
		locationInfo: {
			description: "Las Vegas, NV, USA",
			matched_substrings: [
				{
					length: 9,
					offset: 0,
				},
			],
			place_id: "ChIJ0X31pIK3voARo3mz1ebVzDo",
			reference: "ChIJ0X31pIK3voARo3mz1ebVzDo",
			structured_formatting: {
				main_text: "Las Vegas",
				main_text_matched_substrings: [
					{
						length: 9,
						offset: 0,
					},
				],
				secondary_text: "NV, USA",
			},
			terms: [
				{
					offset: 0,
					value: "Las Vegas",
				},
				{
					offset: 11,
					value: "NV",
				},
				{
					offset: 15,
					value: "USA",
				},
			],
			types: ["locality", "political", "geocode"],
		}
	}
*/
