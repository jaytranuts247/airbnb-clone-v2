const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const fs = require("fs");
const path = require("path");

const {
	getLastWord,
	isFileExisted,
	getStayName,
	extractContent,
	getPath,
} = require("../utils/utils");

class ListingScrapper {
	requestInput = {};
	url = "";
	scrappedListings = [];
	// browser;

	#Selectors = {
		item: "._8s3ctt",
		type: "._b14dlit",
		title: "._5kaapu span",
		previewInfo: {
			current: "div._kqh46o",
			info: "span._3hmsj",
			amenities: "div._kqh46o",
		},
		pricePerNight: "span._olc9rf0",
		ratings: "span._10fy1f8",
		reviewNumber: "span._a7a5sx",
		// images: "._9ofhsl",
		images: "div._skzmvy img",
		individualListingLink: "a._mm360j",
		forwardButton: "._1u6aumhe button",
		prevButton: "_1qfwqy2d button",
		individualListing: {
			ratings: {
				ratingTotal:
					'[data-plugin-in-point-id="REVIEWS_DEFAULT"] > div > div > section > h2 > span._goo6eo > div > span',
				ratingType: "._gmaj6l > div > div > div > div > div > div._y1ba89",
				ratingNum:
					"._gmaj6l > div > div > div > div > div > div._bgq2leu > span._4oybiu",
			},
			reviews: {
				reviewUser: "",
				reviewDate: "",
				reviewContent: "",
			},
			host: {
				name: "div._f47qa6 ._svr7sj h2", // text()
				image: "div._f47qa6 > div > div > a > div > div > img",
				description: "",
				joined: "div._f47qa6 ._svr7sj div._1fg5h8r",
				readMoreButton:
					"div._1byskwn > div._5zvpp1l > div._152qbzi > div > span > div._cfvh61 > div > button",
				Intro:
					"div._1byskwn > div._5zvpp1l > ._upzyfk1 > div > span > div > span",
				IntroClickMore:
					"div._1byskwn > div._5zvpp1l > ._152qbzi > div > span > div > span",
			},
			services: {
				parent: "._ryvszj",
				servicesString: "span > button> span._11o89bi",
				serviceFee: "span._ra05uc",
				cleaningFee: "span._ra05uc",
			},
		},
	};

	#urlConfig = {
		tab_id: "home_tab",
		date_picker_type: "calendar",
		baseUrl: "https://www.airbnb.com/s/homes?",
		source: "structured_search_input_header",
		search_type: "pagination",
	};

	constructor(url, requestInput) {
		(this.requestInput = requestInput),
			(this.url = url),
			(this.scrappedListings = this.scrappedListings);
	}

	getUrl() {
		return this.url;
	}

	getSelectors() {
		return this.#Selectors;
	}

	getScrappedListings = () => this.scrappedListings;

	urlMake = () => {
		// return url = `${baseUrl}tab_id=${urlConfig.tab_id}&`
		const { pagination, bookingInput, locationInfo } = this.requestInput;
		this.url =
			this.#urlConfig.baseUrl +
			`tab_id=${this.#urlConfig.tab_id}` +
			`&date_picker_type=${this.#urlConfig.date_picker_type}` +
			`&search_type=${this.#urlConfig.search_type}` +
			`&source=${this.#urlConfig.source}` +
			`&query=${locationInfo.structured_formatting.main_text.replace(
				" ",
				"%20"
			)}%2C%20United%20States` +
			`&checkin=${bookingInput.checkIn}` +
			`&checkout=${bookingInput.checkOut}` +
			`&adults=${bookingInput.adults}` +
			`&children=${bookingInput.children}` +
			`&place_id=${locationInfo.place_id}` +
			`&section_offset=${pagination}` +
			`&items_offset=${(pagination - 1) * 20}`;
		return this.url;
	};

	static saveImagesToDisk = async () => {
		return;
	};
	static saveTextToDisk = () => {
		return;
	};

	fetchHtml = async () => {
		let browser;
		try {
			browser = await puppeteer.launch({ headless: false });
			const page = await browser.newPage();
			page.setViewport({ width: 1280, height: 800 });
			// waitForSelector ??
			await page.goto(this.url, { waitUntil: "networkidle2" });
			const content = await page.content();
			// await browser.close();
			return content;
		} catch (err) {
			if (browser) await browser.close();
			throw new Error(err);
		}
	};

	ScrapeHtml = async () => {
		// let browser;
		var listingData = [];
		var loadingAttempt = 0;
		try {
			// make the url
			this.urlMake();

			console.log("start Scrapping");
			// browser = await puppeteer.launch({ headless: false });
			// var page = await browser.newPage();
			// page.setViewport({ width: 1280, height: 800 });

			while (listingData.length === 0 || loadingAttempt < 2) {
				// await page.goto(this.url, { waitUntil: "networkidle2" });
				// await page.goto(this.url);
				// page.waitForSelector("._8s3ctt a");
				// page.waitForSelector("#data-state");

				// const html = await page.content();
				// var html = await page.evaluate(() => document.body.innerHTML);

				// get html file
				var html = await this.fetchHtml();

				// save html file to disk
				fs.writeFileSync("./test.html", html);

				// load html with cheerio
				var $ = cheerio.load(html);

				// get response data
				var dataRes = $("#data-state").html();
				// fs.writeFileSync("./datares.txt", dataRes);

				var jsonData = await JSON.parse(dataRes);
				// fs.writeFileSync("./jsonData.js", jsonData);
				console.log(loadingAttempt + " attempt");

				if (
					jsonData &&
					jsonData.niobeMinimalClientData &&
					jsonData.niobeMinimalClientData[1] &&
					jsonData.niobeMinimalClientData[1][1]
				) {
					listingData =
						jsonData.niobeMinimalClientData[1][1].data.dora.exploreV3
							.sections[0].items;
				}

				if (
					jsonData &&
					jsonData.niobeApolloClientData &&
					jsonData.niobeApolloClientData.__niobe_denormalized &&
					jsonData.niobeApolloClientData.__niobe_denormalized.queries[0] &&
					jsonData.niobeApolloClientData.__niobe_denormalized.queries[0][1]
				) {
					listingData =
						jsonData.niobeApolloClientData.__niobe_denormalized.queries[0][1]
							.dora.exploreV3.sections[0].items;
				}

				if (!listingData) {
					if (loadingAttempt === 1) {
						console.log("error loading data");
						break;
					}
					console.log(
						"data not existed!!" + " on " + loadingAttempt + " attempt"
					);
					console.log("retry...");
					loadingAttempt++;
				} else {
					console.log("data loaded!!");
					break;
				}
			}

			/*
			const html = fs.readFileSync("./test.html", "utf8");
			var $ = cheerio.load(html);
			const dataText = $("#data-state").html();
			const jsonData = JSON.parse(dataText);

			if (
				jsonData &&
				jsonData.niobeMinimalClientData &&
				jsonData.niobeMinimalClientData[1] &&
				jsonData.niobeMinimalClientData[1][1]
			) {
				listingData =
					jsonData.niobeMinimalClientData[1][1].data.dora.exploreV3.sections[0]
						.items;
			} else if (
				jsonData &&
				jsonData.niobeApolloClientData &&
				jsonData.niobeApolloClientData.__niobe_denormalized &&
				jsonData.niobeApolloClientData.__niobe_denormalized.queries[0] &&
				jsonData.niobeApolloClientData.__niobe_denormalized.queries[0][1]
			) {
				listingData =
					jsonData.niobeApolloClientData.__niobe_denormalized.queries[0][1].dora
						.exploreV3.sections[0].items;
			} else {
				console.log("jsonData not existed");
				return;
			}
*/
			fs.writeFileSync("./listingData.txt", JSON.stringify(listingData));

			// get LatLng
			listingData.map((item, idx) => {
				const {
					city,
					avgRating,
					contextualPictures,
					kickerContent,
					lat,
					lng,
					previewAmenityNames,
					roomAndPropertyType,
					user,
					publicAddress,
				} = item.listing;
				const { pricingQuote } = item;
				// console.log("pricingQuote", pricingQuote);
				this.scrappedListings.push({
					coords: {
						lat,
						lng,
					},
					city,
					avgRating,
					kickerContent: kickerContent.messages[0],
					previewAmenityNames,
					roomAndPropertyType,
					publicAddress,
					user: {
						id: user.id,
						pictureUrl: user.pictureUrl,
						thumbnailUrl: user.thumbnailUrl,
					},
					images: this.getImages(contextualPictures),
					serviceFee: this.getPriceQuote(
						pricingQuote.structuredStayDisplayPrice.explanationData
							.priceDetails[0].items,
						"Service fee"
					),
					cleaningFee: this.getPriceQuote(
						pricingQuote.structuredStayDisplayPrice.explanationData
							.priceDetails[0].items,
						"Cleaning fee"
					),
				});
			});

			console.log("loaded cheerio");
			// Start scrapping
			const listings = $(this.#Selectors.item);
			// console.log("listings", listings);

			listings.each((idx, listing) => {
				let previewInfo = [],
					amenities = [];

				const $$ = cheerio.load(listing);

				// scrape the listing title
				let title = $$(this.#Selectors.title).text();
				let type = $$(this.#Selectors.type).text();
				let location = getStayName($$(this.#Selectors.type).text());
				let pricePerNight = $$(this.#Selectors.pricePerNight).text();
				let ratings = $$(this.#Selectors.ratings).text();
				let reviewNumber = $$(this.#Selectors.reviewNumber)
					.text()
					.trim()
					.match(/(\d+)/g);

				// scrape previewInfo
				$$(this.#Selectors.previewInfo.current)
					.first()
					.children(this.#Selectors.previewInfo.info)
					.each((i, e) => {
						previewInfo.push($$(e).text());
					});

				// scrape amenities
				$$(this.#Selectors.previewInfo.current)
					.next()
					.children(this.#Selectors.previewInfo.info)
					.each((i, e) => {
						amenities.push($$(e).text());
					});

				// get links
				let listingLink =
					"https://www.airbnb.com" +
					$$(this.#Selectors.individualListingLink).attr("href");

				// push to scrappedListings
				// this.scrappedListings.push(scrappedListingInfo);
				this.scrappedListings[idx] = {
					title,
					type,
					location,
					pricePerNight,
					ratings,
					reviewNumber,
					...this.scrappedListings[idx],
					previewInfo,
					amenities,
					listingLink,
				};
			});

			return this.scrappedListings;
		} catch (err) {
			throw new Error(err);
		}
	};

	getPriceQuote = (priceList, priceTag) => {
		try {
			if (priceList.length === 0 || !priceList)
				console.log("priceQoute not existed");
			let priceQuotes = priceList.filter(
				(item) => item.description === priceTag
			)[0];
			// console.log("priceQuotes", priceQuotes);
			return {
				description: (priceQuotes && priceQuotes.description) || priceTag,
				priceString: (priceQuotes && priceQuotes.priceString) || 0,
			};
		} catch (err) {
			console.log(err);
		}
	};

	getImages = (picturesList) => {
		return picturesList.map((item) => ({
			id: item.id,
			picture: item.picture,
		}));
	};
}

module.exports = ListingScrapper;

/*
 {
        "title": "Vegas Life at its Best",
        "type": "Entire condominium in Las Vegas",
        "location": " Las Vegas",
        "pricePerNight": "$109",
        "ratings": "5.0",
        "reviewNumber": [
            "23",
            "23"
        ],
        "coords": {
            "lat": 36.11306,
            "lng": -115.18781
        },
        "city": "Las Vegas",
        "avgRating": 5,
        "kickerContent": "Entire condominium in Las Vegas",
        "previewAmenityNames": [
            "Pool",
            "Wifi",
            "Free parking",
            "Air conditioning"
        ],
        "roomAndPropertyType": "Entire condominium",
        "publicAddress": "Las Vegas, NV, United States",
        "user": {
            "id": "360547879",
            "pictureUrl": "https://a0.muscache.com/im/pictures/user/3bd36f0b-d20b-4e3e-9121-d252ed8fb7ce.jpg?aki_policy=profile_x_medium",
            "thumbnailUrl": "https://a0.muscache.com/im/pictures/user/3bd36f0b-d20b-4e3e-9121-d252ed8fb7ce.jpg?aki_policy=profile_small"
        },
        "images": [
            {
                "id": "1062038137",
                "picture": "https://a0.muscache.com/im/pictures/miso/Hosting-44555924/original/5a420749-0028-4993-b297-b506f7a8c54f.jpeg?im_w=720"
            },
            {
                "id": "1062040392",
                "picture": "https://a0.muscache.com/im/pictures/miso/Hosting-44555924/original/5a8bc69b-0dc2-4200-b58f-c21da335d188.jpeg?im_w=720"
            },
            {
                "id": "1048851500",
                "picture": "https://a0.muscache.com/im/pictures/4310f3fd-cea6-403a-a3f2-5d60fb3d9736.jpg?im_w=720"
            },
            {
                "id": "1062041347",
                "picture": "https://a0.muscache.com/im/pictures/miso/Hosting-44555924/original/76c92f31-f136-48b2-a9ae-55c0edcff2a2.jpeg?im_w=720"
            },
            {
                "id": "1062044257",
                "picture": "https://a0.muscache.com/im/pictures/miso/Hosting-44555924/original/e371c469-8e22-47a6-ae2b-4fa34f38b020.jpeg?im_w=720"
            },
        ],
        "serviceFee": {
            "description": "Service fee",
            "priceString": "$167"
        },
        "cleaningFee": {
            "description": "Cleaning fee",
            "priceString": "$100"
        },
        "previewInfo": [
            "4 guests",
            "2 bedrooms",
            "3 beds",
            "2 baths"
        ],
        "amenities": [
            "Pool",
            "Wifi",
            "Free parking",
            "Air conditioning"
        ],
        "listingLink": "https://www.airbnb.com/rooms/44555924?adults=3&check_in=2021-09-06&check_out=2021-09-16&previous_page_section_name=1000&federated_search_id=096d7899-146d-4221-b928-1cd2bc05d46a"
    },
*/

/*
const response  = [
	{
		listingTitle:
		listingType:
		location:
		description: []
		amenities: [

		]
		previewInfo: [],
		amenities: []
		pricePerNight: 
		ratings:
		reviewNumber:
		ratingDetails: {
			cleancliness:
			communication:
			check-in
			accuracy:
			location: 
			value:
		}
		reviews: [
			{
				user: 
				review: 
				rating: 
			},
			{
				user: 
				review: 
				rating:
			}
		]
		images: [

		],
		mapLocation: {
			lat:
			lng:
		},
		individualMapZoom: 

	},
	{

	}
];

*/

/* --------------------------------------- */

/*
 {
    "pagination": 1,
	"bookingInput": {
		"adults": 3,
		"children": 0,
		"infants": 0,
		"checkIn": "2021-09-06",
		"checkOut": "2021-09-16"
	},
	"locationInfo": {
		"description": "Las Vegas, NV, USA",
		"matched_substrings": [
			{
				"length": 9,
				"offset": 0
			},
		],
		"place_id": "ChIJ69QoNDjEyIARTIMmDF0Z4kM",
		"reference": "ChIJ69QoNDjEyIARTIMmDF0Z4kM",
		"structured_formatting": {
			"main_text": "Las Vegas Strip",
			"main_text_matched_substrings": [
				{
					"length": 9,
					"offset": 0
				},
			],
			"secondary_text": "NV, USA"
		},
		"terms": [
			{
				"offset": 0,
				"value": "Las Vegas Strip"
			},
			{
				"offset": 11,
				"value": "NV"
			},
			{
				"offset": 15,
				"value": "USA"
			},
		],
		"types": ["locality", "political", "geocode"]
	},
}
*/

/*
const raceSelectors = (page, selectors) => {
  return Promise.race(
    selectors.map(selector => {
      return page
        .waitForSelector(selector, {
          visible: true,
        })
        .then(() => selector);
    }),
  );
};

...

const selector = await raceSelectors(page, ['#foo', '#bar']);

if (selector === '#foo') {
  // do something
} else if (selector === '#bar') {
  // do something else
}
*/
